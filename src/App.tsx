import React, { useState, useEffect } from 'react';
import { UserSession, StudioTab } from './types';
import { loadUserSession } from './services/storage';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AdminDrawer } from './components/AdminDrawer';
import { QuotaExceededModal } from './components/QuotaExceededModal';
import { StudioKeywordResearch } from './components/StudioKeywordResearch';
import { StudioCompetitorSpy } from './components/StudioCompetitorSpy';
import { StudioVideoSeoFixer } from './components/StudioVideoSeoFixer';
import { StudioMediaChapters } from './components/StudioMediaChapters';
import { Search, Crosshair, CheckCircle2, FileAudio } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'workstation'>('landing');
  const [activeTab, setActiveTab] = useState<StudioTab>('keyword');
  const [session, setSession] = useState<UserSession>(() => loadUserSession());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState<string>('');

  const refreshSession = () => {
    const updated = loadUserSession();
    setSession(updated);
  };

  const handleLaunchStudio = (tab?: StudioTab) => {
    if (tab) setActiveTab(tab);
    setCurrentView('workstation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuotaExceeded = (msg: string) => {
    setQuotaMessage(msg);
    setIsQuotaModalOpen(true);
  };

  const studioTabs: {
    id: StudioTab;
    number: string;
    label: string;
    toolsCount: string;
    icon: typeof Search;
  }[] = [
    {
      id: 'keyword',
      number: '01',
      label: 'Keyword & Topic Research',
      toolsCount: '5 Tools',
      icon: Search,
    },
    {
      id: 'competitor',
      number: '02',
      label: 'Competitor Video Spy',
      toolsCount: '4 Tools',
      icon: Crosshair,
    },
    {
      id: 'seo-score',
      number: '03',
      label: 'Video SEO Score & Fixer',
      toolsCount: '4 Tools',
      icon: CheckCircle2,
    },
    {
      id: 'audio-media',
      number: '04',
      label: 'Video File & Audio Chapters',
      toolsCount: '3 Tools',
      icon: FileAudio,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090c13] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        activeTab={activeTab}
        onSelectView={setCurrentView}
        onSelectTab={setActiveTab}
        session={session}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16 lg:pb-8">
        {currentView === 'landing' ? (
          <LandingPage onLaunchStudio={handleLaunchStudio} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            {/* Desktop Studio Tab Navigation Bar */}
            <div className="bg-[#111723] border border-[#1e283b] p-1.5 rounded-xl flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5 min-w-max">
                {studioTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white border border-[#1e283b] shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span className={`text-[11px] font-mono font-semibold ${isActive ? 'text-[#fd5d5d]' : 'text-slate-500'}`}>
                        {tab.number}
                      </span>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#fd5d5d]' : 'text-slate-400'}`} />
                      <span className="font-semibold">{tab.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                        {tab.toolsCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick info status */}
              <div className="hidden xl:flex items-center gap-2 pr-2 text-xs text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero Third-Party AI API · 100% In-Browser</span>
              </div>
            </div>

            {/* Active Studio Rendering */}
            <div className="min-h-[500px]">
              {activeTab === 'keyword' && (
                <StudioKeywordResearch
                  onSessionRefresh={refreshSession}
                  onQuotaExceeded={handleQuotaExceeded}
                />
              )}
              {activeTab === 'competitor' && (
                <StudioCompetitorSpy
                  onSessionRefresh={refreshSession}
                  onQuotaExceeded={handleQuotaExceeded}
                />
              )}
              {activeTab === 'seo-score' && <StudioVideoSeoFixer />}
              {activeTab === 'audio-media' && <StudioMediaChapters />}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Visible only on smaller viewports in workstation mode) */}
      {currentView === 'workstation' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090c13]/95 backdrop-blur-md border-t border-[#1e283b] py-1.5 px-2 flex justify-around items-center">
          {studioTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-1 rounded-md text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#fd5d5d]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="truncate max-w-[70px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Admin Drawer Modal */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        session={session}
        onSessionUpdate={(updated) => setSession(updated)}
      />

      {/* Quota Exceeded / Trial Expired Modal */}
      <QuotaExceededModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        session={session}
        message={quotaMessage}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
