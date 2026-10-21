import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RotateCcw, FastForward, Bell, ShieldCheck, Zap } from 'lucide-react';

interface IntersectionNode {
  id: number;
  name: string;
  distanceMeters: number;
  normalCycle: 'RED' | 'GREEN' | 'AMBER';
  preemptedPhase: 'RED' | 'PREEMPTED_GREEN' | 'AMBER_CLEAR' | 'PASSED_NORMAL';
  countdownSec: number;
}

export const GreenCorridorSimulator: React.FC = () => {
  const { t } = useLanguage();

  const initialIntersections: IntersectionNode[] = [
    {
      id: 1,
      name: 'MG Road Junction',
      distanceMeters: 400,
      normalCycle: 'RED',
      preemptedPhase: 'PREEMPTED_GREEN',
      countdownSec: 28,
    },
    {
      id: 2,
      name: 'Brigade Crossway',
      distanceMeters: 900,
      normalCycle: 'RED',
      preemptedPhase: 'PREEMPTED_GREEN',
      countdownSec: 54,
    },
    {
      id: 3,
      name: 'Residency Flyover Entry',
      distanceMeters: 1400,
      normalCycle: 'GREEN',
      preemptedPhase: 'AMBER_CLEAR',
      countdownSec: 72,
    },
    {
      id: 4,
      name: 'Victoria Trauma ER Gate',
      distanceMeters: 2000,
      normalCycle: 'RED',
      preemptedPhase: 'PREEMPTED_GREEN',
      countdownSec: 96,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0); // 0 to 4
  const [sirenActive, setSirenActive] = useState(true);

  const totalDistance = 2000;
  const currentDistance = currentStep * 500;
  const progressPercent = Math.min(100, Math.round((currentDistance / totalDistance) * 100));

  const handleAdvance = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const getNodeState = (nodeIndex: number) => {
    if (currentStep > nodeIndex) {
      return {
        label: 'CLEARED & RESTORED',
        color: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
        signal: 'NORMAL_CYCLE',
      };
    }
    if (currentStep === nodeIndex) {
      return {
        label: sirenActive ? 'ACTIVE GREEN WAVE' : 'CONGESTED RED (SIREN OFF)',
        color: sirenActive
          ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
          : 'bg-red-500 text-white',
        signal: sirenActive ? 'GREEN_PREEMPT' : 'RED_STOP',
      };
    }
    if (currentStep + 1 === nodeIndex) {
      return {
        label: sirenActive ? 'PREEMPTION WARNING (400m)' : 'NORMAL CYCLING',
        color: sirenActive
          ? 'bg-amber-500 text-slate-950 font-bold'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
        signal: sirenActive ? 'AMBER_HOLD' : 'NORMAL_CYCLE',
      };
    }
    return {
      label: 'NORMAL CITY CYCLE',
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
      signal: 'NORMAL_CYCLE',
    };
  };

  return (
    <section id="simulator" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            V2X IoT Traffic Engineering
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            {t('simHeading', 'Interactive Green Corridor Preemption Simulator')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t(
              'simSubheading',
              'Test how smart traffic lights synchronize into a green wave along an urban arterial road as an ambulance navigates through intersections.'
            )}
          </p>
        </div>

        {/* Simulator Dashboard Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
          
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Simulation Unit: ALS-Corridor-01
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Route: Trinity Circle $\longrightarrow$ Victoria Trauma Center (2.0 km)
                </div>
              </div>
            </div>

            {/* Interactive Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSirenActive(!sirenActive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  sirenActive
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${sirenActive ? 'animate-bounce' : ''}`} />
                <span>Emergency Siren / V2X Preemption: {sirenActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleAdvance}
                disabled={currentStep >= 4}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{currentStep >= 4 ? 'Destination Reached' : 'Advance to Next Node'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Road Visualizer Strip */}
          <div className="relative mb-10 py-6 px-4 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-white font-mono">
            {/* Ambient street lights & road marks */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
            
            {/* The Road Line */}
            <div className="relative z-10">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>Trinity Dispatch Base (0m)</span>
                <span className="text-emerald-400 font-bold">Progress: {progressPercent}% ({currentDistance}m / {totalDistance}m)</span>
                <span>Victoria ER (2000m)</span>
              </div>

              {/* Highway progress bar */}
              <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>

              {/* Ambulance vehicle marker */}
              <div className="flex justify-between items-center mt-3 text-[11px]">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SPEED: <strong className="text-white">{sirenActive ? '58 km/h' : '18 km/h (Traffic Delayed)'}</strong></span>
                </div>
                <div className="text-slate-400">
                  TIME SAVED WITH PREEMPTION: <strong className="text-emerald-400 font-bold tabular-nums">06 MIN 40 SEC</strong>
                </div>
              </div>
            </div>
          </div>

          {/* The 4 Intersections Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {initialIntersections.map((node, idx) => {
              const state = getNodeState(idx);
              return (
                <div
                  key={node.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span>NODE #{node.id}</span>
                      <span>{node.distanceMeters}m</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                      {node.name}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-mono font-bold ${state.color}`}>
                      {state.label}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      {currentStep === idx
                        ? 'Emergency vehicle currently traversing intersection'
                        : currentStep < idx
                        ? `Preemption window arming in ${Math.max(0, (idx - currentStep) * 35)}s`
                        : 'Vehicle passed. Returned to municipal cycle'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Note */}
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Simulated preemption demonstrates how IoT-enabled controllers calculate vehicle trajectory and clear traffic before arrival.
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              V2X IEEE 802.11p / DSRC Standard
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
