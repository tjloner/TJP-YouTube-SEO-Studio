import React, { useState } from 'react';
import { UserSession, UserTier, ApprovalStatus } from '../types';
import { updateAdminSettings } from '../services/storage';
import { X, CheckCircle, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onSessionUpdate: (newSession: UserSession) => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  session,
  onSessionUpdate,
}) => {
  const [tier, setTier] = useState<UserTier>(session.tier);
  const [approval, setApproval] = useState<ApprovalStatus>(session.approvalStatus);
  const [trialDays, setTrialDays] = useState<number>(session.trialDays);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyChanges = (resetQueries = false) => {
    const updated = updateAdminSettings({
      tier,
      approvalStatus: approval,
      trialDays,
      resetQueries,
    });
    onSessionUpdate(updated);
    setNotice(resetQueries ? 'Queries reset to 0 for today!' : 'Settings applied & saved to localStorage!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleResetQueries = () => {
    handleApplyChanges(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111723] border border-[#1e283b] rounded-xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-[#1e283b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#fd5d5d]/10 border border-[#fd5d5d]/30 flex items-center justify-center text-[#fd5d5d]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Admin Simulation Console</h3>
              <p className="text-xs text-slate-400">Override user tiers, extend trials & reset quotas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notice && (
          <div className="my-3 px-3 py-2 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="space-y-4 py-4 text-sm">
          {/* User Tier Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">User Subscription Tier</label>
            <div className="grid grid-cols-3 gap-2">
              {(['trial', 'pro', 'expired'] as UserTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    tier === t
                      ? 'bg-[#fd5d5d]/15 border-[#fd5d5d] text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t === 'trial' ? '3-Day Trial' : t === 'pro' ? 'Pro Member' : 'Expired'}
                </button>
              ))}
            </div>
          </div>

          {/* Extend Trial Days */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Trial Duration (Days Granted)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setTrialDays(days)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-all ${
                    trialDays === days
                      ? 'bg-sky-500/15 border-sky-500 text-sky-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Approval Status */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Account Approval State</label>
            <div className="grid grid-cols-3 gap-2">
              {(['approved', 'pending', 'rejected'] as ApprovalStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setApproval(status)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center capitalize transition-all ${
                    approval === status
                      ? status === 'approved'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                        : status === 'pending'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                        : 'bg-rose-500/15 border-rose-500 text-rose-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Quota Section */}
          <div className="pt-2 p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-300">Daily Quota Status</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {session.queriesUsedToday} / 10 queries used today
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetQueries}
              className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Reset Queries</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#1e283b] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Persists in browser localStorage</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleApplyChanges(false);
                onClose();
              }}
              className="py-1.5 px-4 text-xs font-semibold text-white bg-[#fd5d5d] hover:bg-[#e04f4f] rounded-lg shadow-sm transition-colors"
            >
              Save Overrides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
