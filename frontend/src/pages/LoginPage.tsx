import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Zap, BarChart3, CalendarDays } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI Content Generation', desc: 'Generate captions & hashtags tailored to your brand voice' },
  { icon: CalendarDays, title: 'Smart Scheduling', desc: 'Plan and schedule posts across all major platforms' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track performance metrics and optimize your strategy' },
  { icon: Zap, title: 'Multi-Platform', desc: 'Instagram, Facebook, Twitter/X, and TikTok in one place' },
];

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User is already authenticated') {
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-16 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/assets/generated/brand-logo.dim_128x128.png"
              alt="StyleFlow"
              className="w-12 h-12 rounded-2xl object-cover shadow-coral"
            />
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold text-foreground">StyleFlow</h1>
              <p className="text-xs text-muted-foreground">AI Content Studio</p>
            </div>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4 max-w-2xl leading-tight">
            Automate Your{' '}
            <span className="text-gradient-coral">Fashion Brand's</span>{' '}
            Social Media
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mb-10">
            AI-powered content generation, smart scheduling, and analytics — all in one platform built for clothing brands.
          </p>

          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="gradient-coral text-white border-0 hover:opacity-90 font-semibold px-10 py-6 text-base rounded-xl shadow-coral-lg transition-all"
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Sparkles size={20} className="mr-2" />
                Get Started Free
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Secure login via Internet Identity</p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-5 text-center hover:border-coral-400/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg gradient-coral flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} StyleFlow AI. Built with{' '}
        <span className="text-coral-400">♥</span> using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-coral-400 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
