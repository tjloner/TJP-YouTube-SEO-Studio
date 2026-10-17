import { CompetitorData } from '../types';

export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const clean = url.trim();
  // Standard watch: youtube.com/watch?v=ID
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Short URL: youtu.be/ID
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Shorts: youtube.com/shorts/ID
  const shortsMatch = clean.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Embed: youtube.com/embed/ID
  const embedMatch = clean.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  return null;
};

/**
 * Mode 1: Fetch metadata via YouTube's public oEmbed endpoint.
 * Works natively in browser without API keys.
 */
export const fetchCompetitorViaOEmbed = async (url: string): Promise<Partial<CompetitorData>> => {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL. Please provide a valid watch link, youtu.be, or Shorts URL.');
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  
  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Video not found. It may be private, deleted, or unlisted.');
      }
      throw new Error(`YouTube oEmbed returned HTTP status ${res.status}`);
    }

    const data = await res.json();
    return {
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: data.title || 'Untitled Video',
      author: data.author_name || 'Creator',
      channelUrl: data.author_url || '',
      thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unable to connect to YouTube oEmbed service.';
    throw new Error(msg);
  }
};

/**
 * Parse ISO 8601 duration (e.g. PT14M32S) to seconds
 */
const parseISO8601Duration = (iso: string): number => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Mode 2: Parse raw browser view-source HTML snippet.
 * Extracts title, author, duration, keywords meta tag, views, and description.
 */
export const parseRawSourceHtml = (rawHtml: string): Partial<CompetitorData> => {
  if (!rawHtml || rawHtml.length < 10) {
    throw new Error('Pasted source HTML is too short. Please paste the full HTML or <meta> section.');
  }

  // 1. Title
  let title = '';
  const titleMetaMatch = rawHtml.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
    rawHtml.match(/<title>([^<]+)<\/title>/i) ||
    rawHtml.match(/"title":\s*"([^"]+)"/);
  if (titleMetaMatch) {
    title = titleMetaMatch[1].replace(/ - YouTube$/, '').trim();
  }

  // 2. Author / Channel
  let author = '';
  const authorMatch = rawHtml.match(/<link\s+itemprop="name"\s+content="([^"]+)"/i) ||
    rawHtml.match(/<meta\s+name="author"\s+content="([^"]+)"/i) ||
    rawHtml.match(/"ownerChannelName":\s*"([^"]+)"/) ||
    rawHtml.match(/"channelTitle":\s*"([^"]+)"/);
  if (authorMatch) {
    author = authorMatch[1].trim();
  }

  // 3. Tags / Keywords
  const tags: string[] = [];
  const metaKeywordsMatch = rawHtml.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
  if (metaKeywordsMatch) {
    const split = metaKeywordsMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    tags.push(...split);
  }

  // Also check JSON keywords array: "keywords":["tag1","tag2"]
  const jsonKeywordsMatch = rawHtml.match(/"keywords":\s*\[(.*?)\]/);
  if (jsonKeywordsMatch) {
    try {
      const parsed = JSON.parse(`[${jsonKeywordsMatch[1]}]`);
      if (Array.isArray(parsed)) {
        parsed.forEach((t: unknown) => {
          const str = String(t).trim();
          if (str && !tags.includes(str)) tags.push(str);
        });
      }
    } catch {
      // fallback regex for array items
      const itemMatches = jsonKeywordsMatch[1].match(/"([^"]+)"/g);
      if (itemMatches) {
        itemMatches.forEach((m) => {
          const cleaned = m.replace(/^"|"$/g, '').trim();
          if (cleaned && !tags.includes(cleaned)) tags.push(cleaned);
        });
      }
    }
  }

  // 4. Duration
  let durationSeconds = 0;
  const approxDurationMatch = rawHtml.match(/"approxDurationMs":\s*"(\d+)"/);
  if (approxDurationMatch) {
    durationSeconds = Math.round(parseInt(approxDurationMatch[1], 10) / 1000);
  } else {
    const lengthSecondsMatch = rawHtml.match(/"lengthSeconds":\s*"(\d+)"/);
    if (lengthSecondsMatch) {
      durationSeconds = parseInt(lengthSecondsMatch[1], 10);
    } else {
      const isoDurationMatch = rawHtml.match(/itemprop="duration"\s+content="([^"]+)"/i);
      if (isoDurationMatch) {
        durationSeconds = parseISO8601Duration(isoDurationMatch[1]);
      }
    }
  }

  // 5. Views
  let viewCount = 45000;
  const viewMatch = rawHtml.match(/"viewCount":\s*"(\d+)"/);
  if (viewMatch) {
    viewCount = parseInt(viewMatch[1], 10);
  }

  // 6. Description
  let description = '';
  const descMatch = rawHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
    rawHtml.match(/"shortDescription":\s*"([^"]+)"/);
  if (descMatch) {
    description = descMatch[1].replace(/\\n/g, '\n').trim();
  }

  // 7. Video ID
  let videoId = '';
  const videoIdMatch = rawHtml.match(/"videoId":\s*"([a-zA-Z0-9_-]{11})"/);
  if (videoIdMatch) {
    videoId = videoIdMatch[1];
  }

  return {
    videoId: videoId || 'dQw4w9WgXcQ',
    title: title || 'Competitor Target Video',
    author: author || 'Competitor Channel',
    durationSeconds: durationSeconds || 540,
    viewCount,
    description,
    tags,
    thumbnailUrl: videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  };
};

