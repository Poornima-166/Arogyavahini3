/**
 * ArogyaVahini Live API Client
 * 
 * Connected to Express full-stack backend running at /api/v1/*
 */

import { UserRole } from '../types/auth';

// Base API URL configuration:
// If deployed on Vercel with an external backend (e.g., Render), VITE_API_BASE_URL can be set.
// Defaults to relative path so it seamlessly works with local dev, Docker, Render, and Vercel serverless.
const RAW_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
  : '';

const BASE_API_URL = `${RAW_BASE_URL}/api/v1`;

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('arogya_auth_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('arogya_auth_token', token);
    } else {
      localStorage.removeItem('arogya_auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers,
      ...options,
    });
  } catch (networkErr: any) {
    throw new Error(`Cannot reach backend server (${networkErr.message || 'Network connection failed'}). Please ensure the server is active.`);
  }

  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    // Non-JSON response (e.g. static CDN or Vercel 404 HTML page)
    const textBody = await res.text();
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          `Backend route not found (HTTP 404). If deployed on Vercel, redeploy with the latest serverless configuration or point VITE_API_BASE_URL to your Render backend.`
        );
      }
      throw new Error(`Server returned HTTP ${res.status}: ${textBody.slice(0, 100)}`);
    }
    data = { message: textBody };
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}: Failed to perform operation`);
  }
  return data as T;
}

export const api = {
  // Health
  health: {
    live: async () => fetchJson<{ status: string; uptime: number }>(`${RAW_BASE_URL}/health/live`),
    ready: async () => fetchJson<{ status: string; database: any }>(`${RAW_BASE_URL}/health/ready`),
  },

  // Authentication & User Management (Module 1)
  auth: {
    login: async (credentials: { identifier: string; password: string; role?: UserRole }) => {
      const res = await fetchJson<{ success: boolean; user: any; profile: any; token: string; message: string }>(
        `${BASE_API_URL}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },
    register: async (userData: Record<string, unknown>) => {
      const res = await fetchJson<{ success: boolean; user: any; token: string; message: string }>(
        `${BASE_API_URL}/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify(userData),
        }
      );
      if (res.token) {
        setAuthToken(res.token);
      }
      return res;
    },
    getMe: async () => {
      return fetchJson<{ success: boolean; user: any; profile: any }>(`${BASE_API_URL}/auth/me`);
    },
    updateProfile: async (profileData: Record<string, unknown>) => {
      return fetchJson<{ success: boolean; message: string }>(`${BASE_API_URL}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    logout: async () => {
      try {
        await fetchJson<{ success: boolean }>(`${BASE_API_URL}/auth/logout`, { method: 'POST' });
      } finally {
        setAuthToken(null);
      }
    },
  },

  // Patient Medical Profile & Emergency Contacts (Module 2)
  patient: {
    getProfile: async () => {
      return fetchJson<{ success: boolean; profile: any }>(`${BASE_API_URL}/sos/patient/profile`);
    },
    updateProfile: async (payload: {
      nationalHealthId?: string;
      bloodGroup?: string;
      allergies?: string;
      medicalConditions?: string;
      emergencyContacts?: { name: string; phone: string; relation: string }[];
    }) => {
      return fetchJson<{ success: boolean; message: string }>(`${BASE_API_URL}/sos/patient/profile`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },

  // Emergency SOS & Dispatch Operations (Module 2)
  emergency: {
    triggerSos: async (payload: {
      patientName?: string;
      contactNumber?: string;
      emergencyType: string;
      severity?: string;
      latitude?: number;
      longitude?: number;
      address?: string;
      destinationHospitalId?: string;
      patientId?: string;
    }) => {
      return fetchJson<{
        success: boolean;
        message: string;
        incident: any;
        ambulance: any;
        route?: any;
      }>(`${BASE_API_URL}/sos/trigger`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    getIncidents: async () => {
      return fetchJson<{ success: boolean; incidents: any[] }>(`${BASE_API_URL}/sos/incidents`);
    },
    getIncident: async (incidentId: string) => {
      return fetchJson<{
        success: boolean;
        incident: any;
        ambulance: any;
        hospital: any;
        route?: any;
      }>(`${BASE_API_URL}/sos/incidents/${incidentId}`);
    },
    updateIncidentStatus: async (
      incidentId: string,
      updates: { status?: string; etaMinutes?: number; distanceKm?: number }
    ) => {
      return fetchJson<{ success: boolean; incident: any }>(
        `${BASE_API_URL}/sos/incidents/${incidentId}/status`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
    },
    getRoute: async (startLat: number, startLng: number, endLat: number, endLng: number) => {
      return fetchJson<{ success: boolean; route: any }>(
        `${BASE_API_URL}/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}`
      );
    },
  },

  // Driver & Ambulance Operations (Module 2)
  driver: {
    updateLocation: async (
      ambulanceId: string,
      telemetry: { latitude: number; longitude: number; speedKmh?: number; heading?: number }
    ) => {
      return fetchJson<{ success: boolean; message: string }>(
        `${BASE_API_URL}/ambulances/${ambulanceId}/location`,
        {
          method: 'POST',
          body: JSON.stringify(telemetry),
        }
      );
    },
    updateAvailability: async (isAvailable: boolean) => {
      return fetchJson<{ success: boolean; message: string; isAvailable: boolean }>(
        `${BASE_API_URL}/drivers/availability`,
        {
          method: 'PUT',
          body: JSON.stringify({ isAvailable }),
        }
      );
    },
    acceptOffer: async (incidentId: string, ambulanceId: string, driverId?: string) => {
      return fetchJson<{ success: boolean; message: string; incident: any }>(
        `${BASE_API_URL}/sos/incidents/${incidentId}/accept`,
        {
          method: 'POST',
          body: JSON.stringify({ ambulanceId, driverId }),
        }
      );
    },
    rejectOffer: async (incidentId: string, ambulanceId: string, reason?: string) => {
      return fetchJson<{ success: boolean; message: string }>(
        `${BASE_API_URL}/sos/incidents/${incidentId}/reject`,
        {
          method: 'POST',
          body: JSON.stringify({ ambulanceId, reason }),
        }
      );
    },
  },

  // Ambulance Fleet & Telemetry
  fleet: {
    getAmbulances: async () => {
      return fetchJson<{ success: boolean; ambulances: any[] }>(`${BASE_API_URL}/ambulances`);
    },
    updateVitals: async (
      ambulanceId: string,
      vitals: {
        heartRate?: number;
        oxygenSaturation?: number;
        bloodPressureSystolic?: number;
        bloodPressureDiastolic?: number;
        ecgStatus?: string;
        speedKmh?: number;
      }
    ) => {
      return fetchJson<{ success: boolean; message: string }>(
        `${BASE_API_URL}/ambulances/${ambulanceId}/vitals`,
        {
          method: 'POST',
          body: JSON.stringify(vitals),
        }
      );
    },
  },

  // Traffic Signal & Green Wave Priority
  traffic: {
    getSignals: async () => {
      return fetchJson<{ success: boolean; signals: any[]; activePreemptions: number; advisoryNotice: string }>(
        `${BASE_API_URL}/traffic/signals`
      );
    },
    preemptCorridor: async (signalIds: string[], durationSec: number = 60) => {
      return fetchJson<{ success: boolean; message: string; signals: any[]; advisoryNotice?: string }>(
        `${BASE_API_URL}/traffic/corridor/preempt`,
        {
          method: 'POST',
          body: JSON.stringify({ signalIds, durationSec }),
        }
      );
    },
    releaseCorridor: async () => {
      return fetchJson<{ success: boolean; message: string; signals: any[] }>(
        `${BASE_API_URL}/traffic/corridor/release`,
        {
          method: 'POST',
        }
      );
    },
    getAnalytics: async () => {
      return fetchJson<{
        success: boolean;
        preemptionSuccessRate: number;
        averageTimeSavedMinutes: number;
        totalPreemptionEvents: number;
        activeCorridors: number;
        auditLogs: any[];
      }>(`${BASE_API_URL}/traffic/analytics`);
    },
  },

  // Hospital Trauma Coordination (Module 3)
  hospital: {
    getHospitals: async () => {
      return fetchJson<{ success: boolean; hospitals: any[] }>(`${BASE_API_URL}/hospitals`);
    },
    getHospital: async (hospitalId: string) => {
      return fetchJson<{ success: boolean; hospital: any; activeInbound: any[] }>(
        `${BASE_API_URL}/hospitals/${hospitalId}`
      );
    },
    lockBed: async (hospitalId: string, bedType: 'icu' | 'trauma_bay' | 'ventilator') => {
      return fetchJson<{ success: boolean; message: string; hospital: any }>(
        `${BASE_API_URL}/hospitals/${hospitalId}/lock-bed`,
        {
          method: 'POST',
          body: JSON.stringify({ bedType }),
        }
      );
    },
    releaseBed: async (hospitalId: string, bedType: 'icu' | 'trauma_bay' | 'ventilator') => {
      return fetchJson<{ success: boolean; message: string; hospital: any }>(
        `${BASE_API_URL}/hospitals/${hospitalId}/release-bed`,
        {
          method: 'POST',
          body: JSON.stringify({ bedType }),
        }
      );
    },
    handover: async (
      hospitalId: string,
      handoverData: {
        incidentId: string;
        receivingDoctor: string;
        triageCategory: string;
        handoverNotes: string;
        bedAssigned?: string;
      }
    ) => {
      return fetchJson<{ success: boolean; message: string; incident: any; handoverSummary: any }>(
        `${BASE_API_URL}/hospitals/${hospitalId}/handover`,
        {
          method: 'POST',
          body: JSON.stringify(handoverData),
        }
      );
    },
    updateReadiness: async (hospitalId: string, readinessStatus: string, notes?: string) => {
      return fetchJson<{ success: boolean; message: string; readinessStatus: string }>(
        `${BASE_API_URL}/hospitals/${hospitalId}/readiness`,
        {
          method: 'PUT',
          body: JSON.stringify({ readinessStatus, notes }),
        }
      );
    },
  },

  // Admin Management & System Governance (Module 3 - Role Protected)
  admin: {
    getUsers: async () => {
      return fetchJson<{ success: boolean; count: number; users: any[] }>(`${BASE_API_URL}/admin/users`);
    },
    getFleet: async () => {
      return fetchJson<{ success: boolean; count: number; ambulances: any[] }>(`${BASE_API_URL}/admin/fleet`);
    },
    updateFleetUnit: async (
      ambulanceId: string,
      updates: { status?: string; type?: string; driverName?: string; driverPhone?: string }
    ) => {
      return fetchJson<{ success: boolean; message: string; ambulance: any }>(
        `${BASE_API_URL}/admin/fleet/${ambulanceId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
    },
    getIncidents: async () => {
      return fetchJson<{ success: boolean; count: number; incidents: any[] }>(`${BASE_API_URL}/admin/incidents`);
    },
    reassignIncident: async (
      incidentId: string,
      updates: { assignedAmbulanceId?: string; destinationHospitalId?: string; reason?: string }
    ) => {
      return fetchJson<{ success: boolean; message: string; incident: any }>(
        `${BASE_API_URL}/admin/incidents/${incidentId}/reassign`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );
    },
    getAuditLogs: async () => {
      return fetchJson<{ success: boolean; count: number; logs: any[] }>(`${BASE_API_URL}/admin/audit-logs`);
    },
    getAnalytics: async () => {
      return fetchJson<{ success: boolean; analytics: any }>(`${BASE_API_URL}/admin/analytics`);
    },
  },
};
