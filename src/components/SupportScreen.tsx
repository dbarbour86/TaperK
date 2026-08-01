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
  ExternalLink,
  Search,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SupportScreenProps {
  setupData: SetupData | null;
  onExportCSV: () => void;
  onResetPlan: () => void;
  onEditPlanSettings: () => void;
}

const FAQ_DATABASE = [
  {
    id: 'faq-1',
    category: 'Tapering Basics',
    keywords: 'kratom taper how to start reduction step down gpd grams per day',
    question: 'How do I taper off Kratom safely and effectively?',
    answer: 'A safe Kratom taper involves calculating your starting baseline daily intake (Grams Per Day / GPD), choosing a sustainable reduction pace (Gentle, Moderate, or Aggressive), and distributing your total daily target into evenly spaced doses. TaperK generates a customized step-down calendar and helps you log daily doses to stay on track.'
  },
  {
    id: 'faq-2',
    category: 'Calculator & Measurements',
    keywords: 'kratom taper calculator grams per day gpd measuring scale powder',
    question: 'How does the Kratom Taper Calculator determine my schedule?',
    answer: 'The TaperK calculator takes your baseline GPD, dose frequency (e.g. 3 to 6 times daily), and chosen taper rate. For Gentle tapers, daily targets drop by ~0.25g-0.5g every 5-7 days. For Moderate tapers, targets drop by ~0.5g every 3-4 days. Aggressive tapers drop by 1.0g every 2-3 days. You can adjust targets anytime.'
  },
  {
    id: 'faq-3',
    category: 'Capsules & Extracts',
    keywords: 'capsules extract shots liquid mitragynine conversion size 00 000 grams',
    question: 'How do I convert Kratom capsules or liquid extract shots to grams?',
    answer: 'Standard Size 00 capsules hold ~0.5 grams of powder, while Size 000 capsules hold ~0.8g to 1.0g. Liquid extract shots state total mitragynine (MIT) content (e.g., 150mg MIT). Because standard plain leaf powder averages 1.2%–1.5% mitragynine (~12-15mg per gram), a 150mg extract shot equals roughly 10 to 12 grams of raw leaf powder.'
  },
  {
    id: 'faq-4',
    category: 'Withdrawal Symptoms',
    keywords: 'withdrawal symptoms restless leg syndrome rls insomnia anxiety fatigue digestive',
    question: 'How do I track and manage Kratom withdrawal symptoms?',
    answer: 'Common mild-to-moderate physical responses during a taper include Restless Leg Syndrome (RLS), insomnia, anxiety, mild fatigue, and body aches. TaperK lets you log daily symptom severity scores. If your symptom score rises, hold your target dose for an extra 3 to 5 days before stepping down again.'
  },
  {
    id: 'faq-5',
    category: 'Privacy & Data Security',
    keywords: 'privacy private local storage offline account security database',
    question: 'Is TaperK private and confidential?',
    answer: 'Yes! TaperK stores 100% of your dosage logs, symptom entries, water tracking, and settings directly in your device’s local browser storage. No accounts, email sign-ups, or external cloud databases are used, ensuring total privacy.'
  },
  {
    id: 'faq-6',
    category: 'Comfort & Hydration',
    keywords: 'water hydration magnesium agmatine sleep hydration support comfort',
    question: 'What lifestyle practices help during a Kratom dose reduction?',
    answer: 'Staying hydrated (drinking at least 64–96 oz of water daily) is essential as Kratom is a diuretic. Many users find mild exercise, magnesium glycinate for muscle relaxation/RLS support, and sticking to consistent dose timing helpful during a taper.'
  }
];

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

  // FAQ Search & Filter state
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQ_DATABASE.filter(item => {
    if (!faqSearch.trim()) return true;
    const query = faqSearch.toLowerCase();
    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query)
    );
  });

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
          Helplines, medical indicators, tapering knowledge base, and local data settings.
        </p>
      </div>

      {/* SEARCHABLE FAQ & KNOWLEDGE BASE SECTION */}
      <div id="faq-knowledge-base" className="bg-brand-950/40 border border-brand-900/50 p-5 rounded-3xl space-y-4 shadow-md text-left">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
            Kratom Taper Knowledge Base & FAQs
          </h3>
          <span className="text-[10px] bg-brand-900/60 border border-brand-800 text-brand-300/70 px-2 py-0.5 rounded-full font-mono">
            {filteredFaqs.length} Guides
          </span>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-brand-300/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords (e.g. capsules, calculator, RLS, GPD)..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full bg-brand-950 border border-brand-800 rounded-xl pl-8 pr-3 py-2 text-xs text-brand-100 outline-none placeholder-brand-300/30 font-sans focus:border-brand-500/50 transition"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="p-4 text-center text-xs text-brand-300/40 bg-brand-950/30 rounded-xl border border-brand-900/30">
              No specific guides found for "{faqSearch}". Try searching for terms like "capsules", "withdrawal", "schedule", or "gpd".
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-brand-950 rounded-xl border border-brand-900/40 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full px-3.5 py-3 text-left flex items-center justify-between gap-2 cursor-pointer hover:bg-brand-900/30 transition"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-mono text-brand-400/80 font-bold block">
                        {faq.category}
                      </span>
                      <span className="text-xs font-semibold text-brand-100 block leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-brand-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-300/40 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-brand-200/90 border-t border-brand-900/30 leading-relaxed font-sans bg-brand-950/60">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
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
                className="flex-1 py-2 bg-brand-500 hover:bg-brand-400 text-brand-950 text-xs font-bold rounded-lg cursor-pointer"
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
        <h3 className="text-sm font-semibold text-brand-200">Plan Options & Maintenance</h3>
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

