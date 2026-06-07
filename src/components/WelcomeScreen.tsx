import { ShieldAlert, Heart, Clipboard } from 'lucide-react';

interface WelcomeScreenProps {
  onAccept: () => void;
}

export default function WelcomeScreen({ onAccept }: WelcomeScreenProps) {
  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col justify-between min-h-[85vh]">
      <div className="space-y-8 my-auto">
        {/* Elegant Minimalist Logo Brand */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 mb-2">
            <span className="text-2xl font-semibold font-display tracking-tight text-brand-300">TK</span>
          </div>
          <h1 id="brand-title" className="text-4xl font-extrabold tracking-tight font-display text-brand-100">
            Taper<span className="text-brand-400">K</span>
          </h1>
          <p className="text-sm font-medium text-brand-300/80 tracking-wide max-w-xs mx-auto">
            A simple, private, and calm tracker for gradual kratom reduction.
          </p>
        </div>

        {/* Quiet, respectful wellness notice */}
        <div id="welcome-intro-card" className="bg-brand-950/40 border border-brand-900/60 p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-semibold text-brand-200 flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-brand-400" />
            Your Private Practice
          </h2>
          <p className="text-sm text-brand-300 leading-relaxed">
            Reducing kratom intake is a highly personal journey. TaperK runs entirely in your browser. None of your data is sent to servers or shared. We provide a space to track, learn, and step down at your own speed with zero shame.
          </p>
        </div>

        {/* Clinical Disclaimer Block */}
        <div id="clinical-disclaimer-card" className="bg-amber-950/20 border border-amber-900/40 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-base">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <h3>Important Considerations</h3>
          </div>
          <div className="text-xs text-amber-200/80 leading-relaxed space-y-2">
            <p>
              <strong>TaperK is not medical advice.</strong> Kratom contains alkaloids that may cause physical dependence and withdrawal upon reduction.
            </p>
            <p>
              Please consult a trusted healthcare professional before beginning. This is particularly important if you are currently using concentrated herbal extracts, 7-OH (7-hydroxymitragynine) products, consuming high daily amounts, taking other medications, or experiencing severe physical/mental health symptoms.
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 space-y-3">
        <button
          id="btn-start-plan"
          onClick={onAccept}
          className="w-full py-4 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold tracking-wide transition-all shadow-lg hover:shadow-brand-500/10 hover:scale-[1.01] active:scale-95 duration-150 cursor-pointer text-center text-base"
        >
          Start My Plan
        </button>
        <p className="text-[10px] text-center text-brand-300/50 flex items-center justify-center gap-1">
          <Heart className="w-3 h-3 text-brand-500" />
          You are in control.
        </p>
      </div>
    </div>
  );
}
