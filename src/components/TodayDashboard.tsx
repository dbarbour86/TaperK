import React, { useState } from 'react';
import { SetupData, DayPlan, DoseLog, SymptomCheckIn, ProductType } from '../types';
import { formatDateString } from '../utils/planGenerator';
import {
  Plus,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Smile,
  Activity,
  Calendar,
  Frown,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  History,
  Trash2,
  Moon
} from 'lucide-react';

interface TodayDashboardProps {
  setupData: SetupData;
  activeDayInfo: {
    dayNumber: number;
    targetGrams: number;
    notStarted?: boolean;
    isOver?: boolean;
  } | null;
  todayLogs: DoseLog[];
  todayCheckIn: SymptomCheckIn | null;
  streak: number;
  onAddDose: (amount: number, type: ProductType | string, notes?: string) => void;
  onDeleteDose: (id: string) => void;
  onAddSymptom: (symptoms: Omit<SymptomCheckIn, 'id' | 'timestamp' | 'dateStr'>) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function TodayDashboard({
  setupData,
  activeDayInfo,
  todayLogs,
  todayCheckIn,
  streak,
  onAddDose,
  onDeleteDose,
  onAddSymptom,
  onNavigateToTab,
}: TodayDashboardProps) {
  // UI states
  const [showDoseForm, setShowDoseForm] = useState(false);
  const [showSymptomForm, setShowSymptomForm] = useState(false);

  // Quick states for dose logging
  const [doseAmount, setDoseAmount] = useState<string>(
    (Math.round((setupData.startAmount / setupData.dosesPerDay) * 10) / 10).toString()
  );
  const [doseType, setDoseType] = useState<string>(setupData.productType);
  const [doseNotes, setDoseNotes] = useState('');

  // States for symptom/welfare tracking
  const [symptomAnxiety, setSymptomAnxiety] = useState(0);
  const [symptomRestlessness, setSymptomRestlessness] = useState(0);
  const [symptomSleepIssues, setSymptomSleepIssues] = useState(0);
  const [symptomStomachIssues, setSymptomStomachIssues] = useState(0);
  const [symptomChills, setSymptomChills] = useState(0);
  const [symptomPain, setSymptomPain] = useState(0);
  const [symptomMood, setSymptomMood] = useState(5); // 0-10 with 5 as neutral
  const [symptomCravings, setSymptomCravings] = useState(5);
  const [symptomSleepQuality, setSymptomSleepQuality] = useState(5);
  const [symptomNotes, setSymptomNotes] = useState('');

  const todayTarget = activeDayInfo?.targetGrams ?? setupData.targetAmount;
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount, 0);
  const totalRounded = Math.round(todayTotal * 10) / 10;
  const remainingTarget = Math.max(0, Math.round((todayTarget - totalRounded) * 10) / 10);

  const estimatedDoses = setupData.dosesPerDay;
  const loggedDosesCount = todayLogs.length;
  const dosesRemaining = Math.max(0, estimatedDoses - loggedDosesCount);

