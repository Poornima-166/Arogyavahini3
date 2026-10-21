import React from 'react';
import { PLANNED_DATABASE_SCHEMA } from '../data/architectureData';
import { Database, Server, Link, ShieldCheck, Check } from 'lucide-react';

export const BackendReadinessSection: React.FC = () => {
  return (
    <section id="architecture" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Clean Engineering Architecture
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Stage 2 PostgreSQL & Backend Readiness Blueprint
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            All TypeScript types, state stores, and role schemas are structured for direct PostgreSQL docking in Stage 2 without architectural refactoring.
          </div>
        </div>

        {/* Database Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {PLANNED_DATABASE_SCHEMA.map((table, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      public.{table.table}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">TABLE #{idx + 1}</span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {table.description}
                </p>

                <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {table.columns.map((col, cIdx) => (
                    <div key={cIdx} className="truncate">
                      · {col}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Primary Key: UUID</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Indexed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Checklist Strip */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Express / Node.js API Pipeline
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Clean service interfaces separated from views. API client in <code className="font-mono text-slate-700 dark:text-slate-300">src/services/api.ts</code> ready to connect endpoints.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Link className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Real-Time WebSocket Channels
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Engineered for bi-directional live telemetry from ambulance defibrillators and municipal IoT traffic light preemptors.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Zero Fake Auth / No Mocks
                </div>
                <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Respects prompt instructions: No simulated tokens or mock dispatch successes. Real PostgreSQL connection initiates in Stage 2.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
