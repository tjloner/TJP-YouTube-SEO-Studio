export type UserTier = 'trial' | 'pro' | 'expired';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface UserSession {
  tier: UserTier;
  approvalStatus: ApprovalStatus;
  trialDays: number;
  trialStartDate: string;
  queriesUsedToday: number;
  lastQueryDate: string;
}

export type StudioTab = 'keyword' | 'competitor' | 'seo-score' | 'audio-media';

export interface KeywordResult {
  id: string;
  keyword: string;
  stem: string;
  source: 'alphabet' | 'question' | 'regional' | 'seed';
  rank: number;
  popularityScore: number; // 0 - 100
  competitionLevel: 'Low' | 'Medium' | 'High';
  velocity: 'Breakout' | 'Rising' | 'Evergreen';
  wordCount: number;
  intent: 'Informational' | 'Transactional' | 'Commercial' | 'Navigational';
  selected?: boolean;
}

export interface TagMatrix {
  rootAnchors: string[];
  semanticSynonyms: string[];
  actionLongTails: string[];
  regionalVariants: string[];
  allTags: string[];
  totalChars: number;
  hashtags: string[];
}

export interface CompetitorData {
  url?: string;
  videoId: string;
  title: string;
  author: string;
  channelUrl?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewCount: number;
  description: string;
  tags: string[];
  totalTagChars: number;
  isMidRollMonetized: boolean; // duration >= 480s (8 min)
  genre: 'Stories / Animation' | 'Tutorials / Tech' | 'Reviews / Products' | 'Vlogs / Entertainment';
  vulnerabilities: {
    type: string;
    vulnerability: string;
    advantage: string;
    severity: 'High' | 'Medium' | 'Low';
  }[];
  counterTitles: {
    category: string;
    title: string;
    rationale: string;
  }[];
  revenueEst: {
    niche: string;
    minRPM_INR: number;
    maxRPM_INR: number;
    minRPM_USD: number;
    maxRPM_USD: number;
    midRollMultiplier: number;
  };
}

export interface SeoAuditRule {
  id: string;
  title: string;
  category: 'Title' | 'Description' | 'Tags' | 'Engagement';
  points: number;
  maxPoints: number;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  recommendation: string;
}

export interface AdSafetyFlag {
  category: 'Profanity' | 'Medical Claims' | 'Financial Scams' | 'Violence & Weapons' | 'Adult Content' | 'Sensitive Events';
  triggerWord: string;
  location: 'Title' | 'Description' | 'Tags';
  riskContribution: number;
  policyCitation: string;
  safeAlternative: string;
}

export interface AudioChapter {
  id: string;
  timestamp: string; // e.g. "00:00"
  seconds: number;
  title: string;
}

export interface ViralVelocityItem {
  id: string;
  title: string;
  timing: string;
  description: string;
  benchmark: string;
  actionableStep: string;
  completed: boolean;
}
