import React from 'react';
import { UserSession, StudioTab } from '../types';
import { calculateTrialDaysLeft } from '../services/storage';
import { Settings, Zap, ArrowRight, Home } from 'lucide-react';

interface HeaderProps {
  currentView: 'landing' | 'workstation';
  activeTab: StudioTab;
  onSelectView: (view: 'landing' | 'workstation') => void;
  onSelectTab: (tab: StudioTab) => void;
  session: UserSession;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeTab,
  onSelectView,
  onSelectTab,
  session,
  onOpenAdmin,
}) => {
  const daysLeft = calculateTrialDaysLeft(session);
  const isPro = session.tier === 'pro';
  const isExpired = session.tier === 'expired';

  const navItems: { label: string; tab?: StudioTab; view: 'landing' | 'workstation' }[] = [
    { label: 'Overview', view: 'landing' },
    { label: 'Keyword Studio', tab: 'keyword', view: 'workstation' },
    { label: 'Competitor Spy', tab: 'competitor', view: 'workstation' },
    { label: 'SEO Audit', tab: 'seo-score', view: 'workstation' },
    { label: 'Audio Chapters', tab: 'audio-media', view: 'workstation' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090c13]/90 backdrop-blur-md border-b border-[#1e283b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => onSelectView('landing')}
          className="text-left flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#fd5d5d] flex items-center justify-center text-white shadow-sm shadow-[#fd5d5d]/20 transition-transform group-hover:scale-105">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-none">
              TJP YouTube SEO Engine
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive =
              currentView === item.view && (item.view === 'landing' || activeTab === item.tab);

            return (
              <button
                key={item.label}
                onClick={() => {
                  onSelectView(item.view);
                  if (item.tab) onSelectTab(item.tab);
                }}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white border-b-2 border-[#fd5d5d]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Quota Badge */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          {/* Live Trial / Quota Badge */}
          <div className="hidden sm:flex items-center text-xs font-mono px-2.5 py-1 rounded-md bg-[#111723] border border-[#1e283b] text-slate-300">
            {isPro ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Pro · Unlimited
              </span>
            ) : isExpired ? (
              <span className="text-rose-400 font-semibold">
                Trial Expired · 0 Queries
              </span>
            ) : (
              <span className="text-slate-300">
                ⏳ 3-Day Trial: <strong className="text-white">{daysLeft}d left</strong> ·{' '}
                <span className="text-amber-400">{session.queriesUsedToday}/10</span> used
              </span>
            )}
          </div>

          {/* Admin Simulation Button */}
          <button
            onClick={onOpenAdmin}
            title="Admin Simulation Drawer"
            className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-300 hover:text-white bg-[#111723] hover:bg-slate-800 border border-[#1e283b] rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Admin Controls</span>
          </button>

          {/* Primary View Switcher */}
          {currentView === 'landing' ? (
            <button
              onClick={() => onSelectView('workstation')}
              className="flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold text-white bg-[#fd5d5d] hover:bg-[#e04f4f] rounded-lg shadow-sm shadow-[#fd5d5d]/25 transition-all"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onSelectView('landing')}
              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-[#111723] hover:bg-slate-800 border border-[#1e283b] rounded-lg transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
