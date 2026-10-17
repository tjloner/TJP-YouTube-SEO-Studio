import { AudioChapter } from '../types';

export const formatSecondsToTimestamp = (totalSeconds: number): string => {
  const s = Math.floor(totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export interface AudioScanOptions {
  silenceThresholdDb?: number; // e.g. -32dB
  minPauseSeconds?: number; // e.g. 1.5s
  minChapterSpacingSeconds?: number; // e.g. 45s minimum between chapters
}

/**
 * Analyzes audio buffer using Web Audio API to detect natural speech breaks/pauses
 */
export const detectChaptersFromAudioBuffer = (
  audioBuffer: AudioBuffer,
  options: AudioScanOptions = {}
): AudioChapter[] => {
  const {
    silenceThresholdDb = -32,
    minPauseSeconds = 1.5,
    minChapterSpacingSeconds = 45,
  } = options;

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0); // Left channel
  const totalDuration = audioBuffer.duration;

  // Convert dB to linear RMS amplitude: 10^(dB / 20)
  const thresholdLinear = Math.pow(10, silenceThresholdDb / 20);

  const windowSize = Math.floor(sampleRate * 0.1); // 100ms analysis window
  const minPauseWindows = Math.floor(minPauseSeconds / 0.1);
  const minSpacingSeconds = minChapterSpacingSeconds;

  const chapters: AudioChapter[] = [
    {
      id: 'chap-0',
      timestamp: '00:00',
      seconds: 0,
      title: 'Introduction & Hook',
    },
  ];

  let consecutiveSilenceWindows = 0;
  let lastChapterTime = 0;
  let inSilence = false;

  const totalWindows = Math.floor(channelData.length / windowSize);

  for (let w = 0; w < totalWindows; w++) {
    const startSample = w * windowSize;
    let sumSquares = 0;

    for (let i = 0; i < windowSize; i += 4) {
      // stride of 4 for fast computation
      const val = channelData[startSample + i] || 0;
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / (windowSize / 4));

    if (rms < thresholdLinear) {
      consecutiveSilenceWindows++;
      if (consecutiveSilenceWindows >= minPauseWindows) {
        inSilence = true;
      }
    } else {
      if (inSilence) {
        // Speech resumed after silence
        const resumeTime = (w * windowSize) / sampleRate;
        if (resumeTime - lastChapterTime >= minSpacingSeconds && resumeTime < totalDuration - 15) {
          const chapIndex = chapters.length;
          const defaultTitles = [
            'Core Problem Statement',
            'Strategic Framework & Logic',
            'Step-by-Step Implementation',
            'Real-World Case Study',
            'Advanced Tactics & Edge Cases',
            'Key Takeaways & Action Plan',
          ];
          const title = defaultTitles[chapIndex - 1] || `Chapter ${chapIndex + 1}`;

          chapters.push({
            id: `chap-${chapIndex}`,
            timestamp: formatSecondsToTimestamp(resumeTime),
            seconds: Math.round(resumeTime),
            title,
          });
          lastChapterTime = resumeTime;
        }
        inSilence = false;
      }
      consecutiveSilenceWindows = 0;
    }
  }

  // If very few silences detected, inject evenly distributed chapters based on duration
  if (chapters.length < 3 && totalDuration > 120) {
    const numSections = Math.min(6, Math.max(3, Math.floor(totalDuration / 120)));
    const interval = totalDuration / numSections;
    const fallbackTitles = [
      'Introduction & Hook',
      'The Big Breakdown',
      'Execution Details',
      'Pro Tips & Results',
      'Final Conclusion',
    ];

    const fallbackChapters: AudioChapter[] = [];
    for (let i = 0; i < numSections; i++) {
      const sec = Math.round(i * interval);
      fallbackChapters.push({
        id: `chap-fb-${i}`,
        timestamp: formatSecondsToTimestamp(sec),
        seconds: sec,
        title: fallbackTitles[i] || `Section ${i + 1}`,
      });
    }
    return fallbackChapters;
  }

  return chapters;
};

/**
 * Creates a synthetic multi-topic speech pattern buffer for instant client-side testing
 */
export const createSampleAudioPattern = (context: AudioContext): AudioBuffer => {
  const sampleRate = context.sampleRate;
  const duration = 240; // 4 minutes
  const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);

  // Sections with sound followed by 2 seconds of silence
  const sections = [
    { start: 0, end: 50 },
    { start: 52.5, end: 110 },
    { start: 112.5, end: 175 },
    { start: 177.5, end: 238 },
  ];

  sections.forEach((sec) => {
    const startIdx = Math.floor(sec.start * sampleRate);
    const endIdx = Math.floor(sec.end * sampleRate);
    for (let i = startIdx; i < endIdx; i++) {
      // generate vocal-like frequency modulated signal
      const t = i / sampleRate;
      data[i] =
        (Math.sin(2 * Math.PI * 220 * t) * 0.3 +
          Math.sin(2 * Math.PI * 440 * t) * 0.15 +
          (Math.random() - 0.5) * 0.05) *
        0.6;
    }
  });

  return buffer;
};

