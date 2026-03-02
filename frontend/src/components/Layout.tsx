import React from 'react';
import { Outlet } from '@tanstack/react-router';
import Navigation from './Navigation';
import { Toaster } from '@/components/ui/sonner';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Desktop: offset for sidebar */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <Toaster theme="dark" richColors />
    </div>
  );
}
