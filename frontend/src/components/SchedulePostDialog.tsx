import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarDays } from 'lucide-react';
import { useSchedulePost } from '../hooks/useQueries';
import { type SocialPost } from '../backend';
import PlatformIcon from './PlatformIcon';
import { toast } from 'sonner';

const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok'];

interface SchedulePostDialogProps {
  open: boolean;
  onClose: () => void;
  post: SocialPost | null;
  brandId: string;
}

export default function SchedulePostDialog({ open, onClose, post, brandId }: SchedulePostDialogProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [platform, setPlatform] = useState(post?.platform ?? 'Instagram');
  const schedulePost = useSchedulePost();

  const handleSchedule = async () => {
    if (!post || !date) return;
    try {
      const scheduledTime = new Date(`${date}T${time}:00`);
      const updatedPost: SocialPost = { ...post, platform };
      await schedulePost.mutateAsync({ brandId, post: updatedPost, scheduledTime });
      toast.success('Post scheduled successfully!');
      onClose();
    } catch {
      toast.error('Failed to schedule post. Please try again.');
    }
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg gradient-coral flex items-center justify-center">
              <CalendarDays size={18} className="text-white" />
            </div>
            <DialogTitle className="font-display text-lg text-foreground">Schedule Post</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Choose when and where to publish this post.
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-muted-foreground border border-border">
            <p className="line-clamp-2">{post.caption}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-coral-400 text-xs">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="text-foreground hover:bg-secondary">
                    <span className="flex items-center gap-2">
                      <PlatformIcon platform={p} size="sm" />
                      {p}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Date</Label>
              <Input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || schedulePost.isPending}
            className="gradient-coral text-white border-0 hover:opacity-90 font-semibold"
          >
            {schedulePost.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Scheduling...
              </>
            ) : (
              'Schedule Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
