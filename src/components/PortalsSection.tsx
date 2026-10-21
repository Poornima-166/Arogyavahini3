import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PORTALS_DATA } from '../data/portalData';
import { UserRole } from '../types/auth';
import { 
  User, 
  Truck, 
  Building2, 
  SlidersHorizontal, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Heart, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  Radio, 
  Flame, 
  Check, 
  Database,
  Lock
} from 'lucide-react';

interface PortalsSectionProps {
  onOpenAuthForRole: (role: UserRole) => void;
}

export const PortalsSection: React.FC<PortalsSectionProps> = ({ onOpenAuthForRole }) => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [activeInspectorTab, setActiveInspectorTab] = useState<'ui_preview' | 'api_contracts'>('ui_preview');

  const portal = PORTALS_DATA[selectedRole];

  return (
    <section id="portals" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            Integrated Emergency Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            {t('portalsHeading', 'Four Unified Stakeholder Portals')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t(
              'portalsSubheading',
              'Purpose-built interfaces connecting the entire emergency response chain from the citizen in distress to the operating theater.'
            )}
          </p>
        </div>

        {/* 4-Portals Segmented Role Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1.5 bg-slate-200 dark:bg-slate-900 rounded-xl max-w-full overflow-x-auto shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient / Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('driver')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === 'driver'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Ambulance Driver</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('hospital')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === 'hospital'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital Trauma ER</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Traffic & Police Admin</span>
            </button>
          </div>
        </div>

        {/* Selected Portal Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 Cols): Role Overview, Features & Auth Entry */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {portal.badge}
                </span>
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${portal.accentBg} ${portal.primaryColor}`}>
                  PORTAL CODE: {portal.id.toUpperCase()}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t(portal.titleKey, portal.shortRole)}
              </h3>
              
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {t(portal.descriptionKey, '')}
              </p>

              {/* Core Feature Matrix */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Key Portal Capabilities
                </div>
                {portal.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {feature.title}:
                      </span>{' '}
                      <span className="text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button: Sign In / Access Portal */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuthForRole(portal.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-500 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Access {portal.shortRole} Entry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Authentication & Role Verification Ready
                </span>
              </div>

            </div>

            {/* Quick Switcher for Inspector Mode */}
            <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveInspectorTab('ui_preview')}
                className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center cursor-pointer ${
                  activeInspectorTab === 'ui_preview'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Interface Blueprint Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveInspectorTab('api_contracts')}
                className={`flex-1 py-1.5 px-3 rounded-md transition-colors text-center cursor-pointer ${
                  activeInspectorTab === 'api_contracts'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Backend API & DB Entities
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): Dynamic Portal Interface Preview or API Schema */}
          <div className="lg:col-span-7">
            {activeInspectorTab === 'ui_preview' ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                
                {/* Interface Mock Window Chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/90 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 font-mono text-[11px] text-slate-500">
                      https://arogyavahini.gov.in/portal/{portal.id}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    STAGE 1: FRONTEND FOUNDATION PREVIEW
                  </span>
                </div>

                {/* Specific Role UI Previews */}
                <div className="p-6">
                  {selectedRole === 'patient' && <PatientPortalPreview />}
                  {selectedRole === 'driver' && <DriverPortalPreview />}
                  {selectedRole === 'hospital' && <HospitalPortalPreview />}
                  {selectedRole === 'admin' && <AdminPortalPreview />}
                </div>

              </div>
            ) : (
              /* Backend API & Data Schema Contract */
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-6 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    STAGE 2 POSTGRESQL & REST API SPECIFICATIONS
                  </span>
                  <span className="text-slate-400 text-[11px]">ROLE: {portal.id.toUpperCase()}</span>
                </div>

                <div className="mb-4">
                  <div className="text-slate-400 mb-2 uppercase tracking-wider text-[11px]">Planned REST API Endpoints:</div>
                  <div className="space-y-1.5">
                    {portal.plannedEndpoints.map((ep, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-between">
                        <span>{ep}</span>
                        <span className="text-[10px] text-emerald-400">JWT Protected</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-2 uppercase tracking-wider text-[11px]">Target PostgreSQL Database Entities:</div>
                  <div className="flex flex-wrap gap-2">
                    {portal.databaseEntities.map((entity, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-slate-800 text-blue-300 border border-slate-700">
                        public.{entity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Frontend forms, type schemas, and state containers are calibrated for direct PostgreSQL docking in Stage 2.</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

/* -------------------------------------------------------------
   PATIENT PORTAL UI BLUEPRINT
------------------------------------------------------------- */
const PatientPortalPreview: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* 1-Tap SOS Trigger Card */}
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-red-900 dark:text-red-200">
              1-Tap Emergency Medical SOS
            </div>
            <div className="text-xs text-red-700 dark:text-red-400">
              Triggers instant CAD dispatch and broadcasts sub-meter GPS location
            </div>
          </div>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
        >
          REQUEST EMERGENCY AMBULANCE
        </button>
      </div>

      {/* Patient Active Incident Radar Card */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-500" />
            Active Dispatch Telemetry (Sample View)
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            STATUS: EN-ROUTE TO SCENE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500">ASSIGNED AMBULANCE</div>
            <div className="font-bold font-mono text-slate-900 dark:text-white">KA-04-E-1082 (ALS)</div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500">PARAMEDIC LEAD</div>
            <div className="font-bold text-slate-900 dark:text-white">Ramesh K. (EMT-P)</div>
          </div>
          <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] text-slate-500">ESTIMATED ARRIVAL</div>
            <div className="font-bold font-mono text-red-600 dark:text-red-400 tabular-nums">03 min 45 sec</div>
          </div>
        </div>

        {/* First Aid Instructions Preview */}
        <div className="p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
          <span className="font-bold">Bystander Protocol:</span> Keep patient warm and calm. If unresponsive with no pulse, begin hands-only CPR at 100-120 beats/min until paramedic team arrives.
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   AMBULANCE DRIVER PORTAL UI BLUEPRINT
------------------------------------------------------------- */
const DriverPortalPreview: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Driver HUD Navigation Header */}
      <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="font-bold">AI SMART ROUTING & CORRIDOR HUD</span>
          </div>
          <span className="font-mono text-emerald-400 text-xs font-bold">
            GREEN WAVE PREEMPTION: ARTERIAL ACTIVE
          </span>
        </div>

        {/* Turn by Turn Card */}
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              ↱
            </div>
            <div>
              <div className="text-sm font-bold">In 350 meters, Turn Right on MG Road</div>
              <div className="text-xs text-slate-400">Signal #04 preempted to green • Clearance window 45s</div>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">SPEED</div>
            <div className="text-lg font-bold text-blue-400 tabular-nums">54 km/h</div>
          </div>
        </div>

        {/* Upcoming Signal Indicator Strip */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            <div className="text-[10px] text-emerald-400">SIGNAL #03</div>
            <div className="font-bold">GREEN CLEAR</div>
          </div>
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300">
            <div className="text-[10px] text-emerald-400">SIGNAL #04 (AHEAD)</div>
            <div className="font-bold">PREEMPTED 32s</div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
            <div className="text-[10px]">SIGNAL #05</div>
            <div className="font-bold">CYCLING</div>
          </div>
        </div>
      </div>

      {/* Patient Biometrics Transmit Panel */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          <span>Continuous Vitals Stream (Broadcasting to ER)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-mono">STREAMING LIVE</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
          <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400">PULSE</div>
            <div className="font-bold text-red-500 tabular-nums">108 bpm</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400">SPO2</div>
            <div className="font-bold text-emerald-500 tabular-nums">97%</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400">BP</div>
            <div className="font-bold text-blue-500 tabular-nums">135/88</div>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400">ECG RHYTHM</div>
            <div className="font-bold text-amber-500 text-[11px]">Sinus Tach</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   HOSPITAL TRAUMA PORTAL UI BLUEPRINT
------------------------------------------------------------- */
const HospitalPortalPreview: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Inbound Triage Alert */}
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/40">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-200 dark:border-red-900/60 text-xs">
          <span className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            CRITICAL TRAUMA PRE-ALERT: ETA 05:40 MIN
          </span>
          <span className="font-mono bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
            SEVERITY: ESI-1
          </span>
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <span className="font-semibold">Case #TR-8921:</span> 48M, Suspected Acute Myocardial Infarction. In-transit ECG confirms ST-elevation in V2-V4.
        </div>
      </div>

      {/* Hospital Resource Allocation Snapshot */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] text-slate-500 mb-1">TRAUMA BAY STATUS</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">Bay #02 Locked</div>
          <div className="text-[10px] text-slate-400 mt-1">Nurse team assigned</div>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] text-slate-500 mb-1">CATH LAB / ICU BED</div>
          <div className="font-bold text-blue-600 dark:text-blue-400">Cath Lab #1 On-Standby</div>
          <div className="text-[10px] text-slate-400 mt-1">Dr. S. Mehta Paged</div>
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[11px] text-slate-500 mb-1">BLOOD BANK RESERVE</div>
          <div className="font-bold text-slate-900 dark:text-white">O-Negative (2 Units)</div>
          <div className="text-[10px] text-slate-400 mt-1">Pre-crossmatched</div>
        </div>
      </div>

      {/* Live ECG Waveform Container */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs">
        <div className="flex justify-between items-center mb-2 text-slate-400 text-[11px]">
          <span>LEAD II ECG TELEMETRY (PARAMEDIC RELAY)</span>
          <span className="text-emerald-400">GAIN: 10mm/mV • 25mm/s</span>
        </div>
        {/* Synthetic ECG Graphic Path */}
        <div className="h-16 w-full flex items-center overflow-hidden relative">
          <svg className="w-full h-full stroke-emerald-400 fill-none" viewBox="0 0 500 60">
            <path
              d="M0 30 L50 30 L60 20 L70 30 L80 30 L85 10 L92 55 L100 25 L105 32 L130 30 L180 30 L190 20 L200 30 L210 30 L215 10 L222 55 L230 25 L235 32 L260 30 L310 30 L320 20 L330 30 L340 30 L345 10 L352 55 L360 25 L365 32 L390 30 L440 30 L450 20 L460 30 L470 30 L475 10 L482 55 L490 25 L495 32 L500 30"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
   TRAFFIC & POLICE ADMIN PORTAL UI BLUEPRINT
------------------------------------------------------------- */
const AdminPortalPreview: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Municipal Traffic Grid Controller Status */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 dark:border-amber-900/60 text-xs">
          <span className="font-bold text-amber-900 dark:text-amber-200">
            MUNICIPAL SECTOR #03: CENTRAL CORRIDOR
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
            ACTIVE GREEN WAVE: 1 EMERGENCY DISPATCH
          </span>
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300">
          IoT Traffic Controllers #401 to #405 preemption override active. Conflicting cross-traffic pedestrian and vehicular signals held red with automated countdown timers.
        </div>
      </div>

      {/* Intersection State Table */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="text-xs font-bold text-slate-900 dark:text-white mb-3">
          Controlled Intersection Nodes
        </div>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">INT-401 (Outer Ring Rd)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">PREEMPTED (GREEN)</span>
            <span className="text-slate-400">12s left</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">INT-402 (Metro Crossway)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">PREEMPTED (GREEN)</span>
            <span className="text-slate-400">28s left</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300">INT-403 (Hospital Arterial)</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">TRANSITIONING (AMBER)</span>
            <span className="text-slate-400">Queue clearing</span>
          </div>
        </div>
      </div>

      {/* System Telemetry & Override Controls */}
      <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Manual Traffic Police Overrule Command:
        </span>
        <button
          type="button"
          className="px-3 py-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] hover:bg-slate-800 cursor-pointer"
        >
          RESTORE NORMAL CYCLE
        </button>
      </div>
    </div>
  );
};
