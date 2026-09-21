import React from 'react';
import { ShieldCheck, HardDrive, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">100% Client-Side Privacy</h4>
              <p className="mt-1 leading-relaxed">
                All property data, financial numbers, and comparison notes remain strictly in your browser’s localStorage.
                Zero data is stored on remote servers, and no third-party tracking or scraping APIs are used.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <HardDrive className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">British English & UK Specifics</h4>
              <p className="mt-1 leading-relaxed">
                Dual floor area measurements in both sq ft and sq m, distances in miles, prices in GBP (£), and
                English Stamp Duty Land Tax (SDLT) calculated according to current residential tax bands.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Important Disclaimer</h4>
              <p className="mt-1 leading-relaxed">
                Shall We Move? is an independent decision-support tool and is not affiliated with, authorised, or endorsed by
                Rightmove plc. This application does not constitute regulated financial, legal, or surveying advice.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} Shall We Move? Built with React, Vite, TypeScript & Tailwind CSS.</p>
          <p className="mt-2 sm:mt-0">Designed for UK home movers seeking clarity over hype.</p>
        </div>
      </div>
    </footer>
  );
};
