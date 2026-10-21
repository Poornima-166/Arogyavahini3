import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, PhoneCall, AlertTriangle, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const EmergencyGuideSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="guide" className="py-16 md:py-24 border-t border-red-100 dark:border-red-950/60 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            Civic Protocols & Legal Protections
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {t('navGuide', 'Emergency Protocols')} & Good Samaritan Guidelines
          </h2>
          <p className="text-slate-600 dark:text-zinc-300 text-base sm:text-lg">
            Essential protocols for motorists, bystanders, and citizens when facilitating emergency vehicle transit across India.
          </p>
        </div>

        {/* 2-Column Grid: Good Samaritan Rights Left, Motorist Right-of-Way Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Left: Good Samaritan Protection Box */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-red-950/80 bg-white dark:bg-zinc-950 shadow-md dark:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold border border-red-100 dark:border-red-900/60 glow-red-sm">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Good Samaritan Legal Safeguards
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  Motor Vehicles (Amendment) Act, 2019 • Section 134A
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-6">
              The Supreme Court of India and Union Government have enacted complete legal protections for any bystander or citizen who assists a road accident or medical emergency victim:
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Criminal / Civil Liability:</strong> You cannot be held liable for any injury or accidental death resulting from good-faith assistance.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>No Compulsory Disclosure:</strong> You are not forced to provide your name, address, or phone number to hospital staff or police.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Immediate Hospital Admission:</strong> Hospitals cannot demand advance financial deposits before rendering life-saving stabilization care.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Motorist Right-of-Way Rules */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-red-950/80 bg-white dark:bg-zinc-950 shadow-md dark:shadow-[0_0_30px_rgba(220,38,38,0.1)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold border border-red-100 dark:border-red-900/60 glow-red-sm">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Motorist Emergency Corridor Rules
                </h3>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                  Mandatory Yield Protocols • Section 194E
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-6">
              When an approaching emergency vehicle activates flashing lights or audible sirens, motorists must adhere to statutory yield guidelines:
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-zinc-300">
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
        <div className="p-6 rounded-2xl border border-red-200 dark:border-red-950/80 bg-red-50/40 dark:bg-zinc-950 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
            National 24/7 Emergency Numbers Across India
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <a
              href="tel:108"
              className="p-3.5 rounded-xl bg-white dark:bg-black border border-red-200 dark:border-red-950/80 flex items-center justify-between hover:border-red-500 transition-colors shadow-sm glow-red-sm"
            >
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Ambulance Service</div>
                <div className="text-base font-bold text-red-600 dark:text-red-400">DIAL 108</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
            </a>

            <a
              href="tel:112"
              className="p-3.5 rounded-xl bg-white dark:bg-black border border-red-200 dark:border-red-950/80 flex items-center justify-between hover:border-red-500 transition-colors shadow-sm glow-red-sm"
            >
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Universal Emergency</div>
                <div className="text-base font-bold text-red-600 dark:text-red-400">DIAL 112</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
            </a>

            <a
              href="tel:1033"
              className="p-3.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-red-950/80 flex items-center justify-between hover:border-red-500 transition-colors shadow-sm"
            >
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">National Highway</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">DIAL 1033</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
            </a>

            <a
              href="tel:1070"
              className="p-3.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-red-950/80 flex items-center justify-between hover:border-red-500 transition-colors shadow-sm"
            >
              <div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Disaster Relief</div>
                <div className="text-base font-bold text-slate-900 dark:text-white">DIAL 1070</div>
              </div>
              <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
