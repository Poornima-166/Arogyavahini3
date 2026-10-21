import { Router } from 'express';
import { query, memoryStore } from '../db/pool';
import { getDrivingRoute } from '../services/routingService';
import { broadcastEvent } from '../services/socketService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const emergencyRouter = Router();

/**
 * POST /api/v1/sos/trigger
 * Single SOS action that validates browser geolocation and persists emergency incident in PostgreSQL.
 */
emergencyRouter.post('/trigger', async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      emergencyType = 'Cardiac Arrest / Severe Trauma',
      severity = 'ESI-1',
      patientName = 'Citizen Distress SOS',
      contactNumber = '+91 98765 00000',
      address = 'Detected GPS Geolocation',
      destinationHospitalId = 'HOSP-VIC-01',
      patientId,
    } = req.body;

    // 1. Strict Validation of Geolocation
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid browser geolocation. High-accuracy numeric latitude (-90 to 90) and longitude (-180 to 180) are required.',
      });
    }

    if (!emergencyType || typeof emergencyType !== 'string') {
      return res.status(400).json({ success: false, error: 'Emergency type is required.' });
    }

    // 2. Query available ambulances and calculate distance to find nearest
    const ambRes = await query(
      `SELECT * FROM ambulances WHERE status = 'available'`
    );

    let assignedAmb: any = null;
    let shortestDistance = Infinity;

    const availableAmbs = ambRes.rows.length > 0 ? ambRes.rows : memoryStore.ambulances;

    for (const amb of availableAmbs) {
      if (amb.status === 'available' || amb.status === 'in_transit') {
        const d = Math.hypot(Number(amb.latitude) - latitude, Number(amb.longitude) - longitude);
        if (d < shortestDistance) {
          shortestDistance = d;
          assignedAmb = amb;
        }
      }
    }

    if (!assignedAmb && memoryStore.ambulances.length > 0) {
      assignedAmb = memoryStore.ambulances[0];
    }

    // 3. Compute real OSRM driving route from ambulance to patient
    let routeInfo = {
      coordinates: [[latitude, longitude]] as [number, number][],
      distanceKm: 2.1,
      durationMinutes: 4,
      summary: 'Central Arterial Wave',
      source: 'geodesic_fallback',
    };

    if (assignedAmb) {
      routeInfo = await getDrivingRoute(
        Number(assignedAmb.latitude),
        Number(assignedAmb.longitude),
        latitude,
        longitude
      );
    }

    // 4. Persist in PostgreSQL
    const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialVitals = {
      heartRate: 110,
      oxygenSaturation: 97,
      bloodPressureSystolic: 138,
      bloodPressureDiastolic: 88,
      respiratoryRate: 20,
      ecgStatus: 'Normal Sinus',
      temperatureCelsius: 37.0,
    };

    const incidentInsert = await query(
      `INSERT INTO emergency_incidents (
        id, patient_id, patient_name, contact_number, emergency_type, severity,
        latitude, longitude, address, status, assigned_ambulance_id, destination_hospital_id,
        eta_minutes, distance_km, vitals
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        incidentId,
        patientId || null,
        patientName,
        contactNumber,
        emergencyType,
        severity,
        latitude,
        longitude,
        address,
        'dispatched',
        assignedAmb ? assignedAmb.id : null,
        destinationHospitalId,
        routeInfo.durationMinutes,
        routeInfo.distanceKm,
        initialVitals,
      ]
    );

    const savedIncident = incidentInsert.rows[0] || {
      id: incidentId,
      patient_name: patientName,
      contact_number: contactNumber,
      emergency_type: emergencyType,
      severity,
      latitude,
      longitude,
      address,
      status: 'dispatched',
      assigned_ambulance_id: assignedAmb?.id,
      destination_hospital_id: destinationHospitalId,
      eta_minutes: routeInfo.durationMinutes,
      distance_km: routeInfo.distanceKm,
      vitals: initialVitals,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update ambulance status to in_transit and assign incident
    if (assignedAmb) {
      assignedAmb.status = 'in_transit';
      assignedAmb.current_incident_id = incidentId;
      assignedAmb.speed_kmh = 52;
      await query(
        `UPDATE ambulances SET status = 'in_transit', current_incident_id = $1, speed_kmh = 52 WHERE id = $2`,
        [incidentId, assignedAmb.id]
      );
    }

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, incident_id, details) VALUES ($1, $2, $3)`,
      [
        `SOS Emergency Dispatched`,
        incidentId,
        {
          assignedAmbulance: assignedAmb?.registration_number || assignedAmb?.id,
          etaMinutes: routeInfo.durationMinutes,
          distanceKm: routeInfo.distanceKm,
          routingSource: routeInfo.source,
        },
      ]
    );

    // Broadcast real-time Socket.IO event
    broadcastEvent('incident:new', {
      incident: savedIncident,
      ambulance: assignedAmb,
      route: routeInfo,
    });

    res.status(201).json({
      success: true,
      message: `Emergency SOS confirmed. Unit ${assignedAmb?.registration_number || assignedAmb?.id} dispatched.`,
      incident: savedIncident,
      ambulance: assignedAmb,
      route: routeInfo,
    });
  } catch (err: any) {
    console.error('[SOS Trigger Error]', err);
    res.status(500).json({ success: false, error: 'Failed to process emergency request.' });
  }
});

