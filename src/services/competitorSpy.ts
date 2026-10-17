import { CompetitorData } from '../types';

const NICHE_RPM_BENCHMARKS = {
  'Stories / Animation': { inrLow: 25, inrHigh: 55, usdLow: 0.30, usdHigh: 0.65 },
  'Tutorials / Tech': { inrLow: 80, inrHigh: 180, usdLow: 1.00, usdHigh: 2.20 },
  'Reviews / Products': { inrLow: 100, inrHigh: 250, usdLow: 1.20, usdHigh: 3.00 },
  'Vlogs / Entertainment': { inrLow: 25, inrHigh: 55, usdLow: 0.30, usdHigh: 0.65 },
};

export const SAMPLE_HTML_SOURCES: Record<string, string> = {
  techTutorial: `
    <title>Complete Python AI Tutorial 2026 - Zero to Hero - CodeCamp</title>
    <link itemprop="name" content="CodeCamp">
    <meta name="keyword" content="python tutorial, learn python, ai tutorial, python 2026, machine learning, coding for beginners, python full course, programming tutorial">
    <meta name="description" content="Master Python and AI in this complete 2026 tutorial. 00:00 - Introduction 05:20 - Python Basics 18:30 - Machine Learning Setup 35:00 - Final Project">
    <script>var ytInitialPlayerResponse = {"videoDetails":{"videoId":"PyThOn12345","title":"Complete Python AI Tutorial 2026 - Zero to Hero","lengthSeconds":"2450","keywords":["python tutorial","learn python","ai tutorial","python 2026","machine learning","coding for beginners","python full course","programming tutorial"],"viewCount":"245000"}};</script>
  `,
  storiesAnimation: `
    <title>The Golden Fox and The Magic Tree - Moral Bedtime Stories</title>
    <link itemprop="name" content="FairyTales World">
    <meta name="keyword" content="moral stories, bedtime story, animated stories, kids fairy tales, animated stories for kids, english stories, moral lessons, bedtime cartoon">
    <meta name="description" content="Enjoy this classic animated moral bedtime story about the golden fox.">
    <script>var ytInitialPlayerResponse = {"videoDetails":{"videoId":"StOrY567890","title":"The Golden Fox and The Magic Tree","lengthSeconds":"620","keywords":["moral stories","bedtime story","animated stories","kids fairy tales","animated stories for kids","english stories","moral lessons","bedtime cartoon"],"viewCount":"580000"}};</script>
  `,
  vlogsEntertainment: `
    <title>Surviving 24 Hours in an Abandoned Theme Park - Extreme Vlog</title>
    <link itemprop="name" content="DareDevils">
    <meta name="keyword" content="24 hour challenge, abandoned theme park, survival challenge, overnight challenge, extreme vlog, exploration">
    <meta name="description" content="We spent 24 hours locked inside an abandoned amusement park! Check out our gear: https://gear.example.com">
    <script>var ytInitialPlayerResponse = {"videoDetails":{"videoId":"VlOg9876543","title":"Surviving 24 Hours in an Abandoned Theme Park","lengthSeconds":"1120","keywords":["24 hour challenge","abandoned theme park","survival challenge","overnight challenge","extreme vlog","exploration"],"viewCount":"1200000"}};</script>
  `
};

export function extractVideoId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function detectGenre(text: string): CompetitorData['genre'] {
  const lower = text.toLowerCase();
  if (/story|stories|kathalu|kahani|animation|cartoon|bedtime|moral|fairytale|kids|మజ్జిగ|బంగారు/i.test(lower)) {
    return 'Stories / Animation';
  }
  if (/how to|tutorial|course|learn|coding|guide|tips|setup|method|python|react|ai|automation|seo|marketing/i.test(lower)) {
    return 'Tutorials / Tech';
  }
  if (/review|vs|comparison|unboxing|price|worth it|test|benchmark|specs|camera|pros and cons/i.test(lower)) {
    return 'Reviews / Products';
  }
  return 'Vlogs / Entertainment';
}

