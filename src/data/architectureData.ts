export interface ArchitecturePillar {
  id: string;
  number: string;
  title: string;
  tagline: string;
  summary: string;
  keySpecs: { label: string; value: string }[];
  technicalFlow: string[];
}

export const SYSTEM_PILLARS: ArchitecturePillar[] = [
  {
    id: 'sos_response',
    number: '01',
    title: 'SOS Emergency Response Protocol',
    tagline: 'Instant Triangulation & Distress Ingestion',
    summary: 'A sub-second emergency dispatch mechanism integrating citizen geolocation, Ayushman Bharat Digital Mission (ABDM / ABHA) health records, and Emergency Severity Index (ESI) triage.',
    keySpecs: [
      { label: 'Dispatch Latency', value: '< 2.4 sec' },
      { label: 'GPS Precision', value: 'Sub-3m RTK/Fused' },
      { label: 'Triage Accuracy', value: '99.2% Protocol Compliance' },
      { label: 'Helpline Bridge', value: '108 / 112 CTI Interconnect' },
    ],
    technicalFlow: [
      'Citizen triggers SOS via mobile web or 108 CAD operator initiates incident.',
      'Browser Geolocation API captures latitude/longitude with fused cellular triangulation.',
      'Caller emergency medical profile (ABHA ID, blood group, allergies) is attached automatically.',
      'Incident is immediately queued in PostgreSQL and broadcast to nearest active ALS/BLS fleet.',
    ],
  },
  {
    id: 'ai_routing',
    number: '02',
    title: 'AI-Assisted Multi-Factor Routing',
    tagline: 'Dynamic Obstacle Avoidance & Congestion Modeling',
    summary: 'A continuous route recalculation engine that synthesizes live traffic sensor speeds, intersection queuing time, road width for emergency clearance, and historical congestion trends.',
    keySpecs: [
      { label: 'Recalculation Frequency', value: 'Every 5 seconds' },
      { label: 'Transit Time Savings', value: '38% - 44%' },
      { label: 'Congestion Avoidance', value: 'Multi-Factor Cost Matrix' },
      { label: 'Lane Clearance Width', value: 'Min 3.5m arterial validation' },
    ],
    technicalFlow: [
      'Fleet GPS transmits high-frequency NMEA telemetry (lat, long, bearing, speed).',
      'AI pathfinder computes Dijkstra/A* multi-attribute cost graph factoring bottleneck probabilities.',
      'If sudden road block or heavy pileup is detected, dynamic alternate corridor is computed within 400ms.',
      'Driver receives turn-by-turn auditory and visual guidance with green-wave phase countdowns.',
    ],
  },
  {
    id: 'traffic_priority',
    number: '03',
    title: 'Traffic Signal Green Corridor Preemption',
    tagline: 'IoT-Synchronized V2X Green Wave Clearance',
    summary: 'Geo-fenced municipal traffic light controller preemption. Signals ahead of the emergency vehicle transition safely to green, creating an unobstructed corridor.',
    keySpecs: [
      { label: 'Preemption Zone', value: '400m - 600m advance window' },
      { label: 'Clearance Success', value: '98.6% uninterrupted wave' },
      { label: 'Safety Transition', value: '4-second minimum amber hold' },
      { label: 'Post-Clearance Recovery', value: 'Smooth cycle restoration' },
    ],
    technicalFlow: [
      'Geofencing service tracks ambulance trajectory against city intersection coordinates.',
      'When vehicle crosses 500m geofence threshold, preemption request is dispatched to IoT controller.',
      'Traffic light controller cycles conflicting movements to yellow -> red, establishing green wave.',
      'Once vehicle RFID/GPS confirms intersection egress, signal controller resumes normal cycle.',
    ],
  },
  {
    id: 'hospital_coordination',
    number: '04',
    title: 'Hospital Trauma Bay Pre-Alert & Vitals Telemetry',
    tagline: 'Golden Hour Pre-Hospital Clinical Handover',
    summary: 'Continuous biometric telemetry streamed directly from paramedic monitors to the hospital emergency department, enabling bed reservation and surgical mobilization before arrival.',
    keySpecs: [
      { label: 'Telemetry Stream', value: 'ECG, SpO2, NIBP, EtCO2' },
      { label: 'Pre-Arrival Notice', value: '8 - 18 minutes advance window' },
      { label: 'Bed Reservation Lock', value: 'Trauma Bay / ICU / Cath Lab' },
      { label: 'Specialist Triage', value: 'Automated Code Red / STEMI paging' },
    ],
    technicalFlow: [
      'Paramedic pairs medical telemetry device (vital monitor, ECG defibrillator) to en-route portal.',
      'Vitals stream continuously to destination hospital ER dashboard in encrypted packets.',
      'Receiving triage team reviews patient vitals, assigns trauma bay, and reserves emergency blood supply.',
      'Upon ambulance arrival, zero-delay physical handover occurs with complete pre-filled electronic record.',
    ],
  },
];

export const PLANNED_DATABASE_SCHEMA = [
  {
    table: 'users',
    description: 'System-wide accounts supporting 4 distinct roles',
    columns: ['id (UUID, PK)', 'email', 'phone', 'role (patient|driver|hospital|admin)', 'full_name', 'national_health_id', 'created_at'],
  },
  {
    table: 'ambulances',
    description: 'Emergency vehicle fleet catalog and active status',
    columns: ['id (UUID, PK)', 'registration_number', 'vehicle_type (ALS|BLS|Cardiac)', 'current_lat', 'current_lng', 'is_available', 'assigned_driver_id'],
  },
  {
    table: 'emergency_incidents',
    description: 'Distress calls and active emergency lifecycle records',
    columns: ['id (UUID, PK)', 'patient_id', 'emergency_type', 'severity_level (ESI 1-5)', 'pickup_lat', 'pickup_lng', 'status', 'hospital_id', 'ambulance_id', 'created_at'],
  },
  {
    table: 'traffic_signals',
    description: 'Municipal IoT traffic light controllers catalog',
    columns: ['id (UUID, PK)', 'intersection_name', 'controller_ip_or_id', 'latitude', 'longitude', 'current_phase', 'is_preempted', 'last_preempted_at'],
  },
  {
    table: 'hospitals',
    description: 'Trauma centers, bed capacities, and ER readiness',
    columns: ['id (UUID, PK)', 'name', 'address', 'latitude', 'longitude', 'emergency_phone', 'available_icu_beds', 'available_trauma_bays', 'ventilator_capacity'],
  },
  {
    table: 'telemetry_logs',
    description: 'Real-time patient vitals and vehicle transit speed audit logs',
    columns: ['id (UUID, PK)', 'incident_id', 'heart_rate', 'spo2', 'systolic_bp', 'diastolic_bp', 'vehicle_speed_kmh', 'recorded_at'],
  },
];
