import { DoseLog, SymptomCheckIn, SetupData, DayPlan } from '../types';
import { formatDateString } from '../utils/planGenerator';
import {
  TrendingDown,
  Activity,
  Flame,
  Award,
  Calendar,
  Frown,
  Smile,
  AlertCircle,
  HelpCircle,
  Heart,
  Moon
} from 'lucide-react';

interface ProgressChartsScreenProps {
  setupData: SetupData;
  taperPlan: DayPlan[];
  doseLogs: DoseLog[];
  symptomCheckIns: SymptomCheckIn[];
  streak: number;
}

export default function ProgressChartsScreen({
  setupData,
  taperPlan,
  doseLogs,
  symptomCheckIns,
  streak,
}: ProgressChartsScreenProps) {
  
  // Calculate stats
  const startAmount = setupData.startAmount;
  
  // Get unique check-in/dose days logged
  const loggedDates = new Set<string>();
  doseLogs.forEach(d => loggedDates.add(d.dateStr));
  symptomCheckIns.forEach(s => loggedDates.add(s.dateStr));

  // Average cravings & sleep
  const avgCravings = symptomCheckIns.length > 0 
    ? Math.round((symptomCheckIns.reduce((sum, s) => sum + s.cravings, 0) / symptomCheckIns.length) * 10) / 10
    : 0;

  const avgSleep = symptomCheckIns.length > 0 
    ? Math.round((symptomCheckIns.reduce((sum, s) => sum + s.sleepQuality, 0) / symptomCheckIns.length) * 10) / 10
    : 0;

  // Total reduction since start
  // Let's look at the current day's target (or yesterday's typical used vs startup)
  // Let's compute actual average used in the last 3 days
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTarget = taperPlan.find(p => p.dateStr === todayStr)?.targetGrams ?? setupData.targetAmount;
  const currentReduction = Math.max(0, Math.round((startAmount - todayTarget) * 10) / 10);
  const reductionPercent = startAmount > 0 ? Math.round((currentReduction / startAmount) * 100) : 0;

  // Let's calculate best streak
  // Read dates, sort, count max consecutive streak
  const sortedDates = Array.from(loggedDates).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  
  let bestStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  sortedDates.forEach((dateStr) => {
    const curDate = new Date(dateStr + 'T12:00:00');
    if (!prevDate) {
      currentRun = 1;
    } else {
      const diffTime = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    bestStreak = Math.max(bestStreak, currentRun);
    prevDate = curDate;
  });

  bestStreak = Math.max(bestStreak, streak);

  // Graph calculations: Target vs Actual (for recent 7 days of the taper plan)
  // Let's collect the targets of the last 7 days of plan leading up to today
  const last7Days: { dateStr: string; label: string; target: number; actual: number }[] = [];
  const offsetNow = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(offsetNow.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Find matching target in taperPlan
    const targetInfo = taperPlan.find(p => p.dateStr === dateStr);
    const targetGrams = targetInfo ? targetInfo.targetGrams : setupData.targetAmount;
    
    // Sum matching actual logs
    const dayLogs = doseLogs.filter(l => l.dateStr === dateStr);
    const actualGrams = Math.round(dayLogs.reduce((sum, l) => sum + l.amount, 0) * 10) / 10;

    const shortLabel = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    
    last7Days.push({
      dateStr,
      label: shortLabel,
      target: targetGrams,
      actual: actualGrams,
    });
  }

  // Find max value in last7Days for scaling graph (with buffer)
  const maxValForScale = Math.max(
    ...last7Days.map(d => Math.max(d.target, d.actual)),
    5
  ) * 1.15;

  // SVGs specs
  const listWidth = 360;
  const listHeight = 160;
  const paddingX = 40;
  const paddingY = 20;
  const plotWidth = listWidth - paddingX * 2;
  const plotHeight = listHeight - paddingY * 2;

  // Render Target vs Actual Graph
  const makePoints = (type: 'target' | 'actual') => {
    return last7Days.map((val, idx) => {
      const x = paddingX + (idx / 6) * plotWidth;
      const y = listHeight - paddingY - (val[type] / maxValForScale) * plotHeight;
      return `${x},${y}`;
    }).join(' ');
  };

  const targetPoints = makePoints('target');
  const actualPoints = makePoints('actual');

  // Daily symptom history over the last 5 check-ins
  const last5CheckIns = [...symptomCheckIns]
    .slice(0, 5)
    .reverse(); // oldest to newest

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      
      {/* Title */}
      <div>
        <h2 id="progress-header" className="text-2xl font-bold font-display text-brand-100 flex items-center gap-2">
          <Award className="w-6 h-6 text-brand-400" />
          Taper Insights
        </h2>
        <p className="text-xs text-brand-300/80">
          Your statistics and reduction records, stored locally and confidentially.
        </p>
      </div>

      {/* Metrics bento-style highlights */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Total Reduction */}
        <div id="stat-reduction" className="bg-brand-950/40 border border-brand-900/50 p-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-brand-400">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] tracking-wider uppercase font-semibold font-mono">Stepped Down</span>
            </div>
            <span className="block text-2xl font-extrabold text-brand-100 font-mono pt-1">
              {currentReduction}g
            </span>
          </div>
          <p className="text-[10px] text-brand-300/60 mt-3 font-medium">
            Reduced by <span className="text-emerald-400 font-bold">-{reductionPercent}%</span> since start.
          </p>
        </div>

        {/* Streaks */}
        <div id="stat-streak" className="bg-brand-950/40 border border-brand-900/50 p-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-brand-400">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/10" />
              <span className="text-[10px] tracking-wider uppercase font-semibold font-mono font-sans">Active Runs</span>
            </div>
            <span className="block text-2xl font-extrabold text-brand-100 font-mono pt-1">
              {streak} <span className="text-xs text-brand-300/50 uppercase font-sans">Days</span>
            </span>
          </div>
          <p className="text-[10px] text-brand-300/60 mt-3">
            Best streak: <span className="text-brand-100 font-bold">{bestStreak} days</span> of check-ins.
          </p>
        </div>

        {/* Cravings Scale */}
        <div id="stat-cravings" className="bg-brand-950/40 border border-brand-900/50 p-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-brand-400">
              <Activity className="w-4 h-4 text-brand-400" />
              <span className="text-[10px] tracking-wider uppercase font-semibold font-mono font-sans">Cravings Level</span>
            </div>
            <span className="block text-2xl font-extrabold text-brand-100 font-mono pt-1">
              {avgCravings > 0 ? `${avgCravings}/10` : '—'}
            </span>
          </div>
          <p className="text-[10px] text-brand-300/60 mt-3">
            {avgCravings > 7 
              ? 'Intense levels reported. Consider adjusting' 
              : avgCravings > 4 
              ? 'Moderate cravings, average level' 
              : avgCravings > 0 
              ? 'Excellent, mild craving control' 
              : 'No craving log records yet'}
          </p>
        </div>

        {/* Sleep Quality */}
        <div id="stat-sleep" className="bg-brand-950/40 border border-brand-900/50 p-4 rounded-2xl flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-brand-400">
              <Moon className="w-4 h-4 text-brand-300" />
              <span className="text-[10px] tracking-wider uppercase font-semibold font-mono">Sleep Level</span>
            </div>
            <span className="block text-2xl font-extrabold text-brand-100 font-mono pt-1">
              {avgSleep > 0 ? `${avgSleep}/10` : '—'}
            </span>
          </div>
          <p className="text-[10px] text-brand-300/60 mt-3">
            {avgSleep > 6 ? 'Healthy sleep reports' : avgSleep > 0 ? 'Light restlessness during nights' : 'No sleep reports logged'}
          </p>
        </div>

      </div>

      {/* SVG GRAPH: Target vs Actual (Last 7 Days) */}
      <div id="target-vs-actual-graph" className="bg-brand-950/50 border border-brand-900/60 p-5 rounded-3xl space-y-3.5 shadow-md">
        <h3 className="text-sm font-semibold text-brand-200">Grams Intake vs. Target (Last 7 Days)</h3>
        
        <div className="relative">
          <svg viewBox={`0 0 ${listWidth} ${listHeight}`} className="w-full h-auto overflow-visible select-none">
            {/* Guide Gridlines Horizontal */}
            {[0, 0.5, 1].map((ratio) => {
              const y = paddingY + ratio * plotHeight;
              const valLabel = Math.round(maxValForScale * (1 - ratio));
              return (
                <g key={ratio} className="opacity-20 font-mono text-[9px] text-brand-300">
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={listWidth - paddingX}
                    y2={y}
                    stroke="#a7c4bc"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text x={paddingX - 10} y={y + 3} textAnchor="end" fill="#f4f7f5">
                    {valLabel}g
                  </text>
                </g>
              );
            })}

            {/* X Axis Labels */}
            {last7Days.map((day, idx) => {
              const x = paddingX + (idx / 6) * plotWidth;
              return (
                <text
                  key={idx}
                  x={x}
                  y={listHeight - paddingY + 14}
                  textAnchor="middle"
                  fill="#a7c4bc"
                  className="text-[9px] font-mono opacity-50"
                >
                  {day.label}
                </text>
              );
            })}

            {/* Target Line path */}
            <polyline
              fill="none"
              stroke="#5d877c"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              opacity="0.75"
              points={targetPoints}
            />

            {/* Actual Line path */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              points={actualPoints}
            />

            {/* Data Dots to make readable */}
            {last7Days.map((val, idx) => {
              const x = paddingX + (idx / 6) * plotWidth;
              const targetY = listHeight - paddingY - (val.target / maxValForScale) * plotHeight;
              const actualY = listHeight - paddingY - (val.actual / maxValForScale) * plotHeight;
              return (
                <g key={idx}>
                  {/* targets */}
                  <circle cx={x} cy={targetY} r="3" fill="#5d877c" />
                  {/* actuals */}
                  <circle cx={x} cy={actualY} r="4.5" fill="#10b981" />
                  <circle cx={x} cy={actualY} r="2.5" fill="#0d1211" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 pt-2 text-[10px] font-sans">
          <div className="flex items-center gap-1.5 text-brand-300">
            <div className="w-3.5 h-0.5 border-t-2 border-dashed border-brand-500"></div>
            <span>Daily Plan Target Limit</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <div className="w-3.5 h-0.5 bg-emerald-500"></div>
            <span>Your Actual Logged Intake</span>
          </div>
        </div>
      </div>

      {/* Welfare trends checklist history */}
      <div id="welfare-trends-card" className="bg-brand-950/40 border border-brand-900/60 p-5 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-brand-200">Recent Symptom Check-In Trends</h3>

        {last5CheckIns.length === 0 ? (
          <div className="text-center py-8 border border-brand-900/40 border-dashed rounded-xl bg-brand-950/10">
            <p className="text-xs text-brand-300/40 font-sans">Symptom history displays once check-ins are logged.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {last5CheckIns.map((check, idx) => {
              const dateLabel = new Date(check.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              // compute severe symptom count: any symptom rate > 7
              const symCount = [
                check.anxiety,
                check.restlessness,
                check.sleepIssues,
                check.stomachIssues,
                check.sweatingChills,
                check.pain
              ].filter(v => v > 6).length;

              return (
                <div key={check.id} className="border-b border-brand-900/30 last:border-0 pb-3 last:pb-0 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-brand-200 font-mono">{dateLabel}</span>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-brand-900 px-2 py-0.5 rounded font-mono">
                        Cravings: {check.cravings}/10
                      </span>
                      <span className="text-[10px] bg-brand-900 px-2 py-0.5 rounded font-mono">
                        Sleep Quality: {check.sleepQuality}/10
                      </span>
                    </div>
                  </div>

                  {/* Tiny list of warning/intense symptoms */}
                  <div className="flex gap-1.5 flex-wrap">
                    {check.anxiety > 6 && <span className="text-[9px] bg-red-950/40 border border-red-900/30 text-red-300 px-1.5 py-0.5 rounded">High Anxiety</span>}
                    {check.restlessness > 6 && <span className="text-[9px] bg-amber-950/40 border border-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded">RLS</span>}
                    {check.stomachIssues > 6 && <span className="text-[9px] bg-amber-950/40 border border-amber-900/30 text-amber-300 px-1.5 py-0.5 rounded">GI Disturbance</span>}
                    {check.pain > 6 && <span className="text-[9px] bg-red-950/40 border border-red-900/30 text-red-300 px-1.5 py-0.5 rounded">Body Pain</span>}
                    {symCount === 0 && (
                      <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-emerald-500/10" />
                        Withdrawal Symptoms Stable / Mild
                      </span>
                    )}
                  </div>

                  {check.notes && (
                    <p className="text-[11px] text-brand-300/60 leading-relaxed italic pr-2">
                      "{check.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