  const handleDoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(doseAmount);
    if (!isNaN(parsedAmount) && parsedAmount >= 0) {
      onAddDose(parsedAmount, doseType, doseNotes.trim() || undefined);
      // Reset form setup
      setDoseNotes('');
      setShowDoseForm(false);
    }
  };

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSymptom({
      anxiety: symptomAnxiety,
      restlessness: symptomRestlessness,
      sleepIssues: symptomSleepIssues,
      stomachIssues: symptomStomachIssues,
      sweatingChills: symptomChills,
      pain: symptomPain,
      mood: symptomMood,
      cravings: symptomCravings,
      sleepQuality: symptomSleepQuality,
      notes: symptomNotes.trim() || undefined,
    });
    setShowSymptomForm(false);
  };

  // Encouragement messages engine (non-judgmental, purely helpful)
  let statusColor = 'border-brand-500/20 bg-brand-950/40 text-brand-300';
  let encouragingText = 'Keep taking it one single day at a time.';

  if (totalRounded === 0) {
    encouragingText = 'No doses logged today yet. Ready when you are.';
    statusColor = 'border-brand-500/10 bg-brand-950/20 text-brand-400';
  } else if (totalRounded <= todayTarget) {
    encouragingText = 'You are following your plan. Beautifully done.';
    statusColor = 'border-emerald-500/30 bg-emerald-950/15 text-emerald-300';
  } else {
    // Exceeded target - strictly NO SHAME
    encouragingText = 'Logged. Tomorrow is still on the plan.';
    statusColor = 'border-amber-500/30 bg-amber-950/15 text-amber-300';
  }

  // Percentage bar calculated
  const targetPercent = todayTarget > 0 ? Math.min(100, (totalRounded / todayTarget) * 100) : 100;
  const barColor = totalRounded <= todayTarget ? 'bg-gradient-to-r from-brand-500 to-emerald-500' : 'bg-amber-500';

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      
      {/* Date & Plan day title */}
      <div className="flex justify-between items-center bg-brand-950/40 border border-brand-900/30 p-4 rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest font-mono">
            {formatDateString(new Date().toISOString().split('T')[0])}
          </span>
          <h2 id="plan-day-label" className="text-xl font-black font-display text-brand-100">
            {activeDayInfo?.notStarted ? 'Plan Preparing' : `Day ${activeDayInfo?.dayNumber || 1}`}
            {activeDayInfo?.isOver && ' • Plan Complete'}
          </h2>
        </div>
        
        {/* Streak element */}
        <div id="streak-indicator" className="bg-brand-900/60 border border-brand-700/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
          <Flame className={`w-5 h-5 ${streak > 0 ? 'text-amber-400 fill-amber-400/20' : 'text-brand-500/70'}`} />
          <div className="text-right">
            <span className="block text-xs text-brand-300 leading-none">Streak</span>
            <span className="text-sm font-extrabold font-mono text-brand-100">{streak} {streak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
      </div>

      {/* Target Large Dashboard Stat circle-equivalent display */}
      <div id="target-intake-card" className="bg-brand-950/60 border border-brand-900/80 p-6 rounded-3xl space-y-5 text-center relative overflow-hidden shadow-xl">
        
        {/* Underlay glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <span className="text-xs text-brand-300 font-medium uppercase tracking-wider">Today's Target Limit</span>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span id="target-grams-display" className="text-5xl font-extrabold font-display text-brand-100 tracking-tight">
              {todayTarget}
            </span>
            <span className="text-sm text-brand-300/80 font-semibold">grams</span>
          </div>
        </div>

        {/* Big numbers progress details */}
        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-brand-900/40">
          <div className="text-center py-2">
            <span className="block text-[10px] text-brand-300/60 uppercase">Intake Actual</span>
            <span id="actual-grams-display" className="text-2xl font-black font-mono text-brand-100">
              {totalRounded}g
            </span>
          </div>
          <div className="text-center py-2 border-l border-brand-900/40">
            <span className="block text-[10px] text-brand-300/60 uppercase">Remaining Cap</span>
            <span className="text-2xl font-black font-mono text-brand-300">
              {remainingTarget}g
            </span>
          </div>
        </div>

        {/* Visual Progress bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-[10px] text-brand-300/60 font-mono">
            <span>Used: {Math.round(targetPercent)}% of cap</span>
            <span>Target: {todayTarget}g</span>
          </div>
          <div className="w-full bg-brand-900/50 rounded-full h-3.5 border border-brand-900/20 overflow-hidden p-[2px]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${targetPercent}%` }}
              aria-label={`Progress progress`}
            ></div>
          </div>
        </div>

        {/* Non-judgmental encouragement banners */}
        <div className={`p-3.5 border rounded-xl text-xs font-medium text-left ${statusColor}`}>
          <p className="leading-relaxed">{encouragingText}</p>
        </div>
      </div>

      {/* Primary Action Fast Logs Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-log-dose-modal"
          onClick={() => {
            setShowDoseForm(!showDoseForm);
            setShowSymptomForm(false);
          }}
          className={`py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-sm shadow-md border ${
            showDoseForm 
              ? 'bg-brand-400 hover:bg-brand-300 text-brand-950 border-brand-300' 
              : 'bg-brand-500 hover:bg-brand-400 text-brand-950 border-brand-400'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Log a Dose</span>
        </button>

        <button
          id="btn-symptom-checkin-modal"
          onClick={() => {
            setShowSymptomForm(!showSymptomForm);
            setShowDoseForm(false);
          }}
          className={`py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer text-sm shadow-md border ${
            showSymptomForm
              ? 'bg-brand-900/80 text-brand-100 border-brand-500/50'
              : 'bg-brand-900/40 hover:bg-brand-900/60 text-brand-200 border-brand-950'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Symptom Check-In</span>
        </button>
      </div>

      {/* QUICK FORM: Log a Dose */}
      {showDoseForm && (
        <form
          id="quick-dose-form"
          onSubmit={handleDoseSubmit}
          className="bg-brand-950/80 border border-brand-500/30 p-5 rounded-2xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-brand-900/40 pb-2">
            <h3 className="font-semibold text-brand-100 text-sm">Quick Add Dose Log</h3>
            <button
              type="button"
              className="text-xs text-brand-300 hover:text-white"
              onClick={() => setShowDoseForm(false)}
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-brand-300 uppercase font-semibold mb-1">
                Grams Used
              </label>
              <input
                id="dose-weight-input"
                type="number"
                step="0.05"
                min="0.05"
                value={doseAmount}
                onChange={(e) => setDoseAmount(e.target.value)}
                className="w-full bg-brand-950 border border-brand-800 rounded-lg px-3 py-2 text-sm text-brand-100 font-mono focus:border-brand-500 outline-none"
                placeholder="2.5"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-brand-300 uppercase font-semibold mb-1">
                Product Type
              </label>
              <select
                id="dose-type-input"
                value={doseType}
                onChange={(e) => setDoseType(e.target.value)}
                className="w-full bg-brand-950 border border-brand-800 rounded-lg px-2 py-2 text-xs text-brand-100 focus:border-brand-500 outline-none h-9"
              >
                <option value="powder">Powder</option>
                <option value="capsules">Capsules</option>
                <option value="extract">Extract</option>
                <option value="7-OH / enhanced">7-OH / Enhanced</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-brand-300 uppercase font-semibold mb-1">
              Short Note
            </label>
            <input
              id="dose-notes-input"
              type="text"
              value={doseNotes}
              onChange={(e) => setDoseNotes(e.target.value)}
              className="w-full bg-brand-950 border border-brand-800 rounded-lg px-3 py-2 text-xs text-brand-100 placeholder-brand-300/40 focus:border-brand-500 outline-none"
              placeholder="e.g. Morning, feeling okay"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-brand-950 text-xs font-bold rounded-lg cursor-pointer"
          >
            Record Dose
          </button>
        </form>
      )}

      {/* QUICK FORM: Symptom Check-In */}
      {showSymptomForm && (
        <form
          id="quick-symptom-form"
          onSubmit={handleSymptomSubmit}
          className="bg-brand-950/85 border border-brand-500/30 p-5 rounded-2xl space-y-4 shadow-xl text-left"
        >
          <div className="flex items-center justify-between border-b border-brand-900/40 pb-2">
            <h3 className="font-semibold text-brand-100 text-sm">Record Daily Symptoms & Cravings</h3>
            <button
              type="button"
              className="text-xs text-brand-300 hover:text-white"
              onClick={() => setShowSymptomForm(false)}
            >
              Close
            </button>
          </div>

          <p className="text-[10px] text-brand-300/70 leading-relaxed">
            Assess how you are currently feeling. Ratings are 0 (none) to 10 (extremely intense). Be completely honest with yourself. This information helps map tracks.
          </p>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2">
            
            {/* Craving Level */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200 font-medium">Craving Intensity</span>
                <span className="font-bold text-brand-400">{symptomCravings}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomCravings}
                onChange={(e) => setSymptomCravings(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Anxiety */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">Anxiety / Nervousness</span>
                <span className="font-bold text-brand-400">{symptomAnxiety}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomAnxiety}
                onChange={(e) => setSymptomAnxiety(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Restlessness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">RLS / Restlessness / Twitches</span>
                <span className="font-bold text-brand-400">{symptomRestlessness}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomRestlessness}
                onChange={(e) => setSymptomRestlessness(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Sleep issues & Quality combi */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">Sleep Quality (Higher count is Better)</span>
                <span className="font-bold text-brand-400">{symptomSleepQuality}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomSleepQuality}
                onChange={(e) => setSymptomSleepQuality(parseInt(e.target.value))}
                className="w-full accent-brand-400 h-1"
              />
            </div>

            {/* Chills / Sweating */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">Sweating / Hot Flashes / Chills</span>
                <span className="font-bold text-brand-400">{symptomChills}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomChills}
                onChange={(e) => setSymptomChills(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Stomach */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">GI / Stomach Upset / Nausea</span>
                <span className="font-bold text-brand-400">{symptomStomachIssues}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomStomachIssues}
                onChange={(e) => setSymptomStomachIssues(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Pain */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">Body Aches / Muscle Pain</span>
                <span className="font-bold text-brand-400">{symptomPain}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomPain}
                onChange={(e) => setSymptomPain(parseInt(e.target.value))}
                className="w-full accent-brand-500 h-1"
              />
            </div>

            {/* Mood */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-brand-200">Overall Mood (Higher count is Cheerier)</span>
                <span className="font-bold text-brand-400">{symptomMood}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={symptomMood}
                onChange={(e) => setSymptomMood(parseInt(e.target.value))}
                className="w-full accent-brand-400 h-1"
              />
            </div>

            {/* Text description notes */}
            <div>
              <label className="block text-xs font-semibold text-brand-300 uppercase mb-1">
                Symptom Notes / Log thoughts
              </label>
              <textarea
                value={symptomNotes}
                onChange={(e) => setSymptomNotes(e.target.value)}
                className="w-full bg-brand-950 border border-brand-800 rounded-lg px-3 py-2 text-xs text-brand-100 placeholder-brand-300/40 focus:border-brand-500 outline-none h-16 resize-none"
                placeholder="e.g. Slight headache, but RLS is manageable today."
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-brand-950 text-xs font-bold rounded-lg cursor-pointer"
          >
            Save Check-In
          </button>
        </form>
      )}

      {/* Welfare / Symptom Check status readout */}
      {todayCheckIn ? (
        <div id="check-in-accomplished" className="bg-brand-950/20 border border-emerald-950/40 p-4 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-brand-300">You logged symptom reports today.</span>
          </div>
          <button
            onClick={() => setShowSymptomForm(true)}
            className="text-brand-400 hover:underline text-[11px] font-semibold"
          >
            Update check-in
          </button>
        </div>
      ) : (
        <div id="check-in-missing" className="bg-brand-950/10 border border-brand-900/30 p-4 rounded-2xl flex items-center justify-between text-xs">
          <span className="text-brand-300/70">No daily welfare recorded yet. Take 30 seconds:</span>
          <button
            onClick={() => setShowSymptomForm(true)}
            className="text-brand-400 hover:brightness-110 font-bold flex items-center"
          >
            Complete Check-In <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TODAYS LOGGED DOSE ENTRIES LIST */}
      <div id="logs-history-section" className="bg-brand-950/40 border border-brand-900/40 p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand-400" />
            <h3 className="font-bold text-sm text-brand-200">Today's Logged Doses</h3>
          </div>
          <span className="text-[10px] font-mono text-brand-300/60 font-semibold bg-brand-950 border border-brand-900/50 px-2 py-0.5 rounded-full">
            Count: {loggedDosesCount} / {estimatedDoses} proj.
          </span>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-brand-900/40 rounded-xl bg-brand-950/20">
            <p className="text-xs text-brand-300/50">Doses you log today will be tracked here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {todayLogs.map((log) => {
              // local ISO time format
              const logTime = new Date(log.timestamp).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="flex justify-between items-center bg-brand-950 p-3 rounded-xl border border-brand-900/30 group"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold font-mono text-brand-200">{log.amount}g</span>
                      <span className="text-[9px] bg-brand-900/60 text-brand-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold font-mono">
                        {log.productType}
                      </span>
                      <span className="text-[10px] text-brand-300/40 font-mono">{logTime}</span>
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-brand-300/70 italic leading-relaxed break-words">
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteDose(log.id)}
                    className="p-1.5 rounded-lg hover:bg-brand-900 text-brand-300/50 hover:text-red-400 transition"
                    title="Delete custom entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips educational card */}
      <div id="dashboard-educational-footer" className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl flex gap-3">
        <div className="bg-brand-900/30 border border-brand-600/20 w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          <BrainCircuit className="w-4 h-4 text-brand-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-brand-200">Consistency Matters</h4>
          <p className="text-[11px] text-brand-300/70 leading-relaxed font-sans">
            By keeping logged doses spaced evenly, you prevent rapid peak-and-trough plasma levels, which is the key mechanism behind reducing withdrawals safely. Sleep can be improved by reserving the last small dose 1-2 hours before bed.
          </p>
        </div>
      </div>

    </div>
  );
}
