import React from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Store,
  LogOut,
  LogIn,
  Loader2,
  Menu,
  X,
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/content-generator', label: 'AI Generator', icon: Sparkles },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/brand-profile', label: 'Brand Profile', icon: Store },
];

export default function Navigation() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const userName = userProfile?.name ?? (isAuthenticated ? 'User' : null);
  const initials = userName ? userName.slice(0, 2).toUpperCase() : '?';

  const NavLinks = () => (
    <>
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-coral-400/15 text-coral-400 border border-coral-400/20'
                : 'text-charcoal-300 hover:text-foreground hover:bg-charcoal-800'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-coral-400' : ''} />
            {label}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <img
            src="/assets/generated/brand-logo.dim_128x128.png"
            alt="StyleFlow"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div>
            <span className="font-display font-bold text-lg text-foreground">StyleFlow</span>
            <span className="block text-xs text-muted-foreground leading-none">AI Content Studio</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLinks />
        </nav>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          {isAuthenticated && userName && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-coral-400/20 text-coral-400 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Brand Owner</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAuth}
            disabled={isLoggingIn}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            {isLoggingIn ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isAuthenticated ? (
              <LogOut size={16} />
            ) : (
              <LogIn size={16} />
            )}
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/brand-logo.dim_128x128.png"
            alt="StyleFlow"
            className="w-7 h-7 rounded-md object-cover"
          />
          <span className="font-display font-bold text-base text-foreground">StyleFlow</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-charcoal-800 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="relative w-72 bg-sidebar border-r border-sidebar-border flex flex-col pt-16 pb-4 px-3 space-y-1">
            <NavLinks />
            <div className="pt-4 border-t border-sidebar-border mt-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              >
                {isLoggingIn ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isAuthenticated ? (
                  <LogOut size={16} />
                ) : (
                  <LogIn size={16} />
                )}
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
