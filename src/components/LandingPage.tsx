import React, { useState } from 'react';
import { ParticleGridCanvas } from './ParticleGridCanvas';
import { StudioTab } from '../types';
import {
  Search,
  Crosshair,
  CheckCircle2,
  FileAudio,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Cpu,
  Lock,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchStudio: (tab?: StudioTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const studios = [
    {
      id: 'keyword' as StudioTab,
      number: '01',
      title: 'Keyword & Topic Research Studio',
      description: 'Probe YouTube search autocomplete in real-time across alphabet stems and regional dialects without API keys.',
      badge: '5 Power Tools',
      features: [
        'A-to-Z Alphabet + Question Stem Expander via JSONP',
        'Algorithmic Popularity (0-100) & Competition Difficulty',
        'Trending & Breakout Velocity Triggers (🔥 / 📈 / 🌲)',
        'Hindi, Telugu, & Tinglish Conversational Dialect Probing',
        '4-Tier Tag Matrix Capped Strictly at 495 Characters',
      ],
      icon: Search,
      accent: 'text-[#fd5d5d]',
      border: 'hover:border-[#fd5d5d]/40',
    },
    {
      id: 'competitor' as StudioTab,
      number: '02',
      title: 'Competitor Video Spy & Diagnostic',
      description: 'Reverse-engineer competitor uploads via live URL oEmbed or 100% offline view-source HTML to expose tactical flaws.',
      badge: '4 Power Tools',
      features: [
        'Dual-Mode Ingestion (Live URL & Offline View-Source)',
        'The Attack Blueprint: Detect Mobile Cutoffs & Missing Chapters',
        'Genre-Smart Counter-Titles (Stories, Tech, Reviews)',
        'Niche RPM Estimator & 8-Minute Mid-Roll Ad Multiplier',
      ],
      icon: Crosshair,
      accent: 'text-sky-400',
      border: 'hover:border-sky-400/40',
    },
    {
      id: 'seo-score' as StudioTab,
      number: '03',
      title: 'Video SEO Score & Fixer',
      description: 'Audits on-page metadata with a 100-point algorithm and scans against official YouTube Advertiser-Friendly rules.',
      badge: '4 Power Tools',
      features: [
        '100-Point Real-Time RankMath Checklist with Recommendations',
        'Pixel-Perfect YouTube Mobile 50-Character Truncation Card',
        'First 120-Character Above-the-Fold Description Hook Scanner',
        'Advertiser-Safe Demonetization Word Scanner (Regex Policy DB)',
      ],
      icon: CheckCircle2,
      accent: 'text-emerald-400',
      border: 'hover:border-emerald-400/40',
    },
    {
      id: 'audio-media' as StudioTab,
      number: '04',
      title: 'Video File & Audio Chapters Studio',
      description: 'Inspect video files locally in browser, automatically detect speech pauses via Web Audio API, and audit thumbnail contrast.',
      badge: '3 Power Tools',
      features: [
        'Client-Side Web Audio Silence Detection (Zero File Upload)',
        'Automated Timestamp Chapter Generator (00:00 - Section)',
        'Thumbnail 3-Second Glance Eye-Scan Blur Simulator',
        'First 48-Hours Algorithmic Velocity Execution Checklist',
      ],
      icon: FileAudio,
      accent: 'text-amber-400',
      border: 'hover:border-amber-400/40',
    },
  ];

  const faqs = [
    {
      q: 'Does this app require YouTube Data API keys or Google Cloud setup?',
      a: 'No. TJP YouTube SEO Engine runs 100% client-side in your browser. It queries live YouTube autocomplete predictions via public JSONP endpoints and decodes video audio tracks using the browser Web Audio API. Zero API keys, zero quotas, and zero server storage.',
    },
    {
      q: 'How does the Competitor Spy extract tags without backend scraping?',
      a: 'Through Dual-Mode Ingestion: Mode 1 uses YouTube’s official public oEmbed API for instant video metadata. Mode 2 operates 100% offline — you can paste the browser "view-source:" HTML or the <meta name="keywords"> tag snippet from any video page to instantly parse hidden tags, exact duration, and description.',
    },
    {
      q: 'What is Tinglish and how does the Regional Language Finder work?',
      a: 'Tinglish is conversational Telugu typed phonetically in English letters (e.g., "ela cheyali", "telugu lo tips", "chudandi"). Millions of regional viewers search using these phrases. The engine probes YouTube search predictions with conversational regional stems to surface low-competition, high-intent traffic terms.',
    },
    {
      q: 'How does the Web Audio Chapter Generator work on video files?',
      a: 'When you drop an MP4, MOV, or WEBM file, your browser decodes the audio track locally into an AudioBuffer using the HTML5 Web Audio API. It performs root-mean-square (RMS) energy thresholding to locate speech breaks and natural topic transitions longer than 1.5 seconds, outputting ready-to-paste YouTube chapters.',
    },
    {
      q: 'How do I upgrade to unlimited Pro after my 3-day trial?',
      a: 'You can activate full unlimited Pro access directly through https://tjpromotions.pro. If you are testing the engine right now, you can also use the top header "Admin Controls" drawer to toggle Pro status or extend your trial days instantly.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#090c13] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#1e283b]">
        {/* Interactive WebGL / Canvas Particle Grid Background */}
        <ParticleGridCanvas className="opacity-70" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#fd5d5d]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Trust Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111723]/90 border border-[#1e283b] text-xs text-slate-300 mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#fd5d5d]" />
            <span className="font-medium">100% Client-Side Engine</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Zero Third-Party AI API Keys</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight text-balance">
            Rank YouTube Videos with <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#fd5d5d]">Signal-Driven SEO</span>, Not Guesswork
          </h1>

          {/* Hero Subcopy */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one client-side YouTube growth workstation. Probe live search autocomplete, reverse-engineer competitor tags, score on-page metadata, and generate audio chapters in your browser.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onLaunchStudio()}
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-[#fd5d5d] hover:bg-[#e04f4f] rounded-xl shadow-lg shadow-[#fd5d5d]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Launch Studio (3-Day Free Trial)</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="https://tjpromotions.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-300 hover:text-white bg-[#111723] hover:bg-slate-800 border border-[#1e283b] rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Powered by tjpromotions.pro</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>

          {/* Zero-Cost Verification Metrics Row */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-[#1e283b]/70 text-left">
            <div className="p-3 rounded-lg bg-[#111723]/60 border border-[#1e283b]">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>Runtime</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">100% In-Browser</div>
              <div className="text-[11px] text-slate-400 mt-0.5">CPU/GPU & Web Audio</div>
            </div>

            <div className="p-3 rounded-lg bg-[#111723]/60 border border-[#1e283b]">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>API Keys</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">Zero Keys Needed</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero CORS blocking</div>
            </div>

            <div className="p-3 rounded-lg bg-[#111723]/60 border border-[#1e283b]">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#fd5d5d]" />
                <span>Tag Matrix</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">495 / 500 Chars</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Strict YouTube cap</div>
            </div>

            <div className="p-3 rounded-lg bg-[#111723]/60 border border-[#1e283b]">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Power Tools</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">16 Native Tools</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Across 4 Studios</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: The 4 Unified Studios */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#fd5d5d]">
            Architectural Suite
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Four Dedicated Workstation Studios
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed">
            Every studio is engineered from mathematical algorithms, deterministic policy engines, and live browser APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studios.map((studio) => {
            const IconComponent = studio.icon;
            return (
              <div
                key={studio.id}
                className={`relative p-6 sm:p-7 rounded-xl bg-[#111723] border border-[#1e283b] ${studio.border} transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <IconComponent className={`w-5 h-5 ${studio.accent}`} />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {studio.number}. Studio
                      </span>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                      {studio.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{studio.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-5">
                    {studio.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {studio.features.map((feat, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${studio.accent}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onLaunchStudio(studio.id)}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open {studio.title.split(' ')[0]} Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Creator FAQ Accordion */}
      <section className="py-14 border-t border-[#1e283b] bg-[#0c101a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-2">
              Everything you need to know about the client-side execution model and zero-cost guarantee.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg bg-[#111723] border border-[#1e283b] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-100">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#fd5d5d]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="border-t border-[#1e283b] bg-[#090c13] py-10 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#fd5d5d] flex items-center justify-center text-white font-bold text-xs">
              TJP
            </div>
            <div>
              <div className="font-semibold text-slate-200">TJP YouTube SEO Engine</div>
              <div className="text-[11px] text-slate-500">
                Crafted for growth engineers and content creators.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLaunchStudio()}
              className="hover:text-white transition-colors"
            >
              Workstation
            </button>
            <a
              href="https://tjpromotions.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors text-slate-300"
            >
              <span>tjpromotions.pro</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">100% Client-Side Static Deployment</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
