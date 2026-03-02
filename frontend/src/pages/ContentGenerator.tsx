import React, { useState } from 'react';
import { useGetBrandProfile, useGeneratePost } from '../hooks/useQueries';
import { type SocialPost } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Loader2, CalendarPlus, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import PlatformIcon from '../components/PlatformIcon';
import SchedulePostDialog from '../components/SchedulePostDialog';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

const BRAND_ID = 'my-brand';
const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'TikTok'];

const PLATFORM_HINTS: Record<string, string> = {
  Instagram: 'Visual-first · Up to 2,200 chars · 30 hashtags',
  Facebook: 'Conversational · Up to 63,206 chars · 3-5 hashtags',
  'Twitter/X': 'Concise · 280 chars · 1-2 hashtags',
  TikTok: 'Trendy & fun · 2,200 chars · 3-5 hashtags',
};

export default function ContentGenerator() {
  const { data: profile, isLoading: profileLoading } = useGetBrandProfile(BRAND_ID);
  const generatePost = useGeneratePost();

  const [selectedProductIdx, setSelectedProductIdx] = useState<number>(0);
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram');
  const [generatedPost, setGeneratedPost] = useState<SocialPost | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleGenerate = async () => {
    if (!profile || profile.catalog.length === 0) {
      toast.error('Please add products to your catalog first.');
      return;
    }
    try {
      const post = await generatePost.mutateAsync({
        brandId: BRAND_ID,
        productIdx: selectedProductIdx,
        platform: selectedPlatform,
      });
      setGeneratedPost(post);
    } catch {
      toast.error('Failed to generate post. Please try again.');
    }
  };

  const handleCopyCaption = () => {
    if (!generatedPost) return;
    const text = `${generatedPost.caption}\n\n${generatedPost.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <Skeleton className="h-10 w-64 bg-charcoal-800" />
        <Skeleton className="h-64 rounded-xl bg-charcoal-800" />
      </div>
    );
  }

  const hasProducts = profile && profile.catalog.length > 0;

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">AI Content Generator</h1>
            <p className="text-muted-foreground text-sm">Generate platform-optimized posts for your brand</p>
          </div>
        </div>
      </div>

      {/* No profile warning */}
      {!profile && (
        <div className="glass-card rounded-xl p-5 flex items-start gap-3 border-amber-500/20">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Brand profile not set up</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set up your brand profile first to generate personalized content.
            </p>
            <Link to="/brand-profile">
              <Button size="sm" variant="outline" className="mt-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs">
                Set Up Brand Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Generator Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg text-foreground">Generate Post</CardTitle>
          <CardDescription className="text-muted-foreground">
            Select a product and platform to create AI-crafted content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Product</Label>
            {!hasProducts ? (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" />
                No products in catalog.{' '}
                <Link to="/brand-profile" className="text-coral-400 hover:underline">
                  Add products →
                </Link>
              </div>
            ) : (
              <Select
                value={selectedProductIdx.toString()}
                onValueChange={(v) => setSelectedProductIdx(parseInt(v))}
              >
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {profile!.catalog.map((product, idx) => (
                    <SelectItem key={idx} value={idx.toString()} className="text-foreground hover:bg-secondary">
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          {product.category}
                        </Badge>
                        {product.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Platform</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlatform(p)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    selectedPlatform === p
                      ? 'border-coral-400/40 bg-coral-400/10 text-coral-400'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-border hover:bg-secondary/60'
                  }`}
                >
                  <PlatformIcon platform={p} size="md" />
                  <span className="text-xs font-medium">{p}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{PLATFORM_HINTS[selectedPlatform]}</p>
          </div>

          {/* Brand Tone Indicator */}
          {profile && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Brand tone:</span>
              <Badge variant="outline" className="border-coral-400/30 text-coral-400 text-xs capitalize">
                {profile.tone}
              </Badge>
              <span>·</span>
              <span className="truncate">{profile.name}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={generatePost.isPending || !hasProducts}
            className="w-full gradient-coral text-white border-0 hover:opacity-90 font-semibold py-5"
          >
            {generatePost.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Generate Post
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Post Preview */}
      {generatedPost && (
        <Card className="bg-card border-coral-400/20 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                <PlatformIcon platform={generatedPost.platform} size="sm" />
                Generated Post
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generatePost.isPending}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw size={14} className="mr-1.5" />
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCaption}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy size={14} className="mr-1.5" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Badge */}
            <div className="flex items-center gap-2">
              <PlatformIcon platform={generatedPost.platform} size="sm" showLabel />
              <Separator orientation="vertical" className="h-4 bg-border" />
              <span className="text-xs text-muted-foreground">
                {generatedPost.product.name} · {generatedPost.product.category}
              </span>
            </div>

            {/* Caption */}
            <div className="bg-secondary/50 rounded-xl p-4 border border-border">
              <p className="text-sm text-foreground leading-relaxed">{generatedPost.caption}</p>
            </div>

            {/* Hashtags */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {generatedPost.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-coral-400/10 text-coral-400 text-xs font-medium border border-coral-400/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Actions */}
            <Button
              onClick={() => setScheduleDialogOpen(true)}
              className="w-full gradient-coral text-white border-0 hover:opacity-90 font-semibold"
            >
              <CalendarPlus size={16} className="mr-2" />
              Schedule This Post
            </Button>
          </CardContent>
        </Card>
      )}

      <SchedulePostDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        post={generatedPost}
        brandId={BRAND_ID}
      />
    </div>
  );
}
