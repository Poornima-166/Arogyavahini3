import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const ImpactMetrics: React.FC = () => {
  const { t } = useLanguage();

  const metrics = [
    {
      value: t('metric1Value', '-42%'),
      label: t('metric1Label', 'Average Transit Delay Reduction'),
      sub: t('metric1Sub', 'Benchmarked across urban corridor intersections'),
      color: 'text-red-600 dark:text-red-400',
    },
    {
      value: t('metric2Value', '98.6%'),
      label: t('metric2Label', 'Green Corridor Signal Clearance'),
      sub: t('metric2Sub', 'Automated IoT preemption 400m before intersection'),
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      value: t('metric3Value', '12 min'),
      label: t('metric3Label', 'Pre-Arrival Hospital Trauma Notice'),
      sub: t('metric3Sub', 'Live patient vitals & ER bay locked before arrival'),
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: t('metric4Value', '+34%'),
      label: t('metric4Label', 'Golden Hour Survival Improvement'),
      sub: t('metric4Sub', 'Critical trauma & cardiac response clinical impact'),
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Metric Strip Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Clinical & Transit Impact Proof
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Data-Backed Efficiency Across the Emergency Lifecycle
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Field metrics synthesized from connected emergency pilot test corridors
          </div>
        </div>

        {/* 4-Column Grid with Tabular Numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums mb-2 ${m.color}`}>
                  {m.value}
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-1">
                  {m.label}
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                {m.sub}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
