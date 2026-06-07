import React, { useState } from 'react';
import { SetupData, DayPlan } from '../types';
import { formatDateString, calculateWeeklyReductionRate, getEstimatedFinishDate } from '../utils/planGenerator';
import { ShieldAlert, Info, Check, ArrowLeft, Calendar, HelpCircle, Dumbbell, Sparkles } from 'lucide-react';

interface PlanGeneratorScreenProps {
  setupData: SetupData;
  initialPlan: DayPlan[];
  onBack: () => void;
  onActivate: (finalPlan: DayPlan[]) => void;
}

export default function PlanGeneratorScreen({ setupData, initialPlan, onBack, onActivate }: PlanGeneratorScreenProps) {
  // Local state lets the user fine-tune targets before activating the plan
  const [planDays, setPlanDays] = useState<DayPlan[]>(initialPlan);
  const [expandedWeek, setExpandedWeek] = useState<number>(0); // Default expand first week

  const weeklyReduction = calculateWeeklyReductionRate(setupData);
  const finishDateStr = formatDateString(planDays[planDays.length - 1]?.dateStr || setupData.startDate);

  // Group plan days into weeks (each week has 7 days)
  const weeks: DayPlan[][] = [];
  for (let i = 0; i < planDays.length; i += 7) {
    weeks.push(planDays.slice(i, i + 7));
  }

  // Handle manual day edit
  const handleTargetChange = (dayNumber: number, newVal: string) => {
    let roundedVal = parseFloat(newVal);
    if (isNaN(roundedVal) || roundedVal < 0) {
      roundedVal = 0;
    }
    setPlanDays(prev =>
      prev.map(day =>
        day.dayNumber === dayNumber
          ? { ...day, targetGrams: Math.round(roundedVal * 10) / 10 }
          : day
      )
    );
  };

  const isHighPotency = setupData.productType === 'extract' || setupData.productType === '7-OH / enhanced';

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 rounded-lg hover:bg-brand-900/30 text-brand-300 transition-colors"
          title="Back to setup"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 id="generator-header" className="text-xl font-bold font-display text-brand-100">
            Review Your Blueprint
          </h2>
          <p className="text-xs text-brand-300/80">
            This is an customizable example blueprint. Change any target daily limit.
          </p>
        </div>
      </div>

      {/* Warning if concentrated extract or 7-OH / enhanced product */}
      {isHighPotency && (
        <div id="high-potency-warning" className="bg-red-950/20 border border-red-900/40 p-5 rounded-2xl space-y-3">
          <div className="flex items-start gap-2 text-red-300 font-semibold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3>Concentrated Alkaloids Warning</h3>
              <p className="text-xs text-red-300/80 font-normal mt-1">
                You selected <strong>{setupData.productType}</strong>. Concentrated extracts or purified 7-OH products possess substantial chemical potency compared to raw leaf.
              </p>
            </div>
          </div>
          <p className="text-xs text-red-200/70 leading-relaxed pl-7">
            Consider medical support. Extracts and 7-OH products are stronger, have unpredictable pharmacokinetics, and may be harder to taper than raw powder. Transitioning to standard powder first with a doctor's guidance might assist.
          </p>
        </div>
      )}

      {/* Plan stats summary card */}
      <div id="plan-summary-card" className="bg-brand-950/50 border border-brand-900/60 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider">Example Plan Metrics</h3>
          <span className="text-[10px] bg-brand-500/15 text-brand-300 px-2 py-0.5 rounded font-mono uppercase">
            {setupData.pace} speed
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-950/60 p-3 rounded-xl border border-brand-900/30">
            <span className="block text-[10px] text-brand-300/60 uppercase">Starting Daily</span>
            <span className="text-xl font-extrabold font-mono text-brand-200">{setupData.startAmount}g</span>
          </div>
          <div className="bg-brand-950/60 p-3 rounded-xl border border-brand-900/30">
            <span className="block text-[10px] text-brand-300/60 uppercase">Weekly Reduction</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400">-{weeklyReduction}g</span>
          </div>
          <div className="bg-brand-950/60 p-3 rounded-xl border border-brand-900/30">
            <span className="block text-[10px] text-brand-300/60 uppercase">Goal Destination</span>
            <span className="text-xl font-extrabold font-mono text-brand-200">
              {setupData.goal === 'quit' ? '0g (Quit)' : `${setupData.targetAmount}g`}
            </span>
          </div>
          <div className="bg-brand-950/60 p-3 rounded-xl border border-brand-900/30">
            <span className="block text-[10px] text-brand-300/60 uppercase">Duration & Est. Finish</span>
            <span className="text-xs font-bold text-brand-100 flex flex-col pt-0.5">
              <span>{planDays.length} days</span>
              <span className="text-[10px] text-brand-300/50 font-normal">{finishDateStr}</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-start bg-brand-900/10 border border-brand-900/40 p-3 rounded-xl">
          <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-brand-300/80 leading-relaxed">
            Reducing kratom too rapidly can produce intense cravings, restlessness, and stomach upset. If you feel severe symptoms, pause your reductions, hold your current dose, or increase slightly, and talk with a physician.
          </p>
        </div>
      </div>

      {/* Interactive day-by-day manual adjuster list separated by weeks */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-200">Adjust Taper Schedule</h3>
        <p className="text-[11px] text-brand-300/60">
          Click any week to expand and manually tweak the daily dosage caps to fit your specific needs.
        </p>

        <div className="space-y-2">
          {weeks.map((weekDays, weekIdx) => {
            const isExpanded = expandedWeek === weekIdx;
            const weekStartDay = weekDays[0].dayNumber;
            const weekEndDay = weekDays[weekDays.length - 1].dayNumber;
            const targetForWeek = weekDays[0].targetGrams;

            return (
              <div
                key={weekIdx}
                className="bg-brand-950/20 border border-brand-900/40 rounded-xl overflow-hidden transition-all"
              >
                {/* Week Header Selector Accordion */}
                <button
                  type="button"
                  onClick={() => setExpandedWeek(isExpanded ? -1 : weekIdx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between bg-brand-950/40 border-b border-brand-900/20 hover:bg-brand-900/10 transition-colors text-left"
                >
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-brand-200">
                      Week {weekIdx + 1}
                    </span>
                    <span className="text-[10px] text-brand-300/50 font-mono">
                      Days {weekStartDay} - {weekEndDay} • {formatDateString(weekDays[0].dateStr)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-brand-300">
                      {targetForWeek}g/day
                    </span>
                    <span className="text-xs text-brand-300/40">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                </button>

                {/* Day listings in week */}
                {isExpanded && (
                  <div className="p-3 bg-brand-950/60 divide-y divide-brand-900/20">
                    {weekDays.map((day) => {
                      const displayDate = formatDateString(day.dateStr);
                      return (
                        <div
                          key={day.dayNumber}
                          className="py-2.5 flex items-center justify-between gap-4 font-mono text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="text-brand-300 font-semibold block text-[11px]">
                              Day {day.dayNumber}
                            </span>
                            <span className="text-brand-300/50 font-sans text-[10px]">
                              {displayDate}
                            </span>
                          </div>
                          
                          {/* target editor */}
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={day.targetGrams}
                              onChange={(e) => handleTargetChange(day.dayNumber, e.target.value)}
                              className="w-16 bg-brand-950 border border-brand-800 rounded px-2 py-1 text-center font-bold text-brand-100 focus:border-brand-400 outline-none transition text-xs"
                              aria-label={`Target grams for Day ${day.dayNumber}`}
                            />
                            <span className="text-[10px] text-brand-300/60 uppercase">grams</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Activation Button */}
      <div className="pt-4 space-y-2">
        <button
          id="btn-activate-plan"
          onClick={() => onActivate(planDays)}
          className="w-full py-4 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-extrabold tracking-wide transition-all shadow-lg hover:shadow-brand-500/10 cursor-pointer flex items-center justify-center gap-2 text-center text-base"
        >
          <Check className="w-5 h-5" />
          <span>Save & Activate Plan</span>
        </button>
        <p className="text-[10px] text-brand-300/40 text-center leading-relaxed">
          You can edit individual targets or restart/reset the setup at any time during your taper journey.
        </p>
      </div>
    </div>
  );
}
