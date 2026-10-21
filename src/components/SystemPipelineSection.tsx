import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SYSTEM_PILLARS } from '../data/architectureData';
import { Radio, Navigation2, Cpu, Hospital, CheckCircle2 } from 'lucide-react';

export const SystemPipelineSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const getIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Radio className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 1:
        return <Navigation2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 2:
        return <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 3:
      default:
        return <Hospital className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <section id="technology" className="py-16 md:py-24 border-t border-red-100 dark:border-red-950/60 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
            Intelligent Transit Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {t('pipelineHeading', 'AI-Assisted Emergency Transit Architecture')}
          </h2>
          <p className="text-slate-600 dark:text-zinc-300 text-base sm:text-lg">
            {t(
              'pipelineSubheading',
              'How ArogyaVahini orchestrates end-to-end synchronization within seconds of an emergency call.'
            )}
          </p>
        </div>

        {/* 4 Steps Interactive Pipeline Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {SYSTEM_PILLARS.map((pillar, idx) => (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                activeStep === idx
                  ? 'border-red-600 dark:border-red-500 bg-red-50/60 dark:bg-zinc-950 text-red-950 dark:text-white shadow-md glow-red-sm'
                  : 'border-slate-200 dark:border-red-950/50 hover:border-red-300 dark:hover:border-red-900/80 bg-white dark:bg-zinc-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                  {pillar.number}
                </span>
                {getIcon(idx)}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">
                {pillar.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {pillar.tagline}
              </div>
            </button>
          ))}
        </div>

        {/* Detailed Breakdown for Active Step */}
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-red-950/80 bg-white dark:bg-zinc-950 shadow-md dark:shadow-[0_0_35px_rgba(220,38,38,0.12)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 cols: Descriptive summary & technical workflow */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-red-600 text-white glow-red-sm">
                  STEP {SYSTEM_PILLARS[activeStep].number}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  {SYSTEM_PILLARS[activeStep].tagline}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                {SYSTEM_PILLARS[activeStep].title}
              </h3>

              <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-6">
                {SYSTEM_PILLARS[activeStep].summary}
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Technical Execution Sequence
                </div>
                {SYSTEM_PILLARS[activeStep].technicalFlow.map((flowStep, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                    <span>{flowStep}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 cols: Key Specifications Grid */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-black p-6 rounded-xl border border-slate-200 dark:border-red-950/60">
              <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-4">
                System Engineering Parameters
              </div>
              <div className="space-y-4">
                {SYSTEM_PILLARS[activeStep].keySpecs.map((spec, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 text-xs">
                    <span className="text-slate-600 dark:text-zinc-400 font-medium">
                      {spec.label}
                    </span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 tabular-nums">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-300">
                <span className="font-bold">Inter-agency Link:</span> Synchronized through unified REST API & WebSockets linking Municipal Traffic Controllers and Hospital Trauma Bay monitors.
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