export function calculateRevenueGuide(
  views: number,
  genre: CompetitorData['genre'],
  isMidroll: boolean
): CompetitorData['revenueEst'] {
  const safeViews = Math.max(1000, views || 50000);
  const benchmark = NICHE_RPM_BENCHMARKS[genre] || NICHE_RPM_BENCHMARKS['Vlogs / Entertainment'];
  const midRollMultiplier = isMidroll ? 1.65 : 1.0;

  return {
    niche: genre,
    minRPM_INR: Math.round(benchmark.inrLow * midRollMultiplier),
    maxRPM_INR: Math.round(benchmark.inrHigh * midRollMultiplier),
    minRPM_USD: Number((benchmark.usdLow * midRollMultiplier).toFixed(2)),
    maxRPM_USD: Number((benchmark.usdHigh * midRollMultiplier).toFixed(2)),
    midRollMultiplier,
  };
}

export function generateCounterTitles(
  title: string,
  genre: CompetitorData['genre']
): CompetitorData['counterTitles'] {
  const isTelugu = /[\u0C00-\u0C7F]/.test(title);
  const primaryName = title.split(/[-–—|/]/)[0].trim();

  if (genre === 'Stories / Animation') {
    if (isTelugu) {
      return [
        {
          category: '🎬 పార్ట్ 2 / సీక్వెల్ హుక్',
          title: `${primaryName} పార్ట్ 2 (Untold Sequel Story)`,
          rationale: 'ఈ కథ చూసిన ప్రేక్షకులు వెంటనే నెక్స్ట్ పార్ట్ కోసం సెర్చ్ చేస్తారు. వాళ్ళని గ్రాబ్ చేసే హై-డిమాండ్ హుక్.',
        },
        {
          category: '🎭 కథ లో అసలు నిజం & మిస్టరీ ట్విస్ట్',
          title: `${primaryName} లో దాగి ఉన్న అసలు నిజం! (Shocking Ending)`,
          rationale: 'కథ తెలిసిన వాళ్ళు కూడా "ఇందులో ఏం కొత్త ట్విస్ట్ ఉంది?" అని ఆసక్తితో క్లిక్ చేస్తారు.',
        },
        {
          category: '💡 దాగి ఉన్న అసలైన నీతి',
          title: `ఈ కథలో ఎవ్వరికీ తెలియని నీతి ఇదే! (Moral Story 2026)`,
          rationale: 'తల్లిదండ్రులు మరియు ఉపాధ్యాయులు మంచి మెసేజ్ కోసం వెతికేటప్పుడు ఇది టాప్ లో ర్యాంక్ అవుతుంది.',
        },
      ];
    }

    return [
      {
        category: '🎬 The Sequel / Next Chapter',
        title: `${primaryName} Part 2: What Happened Next?`,
        rationale: 'Captures audience momentum searching for continuation and sequels.',
      },
      {
        category: '🎭 The Untold Secret Twist',
        title: `${primaryName}: The Shocking Truth Nobody Told You`,
        rationale: 'Promises an unexpected twist on the familiar narrative to pull higher CTR.',
      },
      {
        category: '💡 The Real Moral Explained',
        title: `The Real Moral Behind The ${primaryName} Story (Explained)`,
        rationale: 'Attracts viewers searching for deeper meaning and educational context.',
      },
    ];
  }

  if (genre === 'Reviews / Products') {
    return [
      {
        category: '⚠️ Brutal Truth Warning',
        title: `Why I Stopped Recommending ${primaryName} (Don't Buy Yet)`,
        rationale: 'Triggers loss aversion for shoppers considering a purchase.',
      },
      {
        category: '📊 30-Day Long-Term Test',
        title: `${primaryName} After 30 Days of Real Use (The Honest Truth)`,
        rationale: 'Beats generic unboxings with real-world durability and reliability data.',
      },
      {
        category: '⚔️ The Alternative Showdown',
        title: `${primaryName} vs The Competition: Is It Still Worth It?`,
        rationale: 'Directly captures undecided buyers comparing options.',
      },
    ];
  }

  if (genre === 'Tutorials / Tech') {
    return [
      {
        category: '🔥 The Direct Contrarian',
        title: `Stop Doing ${primaryName} The Old Way: Do This Instead`,
        rationale: 'Challenges outdated advice and triggers fear of missing the modern method.',
      },
      {
        category: '⚡ The Speed & Zero-Friction Hook',
        title: `${primaryName} in 8 Minutes: The Simple Blueprint Anyone Can Copy`,
        rationale: 'Promises the same transformation in a fraction of the time.',
      },
      {
        category: '📊 The Hard Proof & Data Hook',
        title: `I Tested ${primaryName} for 30 Days (Here Are The Real Results)`,
        rationale: 'Beats generic theoretical guides with undeniable empirical proof.',
      },
    ];
  }

  // Default: Vlogs / Entertainment
  return [
    {
      category: '👀 Behind The Scenes Twist',
      title: `What Really Happened During ${primaryName} (Uncut)`,
      rationale: 'Offers insider perspective and emotional authenticity to beat standard vlogs.',
    },
    {
      category: '⚡ Extreme Challenge',
      title: `Surviving ${primaryName} For 24 Hours Straight`,
      rationale: 'Standard viral format that dramatically increases retention across demographics.',
    },
    {
      category: '💬 The Honest Confession',
      title: `The Truth About ${primaryName} (My Final Confession)`,
      rationale: 'High intimacy and curiosity hook generating immediate click-through.',
    },
  ];
}

