import { KeywordResult, TagMatrix } from '../types';

/**
 * Executes a client-side JSONP request to YouTube's public autocomplete endpoint.
 * Zero API keys, zero server-side proxy needed, zero CORS errors.
 */
export const fetchYouTubeAutocomplete = (query: string): Promise<string[]> => {
  return new Promise((resolve) => {
    if (!query.trim()) {
      resolve([]);
      return;
    }

    const callbackName = `yt_suggest_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    
    // Timeout safeguard: resolve empty if network drops or blocks
    const timeout = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 4000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any)[callbackName];
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)[callbackName] = undefined;
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      try {
        if (Array.isArray(data) && Array.isArray(data[1])) {
          // Format from suggestqueries.google.com: [query, [[term1, 0, [5, 23]], [term2, 0, ...]]]
          const suggestions = data[1].map((item: unknown) => {
            if (Array.isArray(item)) return String(item[0]);
            return String(item);
          });
          resolve(suggestions);
        } else {
          resolve([]);
        }
      } catch {
        resolve([]);
      }
    };

    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(
      query
    )}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

/**
 * Computes deterministic popularity, competition, and velocity metrics based on
 * genuine autocomplete position rank, token entropy, and intent syntax.
 */
export const calculateKeywordMetrics = (
  keyword: string,
  rankIndex: number,
  source: 'alphabet' | 'question' | 'regional' | 'seed',
  stem: string
): KeywordResult => {
  const words = keyword.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = keyword.toLowerCase();

  // 1. Popularity Score (0-100):
  // YouTube orders suggestions by real search volume prominence. Rank 0 is top.
  // We attenuate score by rank and reward high-intent terms.
  const baseRankScore = Math.max(15, 100 - rankIndex * 7);
  const lengthModifier = wordCount >= 3 && wordCount <= 5 ? 5 : wordCount > 6 ? -8 : 0;
  const popularityScore = Math.min(99, Math.max(20, Math.round(baseRankScore + lengthModifier)));

  // 2. Competition Level:
  // Short head keywords (1-2 words) have saturated High competition.
  // 3-4 words have Medium. Long-tail question keywords (5+ words) have Low competition.
  let competitionLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  if (wordCount <= 2) {
    competitionLevel = 'High';
  } else if (wordCount >= 5 || source === 'question') {
    competitionLevel = 'Low';
  } else {
    competitionLevel = 'Medium';
  }

  // 3. Trending & Velocity:
  const currentYear = new Date().getFullYear().toString();
  const nextYear = (new Date().getFullYear() + 1).toString();
  const breakoutTriggers = [currentYear, nextYear, 'new', 'update', 'secret', 'leaks', 'ai', 'viral', 'vs', 'explained'];
  const risingTriggers = ['how to', 'best', 'guide', 'tutorial', 'review', 'easy', 'top 10', 'free'];

  let velocity: 'Breakout' | 'Rising' | 'Evergreen' = 'Evergreen';
  if (breakoutTriggers.some((t) => lower.includes(t))) {
    velocity = 'Breakout';
  } else if (risingTriggers.some((t) => lower.includes(t)) || source === 'regional') {
    velocity = 'Rising';
  }

  // 4. Intent Classification:
  let intent: KeywordResult['intent'] = 'Informational';
  if (lower.startsWith('how') || lower.startsWith('why') || lower.startsWith('what') || lower.includes('tutorial')) {
    intent = 'Informational';
  } else if (lower.includes('best') || lower.includes('vs') || lower.includes('review') || lower.includes('top')) {
    intent = 'Commercial';
  } else if (lower.includes('buy') || lower.includes('price') || lower.includes('download') || lower.includes('free')) {
    intent = 'Transactional';
  } else if (lower.includes('channel') || lower.includes('official') || lower.includes('song') || lower.includes('movie')) {
    intent = 'Navigational';
  }

  return {
    id: `${keyword}_${source}_${stem}_${rankIndex}`,
    keyword,
    stem,
    source,
    rank: rankIndex + 1,
    popularityScore,
    competitionLevel,
    velocity,
    wordCount,
    intent,
    selected: true,
  };
};

export const ALPHABET_STEMS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export const QUESTION_STEMS = [
  'how to',
  'best',
  'vs',
  'what is',
  'why does',
  'tutorial',
  'tips for',
  'step by step',
];

export const REGIONAL_STEMS = {
  English: ['review', 'explained', 'tips', 'guide', 'for beginners'],
  Hindi: ['kaise kare', 'kya hai', 'sabse accha', 'sikhe', 'hindi me', 'ka tarika'],
  Telugu: ['telugu lo', 'ela cheyali', 'eppudu', 'chudandi', 'cheyadam ela', 'vijayam'],
  Tinglish: ['ela cheyali telugu', 'telugu lo video', 'easy ga ela', 'super tips telugu', 'trending telugu'],
};

/**
 * Builds the 4-Tier Tag Matrix strictly capped at 495 / 500 characters
 * Tier 1: Root Anchors
 * Tier 2: Semantic Synonyms
 * Tier 3: Action Long-Tails
 * Tier 4: Regional Variants
 */
export const buildTagMatrix = (
  rootKeyword: string,
  allKeywords: KeywordResult[],
  activeLanguage: keyof typeof REGIONAL_STEMS = 'English'
): TagMatrix => {
  const root = rootKeyword.trim();
  const rootAnchors: string[] = [];
  const semanticSynonyms: string[] = [];
  const actionLongTails: string[] = [];
  const regionalVariants: string[] = [];

  // 1. Root Anchors
  if (root) {
    rootAnchors.push(root);
    rootAnchors.push(`${root} ${new Date().getFullYear()}`);
    rootAnchors.push(`${root} full guide`);
  }

  // 2. Classify harvested keywords
  allKeywords.forEach((k) => {
    const kw = k.keyword.trim();
    if (!kw || rootAnchors.includes(kw)) return;

    if (k.source === 'regional') {
      if (!regionalVariants.includes(kw)) regionalVariants.push(kw);
    } else if (k.source === 'question' || k.intent === 'Informational' || kw.split(' ').length >= 4) {
      if (!actionLongTails.includes(kw)) actionLongTails.push(kw);
    } else {
      if (!semanticSynonyms.includes(kw)) semanticSynonyms.push(kw);
    }
  });

  // Ensure regional items for selected language if missing
  const regionalSeeds = REGIONAL_STEMS[activeLanguage] || [];
  regionalSeeds.forEach((stem) => {
    const candidate = `${root} ${stem}`.trim();
    if (!regionalVariants.includes(candidate)) {
      regionalVariants.push(candidate);
    }
  });

  // Strictly pack tags into <= 495 characters (allowing comma separators)
  const MAX_CHARS = 495;
  const packedTags: string[] = [];
  let currentLen = 0;

  const tryAdd = (tag: string) => {
    const cleaned = tag.replace(/,/g, '').trim();
    if (!cleaned || packedTags.includes(cleaned)) return;
    const additionalLen = (packedTags.length > 0 ? 1 : 0) + cleaned.length;
    if (currentLen + additionalLen <= MAX_CHARS) {
      packedTags.push(cleaned);
      currentLen += additionalLen;
    }
  };

  // Prioritize Root Anchors -> Action Long-Tails -> Semantic -> Regional
  rootAnchors.forEach(tryAdd);
  actionLongTails.forEach(tryAdd);
  semanticSynonyms.forEach(tryAdd);
  regionalVariants.forEach(tryAdd);

  // Generate dedicated #Hashtags (top 5-8 concise tags)
  const hashtags = packedTags
    .slice(0, 7)
    .map((tag) => '#' + tag.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((h) => h.length > 2);

  return {
    rootAnchors,
    semanticSynonyms,
    actionLongTails,
    regionalVariants,
    allTags: packedTags,
    totalChars: currentLen,
    hashtags,
  };
};
