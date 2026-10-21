import { Router } from 'express';
import { query, memoryStore } from '../db/pool';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { broadcastEvent } from '../services/socketService';

export const hospitalRouter = Router();

/**
 * GET /api/v1/hospitals
 * Public / Authenticated: Returns all hospital facilities, specialties, and emergency capacities
 */
hospitalRouter.get('/', async (_req, res) => {
  try {
    const hospRes = await query(`SELECT * FROM hospitals ORDER BY name ASC`);
    const hospitals = hospRes.rows.length > 0 ? hospRes.rows : memoryStore.hospitals;

    // Normalize keys for both DB snake_case and memory camelCase
    const normalized = hospitals.map((h: any) => ({
      id: h.id,
      name: h.name,
      address: h.address,
      emergencyPhone: h.emergency_phone || h.emergencyPhone,
      latitude: Number(h.latitude),
      longitude: Number(h.longitude),
      availableIcuBeds: Number(h.available_icu_beds ?? h.availableIcuBeds ?? 0),
      totalIcuBeds: Number(h.total_icu_beds ?? h.totalIcuBeds ?? 0),
      availableTraumaBays: Number(h.available_trauma_bays ?? h.availableTraumaBays ?? 0),
      totalTraumaBays: Number(h.total_trauma_bays ?? h.totalTraumaBays ?? 0),
      availableVentilators: Number(h.available_ventilators ?? h.availableVentilators ?? 0),
      totalVentilators: Number(h.total_ventilators ?? h.totalVentilators ?? 0),
      activeTraumaAlerts: Number(h.active_trauma_alerts ?? h.activeTraumaAlerts ?? 0),
      specialties: h.specialties || ['Cardiology', 'Trauma & Critical Care', 'Neurology', 'Orthopedics'],
      readinessStatus: h.readiness_status || h.readinessStatus || 'OPERATIONAL_READY',
    }));

    res.json({ success: true, hospitals: normalized });
  } catch (err: any) {
    console.error('[Hospital List Error]', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve hospital network data.' });
  }
});

/**
 * GET /api/v1/hospitals/:id
 * Retrieve specific hospital profile and active incoming transports
 */
hospitalRouter.get('/:id', async (req, res) => {
  try {
    const hospId = req.params.id;
    const hospRes = await query(`SELECT * FROM hospitals WHERE id = $1`, [hospId]);
    const hospital = hospRes.rows[0] || memoryStore.hospitals.find((h) => h.id === hospId);

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital facility not found.' });
    }

    // Retrieve active inbound emergencies
    const incRes = await query(
      `SELECT * FROM emergency_incidents WHERE destination_hospital_id = $1 AND status IN ('dispatched', 'in_transit') ORDER BY created_at DESC`,
      [hospId]
    );

    const activeInbound = incRes.rows.length > 0 ? incRes.rows : memoryStore.emergency_incidents.filter(
      (i) => i.destination_hospital_id === hospId && (i.status === 'dispatched' || i.status === 'in_transit')
    );

    res.json({
      success: true,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        emergencyPhone: hospital.emergency_phone || hospital.emergencyPhone,
        latitude: Number(hospital.latitude),
        longitude: Number(hospital.longitude),
        availableIcuBeds: Number(hospital.available_icu_beds ?? hospital.availableIcuBeds ?? 0),
        totalIcuBeds: Number(hospital.total_icu_beds ?? hospital.totalIcuBeds ?? 0),
        availableTraumaBays: Number(hospital.available_trauma_bays ?? hospital.availableTraumaBays ?? 0),
        totalTraumaBays: Number(hospital.total_trauma_bays ?? hospital.totalTraumaBays ?? 0),
        availableVentilators: Number(hospital.available_ventilators ?? hospital.availableVentilators ?? 0),
        totalVentilators: Number(hospital.total_ventilators ?? hospital.totalVentilators ?? 0),
        activeTraumaAlerts: Number(hospital.active_trauma_alerts ?? hospital.activeTraumaAlerts ?? 0),
        specialties: hospital.specialties || ['Cardiology', 'Trauma & Critical Care', 'Neurology', 'Orthopedics'],
        readinessStatus: hospital.readiness_status || hospital.readinessStatus || 'OPERATIONAL_READY',
      },
      activeInbound,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve hospital details.' });
  }
});

/**
 * POST /api/v1/hospitals/:id/lock-bed
 * Lock an emergency bed (trauma bay, ICU bed, ventilator) for incoming patient
 */
hospitalRouter.post('/:id/lock-bed', async (req, res) => {
  try {
    const hospId = req.params.id;
    const { bedType = 'trauma_bay' } = req.body;

    const hospRes = await query(`SELECT * FROM hospitals WHERE id = $1`, [hospId]);
    const hospital = hospRes.rows[0] || memoryStore.hospitals.find((h) => h.id === hospId);

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found.' });
    }

    let fieldToDecrement = '';
    let currentVal = 0;

    if (bedType === 'icu') {
      fieldToDecrement = 'available_icu_beds';
      currentVal = Number(hospital.available_icu_beds ?? hospital.availableIcuBeds ?? 0);
    } else if (bedType === 'trauma_bay') {
      fieldToDecrement = 'available_trauma_bays';
      currentVal = Number(hospital.available_trauma_bays ?? hospital.availableTraumaBays ?? 0);
    } else if (bedType === 'ventilator') {
      fieldToDecrement = 'available_ventilators';
      currentVal = Number(hospital.available_ventilators ?? hospital.availableVentilators ?? 0);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid bed type. Must be icu, trauma_bay, or ventilator.' });
    }

    if (currentVal <= 0) {
      return res.status(409).json({ success: false, error: `No available ${bedType} remaining at this facility.` });
    }

    const newVal = currentVal - 1;
    const newAlerts = Number(hospital.active_trauma_alerts ?? hospital.activeTraumaAlerts ?? 0) + 1;

    // Update in memory and database
    if (bedType === 'icu') {
      hospital.available_icu_beds = newVal;
      hospital.availableIcuBeds = newVal;
    } else if (bedType === 'trauma_bay') {
      hospital.available_trauma_bays = newVal;
      hospital.availableTraumaBays = newVal;
    } else if (bedType === 'ventilator') {
      hospital.available_ventilators = newVal;
      hospital.availableVentilators = newVal;
    }
    hospital.active_trauma_alerts = newAlerts;
    hospital.activeTraumaAlerts = newAlerts;

    await query(
      `UPDATE hospitals SET ${fieldToDecrement} = $1, active_trauma_alerts = $2 WHERE id = $3`,
      [newVal, newAlerts, hospId]
    );

    await query(
      `INSERT INTO audit_logs (action, details) VALUES ($1, $2)`,
      [`Emergency Bed Reserved (${bedType.toUpperCase()})`, { hospitalId: hospId, remaining: newVal }]
    );

    broadcastEvent('hospital:capacity_change', { hospitalId: hospId, bedType, action: 'locked', remaining: newVal });

    res.json({
      success: true,
      message: `${bedType.toUpperCase()} successfully locked for incoming ambulance.`,
      hospital,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to reserve bed.' });
  }
});

/**
 * POST /api/v1/hospitals/:id/release-bed
 * Release an emergency bed back to inventory
 */
hospitalRouter.post('/:id/release-bed', async (req, res) => {
  try {
    const hospId = req.params.id;
    const { bedType = 'trauma_bay' } = req.body;

    const hospRes = await query(`SELECT * FROM hospitals WHERE id = $1`, [hospId]);
    const hospital = hospRes.rows[0] || memoryStore.hospitals.find((h) => h.id === hospId);

    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found.' });
    }

    let fieldToIncrement = '';
    let currentVal = 0;
    let maxVal = 0;

    if (bedType === 'icu') {
      fieldToIncrement = 'available_icu_beds';
      currentVal = Number(hospital.available_icu_beds ?? hospital.availableIcuBeds ?? 0);
      maxVal = Number(hospital.total_icu_beds ?? hospital.totalIcuBeds ?? 16);
    } else if (bedType === 'trauma_bay') {
      fieldToIncrement = 'available_trauma_bays';
      currentVal = Number(hospital.available_trauma_bays ?? hospital.availableTraumaBays ?? 0);
      maxVal = Number(hospital.total_trauma_bays ?? hospital.totalTraumaBays ?? 8);
    } else if (bedType === 'ventilator') {
      fieldToIncrement = 'available_ventilators';
      currentVal = Number(hospital.available_ventilators ?? hospital.availableVentilators ?? 0);
      maxVal = Number(hospital.total_ventilators ?? hospital.totalVentilators ?? 12);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid bed type.' });
    }

    const newVal = Math.min(maxVal, currentVal + 1);
    const newAlerts = Math.max(0, Number(hospital.active_trauma_alerts ?? hospital.activeTraumaAlerts ?? 0) - 1);

    if (bedType === 'icu') {
      hospital.available_icu_beds = newVal;
      hospital.availableIcuBeds = newVal;
    } else if (bedType === 'trauma_bay') {
      hospital.available_trauma_bays = newVal;
      hospital.availableTraumaBays = newVal;
    } else if (bedType === 'ventilator') {
      hospital.available_ventilators = newVal;
      hospital.availableVentilators = newVal;
    }
    hospital.active_trauma_alerts = newAlerts;
    hospital.activeTraumaAlerts = newAlerts;

    await query(
      `UPDATE hospitals SET ${fieldToIncrement} = $1, active_trauma_alerts = $2 WHERE id = $3`,
      [newVal, newAlerts, hospId]
    );

    broadcastEvent('hospital:capacity_change', { hospitalId: hospId, bedType, action: 'released', remaining: newVal });

    res.json({
      success: true,
      message: `${bedType.toUpperCase()} released back to hospital available inventory.`,
      hospital,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to release bed.' });
  }
});

/**
 * POST /api/v1/hospitals/:id/handover
 * Patient Handover Protocol: ER staff confirms physical transfer of patient care from paramedic to hospital
 */
hospitalRouter.post('/:id/handover', async (req, res) => {
  try {
    const hospId = req.params.id;
    const {
      incidentId,
      receivingDoctor = 'Dr. Savitha Murthy (Emergency Physician)',
      triageCategory = 'ESI-1 Resuscitation',
      handoverNotes = 'Patient transferred directly to Cath Lab #02. ECG ST-Elevation confirmed.',
      bedAssigned = 'Trauma Bay #02',
    } = req.body;

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'Incident ID is required for clinical handover.' });
    }

    // Check incident exists
    const incRes = await query(`SELECT * FROM emergency_incidents WHERE id = $1`, [incidentId]);
    const incident = incRes.rows[0] || memoryStore.emergency_incidents.find((i) => i.id === incidentId);

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Emergency incident record not found.' });
    }

    const completedAt = new Date().toISOString();

    // Update incident status to completed with handover details
    incident.status = 'completed';
    incident.handover_notes = `${handoverNotes} | Assigned Bed: ${bedAssigned} | Receiving Physician: ${receivingDoctor} | Triage: ${triageCategory}`;
    incident.handover_completed_at = completedAt;
    incident.updated_at = completedAt;

    await query(
      `UPDATE emergency_incidents
       SET status = 'completed',
           updated_at = NOW()
       WHERE id = $1`,
      [incidentId]
    );

    // Release assigned ambulance back to available status
    if (incident.assigned_ambulance_id) {
      const ambId = incident.assigned_ambulance_id;
      const amb = memoryStore.ambulances.find((a) => a.id === ambId);
      if (amb) {
        amb.status = 'available';
        amb.current_incident_id = undefined;
        amb.speed_kmh = 0;
      }
      await query(
        `UPDATE ambulances SET status = 'available', current_incident_id = NULL, speed_kmh = 0 WHERE id = $1`,
        [ambId]
      );
      broadcastEvent('ambulance:status', { ambulanceId: ambId, status: 'available' });
    }

    // Insert into immutable audit log
    await query(
      `INSERT INTO audit_logs (action, incident_id, details) VALUES ($1, $2, $3)`,
      [
        `Clinical Patient Handover Completed at ${hospId}`,
        incidentId,
        {
          hospitalId: hospId,
          receivingDoctor,
          triageCategory,
          bedAssigned,
          handoverNotes,
          timestamp: completedAt,
        },
      ]
    );

    broadcastEvent('incident:handover_complete', {
      incidentId,
      hospitalId: hospId,
      receivingDoctor,
      bedAssigned,
      completedAt,
    });

    res.json({
      success: true,
      message: `Patient care successfully transferred to ${receivingDoctor}. Ambulance unit released.`,
      incident,
      handoverSummary: {
        incidentId,
        hospitalId: hospId,
        receivingDoctor,
        bedAssigned,
        triageCategory,
        completedAt,
      },
    });
  } catch (err: any) {
    console.error('[Handover Error]', err);
    res.status(500).json({ success: false, error: 'Failed to complete patient handover.' });
  }
});