export function auditCompetitorWeaknesses(
  data: Pick<CompetitorData, 'title' | 'description' | 'tags' | 'totalTagChars' | 'durationSeconds'>
): CompetitorData['vulnerabilities'] {
  const vulnerabilities: CompetitorData['vulnerabilities'] = [];

  // 1. Mobile Title Cutoff Check
  if (data.title.length > 55) {
    const cutChar = data.title.slice(0, 52) + '...';
    const hiddenPercent = Math.round(((data.title.length - 50) / data.title.length) * 100);
    vulnerabilities.push({
      type: 'Mobile Title Cutoff',
      vulnerability: `Competitor's title is ${data.title.length} characters long. Approximately ${hiddenPercent}% of the title is cut off on mobile devices: "${cutChar}".`,
      advantage: 'Keep your title under 50 characters to hook viewers immediately on mobile feeds.',
      severity: 'High',
    });
  } else {
    vulnerabilities.push({
      type: 'Mobile Title Length',
      vulnerability: `Competitor kept their title concise (${data.title.length} characters). It displays fully on mobile.`,
      advantage: 'Match their concise length, but apply a stronger curiosity gap or emotional hook.',
      severity: 'Low',
    });
  }

  // 2. Video Chapters Check
  const hasChapters = /\b\d{1,2}:\d{2}\b/.test(data.description);
  if (!hasChapters) {
    vulnerabilities.push({
      type: 'Missing Video Chapters',
      vulnerability: 'Competitor video lacks 00:00 timestamps in description, forfeiting Google Search "Key Moments" carousel placement.',
      advantage: 'Include structured chapter timestamps to gain Google Search rich snippets.',
      severity: 'High',
    });
  } else {
    vulnerabilities.push({
      type: 'Video Chapters Present',
      vulnerability: 'Competitor utilized chapter timestamps in their description.',
      advantage: 'Use keyword-rich chapter titles rather than generic markers to out-rank them.',
      severity: 'Low',
    });
  }

  // 3. Tag Character Budget Check
  if (data.totalTagChars < 350) {
    vulnerabilities.push({
      type: 'Tag Space Under-Saturation',
      vulnerability: `Competitor only utilized ${data.totalTagChars} of 500 allowable tag characters (${data.tags.length} tags).`,
      advantage: `They left ${500 - data.totalTagChars} characters of free search real estate empty! Deploy a saturated 4-Tier Tag Matrix to out-index them.`,
      severity: 'Medium',
    });
  } else {
    vulnerabilities.push({
      type: 'Tag Saturation',
      vulnerability: `Competitor utilized their tag box well (${data.totalTagChars} / 500 chars).`,
      advantage: 'Their tags are saturated. Use exact bridge tags to infiltrate their Suggested Videos rail.',
      severity: 'Low',
    });
  }

  return vulnerabilities;
}

