import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, PhoneCall, AlertTriangle, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const EmergencyGuideSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="guide" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            Civic Protocols & Legal Protections
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            {t('navGuide', 'Emergency Protocols')} & Good Samaritan Guidelines
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Essential protocols for motorists, bystanders, and citizens when facilitating emergency vehicle transit across India.
          </p>
        </div>

        {/* 2-Column Grid: Good Samaritan Rights Left, Motorist Right-of-Way Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Left: Good Samaritan Protection Box */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Good Samaritan Legal Safeguards
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Motor Vehicles (Amendment) Act, 2019 • Section 134A
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              The Supreme Court of India and Union Government have enacted complete legal protections for any bystander or citizen who assists a road accident or medical emergency victim:
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Criminal / Civil Liability:</strong> You cannot be held liable for any injury or accidental death resulting from good-faith assistance.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>No Compulsory Disclosure:</strong> You are not forced to provide your name, address, or phone number to hospital staff or police.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Hospital Admission:</strong> Hospitals cannot demand advance financial deposits before rendering life-saving stabilization care.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Motorist Right-of-Way Rules */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Motorist Emergency Corridor Rules
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Mandatory Yield Protocols • Section 194E
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              When an approaching emergency vehicle activates flashing lights or audible sirens, motorists must adhere to statutory yield guidelines:
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Yield to the Left:</strong> Gradually steer your vehicle toward the left side of the roadway, allowing center lane clearance.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Do Not Tailgate the Ambulance:</strong> Following closely behind an ambulance to cut traffic is strictly prohibited and dangerous.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Clear Intersection Boxes:</strong> Never stop inside intersection yellow boxes or block pedestrian crossings.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* National Emergency Hotline Grid */}
        <div className="p-6 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30">
          <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-300 mb-3">
            National 24/7 Emergency Numbers Across India
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <a
              href="tel:108"
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 flex items-center justify-between hover:border-red-500 transition-colors"
            >
              <div>
                <div className="text-[11px] text-slate-500">Ambulance Service</div>
                <div className="text-base font-bold text-red-600">DIAL 108</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600" />
            </a>

            <a
              href="tel:112"
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 flex items-center justify-between hover:border-red-500 transition-colors"
            >
              <div>
                <div className="text-[11px] text-slate-500">Universal Emergency</div>
                <div className="text-base font-bold text-red-600">DIAL 112</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600" />
            </a>

            <a
              href="tel:1033"
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-400 transition-colors"
            >
              <div>
                <div className="text-[11px] text-slate-500">National Highway</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200">DIAL 1033</div>
              </div>
              <PhoneCall className="w-4 h-4 text-slate-400" />
            </a>

            <a
              href="tel:1070"
              className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-400 transition-colors"
            >
              <div>
                <div className="text-[11px] text-slate-500">Disaster Relief</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-200">DIAL 1070</div>
              </div>
              <PhoneCall className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
