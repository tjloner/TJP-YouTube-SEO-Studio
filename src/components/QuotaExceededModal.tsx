import React from 'react';
import { UserSession } from '../types';
import { ExternalLink, Sparkles, X, ShieldAlert } from 'lucide-react';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  message?: string;
  onOpenAdmin: () => void;
}

export const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  isOpen,
  onClose,
  session,
  message,
  onOpenAdmin,
}) => {
  if (!isOpen) return null;

  const isExpired = session.tier === 'expired';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#111723] border border-[#1e283b] rounded-xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#fd5d5d]/10 border border-[#fd5d5d]/30 flex items-center justify-center text-[#fd5d5d] mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {isExpired ? '3-Day Free Trial Expired' : 'Daily Query Quota Reached'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {message ||
              (isExpired
                ? 'Your free trial period has concluded. Upgrade to Pro for unlimited real-time keyword expansion, competitor intelligence, and chapter synthesis.'
                : 'You have consumed your 10 free queries for today. Upgrade to unlimited or reset in admin mode.')}
          </p>
        </div>

        <div className="my-4 p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Current Status:</span>
            <span className="font-medium text-amber-400 capitalize">{session.tier} Tier</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Today's Usage:</span>
            <span className="font-mono text-slate-200">{session.queriesUsedToday} / 10 used</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Pro Membership:</span>
            <span className="text-emerald-400 font-medium">Unlimited Everything</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <a
            href="https://tjpromotions.pro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#fd5d5d] hover:bg-[#e04f4f] rounded-lg shadow-sm transition-all"
          >
            <span>Upgrade to Pro at tjpromotions.pro</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Developer Bypass: Open Admin Controls</span>
          </button>
        </div>
      </div>
    </div>
  );
};
