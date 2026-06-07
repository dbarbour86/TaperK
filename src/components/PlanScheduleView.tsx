import React, { useState } from 'react';
import { DayPlan, SetupData } from '../types';
import { formatDateString } from '../utils/planGenerator';
import { Calendar, HelpCircle, Pencil, Check, Sliders, PlayCircle } from 'lucide-react';

interface PlanScheduleViewProps {
  taperPlan: DayPlan[];
  setupData: SetupData;
  onUpdateTarget: (dayNumber: number, grams: number) => void;
  onEditSettings: () => void;
}

export default function PlanScheduleView({
  taperPlan,
  setupData,
  onUpdateTarget,
  onEditSettings,
}: PlanScheduleViewProps) {
  // Local track of which day is being manually edited
  const [editingDayNum, setEditingDayNum] = useState<number | null>(null);
  const [tempVal, setTempVal] = useState<string>('');
  const [expandedWeek, setExpandedWeek] = useState<number>(0);

  // Group plan days into weeks (7 days each)
  const weeks: DayPlan[][] = [];
  for (let i = 0; i < taperPlan.length; i += 7) {
    weeks.push(taperPlan.slice(i, i + 7));
  }

  const startEdit = (dayPlan: DayPlan) => {
    setEditingDayNum(dayPlan.dayNumber);
    setTempVal(dayPlan.targetGrams.toString());
  };

  const saveEdit = (dayNumber: number) => {
    const val = parseFloat(tempVal);
    if (!isNaN(val) && val >= 0) {
      onUpdateTarget(dayNumber, val);
    }
    setEditingDayNum(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <h2 id="schedule-header" className="text-2xl font-bold font-display text-brand-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-400" />
            Taper Schedule
          </h2>
          <p className="text-xs text-brand-300/80">
            A flexible guideline. Adjust daily limits at any time to match your physical comfort.
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="bg-brand-950/40 border border-brand-900/50 p-4 rounded-2xl flex items-center justify-between text-xs">
        <div className="space-y-1">
          <span className="text-brand-300/60 uppercase text-[9px] font-mono leading-none block">Core Approach</span>
          <span className="font-bold text-brand-200 block">
            {setupData.goal === 'quit' ? 'Quit completely' : `Reduce to ${setupData.targetAmount}g`}
          </span>
        </div>
        <button
          onClick={onEditSettings}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-brand-900/40 hover:bg-brand-900 border border-brand-800 text-brand-300 rounded-xl transition text-xs font-semibold"
        >
          <Sliders className="w-3.5 h-3.5 text-brand-400" />
          <span>Adjust Setup</span>
        </button>
      </div>

      {/* Week-by-week calendar */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-brand-200">Reduction Calendar</h3>
        
        <div className="space-y-2.5">
          {weeks.map((weekDays, weekIdx) => {
            const isExpanded = expandedWeek === weekIdx;
            const weekStartDay = weekDays[0].dayNumber;
            const weekEndDay = weekDays[weekDays.length - 1].dayNumber;
            const targetForWeek = weekDays[0].targetGrams;

            return (
              <div
                key={weekIdx}
                className="bg-brand-950/20 border border-brand-900/50 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                {/* Week Selector Tab */}
                <button
                  type="button"
                  onClick={() => setExpandedWeek(isExpanded ? -1 : weekIdx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between bg-brand-950/40 border-b border-brand-900/20 hover:bg-brand-900/10 transition-colors text-left font-sans"
                >
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-brand-100">
                      Week {weekIdx + 1}
                    </span>
                    <span className="text-[10px] text-brand-300/50 font-mono">
                      Days {weekStartDay} - {weekEndDay} • {formatDateString(weekDays[0].dateStr)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono text-brand-350">
                      {targetForWeek}g/day
                    </span>
                    <span className="text-[11px] text-brand-300/40">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                  </div>
                </button>

                {/* Day Rows */}
                {isExpanded && (
                  <div className="p-3 bg-brand-950/50 divide-y divide-brand-900/20">
                    {weekDays.map((day) => {
                      const isEditing = editingDayNum === day.dayNumber;
                      const isTodayStr = day.dateStr === new Date().toISOString().split('T')[0];

                      return (
                        <div
                          key={day.dayNumber}
                          className={`py-3 px-1 flex items-center justify-between gap-4 font-mono text-xs rounded-lg ${
                            isTodayStr ? 'bg-brand-900/10 border border-brand-500/20 px-2' : ''
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-brand-300 font-bold text-[11px]">
                                Day {day.dayNumber}
                              </span>
                              {isTodayStr && (
                                <span className="bg-brand-500 text-brand-950 font-sans font-bold text-[8px] px-1.5 py-0.2 rounded uppercase">
                                  Today
                                </span>
                              )}
                            </div>
                            <span className="text-brand-300/45 font-sans text-[10px] block">
                              {formatDateString(day.dateStr)}
                            </span>
                          </div>

                          {/* Interactive adjust input or layout details */}
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={tempVal}
                                onChange={(e) => setTempVal(e.target.value)}
                                className="w-16 bg-brand-950 border border-brand-400 rounded px-2 py-1 text-center font-bold text-brand-100 text-xs"
                                aria-label="Enter target grams"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEdit(day.dayNumber)}
                                className="p-1 bg-emerald-500 hover:bg-emerald-400 text-brand-950 rounded transition"
                                title="Save change"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(day)}
                              className="flex items-center gap-2 group py-1 px-2.5 rounded hover:bg-brand-900/60 border border-transparent hover:border-brand-900/40 text-left transition-all"
                              title="Click to edit limit"
                            >
                              <span className="font-bold text-brand-150 text-sm">
                                {day.targetGrams}g
                              </span>
                              <Pencil className="w-3 h-3 text-brand-305 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          )}
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

    </div>
  );
}
