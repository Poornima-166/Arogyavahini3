import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PhoneCall, Navigation2, Cpu, Hospital, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface HeroSectionProps {
  onExplorePortals: () => void;
  onExploreSimulator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExplorePortals,
  onExploreSimulator,
}) => {
  const { t } = useLanguage();

  return (
    <section id="overview" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background ambient medical glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-500/5 dark:bg-red-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Emergency Advisory Bar (National Helpline) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 mb-8 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs">
          <div className="flex items-center gap-2.5 text-red-900 dark:text-red-200 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
            <span>National Emergency Medical Response Dispatch — Free 24/7 Helpline</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 font-bold font-mono text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>DIAL 108 (Ambulance)</span>
            </a>
            <span className="text-red-300 dark:text-red-700">·</span>
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 font-bold font-mono text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
            >
              <span>DIAL 112 (Universal)</span>
            </a>
          </div>
        </div>

        {/* 2-Column Split: Editorial & Action left, Interactive Telemetry Graphic right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Value Prop, CTA */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Quiet Kick-off Metadata */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3">
              <span>{t('heroBadge', 'Emergency Healthcare Transit Network')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">Golden Hour Protection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.85rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance mb-5">
              {t('heroTitle', 'Every Second Preserves Life: Smart Corridors for Emergency Transit')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl">
              {t(
                'heroDescription',
                'ArogyaVahini interconnects ambulances, municipal traffic signals, and hospital trauma centers through AI routing and automated green light preemption to safeguard the Golden Hour.'
              )}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={onExplorePortals}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
              >
                <span>{t('heroPrimaryCta', 'Explore 4 Portals')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onExploreSimulator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('heroSecondaryCta', 'Simulate Green Wave')}</span>
              </button>
            </div>

            {/* Trust Markers / Institutional Protocol Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 w-full text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Good Samaritan Law Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>400m IoT Signal Preemption</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Hospital className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>ABHA & Trauma ER Integrated</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Tactical Telemetry & Green Wave HUD */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden">
              
              {/* Header of HUD */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Active Green Corridor Transit
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  PRIORITY: ESI-1 CRITICAL
                </span>
              </div>

              {/* Graphical Transit Visualization Canvas */}
              <div className="relative rounded-lg bg-slate-950 text-white p-4 mb-4 overflow-hidden border border-slate-800">
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

                {/* Road Corridor Path */}
                <div className="relative z-10 flex flex-col gap-3">
                  
                  {/* Top route metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>UNIT: ALS-KA-01-EA-4920</span>
                    <span className="text-emerald-400 font-bold">ESTIMATED ETA: 04:12 MIN</span>
                  </div>

                  {/* Route progress visual */}
                  <div className="relative py-4">
                    {/* The Green Corridor Highway Line */}
                    <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-3/4 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    </div>

                    {/* Intersections Along Road */}
                    <div className="flex justify-between items-center text-[10px] mt-2 font-mono text-slate-400">
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mb-1" />
                        <span>Jct 1 (Passed)</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mb-1 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                        <span className="text-emerald-300 font-bold">Jct 2 (Green Wave)</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mb-1" />
                        <span>Jct 3 (Clearing)</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 rounded-full bg-red-400 mb-1" />
                        <span>Hospital ER Gate</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Telemetry Snapshot Box */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">PATIENT SPO2</div>
                      <div className="text-base font-bold text-emerald-400 tabular-nums">98%</div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">HEART RATE</div>
                      <div className="text-base font-bold text-red-400 tabular-nums flex items-center justify-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>114 bpm</span>
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">TRANSIT SPEED</div>
                      <div className="text-base font-bold text-blue-400 tabular-nums">58 km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Hospital Preparedness Status */}
              <div className="flex items-center justify-between text-xs p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Victoria Trauma Center</span>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Bay #02 Locked & Ready
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
