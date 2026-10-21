/**
 * ArogyaVahini API Client Architecture
 * 
 * Organized for Stage 2 backend integration.
 * In Stage 2, these functions will connect to real Express / PostgreSQL routes.
 * In Stage 1 (Frontend Foundation), these functions define the exact request/response
 * contracts without generating fake tokens or simulated submissions.
 */

import { UserRole } from '../types/auth';

const BASE_API_URL = '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export const api = {
  // Authentication contracts
  auth: {
    login: async (credentials: { identifier: string; password: string; role: UserRole }) => {
      // Prepared for Stage 2: fetch(`${BASE_API_URL}/auth/login`, { ... })
      throw new Error('Backend authentication will be activated in Stage 2 with PostgreSQL.');
    },
    register: async (userData: Record<string, unknown>) => {
      // Prepared for Stage 2: fetch(`${BASE_API_URL}/auth/register`, { ... })
      throw new Error('User registration will be activated in Stage 2 with PostgreSQL.');
    },
  },

  // Emergency SOS contracts
  emergency: {
    triggerSos: async (payload: { latitude: number; longitude: number; emergencyType: string }) => {
      throw new Error('Real dispatch routing will be connected to PostgreSQL in Stage 2.');
    },
    getIncident: async (incidentId: string) => {
      throw new Error('Incident polling will be connected to PostgreSQL in Stage 2.');
    },
  },

  // Traffic Signal Green Wave contracts
  traffic: {
    preemptSignal: async (signalId: string, durationSeconds: number) => {
      throw new Error('Traffic signal preemption will connect to municipal IoT brokers in Stage 2.');
    },
    getGridStatus: async (sectorCode: string) => {
      throw new Error('Traffic signal grid telemetry will connect in Stage 2.');
    },
  },

  // Hospital Coordination contracts
  hospital: {
    lockBed: async (hospitalId: string, bayType: string) => {
      throw new Error('Hospital bed locking will connect to hospital inventory in Stage 2.');
    },
    getInboundTelemetry: async (hospitalId: string) => {
      throw new Error('Inbound patient vitals stream will connect in Stage 2.');
    },
  },
};
