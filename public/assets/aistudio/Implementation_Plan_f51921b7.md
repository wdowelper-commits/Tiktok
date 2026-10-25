# ShortVideo — Implementation Plan

**Version:** 1.0

## 1. Source of Truth

The six project documents are the shared source of truth:

1. `01_PRD.md`
2. `02_TRD.md`
3. `03_App_Flow.md`
4. `04_UI_UX_Design_Brief.md`
5. `05_Backend_Schema.md`
6. `06_Implementation_Plan.md`

Do not create separate, conflicting phase-specific requirements prompts. Google AI Studio Pass 1 and Pass 2 must use the same six documents.

## 2. Initial Setup

1. Create the project repository.
2. Confirm the final product name later; use `ShortVideo` temporarily.
3. Create the Supabase project.
4. Record the project URL and publishable key.
5. Configure email authentication.
6. Configure Google OAuth only after the OAuth application and callback URLs are ready.
7. Keep service-role credentials out of frontend files.
8. Prepare database migrations from `05_Backend_Schema.md`.

## 3. Google AI Studio — Pass 1

Upload all six Markdown documents together.

Use this instruction:

“Follow the plan.

Read all six uploaded Markdown documents completely and treat them as the single source of truth for the ShortVideo project. Build the complete React + TypeScript + Vite frontend according to the documented product requirements, application flows, UI/UX brief, backend schema, and implementation plan.

Keep all routes, database table names, column names, roles, and environment variable names consistent across the project. Use Supabase for authentication, PostgreSQL, Row Level Security, and video/file storage. Never expose service-role keys, secrets, or privileged credentials in frontend code.

Use GitHub for source control and Cloudflare Pages/Workers only for deployment and server-side functions. Do not use Vercel or introduce unapproved hosting providers.

Build a polished, responsive, mobile-first TikTok-style experience with short and long videos, profiles, follows, likes, comments, search, notifications, private messaging, live-streaming entry points, reporting, and role-based admin tools.

Videos should publish immediately by default, with post-publication reporting and moderation. Advertising belongs in v1; creator earnings and withdrawals are deferred. Implement safe defaults for unspecified details and clearly identify integrations requiring additional setup, particularly live streaming and advertising.

Use Supabase Storage for video files. Design uploads and playback with appropriate validation, access controls, file-size limits, and error handling. Do not assume Supabase provides live video broadcasting by itself.

Create maintainable, buildable code with a consistent folder structure, responsive UI, loading and error states, and accessible controls. Do not claim that external services are configured or operational until their setup has been verified. Identify incomplete integrations and blockers clearly.

Follow all six uploaded documents together. Do not implement only one document in isolation.”

Review the resulting application, files, and build output. Do not assume a successful preview means backend security is correct.

## 4. Supabase Backend Setup

1. Apply schema migrations.
2. Enable RLS for every application table.
3. Create the private `videos` bucket.
4. Apply and test storage policies.
5. Configure authentication providers.
6. Configure required Realtime behavior.
7. Implement trusted administrative operations.
8. Provision the first Super Admin through a controlled process.
9. Verify that ordinary users cannot assign roles or bypass moderation.
10. Test private messaging with unrelated accounts.

Do not place the service-role key in Vite environment variables or browser code.

## 5. GitHub Workflow

1. Export or connect the project to GitHub.
2. Commit the source code, migrations, lockfile, and documentation.
3. Exclude secrets and local environment files.
4. Review generated code for hard-coded credentials and fake functionality.
5. Use branches and pull requests for changes.
6. Run the production build before merging.
7. Keep migrations synchronized with TypeScript types and application queries.

Do not commit build artifacts or secret files unless explicitly required and safe.

## 6. Google AI Studio — Pass 2

Upload the exact same six Markdown documents again. Use the requested re-analysis instruction:

“In files ko dobara se analyze kr k Dekho or compare kro k hmari website ma Jo Jo Cheezen Rehti Hain unhe thk kro or Kam final kro.”

The purpose of Pass 2 is to compare the generated project against all six documents, fix missing requirements, correct schema and route inconsistencies, improve UI quality, and complete work that can genuinely be completed without unconfigured external services.

Do not let Pass 2 invent service credentials, mark integrations as operational without evidence, or introduce unapproved infrastructure.

## 7. Integration Work

### Advertising

- Select and configure a compliant advertising provider.
- Review consent, privacy, and platform policies.
- Add the provider's approved integration.
- Verify impressions and failures without blocking video playback.
- Until complete, show no fake advertisements.

### Live streaming

- Select a live-media provider or implement compatible streaming infrastructure.
- Configure server-side credentials and verified webhooks.
- Implement authorized stream creation and playback.
- Test host, viewer, ended-stream, and failure states.
- Until complete, retain a clear setup-required interface.

### Android

- Verify the responsive website and PWA first.
- Package the web app with Capacitor if required.
- Test authentication callbacks, uploads, playback, permissions, back navigation, and network failures on real Android devices.
- Prepare store assets, privacy disclosures, and release signing separately.

## 8. Cloudflare Deployment

1. Connect the GitHub repository to Cloudflare Pages.
2. Set build command to `npm run build`.
3. Set output directory to `dist`.
4. Configure required public frontend variables.
5. Configure private server-side variables as Cloudflare secrets.
6. Configure SPA fallback without breaking static assets or API routes.
7. Deploy a preview build.
8. Test direct navigation to nested routes.
9. Verify Supabase redirect URLs and production origins.
10. Promote to production only after security and functionality checks pass.

Do not use Vercel.

## 9. Testing Checklist

### Functional

- [yes] Email registration, login, logout, and password reset.
- [yes] Google OAuth after configuration.
- [yes] Video upload and playback.
- [yes] Profiles, follows, likes, and comments.
- [yes] Search and notifications.
- [yes] Private messages and realtime updates.
- [yes] Reporting and moderation.
- [yes] Admin role restrictions.
- [yes] Live-stream setup-required and operational states.
- [yes] Advertising setup-required and operational states.

### Security

- [yes] RLS enabled on all application tables.
- [yes] Storage access rules tested.
- [yes] Users cannot change roles.
- [yes] Users cannot edit another user's content.
- [yes] Conversation membership is enforced.
- [yes] Reports cannot be resolved by ordinary users.
- [yes] Audit logs cannot be forged by clients.
- [yes] No secrets appear in frontend bundles or GitHub.
- [yes] Rate limits and upload constraints are enforced.

### Deployment

- [yes] Production build succeeds.
- [yes] Nested routes load directly.
- [yes] Required environment variables are configured.
- [yes] No console errors block core functionality.
- [yes] Mobile and desktop layouts work.
- [yes] Upload and playback work on supported devices.

## 10. Release Gates

Do not describe the product as production-ready until:

- Core features have been tested against a real Supabase project.
- RLS and storage policies have been verified.
- Privileged actions are server-authorized.
- Production deployment and environment variables have been checked.
- Required privacy, terms, moderation, and retention policies are reviewed.
- Live streaming and advertising are either genuinely configured or explicitly labelled as unavailable.

## 11. Future Work

- Creator earnings and withdrawals.
- Additional moderation automation.
- Video transcoding and adaptive streaming.
- Analytics and performance optimization.
- Native Android refinements.
- Final branding and localization.

Future work must preserve the canonical schema and approved technology stack unless the project documents are updated consistently.