export function parseRawSourceHtml(rawHtml: string, videoUrl = ''): CompetitorData {
  let title = 'Unknown Title';
  let author = 'Creator Channel';
  let realTags: string[] = [];
  let description = '';
  let durationSeconds = 0;
  let viewCount = 125000;

  // 1. Tags (<meta name="keyword" content="..."> or JSON keywords)
  const metaTagMatch = rawHtml.match(/(?:name|property)=["']keywords?["']\s+content=["']([^"']*)["']/i) ||
                       rawHtml.match(/content=["']([^"']*)["']\s+(?:name|property)=["']keywords?["']/i);
  if (metaTagMatch && metaTagMatch[1]) {
    realTags = metaTagMatch[1].split(',').map((t) => t.trim()).filter(Boolean);
  }

  if (realTags.length === 0) {
    const jsonKeywords = rawHtml.match(/"keywords":\s*(\[[^\]]+\])/);
    if (jsonKeywords && jsonKeywords[1]) {
      try {
        const parsed = JSON.parse(jsonKeywords[1]);
        if (Array.isArray(parsed)) realTags = parsed.filter(Boolean);
      } catch (e) {}
    }
  }

  // 2. Title
  const titleMatch = rawHtml.match(/<title>([^<]*)<\/title>/i) ||
                     rawHtml.match(/<meta\s+name=["']title["']\s+content=["']([^"']*)["']/i) ||
                     rawHtml.match(/"title":"([^"]*)"/);
  if (titleMatch) {
    title = titleMatch[1].replace(' - YouTube', '').trim();
  }

  // 3. Author / Channel
  const authorMatch = rawHtml.match(/<link\s+itemprop=["']name["']\s+content=["']([^"']*)["']/i) ||
                      rawHtml.match(/"author":"([^"]*)"/) ||
                      rawHtml.match(/"ownerChannelName":"([^"]*)"/);
  if (authorMatch) author = authorMatch[1].trim();

  // 4. Duration
  const lengthMatch = rawHtml.match(/"lengthSeconds":"(\d+)"/);
  const msMatch = rawHtml.match(/"approxDurationMs":"(\d+)"/);
  if (lengthMatch) {
    durationSeconds = parseInt(lengthMatch[1], 10);
  } else if (msMatch) {
    durationSeconds = Math.round(parseInt(msMatch[1], 10) / 1000);
  } else {
    const isoDuration = rawHtml.match(/itemprop=["']duration["']\s+content=["']PT(?:(\d+)M)?(?:(\d+)S)?["']/i);
    if (isoDuration) {
      const mins = parseInt(isoDuration[1] || '0', 10);
      const secs = parseInt(isoDuration[2] || '0', 10);
      durationSeconds = mins * 60 + secs;
    }
  }

  // 5. Views
  const viewsMatch = rawHtml.match(/"viewCount":"(\d+)"/) || rawHtml.match(/itemprop=["']interactionCount["']\s+content=["'](\d+)["']/i);
  if (viewsMatch) viewCount = parseInt(viewsMatch[1], 10);

  // 6. Description
  const descMatch = rawHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                    rawHtml.match(/"shortDescription":"([^"]*)"/);
  if (descMatch) description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

  // Fallback tags from title segments if page had no tags
  if (realTags.length === 0 && title !== 'Unknown Title') {
    realTags = title
      .split(/[-–—|/:,•]/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 2 && s.length <= 40);
  }

  const videoId = extractVideoId(videoUrl) || 'dQw4w9WgXcQ';
  const totalTagChars = realTags.join(',').length;
  const isMidRollMonetized = durationSeconds >= 480;
  const genre = detectGenre(`${title} ${realTags.join(' ')}`);

  return {
    url: videoUrl,
    videoId,
    title,
    author,
    channelUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(author)}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    durationSeconds,
    viewCount,
    description: description || 'No description provided in metadata.',
    tags: realTags,
    totalTagChars,
    isMidRollMonetized,
    genre,
    vulnerabilities: auditCompetitorWeaknesses({ title, description, tags: realTags, totalTagChars, durationSeconds }),
    counterTitles: generateCounterTitles(title, genre),
    revenueEst: calculateRevenueGuide(viewCount, genre, isMidRollMonetized),
  };
}

export async function fetchCompetitorViaOEmbed(urlOrId: string): Promise<CompetitorData> {
  const videoId = extractVideoId(urlOrId) || urlOrId.trim();
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 1. Try Invidious Public API Node first for full metadata
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://invidious.nerdvpn.de/api/v1/videos/${videoId}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.title) {
        const rawTags = Array.isArray(json.keywords) ? json.keywords.filter(Boolean) : [];
        const durationSeconds = parseInt(json.lengthSeconds, 10) || 0;
        const totalTagChars = rawTags.join(',').length;
        const isMidRollMonetized = durationSeconds >= 480;
        const genre = detectGenre(`${json.title} ${rawTags.join(' ')}`);
        const viewCount = parseInt(json.viewCount, 10) || 125000;
        const description = json.description || '';

        return {
          url: targetUrl,
          videoId,
          title: json.title,
          author: json.author || 'Creator Channel',
          channelUrl: json.authorId ? `https://www.youtube.com/channel/${json.authorId}` : '',
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          durationSeconds,
          viewCount,
          description,
          tags: rawTags,
          totalTagChars,
          isMidRollMonetized,
          genre,
          vulnerabilities: auditCompetitorWeaknesses({ title: json.title, description, tags: rawTags, totalTagChars, durationSeconds }),
          counterTitles: generateCounterTitles(json.title, genre),
          revenueEst: calculateRevenueGuide(viewCount, genre, isMidRollMonetized),
        };
      }
    }
  } catch (e) {}

  // 2. Safe Fallback to Public oEmbed (No hardcoded Telugu stories!)
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`);
    if (!res.ok) throw new Error('oEmbed unavailable');
    const data = await res.json();

    const title = data.title || 'Unknown Title';
    const author = data.author_name || 'Creator';
    const fallbackTags = title
      .split(/[-–—|/:,•]/)
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s.length > 2 && s.length <= 40);

    const totalTagChars = fallbackTags.join(',').length;
    const genre = detectGenre(title);

    return {
      url: targetUrl,
      videoId,
      title,
      author,
      channelUrl: data.author_url || '',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      durationSeconds: 0,
      viewCount: 125000,
      description: 'Metadata restricted by YouTube oEmbed. Paste raw view-source in Mode 2 for all real tags.',
      tags: fallbackTags,
      totalTagChars,
      isMidRollMonetized: false,
      genre,
      vulnerabilities: auditCompetitorWeaknesses({ title, description: '', tags: fallbackTags, totalTagChars, durationSeconds: 0 }),
      counterTitles: generateCounterTitles(title, genre),
      revenueEst: calculateRevenueGuide(125000, genre, false),
    };
  } catch (e) {
    throw new Error('Unable to inspect video. Please verify the link or paste the view-source HTML in Mode 2.');
  }
}