import { UserRole } from '../types/auth';

export interface PortalFeature {
  title: string;
  description: string;
  category: 'core' | 'ai' | 'iot' | 'clinical';
}

export interface PortalDefinition {
  id: UserRole;
  titleKey: string;
  shortRole: string;
  badge: string;
  descriptionKey: string;
  primaryColor: string;
  accentBg: string;
  borderColor: string;
  features: PortalFeature[];
  plannedEndpoints: string[];
  databaseEntities: string[];
}

export const PORTALS_DATA: Record<UserRole, PortalDefinition> = {
  patient: {
    id: 'patient',
    titleKey: 'portalPatient',
    shortRole: 'Citizen / Patient',
    badge: 'Urgent Response',
    descriptionKey: 'portalPatientDesc',
    primaryColor: 'text-red-600 dark:text-red-400',
    accentBg: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800/60',
    features: [
      {
        title: '1-Tap Geolocation SOS',
        description: 'Instant distress dispatch transmitting sub-meter GPS coordinates to 108 Command Center.',
        category: 'core',
      },
      {
        title: 'ABHA Health Profile Link',
        description: 'Auto-syncs critical medical records, blood type, drug allergies, and primary physician contacts.',
        category: 'clinical',
      },
      {
        title: 'Real-Time Ambulance Radar',
        description: 'Live distance and arrival ETA with vehicle ID, paramedic contact, and hospital destination.',
        category: 'core',
      },
      {
        title: 'Audio-Visual First Aid Guidance',
        description: 'Standardized bystander CPR and bleeding control instructions while the ambulance is en route.',
        category: 'clinical',
      },
    ],
    plannedEndpoints: [
      'POST /api/v1/sos/trigger',
      'GET /api/v1/sos/status/:incidentId',
      'GET /api/v1/patient/abha-profile',
      'POST /api/v1/patient/emergency-contacts',
    ],
    databaseEntities: ['patients', 'emergency_incidents', 'emergency_contacts', 'abha_profiles'],
  },

  driver: {
    id: 'driver',
    titleKey: 'portalDriver',
    shortRole: 'Paramedic / Driver',
    badge: 'Transit Control',
    descriptionKey: 'portalDriverDesc',
    primaryColor: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    features: [
      {
        title: 'AI Congestion Avoidance',
        description: 'Multi-factor routing adjusting in real-time to traffic density, bottlenecks, and road elevation.',
        category: 'ai',
      },
      {
        title: 'IoT Green Wave Synchronizer',
        description: 'Live HUD showing ahead traffic light countdowns and active signal preemption clearance.',
        category: 'iot',
      },
      {
        title: 'In-Transit Biometric Telemetry',
        description: 'Direct transmission of ECG, SpO2, systolic/diastolic BP, and respiratory rate to trauma ER.',
        category: 'clinical',
      },
      {
        title: 'Direct Trauma Surgeon Link',
        description: 'One-touch encrypted audio channel with receiving emergency physicians.',
        category: 'core',
      },
    ],
    plannedEndpoints: [
      'GET /api/v1/driver/active-dispatch',
      'POST /api/v1/driver/location-telemetry',
      'POST /api/v1/driver/vitals-stream',
      'PUT /api/v1/driver/status-update',
    ],
    databaseEntities: ['ambulances', 'drivers', 'telemetry_logs', 'signal_preemption_events'],
  },

  hospital: {
    id: 'hospital',
    titleKey: 'portalHospital',
    shortRole: 'Hospital Emergency Room',
    badge: 'Clinical Coordination',
    descriptionKey: 'portalHospitalDesc',
    primaryColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    features: [
      {
        title: 'Pre-Arrival Triage Radar',
        description: 'Real-time countdown of inbound critical cases with automated ESI-1 through ESI-5 severity indexing.',
        category: 'clinical',
      },
      {
        title: 'Live Paramedic Vitals Monitor',
        description: 'Live ECG waveform, oxygenation index, and vitals history streaming from the moving ambulance.',
        category: 'clinical',
      },
      {
        title: 'Instant ICU & Bed Reservation',
        description: 'Lock trauma resuscitation bay, ventilator slot, and blood bank units prior to vehicle arrival.',
        category: 'core',
      },
      {
        title: 'Specialist Team Pre-Alert',
        description: 'Simultaneous digital paging of on-call cardiologists, neurologists, and orthopedic surgeons.',
        category: 'core',
      },
    ],
    plannedEndpoints: [
      'GET /api/v1/hospital/inbound-emergencies',
      'GET /api/v1/hospital/beds/availability',
      'POST /api/v1/hospital/beds/lock',
      'POST /api/v1/hospital/triage-prealert',
    ],
    databaseEntities: ['hospitals', 'emergency_bays', 'icu_inventory', 'trauma_teams', 'triage_cases'],
  },

  admin: {
    id: 'admin',
    titleKey: 'portalAdmin',
    shortRole: 'Municipal Traffic & Police Admin',
    badge: 'Grid Infrastructure',
    descriptionKey: 'portalAdminDesc',
    primaryColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    features: [
      {
        title: 'City-Wide Signal Grid Control',
        description: 'Centralized oversight of all connected IoT traffic light controllers across municipal sectors.',
        category: 'iot',
      },
      {
        title: 'Dynamic Green Corridor Preemption',
        description: 'Automated 400m preemption wave with manual override capability for municipal traffic police.',
        category: 'iot',
      },
      {
        title: 'Fleet Distribution Analytics',
        description: 'Heatmaps showing ambulance response times, high-accident intersections, and coverage gaps.',
        category: 'ai',
      },
      {
        title: 'Inter-Agency Audit Logs',
        description: 'Immutable timestamps of dispatch, signal override duration, and hospital arrival times.',
        category: 'core',
      },
    ],
    plannedEndpoints: [
      'GET /api/v1/traffic/signals/grid',
      'POST /api/v1/traffic/corridor/preempt',
      'POST /api/v1/traffic/corridor/release',
      'GET /api/v1/admin/fleet-analytics',
    ],
    databaseEntities: ['traffic_signals', 'corridors', 'audit_logs', 'municipal_sectors'],
  },
};
