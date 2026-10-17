import React, { useState } from 'react';
import { auditVideoSeo } from '../services/seoAudit';
import { scanAdvertiserSafety } from '../services/adSafetyScanner';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Info,
  Sliders,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const StudioVideoSeoFixer: React.FC = () => {
  const [focusKeyword, setFocusKeyword] = useState('youtube seo tutorial');
  const [title, setTitle] = useState(
    'YouTube SEO Tutorial 2026: Rank #1 on YouTube Step-by-Step (Proven Strategy)'
  );
  const [description, setDescription] = useState(
    `In this complete YouTube SEO tutorial for 2026, you will discover the exact step-by-step strategy to rank #1 on YouTube and get more views.

🚀 Free Creator Checklist & Tools: https://tjpromotions.pro

TIMESTAMPS:
00:00 - YouTube SEO Introduction & Algorithm Truth
01:45 - High-Intent Keyword Expansion (No Paid Tools)
04:20 - Mobile CTR Optimization & 50-Character Hook
07:15 - Audience Retention & Video Chapter Architecture
10:30 - Tag Matrix Saturation & Algorithmic Discovery
12:50 - First 48-Hours Momentum Execution

Connect with us:
Website: https://tjpromotions.pro
Community: https://youtube.com

#YouTubeSEO #VideoMarketing #CreatorEconomy #YouTubeGrowth`
  );
  const [tagsInput, setTagsInput] = useState(
    'youtube seo, youtube seo 2026, how to rank youtube videos, get more views on youtube, youtube algorithm explained, youtube tags strategy, video marketing blueprint, grow youtube channel, seo tutorial, rank on youtube fast'
  );

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Compute 100-Point Audit
  const auditResult = auditVideoSeo({
    focusKeyword,
    title,
    description,
    tags,
  });

  // Compute Safe-for-Ads Scanner
  const safetyResult = scanAdvertiserSafety(title, description, tags);

  // First 120 chars slice for Hook Checker
  const first120 = description.slice(0, 120);
  const remainingDesc = description.slice(120);

  // Mobile title preview (character 50 cutoff marker)
  const mobilePreviewCutoff = 52;
  const isTitleTruncated = title.length > mobilePreviewCutoff;
  const mobileVisibleTitle = isTitleTruncated
    ? title.slice(0, mobilePreviewCutoff) + '...'
    : title;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Studio Header */}
      <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e283b]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-emerald-400">Studio 03</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Real-Time RankMath Engine & Ad Safety</span>
            </div>
            <h2 className="text-xl font-bold text-white">Video SEO Score & Fixer Studio</h2>
            <p className="text-xs text-slate-400 mt-1">
              Benchmark your video metadata against 100 on-page ranking signals and YouTube advertiser guidelines.
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-right">
              <div className="text-[11px] font-mono text-slate-400">On-Page SEO Score</div>
              <div
                className={`text-2xl font-black font-mono tabular-nums ${
                  auditResult.color === 'green'
                    ? 'text-emerald-400'
                    : auditResult.color === 'yellow'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {auditResult.totalScore}
                <span className="text-xs text-slate-500 font-normal"> / 100</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                auditResult.color === 'green'
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                  : auditResult.color === 'yellow'
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                  : 'bg-rose-500/15 border border-rose-500/40 text-rose-400'
              }`}
            >
              {auditResult.rating === 'Excellent' ? 'A+' : auditResult.rating === 'Moderate' ? 'B' : 'C-'}
            </div>
          </div>
        </div>

        {/* Input Form Controls */}
        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Focus Target Keyword
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="e.g. youtube seo tutorial"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300">Video Title</label>
              <span className="text-[11px] font-mono text-slate-400">
                {title.length} / 100 chars {title.length > 55 && <span className="text-amber-400">(cutoff warning)</span>}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your proposed title..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Video Description (Include Timestamps, Links & Hashtags)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {description.length} / 5,000 chars
              </span>
            </div>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your complete video description..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Comma-Separated Video Tags
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {tags.length} tags · {tags.join(',').length} / 500 chars
              </span>
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag 1, tag 2, tag 3..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid: 100-Point Audit Checklist (Tool 10) & Visual Simulators (Tools 11, 12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 100-Point Audit Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-[#111723] border border-[#1e283b] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e283b]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>100-Point RankMath Checklist Breakdown</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {auditResult.rules.filter((r) => r.status === 'passed').length} / {auditResult.rules.length} Passed
              </span>
            </div>

            <div className="space-y-2.5">
              {auditResult.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      {rule.status === 'passed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {rule.status === 'warning' && (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      {rule.status === 'failed' && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span>{rule.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      <strong className="text-white font-bold">{rule.points}</strong> / {rule.maxPoints} pts
                    </span>
                  </div>

                  <p className="text-slate-400 pl-6 leading-relaxed">{rule.message}</p>

                  {rule.status !== 'passed' && (
                    <div className="pl-6 pt-1 text-[11px] text-amber-300/90 flex items-start gap-1">
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{rule.recommendation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tools 11 & 12 Mobile Previews */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tool 11: Mobile Screen Title Truncation Preview */}
          <div className="p-5 rounded-xl bg-[#111723] border border-[#1e283b] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e283b]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>Mobile Title Truncation Preview</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">#0f0f0f Dark Card</span>
            </div>

            <p className="text-[11px] text-slate-400">
              YouTube Mobile feeds truncate titles at ~50 characters with an ellipsis (<code className="text-slate-300">...</code>).
            </p>

            {/* Pixel-perfect YouTube Mobile Card Replica */}
            <div className="p-3 bg-[#0f0f0f] border border-neutral-800 rounded-xl space-y-3 shadow-inner">
              {/* Video Thumbnail Frame */}
              <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-800">
                <div className="text-center p-4">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    16:9 Thumbnail Canvas
                  </span>
                  <span className="text-[10px] text-neutral-500">1280 × 720 HD</span>
                </div>
                {/* Duration Badge */}
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-white font-semibold">
                  12:45
                </span>
              </div>

              {/* Title & Metadata Strip */}
              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-full bg-neutral-700 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  Y
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-neutral-100 leading-snug line-clamp-2">
                    {mobileVisibleTitle}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Your Channel Name · 14K views · 2 hours ago
                  </div>
                </div>
              </div>
            </div>

            {isTitleTruncated && (
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                ⚠️ <strong>Truncation Alert:</strong> Characters after position {mobilePreviewCutoff} are hidden on smartphones. Ensure your core topic appears before the cutoff!
              </div>
            )}
          </div>

          {/* Tool 12: First 120-Character Description Hook Checker */}
          <div className="p-5 rounded-xl bg-[#111723] border border-[#1e283b] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e283b]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>First 120-Char Hook Checker</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Above The Fold</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Only the first 120 characters appear before the grey <span className="text-slate-300 font-semibold">...more</span> button on mobile devices.
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono space-y-2">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded font-bold">
                  {first120 || '(Empty description)'}
                </span>
                <span className="inline-block mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-semibold">
                  ...more (Fold)
                </span>
                <span className="text-slate-600">
                  {remainingDesc ? `${remainingDesc.slice(0, 80)}...` : ''}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              {focusKeyword && first120.toLowerCase().includes(focusKeyword.toLowerCase()) ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Target keyword is visible before the fold!
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Recommendation: Insert target keyword "{focusKeyword}" inside the first 120 characters.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tool 13: Deterministic Safe-for-Ads Word Scanner (Avoid Demonetization) */}
      <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e283b]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Deterministic Safe-for-Ads Scanner (Monetization Protection)
              </h3>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded uppercase ${
                  safetyResult.badgeColor === 'emerald'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : safetyResult.badgeColor === 'amber'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {safetyResult.riskScore}% Demonetization Risk · {safetyResult.riskTier}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{safetyResult.summary}</p>
          </div>
        </div>

        {safetyResult.flags.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong>100% Green Monetization Status:</strong> No profanity, unverified medical claims, financial get-rich schemes, or sensitive triggers found across your title, description, or tags.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {safetyResult.flags.map((flag, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="font-semibold text-slate-200">
                      Flag in {flag.location}: <code className="text-rose-300 font-mono">"{flag.triggerWord}"</code>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                    {flag.category} (+{flag.riskContribution}% Risk)
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Policy Citation: </strong>
                  {flag.policyCitation}
                </div>

                <div className="text-[11px] text-emerald-300 pt-1 border-t border-slate-800">
                  <strong className="text-emerald-400">Safe Replacement Recommendation: </strong>
                  {flag.safeAlternative}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