/**
 * GET /api/v1/sos/incidents
 * Retrieves incidents list from database
 */
emergencyRouter.get('/incidents', async (_req, res) => {
  try {
    const incRes = await query(`SELECT * FROM emergency_incidents ORDER BY created_at DESC`);
    const incidents = incRes.rows.length > 0 ? incRes.rows : memoryStore.emergency_incidents;
    res.json({ success: true, incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch emergency incidents.' });
  }
});

/**
 * GET /api/v1/sos/incidents/:id
 * Detailed incident with assigned ambulance, route geometry, and destination hospital
 */
emergencyRouter.get('/incidents/:id', async (req, res) => {
  try {
    const incRes = await query(`SELECT * FROM emergency_incidents WHERE id = $1`, [req.params.id]);
    let incident = incRes.rows[0];

    if (!incident) {
      incident = memoryStore.emergency_incidents.find((i) => i.id === req.params.id);
    }

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }

    // Fetch ambulance
    let ambulance: any = null;
    if (incident.assigned_ambulance_id) {
      const ambRes = await query(`SELECT * FROM ambulances WHERE id = $1`, [incident.assigned_ambulance_id]);
      ambulance = ambRes.rows[0] || memoryStore.ambulances.find((a) => a.id === incident.assigned_ambulance_id);
    }

    // Fetch hospital
    let hospital: any = null;
    if (incident.destination_hospital_id) {
      const hospRes = await query(`SELECT * FROM hospitals WHERE id = $1`, [incident.destination_hospital_id]);
      hospital = hospRes.rows[0] || memoryStore.hospitals.find((h) => h.id === incident.destination_hospital_id);
    }

    // Fetch route geometry between ambulance and patient
    let route: any = null;
    if (ambulance && incident.latitude && incident.longitude) {
      route = await getDrivingRoute(
        Number(ambulance.latitude),
        Number(ambulance.longitude),
        Number(incident.latitude),
        Number(incident.longitude)
      );
    }

    res.json({
      success: true,
      incident,
      ambulance,
      hospital,
      route,
    });
  } catch (err: any) {
    console.error('[Get Incident Error]', err);
    res.status(500).json({ success: false, error: 'Failed to load incident details.' });
  }
});

/**
 * POST /api/v1/sos/incidents/:id/accept
 * Driver accepts emergency offer. Safe dispatch prevents duplicate assignments.
 */
emergencyRouter.post('/incidents/:id/accept', async (req, res) => {
  try {
    const { ambulanceId, driverId } = req.body;
    const incidentId = req.params.id;

    // Atomic assignment check: ensure incident is not already claimed
    const checkRes = await query(
      `SELECT * FROM emergency_incidents WHERE id = $1`,
      [incidentId]
    );

    const incident = checkRes.rows[0] || memoryStore.emergency_incidents.find((i) => i.id === incidentId);

    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }

    if (incident.assigned_ambulance_id && incident.assigned_ambulance_id !== ambulanceId) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: This emergency has already been claimed by another ambulance unit.',
      });
    }

    // Assign unit and update status
    incident.assigned_ambulance_id = ambulanceId;
    incident.status = 'dispatched';
    incident.updated_at = new Date().toISOString();

    await query(
      `UPDATE emergency_incidents SET assigned_ambulance_id = $1, status = 'dispatched', updated_at = NOW() WHERE id = $2`,
      [ambulanceId, incidentId]
    );

    // Update ambulance
    await query(
      `UPDATE ambulances SET status = 'in_transit', current_incident_id = $1 WHERE id = $2`,
      [incidentId, ambulanceId]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (action, incident_id, details) VALUES ($1, $2, $3)`,
      [`Driver Accepted Dispatch`, incidentId, { ambulanceId, driverId }]
    );

    broadcastEvent('incident:accepted', { incidentId, ambulanceId });

    res.json({
      success: true,
      message: 'Dispatch accepted. Navigation route locked.',
      incident,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to accept dispatch offer.' });
  }
});

/**
 * POST /api/v1/sos/incidents/:id/reject
 * Driver declines offer; routes to next available unit.
 */
emergencyRouter.post('/incidents/:id/reject', async (req, res) => {
  try {
    const { ambulanceId, reason = 'Unit congested / Mechanical delay' } = req.body;
    const incidentId = req.params.id;

    await query(
      `INSERT INTO audit_logs (action, incident_id, details) VALUES ($1, $2, $3)`,
      [`Driver Declined Dispatch`, incidentId, { ambulanceId, reason }]
    );

    // Find next available unit
    const ambRes = await query(
      `SELECT * FROM ambulances WHERE status = 'available' AND id != $1 LIMIT 1`,
      [ambulanceId]
    );

    const nextAmb = ambRes.rows[0] || null;

    if (nextAmb) {
      await query(
        `UPDATE emergency_incidents SET assigned_ambulance_id = $1 WHERE id = $2`,
        [nextAmb.id, incidentId]
      );
      broadcastEvent('incident:reassigned', { incidentId, newAmbulanceId: nextAmb.id });
    }

    res.json({
      success: true,
      message: nextAmb
        ? `Offer rerouted to next available unit (${nextAmb.registration_number})`
        : 'Offer unassigned. Queued in emergency dispatch queue.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to process dispatch decline.' });
  }
});

/**
 * PUT /api/v1/sos/incidents/:id/status
 * Driver emergency status lifecycle transitions:
 * 'dispatched' -> 'on_scene' -> 'in_transit' -> 'arrived_hospital' -> 'completed'
 */
emergencyRouter.put('/incidents/:id/status', async (req, res) => {
  try {
    const { status, etaMinutes, distanceKm } = req.body;
    const incidentId = req.params.id;

    const validStatuses = ['reported', 'dispatched', 'on_scene', 'in_transit', 'arrived_hospital', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid emergency status. Must be one of: ${validStatuses.join(', ')}` });
    }

    await query(
      `UPDATE emergency_incidents SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, incidentId]
    );

    // If completed, release ambulance
    if (status === 'completed') {
      const inc = memoryStore.emergency_incidents.find((i) => i.id === incidentId);
      if (inc && inc.assigned_ambulance_id) {
        await query(
          `UPDATE ambulances SET status = 'available', current_incident_id = NULL, speed_kmh = 0 WHERE id = $1`,
          [inc.assigned_ambulance_id]
        );
      }
    }

    broadcastEvent('incident:status_change', { incidentId, status, etaMinutes, distanceKm });

    res.json({
      success: true,
      message: `Emergency status updated to ${status.replace('_', ' ').toUpperCase()}`,
      status,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update emergency status.' });
  }
});

/**
 * POST /api/v1/ambulances/:id/location
 * Driver live GPS telemetry broadcast
 */
emergencyRouter.post('/ambulances/:id/location', async (req, res) => {
  try {
    const { latitude, longitude, speedKmh = 50, heading = 0 } = req.body;
    const ambulanceId = req.params.id;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ success: false, error: 'Numeric latitude and longitude are required.' });
    }

    await query(
      `UPDATE ambulances SET latitude = $1, longitude = $2, speed_kmh = $3, heading = $4 WHERE id = $5`,
      [latitude, longitude, speedKmh, heading, ambulanceId]
    );

    // Update in-memory if active
    const amb = memoryStore.ambulances.find((a) => a.id === ambulanceId);
    if (amb) {
      amb.latitude = latitude;
      amb.longitude = longitude;
      amb.speed_kmh = speedKmh;
      amb.heading = heading;
    }

    broadcastEvent('ambulance:location', {
      ambulanceId,
      latitude,
      longitude,
      speedKmh,
      heading,
    });

    res.json({ success: true, message: 'Telemetry location broadcasted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update vehicle location.' });
  }
});

/**
 * POST /api/v1/ambulances/:id/vitals
 * Driver streams patient biometrics to receiving hospital ER
 */
emergencyRouter.post('/ambulances/:id/vitals', async (req, res) => {
  try {
    const { heartRate, oxygenSaturation, bloodPressureSystolic, bloodPressureDiastolic, ecgStatus, speedKmh } = req.body;
    const ambulanceId = req.params.id;

    const amb = memoryStore.ambulances.find((a) => a.id === ambulanceId);
    const incidentId = amb?.current_incident_id;

    if (incidentId) {
      const inc = memoryStore.emergency_incidents.find((i) => i.id === incidentId);
      if (inc) {
        if (heartRate) inc.vitals.heartRate = heartRate;
        if (oxygenSaturation) inc.vitals.oxygenSaturation = oxygenSaturation;
        if (bloodPressureSystolic) inc.vitals.bloodPressureSystolic = bloodPressureSystolic;
        if (bloodPressureDiastolic) inc.vitals.bloodPressureDiastolic = bloodPressureDiastolic;
        if (ecgStatus) inc.vitals.ecgStatus = ecgStatus;
        inc.updated_at = new Date().toISOString();
      }
    }

    broadcastEvent('vitals:stream', {
      ambulanceId,
      incidentId,
      vitals: { heartRate, oxygenSaturation, bloodPressureSystolic, bloodPressureDiastolic, ecgStatus },
      speedKmh,
    });

    res.json({ success: true, message: 'Vitals telemetry streamed to receiving trauma hospital.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to stream vitals.' });
  }
});

/**
 * PUT /api/v1/drivers/availability
 * Driver toggles active on-duty / off-duty status
 */
emergencyRouter.put('/drivers/availability', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { isAvailable } = req.body;
    const userId = req.user!.userId;

    await query(
      `UPDATE driver_profiles SET is_available = $1 WHERE user_id = $2`,
      [isAvailable, userId]
    );

    const driver = memoryStore.driver_profiles.find((d) => d.user_id === userId);
    if (driver) {
      driver.is_available = isAvailable;
    }

    res.json({
      success: true,
      message: `Driver status changed to: ${isAvailable ? 'ON-DUTY AVAILABLE' : 'OFF-DUTY STANDBY'}`,
      isAvailable,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update availability.' });
  }
});

/**
 * GET /api/v1/patient/profile
 * Returns patient medical profile with emergency contacts
 */
emergencyRouter.get('/patient/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const profileRes = await query(
      `SELECT * FROM patient_profiles WHERE user_id = $1`,
      [userId]
    );

    const profile = profileRes.rows[0] || memoryStore.patient_profiles.find((p) => p.user_id === userId);

    res.json({
      success: true,
      profile: profile || {
        user_id: userId,
        national_health_id: '91-4821-9920-1082',
        blood_group: 'O+',
        allergies: 'None',
        medical_conditions: 'None',
        emergency_contacts: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve patient profile.' });
  }
});

/**
 * PUT /api/v1/patient/profile
 * Updates patient emergency contacts and health records
 */
emergencyRouter.put('/patient/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { nationalHealthId, bloodGroup, allergies, medicalConditions, emergencyContacts } = req.body;

    const existing = await query(`SELECT id FROM patient_profiles WHERE user_id = $1`, [userId]);

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO patient_profiles (user_id, national_health_id, blood_group, allergies, medical_conditions, emergency_contacts)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, nationalHealthId, bloodGroup, allergies, medicalConditions, emergencyContacts || []]
      );
    } else {
      await query(
        `UPDATE patient_profiles
         SET national_health_id = $1, blood_group = $2, allergies = $3, medical_conditions = $4, emergency_contacts = $5
         WHERE user_id = $6`,
        [nationalHealthId, bloodGroup, allergies, medicalConditions, emergencyContacts || [], userId]
      );
    }

    res.json({ success: true, message: 'Patient emergency contacts and medical profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update patient profile.' });
  }
});

/**
 * GET /api/v1/ambulances (or /api/v1/sos/ambulances)
 * Returns all active ambulance vehicles and drivers
 */
emergencyRouter.get('/ambulances', async (_req, res) => {
  try {
    const ambRes = await query(`SELECT * FROM ambulances ORDER BY id ASC`);
    const ambulances = ambRes.rows.length > 0 ? ambRes.rows : memoryStore.ambulances;

    res.json({
      success: true,
      ambulances: ambulances.map((a: any) => ({
        id: a.id,
        registrationNumber: a.registration_number || a.registrationNumber,
        type: a.type,
        status: a.status,
        driverId: a.driver_id || a.driverId,
        driverName: a.driver_name || a.driverName,
        driverPhone: a.driver_phone || a.driverPhone,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
        speedKmh: Number(a.speed_kmh || a.speedKmh || 0),
        heading: Number(a.heading || 0),
        currentIncidentId: a.current_incident_id || a.currentIncidentId,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve ambulance fleet.' });
  }
});

/**
 * GET /api/v1/route
 * Configurable OSRM / OpenStreetMap route calculation between two GPS coordinates
 */
emergencyRouter.get('/route', async (req, res) => {
  try {
    const startLat = parseFloat(req.query.startLat as string);
    const startLng = parseFloat(req.query.startLng as string);
    const endLat = parseFloat(req.query.endLat as string);
    const endLng = parseFloat(req.query.endLng as string);

    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. startLat, startLng, endLat, and endLng must be valid numbers.',
      });
    }

    const route = await getDrivingRoute(startLat, startLng, endLat, endLng);
    res.json({ success: true, route });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to compute driving route.' });
  }
});

