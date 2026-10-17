import { UserSession, UserTier, ApprovalStatus } from '../types';

const STORAGE_KEY = 'tjp_youtube_seo_session';

const DEFAULT_SESSION: UserSession = {
  tier: 'trial',
  approvalStatus: 'approved',
  trialDays: 3,
  trialStartDate: new Date().toISOString(),
  queriesUsedToday: 0,
  lastQueryDate: new Date().toISOString().slice(0, 10),
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().slice(0, 10);
};

export const loadUserSession = (): UserSession => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveUserSession(DEFAULT_SESSION);
      return DEFAULT_SESSION;
    }
    const session: UserSession = JSON.parse(raw);
    const today = getTodayDateString();

    // Reset queries if a new day has arrived
    if (session.lastQueryDate !== today) {
      session.queriesUsedToday = 0;
      session.lastQueryDate = today;
      saveUserSession(session);
    }

    // Check trial expiration
    if (session.tier === 'trial') {
      const start = new Date(session.trialStartDate).getTime();
      const now = new Date().getTime();
      const diffDays = (now - start) / (1000 * 60 * 60 * 24);
      if (diffDays >= session.trialDays) {
        session.tier = 'expired';
        saveUserSession(session);
      }
    }

    return session;
  } catch (err) {
    console.error('Failed to load user session from localStorage', err);
    return DEFAULT_SESSION;
  }
};

export const saveUserSession = (session: UserSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save user session to localStorage', err);
  }
};

export const calculateTrialDaysLeft = (session: UserSession): number => {
  if (session.tier === 'pro') return 999;
  if (session.tier === 'expired') return 0;
  
  const start = new Date(session.trialStartDate).getTime();
  const now = new Date().getTime();
  const diffDays = (now - start) / (1000 * 60 * 60 * 24);
  const remaining = Math.max(0, Math.ceil(session.trialDays - diffDays));
  return remaining;
};

export const consumeQuery = (): { success: boolean; message?: string; session: UserSession } => {
  const session = loadUserSession();

  if (session.approvalStatus !== 'approved') {
    return {
      success: false,
      message: `Account status is "${session.approvalStatus}". Contact administrator for activation.`,
      session,
    };
  }

  if (session.tier === 'expired') {
    return {
      success: false,
      message: 'Your 3-Day Free Trial has expired. Upgrade at tjpromotions.pro to unlock unlimited queries.',
      session,
    };
  }

  if (session.tier === 'pro') {
    // Unlimited queries for Pro
    session.queriesUsedToday += 1;
    saveUserSession(session);
    return { success: true, session };
  }

  // Trial quota check: 10 queries per day
  const DAILY_QUOTA = 10;
  if (session.queriesUsedToday >= DAILY_QUOTA) {
    return {
      success: false,
      message: `Daily quota of ${DAILY_QUOTA} queries reached for today. Reset queries in Admin Controls or upgrade to Pro.`,
      session,
    };
  }

  session.queriesUsedToday += 1;
  saveUserSession(session);
  return { success: true, session };
};

export const updateAdminSettings = (overrides: {
  tier?: UserTier;
  approvalStatus?: ApprovalStatus;
  trialDays?: number;
  resetQueries?: boolean;
}): UserSession => {
  const current = loadUserSession();
  
  if (overrides.tier) current.tier = overrides.tier;
  if (overrides.approvalStatus) current.approvalStatus = overrides.approvalStatus;
  if (typeof overrides.trialDays === 'number') {
    current.trialDays = overrides.trialDays;
    // reset start date if user is given a fresh extended trial
    current.trialStartDate = new Date().toISOString();
    if (current.tier === 'expired' && overrides.trialDays > 0) {
      current.tier = 'trial';
    }
  }
  if (overrides.resetQueries) {
    current.queriesUsedToday = 0;
    current.lastQueryDate = getTodayDateString();
  }

  saveUserSession(current);
  return current;
};
