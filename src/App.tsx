/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './app/Router';
import { AuthProvider } from './features/auth/AuthContext';
import { VideoProvider } from './features/videos/VideoContext';
import { AppShell } from './components/AppShell';

// Views
import { FeedView } from './features/feed/FeedView';
import { SearchView } from './features/search/SearchView';
import { VideoDetailView } from './features/videos/VideoDetailView';
import { UploadView } from './features/videos/UploadView';
import { ProfileView } from './features/profiles/ProfileView';
import { InboxView } from './features/messaging/InboxView';
import { ConversationView } from './features/messaging/ConversationView';
import { NotificationsView } from './features/notifications/NotificationsView';
import { LiveDirectoryView } from './features/live/LiveDirectoryView';
import { LiveStreamView } from './features/live/LiveStreamView';
import { SettingsView } from './features/settings/SettingsView';

// Auth Views
import { LoginView } from './features/auth/LoginView';
import { SignupView } from './features/auth/SignupView';
import { ForgotPasswordView } from './features/auth/ForgotPasswordView';

// Admin Views
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminReportsView } from './features/admin/AdminReportsView';
import { AdminVideosView } from './features/admin/AdminVideosView';
import { AdminUsersView } from './features/admin/AdminUsersView';
import { AdminSettingsView } from './features/admin/AdminSettingsView';

function RouteSwitch() {
  const { currentPath, params } = useRouter();

  // Route matches strictly conforming to PRD Section 5
  if (currentPath === '/') {
    return <FeedView />;
  }

  if (currentPath === '/login') {
    return <LoginView />;
  }

  if (currentPath === '/signup') {
    return <SignupView />;
  }

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordView />;
  }

  if (currentPath === '/upload') {
    return <UploadView />;
  }

  if (currentPath.startsWith('/video/')) {
    return <VideoDetailView />;
  }

  if (currentPath === '/search') {
    return <SearchView />;
  }

  if (currentPath.startsWith('/u/')) {
    return <ProfileView />;
  }

  if (currentPath === '/inbox') {
    return <InboxView />;
  }

  if (currentPath.startsWith('/messages/')) {
    return <ConversationView />;
  }

  if (currentPath === '/notifications') {
    return <NotificationsView />;
  }

  if (currentPath === '/live') {
    return <LiveDirectoryView />;
  }

  if (currentPath.startsWith('/live/')) {
    return <LiveStreamView />;
  }

  if (currentPath === '/settings') {
    return <SettingsView />;
  }

  // Admin Routes
  if (currentPath === '/admin') {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/reports') {
    return (
      <AdminLayout>
        <AdminReportsView />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/videos') {
    return (
      <AdminLayout>
        <AdminVideosView />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/users') {
    return (
      <AdminLayout>
        <AdminUsersView />
      </AdminLayout>
    );
  }

  if (currentPath === '/admin/settings') {
    return (
      <AdminLayout>
        <AdminSettingsView />
      </AdminLayout>
    );
  }

  // Default fallback to Feed
  return <FeedView />;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <VideoProvider>
          <AppShell>
            <RouteSwitch />
          </AppShell>
        </VideoProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
