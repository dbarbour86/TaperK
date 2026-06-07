// TaperK Private Tracking and Analytics Integration Helper
// Runs entirely client-side and only initializes if Measurement IDs are supplied.

export function initAnalytics() {
  const env = (import.meta as any).env || {};
  const gaId = env.VITE_GA_MEASUREMENT_ID;
  const clarityId = env.VITE_CLARITY_PROJECT_ID;

  // 1. Google Analytics (GA4 gtag.js)
  if (gaId && typeof window !== 'undefined') {
    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Setup global dataLayer queue
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = gtag;

      // Configure tracking with cookie adjustments for iframe preview compatibility
      gtag('js', new Date());
      gtag('config', gaId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
      console.log(`[TaperK] Google Analytics initialized with ID: ${gaId}`);
    }
  }

  // 2. Microsoft Clarity
  if (clarityId && typeof window !== 'undefined') {
    if (!document.getElementById('clarity-script')) {
      const script = document.createElement('script');
      script.id = 'clarity-script';
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityId}");
      `;
      document.head.appendChild(script);
      console.log(`[TaperK] Microsoft Clarity initialized with ID: ${clarityId}`);
    }
  }
}

// Single custom event helper to track client-side actions securely (e.g., tapers completed, setup, resets)
export function logEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}
