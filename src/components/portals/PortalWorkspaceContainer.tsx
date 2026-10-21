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
  onQuickSwitchRole?: (role: UserRole) => void;
  onOpenAuth: (role: UserRole) => void;
  currentUser?: any;
}

export const PortalWorkspaceContainer: React.FC<PortalWorkspaceContainerProps> = ({
  currentRole,
  onRoleChange,
  onQuickSwitchRole,
  onOpenAuth,
  currentUser,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'patient':
        return { label: 'Citizen / Patient SOS', icon: User };
      case 'driver':
        return { label: 'Paramedic / Driver HUD', icon: Truck };
      case 'hospital':
        return { label: 'Hospital Emergency ER', icon: Building2 };
      case 'admin':
        return { label: 'City Traffic & Police Admin', icon: SlidersHorizontal };
    }
  };

  const badge = getRoleBadge(currentRole);

  const handleInstantSwitch = (role: UserRole) => {
    if (onQuickSwitchRole) {
      onQuickSwitchRole(role);
    } else {
      onRoleChange(role);
    }
  };

  return (
    <div id="live-portals" className="rounded-2xl border-2 border-red-500/40 dark:border-red-950/90 bg-white dark:bg-black shadow-2xl dark:shadow-[0_0_50px_rgba(220,38,38,0.18)] overflow-hidden my-12 transition-all">
      
      {/* Workspace Master Header */}
      <div className="px-6 py-4 border-b border-red-200 dark:border-red-950/60 bg-white dark:bg-black text-slate-900 dark:text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse glow-red" />
          <div>
            <div className="text-xs font-mono text-red-600 dark:text-red-400 uppercase tracking-widest font-extrabold flex items-center gap-2">
              <span>UNIFIED COMMAND MATRIX</span>
              <span className="text-slate-300 dark:text-zinc-700">|</span>
              <span className="text-slate-500 dark:text-zinc-400 font-normal">REAL-TIME TELEMETRY</span>
            </div>
            <div className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Arogya<span className="text-red-600 dark:text-red-500">Vahini</span> Multi-Stakeholder Operational Portal
            </div>
          </div>
        </div>

        {/* High-Visibility Segmented Role Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-red-950/60 max-w-full overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onRoleChange('patient')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'patient'
                ? 'bg-red-600 text-white shadow-md glow-red'
                : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Patient SOS</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('driver')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'driver'
                ? 'bg-red-600 text-white shadow-md glow-red'
                : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Driver HUD</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('hospital')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'hospital'
                ? 'bg-red-600 text-white shadow-md glow-red'
                : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. Hospital ER</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'admin'
                ? 'bg-red-600 text-white shadow-md glow-red'
                : 'text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>4. Traffic Admin</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Role Access Strip (Solves: "I GOT ACCESS TO PATIENT BUT NOT DRIVER AND OTHER PORTALS") */}
      <div className="px-6 py-2.5 bg-red-50/70 dark:bg-zinc-950 border-b border-red-100 dark:border-red-950/40 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
          <Activity className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white">Instant Portal Switch & Staff Simulator:</span>
          <span className="hidden md:inline text-slate-500 dark:text-zinc-400">
            Switch your active view or simulate authenticated role access with 1 click:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleInstantSwitch('patient')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'patient' && currentUser?.role === 'patient'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            🚨 Citizen Mode
          </button>

          <button
            type="button"
            onClick={() => handleInstantSwitch('driver')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'driver' && currentUser?.role === 'driver'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            🚑 Paramedic AMB-1082
          </button>

          <button
            type="button"
            onClick={() => handleInstantSwitch('hospital')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'hospital' && currentUser?.role === 'hospital'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            🏥 Victoria ER Staff
          </button>

          <button
            type="button"
            onClick={() => handleInstantSwitch('admin')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentRole === 'admin' && currentUser?.role === 'admin'
                ? 'bg-red-600 text-white glow-red-sm'
                : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-zinc-800'
            }`}
          >
            🚦 Traffic Command
          </button>
        </div>
      </div>

      {/* Active Portal Body */}
      <div className="p-6 sm:p-8 bg-white dark:bg-black">
        {currentRole === 'patient' && <PatientPortalWorkspace />}
        {currentRole === 'driver' && <DriverPortalWorkspace />}
        {currentRole === 'hospital' && <HospitalPortalWorkspace />}
        {currentRole === 'admin' && <AdminPortalWorkspace />}
      </div>

      {/* Workspace Footer Strip */}
      <div className="px-6 py-3.5 border-t border-slate-200 dark:border-red-950/60 bg-slate-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-500" />
          <span>Real-time REST API active at <code className="font-mono text-slate-800 dark:text-zinc-200">/api/v1/*</code></span>
          {currentUser && (
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-medium border border-slate-200 dark:border-zinc-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500 animate-pulse" />
              <span>Signed in: {currentUser.full_name || currentUser.fullName}</span>
              <span className="font-mono uppercase text-[10px] text-red-600 dark:text-red-400 font-bold">({currentUser.role})</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Need custom staff credentials for {badge.label}?</span>
          <button
            type="button"
            onClick={() => onOpenAuth(currentRole)}
            className="font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            Authenticate / Switch Account →
          </button>
        </div>
      </div>

    </div>
  );
};
