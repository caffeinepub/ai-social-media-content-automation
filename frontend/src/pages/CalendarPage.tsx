import React, { useState, useMemo } from 'react';
import { useGetScheduledPosts, useUpdatePostStatus, useDeleteScheduledPost } from '../hooks/useQueries';
import { PostStatus, type ScheduledPost } from '../backend';
import { timeNsToDate } from '../utils/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CalendarDays, Trash2, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const BRAND_ID = 'my-brand';
const PLATFORMS = ['All', 'Instagram', 'Facebook', 'Twitter/X', 'TikTok'];

const STATUS_OPTIONS = [
  { value: PostStatus.draft, label: 'Draft' },
  { value: PostStatus.scheduled, label: 'Scheduled' },
  { value: PostStatus.published, label: 'Published' },
];

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

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Pad start
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(new Date(year, month, -i));
  }
  days.reverse();
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

interface PostCardProps {
  post: ScheduledPost;
  postId: string;
  brandId: string;
}

function PostCard({ post, postId, brandId }: PostCardProps) {
  const updateStatus = useUpdatePostStatus();
  const deletePost = useDeleteScheduledPost();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        postId,
        status: newStatus as PostStatus,
        brandId,
      });
      toast.success('Post status updated!');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync({ postId, brandId });
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    }
  };

  const date = timeNsToDate(post.scheduledTime);

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PlatformIcon platform={post.post.platform} size="sm" showLabel />
          {statusBadge(post.status)}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Delete Post</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete this scheduled post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-muted-foreground hover:text-foreground">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePost.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-sm text-foreground line-clamp-2">{post.post.caption}</p>

      <div className="flex flex-wrap gap-1">
        {post.post.hashtags.map((tag) => (
          <span key={tag} className="text-coral-400 text-xs">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-xs text-muted-foreground">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <Select
          value={post.status}
          onValueChange={handleStatusChange}
          disabled={updateStatus.isPending}
        >
          <SelectTrigger className="h-7 text-xs bg-secondary border-border text-foreground w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-foreground hover:bg-secondary text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { data: posts = [], isLoading } = useGetScheduledPosts(BRAND_ID);
  const [platformFilter, setPlatformFilter] = useState('All');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredPosts = useMemo(() => {
    if (platformFilter === 'All') return posts;
    return posts.filter((p) => p.post.platform === platformFilter);
  }, [posts, platformFilter]);

  // Group posts by date string
  const postsByDate = useMemo(() => {
    const map: Record<string, { post: ScheduledPost; id: string }[]> = {};
    filteredPosts.forEach((post) => {
      const date = timeNsToDate(post.scheduledTime);
      const key = date.toISOString().split('T')[0];
      if (!map[key]) map[key] = [];
      // Generate a stable ID from brandId + scheduledTime
      const id = `${post.brandId}_${post.scheduledTime.toString()}`;
      map[key].push({ post, id });
    });
    return map;
  }, [filteredPosts]);

  const monthDays = getMonthDays(year, month);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Sort posts by date for list view
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => Number(a.scheduledTime - b.scheduledTime));
  }, [filteredPosts]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Content Calendar</h1>
            <p className="text-muted-foreground text-sm">Manage and schedule your posts</p>
          </div>
        </div>
        <Link to="/content-generator">
          <Button className="gradient-coral text-white border-0 hover:opacity-90 font-semibold">
            <Plus size={16} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={platformFilter} onValueChange={setPlatformFilter}>
          <TabsList className="bg-secondary border border-border h-auto p-1 flex-wrap gap-1">
            {PLATFORMS.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="data-[state=active]:bg-coral-400/15 data-[state=active]:text-coral-400 data-[state=active]:border data-[state=active]:border-coral-400/20 text-muted-foreground rounded-md px-3 py-1.5 text-sm"
              >
                {p !== 'All' && <PlatformIcon platform={p} size="sm" className="mr-1.5" />}
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="ml-auto flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-sm"
          >
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="text-sm"
          >
            Calendar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-charcoal-800" />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {sortedPosts.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <CalendarDays size={40} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm mb-4">No posts scheduled yet.</p>
              <Link to="/content-generator">
                <Button className="gradient-coral text-white border-0 hover:opacity-90 font-semibold">
                  <Plus size={16} className="mr-2" />
                  Generate Your First Post
                </Button>
              </Link>
            </div>
          ) : (
            sortedPosts.map((post) => {
              const id = `${post.brandId}_${post.scheduledTime.toString()}`;
              return (
                <PostCard key={id} post={post} postId={id} brandId={BRAND_ID} />
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View */
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg text-foreground">{monthName}</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="w-8 h-8 text-muted-foreground hover:text-foreground">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="w-8 h-8 text-muted-foreground hover:text-foreground">
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">
                  {d}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, idx) => {
                const isCurrentMonth = day.getMonth() === month;
                const dateKey = day.toISOString().split('T')[0];
                const dayPosts = postsByDate[dateKey] ?? [];
                const isToday = dateKey === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] p-1.5 rounded-lg border transition-colors ${
                      isCurrentMonth
                        ? 'border-border bg-secondary/20 hover:bg-secondary/40'
                        : 'border-transparent bg-transparent opacity-30'
                    } ${isToday ? 'border-coral-400/40 bg-coral-400/5' : ''}`}
                  >
                    <span
                      className={`text-xs font-medium block mb-1 ${
                        isToday
                          ? 'text-coral-400'
                          : isCurrentMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 2).map(({ post, id }) => (
                        <div
                          key={id}
                          className="flex items-center gap-1 px-1 py-0.5 rounded bg-coral-400/10 border border-coral-400/15"
                        >
                          <PlatformIcon platform={post.post.platform} size="sm" className="shrink-0 text-[10px]" />
                          <span className="text-[10px] text-coral-400 truncate leading-tight">
                            {post.post.product.name}
                          </span>
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayPosts.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
