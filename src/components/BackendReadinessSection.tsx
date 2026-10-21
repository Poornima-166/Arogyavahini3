import React from 'react';
import { PLANNED_DATABASE_SCHEMA } from '../data/architectureData';
import { Database, Server, Link, ShieldCheck, Check } from 'lucide-react';

export const BackendReadinessSection: React.FC = () => {
  return (
    <section id="architecture" className="py-16 md:py-24 border-t border-red-100 dark:border-red-950/60 bg-white dark:bg-black transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">
              Clean Engineering Architecture
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              PostgreSQL & Full-Stack Schema Blueprint
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 max-w-md font-mono">
            All TypeScript types, database models, and role schemas are structured for direct PostgreSQL persistence and real-time WebSocket broadcasting.
          </div>
        </div>

        {/* Database Entities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {PLANNED_DATABASE_SCHEMA.map((table, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-red-950/80 bg-white dark:bg-zinc-950 shadow-md dark:shadow-[0_0_25px_rgba(220,38,38,0.1)] flex flex-col justify-between group hover:border-red-500/50 transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-red-950/60">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      public.{table.table}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded">
                    TABLE #{idx + 1}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3">
                  {table.description}
                </p>

                <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-black p-2.5 rounded-xl border border-slate-200 dark:border-red-950/60">
                  {table.columns.map((col, cIdx) => (
                    <div key={cIdx} className="truncate">
                      · {col}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-red-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Primary Key: UUID</span>
                <span className="text-red-600 dark:text-red-400 font-bold">Indexed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Checklist Strip */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-red-950/80 bg-white dark:bg-zinc-950 shadow-md text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Express & PostgreSQL REST API
                </div>
                <div className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Clean endpoints with JWT token authentication, role validation middleware, and live SQL database connectivity.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Link className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Bi-Directional Telemetry Broadcasting
                </div>
                <div className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Engineered for live coordination linking ambulance vital sensors, traffic preemption loops, and emergency trauma ERs.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  Multi-Role Security & Governance
                </div>
                <div className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Role-based access control protecting Citizen, Driver, Hospital, and Admin actions with audit trails.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
