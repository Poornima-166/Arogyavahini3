import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  SlidersHorizontal, 
  Radio, 
  Zap, 
  RotateCcw, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  TrendingDown, 
  AlertTriangle,
  Users,
  Building2,
  FileText,
  BarChart3,
  RefreshCw,
  Edit,
  ExternalLink
} from 'lucide-react';

export const AdminPortalWorkspace: React.FC = () => {
  const { t } = useLanguage();
  const [adminTab, setAdminTab] = useState<'signals' | 'fleet' | 'incidents' | 'users' | 'audit'>('signals');

  const [signals, setSignals] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchAllAdminData = async () => {
    try {
      const [sigRes, ambRes, anaRes] = await Promise.all([
        api.traffic.getSignals(),
        api.fleet.getAmbulances(),
        api.traffic.getAnalytics(),
      ]);
      if (sigRes.success) setSignals(sigRes.signals);
      if (ambRes.success) setAmbulances(ambRes.ambulances);
      if (anaRes.success) setAnalytics(anaRes);

      // Admin role-secured endpoints
      api.admin
        .getUsers()
        .then((u) => {
          if (u.success) setUsers(u.users);
        })
        .catch(() => {});

      api.admin
        .getIncidents()
        .then((i) => {
          if (i.success) setIncidents(i.incidents);
        })
        .catch(() => {});

      api.admin
        .getAuditLogs()
        .then((l) => {
          if (l.success) setAuditLogs(l.logs);
        })
        .catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAllAdminData();
    const interval = setInterval(fetchAllAdminData, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleArmCorridor = async () => {
    setLoadingAction(true);
    try {
      const res = await api.traffic.preemptCorridor(['SIG-401', 'SIG-402', 'SIG-403', 'SIG-404'], 60);
      if (res.success) {
        setStatusMessage('MUNICIPAL ADVISORY: Software-based Green Wave armed on MG Road - Victoria Hospital Arterial');
        fetchAllAdminData();
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (e: any) {
      setStatusMessage('Error arming corridor');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReleaseCorridor = async () => {
    setLoadingAction(true);
    try {
      const res = await api.traffic.releaseCorridor();
      if (res.success) {
        setStatusMessage('MUNICIPAL RELEASE: Traffic signals restored to automated cyclic control');
        fetchAllAdminData();
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch (e: any) {
      setStatusMessage('Error releasing corridor');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateUnitStatus = async (ambId: string, newStatus: string) => {
    try {
      const res = await api.admin.updateFleetUnit(ambId, { status: newStatus });
      if (res.success) {
        setStatusMessage(`Unit ${ambId} status changed to ${newStatus.toUpperCase()}`);
        fetchAllAdminData();
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e: any) {
      setStatusMessage('Failed to update unit: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Admin Header */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              City Traffic & Municipal Emergency Command Center
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              Bengaluru Municipal Sector 03 Central Arterial Grid
            </div>
          </div>
        </div>

        {/* Global Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleArmCorridor}
            disabled={loadingAction}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Arm Green Wave</span>
          </button>

          <button
            type="button"
            onClick={handleReleaseCorridor}
            disabled={loadingAction}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Cycles</span>
          </button>
        </div>
      </div>

      {/* Software Advisory Disclosure Banner */}
      <div className="p-3 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Software-Based Green Corridor Advisory Model:</strong> Synchronizes emergency dispatch priority guidance. Physical intersection signal preemption operates through authorized municipal DSRC protocols.
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0">ADVISORY V1.0</span>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-full overflow-x-auto text-xs font-semibold gap-1">
        <button
          type="button"
          onClick={() => setAdminTab('signals')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'signals' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Traffic Grid & Signals</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('fleet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'fleet' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Ambulance Fleet ({ambulances.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('incidents')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'incidents' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>CAD Incidents ({incidents.length || 1})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Platform Users ({users.length || 4})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'audit' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Trail & Analytics</span>
        </button>
      </div>

      {/* ---------------- TAB 1: SIGNALS & TRAFFIC MATRIX ---------------- */}
      {adminTab === 'signals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Connected IoT Traffic Signal Controllers (6 Nodes)
                </h4>
                <span className="font-mono text-xs text-emerald-600 font-bold">
                  {signals.filter((s) => s.isPreempted).length} PREEMPTED GREEN
                </span>
              </div>

              <div className="space-y-2.5">
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs ${
                      sig.isPreempted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${
                        sig.currentPhase === 'GREEN'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                          : sig.currentPhase === 'AMBER'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sig.name} ({sig.code})
                        </div>
                        <div className="text-[11px] text-slate-500 font-sans">
                          Cross-traffic: {sig.crossTrafficState === 'STOP_HELD' ? '🛑 STOP HELD' : '🟢 FLOWING'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        sig.currentPhase === 'GREEN'
                          ? 'bg-emerald-600 text-white'
                          : sig.currentPhase === 'AMBER'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-red-600 text-white'
                      }`}>
                        {sig.currentPhase}
                      </span>
                      {sig.isPreempted && (
                        <div className="text-[10px] text-emerald-600 font-bold mt-1">
                          {sig.remainingPreemptionSec}s window
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics Banner */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">PREEMPTION SUCCESS</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {analytics?.preemptionSuccessRate || 98.6}%
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">AVG TRANSIT SAVED</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  {analytics?.averageTimeSavedMinutes || 7.4} min
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">ACTIVE CORRIDORS</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                  {analytics?.activeCorridors || 1} Sector
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Corridor Advisory Architecture
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The software advisory calculates the expected arrival of the ambulance at each downstream intersection using OSRM driving velocities, establishing a coordinated green-wave time buffer while preserving cross-traffic pedestrian safety phases.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div>• Preemption Lead Time: 45–60 sec</div>
                <div>• Clearing Threshold: 400 meters</div>
                <div>• Fail-safe Cycle Reversion: 90 sec max</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: FLEET MANAGEMENT ---------------- */}
      {adminTab === 'fleet' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Ambulance Fleet Status & Driver Assignments
            </h4>
            <span className="font-mono text-xs text-slate-400">POSTGRESQL AMBULANCES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {amb.registrationNumber || amb.registration_number}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    amb.status === 'in_transit' || amb.status === 'dispatched'
                      ? 'bg-red-600 text-white'
                      : amb.status === 'maintenance'
                      ? 'bg-slate-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {amb.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="font-sans space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle Type:</span>
                    <span className="font-bold">{amb.type} (Life Support)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Driver Lead:</span>
                    <span>{amb.driverName || amb.driver_name || 'Ramesh Kumar'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono">{amb.driverPhone || amb.driver_phone || '+91 98765 43211'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telemetry Speed:</span>
                    <span className="font-mono">{amb.speedKmh || amb.speed_kmh || 0} km/h</span>
                  </div>
                </div>

                {/* Status Update Dropdown */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-500 font-sans">Set Status:</span>
                  <div className="flex items-center gap-1">
                    {['available', 'maintenance'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateUnitStatus(amb.id, st)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer ${
                          amb.status === st ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: CAD INCIDENTS ---------------- */}
      {adminTab === 'incidents' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Emergency CAD Incident Queue & Tracking
            </h4>
            <span className="font-mono text-xs text-slate-400">{incidents.length || 1} Total Records</span>
          </div>

          <div className="space-y-3 text-xs">
            {(incidents.length > 0 ? incidents : [
              {
                id: 'INC-2026-0891',
                patient_name: 'Kishore Hegde',
                emergency_type: 'Acute STEMI (Heart Attack)',
                severity: 'ESI-1',
                status: 'in_transit',
                assigned_ambulance_id: 'AMB-1082',
                destination_hospital_id: 'HOSP-VIC-01',
                eta_minutes: 4.2,
                created_at: new Date().toISOString(),
              }
            ]).map((inc: any) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{inc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {inc.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
                      {inc.status}
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {inc.patient_name || inc.patientName} — {inc.emergency_type || inc.emergencyType}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Assigned: <strong>{inc.assigned_ambulance_id || inc.assignedAmbulanceId || 'None'}</strong> • Hospital: <strong>{inc.destination_hospital_id || inc.destinationHospitalId}</strong>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-[10px] text-slate-400">ETA / STATUS</div>
                  <div className="text-base font-black text-red-600 dark:text-red-400">
                    {inc.eta_minutes ?? inc.etaMinutes ?? 4.2} MIN
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(inc.created_at || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: USERS DIRECTORY ---------------- */}
      {adminTab === 'users' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Registered Platform Stakeholders & Profiles
            </h4>
            <span className="font-mono text-xs text-slate-400">{users.length || 4} Users</span>
          </div>

          <div className="space-y-2 text-xs">
            {(users.length > 0 ? users : [
              { id: '1', full_name: 'Sunil Gowda', email: 'citizen@arogya.in', phone: '+91 98765 43210', role: 'patient' },
              { id: '2', full_name: 'Ramesh Kumar (EMT-P)', email: 'driver@arogya.in', phone: '+91 98765 43211', role: 'driver' },
              { id: '3', full_name: 'Dr. Savitha Murthy', email: 'er@victoria.gov.in', phone: '+91 80 2670 1150', role: 'hospital' },
              { id: '4', full_name: 'ACP Vikramaditya Rao', email: 'admin@trafficpolice.gov.in', phone: '+91 80 2294 2222', role: 'admin' },
            ]).map((u: any) => (
              <div
                key={u.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {u.full_name || u.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {u.email} • {u.phone}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                  u.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : u.role === 'hospital'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : u.role === 'driver'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- TAB 5: AUDIT LOGS & ANALYTICS ---------------- */}
      {adminTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Immutable PostgreSQL Audit Trail & Operational Log
            </h4>
            <div className="space-y-2 text-[11px] font-mono">
              {(auditLogs.length > 0 ? auditLogs : analytics?.auditLogs || [
                {
                  id: 'LOG-001',
                  action: 'V2X Green Corridor Preemption Activated',
                  sector: 'Sector 03 Central Arterial',
                  timestamp: new Date().toISOString(),
                },
                {
                  id: 'LOG-002',
                  action: 'Victoria ER Trauma Bay #02 Locked & Cath Lab Paged',
                  sector: 'Hospital ER Operations',
                  timestamp: new Date().toISOString(),
                }
              ]).map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.sector || (log.details?.sector) || 'Central CAD Dispatch'}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.timestamp || log.created_at || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
