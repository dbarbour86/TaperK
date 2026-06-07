import { SetupData, DayPlan } from '../types';

export function addDays(dateStr: string, days: number): string {
  // Use noon to prevent issues withtimezone offsets causing date jumps
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function formatDateString(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export function generateInitialTaperPlan(setupData: SetupData): DayPlan[] {
  const { startAmount, targetAmount, pace, customWeeklyReduction, startDate } = setupData;
  const plan: DayPlan[] = [];

  // Calculate reduction rate per week
  let weeklyReduction = 1.0;
  if (pace === 'custom') {
    weeklyReduction = customWeeklyReduction && customWeeklyReduction > 0 ? customWeeklyReduction : 1.0;
  } else if (pace === 'gentle') {
    weeklyReduction = Math.max(0.25, Math.round((startAmount * 0.05) * 10) / 10);
  } else { // moderate
    weeklyReduction = Math.max(0.5, Math.round((startAmount * 0.10) * 10) / 10);
  }

  // Generate maximum of 12 weeks (84 days) or until we reach target
  const maxDays = 91; // 13 weeks
  let currentTarget = startAmount;

  for (let day = 0; day < maxDays; day++) {
    const weekIndex = Math.floor(day / 7);
    
    // Reduce target step-wise every 7 days
    if (weekIndex > 0) {
      const stepReduction = weekIndex * weeklyReduction;
      currentTarget = Math.max(targetAmount, startAmount - stepReduction);
    }

    // Round target to 1 decimal place
    currentTarget = Math.round(currentTarget * 10) / 10;

    plan.push({
      dayNumber: day + 1,
      dateStr: addDays(startDate, day),
      targetGrams: currentTarget,
    });

    // If we've reached the target amount, and we've held it for at least 7 days, we can complete generating the plan
    if (currentTarget <= targetAmount && weekIndex * 7 + 7 <= day) {
      break;
    }
  }

  return plan;
}

export function getEstimatedFinishDate(setupData: SetupData): string {
  const plan = generateInitialTaperPlan(setupData);
  if (plan.length === 0) return setupData.startDate;
  return plan[plan.length - 1].dateStr;
}

export function calculateWeeklyReductionRate(setupData: SetupData): number {
  const { startAmount, pace, customWeeklyReduction } = setupData;
  if (pace === 'custom') {
    return customWeeklyReduction && customWeeklyReduction > 0 ? customWeeklyReduction : 1.0;
  } else if (pace === 'gentle') {
    return Math.max(0.25, Math.round((startAmount * 0.05) * 10) / 10);
  } else { // moderate
    return Math.max(0.5, Math.round((startAmount * 0.10) * 10) / 10);
  }
}
