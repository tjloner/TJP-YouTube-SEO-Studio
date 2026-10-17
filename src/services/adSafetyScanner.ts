import { AdSafetyFlag } from '../types';

export interface AdSafetyResult {
  riskScore: number; // 0 - 100%
  riskTier: 'Safe' | 'Moderate Risk' | 'Severe Flag';
  badgeColor: 'emerald' | 'amber' | 'rose';
  summary: string;
  flags: AdSafetyFlag[];
}

interface PolicyRule {
  category: AdSafetyFlag['category'];
  patterns: { regex: RegExp; weight: number; word: string; alternative: string }[];
  policyCitation: string;
}

const POLICY_DATABASE: PolicyRule[] = [
  {
    category: 'Profanity',
    policyCitation: 'YouTube Advertiser-Friendly Guidelines §1: Inappropriate Language in Title & Metadata',
    patterns: [
      { regex: /\b(f[*u]ck|sh[*i]t|b[*i]tch|asshole|motherfucker|cunt|dick)\b/i, weight: 35, word: 'Strong Profanity', alternative: 'Use polite or dramatic substitutes like "Darn", "Mess", "Shocking", "Chaos"' },
      { regex: /\b(damn|hell|piss|crap)\b/i, weight: 12, word: 'Mild Vulgarity', alternative: 'Replace with "Disaster", "Worst", "Mistake"' },
    ],
  },
  {
    category: 'Medical Claims',
    policyCitation: 'YouTube Misinformation Policy §3: Harmful Health Claims & Unproven Remedies',
    patterns: [
      { regex: /\b(cure\s+cancer|miracle\s+cure|100%\s+cure\s+diabetes|guaranteed\s+cure|anti-?vax\s+truth)\b/i, weight: 45, word: 'Unverified Medical Cure Claim', alternative: 'Use "Evidence-Based Management", "Research Overview", "Doctor Explained"' },
      { regex: /\b(secret\s+drug|banned\s+medicine|miracle\s+supplement)\b/i, weight: 30, word: 'Unregulated Health Supplement Claims', alternative: 'Use "Nutritional Overview", "Clinical Findings"' },
    ],
  },
  {
    category: 'Financial Scams',
    policyCitation: 'Google Ads & YouTube Financial Products Policy §4: Deceptive Financial Promises & High-Yield Schemes',
    patterns: [
      { regex: /\b(guaranteed\s+profit|make\s+\$?\d+k?\s+in\s+\d+\s+hours?|free\s+money\s+glitch|100x\s+crypto\s+guaranteed|passive\s+income\s+hack\s+no\s+work)\b/i, weight: 40, word: 'Unrealistic Guaranteed Financial Returns', alternative: 'Use "Case Study", "Realistic Income Models", "How I Built My Business"' },
      { regex: /\b(get\s+rich\s+quick|ponzi|binary\s+options\s+hack|double\s+your\s+crypto\s+fast)\b/i, weight: 40, word: 'High-Risk Speculative Scheme', alternative: 'Use "Long-Term Investing Strategy", "Portfolio Risk Analysis"' },
    ],
  },
  {
    category: 'Violence & Weapons',
    policyCitation: 'YouTube Firearms and Dangerous Content Policy §2: Violent, Dangerous & Weapon Manufacture',
    patterns: [
      { regex: /\b(homemade\s+bomb|build\s+a\s+gun|3d\s+print\s+gun|massacre|assassination\s+guide|suicide\s+method)\b/i, weight: 50, word: 'Dangerous Weapons or Self-Harm Instruction', alternative: 'Strictly prohibited on YouTube. Remove completely.' },
      { regex: /\b(kill\s+them|bloodbath|torture\s+tutorial)\b/i, weight: 35, word: 'Violent Incitement or Graphic Depiction', alternative: 'Use "Historical Conflict Analysis", "Documentary History"' },
    ],
  },
  {
    category: 'Adult Content',
    policyCitation: 'YouTube Adult Content Policy §1: Sexually Suggestive & Explicit Metadata',
    patterns: [
      { regex: /\b(xxx|porn|erotic\s+leak|nude\s+scandal|onlyfans\s+free\s+leak|hardcore\s+sex)\b/i, weight: 50, word: 'Explicit Adult Keywords', alternative: 'Remove completely. Violates Community Guidelines.' },
      { regex: /\b(sexy\s+babe|hot\s+girls\s+kissing|bikini\s+try\s+on\s+haul\s+nsfw)\b/i, weight: 25, word: 'Borderline Suggestive Metadata', alternative: 'Use "Fashion Try-On", "Swimwear Catalog", "Apparel Review"' },
    ],
  },
  {
    category: 'Sensitive Events',
    policyCitation: 'YouTube Monetization Policy §5: Exploitation of Sensitive & Traumatic Events',
    patterns: [
      { regex: /\b(terrorist\s+celebration|school\s+shooting\s+prank|genocide\s+justified|plane\s+crash\s+body)\b/i, weight: 50, word: 'Exploitation of Tragic Events', alternative: 'Prohibited. Cover sensitive events strictly with journalistic context.' },
    ],
  },
];

export const scanAdvertiserSafety = (
  title: string,
  description: string,
  tags: string[]
): AdSafetyResult => {
  const flags: AdSafetyFlag[] = [];
  let totalRisk = 0;

  const inspect = (text: string, location: 'Title' | 'Description' | 'Tags') => {
    if (!text) return;
    POLICY_DATABASE.forEach((rule) => {
      rule.patterns.forEach((p) => {
        const match = text.match(p.regex);
        if (match) {
          totalRisk += p.weight;
          flags.push({
            category: rule.category,
            triggerWord: match[0],
            location,
            riskContribution: p.weight,
            policyCitation: rule.policyCitation,
            safeAlternative: p.alternative,
          });
        }
      });
    });
  };

  inspect(title, 'Title');
  inspect(description, 'Description');
  inspect(tags.join(' '), 'Tags');

  const riskScore = Math.min(100, totalRisk);

  let riskTier: AdSafetyResult['riskTier'] = 'Safe';
  let badgeColor: AdSafetyResult['badgeColor'] = 'emerald';
  let summary = 'Zero demonetization triggers detected. Safe for all advertiser categories and Tier-1 brands.';

  if (riskScore >= 60) {
    riskTier = 'Severe Flag';
    badgeColor = 'rose';
    summary = 'Critical demonetization risk detected! High likelihood of Yellow Dollar Icon, limited ads, or age restriction.';
  } else if (riskScore > 0) {
    riskTier = 'Moderate Risk';
    badgeColor = 'amber';
    summary = 'Moderate risk detected. Video may face limited advertising demand or be excluded from family-friendly brands.';
  }

  return {
    riskScore,
    riskTier,
    badgeColor,
    summary,
    flags,
  };
};
