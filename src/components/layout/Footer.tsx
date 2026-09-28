import React from 'react';

export const Footer: React.FC = () => (
  <footer className="mt-12 border-t border-stone-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
    <div className="mx-auto max-w-7xl space-y-3 px-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:px-6 lg:px-8">
      <p><strong className="text-slate-800 dark:text-white">Your saved comparisons stay in this browser.</strong> Address search sends what you type to Photon or postcodes.io for suggestions. Opening map and property links takes you to those services.</p>
      <p>Figures are estimates for planning. Check property details, moving costs and stamp duty before making a decision. Shall We Move? is independent of Rightmove and does not provide financial, legal or surveying advice.</p>
    </div>
  </footer>
);