export const DEFAULT_VIRAL_CHECKLIST = [
  {
    id: 'vc-1',
    title: 'Zero-Hour Audience Seeding (First 15 Mins)',
    timing: 'Minute 0–15',
    description: 'Post an engaging teaser on YouTube Community Tab with a viewer poll. Share link to targeted newsletter or Telegram subscriber broadcast.',
    benchmark: 'Goal: Drive first 100 genuine organic views to signal high early CTR to algorithm.',
    actionableStep: 'Notify loyal core audience instantly before algorithm expands discovery imprint.',
    completed: false,
  },
  {
    id: 'vc-2',
    title: 'Pinned Debate Comment (First 30 Mins)',
    timing: 'Minute 15–30',
    description: 'Post and pin an open-ended question comment that sparks a constructive opinion debate rather than generic praise.',
    benchmark: 'Benchmark: Aim for > 15 comment replies within the first hour.',
    actionableStep: 'Comment: "Which strategy are you using right now: A or B? Let me know below!"',
    completed: false,
  },
  {
    id: 'vc-3',
    title: 'APV (Average Percentage Viewed) Target Check',
    timing: 'Hour 1–3',
    description: 'Inspect YouTube Studio Audience Retention curve. Check if viewer drop-off in first 30 seconds is less than 30%.',
    benchmark: 'Target Benchmark: > 55% retention across entire video runtime.',
    actionableStep: 'Identify flat retention segments for future chapter structure and clip extraction.',
    completed: false,
  },
  {
    id: 'vc-4',
    title: '4% CTR A/B Thumbnail Pivot Rule',
    timing: 'Hour 3–6',
    description: 'Check Impression Click-Through Rate. If CTR is below 4.0% with over 1,000 impressions, immediately pivot to Alternate Thumbnail B and Counter-Title.',
    benchmark: 'Threshold: < 4.0% CTR = Immediate visual revamp.',
    actionableStep: 'Swap thumbnail graphic with higher text contrast and cropped emotional human focal face.',
    completed: false,
  },
  {
    id: 'vc-5',
    title: 'Circular Playlist & End-Screen Loop',
    timing: 'Hour 12–24',
    description: 'Ensure the top suggested video in End Screens points to a binge-worthy sequel or related playlist to trigger continuous session time.',
    benchmark: 'Benchmark: > 8% end-screen click rate.',
    actionableStep: 'Link next upload at exact moment of conclusion before viewers exit the player.',
    completed: false,
  },
  {
    id: 'vc-6',
    title: 'Search Intent & Suggested Video Piggyback',
    timing: 'Hour 24–48',
    description: 'Review "Content suggesting this video" in Analytics. Add newly discovered competitor keywords into tags and description.',
    benchmark: 'Benchmark: Siphon 20%+ traffic from high-velocity competitor uploads.',
    actionableStep: 'Inspect matching competitor titles and align semantic tags with current breakout terms.',
    completed: false,
  },
];
