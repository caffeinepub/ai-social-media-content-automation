import { type ScheduledPost, PostStatus } from '../backend';

export type PlatformMetrics = {
  platform: string;
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  estimatedReach: number;
  engagementRate: number;
  topPost: ScheduledPost | null;
};

const PLATFORM_REACH_MULTIPLIERS: Record<string, number> = {
  Instagram: 1200,
  Facebook: 950,
  'Twitter/X': 800,
  TikTok: 2200,
};

const PLATFORM_ENGAGEMENT_RATES: Record<string, number> = {
  Instagram: 3.8,
  Facebook: 2.1,
  'Twitter/X': 1.5,
  TikTok: 5.7,
};

export function computePlatformMetrics(posts: ScheduledPost[], platform: string): PlatformMetrics {
  const filtered = posts.filter((p) => p.post.platform === platform);
  const published = filtered.filter((p) => p.status === PostStatus.published);
  const scheduled = filtered.filter((p) => p.status === PostStatus.scheduled);
  const drafts = filtered.filter((p) => p.status === PostStatus.draft);

  const reachMultiplier = PLATFORM_REACH_MULTIPLIERS[platform] ?? 1000;
  const engagementRate = PLATFORM_ENGAGEMENT_RATES[platform] ?? 2.5;

  const estimatedReach = published.length * reachMultiplier + Math.floor(Math.random() * 500);

  const topPost = published.length > 0 ? published[0] : scheduled.length > 0 ? scheduled[0] : null;

  return {
    platform,
    totalPosts: filtered.length,
    publishedPosts: published.length,
    scheduledPosts: scheduled.length,
    draftPosts: drafts.length,
    estimatedReach,
    engagementRate,
    topPost,
  };
}

export function computeAllMetrics(posts: ScheduledPost[]): {
  totalPosts: number;
  publishedPosts: number;
  totalReach: number;
  avgEngagement: number;
  topPost: ScheduledPost | null;
  byPlatform: Record<string, PlatformMetrics>;
} {
  const platforms = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok'];
  const byPlatform: Record<string, PlatformMetrics> = {};

  for (const platform of platforms) {
    byPlatform[platform] = computePlatformMetrics(posts, platform);
  }

  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === PostStatus.published).length;
  const totalReach = Object.values(byPlatform).reduce((sum, m) => sum + m.estimatedReach, 0);
  const avgEngagement =
    Object.values(byPlatform).reduce((sum, m) => sum + m.engagementRate, 0) / platforms.length;

  const published = posts.filter((p) => p.status === PostStatus.published);
  const topPost = published.length > 0 ? published[0] : posts.length > 0 ? posts[0] : null;

  return { totalPosts, publishedPosts, totalReach, avgEngagement, byPlatform, topPost };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function timeNsToDate(timeNs: bigint): Date {
  return new Date(Number(timeNs / BigInt(1_000_000)));
}
