import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { EmergencyMap } from '../maps/EmergencyMap';
import { 
  Navigation, 
  Activity, 
  Radio, 
  Zap, 
  Hospital, 
  CheckCircle2, 
  Sliders, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight,
  Send,
  AlertTriangle,
  Power,
  RotateCcw,
  Compass
} from 'lucide-react';

export const DriverPortalWorkspace: React.FC = () => {
  const { t } = useLanguage();
  const [speedKmh, setSpeedKmh] = useState(56);
  const [signals, setSignals] = useState<any[]>([]);
  const [isPreempting, setIsPreempting] = useState(false);
  const [preemptionSuccess, setPreemptionSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Driver on-duty state
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Active Incident & Offers
  const [activeIncident, setActiveIncident] = useState<any | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<any | null>(null);

  // Driver Coordinates & Heading
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  // Paramedic Vitals Controls
  const [heartRate, setHeartRate] = useState(112);
  const [spo2, setSpo2] = useState(97);
  const [bpSystolic, setBpSystolic] = useState(140);
  const [bpDiastolic, setBpDiastolic] = useState(90);
  const [ecgStatus, setEcgStatus] = useState('ST-Elevation V2-V4');
  const [transitState, setTransitState] = useState<'dispatched' | 'on_scene' | 'in_transit' | 'arrived_hospital' | 'completed'>('in_transit');
  const [streamStatus, setStreamStatus] = useState<string | null>(null);

  // Fetch signals and active incidents
  const fetchTelemetry = async () => {
    try {
      const [sigRes, incRes] = await Promise.all([
        api.traffic.getSignals(),
        api.emergency.getIncidents(),
      ]);

      if (sigRes.success) {
        setSignals(sigRes.signals);
      }

      if (incRes.success && incRes.incidents) {
        // Find assigned incident or pending offer
        const assigned = incRes.incidents.find(
          (i: any) =>
            (i.assigned_ambulance_id === 'AMB-1082' || i.assignedAmbulanceId === 'AMB-1082') &&
            i.status !== 'completed'
        );

        if (assigned) {
          setActiveIncident(assigned);
          if (assigned.status) setTransitState(assigned.status);
          setIncomingOffer(null);

          // Fetch route geometry
          if (assigned.latitude && assigned.longitude) {
            api.emergency
              .getRoute(driverCoords.lat, driverCoords.lng, Number(assigned.latitude), Number(assigned.longitude))
              .then((r) => {
                if (r.success && r.route?.coordinates) {
                  setRouteCoordinates(r.route.coordinates);
                }
              })
              .catch(() => {});
          }
        } else {
          // Check for unassigned incident in vicinity
          const unassigned = incRes.incidents.find(
            (i: any) => (!i.assigned_ambulance_id && !i.assignedAmbulanceId) && i.status === 'reported'
          );
          if (unassigned) {
            setIncomingOffer(unassigned);
          }
        }
      }
    } catch (e) {
      // ignore transient poll error
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [driverCoords.lat, driverCoords.lng]);

  const handleToggleDuty = async () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    try {
      await api.driver.updateAvailability(nextState);
      setStatusMessage(`Driver status changed to: ${nextState ? 'ON-DUTY AVAILABLE' : 'OFF-DUTY STANDBY'}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e: any) {
      // ignore
    }
  };

  const handleAcceptOffer = async (incidentId: string) => {
    try {
      const res = await api.driver.acceptOffer(incidentId, 'AMB-1082', 'usr_drv_01');
      if (res.success) {
        setStatusMessage('Emergency dispatch accepted. Turn-by-turn navigation route locked.');
        fetchTelemetry();
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e: any) {
      setStatusMessage('Offer could not be claimed: ' + (e.message || 'Already taken'));
    }
  };

  const handleRejectOffer = async (incidentId: string) => {
    try {
      const res = await api.driver.rejectOffer(incidentId, 'AMB-1082', 'Congested route');
      if (res.success) {
        setIncomingOffer(null);
        setStatusMessage('Offer declined. Dispatch CAD will route to next nearest unit.');
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (e: any) {
      // ignore
    }
  };

  const handleUpdateStatus = async (newStatus: 'dispatched' | 'on_scene' | 'in_transit' | 'arrived_hospital' | 'completed') => {
    setTransitState(newStatus);
    if (!activeIncident) return;
    try {
      const res = await api.emergency.updateIncidentStatus(activeIncident.id, {
        status: newStatus,
        etaMinutes: newStatus === 'arrived_hospital' || newStatus === 'completed' ? 0 : 3.5,
        distanceKm: newStatus === 'arrived_hospital' || newStatus === 'completed' ? 0 : 1.8,
      });
      if (res.success) {
        setStatusMessage(`Mission status updated: ${newStatus.replace('_', ' ').toUpperCase()}`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e: any) {
      // ignore
    }
  };

  const handlePreemptGreenWave = async () => {
    setIsPreempting(true);
    try {
      const res = await api.traffic.preemptCorridor(['SIG-401', 'SIG-402', 'SIG-403'], 60);
      if (res.success) {
        setPreemptionSuccess('V2X Advisory Green Wave Armed on MG Road Corridor (45s clear window)');
        fetchTelemetry();
      }
    } catch (e: any) {
      setPreemptionSuccess('Failed to activate advisory');
    } finally {
      setIsPreempting(false);
      setTimeout(() => setPreemptionSuccess(null), 5000);
    }
  };

  const handleStreamVitals = async () => {
    try {
      const res = await api.fleet.updateVitals('AMB-1082', {
        heartRate,
        oxygenSaturation: spo2,
        bloodPressureSystolic: bpSystolic,
        bloodPressureDiastolic: bpDiastolic,
        ecgStatus,
        speedKmh,
      });
      if (res.success) {
        setStreamStatus('Vitals packet streamed live to Victoria Trauma Center ER');
        setTimeout(() => setStreamStatus(null), 4000);
      }
    } catch (e: any) {
      setStreamStatus('Stream update error');
    }
  };

  // Simulate vehicle GPS forward progression along arterial
  const handleAdvanceGPS = async () => {
    const nextLat = driverCoords.lat - 0.0012;
    const nextLng = driverCoords.lng - 0.0018;
    setDriverCoords({ lat: nextLat, lng: nextLng });
    try {
      await api.driver.updateLocation('AMB-1082', {
        latitude: nextLat,
        longitude: nextLng,
        speedKmh,
        heading: 85,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top HUD Bar */}
      <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">
              VEHICLE: KA-04-E-1082 (ALS UNIT) • DRIVER: RAMESH KUMAR (EMT-P)
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>DESTINATION: VICTORIA TRAUMA CENTER</span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                PRIORITY: ESI-1
              </span>
            </div>
          </div>
        </div>

        {/* Duty Toggle, Speed & Transit Status */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <button
            type="button"
            onClick={handleToggleDuty}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
              isOnDuty
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnDuty ? 'ON-DUTY AVAILABLE' : 'OFF-DUTY STANDBY'}</span>
          </button>

          <div className="text-right">
            <div className="text-slate-400">TRANSIT SPEED</div>
            <div className="text-xl font-black text-blue-400 tabular-nums">{speedKmh} km/h</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400">ESTIMATED ETA</div>
            <div className="text-xl font-black text-red-400 tabular-nums">03:45 MIN</div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Incoming Offer Banner if exists */}
      {incomingOffer && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Incoming Emergency Dispatch Offer (CAD Sector 03)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {incomingOffer.emergency_type || incomingOffer.emergencyType} • {incomingOffer.address || 'Nearby MG Road'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAcceptOffer(incomingOffer.id)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase cursor-pointer"
            >
              Accept Offer
            </button>
            <button
              type="button"
              onClick={() => handleRejectOffer(incomingOffer.id)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Split: AI Navigation & Map Left, Telemetry Streamer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Turn-by-Turn, Leaflet Map & Green Wave Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* REAL LEAFLET OPENSTREETMAP DRIVER NAVIGATION MAP */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                Live GPS Tactical Navigation Map (OSRM Emergency Route)
              </span>
              <button
                type="button"
                onClick={handleAdvanceGPS}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Simulate Step GPS Forward →
              </button>
            </div>

            <EmergencyMap
              ambulanceLocation={{
                lat: driverCoords.lat,
                lng: driverCoords.lng,
                label: 'KA-04-E-1082 (Your Position)',
              }}
              patientLocation={{
                lat: Number(activeIncident?.latitude || 12.9716),
                lng: Number(activeIncident?.longitude || 77.5946),
                label: activeIncident?.patient_name ? `Patient: ${activeIncident.patient_name}` : 'Distress Point',
              }}
              hospitalLocation={{
                lat: 12.9628,
                lng: 77.5746,
                label: 'Victoria Hospital Emergency Trauma Center',
              }}
              routeCoordinates={routeCoordinates}
              height="280px"
            />
          </div>

          {/* Turn by Turn Directions */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Dynamic Path Guidance
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                TRAFFIC CONGESTION: AVOIDED (+4.2 MIN SAVED)
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                ↱
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  In 300 meters, take Right Turn onto MG Road Arterial
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Signal #402 preempted to Green Wave • Clearance window 45 sec
                </div>
              </div>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-500">Transit Speed:</span>
              <div className="flex items-center gap-2">
                {[45, 56, 68, 75].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeedKmh(s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer ${
                      speedKmh === s
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s} km/h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* V2X Green Wave Preemption Trigger */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  V2X IoT Traffic Signal Preemption Advisory
                </h4>
                <p className="text-xs text-slate-500">
                  Broadcasts advisory green wave signal to clear upcoming intersections 400m ahead.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePreemptGreenWave}
                disabled={isPreempting}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isPreempting ? 'Arming Signals...' : 'Arm Green Wave (400m)'}</span>
              </button>
            </div>

            {preemptionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{preemptionSuccess}</span>
              </div>
            )}

            {/* Ahead Signals Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              {signals.slice(0, 3).map((sig) => (
                <div
                  key={sig.id}
                  className={`p-3 rounded-lg border flex flex-col justify-between ${
                    sig.isPreempted
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sig.code}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sig.currentPhase === 'GREEN'
                        ? 'bg-emerald-600 text-white'
                        : sig.currentPhase === 'AMBER'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-red-600 text-white'
                    }`}>
                      {sig.currentPhase}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mb-2">{sig.name}</div>
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <span>Cross: {sig.crossTrafficState}</span>
                    <span className="text-emerald-600 font-bold">{sig.remainingPreemptionSec}s left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Lifecycle Transitions */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Emergency Mission Progression Step:
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleUpdateStatus('dispatched')}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                  transitState === 'dispatched' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                1. Dispatched
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('on_scene')}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                  transitState === 'on_scene' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                2. On Scene (Patient Contact)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('in_transit')}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                  transitState === 'in_transit' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                3. En Route to ER
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('arrived_hospital')}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${
                  transitState === 'arrived_hospital' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                4. Arrived at Hospital
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Live Paramedic Vitals Streamer */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600 animate-pulse" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                In-Transit Patient Telemetry Relay
              </h4>
            </div>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">
              LIVE TO ER
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Adjust patient vitals from the en-route wearable monitor. Updates reflect immediately on the hospital trauma triage screen via real-time WebSocket connection.
          </p>

          {streamStatus && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{streamStatus}</span>
            </div>
          )}

          {/* Vitals Inputs */}
          <div className="space-y-3 text-xs">
            {/* Heart Rate */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Heart Rate (Pulse):</span>
                <span className="font-mono text-red-600 font-bold">{heartRate} bpm</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            {/* SpO2 */}
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-700 dark:text-slate-300">Oxygen Saturation (SpO2):</span>
                <span className="font-mono text-emerald-600 font-bold">{spo2}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Blood Pressure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* ECG Rhythm */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ECG Rhythm Status
              </label>
              <select
                value={ecgStatus}
                onChange={(e) => setEcgStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              >
                <option>ST-Elevation V2-V4 (STEMI)</option>
                <option>Normal Sinus Rhythm</option>
                <option>Sinus Tachycardia</option>
                <option>Atrial Fibrillation</option>
                <option>Ventricular Tachycardia</option>
              </select>
            </div>

            {/* Stream Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStreamVitals}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Stream Vitals to Hospital ER</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
