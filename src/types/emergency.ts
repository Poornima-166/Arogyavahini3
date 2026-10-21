export type SeverityLevel = 'ESI-1' | 'ESI-2' | 'ESI-3' | 'ESI-4' | 'ESI-5';

export type AmbulanceType = 'ALS' | 'BLS' | 'Cardiac' | 'Neonatal';

export type IncidentStatus = 
  | 'reported'
  | 'dispatched'
  | 'on_scene'
  | 'in_transit'
  | 'arrived_hospital'
  | 'completed';

export type SignalState = 'red' | 'amber' | 'green' | 'preempted_green';

export interface PatientVitals {
  heartRate: number;      // bpm
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  oxygenSaturation: number; // % SpO2
  respiratoryRate: number; // breaths/min
  temperatureCelsius: number;
  ecgStatus: 'Normal Sinus' | 'ST-Elevation' | 'Tachycardia' | 'Bradycardia' | 'Arrhythmia';
  consciousness: 'Alert' | 'Verbal' | 'Pain' | 'Unresponsive'; // AVPU scale
}

export interface EmergencyIncident {
  id: string;
  patientName: string;
  contactNumber: string;
  emergencyType: 'Cardiac Arrest' | 'Road Trauma' | 'Stroke' | 'Respiratory Distress' | 'Obstetric' | 'Other';
  severity: SeverityLevel;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destinationHospital: {
    id: string;
    name: string;
    etaMinutes: number;
    distanceKm: number;
  };
  assignedAmbulanceId?: string;
  status: IncidentStatus;
  timestamp: string;
}

export interface TrafficSignalNode {
  id: string;
  name: string;
  intersectionCode: string;
  currentPhase: SignalState;
  distanceAheadMeters: number;
  isPreempted: boolean;
  timeToArrivalSec: number;
}