/**
 * Detects genre based on keywords, title, and tags
 */
export const detectGenre = (
  title: string,
  tags: string[]
): CompetitorData['genre'] => {
  const combined = `${title} ${tags.join(' ')}`.toLowerCase();
  
  if (
    combined.includes('story') ||
    combined.includes('kathalu') ||
    combined.includes('moral') ||
    combined.includes('animation') ||
    combined.includes('telugu kathalu') ||
    combined.includes('fairy tale') ||
    combined.includes('cartoon')
  ) {
    return 'Stories / Animation';
  }

  if (
    combined.includes('tutorial') ||
    combined.includes('code') ||
    combined.includes('how to') ||
    combined.includes('python') ||
    combined.includes('ai') ||
    combined.includes('seo') ||
    combined.includes('guide') ||
    combined.includes('software')
  ) {
    return 'Tutorials / Tech';
  }

  if (
    combined.includes('review') ||
    combined.includes('unboxing') ||
    combined.includes('vs') ||
    combined.includes('camera') ||
    combined.includes('iphone') ||
    combined.includes('specs')
  ) {
    return 'Reviews / Products';
  }

  return 'Vlogs / Entertainment';
};

/**
 * Diagnostic Weakness Audit: The Attack Blueprint
 */
export const auditCompetitorWeaknesses = (
  title: string,
  description: string,
  tags: string[],
  durationSeconds: number
): CompetitorData['vulnerabilities'] => {
  const weaknesses: CompetitorData['vulnerabilities'] = [];
  const titleLen = title.length;
  const tagChars = tags.join(',').length;

  // 1. Mobile Title Cutoff (YouTube mobile truncates around 50-55 chars)
  if (titleLen > 55) {
    const cutChars = titleLen - 55;
    const cutPercent = Math.round((cutChars / titleLen) * 100);
    weaknesses.push({
      type: 'Mobile Title Cutoff',
      vulnerability: `Competitor title is ${titleLen} characters long. Approximately ${cutPercent}% of the title is cut off with '...' on mobile screens.`,
      advantage: `Front-load your target keyword in the first 45 characters so 100% of mobile users see your primary hook immediately.`,
      severity: 'High',
    });
  }

  // 2. Missing Video Chapters (loss of Google Search Key Moments)
  const hasChapters = /0?0:00/.test(description) && /\d{1,2}:\d{2}/.test(description);
  if (!hasChapters && durationSeconds > 180) {
    weaknesses.push({
      type: 'Missing Video Chapters',
      vulnerability: `Competitor video lacks '00:00' timestamp chapters in description, forfeiting rich Google Search 'Key Moments' carousel placements.`,
      advantage: `Include at least 4 clear timestamp chapters starting at 00:00 to siphon rich snippet organic traffic from Google Search.`,
      severity: 'High',
    });
  }

  // 3. Tag Space Under-Saturation
  if (tagChars < 350) {
    const wastedChars = 500 - tagChars;
    weaknesses.push({
      type: 'Tag Space Under-Saturation',
      vulnerability: `Competitor only utilized ${tagChars} of 500 allowable tag characters (${wastedChars} characters left unranked).`,
      advantage: `Deploy a saturated 4-Tier Tag Matrix up to 495 characters with exact synonyms to capture adjacent suggested video slots.`,
      severity: 'Medium',
    });
  }

  // 4. Description First 120-Chars Hook Check
  const first120 = description.slice(0, 120).toLowerCase();
  const lacksCta = !first120.includes('http') && !first120.includes('watch') && !first120.includes('subscribe');
  if (lacksCta) {
    weaknesses.push({
      type: 'Weak Mobile Description Hook',
      vulnerability: `First 120 characters before 'Show More' lack clear call-to-action or keyword prominence.`,
      advantage: `Position your core keyword, value proposition, and primary link within the first 110 characters.`,
      severity: 'Medium',
    });
  }

  // 5. Short Video Missing Mid-Roll Monetization
  if (durationSeconds < 480 && durationSeconds > 300) {
    const diff = 480 - durationSeconds;
    const mins = Math.ceil(diff / 60);
    weaknesses.push({
      type: 'Sub-8 Minute Monetization Gap',
      vulnerability: `Video is only ${(durationSeconds / 60).toFixed(1)} mins, missing YouTube's 8-minute mid-roll ad threshold.`,
      advantage: `Expand your video depth to 8:15+ minutes with an actionable case study to unlock 1.65× revenue per 1,000 views.`,
      severity: 'Low',
    });
  }

  return weaknesses;
};

