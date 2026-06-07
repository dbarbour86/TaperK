export type ProductType = 'powder' | 'capsules' | 'extract' | '7-OH / enhanced' | 'other';
export type TaperPace = 'gentle' | 'moderate' | 'custom';
export type TaperGoal = 'reduce' | 'quit';

export interface SetupData {
  startAmount: number; // in grams
  dosesPerDay: number;
  productType: ProductType;
  pace: TaperPace;
  customWeeklyReduction?: number; // list reduction rate in grams per week
  goal: TaperGoal;
  targetAmount: number; // in grams
  startDate: string; // YYYY-MM-DD
}

export interface DayPlan {
  dayNumber: number;
  dateStr: string; // YYYY-MM-DD
  targetGrams: number;
}

export interface DoseLog {
  id: string;
  timestamp: string; // ISO String
  dateStr: string; // YYYY-MM-DD
  amount: number; // in grams
  productType: ProductType | string;
  notes?: string;
}

export interface SymptomCheckIn {
  id: string;
  timestamp: string; // ISO String
  dateStr: string; // YYYY-MM-DD
  anxiety: number; // 0-10
  restlessness: number; // 0-10
  sleepIssues: number; // 0-10
  stomachIssues: number; // 0-10
  sweatingChills: number; // 0-10
  pain: number; // 0-10
  mood: number; // 0-10
  cravings: number; // 0-10
  sleepQuality: number; // 0-10
  notes?: string;
}

export interface TaperState {
  hasAcceptedDisclaimer: boolean;
  setupData: SetupData | null;
  taperPlan: DayPlan[];
  doseLogs: DoseLog[];
  symptomCheckIns: SymptomCheckIn[];
}