/**
 * PUT /api/v1/hospitals/:id/readiness
 * Update hospital operational readiness status
 */
hospitalRouter.put('/:id/readiness', async (req, res) => {
  try {
    const hospId = req.params.id;
    const { readinessStatus = 'OPERATIONAL_READY', notes } = req.body;

    const allowed = ['OPERATIONAL_READY', 'TRAUMA_ALERT_ACTIVE', 'MASS_CASUALTY_PROTOCOL', 'DIVERT_IMMINENT'];
    if (!allowed.includes(readinessStatus)) {
      return res.status(400).json({ success: false, error: `Invalid readiness status. Must be one of: ${allowed.join(', ')}` });
    }

    const hosp = memoryStore.hospitals.find((h) => h.id === hospId);
    if (hosp) {
      hosp.readiness_status = readinessStatus;
      hosp.readinessStatus = readinessStatus;
    }

    await query(
      `INSERT INTO audit_logs (action, details) VALUES ($1, $2)`,
      [`Hospital Readiness Status Changed: ${readinessStatus}`, { hospitalId: hospId, notes }]
    );

    broadcastEvent('hospital:readiness_change', { hospitalId: hospId, readinessStatus, notes });

    res.json({
      success: true,
      message: `Facility readiness status updated to: ${readinessStatus}`,
      readinessStatus,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update hospital readiness.' });
  }
});
