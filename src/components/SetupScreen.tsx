import React, { useState } from 'react';
import { SetupData, ProductType, TaperPace, TaperGoal } from '../types';
import { Calendar, HelpCircle, ChevronRight, Activity, ArrowLeft } from 'lucide-react';

interface SetupScreenProps {
  onBack?: () => void;
  onSave: (data: SetupData) => void;
  initialData: SetupData | null;
}

export default function SetupScreen({ onBack, onSave, initialData }: SetupScreenProps) {
  // Local form states
  const [startAmount, setStartAmount] = useState<string>(
    initialData ? initialData.startAmount.toString() : '15'
  );
  const [dosesPerDay, setDosesPerDay] = useState<string>(
    initialData ? initialData.dosesPerDay.toString() : '4'
  );
  const [productType, setProductType] = useState<ProductType>(
    initialData ? initialData.productType : 'powder'
  );
  const [pace, setPace] = useState<TaperPace>(
    initialData ? initialData.pace : 'gentle'
  );
  const [customWeeklyReduction, setCustomWeeklyReduction] = useState<string>(
    initialData?.customWeeklyReduction ? initialData.customWeeklyReduction.toString() : '1'
  );
  const [goal, setGoal] = useState<TaperGoal>(
    initialData ? initialData.goal : 'quit'
  );
  const [targetAmount, setTargetAmount] = useState<string>(
    initialData ? initialData.targetAmount.toString() : '0'
  );
  const [startDate, setStartDate] = useState<string>(
    initialData ? initialData.startDate : new Date().toISOString().split('T')[0]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoalChange = (newGoal: TaperGoal) => {
    setGoal(newGoal);
    if (newGoal === 'quit') {
      setTargetAmount('0');
    } else {
      // default half of start amount
      const currentStart = parseFloat(startAmount) || 10;
      setTargetAmount(Math.max(1, Math.round(currentStart / 2)).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const startNum = parseFloat(startAmount);
    if (isNaN(startNum) || startNum <= 0) {
      newErrors.startAmount = 'Please enter a valid start amount greater than 0.';
    }

    const dosesNum = parseInt(dosesPerDay);
    if (isNaN(dosesNum) || dosesNum <= 0) {
      newErrors.dosesPerDay = 'Please enter a valid number of daily doses.';
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum < 0) {
      newErrors.targetAmount = 'Please enter a valid target amount (greater or equal to 0).';
    }

    if (goal === 'reduce' && targetNum >= startNum) {
      newErrors.targetAmount = 'Target amount must be less than your starting daily amount.';
    }

    const customReducNum = parseFloat(customWeeklyReduction);
    if (pace === 'custom') {
      if (isNaN(customReducNum) || customReducNum <= 0 || customReducNum >= startNum) {
        newErrors.customWeeklyReduction = `Enter a rate between 0.1g and ${startNum}g.`;
      }
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a starting date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // scroll to top/error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Success
    onSave({
      startAmount: Math.round(startNum * 10) / 10,
      dosesPerDay: dosesNum,
      productType,
      pace,
      customWeeklyReduction: pace === 'custom' ? Math.round(customReducNum * 10) / 10 : undefined,
      goal,
      targetAmount: goal === 'quit' ? 0 : Math.round(targetNum * 10) / 10,
      startDate,
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-brand-900/30 text-brand-300 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 id="setup-header" className="text-2xl font-bold font-display text-brand-100">
            Set Up Your Taper
          </h2>
          <p className="text-xs text-brand-300/80">
            Tell us about your current use to generate a customized schedule template.
          </p>
        </div>
      </div>

      <form id="setup-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Starting daily amount in grams */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Current Daily Amount (grams)
          </label>
          <p className="text-xs text-brand-300/70">
            Total amount of powder, capsules, or equivalent raw grams you use in 24 hours. (For reference, 1 level teaspoon of powder is roughly 2.5g, capsules are often 0.5g/0.6g each).
          </p>
          <div className="flex items-center gap-3">
            <input
              id="input-start-amount"
              type="number"
              step="0.1"
              min="0.1"
              value={startAmount}
              onChange={(e) => setStartAmount(e.target.value)}
              className="flex-1 bg-brand-950 border border-brand-800 focus:border-brand-500 rounded-xl px-4 py-3 text-lg font-bold font-mono text-brand-100 outline-none transition"
              placeholder="e.g. 15.0"
              required
            />
            <span className="text-sm font-semibold text-brand-300 font-mono">g / day</span>
          </div>
          {errors.startAmount && (
            <p className="text-red-400 text-xs italic">{errors.startAmount}</p>
          )}
        </div>

        {/* Daily Doses Frequency */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Daily Dosing Frequency
          </label>
          <p className="text-xs text-brand-300/70">
            How many separate doses do you usually take in a day?
          </p>
          <div className="flex items-center gap-3">
            <input
              id="input-doses-per-day"
              type="number"
              min="1"
              max="24"
              value={dosesPerDay}
              onChange={(e) => setDosesPerDay(e.target.value)}
              className="flex-1 bg-brand-950 border border-brand-800 focus:border-brand-500 rounded-xl px-4 py-3 text-lg font-bold font-mono text-brand-100 outline-none transition"
              placeholder="e.g. 4"
              required
            />
            <span className="text-sm font-semibold text-brand-300">doses / day</span>
          </div>
          {errors.dosesPerDay && (
            <p className="text-red-400 text-xs italic">{errors.dosesPerDay}</p>
          )}
        </div>

        {/* Product Type Choices */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Primary Product Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'powder', label: 'Powder (raw leaf)' },
              { id: 'capsules', label: 'Capsules / Pills' },
              { id: 'extract', label: 'Concentrated Extract' },
              { id: '7-OH / enhanced', label: '7-OH / Enhanced' },
              { id: 'other', label: 'Other Type' },
            ].map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => setProductType(prod.id as ProductType)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                  productType === prod.id
                    ? 'bg-brand-900/40 border-brand-400 text-brand-100 font-medium'
                    : 'bg-brand-950/30 border-brand-900/40 hover:border-brand-800 text-brand-300/80'
                }`}
              >
                <span className="text-sm">{prod.label}</span>
                {prod.id === 'extract' && (
                  <span className="text-[9px] text-amber-400 font-medium mt-0.5">High potency</span>
                )}
                {prod.id === '7-OH / enhanced' && (
                  <span className="text-[9px] text-red-400 font-medium mt-0.5">Potent Alkaloids</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Taper Goal & Destination
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'quit', label: 'Quit Completely', desc: 'Step-down to 0g' },
              { id: 'reduce', label: 'Reduce Intake', desc: 'Hold at a lower dose' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleGoalChange(g.id as TaperGoal)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  goal === g.id
                    ? 'bg-brand-900/40 border-brand-400 text-brand-100 font-semibold'
                    : 'bg-brand-950/30 border-brand-900/40 hover:border-brand-800 text-brand-300'
                }`}
              >
                <span className="text-sm">{g.label}</span>
                <span className="text-[10px] text-brand-300/60 mt-1">{g.desc}</span>
              </button>
            ))}
          </div>

          {goal === 'reduce' && (
            <div className="mt-4 p-4 rounded-xl bg-brand-950 border border-brand-800 space-y-3">
              <label className="block text-xs font-semibold text-brand-300">
                Target Daily Amount (grams)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-target-amount"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="flex-1 bg-brand-950/70 border border-brand-800 focus:border-brand-500 rounded-lg px-3 py-2 text-base font-mono text-brand-100 outline-none transition"
                  placeholder="e.g. 5.0"
                  required={goal === 'reduce'}
                />
                <span className="text-xs font-semibold text-brand-300 font-mono">g / day</span>
              </div>
              {errors.targetAmount && (
                <p className="text-red-400 text-xs italic">{errors.targetAmount}</p>
              )}
            </div>
          )}
        </div>

        {/* Taper Pace Option */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Taper Speed / Pace
          </label>
          <div className="space-y-2">
            {[
              {
                id: 'gentle',
                label: 'Gentle (Highly Recommended)',
                desc: 'Reduce by ~5% of original daily dose per week. Safer, mildest withdrawal feelings.',
              },
              {
                id: 'moderate',
                label: 'Moderate',
                desc: 'Reduce by ~10% of original daily dose per week. Taper moves faster, but symptoms may be more noticeable.',
              },
              {
                id: 'custom',
                label: 'Custom Reduction Speed',
                desc: 'Choose your own decrease rate (amount subtracted each week).',
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPace(p.id as TaperPace)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  pace === p.id
                    ? 'bg-brand-900/40 border-brand-400 text-brand-100'
                    : 'bg-brand-950/30 border-brand-900/40 hover:border-brand-800 text-brand-300/80'
                }`}
              >
                <span className="font-semibold text-xs flex items-center justify-between w-full">
                  {p.label}
                  {p.id === 'gentle' && (
                    <span className="bg-brand-500/20 text-brand-300 text-[9px] px-2 py-0.5 rounded-full font-mono uppercase">
                      Smoothest transition
                    </span>
                  )}
                </span>
                <span className="text-xs text-brand-300/60 leading-relaxed">{p.desc}</span>
              </button>
            ))}
          </div>

          {pace === 'custom' && (
            <div className="mt-4 p-4 rounded-xl bg-brand-950 border border-brand-800 space-y-3">
              <label className="block text-xs font-semibold text-brand-300">
                Weekly reduction amount (grams per week)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-custom-weekly-reduction"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={customWeeklyReduction}
                  onChange={(e) => setCustomWeeklyReduction(e.target.value)}
                  className="flex-1 bg-brand-950/70 border border-brand-800 focus:border-brand-500 rounded-lg px-3 py-2 text-base font-mono text-brand-100 outline-none transition"
                  placeholder="e.g. 1.0"
                  required={pace === 'custom'}
                />
                <span className="text-xs font-semibold text-brand-300 font-mono">g / week</span>
              </div>
              {errors.customWeeklyReduction && (
                <p className="text-red-400 text-xs italic">{errors.customWeeklyReduction}</p>
              )}
            </div>
          )}
        </div>

        {/* Start Date Selection */}
        <div className="bg-brand-950/20 border border-brand-900/40 p-5 rounded-2xl space-y-3">
          <label className="block text-sm font-semibold text-brand-200">
            Start Date
          </label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-4 w-5 h-5 text-brand-400" />
            <input
              id="input-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-brand-950 border border-brand-800 focus:border-brand-500 rounded-xl pl-12 pr-4 py-3 text-sm text-brand-100 outline-none transition font-sans"
              required
            />
          </div>
          {errors.startDate && (
            <p className="text-red-400 text-xs italic">{errors.startDate}</p>
          )}
        </div>

        {/* Form Submission button */}
        <button
          id="btn-generate-plan"
          type="submit"
          className="w-full py-4 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold tracking-wide transition-all shadow-lg hover:shadow-brand-500/10 cursor-pointer flex items-center justify-center gap-2 text-center text-base"
        >
          <span>Calculate My Plan Template</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
