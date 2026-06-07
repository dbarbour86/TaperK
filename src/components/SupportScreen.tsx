import React, { useState, useEffect } from 'react';
import { SetupData } from '../types';
import {
  ShieldAlert,
  AlertOctagon,
  Phone,
  User,
  Heart,
  Download,
  RotateCcw,
  Sliders,
  Check,
  Briefcase,
  ExternalLink
} from 'lucide-react';

interface SupportScreenProps {
  setupData: SetupData | null;
  onExportCSV: () => void;
  onResetPlan: () => void;
  onEditPlanSettings: () => void;
}

export default function SupportScreen({
  setupData,
  onExportCSV,
  onResetPlan,
  onEditPlanSettings,
}: SupportScreenProps) {
  // Let's store a custom supporter contact in localStorage for survival situations
  const [supporterName, setSupporterName] = useState(() => {
    return localStorage.getItem('taperk_supporter_name') || '';
  });
  const [supporterPhone, setSupporterPhone] = useState(() => {
    return localStorage.getItem('taperk_supporter_phone') || '';
  });
  const [isEditingSupporter, setIsEditingSupporter] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSupporter = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('taperk_supporter_name', supporterName.trim());
    localStorage.setItem('taperk_supporter_phone', supporterPhone.trim());
    setIsEditingSupporter(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      
      {/* Title */}
      <div>
        <h2 id="support-header" className="text-2xl font-bold font-display text-brand-100 flex items-center gap-2">
          <Heart className="w-6 h-6 text-brand-400" />
          Support & Welfare
        </h2>
        <p className="text-xs text-brand-300/80">
          Helplines, medical indicators, and settings to maintain complete control.
        </p>
      </div>

      {/* EMERGENCY CRISIS WARNING */}
      <div id="crisis-card" className="bg-red-950/30 border border-red-900/50 p-5 rounded-2xl space-y-3.5">
        <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
          <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
          <h3>Immediate Crisis Support</h3>
        </div>
        <p className="text-xs text-red-200/90 leading-relaxed font-semibold">
          “If you feel unsafe, overwhelmed, or fear you might harm yourself, contact emergency services (like 911 in the US) or a crisis hotline immediately.”
        </p>
        <div className="pt-1.5 flex flex-wrap gap-2 text-[10px] font-mono">
          <a
            href="tel:988"
            className="flex items-center gap-1.5 bg-red-900/50 border border-red-700/40 px-2.5 py-1.5 rounded-lg text-red-200 hover:bg-red-800/60 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call or Text 988 (US)</span>
          </a>
          <a
            href="https://findtreatment.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-red-900/20 border border-red-900/50 px-2 py-1.5 rounded text-red-300 hover:brightness-115 transition"
          >
            <span>SAMHSA Treatment Finder</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* CUSTOM SUPPORT USER CONTACT PORTAL */}
      <div id="supporter-box" className="bg-brand-950/40 border border-brand-900/50 p-5 rounded-3xl space-y-3.5 shadow-md text-left">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-brand-200 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            My Personal Safe Supporter
          </h3>
          {!isEditingSupporter && (
            <button
              onClick={() => setIsEditingSupporter(true)}
              className="text-xs text-brand-400 hover:underline font-semibold"
            >
              {supporterName || supporterPhone ? 'Edit' : 'Add Contact'}
            </button>
          )}
        </div>

        {isEditingSupporter ? (
          <form onSubmit={handleSaveSupporter} className="space-y-3.5">
            <p className="text-[11px] text-brand-300/60 leading-relaxed">
              Add a trusted caregiver, doctor, friend, or partner. Keeping their details here lets you talk or contact them instantly inside this space during challenging hours.
            </p>
            <div className="space-y-2.5">
              <input
                id="supporter-name-input"
                type="text"
                placeholder="Supporter Name or Role (e.g. Dr. Ames, Sarah)"
                value={supporterName}
                onChange={(e) => setSupporterName(e.target.value)}
                className="w-full bg-brand-950 border border-brand-800 rounded-lg px-3 py-2 text-xs text-brand-100 outline-none placeholder-brand-300/30 font-sans"
              />
              <input
                id="supporter-phone-input"
                type="tel"
                placeholder="Phone Number (e.g. +1 555-0199)"
                value={supporterPhone}
                onChange={(e) => setSupporterPhone(e.target.value)}
                className="w-full bg-brand-950 border border-brand-800 rounded-lg px-3 py-2 text-xs text-brand-100 outline-none placeholder-brand-300/30 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-brand-500 hover:bg-brand-405 text-brand-950 text-xs font-bold rounded-lg cursor-pointer"
              >
                Save Supporter
              </button>
              <button
                type="button"
                onClick={() => setIsEditingSupporter(false)}
                className="px-3 bg-brand-950 hover:bg-brand-900 border border-brand-800 text-brand-300 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : supporterName || supporterPhone ? (
          <div className="bg-brand-950 p-4 rounded-xl border border-brand-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="block text-xs font-bold text-brand-200">{supporterName || 'Trusted Supporter'}</span>
              <span className="block text-[11px] font-mono text-brand-300/60">{supporterPhone || 'No phone number provided'}</span>
            </div>
            {supporterPhone && (
              <a
                href={`tel:${supporterPhone.replace(/\s+/g, '')}`}
                className="p-3 bg-brand-900 hover:bg-brand-800 hover:scale-105 active:scale-95 text-brand-400 rounded-xl transition inline-flex items-center justify-center border border-brand-700/20"
                title="Call Supporter Now"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-brand-950/20 border border-dashed border-brand-900/40 rounded-xl">
            <p className="text-xs text-brand-300/40 p-2 leading-relaxed">No personal supporter added yet. Connect an accountability physician or loved one here for easy contact.</p>
            <button
              onClick={() => setIsEditingSupporter(true)}
              className="text-xs font-semibold text-brand-400 hover:underline"
            >
              Configure safe contact
            </button>
          </div>
        )}

        {saveSuccess && (
          <div className="p-2 border border-emerald-950/40 bg-emerald-950/20 rounded-lg text-xs text-emerald-400 flex items-center gap-1.5 justify-center">
            <Check className="w-3.5 h-3.5" /> Supporter configured successfully.
          </div>
        )}
      </div>

      {/* MEDICAL ALERT - CLINICAL RED FLAGS */}
      <div id="when-to-get-help-section" className="bg-brand-950/40 border border-brand-900/50 p-5 rounded-3xl space-y-3.5 text-left">
        <h3 className="text-sm font-semibold text-brand-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0" />
          When to Seek Professional Medical Care
        </h3>
        <p className="text-xs text-brand-300 leading-relaxed">
          Tapering kratom reduces, but does not entirely eliminate, the potential for mild-to-moderate withdrawal symptoms. However, certain <strong>clinically severe symptoms</strong> require professional evaluation by a licensed physician rather than simple tracking.
        </p>

        <div className="bg-brand-950 p-4 rounded-xl border border-brand-900/30">
          <h4 className="text-xs font-bold text-amber-400 mb-2">Severe Symptoms Warning Indicators:</h4>
          <ul className="text-xs text-brand-300 space-y-2 list-disc pl-4 leading-relaxed">
            <li>Severe dehydration from prolonged vomiting or diarrhea</li>
            <li>Involuntary muscle tremors or persistent seizure development</li>
            <li>Inability to sleep or eat for multiple consecutive days</li>
            <li>Severe chest pain, unusually rapid pulse, or heart palpitations</li>
            <li>Severe depression, profound despondency, severe panic, or hallucinations</li>
          </ul>
        </div>
        
        <p className="text-[11px] text-brand-300/60 leading-relaxed font-sans">
          Always encourage working with a care provider. A clinician can prescribe adjunctive support medications (sleep aids, non-opioid comfort medications) to ease physical adjustments during your schedule.
        </p>
      </div>

      {/* CORE MAINTENANCE / DATA OPTIONS CARD */}
      <div id="settings-maintenance-card" className="bg-brand-950/40 border border-brand-900/50 p-5 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-brand-200">Plan Options & Maintenence</h3>
        <p className="text-[11px] text-brand-300/50 leading-relaxed">
          Manage your personal records, modify limits, or factory refresh local storage safely.
        </p>

        <div className="space-y-2.5">
          {/* Edit settings */}
          <button
            id="settings-edit-btn"
            onClick={onEditPlanSettings}
            className="w-full flex items-center justify-between p-3.5 bg-brand-950 hover:bg-brand-900 rounded-xl border border-brand-900/40 text-left transition text-xs font-semibold text-brand-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" /> Adjust Core Taper Values
            </span>
            <span className="text-[10px] text-brand-300/40">Modify</span>
          </button>

          {/* CSV Export */}
          <button
            id="settings-export-btn"
            onClick={onExportCSV}
            className="w-full flex items-center justify-between p-3.5 bg-brand-950 hover:bg-brand-900 rounded-xl border border-brand-900/40 text-left transition text-xs font-semibold text-brand-200 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-brand-400" /> Export Personal Logs to CSV
            </span>
            <span className="text-[10px] text-brand-300/40 font-mono">.csv format</span>
          </button>

          {/* Reset Plan */}
          <button
            id="settings-reset-all"
            onClick={onResetPlan}
            className="w-full flex items-center justify-between p-3.5 bg-red-950/20 hover:bg-red-950/30 rounded-xl border border-red-900/30 text-left transition text-xs font-semibold text-red-300 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" /> Reset Plan & Clear Local Memory
            </span>
            <span className="text-[10px] text-red-400/50">Factory Wipe</span>
          </button>
        </div>
      </div>

    </div>
  );
}
