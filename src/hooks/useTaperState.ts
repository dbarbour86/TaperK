import { useState, useEffect } from 'react';
import { TaperState, SetupData, DayPlan, DoseLog, SymptomCheckIn, ProductType } from '../types';
import { generateInitialTaperPlan, addDays } from '../utils/planGenerator';

const STORAGE_KEY = 'taperk_state_v1';

const getLocalDateString = (date: Date = new Date()): string => {
  // Returns YYYY-MM-DD in local timezone
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

const initialDefaultState: TaperState = {
  hasAcceptedDisclaimer: false,
  setupData: null,
  taperPlan: [],
  doseLogs: [],
  symptomCheckIns: [],
};

export function useTaperState() {
  const [state, setState] = useState<TaperState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrations/Fallbacks if loaded stored state is missing fields
        return {
          hasAcceptedDisclaimer: parsed.hasAcceptedDisclaimer || false,
          setupData: parsed.setupData || null,
          taperPlan: parsed.taperPlan || [],
          doseLogs: parsed.doseLogs || [],
          symptomCheckIns: parsed.symptomCheckIns || [],
        };
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
    return initialDefaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [state]);

  const acceptDisclaimer = () => {
    setState((prev) => ({ ...prev, hasAcceptedDisclaimer: true }));
  };

  const saveSetup = (data: SetupData) => {
    const initialPlan = generateInitialTaperPlan(data);
    setState((prev) => ({
      ...prev,
      setupData: data,
      taperPlan: initialPlan,
    }));
  };

  const updateSetupDataOnly = (data: SetupData) => {
    setState((prev) => ({
      ...prev,
      setupData: data,
    }));
  };

  const updateFullPlan = (newPlan: DayPlan[]) => {
    setState((prev) => ({
      ...prev,
      taperPlan: newPlan,
    }));
  };

  const updateDayTarget = (dayNumber: number, grams: number) => {
    setState((prev) => {
      const updatedPlan = prev.taperPlan.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, targetGrams: Math.max(0, Math.round(grams * 10) / 10) }
          : day
      );
      return { ...prev, taperPlan: updatedPlan };
    });
  };

  const addDoseLog = (amount: number, productType: ProductType | string, notes?: string) => {
    const now = new Date();
    const newLog: DoseLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: now.toISOString(),
      dateStr: getLocalDateString(now),
      amount: Math.max(0, amount),
      productType,
      notes,
    };
    setState((prev) => ({
      ...prev,
      doseLogs: [newLog, ...prev.doseLogs],
    }));
  };

  const deleteDoseLog = (id: string) => {
    setState((prev) => ({
      ...prev,
      doseLogs: prev.doseLogs.filter((log) => log.id !== id),
    }));
  };

  const addSymptomCheckIn = (symptoms: Omit<SymptomCheckIn, 'id' | 'timestamp' | 'dateStr'>) => {
    const now = new Date();
    const newCheckIn: SymptomCheckIn = {
      ...symptoms,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: now.toISOString(),
      dateStr: getLocalDateString(now),
    };
    setState((prev) => ({
      ...prev,
      symptomCheckIns: [newCheckIn, ...prev.symptomCheckIns],
    }));
  };

  const resetPlan = () => {
    if (window.confirm('Are you sure you want to reset your taper plan? This will clear all data and setup preferences.')) {
      setState(initialDefaultState);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const updateExistingPlanWithNewSettings = (data: SetupData) => {
    const initialPlan = generateInitialTaperPlan(data);
    setState((prev) => ({
      ...prev,
      setupData: data,
      taperPlan: initialPlan,
    }));
  };

  // Helper selectors
  const getTodayDateStr = () => getLocalDateString();

  const getPlanDayInfo = () => {
    if (!state.setupData) return null;
    const todayStr = getTodayDateStr();
    
    // Find explicitly by date
    const dayData = state.taperPlan.find(d => d.dateStr === todayStr);
    if (dayData) {
      return {
        dayNumber: dayData.dayNumber,
        targetGrams: dayData.targetGrams,
        isCompleted: false, // overall plan is ongoing
      };
    }

    // If not found in the plan:
    // Check if it's before the plan start date
    const start = new Date(state.setupData.startDate + 'T12:00:00');
    const today = new Date(todayStr + 'T12:00:00');
    
    if (today < start) {
      return {
        dayNumber: 0,
        targetGrams: state.setupData.startAmount,
        notStarted: true,
      };
    }

    // If it's after the end of the plan, target is the final goal
    const lastDay = state.taperPlan[state.taperPlan.length - 1];
    if (lastDay && today > new Date(lastDay.dateStr + 'T12:00:00')) {
      return {
        dayNumber: lastDay.dayNumber + 1,
        targetGrams: state.setupData.targetAmount,
        isOver: true,
      };
    }

    // Fallback: estimate day number
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      dayNumber: diffDays > 0 ? diffDays : 1,
      targetGrams: state.setupData.targetAmount,
    };
  };

  const getTodayDoseLogs = () => {
    const todayStr = getTodayDateStr();
    return state.doseLogs.filter((log) => log.dateStr === todayStr);
  };

  const getTodayTotalUsed = () => {
    return getTodayDoseLogs().reduce((sum, log) => sum + log.amount, 0);
  };

  const getTodaySymptomCheckIn = () => {
    const todayStr = getTodayDateStr();
    // Return the latest one check-in for today if multiple, or null
    const todays = state.symptomCheckIns.filter((c) => c.dateStr === todayStr);
    return todays.length > 0 ? todays[0] : null;
  };

  // Streak: consecutive days where the user logged something (dose or symptoms) and updated.
  const getStreak = () => {
    const activeDates = new Set<string>();
    state.doseLogs.forEach((log) => activeDates.add(log.dateStr));
    state.symptomCheckIns.forEach((check) => activeDates.add(check.dateStr));

    if (activeDates.size === 0) return 0;

    let streak = 0;
    let checkDateStr = getTodayDateStr();

    // Check if today is active
    const todayActive = activeDates.has(checkDateStr);
    
    if (!todayActive) {
      // If today is not active yet, check if yesterday was. If so, streak continues
      checkDateStr = addDays(checkDateStr, -1);
      if (!activeDates.has(checkDateStr)) {
        return 0; // Both today and yesterday inactive
      }
    }

    // Now count backwards
    while (activeDates.has(checkDateStr)) {
      streak++;
      checkDateStr = addDays(checkDateStr, -1);
    }

    return streak;
  };

  // Export to CSV helper
  const exportToCSV = () => {
    let csvContent = "";
    
    // Section 1: Setup Details
    csvContent += "TaperK - Personal Kratom Taper Export\n";
    csvContent += `Export Date,${new Date().toLocaleString()}\n`;
    csvContent += "\n";
    if (state.setupData) {
      csvContent += "SETUP PREFERENCES\n";
      csvContent += `Start Date,${state.setupData.startDate}\n`;
      csvContent += `Start Daily Amount (g),${state.setupData.startAmount}\n`;
      csvContent += `Doses Per Day,${state.setupData.dosesPerDay}\n`;
      csvContent += `Product Type,${state.setupData.productType}\n`;
      csvContent += `Taper Pace,${state.setupData.pace}\n`;
      csvContent += `Goal,${state.setupData.goal === 'quit' ? 'Quit Completely' : `Reduce to ${state.setupData.targetAmount}g`}\n`;
      csvContent += "\n";
    }

    // Section 2: Dose Logs
    csvContent += "DOSE LOG STATISTICS\n";
    csvContent += "Timestamp,Date,Amount (g),Product Type,Notes\n";
    state.doseLogs.forEach((log) => {
      const safeNotes = (log.notes || '').replace(/"/g, '""');
      csvContent += `"${log.timestamp}","${log.dateStr}",${log.amount},"${log.productType}","${safeNotes}"\n`;
    });
    csvContent += "\n";

    // Section 3: Symptom Log
    csvContent += "SYMPTOM logs\n";
    csvContent += "Timestamp,Date,Anxiety,Restlessness,Sleep Issues,Stomach Issues,Sweating & Chills,Pain,Mood,Cravings,Sleep Quality,Notes\n";
    state.symptomCheckIns.forEach((s) => {
      const safeNotes = (s.notes || '').replace(/"/g, '""');
      csvContent += `"${s.timestamp}","${s.dateStr}",${s.anxiety},${s.restlessness},${s.sleepIssues},${s.stomachIssues},${s.sweatingChills},${s.pain},${s.mood},${s.cravings},${s.sleepQuality},"${safeNotes}"\n`;
    });
    csvContent += "\n";

    // Section 4: Daily Target Schedule
    csvContent += "TAPER SCHEDULE DESIGN\n";
    csvContent += "Day,Date,Target Amount (g)\n";
    state.taperPlan.forEach((p) => {
      csvContent += `${p.dayNumber},"${p.dateStr}",${p.targetGrams}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `TaperK_Data_Export_${getTodayDateStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    state,
    acceptDisclaimer,
    saveSetup,
    updateDayTarget,
    addDoseLog,
    deleteDoseLog,
    addSymptomCheckIn,
    resetPlan,
    exportToCSV,
    getTodayDateStr,
    getPlanDayInfo,
    getTodayDoseLogs,
    getTodayTotalUsed,
    getTodaySymptomCheckIn,
    getStreak,
    updateSetupDataOnly,
    updateFullPlan,
    updateExistingPlanWithNewSettings
  };
}