/**
 * Genre-Smart Counter-Title Generator
 */
export const generateCounterTitles = (
  originalTitle: string,
  genre: CompetitorData['genre'],
  tags: string[]
): CompetitorData['counterTitles'] => {
  const rootTopic = originalTitle.split(/[:|\-–]/)[0].trim();
  const cleanTopic = rootTopic.replace(/(tutorial|how to|review|in hindi|telugu lo)/gi, '').trim() || 'This';

  if (genre === 'Stories / Animation') {
    return [
      {
        category: 'Narrative Mystery & Twist',
        title: `${cleanTopic}: The Untold Secret Ending (Nobody Expected This)`,
        rationale: 'Creates an irresistible curiosity gap that challenges the competitor’s conventional ending.',
      },
      {
        category: 'Sequel / Part 2 Hook',
        title: `${cleanTopic} Part 2: What Happened 10 Years Later?`,
        rationale: 'Captures viewers seeking continuation immediately after watching the competitor video.',
      },
      {
        category: 'Regional Telugu / Native Hook',
        title: `${cleanTopic} - Asalu Em Jarigindi? (Hidden Moral Explained in Telugu)`,
        rationale: 'Appeals directly to regional regional-language viewers seeking deeper emotional closure.',
      },
      {
        category: 'Hidden Truth / Analysis',
        title: `The Shocking Truth Behind ${cleanTopic} (Animated Breakdown)`,
        rationale: 'Positions your upload as the definitive documentary-style analysis of the story.',
      },
    ];
  }

  if (genre === 'Tutorials / Tech') {
    return [
      {
        category: 'Contrarian Authority',
        title: `Stop Doing ${cleanTopic} Like This (Why 90% Fail in 2026)`,
        rationale: 'Disrupts the viewer’s complacency and frames existing tutorials as outdated or suboptimal.',
      },
      {
        category: 'Speed Blueprint',
        title: `Master ${cleanTopic} in 8 Minutes (Step-by-Step Blueprint)`,
        rationale: 'Promises maximum knowledge density without the fluff of 30-minute tutorials.',
      },
      {
        category: 'Proof & Field-Tested',
        title: `I Tested Every ${cleanTopic} Method: Here Is What Actually Works`,
        rationale: 'Builds immediate credibility by presenting genuine comparative experimentation.',
      },
      {
        category: 'Beginner to Advanced',
        title: `${cleanTopic} Complete Roadmap (Zero to Advanced Production)`,
        rationale: 'Evergreen pillar content that gathers high search intent and long watch time.',
      },
    ];
  }

  if (genre === 'Reviews / Products') {
    return [
      {
        category: 'Brutal Honesty',
        title: `${cleanTopic} Review After 30 Days: Do NOT Buy Until You Watch This`,
        rationale: 'High buyer-intent phrase that prevents instant regret and boosts click-through rate.',
      },
      {
        category: 'Direct Head-to-Head',
        title: `${cleanTopic} vs The Competition: The Real Winner Revealed`,
        rationale: 'Siphons comparison search queries from shoppers deciding between choices.',
      },
      {
        category: 'Long-Term Durability',
        title: `${cleanTopic}: 6 Months Later (What Other Reviews Won't Tell You)`,
        rationale: 'Positions the review as genuine real-world testing rather than an unboxing first impression.',
      },
      {
        category: 'Budget Value Check',
        title: `Is ${cleanTopic} Still Worth It in 2026? (Honest Verdict)`,
        rationale: 'Attracts both new buyers and users considering refurbished or previous-generation options.',
      },
    ];
  }

  // Entertainment / Vlogs
  return [
    {
      category: 'Behind-The-Scenes Truth',
      title: `What Really Happened During ${cleanTopic} (Uncut Reaction)`,
      rationale: 'Offers insider perspective and emotional authenticity that the competitor omitted.',
    },
    {
      category: 'Extreme Challenge',
      title: `Surviving ${cleanTopic} for 24 Hours Straight`,
      rationale: 'Standard viral format that maximizes retention across broad demographics.',
    },
    {
      category: 'Viewer Debate',
      title: `Was ${cleanTopic} Actually Worth It? (My Final Confession)`,
      rationale: 'Ignites discussion in the comments, boosting algorithmic engagement signals.',
    },
  ];
};

