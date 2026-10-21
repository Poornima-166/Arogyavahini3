import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Hospital, 
  Activity, 
  ShieldAlert, 
  Bed, 
  Users, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  AlertOctagon, 
  Lock, 
  Unlock,
  Radio,
  FileCheck2,
  Stethoscope,
  X,
  AlertTriangle
} from 'lucide-react';

export const HospitalPortalWorkspace: React.FC = () => {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('HOSP-VIC-01');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeAlertMessage, setActiveAlertMessage] = useState<string | null>(null);
  const [codeStemiTriggered, setCodeStemiTriggered] = useState(false);

  // Handover Dialog State
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [handoverIncident, setHandoverIncident] = useState<any | null>(null);
  const [receivingDoctor, setReceivingDoctor] = useState('Dr. Savitha Murthy (Chief ER)');
  const [triageCategory, setTriageCategory] = useState('ESI-1 Resuscitation');
  const [bedAssigned, setBedAssigned] = useState('Trauma Bay #02');
  const [handoverNotes, setHandoverNotes] = useState('Patient transferred directly to Cath Lab #02. ECG ST-Elevation confirmed.');
  const [handoverLoading, setHandoverLoading] = useState(false);

  const fetchHospitalData = async () => {
    try {
      const [hospRes, incRes] = await Promise.all([
        api.hospital.getHospitals(),
        api.emergency.getIncidents(),
      ]);
      if (hospRes.success) setHospitals(hospRes.hospitals);
      if (incRes.success) setIncidents(incRes.incidents);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchHospitalData();
    const interval = setInterval(fetchHospitalData, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];
  const activeInbound = incidents.find(
    (i) => i.status === 'in_transit' || i.status === 'dispatched' || i.status === 'arrived_hospital'
  );

  const handleLockBed = async (bedType: 'icu' | 'trauma_bay' | 'ventilator') => {
    if (!currentHospital) return;
    try {
      const res = await api.hospital.lockBed(currentHospital.id, bedType);
      if (res.success) {
        setActiveAlertMessage(`${bedType.toUpperCase()} locked and assigned to incoming trauma ambulance`);
        fetchHospitalData();
        setTimeout(() => setActiveAlertMessage(null), 4000);
      }
    } catch (e: any) {
      setActiveAlertMessage('Unable to reserve bed: capacity limit');
    }
  };

  const handleReleaseBed = async (bedType: 'icu' | 'trauma_bay' | 'ventilator') => {
    if (!currentHospital) return;
    try {
      const res = await api.hospital.releaseBed(currentHospital.id, bedType);
      if (res.success) {
        setActiveAlertMessage(`${bedType.toUpperCase()} released back into available pool`);
        fetchHospitalData();
        setTimeout(() => setActiveAlertMessage(null), 4000);
      }
    } catch (e: any) {
      // ignore
    }
  };

  const handleTriggerCodeStemi = () => {
    setCodeStemiTriggered(true);
    setActiveAlertMessage('CODE STEMI BROADCAST: Cath Lab Team #1 & Interventional Cardiologist paged for immediate arrival');
    setTimeout(() => setActiveAlertMessage(null), 6000);
  };

  const handleOpenHandover = (incident: any) => {
    setHandoverIncident(incident);
    setIsHandoverOpen(true);
  };

  const handleCompleteHandover = async () => {
    if (!handoverIncident || !currentHospital) return;
    setHandoverLoading(true);
    try {
      const res = await api.hospital.handover(currentHospital.id, {
        incidentId: handoverIncident.id,
        receivingDoctor,
        triageCategory,
        handoverNotes,
        bedAssigned,
      });

      if (res.success) {
        setActiveAlertMessage(`Patient care transfer confirmed for ${receivingDoctor}. Ambulance unit KA-04-E-1082 released.`);
        setIsHandoverOpen(false);
        fetchHospitalData();
        setTimeout(() => setActiveAlertMessage(null), 5000);
      }
    } catch (err: any) {
      setActiveAlertMessage('Failed to complete handover: ' + err.message);
    } finally {
      setHandoverLoading(false);
    }
  };

  const handleUpdateReadiness = async (status: string) => {
    if (!currentHospital) return;
    try {
      const res = await api.hospital.updateReadiness(currentHospital.id, status);
      if (res.success) {
        setActiveAlertMessage(`Facility readiness set to: ${status}`);
        fetchHospitalData();
        setTimeout(() => setActiveAlertMessage(null), 3000);
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hospital Selector Bar */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Emergency Trauma Center Command Bay
            </div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentHospital?.name || 'Victoria Hospital Emergency Trauma Center'}
            </div>
          </div>
        </div>

        {/* Hospital Switcher & Readiness Tag */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Readiness:
            </label>
            <select
              value={currentHospital?.readinessStatus || 'OPERATIONAL_READY'}
              onChange={(e) => handleUpdateReadiness(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer"
            >
              <option value="OPERATIONAL_READY">OPERATIONAL READY</option>
              <option value="TRAUMA_ALERT_ACTIVE">TRAUMA ALERT ACTIVE</option>
              <option value="MASS_CASUALTY_PROTOCOL">MASS CASUALTY PROTOCOL</option>
              <option value="DIVERT_IMMINENT">DIVERT IMMINENT</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Facility:
            </label>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium cursor-pointer"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeAlertMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{activeAlertMessage}</span>
        </div>
      )}

      {/* 2-Column Split: Inbound Radar & Vitals Left, Bed Allocator Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Inbound Emergency Radar & Live ECG */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Inbound Alert Card */}
          <div className="p-5 rounded-xl border border-red-300 dark:border-red-900/60 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Critical Inbound Emergency Notice
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded">
                  PRIORITY: {activeInbound?.severity || 'ESI-1'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase">
                  {activeInbound?.status?.replace('_', ' ') || 'IN TRANSIT'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {activeInbound?.patient_name || activeInbound?.patientName || 'Kishore Hegde (48M)'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Diagnosis: <strong>{activeInbound?.emergency_type || activeInbound?.emergencyType || 'Acute STEMI'}</strong> • Pickup: {activeInbound?.address || 'MG Road'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Blood: <strong className="text-red-600">O+</strong> • Allergies: Penicillin, Sulfa • Pre-existing: Hypertension
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs text-slate-400">ESTIMATED TOUCHDOWN</div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums">
                  {activeInbound?.eta_minutes ?? activeInbound?.etaMinutes ?? '03:45'} MIN
                </div>
              </div>
            </div>

            {/* Quick Actions: Code STEMI & Patient Handover */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTriggerCodeStemi}
                className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{codeStemiTriggered ? 'Code STEMI Mobilized' : 'Trigger Code STEMI Paging'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenHandover(activeInbound || incidents[0])}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Complete Clinical Handover</span>
              </button>
            </div>
          </div>

          {/* Live ECG Waveform & Paramedic Telemetry Stream */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-white font-bold">LEAD II ECG TELEMETRY (LIVE RELAY)</span>
              </div>
              <span className="text-emerald-400">25mm/s • 10mm/mV • 60Hz Filter</span>
            </div>

            {/* Dynamic SVG Waveform */}
            <div className="h-20 w-full flex items-center overflow-hidden bg-slate-900/60 rounded-lg p-2 border border-slate-800/80">
              <svg className="w-full h-full stroke-emerald-400 fill-none" viewBox="0 0 600 70">
                <path
                  d="M0 35 L40 35 L50 25 L60 35 L70 35 L75 10 L82 65 L90 28 L95 38 L120 35 L170 35 L180 25 L190 35 L200 35 L205 10 L212 65 L220 28 L225 38 L250 35 L300 35 L310 25 L320 35 L330 35 L335 10 L342 65 L350 28 L355 38 L380 35 L430 35 L440 25 L450 35 L460 35 L465 10 L472 65 L480 28 L485 38 L510 35 L560 35 L570 25 L580 35 L590 35 L600 35"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Real-time Numeric Tiles */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">HEART RATE</div>
                <div className="text-xl font-bold text-red-400 tabular-nums">
                  {activeInbound?.vitals?.heartRate || 112} <span className="text-xs font-normal">bpm</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">PULSE OX (SpO2)</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                  {activeInbound?.vitals?.oxygenSaturation || 97}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">NIBP (mmHg)</div>
                <div className="text-xl font-bold text-blue-400 tabular-nums">
                  {activeInbound?.vitals?.bloodPressureSystolic || 140}/{activeInbound?.vitals?.bloodPressureDiastolic || 90}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">RHYTHM</div>
                <div className="text-xs font-bold text-amber-400 truncate mt-1">
                  {activeInbound?.vitals?.ecgStatus || 'ST-Elevation'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Live Bed & Resuscitation Bay Allocator */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Emergency Bed Inventory Allocator
                </h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">LIVE POSTGRESQL</span>
            </div>

            {/* Trauma Bays Row */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Trauma Resuscitation Bays
                </div>
                <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {currentHospital?.availableTraumaBays} Available{' '}
                  <span className="text-xs font-normal text-slate-400">/ {currentHospital?.totalTraumaBays} Total</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLockBed('trauma_bay')}
                  className="px-2.5 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseBed('trauma_bay')}
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Release</span>
                </button>
              </div>
            </div>

            {/* ICU Beds Row */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Intensive Care (ICU) Beds
                </div>
                <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                  {currentHospital?.availableIcuBeds} Available{' '}
                  <span className="text-xs font-normal text-slate-400">/ {currentHospital?.totalIcuBeds} Total</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLockBed('icu')}
                  className="px-2.5 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseBed('icu')}
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Release</span>
                </button>
              </div>
            </div>

            {/* Ventilators Row */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Emergency Ventilator Units
                </div>
                <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                  {currentHospital?.availableVentilators} Available{' '}
                  <span className="text-xs font-normal text-slate-400">/ {currentHospital?.totalVentilators} Total</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLockBed('ventilator')}
                  className="px-2.5 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1 hover:bg-slate-800 cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleReleaseBed('ventilator')}
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Release</span>
                </button>
              </div>
            </div>

          </div>

          {/* Specialties & Clinical Readiness Checklist */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Clinical Specialties & Emergency Team
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(currentHospital?.specialties || ['Cardiology', 'Trauma & Critical Care', 'Neurology', 'Orthopedics']).map((spec: string) => (
                <span
                  key={spec}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Trauma Bay Nurse Lead (Sr. Philomena)</span>
                <span className="text-emerald-600 font-bold">READY IN BAY</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cath Lab Lead (Dr. S. Mehta)</span>
                <span className="text-emerald-600 font-bold">PAGED (ON-STANDBY)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Blood Bank (O-Negative Pre-matched)</span>
                <span className="text-emerald-600 font-bold">DISPATCHED TO ER</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* CLINICAL PATIENT HANDOVER MODAL */}
      {isHandoverOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                  Patient Care Handover Protocol
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Complete physical clinical handover from paramedic team to hospital ER. Submitting releases the ambulance unit back to available status.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Emergency Physician / Charge Nurse
                </label>
                <input
                  type="text"
                  value={receivingDoctor}
                  onChange={(e) => setReceivingDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Triage Acuity Category
                  </label>
                  <select
                    value={triageCategory}
                    onChange={(e) => setTriageCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option>ESI-1 Resuscitation (Immediate)</option>
                    <option>ESI-2 Emergent (High Risk)</option>
                    <option>ESI-3 Urgent (Two or more resources)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Bed / Trauma Bay
                  </label>
                  <input
                    type="text"
                    value={bedAssigned}
                    onChange={(e) => setBedAssigned(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Transfer Notes & Medication Summary
                </label>
                <textarea
                  rows={3}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsHandoverOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteHandover}
                disabled={handoverLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{handoverLoading ? 'Confirming...' : 'Sign & Complete Handover'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
