# ShortVideo — Backend Schema and Security Specification

**Version:** 1.0  
**Database:** Supabase PostgreSQL  
**Storage:** Supabase Storage  
**Security model:** RLS by default

## 1. Schema Rules

- Use UUID primary keys unless a field is explicitly a natural key.
- Use `timestamptz` for timestamps.
- Reference `auth.users(id)` for authenticated ownership.
- Enable RLS on all application tables exposed through the Supabase API.
- Never authorize a request using a client-supplied user ID alone.
- Use migrations as the canonical schema source.
- The names in this document are canonical; do not introduce duplicate naming variants.

## 2. Canonical Tables

### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `username text unique not null`
- `display_name text`
- `bio text`
- `avatar_path text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Users may update only their own permitted profile fields. Role fields do not belong here.

### `user_roles`
- `user_id uuid references auth.users(id) on delete cascade`
- `role text not null check (role in ('staff','super_admin'))`
- `created_at timestamptz not null default now()`
- Primary key: `(user_id, role)`

Ordinary users have no row in this table. Role writes must be restricted to trusted administrative functions. The first Super Admin must be provisioned through a controlled, documented server-side setup process.

### `videos`
- `id uuid primary key default gen_random_uuid()`
- `owner_id uuid not null references auth.users(id)`
- `title text not null`
- `description text`
- `storage_path text not null unique`
- `thumbnail_path text`
- `duration_seconds numeric`
- `visibility text not null default 'public' check (visibility in ('public','unlisted','private'))`
- `status text not null default 'processing' check (status in ('processing','published','restricted','removed','failed'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `published_at timestamptz`

Only eligible published videos are visible in public discovery. Ownership does not permit bypassing moderation restrictions.

### `follows`
- `follower_id uuid not null references auth.users(id) on delete cascade`
- `following_id uuid not null references auth.users(id) on delete cascade`
- `created_at timestamptz not null default now()`
- Primary key: `(follower_id, following_id)`
- Check: `follower_id <> following_id`

### `video_likes`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `video_id uuid not null references videos(id) on delete cascade`
- `created_at timestamptz not null default now()`
- Primary key: `(user_id, video_id)`

### `comments`
- `id uuid primary key default gen_random_uuid()`
- `video_id uuid not null references videos(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `body text not null`
- `status text not null default 'published' check (status in ('published','hidden','removed'))`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `conversations`
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `conversation_members`
- `conversation_id uuid not null references conversations(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `joined_at timestamptz not null default now()`
- Primary key: `(conversation_id, user_id)`

Private conversations are limited to the intended participants. A trusted function should create or reuse a one-to-one conversation and prevent duplicate participant pairs.

### `messages`
- `id uuid primary key default gen_random_uuid()`
- `conversation_id uuid not null references conversations(id) on delete cascade`
- `sender_id uuid not null references auth.users(id)`
- `body text not null`
- `created_at timestamptz not null default now()`
- `read_at timestamptz`

The sender must be a member of the conversation. Only members can read messages. Message length and rate limits must be enforced.

### `notifications`
- `id uuid primary key default gen_random_uuid()`
- `recipient_id uuid not null references auth.users(id) on delete cascade`
- `actor_id uuid references auth.users(id) on delete set null`
- `type text not null`
- `entity_type text`
- `entity_id uuid`
- `payload jsonb not null default '{}'::jsonb`
- `read_at timestamptz`
- `created_at timestamptz not null default now()`

Users may read and mark as read only their own notifications. Notification creation should occur through trusted database functions or server-side event handlers.

### `reports`
- `id uuid primary key default gen_random_uuid()`
- `reporter_id uuid not null references auth.users(id)`
- `target_type text not null check (target_type in ('video','comment','user','live_stream','message'))`
- `target_id uuid not null`
- `reason text not null`
- `details text`
- `status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed'))`
- `reviewed_by uuid references auth.users(id)`
- `reviewed_at timestamptz`
- `created_at timestamptz not null default now()`

Validate that the target exists and is reportable. Because `target_id` refers to different tables, use trusted validation logic rather than pretending one ordinary foreign key covers every target type.

### `live_streams`
- `id uuid primary key default gen_random_uuid()`
- `host_id uuid not null references auth.users(id)`
- `title text not null`
- `status text not null default 'pending' check (status in ('pending','live','ended','cancelled','failed'))`
- `provider text`
- `provider_stream_id text`
- `created_at timestamptz not null default now()`
- `started_at timestamptz`
- `ended_at timestamptz`

Provider IDs and playback authorization must not be exposed in ways that grant unauthorized broadcast control. This table alone does not implement live media.

### `banners`
- `id uuid primary key default gen_random_uuid()`
- `title text not null`
- `image_path text`
- `target_url text`
- `is_active boolean not null default false`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `created_by uuid references auth.users(id)`
- `created_at timestamptz not null default now()`

Validate target URLs and prevent unsafe schemes such as `javascript:`. Only authorized staff or Super Admin may manage banners.

### `platform_settings`
- `key text primary key`
- `value jsonb not null default '{}'::jsonb`
- `updated_by uuid references auth.users(id)`
- `updated_at timestamptz not null default now()`

Do not store secrets in this table. Keep secrets in server-side secret storage.

### `admin_audit_logs`
- `id uuid primary key default gen_random_uuid()`
- `actor_id uuid references auth.users(id)`
- `action text not null`
- `target_type text`
- `target_id uuid`
- `details jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Clients must not insert, update, or delete audit entries. Trusted functions should record administrative actions.

## 3. Storage Bucket

Create a private bucket named `videos`.

Suggested path format:

`{auth.uid()}/{video_id}/{random_object_name}`

Requirements:
- Validate object ownership.
- Validate MIME type and file size.
- Do not use predictable filenames as an authorization mechanism.
- Restrict updates and deletes to authorized owners or trusted moderation operations.
- Use short-lived signed URLs where private playback is required.
- Keep storage policies consistent with video metadata and moderation status.

Profile avatars and thumbnails may use separate buckets if needed; document any additional bucket and its policies before implementation.

## 4. RLS Policy Requirements

Enable RLS on every application table.

### Profiles
- Public read access only for approved public profile fields.
- Authenticated users may update their own permitted fields.
- Users cannot alter roles or another user's profile.

If the table exposes fields that must remain private, split them into a separately protected table rather than relying on the UI to hide them.

### User roles
- Ordinary clients cannot insert, update, or delete roles.
- A trusted server-side operation may assign roles after verifying the current actor.
- Staff access must be limited to explicitly approved administrative actions.
- Never trust a role sent from the browser.

### Videos
- Public users may read only eligible public videos.
- Owners may create and update their own permitted video metadata.
- Owners cannot assign privileged moderation states.
- Publication, restriction, and removal transitions must be validated.
- Staff moderation must use authorized policies or trusted functions.

### Follows and likes
- Authenticated users can create/delete their own follow and like records.
- Enforce unique keys and prevent self-following.
- Public counts may be aggregated without exposing unnecessary private information.

### Comments
- Users may read eligible published comments.
- Authenticated users may create comments as themselves.
- Owners may delete their own comments.
- Only authorized moderation operations may change moderation status.

### Messaging
- Conversation members can read membership and messages for their conversations.
- A sender must be a member before sending.
- Users cannot add themselves to arbitrary conversations.
- Membership changes require a trusted operation.
- Realtime subscriptions must respect the same authorization rules.

### Notifications
- Recipients can read and mark their own notifications as read.
- Client writes must not permit arbitrary notifications to other users.
- Trusted functions create notification events.

### Reports
- Authenticated users can submit validated reports.
- Reporters can view their own reports only where the product requires it.
- Staff can view and resolve reports within their permission scope.
- Client users cannot change review status or reviewer identity.

### Live streams
- Public reads only for eligible public stream metadata.
- Hosts may create and manage permitted metadata for their own sessions.
- Provider credentials and privileged stream controls remain server-side.
- Webhook-driven status changes require provider signature verification.

### Banners and settings
- Public reads are limited to active, currently eligible banners and approved public settings.
- Only authorized administrators may write them.
- Never expose secrets through settings.

### Audit logs
- No direct client writes.
- Authorized administrators may read only the logs their role is permitted to access.
- Inserts come from trusted server-side operations.

## 5. Indexes and Constraints

Add indexes for:
- `videos(status, visibility, published_at desc)`
- `videos(owner_id, created_at desc)`
- `comments(video_id, created_at desc)`
- `messages(conversation_id, created_at desc)`
- `notifications(recipient_id, created_at desc)`
- `reports(status, created_at desc)`
- `live_streams(status, created_at desc)`
- `conversation_members(user_id, conversation_id)`

Add appropriate foreign keys, unique constraints, and validation checks. Review indexes against actual query patterns.

## 6. Privileged Operations

Use trusted server-side functions for:
- Role assignment and revocation.
- Moderation transitions requiring elevated permission.
- Secure live-provider operations.
- Verified webhook processing.
- Administrative audit logging.
- Sensitive notification generation.
- Signed media access when the bucket is private.

Every operation must authenticate the caller, verify their current database-backed role, validate input, and return the minimum required data.

## 7. First Super Admin Provisioning

Do not allow a public signup form to create Super Admin users.

Provision the first Super Admin using a controlled one-time administrative procedure after the account exists. Keep the procedure out of public frontend code, restrict access to database credentials, and remove temporary bootstrap privileges afterward.

## 8. Schema Consistency

These table and column names are canonical for all six project documents. Any migration that changes them must also update application types, API calls, RLS policies, tests, and the relevant documentation.