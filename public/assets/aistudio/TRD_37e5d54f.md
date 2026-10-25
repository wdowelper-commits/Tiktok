# ShortVideo — Technical Requirements Document (TRD)

**Version:** 1.0

## 1. Approved Technology Stack

- Frontend: React + TypeScript + Vite.
- UI: CSS modules, standard CSS, or a documented compatible component system.
- Authentication, database, and file storage: Supabase.
- Database: Supabase PostgreSQL.
- Realtime application events: Supabase Realtime where appropriate.
- Source control: GitHub.
- Web hosting: Cloudflare Pages.
- Server-side privileged operations: Cloudflare Workers or Pages Functions.
- Android: a future Capacitor wrapper around the deployed web experience, with required native features separately tested.
- AI-assisted implementation: Google AI Studio using the six specification documents.

Do not introduce Vercel or another hosting provider without revising the approved architecture documents first.

## 2. Architecture

The browser runs the React application and uses the Supabase publishable/anon client key for operations explicitly allowed by RLS.

Supabase handles authentication, PostgreSQL data, storage objects, and authorized realtime features.

Cloudflare Pages serves the built frontend. Cloudflare Workers/Pages Functions provide server-side operations that require trusted authorization, provider secrets, signed upload/download access, webhook verification, or administrative enforcement.

Privileged operations must not be implemented by trusting frontend-supplied role IDs, user IDs, prices, ownership, or moderation outcomes.

## 3. Repository Structure

Recommended structure:

- `src/app/` — application bootstrap and routing
- `src/components/` — shared UI
- `src/features/auth/`
- `src/features/feed/`
- `src/features/videos/`
- `src/features/profiles/`
- `src/features/messaging/`
- `src/features/notifications/`
- `src/features/live/`
- `src/features/admin/`
- `src/lib/supabase.ts` — public client configuration
- `src/lib/validation/`
- `src/types/` — shared application types
- `supabase/migrations/` — versioned SQL migrations
- `functions/api/` — Cloudflare Pages Functions, if used
- `public/_redirects` — SPA routing fallback where needed
- `public/` — static assets

Do not duplicate authorization rules in UI-only code and treat them as security controls. UI route guards are convenience; backend checks are authoritative.

## 4. Environment Variables

### Frontend variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The publishable key is intentionally public. RLS must protect all data.

Use `VITE_SUPABASE_ANON_KEY` only if the selected Supabase client/setup still uses the legacy anon-key naming. Do not define both variants unnecessarily; standardize on the actual configured key.

### Server-only variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — only where a trusted server operation genuinely requires it.
- `LIVE_PROVIDER_API_KEY` — only after a live provider is selected.
- `LIVE_PROVIDER_WEBHOOK_SECRET` — only after webhook verification is implemented.
- `AD_PROVIDER_SERVER_KEY` — only if the chosen advertising provider requires a server credential.

Server-only variables must never have the `VITE_` prefix.

Use Cloudflare environment variables/secrets for deployed server-side functions. Local secrets belong in ignored environment files and must never be committed.

## 5. Supabase Setup

1. Create a Supabase project.
2. Configure email authentication.
3. Configure Google OAuth only after registering the OAuth application and exact redirect URLs.
4. Apply version-controlled database migrations.
5. Create the private storage bucket `videos`.
6. Configure storage policies and upload limits.
7. Enable RLS on every exposed table.
8. Configure Realtime only for the required tables/channels.
9. Verify policies using different test accounts and roles.
10. Configure backups, retention, and production monitoring according to the selected plan.

Never make a private bucket public simply to bypass an authorization bug.

## 6. Video Storage and Playback

The selected provider is **Supabase Storage**.

Suggested object path:

`{owner_user_id}/{video_id}/{random_object_name}`

The path is a storage organization convention, not proof of ownership. Policies must compare the authenticated user ID with the owner segment and verify database metadata as required.

Use unique object names. Avoid overwriting another user's object. Validate content type, file size, and duration; do not rely solely on filename extensions or browser-provided MIME types.

Playback strategy:
- Public videos may use a controlled public delivery strategy only if the product owner explicitly accepts public access.
- Otherwise, use a private bucket and short-lived signed URLs issued only after authorization.
- Delete or revoke access to objects when a video is removed or moderation requires removal.
- Confirm bandwidth, file-size, upload, and egress limits against the actual Supabase plan.

Supabase Storage does not automatically provide a full transcoding, adaptive bitrate, or live broadcasting pipeline. Those features require separately planned infrastructure.

## 7. Authentication and Authorization

- Use Supabase Auth sessions.
- Validate sessions on every protected server operation.
- Use RLS as the database enforcement layer.
- Keep privileged roles in a protected database table, not user-editable profile metadata.
- Only a trusted Super Admin operation may assign staff roles.
- Staff permissions must be explicitly limited.
- Prevent users from changing protected columns such as role, moderation status, and administrative audit records.
- Enforce conversation membership for message reads and writes.
- Apply rate limits to uploads, messaging, reports, and authentication-sensitive server endpoints.

## 8. Cloudflare Build and Deployment

Build command:

`npm run build`

Output directory:

`dist`

Use `npm ci` when a committed `package-lock.json` is available. Keep a single package manager lockfile. Do not commit conflicting Bun or Yarn lockfiles when npm is the approved workflow.

If required by dependency resolution, a root `.npmrc` may contain:

`legacy-peer-deps=true`

Use this only when the dependency tree requires it; document why.

Configure SPA fallback in `public/_redirects` when needed:

`/* /index.html 200`

Do not rewrite API routes or static assets incorrectly. Test direct navigation to nested application routes.

## 9. Quality and Security Gates

Before release:
- `npm run build` succeeds.
- Lint/type checks pass where configured.
- No secrets are committed.
- RLS is tested with guest, ordinary user, staff, and Super Admin accounts.
- Storage policies prevent unauthorized object access.
- Direct API requests cannot bypass UI permissions.
- Uploads reject unsupported formats and oversized files.
- Realtime subscriptions enforce the same access boundaries as database queries.
- Errors do not expose private server details.
- Cloudflare production environment variables are configured independently from local development.

## 10. External Integration Boundaries

Live streaming: provider selection and account setup are pending. Implement a provider-neutral adapter and an honest unavailable state until connected.

Advertising: placement components can be implemented, but a real network, SDK, consent configuration, and policy review are pending.

Android: web functionality must work first. Capacitor packaging, native OAuth callback behavior, store assets, privacy disclosures, and device testing are separate release tasks.

## 11. Architecture Change Control

If a change affects a database table, column, route, role, storage bucket, or environment variable, update all affected specification documents, SQL migrations, TypeScript types, and tests together.

Do not create a second competing name for an existing schema field or route.