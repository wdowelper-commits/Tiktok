# ShortVideo — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Initial implementation specification  
**Temporary product name:** ShortVideo  
**Platforms:** Responsive website, installable PWA, Android wrapper  
**Primary language:** English UI; localization can be added later

## 1. Product Overview

ShortVideo is a mobile-first video-sharing platform inspired by common short-video social apps. Users can discover and upload short and long videos, follow creators, interact through likes and comments, exchange private messages, and access live-streaming features.

The application includes a role-protected administration area for managing users, content, reports, banners, and platform settings.

The initial implementation uses React, TypeScript, Vite, Supabase, GitHub, and Cloudflare Pages/Workers.

## 2. Product Goals

- Deliver a polished, responsive video-discovery experience.
- Support short and long video uploads and playback.
- Provide secure authentication and user profiles.
- Enable social engagement and private messaging.
- Provide a live-streaming integration interface.
- Allow administrators to moderate reported content.
- Support advertising placements in v1 without pretending an ad provider is configured.
- Keep the code maintainable and suitable for future Android packaging.

## 3. User Roles

- **Guest:** Can access public pages and public content according to configured access policies.
- **Authenticated user:** Can manage their profile, upload videos, follow creators, like, comment, report content, and message eligible users.
- **Staff:** Can access explicitly granted moderation and support functions.
- **Super Admin:** Can manage staff roles, platform settings, and administrative functions.

Roles must be assigned and verified on the server. A client-side role value is never sufficient authorization.

## 4. V1 Functional Requirements

### Authentication and profiles
- Email/password registration and login through Supabase Auth.
- Password reset and logout.
- Google OAuth only after provider configuration and redirect URLs are verified.
- Public profiles with username, display name, avatar, biography, and published videos.
- Users can edit only their own permitted profile fields.

### Video discovery and playback
- Support short and long videos.
- Vertical, mobile-first feed with playback controls.
- Discover feed and creator profiles.
- Search public videos and users.
- Video detail page with description, creator information, likes, and comments.
- Pagination or cursor-based loading; avoid loading the entire catalog at once.
- Handle upload, processing, playback, and network failures clearly.

### Video uploads
- Authenticated users can upload videos to Supabase Storage.
- Validate file type, size, duration, and metadata on the server where possible.
- Store video metadata in PostgreSQL.
- Default publication behavior: publish immediately after successful validation and upload.
- Users can edit or delete their own videos subject to platform policy.
- Reported videos remain subject to staff review and enforcement.

### Social features
- Follow and unfollow creators.
- Like and unlike videos.
- Create, view, and delete permitted comments.
- Notifications for relevant social activity.
- Report videos, comments, and users.

### Private messaging
- One-to-one conversations.
- Message history with pagination.
- Users may read or send messages only in conversations in which they participate.
- Abuse reporting and blocking controls should be supported.
- Realtime updates may use Supabase Realtime; authorization remains enforced by database policies.

### Live streaming
- Provide live-stream creation, joining, status, and viewing interfaces.
- Live broadcast media must use a separately configured live-media provider or compatible streaming infrastructure.
- Do not represent a database record as a functioning video broadcast.
- Provider credentials must remain server-side.
- If no provider is configured, show a clear “Live streaming setup required” state.

### Administration
- Overview dashboard with users, videos, reports, and moderation status.
- Staff can review reports and take permitted moderation actions.
- Super Admin can assign or revoke staff access.
- Administrative actions must be audited.
- Public users cannot read administrative records or modify their own role.

### Advertising
- Include documented ad-placement components and configurable placement locations.
- Do not display fake ads as real paid advertisements.
- Ad-network integration remains pending until a provider, account, consent flow, and approved SDK/API are configured.
- Creator earnings and withdrawals are out of scope for v1.

## 5. Initial Routes

- `/` — discovery feed
- `/login` — login
- `/signup` — registration
- `/forgot-password` — password recovery
- `/upload` — video upload
- `/video/:videoId` — video detail
- `/search` — search
- `/u/:username` — profile
- `/inbox` — conversation list
- `/messages/:conversationId` — private conversation
- `/notifications` — notifications
- `/live` — live directory
- `/live/:liveStreamId` — live-stream page
- `/settings` — account settings
- `/admin` — administration dashboard
- `/admin/reports` — report review
- `/admin/videos` — video moderation
- `/admin/users` — user management
- `/admin/settings` — platform settings

Protected routes must also be protected by backend policies and server-side checks.

## 6. Non-Functional Requirements

- Responsive layout and accessible controls.
- Strict TypeScript; avoid unsafe casts and unexplained `any`.
- Clear loading, empty, success, and error states.
- Efficient pagination and image/video loading.
- Secure authorization through Supabase RLS and trusted server-side operations.
- No privileged secrets in frontend bundles or GitHub.
- User-facing errors must not reveal credentials or internal stack traces.
- Database migrations must be version-controlled.
- The production build must run with `npm run build`.

## 7. V1 Exclusions

- Creator payout processing and withdrawal approval.
- Native Android-only functionality until a wrapper is implemented and tested.
- A built-in video transcoding pipeline unless separately designed and deployed.
- Live broadcast infrastructure before a provider is selected and configured.
- Claims of fully operational advertising before integration and testing.

## 8. Acceptance Criteria

- Authentication works with configured providers.
- Users can upload a permitted video and view it after successful upload.
- Users cannot edit another user's content through direct API requests.
- Messaging is restricted to conversation participants.
- Only authorized staff can moderate content.
- Only Super Admin can manage privileged roles.
- Unauthorized users cannot access administrative data.
- No service-role key or private provider secret appears in frontend files or Git history.
- Deployment and setup documentation identifies any integrations still pending.

## 9. Safe Defaults and Open Decisions

- Temporary brand: ShortVideo.
- Initial UI language: English.
- Maximum video size and duration must be configurable and confirmed against the selected Supabase plan before release.
- Videos publish immediately after validation.
- Google OAuth remains disabled until configured.
- Live streaming and advertising remain visibly unconfigured until tested.
- Privacy policy, terms, age policy, retention period, and jurisdiction-specific compliance require review before public launch.