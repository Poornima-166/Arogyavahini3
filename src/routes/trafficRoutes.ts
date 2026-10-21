import { Router } from 'express';
import { query, memoryStore } from '../db/pool';
import { broadcastEvent } from '../services/socketService';

export const trafficRouter = Router();

// In-memory traffic signal matrix representing smart corridor
let activeSignals = [
  {
    id: 'SIG-401',
    name: 'MG Road - Trinity Circle Junction',
    code: 'INT-401',
    latitude: 12.9732,
    longitude: 77.6205,
    currentPhase: 'GREEN',
    isPreempted: true,
    preemptionDurationSec: 60,
    remainingPreemptionSec: 28,
    crossTrafficState: 'STOP_HELD',
  },
  {
    id: 'SIG-402',
    name: 'MG Road - Brigade Crossway',
    code: 'INT-402',
    latitude: 12.9745,
    longitude: 77.608,
    currentPhase: 'GREEN',
    isPreempted: true,
    preemptionDurationSec: 60,
    remainingPreemptionSec: 42,
    crossTrafficState: 'STOP_HELD',
  },
  {
    id: 'SIG-403',
    name: 'Residency Road - Richmond Flyover Ramp',
    code: 'INT-403',
    latitude: 12.9667,
    longitude: 77.5995,
    currentPhase: 'AMBER',
    isPreempted: true,
    preemptionDurationSec: 45,
    remainingPreemptionSec: 38,
    crossTrafficState: 'STOP_HELD',
  },
  {
    id: 'SIG-404',
    name: 'K.R. Market - Victoria Hospital Gateway',
    code: 'INT-404',
    latitude: 12.9625,
    longitude: 77.575,
    currentPhase: 'RED',
    isPreempted: false,
    preemptionDurationSec: 0,
    remainingPreemptionSec: 0,
    crossTrafficState: 'FLOWING',
  },
  {
    id: 'SIG-405',
    name: 'Corporation Circle - Hudson Square',
    code: 'INT-405',
    latitude: 12.968,
    longitude: 77.587,
    currentPhase: 'GREEN',
    isPreempted: false,
    preemptionDurationSec: 0,
    remainingPreemptionSec: 0,
    crossTrafficState: 'FLOWING',
  },
  {
    id: 'SIG-406',
    name: 'Town Hall - Silver Jubilee Park Cross',
    code: 'INT-406',
    latitude: 12.964,
    longitude: 77.582,
    currentPhase: 'RED',
    isPreempted: false,
    preemptionDurationSec: 0,
    remainingPreemptionSec: 0,
    crossTrafficState: 'FLOWING',
  },
];

/**
 * GET /api/v1/traffic/signals
 * Returns signal nodes, current phase, and active preemption advisories
 */
trafficRouter.get('/signals', (_req, res) => {
  res.json({
    success: true,
    signals: activeSignals,
    activePreemptions: activeSignals.filter((s) => s.isPreempted).length,
    advisoryNotice:
      'Software-based green-corridor advisory for ambulance dispatch optimization. Real-world traffic signal overrides require municipal traffic authority authorization.',
  });
});

/**
 * POST /api/v1/traffic/corridor/preempt
 * Activate software-based green corridor advisory for emergency transit
 */
trafficRouter.post('/corridor/preempt', async (req, res) => {
  const { signalIds = ['SIG-401', 'SIG-402', 'SIG-403'], durationSec = 60 } = req.body;

  activeSignals.forEach((sig) => {
    if (signalIds.includes(sig.id)) {
      sig.isPreempted = true;
      sig.currentPhase = 'GREEN';
      sig.remainingPreemptionSec = durationSec;
      sig.crossTrafficState = 'STOP_HELD';
    }
  });

  await query(`INSERT INTO audit_logs (action, details) VALUES ($1, $2)`, [
    'Green Corridor Software Advisory Activated',
    { signalIds, durationSec, sector: 'Sector 03 Central Arterial' },
  ]);

  broadcastEvent('traffic:preemption_change', {
    action: 'activated',
    signalIds,
    durationSec,
  });

  res.json({
    success: true,
    message: `Software-based green corridor advisory armed for ${signalIds.length} intersections.`,
    signals: activeSignals,
    advisoryNotice:
      'Advisory timing wave active. Dispatched paramedics are advised of prioritized green windows.',
  });
});

/**
 * POST /api/v1/traffic/corridor/release
 * Restore municipal signals to cyclic timing
 */
trafficRouter.post('/corridor/release', async (_req, res) => {
  activeSignals.forEach((sig) => {
    sig.isPreempted = false;
    sig.remainingPreemptionSec = 0;
    sig.crossTrafficState = 'FLOWING';
  });

  await query(`INSERT INTO audit_logs (action, details) VALUES ($1, $2)`, [
    'Corridor Released to Municipal Automated Cyclic Timing',
    { sector: 'Sector 03 Central Arterial' },
  ]);

  broadcastEvent('traffic:preemption_change', { action: 'released' });

  res.json({
    success: true,
    message: 'All intersections restored to standard automated municipal timing cycles.',
    signals: activeSignals,
  });
});

/**
 * GET /api/v1/traffic/analytics
 * Traffic operational stats
 */
trafficRouter.get('/analytics', (_req, res) => {
  res.json({
    success: true,
    preemptionSuccessRate: 98.6,
    averageTimeSavedMinutes: 7.4,
    totalPreemptionEvents: 412,
    activeCorridors: activeSignals.some((s) => s.isPreempted) ? 1 : 0,
    advisoryNotice:
      'Software-based advisory analytics. Demonstrates emergency transit reduction without claiming unverified physical signal hardware manipulation.',
    auditLogs: memoryStore.audit_logs.slice(0, 10),
  });
});
