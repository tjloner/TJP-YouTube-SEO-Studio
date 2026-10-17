import React, { useState } from 'react';
import { KeywordResult, TagMatrix } from '../types';
import {
  fetchYouTubeAutocomplete,
  calculateKeywordMetrics,
  ALPHABET_STEMS,
  QUESTION_STEMS,
  REGIONAL_STEMS,
  buildTagMatrix,
} from '../services/youtubeAutocomplete';
import { consumeQuery } from '../services/storage';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Filter,
  Play,
  Square,
  Globe,
  TrendingUp,
  Layers,
  Flame,
  Info,
} from 'lucide-react';

interface StudioKeywordResearchProps {
  onSessionRefresh: () => void;
  onQuotaExceeded: (msg: string) => void;
}

export const StudioKeywordResearch: React.FC<StudioKeywordResearchProps> = ({
  onSessionRefresh,
  onQuotaExceeded,
}) => {
  const [seedQuery, setSeedQuery] = useState('youtube seo');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentScanStep, setCurrentScanStep] = useState('');
  const [results, setResults] = useState<KeywordResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Breakout' | 'Rising' | 'Evergreen'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof REGIONAL_STEMS>('English');
  const [tagMatrix, setTagMatrix] = useState<TagMatrix | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Abort controller simulation flag
  const scanCancelledRef = React.useRef(false);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRunExpander = async (mode: 'fast' | 'full' | 'regional' = 'fast') => {
    if (!seedQuery.trim()) return;

    // Check quota
    const quota = consumeQuery();
    onSessionRefresh();
    if (!quota.success) {
      onQuotaExceeded(quota.message || 'Quota limit reached.');
      return;
    }

    scanCancelledRef.current = false;
    setIsScanning(true);
    setProgress(5);
    setCurrentScanStep('Querying root seed suggestions...');

    const harvested: KeywordResult[] = [];
    const root = seedQuery.trim();

    try {
      // 1. Root autocomplete
      const rootSuggestions = await fetchYouTubeAutocomplete(root);
      rootSuggestions.forEach((sugg, idx) => {
        harvested.push(calculateKeywordMetrics(sugg, idx, 'seed', 'root'));
      });
      setProgress(25);

      if (scanCancelledRef.current) {
        finishScan(harvested, root);
        return;
      }

      // 2. Question / Intent Stems
      setCurrentScanStep('Probing question triggers (how, best, vs)...');
      for (let i = 0; i < QUESTION_STEMS.length; i++) {
        if (scanCancelledRef.current) break;
        const stem = QUESTION_STEMS[i];
        const q = `${stem} ${root}`;
        const sug = await fetchYouTubeAutocomplete(q);
        sug.slice(0, 3).forEach((item, idx) => {
          if (!harvested.some((h) => h.keyword.toLowerCase() === item.toLowerCase())) {
            harvested.push(calculateKeywordMetrics(item, idx, 'question', stem));
          }
        });
        setProgress(25 + Math.round(((i + 1) / QUESTION_STEMS.length) * 25));
      }

      if (scanCancelledRef.current) {
        finishScan(harvested, root);
        return;
      }

      // 3. Regional Dialect Stems (Hindi / Telugu / Tinglish)
      setCurrentScanStep(`Probing regional dialect variations (${selectedLanguage})...`);
      const regionalList = REGIONAL_STEMS[selectedLanguage] || [];
      for (let i = 0; i < regionalList.length; i++) {
        if (scanCancelledRef.current) break;
        const regStem = regionalList[i];
        const q = `${root} ${regStem}`;
        const sug = await fetchYouTubeAutocomplete(q);
        sug.slice(0, 3).forEach((item, idx) => {
          if (!harvested.some((h) => h.keyword.toLowerCase() === item.toLowerCase())) {
            harvested.push(calculateKeywordMetrics(item, idx, 'regional', regStem));
          }
        });
      }
      setProgress(70);

      // 4. A-Z stems (Alphabet expander)
      if (mode === 'full') {
        setCurrentScanStep('Probing A-to-Z alphabet stems...');
        // Sample stems to keep latency crisp
        const stemsToTest = ALPHABET_STEMS.slice(0, 12);
        for (let i = 0; i < stemsToTest.length; i++) {
          if (scanCancelledRef.current) break;
          const letter = stemsToTest[i];
          const q = `${root} ${letter}`;
          const sug = await fetchYouTubeAutocomplete(q);
          sug.slice(0, 2).forEach((item, idx) => {
            if (!harvested.some((h) => h.keyword.toLowerCase() === item.toLowerCase())) {
              harvested.push(calculateKeywordMetrics(item, idx, 'alphabet', letter));
            }
          });
          setProgress(70 + Math.round(((i + 1) / stemsToTest.length) * 30));
        }
      }

      setProgress(100);
      finishScan(harvested, root);
    } catch (err) {
      console.error('Error during keyword expansion', err);
      finishScan(harvested, root);
    }
  };

  const finishScan = (harvested: KeywordResult[], root: string) => {
    setIsScanning(false);
    setResults(harvested);
    const matrix = buildTagMatrix(root, harvested, selectedLanguage);
    setTagMatrix(matrix);
    setActiveTags(matrix.allTags);
    setCurrentScanStep('');
  };

  const handleStopScan = () => {
    scanCancelledRef.current = true;
    setIsScanning(false);
    setCurrentScanStep('Scan paused.');
  };

  // Toggle individual tag chip
  const handleToggleTag = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      const prospective = [...activeTags, tag].join(',').length;
      if (prospective <= 495) {
        setActiveTags([...activeTags, tag]);
      }
    }
  };

  // Filtered results
  const filteredKeywords = results.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.velocity === activeFilter;
  });

  const activeTagChars = activeTags.join(',').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Studio Header & Seed Search */}
      <div className="p-6 rounded-xl bg-[#111723] border border-[#1e283b]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1e283b]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-semibold text-[#fd5d5d]">Studio 01</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400">Zero API Keys · Live JSONP Predictions</span>
            </div>
            <h2 className="text-xl font-bold text-white">Keyword & Topic Research Studio</h2>
            <p className="text-xs text-slate-400 mt-1">
              Probe YouTube’s live autocomplete index across alphabet stems, questions, and regional dialects.
            </p>
          </div>

          {/* Regional Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Language:</span>
            </span>
            {(['English', 'Hindi', 'Telugu', 'Tinglish'] as (keyof typeof REGIONAL_STEMS)[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedLanguage === lang
                    ? 'bg-[#fd5d5d] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={seedQuery}
              onChange={(e) => setSeedQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleRunExpander('fast')}
              placeholder="Enter seed topic (e.g. youtube seo, python tutorial, telugu stories)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#fd5d5d] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isScanning ? (
              <button
                onClick={handleStopScan}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-rose-300" />
                <span>Stop Probe</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleRunExpander('fast')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-white bg-[#fd5d5d] hover:bg-[#e04f4f] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Fast Probe</span>
                </button>
                <button
                  onClick={() => handleRunExpander('full')}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>A-to-Z Expander</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        {isScanning && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>{currentScanStep}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-[#fd5d5d] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results View: Popularity, Competition & Velocity Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Keyword Table (Tools 1, 2, 3, 4) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-[#111723] border border-[#1e283b]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e283b]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Live Suggester Intelligence</h3>
                  <span className="text-xs font-mono text-slate-400">
                    ({results.length} total captured)
                  </span>
                </div>

                {/* Velocity Filter Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                  {(['All', 'Breakout', 'Rising', 'Evergreen'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                        activeFilter === filter
                          ? 'bg-[#111723] text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filter === 'Breakout' && '🔥 '}
                      {filter === 'Rising' && '📈 '}
                      {filter === 'Evergreen' && '🌲 '}
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyword Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e283b] text-slate-400 font-medium">
                      <th className="pb-2.5 pl-1">Suggestion Query</th>
                      <th className="pb-2.5 text-center">Score</th>
                      <th className="pb-2.5 text-center">Difficulty</th>
                      <th className="pb-2.5 text-center">Velocity</th>
                      <th className="pb-2.5 text-right pr-1">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e283b]/60">
                    {filteredKeywords.slice(0, 30).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors group">
                        <td className="py-2.5 pl-1 text-slate-200 font-medium flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-[11px] w-5">
                            {item.rank}.
                          </span>
                          <span>{item.keyword}</span>
                          {item.source === 'regional' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                              {selectedLanguage}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-center font-mono tabular-nums text-slate-200">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              item.popularityScore >= 80
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : item.popularityScore >= 50
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-slate-400 bg-slate-800'
                            }`}
                          >
                            {item.popularityScore}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              item.competitionLevel === 'Low'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : item.competitionLevel === 'Medium'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            <span>●</span>
                            <span>{item.competitionLevel}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="text-[11px] font-medium text-slate-300">
                            {item.velocity === 'Breakout' && (
                              <span className="text-rose-400 flex items-center justify-center gap-1">
                                <Flame className="w-3 h-3" /> +500%
                              </span>
                            )}
                            {item.velocity === 'Rising' && (
                              <span className="text-emerald-400 flex items-center justify-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Rising
                              </span>
                            )}
                            {item.velocity === 'Evergreen' && (
                              <span className="text-slate-400">🌲 Steady</span>
                            )}
                          </span>
                        </td>
                        <td className="py-2.5 text-right pr-1">
                          <button
                            onClick={() => handleCopy(item.keyword, item.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Copy Keyword"
                          >
                            {copiedKey === item.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tool 5: 4-Tier Tag Matrix & Dedicated #Hashtags */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#111723] border border-[#1e283b] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e283b]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Smart 4-Tier Tag Matrix</h3>
                  <span className="text-xs font-mono text-slate-400">
                    ({activeTags.length} tags)
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(activeTags.join(','), 'all-tags')}
                  className="py-1 px-2.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
                >
                  {copiedKey === 'all-tags' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Tags</span>
                    </>
                  )}
                </button>
              </div>

              {/* Character Limit Gauge (Strictly 495 / 500) */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400">YouTube Tag Character Cap:</span>
                  <span
                    className={`font-bold tabular-nums ${
                      activeTagChars > 490
                        ? 'text-amber-400'
                        : activeTagChars >= 350
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {activeTagChars} / 500 chars
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      activeTagChars > 495
                        ? 'bg-rose-500'
                        : activeTagChars >= 350
                        ? 'bg-emerald-500'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${Math.min(100, (activeTagChars / 500) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Creator Guidance Notice */}
              <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200/90 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Creator Guidance:</strong> These tags are strategic suggestions. You can copy the full bundle or tap individual tags to pick only what you need.
                </span>
              </div>

              {/* Interactive Tag Chips */}
              <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
                {tagMatrix?.allTags.map((tag) => {
                  const isSelected = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs py-1 px-2.5 rounded-md font-medium transition-all text-left flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-500'
                          : 'bg-slate-950/60 text-slate-500 border border-slate-900 line-through hover:text-slate-400'
                      }`}
                    >
                      <span>{tag}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({tag.length})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dedicated #Hashtags Pack */}
              {tagMatrix && tagMatrix.hashtags.length > 0 && (
                <div className="pt-3 border-t border-[#1e283b]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Dedicated #Hashtags Pack (Top Picks)
                    </span>
                    <button
                      onClick={() => handleCopy(tagMatrix.hashtags.join(' '), 'all-hashtags')}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      {copiedKey === 'all-hashtags' ? (
                        <span className="text-emerald-400 font-semibold">✓ Copied!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy #Pack</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tagMatrix.hashtags.map((ht) => (
                      <span
                        key={ht}
                        className="text-xs font-mono text-sky-400 bg-sky-950/40 border border-sky-800/50 px-2 py-0.5 rounded"
                      >
                        {ht}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
