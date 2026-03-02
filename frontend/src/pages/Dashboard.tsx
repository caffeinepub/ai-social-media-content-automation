import React, { useState } from 'react';
import { useGetScheduledPosts } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { computeAllMetrics, formatNumber, timeNsToDate } from '../utils/analytics';
import { PostStatus } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import PlatformIcon from '../components/PlatformIcon';
import { BarChart3, TrendingUp, FileText, Users, Zap } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok'];

const BRAND_ID = 'my-brand';

function statusBadge(status: PostStatus) {
  switch (status) {
    case PostStatus.published:
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs">Published</Badge>;
    case PostStatus.scheduled:
      return <Badge className="bg-coral-400/15 text-coral-400 border-coral-400/20 text-xs">Scheduled</Badge>;
    case PostStatus.draft:
      return <Badge className="bg-charcoal-600/50 text-charcoal-300 border-charcoal-600/30 text-xs">Draft</Badge>;
  }
}

export default function Dashboard() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: posts = [], isLoading } = useGetScheduledPosts(BRAND_ID);
  const [activePlatform, setActivePlatform] = useState('Instagram');

  const metrics = computeAllMetrics(posts);
  const recentPosts = [...posts]
    .sort((a, b) => Number(b.scheduledTime - a.scheduledTime))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="StyleFlow Dashboard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <p className="text-coral-400 text-sm font-medium mb-1 uppercase tracking-widest">Welcome back</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {userProfile?.name ?? 'Brand Owner'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length === 0
              ? 'Start creating content for your brand'
              : `You have ${posts.filter((p) => p.status === PostStatus.scheduled).length} posts scheduled`}
          </p>
        </div>
      </div>

      {/* Overall Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-charcoal-800" />
          ))
        ) : (
          <>
            <MetricCard
              icon={<FileText size={20} className="text-coral-400" />}
              label="Total Posts"
              value={metrics.totalPosts.toString()}
              sub="All platforms"
            />
            <MetricCard
              icon={<Zap size={20} className="text-amber-500" />}
              label="Published"
              value={metrics.publishedPosts.toString()}
              sub="Live posts"
            />
            <MetricCard
              icon={<Users size={20} className="text-coral-300" />}
              label="Est. Reach"
              value={formatNumber(metrics.totalReach)}
              sub="Combined reach"
            />
            <MetricCard
              icon={<TrendingUp size={20} className="text-amber-400" />}
              label="Avg. Engagement"
              value={`${metrics.avgEngagement.toFixed(1)}%`}
              sub="Across platforms"
            />
          </>
        )}
      </div>

      {/* Platform Analytics */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Platform Analytics</h2>
        <Tabs value={activePlatform} onValueChange={setActivePlatform}>
          <TabsList className="bg-secondary border border-border mb-4 h-auto p-1 flex-wrap gap-1">
            {PLATFORMS.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="data-[state=active]:bg-coral-400/15 data-[state=active]:text-coral-400 data-[state=active]:border data-[state=active]:border-coral-400/20 text-muted-foreground rounded-md px-3 py-1.5 text-sm"
              >
                <PlatformIcon platform={p} size="sm" className="mr-1.5" />
                {p}
              </TabsTrigger>
            ))}
          </TabsList>

          {PLATFORMS.map((p) => (
            <TabsContent key={p} value={p}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <PlatformMetricCard label="Total Posts" value={metrics.byPlatform[p].totalPosts.toString()} />
                <PlatformMetricCard label="Published" value={metrics.byPlatform[p].publishedPosts.toString()} />
                <PlatformMetricCard label="Est. Reach" value={formatNumber(metrics.byPlatform[p].estimatedReach)} />
                <PlatformMetricCard label="Engagement" value={`${metrics.byPlatform[p].engagementRate.toFixed(1)}%`} />
              </div>
              {metrics.byPlatform[p].topPost && (
                <div className="mt-4 glass-card rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Top Post</p>
                  <p className="text-sm text-foreground line-clamp-2">
                    {metrics.byPlatform[p].topPost!.post.caption}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {metrics.byPlatform[p].topPost!.post.hashtags.map((tag) => (
                      <span key={tag} className="text-coral-400 text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Activity</h2>
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="text-coral-400 hover:text-coral-300 hover:bg-coral-400/10">
              View All →
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-charcoal-800" />
            ))}
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <BarChart3 size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No posts yet. Start by generating content!</p>
            <Link to="/content-generator">
              <Button size="sm" className="mt-4 gradient-coral text-white border-0 hover:opacity-90">
                Generate Content
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post, idx) => (
              <div key={idx} className="glass-card rounded-xl p-4 flex items-start gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <PlatformIcon platform={post.post.platform} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-1">{post.post.caption}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {timeNsToDate(post.scheduledTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="shrink-0">{statusBadge(post.status)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="bg-card border-border hover:border-coral-400/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-foreground font-display">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function PlatformMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground font-display">{value}</p>
    </div>
  );
}
