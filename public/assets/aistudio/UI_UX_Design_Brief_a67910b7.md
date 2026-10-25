# ShortVideo — UI/UX Design Brief

**Version:** 1.0

## 1. Design Direction

Create a polished, modern video-sharing interface inspired by familiar vertical-video applications without copying another company's logos, trademarks, or exact proprietary screens.

The experience should feel fast, mobile-first, visually focused, and accessible.

### Visual defaults
- Dark theme as the default.
- Near-black page backgrounds.
- High-contrast white primary text.
- Muted grey secondary text.
- One configurable accent color.
- Rounded cards and controls, used consistently.
- Minimal decorative elements around the video.
- Clear loading, empty, offline, and error states.

Exact colors, typography, spacing, and icons may be refined during implementation, but the same design tokens must be used across user and admin pages.

## 2. Responsive Layout

### Mobile
- Full-height vertical video experience.
- Bottom navigation for Home, Discover, Upload, Inbox, and Profile.
- Video actions positioned without covering important captions.
- Touch-friendly controls.
- Safe-area spacing for devices with display cutouts.

### Desktop
- Persistent sidebar navigation.
- Central feed with a controlled maximum width.
- Optional secondary panel for recommendations or creator information.
- Admin dashboard with a structured navigation sidebar and responsive tables.

## 3. Core Screens

### Discovery feed — `/`
- Vertical video cards or a full-height scrolling feed.
- Creator avatar and username.
- Video caption and optional hashtags.
- Like, comment, share, and report actions.
- Clear playback, mute, pause, and retry controls.
- Lazy loading and efficient media cleanup.

### Search — `/search`
- Search field.
- Tabs or filters for videos and users.
- Paginated results.
- Empty and no-results states.

### Video detail — `/video/:videoId`
- Video player.
- Creator identity.
- Description and engagement controls.
- Comments list and comment composer.
- Report action and moderation-aware unavailable state.

### Upload — `/upload`
- Drag-and-drop area on desktop.
- File picker on mobile.
- Preview and metadata fields.
- Upload progress.
- Validation errors next to relevant fields.
- Final confirmation only after the server confirms success.

### Profile — `/u/:username`
- Avatar, username, display name, biography.
- Follow button where appropriate.
- Published video grid.
- Profile edit action for the owner.
- Clear empty-profile state.

### Inbox — `/inbox`
- Conversation list.
- Last-message preview.
- Unread indicator where supported.
- Empty state and loading skeleton.

### Conversation — `/messages/:conversationId`
- Message history.
- Composer with send state.
- Error and retry behavior.
- Block/report controls.
- Accessible timestamps and message labels.

### Live — `/live`
- Live session cards and status.
- Clear distinction between a scheduled, active, and ended session.
- Setup-required state when live infrastructure is unavailable.

### Live session — `/live/:liveStreamId`
- Player container.
- Stream information and creator identity.
- Live status and appropriate controls.
- Honest error state if the stream is unavailable.

### Notifications — `/notifications`
- Group notifications by date where useful.
- Unread indicator.
- Mark-as-read action.
- Empty and loading states.

## 4. Admin Experience

### `/admin`
- Summary metrics.
- Recent reports.
- Moderation queue.
- Quick links to users, videos, and settings.

### `/admin/reports`
- Report target, category, submission time, and status.
- Filters by status and type.
- Detail view with safe preview.
- Authorized moderation actions with confirmation.

### `/admin/videos`
- Search and filter.
- Video owner, publication state, and moderation status.
- Hide, restore, or remove actions according to permission.

### `/admin/users`
- Search by username or email where the role is authorized.
- Account status and moderation history where permitted.
- Staff must not assign roles.
- Super Admin role changes require a confirmation step and server verification.

### `/admin/settings`
- Only supported, server-persisted settings.
- Explicit permission checks.
- Do not show controls that merely change local state without saving.

## 5. Component System

Prefer reusable components such as:
- `AppShell`
- `BottomNavigation`
- `DesktopSidebar`
- `VideoFeed`
- `VideoCard`
- `VideoPlayer`
- `VideoActions`
- `CommentList`
- `CommentComposer`
- `ProfileHeader`
- `UploadForm`
- `ConversationList`
- `MessageThread`
- `LiveStreamCard`
- `AdminLayout`
- `ReportQueue`
- `ConfirmDialog`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `AdPlacement`

Use consistent spacing, button variants, form labels, focus styles, and confirmation patterns.

## 6. Accessibility

- Keyboard-accessible navigation and actions.
- Visible focus indicators.
- Sufficient color contrast.
- Accessible labels for icon-only buttons.
- Captions or subtitle support where available.
- Reduced-motion preference where practical.
- Do not rely on color alone to communicate status.
- Provide meaningful errors and recovery actions.

## 7. Performance

- Lazy-load images and video metadata.
- Avoid downloading multiple full videos simultaneously.
- Pause videos that leave the active viewport.
- Use pagination or cursor-based loading.
- Avoid unnecessary rerenders in feed and messaging components.
- Display responsive thumbnails where available.
- Do not assume uploaded videos have been transcoded.

## 8. Brand and Content Safety

`ShortVideo` is a temporary name. Keep branding text and accent tokens easy to replace.

Do not include unlicensed brand assets, fake user testimonials, fake ad metrics, fake live viewer counts, or fabricated revenue balances.

Seed data, if used during development, must be clearly identified as demo content and excluded from production behavior.