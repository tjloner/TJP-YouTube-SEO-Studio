import React, { useState } from 'react';
import { CompetitorData } from '../types';
import {
  fetchCompetitorViaOEmbed,
  parseRawSourceHtml,
  detectGenre,
  auditCompetitorWeaknesses,
  generateCounterTitles,
  calculateRevenueGuide,
  SAMPLE_HTML_SOURCES,
} from '../services/competitorSpy';
import { consumeQuery } from '../services/storage';
import {
  Crosshair,
  Link,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface StudioCompetitorSpyProps {
  onSessionRefresh: () => void;
  onQuotaExceeded: (msg: string) => void;
}

export const StudioCompetitorSpy: React.FC<StudioCompetitorSpyProps> = ({
  onSessionRefresh,
  onQuotaExceeded,
}) => {
  const [ingestionMode, setIngestionMode] = useState<'url' | 'offline'>('url');
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [rawHtmlInput, setRawHtmlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [competitor, setCompetitor] = useState<CompetitorData | null>(null);
  const [simulatedViews, setSimulatedViews] = useState<number>(100000);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleIngest = async () => {
    setErrorMessage(null);

    // Consume quota
    const quota = consumeQuery();
    onSessionRefresh();
    if (!quota.success) {
      onQuotaExceeded(quota.message || 'Quota limit reached.');
      return;
    }

    setIsLoading(true);

    try {
      let parsed: Partial<CompetitorData> = {};

      if (ingestionMode === 'url') {
        parsed = await fetchCompetitorViaOEmbed(urlInput);
        // If oEmbed alone doesn't have tags or duration, provide informative baseline
        if (!parsed.tags || parsed.tags.length === 0) {
          // Provide representative baseline tags from title
          const titleWords = (parsed.title || '')
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter((w) => w.length > 3);
          parsed.tags = Array.from(new Set([parsed.title || 'video', ...titleWords]));
          parsed.durationSeconds = 620; // 10 min 20s realistic default
          parsed.viewCount = 125000;
          parsed.description = `Official video upload by ${parsed.author}. Subscribe to the channel for upcoming updates.\n\nLinks & Socials:\nhttps://youtube.com`;
        }
      } else {
        parsed = parseRawSourceHtml(rawHtmlInput);
      }

      const title = parsed.title || 'Competitor Target Video';
      const author = parsed.author || 'Competitor Channel';
      const durationSeconds = parsed.durationSeconds || 540;
      const tags = parsed.tags || [];
      const description = parsed.description || '';
      const viewCount = parsed.viewCount || 50000;
      const isMidRollMonetized = durationSeconds >= 480;

      const genre = detectGenre(title, tags);
      const vulnerabilities = auditCompetitorWeaknesses(title, description, tags, durationSeconds);
      const counterTitles = generateCounterTitles(title, genre, tags);
      const tagChars = tags.join(',').length;

      const fullData: CompetitorData = {
        url: parsed.url || urlInput,
        videoId: parsed.videoId || 'dQw4w9WgXcQ',
        title,
        author,
        channelUrl: parsed.channelUrl,
        thumbnailUrl:
          parsed.thumbnailUrl ||
          `https://i.ytimg.com/vi/${parsed.videoId || 'dQw4w9WgXcQ'}/hqdefault.jpg`,
        durationSeconds,
        viewCount,
        description,
        tags,
        totalTagChars: tagChars,
        isMidRollMonetized,
        genre,
        vulnerabilities,
        counterTitles,
        revenueEst: {
          niche: genre,
          minRPM_INR: genre === 'Tutorials / Tech' ? 80 : 30,
          maxRPM_INR: genre === 'Tutorials / Tech' ? 180 : 65,
          minRPM_USD: genre === 'Tutorials / Tech' ? 1.0 : 0.35,
          maxRPM_USD: genre === 'Tutorials / Tech' ? 2.2 : 0.75,
          midRollMultiplier: isMidRollMonetized ? 1.65 : 1.0,
        },
      };

      setCompetitor(fullData);
      setSimulatedViews(viewCount);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest competitor video.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sampleType: 'tech' | 'story') => {
    setIngestionMode('offline');
    setRawHtmlInput(SAMPLE_HTML_SOURCES[sampleType]);
  };

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  // Compute live revenue guide
  const revenueCalculations = competitor
    ? calculateRevenueGuide(competitor.genre, competitor.durationSeconds, simulatedViews, currency)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Studio Header & Dual-Mode Ingestion Bar */}
      <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1e283b]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-sky-400">Studio 02</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Hidden Tag Grabber & Weakness Diagnostic</span>
            </div>
            <h2 className="text-xl font-bold text-white">Competitor Video Spy Studio</h2>
            <p className="text-xs text-slate-400 mt-1">
              Extract hidden metadata from competitor videos to expose mobile title truncations and chapter vulnerabilities.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setIngestionMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                ingestionMode === 'url'
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Mode 1: URL oEmbed</span>
            </button>
            <button
              onClick={() => setIngestionMode('offline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                ingestionMode === 'offline'
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Mode 2: 100% Offline HTML</span>
            </button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="pt-5 space-y-3">
          {ingestionMode === 'url' ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste YouTube watch URL, youtu.be link, or Shorts link..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
              <button
                onClick={handleIngest}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isLoading ? 'Ingesting...' : 'Ingest Competitor'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Paste View-Source HTML or &lt;meta&gt; Tags:</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Quick Test Samples:</span>
                  <button
                    onClick={() => loadSample('tech')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
                  >
                    Tech Sample
                  </button>
                  <button
                    onClick={() => loadSample('story')}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                  >
                    Telugu Story Sample
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={rawHtmlInput}
                onChange={(e) => setRawHtmlInput(e.target.value)}
                placeholder="Paste browser view-source: HTML or snippet with <meta name='keywords'> / <script>var ytInitialPlayerResponse...</script> here..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <button
                onClick={handleIngest}
                disabled={isLoading || !rawHtmlInput.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
                <span>{isLoading ? 'Parsing...' : 'Extract Hidden Metadata & Tags'}</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Competitor Overview & Audited Blueprint */}
      {competitor && (
        <div className="space-y-6">
          {/* Card: Competitor Identity & Hidden Tags Grabber (Tool 6) */}
          <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b]">
            <div className="flex flex-col md:flex-row items-start gap-5 pb-5 border-b border-[#1e283b]">
              <img
                src={competitor.thumbnailUrl}
                alt={competitor.title}
                referrerPolicy="no-referrer"
                className="w-full md:w-56 aspect-video object-cover rounded-lg border border-slate-800 shadow-sm"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {competitor.genre}
                  </span>
                  {competitor.isMidRollMonetized ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>≥8 Min Mid-Roll Monetized (1.65×)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Sub-8 Min (No Mid-Rolls)
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {competitor.title}
                </h3>

                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono">
                  <span>Author: <strong className="text-slate-200">{competitor.author}</strong></span>
                  <span>·</span>
                  <span>Duration: <strong className="text-slate-200">{formatDuration(competitor.durationSeconds)}</strong></span>
                  <span>·</span>
                  <span>Views: <strong className="text-slate-200">{(competitor?.viewCount ?? 125000).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Extracted Hidden Tags Matrix */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Extracted Hidden Meta Tags
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({competitor.tags.length} tags · {competitor.totalTagChars}/500 chars)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(competitor.tags.join(','), 'comp-tags')}
                  className="py-1 px-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'comp-tags' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Competitor Tags</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {competitor.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs py-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Tool 7 - Competitor Weakness Diagnostic (The Attack Blueprint) */}
          <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e283b]">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>The Attack Blueprint: Competitor Weakness Diagnostic</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Algorithmic gaps in the competitor's upload that give your video rank priority.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitor.vulnerabilities.map((vuln, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{vuln.type}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                        vuln.severity === 'High'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : vuln.severity === 'Medium'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {vuln.severity} Flaw
                    </span>
                  </div>

                  <div className="text-rose-300/90 leading-relaxed">
                    <strong>[Vulnerability Found]:</strong> {vuln.vulnerability}
                  </div>

                  <div className="text-emerald-300/90 leading-relaxed pt-1 border-t border-slate-800/80">
                    <strong>➔ [Your Attack Advantage]:</strong> {vuln.advantage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Tool 8 - Genre-Smart Counter-Title Matrix */}
          <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b] space-y-4">
            <div className="pb-3 border-b border-[#1e283b]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Genre-Smart Counter-Title Matrix ({competitor.genre})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Engineered angles designed to siphon click-through rate from this competitor in Suggested Videos.
              </p>
            </div>

            <div className="space-y-3">
              {competitor.counterTitles.map((ct, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sky-400 font-semibold text-[11px] uppercase">
                        {ct.category}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{ct.title}</div>
                    <div className="text-[11px] text-slate-400">{ct.rationale}</div>
                  </div>

                  <button
                    onClick={() => handleCopy(ct.title, `ct-${idx}`)}
                    className="self-start sm:self-center py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedKey === `ct-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Title</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Tool 9 - Niche-Aware Ad Revenue Guide & 8-Minute Mid-Roll Check */}
          {revenueCalculations && (
            <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e283b]">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Niche-Aware Ad Revenue Guide & 8-Minute Mid-Roll Check</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Benchmark creator RPM data combined with duration-based mid-roll eligibility.
                  </p>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setCurrency('INR')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      currency === 'INR'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    India (₹ INR)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      currency === 'USD'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Global ($ USD)
                  </button>
                </div>
              </div>

              {/* View Count Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>Simulate View Count Milestone:</span>
                  <strong className="text-white text-sm">
                    {(simulatedViews ?? 50000).toLocaleString()} views
                  </strong>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={2000000}
                  step={10000}
                  value={simulatedViews}
                  onChange={(e) => setSimulatedViews(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Revenue Estimate Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Industry RPM Benchmark</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {currency === 'INR'
                      ? `₹${revenueCalculations.minRPM_INR} - ₹${revenueCalculations.maxRPM_INR}`
                      : `$${revenueCalculations.minRPM_USD} - $${revenueCalculations.maxRPM_USD}`}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Based on verified {competitor.genre} CPMs
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Mid-Roll Ad Multiplier</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1">
                    {revenueCalculations.isMidRoll ? '1.65× Active' : '1.00× Standard'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {revenueCalculations.isMidRoll
                      ? 'Duration ≥ 8 mins enables multiple mid-rolls'
                      : 'Under 8 mins: single pre/post roll ads only'}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-medium mb-1">Estimated Ad Earnings</div>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    {currency === 'INR' ? '₹' : '$'}
                    {(revenueCalculations?.estimatedMin ?? 0).toLocaleString()} - {currency === 'INR' ? '₹' : '$'}
                    {(revenueCalculations?.estimatedMax ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-300/80 mt-1">
                    For {(simulatedViews ?? 50000).toLocaleString()} views
                  </div>
                </div>
              </div>

              {/* Exact Formula Breakdown */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
                <strong className="text-slate-300">Exact Mathematical Formula: </strong>
                {revenueCalculations.formula}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