/**
 * Niche RPM and Mid-Roll Ad revenue calculations
 */
export const calculateRevenueGuide = (
  genre: CompetitorData['genre'],
  durationSeconds: number,
  views: number,
  currency: 'INR' | 'USD' = 'INR'
) => {
  const isMidRoll = durationSeconds >= 480;
  const midRollMultiplier = isMidRoll ? 1.65 : 1.0;

  // Real RPM benchmarks
  let minRPM_INR = 30;
  let maxRPM_INR = 65;
  let minRPM_USD = 0.35;
  let maxRPM_USD = 0.75;

  if (genre === 'Stories / Animation') {
    minRPM_INR = 30;
    maxRPM_INR = 65;
    minRPM_USD = 0.35;
    maxRPM_USD = 0.75;
  } else if (genre === 'Tutorials / Tech') {
    minRPM_INR = 80;
    maxRPM_INR = 180;
    minRPM_USD = 1.0;
    maxRPM_USD = 2.2;
  } else if (genre === 'Reviews / Products') {
    minRPM_INR = 90;
    maxRPM_INR = 210;
    minRPM_USD = 1.1;
    maxRPM_USD = 2.5;
  } else {
    // Vlogs / Entertainment
    minRPM_INR = 25;
    maxRPM_INR = 55;
    minRPM_USD = 0.3;
    maxRPM_USD = 0.65;
  }

  const thousandsOfViews = views / 1000;
  const estimatedMinINR = Math.round(thousandsOfViews * minRPM_INR * midRollMultiplier);
  const estimatedMaxINR = Math.round(thousandsOfViews * maxRPM_INR * midRollMultiplier);

  const estimatedMinUSD = Number((thousandsOfViews * minRPM_USD * midRollMultiplier).toFixed(2));
  const estimatedMaxUSD = Number((thousandsOfViews * maxRPM_USD * midRollMultiplier).toFixed(2));

  return {
    isMidRoll,
    midRollMultiplier,
    minRPM_INR,
    maxRPM_INR,
    minRPM_USD,
    maxRPM_USD,
    estimatedMin: currency === 'INR' ? estimatedMinINR : estimatedMinUSD,
    estimatedMax: currency === 'INR' ? estimatedMaxINR : estimatedMaxUSD,
    formula: `(${views.toLocaleString()} views / 1,000) × RPM (${currency === 'INR' ? `₹${minRPM_INR}-₹${maxRPM_INR}` : `$${minRPM_USD}-$${maxRPM_USD}`}) × ${isMidRoll ? '1.65 (≥8 min Mid-Rolls active)' : '1.00 (No Mid-Rolls)'}`,
  };
};

