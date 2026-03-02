import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import BrandProfileSetup from './pages/BrandProfileSetup';
import ContentGenerator from './pages/ContentGenerator';
import CalendarPage from './pages/CalendarPage';

// ── Auth Guard Wrapper ────────────────────────────────────────────────────────

function AuthenticatedApp() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/brand-logo.dim_128x128.png"
            alt="StyleFlow"
            className="w-12 h-12 rounded-2xl animate-pulse"
          />
          <p className="text-muted-foreground text-sm">Loading StyleFlow...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <Outlet />
    </>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <AuthenticatedApp />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const brandProfileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/brand-profile',
  component: BrandProfileSetup,
});

const contentGeneratorRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/content-generator',
  component: ContentGenerator,
});

const calendarRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/calendar',
  component: CalendarPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    dashboardRoute,
    brandProfileRoute,
    contentGeneratorRoute,
    calendarRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
