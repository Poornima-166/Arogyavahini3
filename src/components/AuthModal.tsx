import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/auth';
import { api } from '../services/api';
import { X, User, Truck, Building2, SlidersHorizontal, Eye, EyeOff, ShieldCheck, AlertCircle, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onAuthSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'patient',
  onAuthSuccess,
}) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [hospitalCode, setHospitalCode] = useState('');
  const [department, setDepartment] = useState('Emergency Department');
  
  // Status feedback
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(initialRole);
    setSubmittedMessage(null);
    setValidationError(null);
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Honest validation check
    if (!identifier.trim()) {
      setValidationError('Please provide your phone number or email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }

    // Role specific validation
    if (selectedRole === 'driver' && !vehicleReg.trim()) {
      setValidationError('Please enter the Ambulance Vehicle Registration Number.');
      return;
    }
    if (selectedRole === 'hospital' && !hospitalCode.trim()) {
      setValidationError('Please enter your Hospital Facility Registration Code.');
      return;
    }
    if (selectedRole === 'admin' && !badgeId.trim()) {
      setValidationError('Please enter your Municipal Police Badge ID.');
      return;
    }

    try {
      if (mode === 'signin') {
        const res = await api.auth.login({
          identifier,
          password,
          role: selectedRole,
        });
        if (res.success) {
          setSubmittedMessage(res.message);
          if (onAuthSuccess) onAuthSuccess(res.user);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        const res = await api.auth.register({
          email: identifier.includes('@') ? identifier : undefined,
          phone: !identifier.includes('@') ? identifier : undefined,
          password,
          role: selectedRole,
          fullName,
          nationalHealthId: abhaId,
          vehicleReg,
          badgeId,
          hospitalId: hospitalCode,
          department,
        });
        if (res.success) {
          setSubmittedMessage(res.message);
          if (onAuthSuccess) onAuthSuccess(res.user);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'Authentication request failed';
      if (mode === 'signin' && (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('failed'))) {
        setValidationError(`${errMsg} If you don't have an account yet, switch to the "Register" tab above to create one, or use the Demo Account button.`);
      } else {
        setValidationError(errMsg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[92vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-bold text-xs">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('authModalTitle', 'ArogyaVahini Secure Access')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          
          {/* Sign In / Register Tab Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setSubmittedMessage(null);
                setValidationError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('signIn', 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setSubmittedMessage(null);
                setValidationError(null);
              }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('register', 'Register')}
            </button>
          </div>

          {/* Role Selector Grid */}
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t('authRoleSelect', 'Select Your Access Portal')}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('patient');
                  setSubmittedMessage(null);
                  setValidationError(null);
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <User className="w-4 h-4 shrink-0 text-red-600" />
                <span className="truncate">{t('rolePatient', 'Patient / Citizen')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('driver');
                  setSubmittedMessage(null);
                  setValidationError(null);
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'driver'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4 shrink-0 text-blue-600" />
                <span className="truncate">{t('roleDriver', 'Ambulance Driver')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('hospital');
                  setSubmittedMessage(null);
                  setValidationError(null);
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'hospital'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="truncate">{t('roleHospital', 'Hospital ER Staff')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setSubmittedMessage(null);
                  setValidationError(null);
                }}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="truncate">{t('roleAdmin', 'Traffic Authority')}</span>
              </button>

            </div>
          </div>

          {/* Quick Demo Credentials Helper */}
          {mode === 'signin' && (
            <div className="mb-4 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 text-xs flex items-center justify-between">
              <div className="text-[11px] text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Demo Account:</span>{' '}
                {selectedRole === 'patient' && 'citizen@arogya.in'}
                {selectedRole === 'driver' && 'driver@arogya.in'}
                {selectedRole === 'hospital' && 'er@victoria.gov.in'}
                {selectedRole === 'admin' && 'admin@trafficpolice.gov.in'}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'patient') {
                    setIdentifier('citizen@arogya.in');
                  } else if (selectedRole === 'driver') {
                    setIdentifier('driver@arogya.in');
                  } else if (selectedRole === 'hospital') {
                    setIdentifier('er@victoria.gov.in');
                  } else if (selectedRole === 'admin') {
                    setIdentifier('admin@trafficpolice.gov.in');
                  }
                  setPassword('Arogya@2026');
                  setValidationError(null);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] transition-colors cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Validation Notice or Feedback */}
          {validationError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {submittedMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{submittedMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Legal Designation
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar / Officer Priya"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('emailOrPhone', 'Phone Number / Email')}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={selectedRole === 'patient' ? '+91 98765 43210 or user@example.com' : 'official@hospital.gov.in'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Role-Specific Secondary Fields */}
            {selectedRole === 'patient' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('abhaNumber', 'ABHA Health ID (Optional)')}
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="14-digit ABHA Number (e.g. 91-1234-5678-9012)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>
            )}

            {selectedRole === 'driver' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('vehicleReg', 'Ambulance Reg No.')}
                  </label>
                  <input
                    type="text"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    placeholder="KA-04-E-1082"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('driverBadge', 'Badge / EMT ID')}
                  </label>
                  <input
                    type="text"
                    value={badgeId}
                    onChange={(e) => setBadgeId(e.target.value)}
                    placeholder="EMT-88392"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'hospital' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('hospitalId', 'Hospital Registration Code')}
                  </label>
                  <input
                    type="text"
                    value={hospitalCode}
                    onChange={(e) => setHospitalCode(e.target.value)}
                    placeholder="HOSP-BLR-019"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Emergency Department (ED / ER)</option>
                    <option>Trauma Intensive Care (TICU)</option>
                    <option>Cardiac Care Unit (CCU)</option>
                    <option>Chief Medical Officer Desk</option>
                  </select>
                </div>
              </div>
            )}

            {selectedRole === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('policeBadge', 'Traffic Police Officer Badge ID')}
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="TPD-SECTOR-09-OFFICER"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('password', 'Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
            >
              {mode === 'signin' ? t('signInBtn', 'Sign In to Portal') : t('registerBtn', 'Create Registered Account')}
            </button>
          </form>

          {/* Transparent Notice */}
          <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              'authNotice',
              'Frontend Foundation: Stage 2 integrates real PostgreSQL database authentication and session management. No simulated tokens are stored.'
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