/**
 * Pre-configured offline HTML samples for instant user testing
 */
export const SAMPLE_HTML_SOURCES = {
  tech: `
    <title>Next.js 15 Full Tutorial - Build a Production SaaS App in 2026 - YouTube</title>
    <meta name="title" content="Next.js 15 Full Tutorial - Build a Production SaaS App in 2026">
    <meta name="author" content="CodeLab Academy">
    <meta name="keywords" content="nextjs, nextjs 15, react 19, web development, javascript tutorial, tailwind css, full stack tutorial, server components, typescript tutorial, saas blueprint">
    <meta name="description" content="In this comprehensive tutorial, we build a production SaaS web application using Next.js 15, React 19, and Tailwind. Timestamps below.">
    <span itemprop="duration" content="PT14M35S"></span>
    <script>var ytInitialPlayerResponse = {"videoDetails":{"videoId":"kXYiU_JCYtU","title":"Next.js 15 Full Tutorial - Build a Production SaaS App in 2026","lengthSeconds":"875","keywords":["nextjs","nextjs 15","react 19","web development","javascript tutorial","tailwind css","full stack tutorial","server components","typescript tutorial","saas blueprint"],"viewCount":"142850","shortDescription":"In this comprehensive tutorial, we build a production SaaS web application using Next.js 15, React 19, and Tailwind."}};</script>
  `,
  story: `
    <title>The Greedy Merchant Story in Telugu - Moral Stories for Kids - Telugu Kathalu - YouTube</title>
    <meta name="title" content="The Greedy Merchant Story in Telugu - Moral Stories for Kids - Telugu Kathalu">
    <meta name="author" content="Telugu Animation Studio">
    <meta name="keywords" content="telugu stories, moral stories, telugu kathalu, animated stories, kids bedtime stories, panchatantra telugu, animated fairy tales, latest telugu kathalu">
    <meta name="description" content="Watch this classic Telugu moral story of the greedy merchant. Learn why greed leads to sorrow. Subscribe for more Telugu Kathalu.">
    <span itemprop="duration" content="PT6M20S"></span>
    <script>var ytInitialPlayerResponse = {"videoDetails":{"videoId":"AbCdEfGhIjK","title":"The Greedy Merchant Story in Telugu - Moral Stories for Kids - Telugu Kathalu","lengthSeconds":"380","keywords":["telugu stories","moral stories","telugu kathalu","animated stories","kids bedtime stories","panchatantra telugu","animated fairy tales","latest telugu kathalu"],"viewCount":"890400","shortDescription":"Watch this classic Telugu moral story of the greedy merchant."}};</script>
  `,
};
