import { SeoAuditRule } from '../types';

export interface SeoAuditInput {
  focusKeyword: string;
  title: string;
  description: string;
  tags: string[];
}

export interface SeoAuditOutput {
  totalScore: number; // 0 - 100
  rating: 'Poor' | 'Moderate' | 'Excellent';
  color: 'red' | 'yellow' | 'green';
  rules: SeoAuditRule[];
  titleLength: number;
  descriptionLength: number;
  tagCount: number;
  tagChars: number;
  hashtagCount: number;
}

const POWER_WORDS = [
  'ultimate', 'secret', 'proven', 'shocking', 'insane', 'blueprint', 'mastery',
  'fast', 'easy', 'step-by-step', 'complete', 'honest', 'stop', 'warning',
  'guide', '2026', 'review', 'best', 'truth', 'revealed', 'mistake', 'rules'
];

export const auditVideoSeo = (input: SeoAuditInput): SeoAuditOutput => {
  const { focusKeyword, title, description, tags } = input;
  const kw = focusKeyword.trim().toLowerCase();
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const rules: SeoAuditRule[] = [];

  let totalScore = 0;

  // 1. Focus Keyword in Title (15 pts max)
  const kwInTitle = kw ? titleLower.includes(kw) : false;
  const kwInTitleFront = kw ? titleLower.indexOf(kw) >= 0 && titleLower.indexOf(kw) <= 30 : false;
  let titleKwPoints = 0;
  let titleKwStatus: SeoAuditRule['status'] = 'failed';
  let titleKwMsg = 'Focus keyword not found in the video title.';
  let titleKwRec = `Add your focus keyword "${focusKeyword || 'primary topic'}" into the title.`;

  if (kwInTitleFront) {
    titleKwPoints = 15;
    titleKwStatus = 'passed';
    titleKwMsg = 'Focus keyword is prominently placed within the first 30 characters of the title.';
    titleKwRec = 'Great job. Mobile viewers will see the keyword before truncation.';
  } else if (kwInTitle) {
    titleKwPoints = 10;
    titleKwStatus = 'warning';
    titleKwMsg = 'Keyword is present in title, but placed after character 30 (risk of mobile cutoff).';
    titleKwRec = 'Move the keyword closer to the front of the title.';
  }
  totalScore += titleKwPoints;
  rules.push({
    id: 'title-keyword',
    title: 'Focus Keyword in Title Front',
    category: 'Title',
    points: titleKwPoints,
    maxPoints: 15,
    status: titleKwStatus,
    message: titleKwMsg,
    recommendation: titleKwRec,
  });

  // 2. Title Length Optimization (10 pts max)
  const titleLen = title.length;
  let titleLenPoints = 0;
  let titleLenStatus: SeoAuditRule['status'] = 'failed';
  let titleLenMsg = '';
  let titleLenRec = '';

  if (titleLen >= 40 && titleLen <= 65) {
    titleLenPoints = 10;
    titleLenStatus = 'passed';
    titleLenMsg = `Optimal title length (${titleLen} characters). Highly legible on desktop and mobile.`;
    titleLenRec = 'Maintains high clickability without getting truncated.';
  } else if (titleLen > 65) {
    titleLenPoints = 5;
    titleLenStatus = 'warning';
    titleLenMsg = `Title is slightly long (${titleLen}/100 chars). Characters after 55 may truncate on smartphones.`;
    titleLenRec = 'Keep the primary hook in the first 50 chars and condense secondary details.';
  } else {
    titleLenPoints = titleLen > 15 ? 4 : 0;
    titleLenStatus = 'failed';
    titleLenMsg = `Title is too brief (${titleLen} characters). Misses valuable keyword context.`;
    titleLenRec = 'Expand title to 45-60 characters with intent modifiers and curiosity triggers.';
  }
  totalScore += titleLenPoints;
  rules.push({
    id: 'title-length',
    title: 'Optimal Title Character Length',
    category: 'Title',
    points: titleLenPoints,
    maxPoints: 10,
    status: titleLenStatus,
    message: titleLenMsg,
    recommendation: titleLenRec,
  });

  // 3. Title Power Triggers / Numbers (5 pts max)
  const hasPowerWord = POWER_WORDS.some((pw) => titleLower.includes(pw));
  const hasNumber = /\d+/.test(title);
  let powerPoints = 0;
  if (hasPowerWord && hasNumber) powerPoints = 5;
  else if (hasPowerWord || hasNumber) powerPoints = 3;

  rules.push({
    id: 'title-power-words',
    title: 'Title Emotional / Velocity Triggers',
    category: 'Title',
    points: powerPoints,
    maxPoints: 5,
    status: powerPoints >= 4 ? 'passed' : powerPoints > 0 ? 'warning' : 'failed',
    message: powerPoints === 5
      ? 'Title contains both a persuasive power word and a specific numeric anchor.'
      : powerPoints > 0
      ? 'Title includes a trigger or number. Adding both increases click-through rate (CTR).'
      : 'No curiosity triggers or numbers detected in the title.',
    recommendation: 'Add high-CTR words (e.g. "Step-by-Step", "Proven", "2026", "Top 5").',
  });
  totalScore += powerPoints;

  // 4. Description Depth & Length (15 pts max)
  const descLen = description.length;
  let descLenPoints = 0;
  let descLenStatus: SeoAuditRule['status'] = 'failed';
  if (descLen >= 1000) {
    descLenPoints = 15;
    descLenStatus = 'passed';
  } else if (descLen >= 400) {
    descLenPoints = 9;
    descLenStatus = 'warning';
  } else {
    descLenPoints = descLen > 50 ? 4 : 0;
    descLenStatus = 'failed';
  }
  rules.push({
    id: 'desc-length',
    title: 'Description Depth & Semantic Weight',
    category: 'Description',
    points: descLenPoints,
    maxPoints: 15,
    status: descLenStatus,
    message: `Description contains ${descLen} characters (5,000 maximum allowable).`,
    recommendation: descLen < 1000 ? 'Expand description to 1,000+ characters with an overview, key takeaways, and relevant context for YouTube search indexing.' : 'Great semantic depth.',
  });
  totalScore += descLenPoints;

  // 5. First 120-Character Hook Presence (10 pts max)
  const first120 = description.slice(0, 120).toLowerCase();
  const kwInFirst120 = kw ? first120.includes(kw) : false;
  let hookPoints = 0;
  if (kwInFirst120) hookPoints = 10;
  else if (first120.length >= 80) hookPoints = 4;
  rules.push({
    id: 'desc-hook',
    title: 'First 120-Character Hook & Keyword',
    category: 'Description',
    points: hookPoints,
    maxPoints: 10,
    status: hookPoints === 10 ? 'passed' : hookPoints > 0 ? 'warning' : 'failed',
    message: kwInFirst120
      ? 'Focus keyword appears prominently above the mobile "Show More" fold.'
      : 'Focus keyword is missing from the first 120 characters.',
    recommendation: 'Ensure your primary keyword and core value hook are within the first 2 lines.',
  });
  totalScore += hookPoints;

  // 6. Chapter Timestamps (15 pts max)
  const has0000 = /0?0:00/.test(description);
  const timestampMatches = description.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g) || [];
  let chapterPoints = 0;
  if (has0000 && timestampMatches.length >= 3) {
    chapterPoints = 15;
  } else if (timestampMatches.length >= 2) {
    chapterPoints = 8;
  }
  rules.push({
    id: 'chapters',
    title: 'Video Chapters & Google Key Moments',
    category: 'Description',
    points: chapterPoints,
    maxPoints: 15,
    status: chapterPoints === 15 ? 'passed' : chapterPoints > 0 ? 'warning' : 'failed',
    message: chapterPoints === 15
      ? `Found ${timestampMatches.length} timestamp chapters including 00:00 start mark.`
      : has0000
      ? 'Found start 00:00 but fewer than 3 timestamps detected.'
      : 'Missing 00:00 start timestamp. YouTube requires 00:00 to trigger Key Moments.',
    recommendation: 'Format chapters as "00:00 - Introduction", "02:15 - Core Concept", etc. with at least 3 chapters of 10s+ duration.',
  });
  totalScore += chapterPoints;

  // 7. Links and Social Proof in Description (5 pts max)
  const hasUrl = /https?:\/\/[^\s]+/.test(description);
  const linkPoints = hasUrl ? 5 : 0;
  rules.push({
    id: 'desc-links',
    title: 'Links, Resources & Social Channels',
    category: 'Description',
    points: linkPoints,
    maxPoints: 5,
    status: linkPoints === 5 ? 'passed' : 'warning',
    message: hasUrl ? 'External resource link detected in description.' : 'No destination links or social profiles detected.',
    recommendation: 'Add links to your website (e.g. tjpromotions.pro), product, or playlist to retain viewer traffic.',
  });
  totalScore += linkPoints;

  // 8. Tag Saturation & Character Budget (15 pts max)
  const tagChars = tags.join(',').length;
  const tagCount = tags.length;
  let tagPoints = 0;
  if (tagCount >= 12 && tagChars >= 350 && tagChars <= 495) {
    tagPoints = 15;
  } else if (tagCount >= 6 && tagChars >= 200) {
    tagPoints = 9;
  } else if (tagCount > 0) {
    tagPoints = 4;
  }
  rules.push({
    id: 'tags-saturation',
    title: 'Tag Volume & Character Saturation',
    category: 'Tags',
    points: tagPoints,
    maxPoints: 15,
    status: tagPoints === 15 ? 'passed' : tagPoints >= 9 ? 'warning' : 'failed',
    message: `${tagCount} tags configured (${tagChars}/500 allowable characters used).`,
    recommendation: tagChars < 350 ? 'Maximize your tag real estate up to 450-495 characters with exact synonyms.' : 'Ideal tag density.',
  });
  totalScore += tagPoints;

  // 9. Hashtags in Description / Title (10 pts max)
  const hashtagMatches = (description + ' ' + title).match(/#[a-zA-Z0-9_]+/g) || [];
  const hashtagCount = hashtagMatches.length;
  let hashtagPoints = 0;
  if (hashtagCount >= 3 && hashtagCount <= 5) {
    hashtagPoints = 10;
  } else if (hashtagCount >= 1 && hashtagCount <= 8) {
    hashtagPoints = 6;
  }
  rules.push({
    id: 'hashtags',
    title: 'Dedicated #Hashtag Ingestion (3-5 Recommended)',
    category: 'Engagement',
    points: hashtagPoints,
    maxPoints: 10,
    status: hashtagPoints === 10 ? 'passed' : hashtagPoints > 0 ? 'warning' : 'failed',
    message: `${hashtagCount} hashtags detected.`,
    recommendation: hashtagCount < 3 ? 'Add 3 to 5 targeted hashtags at the bottom of the description (YouTube displays the first 3 above the title).' : hashtagCount > 5 ? 'Keep hashtags between 3-5; using >15 causes YouTube to ignore all tags.' : 'Optimal hashtag volume.',
  });
  totalScore += hashtagPoints;

  // Final summary rating
  let rating: SeoAuditOutput['rating'] = 'Poor';
  let color: SeoAuditOutput['color'] = 'red';

  if (totalScore >= 80) {
    rating = 'Excellent';
    color = 'green';
  } else if (totalScore >= 50) {
    rating = 'Moderate';
    color = 'yellow';
  }

  return {
    totalScore: Math.min(100, totalScore),
    rating,
    color,
    rules,
    titleLength: titleLen,
    descriptionLength: descLen,
    tagCount,
    tagChars,
    hashtagCount,
  };
};
