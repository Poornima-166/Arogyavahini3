import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, PhoneCall, HeartHandshake, ArrowUpRight } from 'lucide-react';
import { UserRole } from '../types/auth';

interface FooterProps {
  onOpenAuthForRole: (role: UserRole) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuthForRole }) => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand & Purpose (2 cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-lg mb-3">
              <span className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-white" />
              </span>
              <span>Arogya<span className="text-red-600 dark:text-red-500">Vahini</span></span>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              AI-based emergency ambulance transit coordination system integrating traffic light priority, IoT green corridors, and hospital trauma centers to maximize survival during the critical Golden Hour.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>MoRTH & Good Samaritan Law Aligned</span>
            </div>
          </div>

          {/* Four Portals (1 col) */}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Four Portals
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuthForRole('patient')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <span>Patient / Citizen Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuthForRole('driver')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <span>Ambulance Driver Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuthForRole('hospital')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <span>Hospital Trauma ER Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuthForRole('admin')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-left cursor-pointer flex items-center gap-1"
                >
                  <span>Traffic Police & Admin Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines (1 col) */}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Emergency Hotlines
            </div>
            <ul className="space-y-2 font-mono">
              <li>
                <a href="tel:108" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-red-600" />
                  <span>108 — Ambulance</span>
                </a>
              </li>
              <li>
                <a href="tel:112" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-red-600" />
                  <span>112 — National Helpline</span>
                </a>
              </li>
              <li>
                <a href="tel:1033" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  1033 — Highway Helpline
                </a>
              </li>
              <li>
                <a href="tel:1070" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  1070 — Disaster Authority
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Protection (1 col) */}
          <div>
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Citizen Protection
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mb-3">
              Under Section 134A of the Motor Vehicles Act, bystanders providing medical aid to accident victims are protected from all civil and criminal liabilities.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Good Samaritan Act, 2019</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 ArogyaVahini. {t('allRightsReserved', 'All rights reserved. Designed for emergency healthcare and municipal traffic coordination.')}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">Stage 1: Frontend Foundation</span>
            <span>·</span>
            <span className="font-mono">PostgreSQL Ready</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
