import React, { useState, useEffect } from 'react';
import { useTaperState } from './hooks/useTaperState';
import WelcomeScreen from './components/WelcomeScreen';
import SetupScreen from './components/SetupScreen';
import PlanGeneratorScreen from './components/PlanGeneratorScreen';
import TodayDashboard from './components/TodayDashboard';
import PlanScheduleView from './components/PlanScheduleView';
import ProgressChartsScreen from './components/ProgressChartsScreen';
import SupportScreen from './components/SupportScreen';

import {
  Activity,
  Calendar,
  Award,
  Heart,
  Sparkles,
  RefreshCw,
  Sliders,
  LogOut
} from 'lucide-react';

export default function App() {
  const {
    state,
    acceptDisclaimer,
    saveSetup,
    updateDayTarget,
    addDoseLog,
    deleteDoseLog,
    addSymptomCheckIn,
    resetPlan,
    exportToCSV,
    getPlanDayInfo,
    getTodayDoseLogs,
    getTodaySymptomCheckIn,
    getStreak,
    updateExistingPlanWithNewSettings
  } = useTaperState();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'progress' | 'support'>('today');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isEditingSetup, setIsEditingSetup] = useState(false);

  // Auto transition to setup screen when disclaimer is accepted
  const handleAcceptDisclaimer = () => {
    acceptDisclaimer();
  };

  const handleSaveSetup = (data: any) => {
    if (isEditingSetup) {
      // Keep logs, just compute new plan targets
      updateExistingPlanWithNewSettings(data);
      setIsEditingSetup(false);
    } else {
      // brand new setup
      saveSetup(data);
      setIsSettingUp(true); // Trigger Blueprint review step
    }
  };

  const handleActivatePlan = (finalPlan: any[]) => {
    setIsSettingUp(false);
    setActiveTab('today');
  };

  // Screen Orchestrator
  if (!state.hasAcceptedDisclaimer) {
    return (
      <div className="min-h-screen bg-[#090d0c] text-brand-50 flex flex-col justify-between font-sans selection:bg-brand-500/20 selection:text-brand-200">
        <main className="flex-1 flex flex-col justify-center">
          <WelcomeScreen onAccept={handleAcceptDisclaimer} />
        </main>
      </div>
    );
  }

  if (state.setupData === null || isEditingSetup) {
    return (
      <div className="min-h-screen bg-[#090d0c] text-brand-50 font-sans selection:bg-brand-500/20 selection:text-brand-200">
        <header className="border-b border-brand-900/20 sticky top-0 bg-[#090d0c]/90 backdrop-blur-md z-30">
          <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
            <span className="font-extrabold font-display text-base tracking-tight text-brand-100 flex items-center gap-1.5">
              <span className="w-5.5 h-5.5 rounded-full bg-brand-900 border border-brand-500/30 flex items-center justify-center text-[10px] text-brand-300 font-bold font-display">TK</span>
              TaperK
            </span>
            <span className="text-[10px] bg-brand-950 border border-brand-900 px-2.5 py-1 rounded-full text-brand-300/60 font-medium">
              Setup Workspace
            </span>
          </div>
        </header>
        <main className="pb-12">
          <SetupScreen
            onBack={isEditingSetup ? () => setIsEditingSetup(false) : undefined}
            onSave={handleSaveSetup}
            initialData={state.setupData}
          />
        </main>
      </div>
    );
  }

  if (isSettingUp && state.taperPlan.length > 0) {
    return (
      <div className="min-h-screen bg-[#090d0c] text-brand-50 font-sans selection:bg-brand-500/20 selection:text-brand-200">
        <header className="border-b border-brand-900/20 sticky top-0 bg-[#090d0c]/90 backdrop-blur-md z-30">
          <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
            <span className="font-extrabold font-display text-base tracking-tight text-brand-100 flex items-center gap-1.5">
              <span className="w-5.5 h-5.5 rounded-full bg-brand-900 border border-brand-500/30 flex items-center justify-center text-[10px] text-brand-300 font-bold font-display">TK</span>
              TaperK
            </span>
          </div>
        </header>
        <main className="pb-12">
          <PlanGeneratorScreen
            setupData={state.setupData}
            initialPlan={state.taperPlan}
            onBack={() => setIsSettingUp(false)}
            onActivate={handleActivatePlan}
          />
        </main>
      </div>
    );
  }

  // Active tracking layout options
  const activeDayInfo = getPlanDayInfo();
  const todayLogs = getTodayDoseLogs();
  const todayCheckIn = getTodaySymptomCheckIn();
  const streak = getStreak();

  return (
    <div className="min-h-screen bg-[#070b0a] text-brand-50 font-sans selection:bg-brand-500/20 selection:text-brand-200 flex flex-col justify-between max-w-md mx-auto border-x border-brand-950 shadow-2xl">
      
      {/* Sticky Top Header */}
      <header className="border-b border-brand-900/20 sticky top-0 bg-[#070b0a]/90 backdrop-blur-md z-30">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
              <span className="font-extrabold text-[11px] text-brand-300 font-display">TK</span>
            </div>
            <h1 className="font-extrabold font-display text-base tracking-tight text-brand-100">
              Taper<span className="text-brand-400">K</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-sans">
            <span className="bg-brand-950 border border-brand-900/50 text-brand-400 px-2 py-0.5 rounded-full font-medium">
              Private Local Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main Tab Screen Panel */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'today' && (
          <TodayDashboard
            setupData={state.setupData}
            activeDayInfo={activeDayInfo}
            todayLogs={todayLogs}
            todayCheckIn={todayCheckIn}
            streak={streak}
            onAddDose={addDoseLog}
            onDeleteDose={deleteDoseLog}
            onAddSymptom={addSymptomCheckIn}
            onNavigateToTab={(tab: string) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'schedule' && (
          <PlanScheduleView
            taperPlan={state.taperPlan}
            setupData={state.setupData}
            onUpdateTarget={updateDayTarget}
            onEditSettings={() => setIsEditingSetup(true)}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressChartsScreen
            setupData={state.setupData}
            taperPlan={state.taperPlan}
            doseLogs={state.doseLogs}
            symptomCheckIns={state.symptomCheckIns}
            streak={streak}
          />
        )}

        {activeTab === 'support' && (
          <SupportScreen
            setupData={state.setupData}
            onExportCSV={exportToCSV}
            onResetPlan={resetPlan}
            onEditPlanSettings={() => setIsEditingSetup(true)}
          />
        )}
      </main>

      {/* Modern Fixed Bottom Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070b0a]/95 border-t border-brand-900/35 backdrop-blur-md py-2.5 px-4 flex justify-around items-center z-40 shadow-xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1.5 rounded-xl cursor-pointer ${
            activeTab === 'today' ? 'text-brand-300 font-bold' : 'text-brand-300/40 hover:text-brand-300/60'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Today</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center gap-1 transition-colors px-2 py-1.5 rounded-xl cursor-pointer ${
            activeTab === 'schedule' ? 'text-brand-300 font-bold' : 'text-brand-300/40 hover:text-brand-300/60'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center gap-1 transition-colors px-[#10px] py-1.5 rounded-xl cursor-pointer ${
            activeTab === 'progress' ? 'text-brand-300 font-bold' : 'text-brand-300/40 hover:text-brand-300/60'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center gap-1 transition-colors px-[#10px] py-1.5 rounded-xl cursor-pointer ${
            activeTab === 'support' ? 'text-brand-300 font-bold' : 'text-brand-300/40 hover:text-brand-300/60'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] tracking-wide">Support</span>
        </button>
      </nav>
    </div>
  );
}
