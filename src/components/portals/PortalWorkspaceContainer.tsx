import React, { useState } from 'react';
import { UserRole } from '../../types/auth';
import { PatientPortalWorkspace } from './PatientPortalWorkspace';
import { DriverPortalWorkspace } from './DriverPortalWorkspace';
import { HospitalPortalWorkspace } from './HospitalPortalWorkspace';
import { AdminPortalWorkspace } from './AdminPortalWorkspace';
import { 
  User, 
  Truck, 
  Building2, 
  SlidersHorizontal, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';

interface PortalWorkspaceContainerProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenAuth: (role: UserRole) => void;
}

export const PortalWorkspaceContainer: React.FC<PortalWorkspaceContainerProps> = ({
  currentRole,
  onRoleChange,
  onOpenAuth,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return { label: 'Citizen / Patient', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/60' };
      case 'driver':
        return { label: 'Paramedic / Driver', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60' };
      case 'hospital':
        return { label: 'Hospital Emergency ER', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' };
      case 'admin':
        return { label: 'Traffic & City Police Admin', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' };
    }
  };

  const badge = getRoleBadge(currentRole);

  return (
    <div id="live-portals" className="rounded-2xl border-2 border-red-500/30 dark:border-red-500/20 bg-white dark:bg-slate-900 shadow-xl overflow-hidden my-12">
      
      {/* Workspace Header Strip */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
              Stage 2 & 3: Live Operational Portal Environment
            </div>
            <div className="text-sm font-bold text-white">
              ArogyaVahini Multi-Stakeholder Unified Command System
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl max-w-full overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onRoleChange('patient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'patient'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient SOS</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('driver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'driver'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Driver HUD</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('hospital')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'hospital'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital ER</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'admin'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Traffic Admin</span>
          </button>
        </div>
      </div>

      {/* Active Portal Body */}
      <div className="p-6 sm:p-8 bg-slate-50/50 dark:bg-slate-950/60">
        {currentRole === 'patient' && <PatientPortalWorkspace />}
        {currentRole === 'driver' && <DriverPortalWorkspace />}
        {currentRole === 'hospital' && <HospitalPortalWorkspace />}
        {currentRole === 'admin' && <AdminPortalWorkspace />}
      </div>

      {/* Workspace Footer Strip */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real-time REST API active at <code className="font-mono text-slate-700 dark:text-slate-300">/api/v1/*</code></span>
        </div>
        <div className="flex items-center gap-2">
          <span>Need to authenticate a specific staff badge?</span>
          <button
            type="button"
            onClick={() => onOpenAuth(currentRole)}
            className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            Sign in as {badge.label} →
          </button>
        </div>
      </div>

    </div>
  );
};
