export type LifeMetricRequest = {
  salt: string;
  ciphertext: string;
};

export type LifeMetricStored = LifeMetricRequest & {
  // ISO 8601 String
  dateUtc: string;
  // Moodi airdrop
  rewardSignature: string | null;
  // Moodi airdrop Qty
  rewardQty: number | null;
};

export type LifeMetricInput = {
  highMood: string;
  lowMood: string;
  caffeineIntake: boolean;
  sleepDisturbance: boolean;
};

type Version = "v0";

export type Metadata = {
  total: number;
  timezoneOffsetMinutes: number;
  // ISO 8601 String
  // Should we only store this in life metrics? And just send the timezone based on the user device? Need to make sure we don't let this be gamed, especially when there are higher streak rewards at play.
  lastTimezoneChange: string;
  // ISO 8601 String
  currentStartStreak: string;
  longestStreakDays: number;
  currentStreak: number;
  lifeMetrics: LifeMetricStored[];
  version: Version;
};
