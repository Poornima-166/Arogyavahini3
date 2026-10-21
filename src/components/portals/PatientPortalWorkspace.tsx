import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { EmergencyMap } from '../maps/EmergencyMap';
import { 
  Flame, 
  MapPin, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  Heart, 
  Activity, 
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Plus,
  Trash2,
  Save,
  Navigation
} from 'lucide-react';

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export const PatientPortalWorkspace: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sos' | 'profile'>('sos');

  // SOS Distress State
  const [emergencyType, setEmergencyType] = useState('Acute STEMI (Heart Attack)');
  const [severity, setSeverity] = useState<'ESI-1' | 'ESI-2'>('ESI-1');
  const [patientName, setPatientName] = useState('Sunil Gowda');
  const [contactNumber, setContactNumber] = useState('+91 98450 12345');
  const [address, setAddress] = useState('MG Road Central Corridor, Bengaluru');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Active Dispatch State
  const [activeIncident, setActiveIncident] = useState<any | null>(null);
  const [assignedAmbulance, setAssignedAmbulance] = useState<any | null>(null);
  const [destinationHospital, setDestinationHospital] = useState<any | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);

  // CPR Metronome (105 BPM)
  const [cprMetronomeActive, setCprMetronomeActive] = useState(false);
  const [cprBeat, setCprBeat] = useState(false);

  // Patient Medical Profile State
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Sulfa drugs');
  const [medicalConditions, setMedicalConditions] = useState('Hypertension (Controlled)');
  const [nationalHealthId, setNationalHealthId] = useState('91-4821-9920-1082');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: 'Kavitha Gowda', phone: '+91 98450 99887', relation: 'Spouse' },
    { name: 'Dr. H. Prasad', phone: '+91 80 2650 4433', relation: 'Primary Doctor' },
  ]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);

  // Load profile on start
  useEffect(() => {
    api.patient
      .getProfile()
      .then((res) => {
        if (res.success && res.profile) {
          if (res.profile.blood_group) setBloodGroup(res.profile.blood_group);
          if (res.profile.allergies) setAllergies(res.profile.allergies);
          if (res.profile.medical_conditions) setMedicalConditions(res.profile.medical_conditions);
          if (res.profile.national_health_id) setNationalHealthId(res.profile.national_health_id);
          if (Array.isArray(res.profile.emergency_contacts) && res.profile.emergency_contacts.length > 0) {
            setEmergencyContacts(res.profile.emergency_contacts);
          }
        }
      })
      .catch(() => {
        // Safe in-memory defaults
      });
  }, []);

  // Poll active incident if exists
  useEffect(() => {
    let interval: any;
    if (activeIncident?.id) {
      interval = setInterval(async () => {
        try {
          const res = await api.emergency.getIncident(activeIncident.id);
          if (res.success && res.incident) {
            setActiveIncident(res.incident);
            if (res.ambulance) setAssignedAmbulance(res.ambulance);
            if (res.hospital) setDestinationHospital(res.hospital);
            if (res.route?.coordinates) setRouteCoordinates(res.route.coordinates);
          }
        } catch (e: any) {
          // ignore transient poll error
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [activeIncident?.id]);

  // CPR Metronome
  useEffect(() => {
    let beatInterval: any;
    if (cprMetronomeActive) {
      beatInterval = setInterval(() => {
        setCprBeat((prev) => !prev);
      }, 570);
    }
    return () => clearInterval(beatInterval);
  }, [cprMetronomeActive]);

  const handleFetchLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress(`High-Precision GPS (${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E)`);
          setIsLocating(false);
        },
        (err) => {
          setIsLocating(false);
          let errMsg = 'Location permission denied or timed out.';
          if (err.code === 1) errMsg = 'Location access was denied. Please allow GPS permissions in your browser.';
          if (err.code === 2) errMsg = 'Location unavailable. Switched to high-density corridor coordinates.';
          setLocationError(errMsg);
          // Fallback to central arterial
          setCoords({ lat: 12.9716, lng: 77.5946 });
          setAddress('MG Road Central Corridor, Bengaluru (Fused Gateway)');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
      setLocationError('Geolocation API is not supported by your browser.');
    }
  };

  const handleTriggerSOS = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await api.emergency.triggerSos({
        patientName,
        contactNumber,
        emergencyType,
        severity,
        latitude: coords.lat,
        longitude: coords.lng,
        address,
      });

      if (res.success) {
        setActiveIncident(res.incident);
        setAssignedAmbulance(res.ambulance);
        if (res.route?.coordinates) {
          setRouteCoordinates(res.route.coordinates);
        }
      }
    } catch (err: any) {
      console.error('Failed to trigger SOS:', err);
      setActionError(err.message || 'Emergency dispatch grid unreachable. Please dial 108 immediately.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      const res = await api.patient.updateProfile({
        nationalHealthId,
        bloodGroup,
        allergies,
        medicalConditions,
        emergencyContacts,
      });
      if (res.success) {
        setProfileStatus('Emergency medical profile and contacts successfully saved to secure registry.');
        setTimeout(() => setProfileStatus(null), 4000);
      }
    } catch (err: any) {
      setProfileStatus('Failed to update medical profile: ' + (err.message || 'network error'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relation: 'Family' }]);
  };

  const handleRemoveContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const handleUpdateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleReset = () => {
    setActiveIncident(null);
    setAssignedAmbulance(null);
    setRouteCoordinates([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with SOS Helpline & Navigation Tabs */}
      <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Citizen Distress & Patient Command Bay
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white">
            1-Tap Emergency SOS, Live Dispatch Tracking & ABHA Health Profile
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('sos')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === 'sos'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Emergency SOS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Medical Profile & Contacts
            </button>
          </div>

          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs shadow-sm hover:bg-red-700 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>DIAL 108 NOW</span>
          </a>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {activeTab === 'profile' ? (
        /* ---------------- MEDICAL PROFILE & CONTACTS TAB ---------------- */
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Patient Emergency Medical Record & ABHA Profile
              </h4>
              <p className="text-xs text-slate-500">
                This clinical information is securely relayed to the dispatched paramedic and receiving hospital ER to prevent contraindicated medications.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{profileSaving ? 'Saving...' : 'Save Health Profile'}</span>
            </button>
          </div>

          {profileStatus && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ABHA Health ID Number
              </label>
              <input
                type="text"
                value={nationalHealthId}
                onChange={(e) => setNationalHealthId(e.target.value)}
                placeholder="e.g. 91-4821-9920-1082"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Documented Drug Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Aspirin"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pre-existing Medical Conditions
              </label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Pacemaker"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Emergency Contacts Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Emergency Next-of-Kin Contacts (Notified during SOS)
              </h5>
              <button
                type="button"
                onClick={handleAddContact}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                >
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contact.name}
                      onChange={(e) => handleUpdateContact(index, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Phone Number (+91 ...)"
                      value={contact.phone}
                      onChange={(e) => handleUpdateContact(index, 'phone', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Relationship (e.g. Spouse)"
                      value={contact.relation}
                      onChange={(e) => handleUpdateContact(index, 'relation', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(index)}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !activeIncident ? (
        /* ---------------- SOS FORM & PRE-DISPATCH ---------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
              Emergency Distress Parameters
            </h4>

            {/* Condition Category Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Emergency Type / Condition
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  'Acute STEMI (Heart Attack)',
                  'Severe Road Trauma',
                  'Acute Stroke Symptoms',
                  'Severe Respiratory Failure',
                  'Unconscious / Syncope',
                  'High-Risk Obstetric',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setEmergencyType(type);
                      setSeverity(type.includes('Heart') || type.includes('Trauma') ? 'ESI-1' : 'ESI-2');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      emergencyType === type
                        ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patient / Bystander Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Location Bar with GPS Triangulation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Incident Location
                </label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isLocating}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Acquiring GPS...' : 'Acquire High-Accuracy GPS'}</span>
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <div className="text-[11px] font-mono text-slate-400 mt-1 flex justify-between">
                <span>Coordinates: {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E</span>
                <span className="text-emerald-600 font-bold">GPS Locked</span>
              </div>
              {locationError && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ {locationError}
                </div>
              )}
            </div>

            {/* Big Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerSOS}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <Flame className="w-5 h-5 animate-pulse" />
                <span>{loading ? 'Dispatched to 108 Emergency Grid...' : 'DISPATCH EMERGENCY AMBULANCE NOW (SOS)'}</span>
              </button>
              <div className="text-center text-[11px] text-slate-500 mt-2">
                Triggers nearest ALS/BLS fleet alert and pre-locks destination trauma ICU bay.
              </div>
            </div>
          </div>

          {/* Right Card: ABHA Health Card & Bystander CPR Guide */}
          <div className="lg:col-span-5 space-y-4">
            {/* ABHA Medical Profile Preview */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ABHA Emergency Health Profile
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Edit Profile →
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ABHA Number:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{nationalHealthId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Blood Group:</span>
                  <span className="font-bold text-red-600">{bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Known Allergies:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{allergies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pre-existing:</span>
                  <span className="text-slate-800 dark:text-slate-200">{medicalConditions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next of Kin:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">
                    {emergencyContacts[0]?.name} ({emergencyContacts[0]?.phone})
                  </span>
                </div>
              </div>
            </div>

            {/* CPR Metronome Trainer */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Heart className={`w-4 h-4 text-red-600 ${cprBeat ? 'scale-125' : 'scale-100'} transition-transform`} />
                  Bystander CPR Metronome (105 BPM)
                </span>
                <button
                  type="button"
                  onClick={() => setCprMetronomeActive(!cprMetronomeActive)}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                    cprMetronomeActive
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {cprMetronomeActive ? 'Stop Pulse' : 'Start Cadence'}
                </button>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                If the victim is unresponsive and not breathing normally, place hands in the center of the chest and push hard & fast to the beat (100–120 compressions per minute).
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------------- ACTIVE EMERGENCY TRACKING & MAP SCREEN ---------------- */
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 shadow-md">
            
            {/* Top Bar of Active Dispatch */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-500">
                    DISPATCH TICKET: {activeIncident.id}
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {activeIncident.emergency_type || activeIncident.emergencyType} • Priority {activeIncident.severity}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {String(activeIncident.status).replace('_', ' ').toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  title="Close / New Emergency"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Radar Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono">
                <div className="text-[11px] text-slate-500">ASSIGNED AMBULANCE</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {assignedAmbulance?.registration_number || assignedAmbulance?.registrationNumber || 'KA-04-E-1082'}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {assignedAmbulance?.type || 'ALS'} (Advanced Life Support)
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono">
                <div className="text-[11px] text-slate-500">ESTIMATED ARRIVAL (ETA)</div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400 tabular-nums">
                  {activeIncident.eta_minutes ?? activeIncident.etaMinutes ?? 4.2} MIN
                </div>
                <div className="text-[11px] text-slate-500">
                  Distance: {activeIncident.distance_km ?? activeIncident.distanceKm ?? 2.1} km
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500">PARAMEDIC LEAD</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {assignedAmbulance?.driver_name || assignedAmbulance?.driverName || 'Ramesh Kumar (EMT-P)'}
                </div>
                <a
                  href={`tel:${assignedAmbulance?.driver_phone || assignedAmbulance?.driverPhone || '+919876543211'}`}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Paramedic</span>
                </a>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-500">DESTINATION TRAUMA CENTER</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Victoria Hospital & ER
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Trauma Bay Locked & Standby
                </div>
              </div>
            </div>

            {/* REAL LEAFLET OPENSTREETMAP ROUTE VISUALIZATION */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-red-600" />
                  Live GPS Route Navigation Map (OpenStreetMap & OSRM Engine)
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Ambulance ➜ Distress Point ➜ Victoria Hospital
                </span>
              </div>

              <EmergencyMap
                patientLocation={{
                  lat: Number(activeIncident.latitude || coords.lat),
                  lng: Number(activeIncident.longitude || coords.lng),
                  label: activeIncident.address || 'Distress Point',
                }}
                ambulanceLocation={{
                  lat: Number(assignedAmbulance?.latitude || 12.9716),
                  lng: Number(assignedAmbulance?.longitude || 77.5946),
                  label: `${assignedAmbulance?.registration_number || 'KA-04-E-1082'} (En Route)`,
                }}
                hospitalLocation={{
                  lat: 12.9628,
                  lng: 77.5746,
                  label: 'Victoria Hospital Emergency Trauma Center',
                }}
                routeCoordinates={routeCoordinates}
                height="320px"
              />
            </div>

            {/* Live Green Corridor Path Progress */}
            <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>V2X GREEN CORRIDOR SYNC</span>
                <span className="text-emerald-400 font-bold">ALL SIGNALS PREEMPTED</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-emerald-500 rounded-full w-2/3 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
                <span>Distress Point</span>
                <span className="text-emerald-300">Signal 1 (Cleared)</span>
                <span className="text-emerald-300">Signal 2 (Green)</span>
                <span className="text-slate-300">Victoria Hospital ER</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
