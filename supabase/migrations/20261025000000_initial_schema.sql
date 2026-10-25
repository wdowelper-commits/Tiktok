-- ==============================================================================
-- ShortVideo Canonical PostgreSQL Schema & Security Hardening Migration
-- Version: 1.1 (Production-Ready)
-- Conforms strictly to 05_Backend_Schema.md and TRD_37e5d54f.md
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CANONICAL APPLICATION TABLES (Idempotent)

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('staff', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

-- videos
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  storage_path text NOT NULL UNIQUE,
  thumbnail_path text,
  duration_seconds numeric,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'published', 'restricted', 'removed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_no_self_follow CHECK (follower_id <> following_id)
);

-- video_likes
CREATE TABLE IF NOT EXISTS public.video_likes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);

-- comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- conversation_members
CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL,
  entity_type text,
  entity_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id),
  target_type text NOT NULL CHECK (target_type IN ('video', 'comment', 'user', 'live_stream', 'message')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- live_streams
CREATE TABLE IF NOT EXISTS public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'live', 'ended', 'cancelled', 'failed')),
  provider text,
  provider_stream_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_path text,
  target_url text,
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- admin_audit_logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text,
  target_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. CANONICAL INDEXES
CREATE INDEX IF NOT EXISTS idx_videos_discovery ON public.videos(status, visibility, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_owner ON public.videos(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video ON public.comments(video_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON public.live_streams(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON public.conversation_members(user_id, conversation_id);

-- 4. SECURE ROLE HELPER FUNCTIONS
-- Explicit search_path and restricted permissions to prevent function hijacking
CREATE OR REPLACE FUNCTION public.is_staff(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role IN ('staff', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- 5. MODERATION INTEGRITY TRIGGER (Item 1: Prevent bypass of video moderation)
CREATE OR REPLACE FUNCTION public.enforce_video_moderation_rules()
RETURNS trigger AS $$
BEGIN
  -- If invoked by staff or super_admin, permit all status transitions
  IF public.is_staff(auth.uid()) THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- Ordinary owner validation
  IF auth.uid() = OLD.owner_id THEN
    -- Owners are strictly prohibited from changing status (e.g. un-restricting or re-publishing)
    IF NEW.status <> OLD.status THEN
      RAISE EXCEPTION 'Video owners are not permitted to alter moderation status (current status: %)', OLD.status;
    END IF;

    -- Owners cannot transfer ownership
    IF NEW.owner_id <> OLD.owner_id THEN
      RAISE EXCEPTION 'Transferring video ownership is not permitted.';
    END IF;

    -- If content was restricted or removed by staff, owners cannot edit metadata to circumvent moderation
    IF OLD.status IN ('restricted', 'removed') THEN
      RAISE EXCEPTION 'Cannot modify video content while under moderation restriction.';
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized operation on video record.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_enforce_video_moderation ON public.videos;
CREATE TRIGGER tr_enforce_video_moderation
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_video_moderation_rules();

-- Comment moderation integrity trigger
CREATE OR REPLACE FUNCTION public.enforce_comment_moderation_rules()
RETURNS trigger AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF auth.uid() = OLD.user_id THEN
    IF NEW.status <> OLD.status THEN
      RAISE EXCEPTION 'Comment authors cannot alter moderation status.';
    END IF;
    IF OLD.status IN ('hidden', 'removed') THEN
      RAISE EXCEPTION 'Cannot edit removed or hidden comments.';
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized comment modification.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS tr_enforce_comment_moderation ON public.comments;
CREATE TRIGGER tr_enforce_comment_moderation
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_comment_moderation_rules();

-- 6. SECURE CONVERSATION CREATION FUNCTION (Item 3)
-- Prevents duplicate 1-to-1 conversations and arbitrary member injections
CREATE OR REPLACE FUNCTION public.create_or_get_direct_conversation(recipient_uuid uuid)
RETURNS uuid AS $$
DECLARE
  existing_conv_id uuid;
  new_conv_id uuid;
  caller_id uuid := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to start a conversation.';
  END IF;

  IF recipient_uuid IS NULL OR recipient_uuid = caller_id THEN
    RAISE EXCEPTION 'Invalid conversation recipient.';
  END IF;

  -- Ensure recipient user exists in profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = recipient_uuid) THEN
    RAISE EXCEPTION 'Recipient profile not found.';
  END IF;

  -- Look for an existing 1-on-1 conversation containing both members
  SELECT cm1.conversation_id INTO existing_conv_id
  FROM public.conversation_members cm1
  JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
  WHERE cm1.user_id = caller_id AND cm2.user_id = recipient_uuid
  LIMIT 1;

  IF existing_conv_id IS NOT NULL THEN
    RETURN existing_conv_id;
  END IF;

  -- Insert new conversation
  INSERT INTO public.conversations (id, created_at, updated_at)
  VALUES (gen_random_uuid(), now(), now())
  RETURNING id INTO new_conv_id;

  -- Insert both members
  INSERT INTO public.conversation_members (conversation_id, user_id, joined_at)
  VALUES
    (new_conv_id, caller_id, now()),
    (new_conv_id, recipient_uuid, now());

  RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.create_or_get_direct_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_or_get_direct_conversation(uuid) TO authenticated, service_role;

-- 7. AUDIT LOGGING HELPER FUNCTION (Item 4)
CREATE OR REPLACE FUNCTION public.record_admin_audit_log(
  p_action text,
  p_target_type text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
  v_actor_id uuid := auth.uid();
BEGIN
  IF NOT public.is_staff(v_actor_id) THEN
    RAISE EXCEPTION 'Only staff or super admin can record administrative audit logs.';
  END IF;

  INSERT INTO public.admin_audit_logs (id, actor_id, action, target_type, target_id, details, created_at)
  VALUES (gen_random_uuid(), v_actor_id, p_action, p_target_type, p_target_id, p_details, now())
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.record_admin_audit_log(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_admin_audit_log(text, text, uuid, jsonb) TO authenticated, service_role;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent: DROP IF EXISTS -> CREATE)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- user_roles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own roles or admins can view all" ON public.user_roles;
CREATE POLICY "Users can view their own roles or admins can view all"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Only super_admin can modify roles" ON public.user_roles;
CREATE POLICY "Only super_admin can modify roles"
  ON public.user_roles FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- videos
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Eligible published videos are visible to all" ON public.videos;
CREATE POLICY "Eligible published videos are visible to all"
  ON public.videos FOR SELECT
  USING (
    (status = 'published' AND visibility = 'public')
    OR (auth.uid() = owner_id)
    OR public.is_staff(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can insert videos with owner_id" ON public.videos;
CREATE POLICY "Authenticated users can insert videos with owner_id"
  ON public.videos FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    AND status IN ('processing', 'published')
  );

DROP POLICY IF EXISTS "Owners or staff can update videos" ON public.videos;
CREATE POLICY "Owners or staff can update videos"
  ON public.videos FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = owner_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Owners or staff can delete videos" ON public.videos;
CREATE POLICY "Owners or staff can delete videos"
  ON public.videos FOR DELETE
  USING (auth.uid() = owner_id OR public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- follows
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view follows" ON public.follows;
CREATE POLICY "Public can view follows"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

DROP POLICY IF EXISTS "Authenticated users can unfollow" ON public.follows;
CREATE POLICY "Authenticated users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- -----------------------------------------------------------------------------
-- video_likes
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Likes are readable by all" ON public.video_likes;
CREATE POLICY "Likes are readable by all"
  ON public.video_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like videos" ON public.video_likes;
CREATE POLICY "Authenticated users can like videos"
  ON public.video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike videos" ON public.video_likes;
CREATE POLICY "Users can unlike videos"
  ON public.video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- comments
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Published comments are viewable" ON public.comments;
CREATE POLICY "Published comments are viewable"
  ON public.comments FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'published');

DROP POLICY IF EXISTS "Comment owners or staff can update comments" ON public.comments;
CREATE POLICY "Comment owners or staff can update comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Comment owners or staff can delete comments" ON public.comments;
CREATE POLICY "Comment owners or staff can delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- conversations & conversation_members (Item 3: Strict participant access)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view conversations" ON public.conversations;
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = public.conversations.id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Members can view membership" ON public.conversation_members;
CREATE POLICY "Members can view membership"
  ON public.conversation_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = public.conversation_members.conversation_id AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_members;
CREATE POLICY "Users can join conversations"
  ON public.conversation_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      -- If adding another user, caller must already be a verified member of this conversation
      SELECT 1 FROM public.conversation_members cm
      WHERE cm.conversation_id = conversation_members.conversation_id AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_members;
CREATE POLICY "Users can leave conversations"
  ON public.conversation_members FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view messages" ON public.messages;
CREATE POLICY "Members can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can send messages" ON public.messages;
CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = public.messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Senders can delete messages" ON public.messages;
CREATE POLICY "Senders can delete messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id OR public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users update own notifications read status" ON public.notifications;
CREATE POLICY "Users update own notifications read status"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Authenticated users or server create notifications" ON public.notifications;
CREATE POLICY "Authenticated users or server create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (actor_id = auth.uid() OR actor_id IS NULL)
  );

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = recipient_id);

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Reporters can view own reports or staff can view all" ON public.reports;
CREATE POLICY "Reporters can view own reports or staff can view all"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND status = 'open');

DROP POLICY IF EXISTS "Staff can update reports" ON public.reports;
CREATE POLICY "Staff can update reports"
  ON public.reports FOR UPDATE
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- live_streams
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Eligible live streams are readable by all" ON public.live_streams;
CREATE POLICY "Eligible live streams are readable by all"
  ON public.live_streams FOR SELECT
  USING (status IN ('live', 'ended', 'pending') OR auth.uid() = host_id OR public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Hosts can create streams" ON public.live_streams;
CREATE POLICY "Hosts can create streams"
  ON public.live_streams FOR INSERT
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts or staff can update streams" ON public.live_streams;
CREATE POLICY "Hosts or staff can update streams"
  ON public.live_streams FOR UPDATE
  USING (auth.uid() = host_id OR public.is_staff(auth.uid()))
  WITH CHECK (auth.uid() = host_id OR public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- banners
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active eligible banners" ON public.banners;
CREATE POLICY "Public can view active eligible banners"
  ON public.banners FOR SELECT
  USING (
    (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()))
    OR public.is_staff(auth.uid())
  );

DROP POLICY IF EXISTS "Staff can manage banners" ON public.banners;
CREATE POLICY "Staff can manage banners"
  ON public.banners FOR ALL
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- -----------------------------------------------------------------------------
-- platform_settings
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Settings readable" ON public.platform_settings;
CREATE POLICY "Settings readable"
  ON public.platform_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admin can update settings" ON public.platform_settings;
CREATE POLICY "Super admin can update settings"
  ON public.platform_settings FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- admin_audit_logs (Item 4: Immutable, client writes strictly blocked)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can read audit logs" ON public.admin_audit_logs;
CREATE POLICY "Staff can read audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_staff(auth.uid()));

-- Clients are blocked from direct INSERT/UPDATE/DELETE. Inserts occur via record_admin_audit_log().

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET & POLICIES (Item 6)
-- Bucket: 'videos' (Private by default)
-- Path format: {owner_user_id}/{video_id}/{filename}
-- ==============================================================================

-- Create or configure the private 'videos' bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  209715200, -- 200MB in bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Upload to own path only: {auth.uid()}/*
DROP POLICY IF EXISTS "Users upload videos to own folder" ON storage.objects;
CREATE POLICY "Users upload videos to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'videos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: Read videos (owner, staff, or public if published video)
DROP POLICY IF EXISTS "Authorized access to video objects" ON storage.objects;
CREATE POLICY "Authorized access to video objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'videos'
    AND (
      -- Owner can always view own uploads
      (storage.foldername(name))[1] = auth.uid()::text
      -- Staff can inspect all videos
      OR public.is_staff(auth.uid())
      -- Public playback permitted for published, public videos matching the storage path
      OR EXISTS (
        SELECT 1 FROM public.videos v
        WHERE v.status = 'published'
          AND v.visibility = 'public'
          AND (v.storage_path LIKE '%' || name OR name LIKE '%' || v.id || '%')
      )
    )
  );

-- Storage RLS: Update/Delete own videos
DROP POLICY IF EXISTS "Owners or staff can delete video objects" ON storage.objects;
CREATE POLICY "Owners or staff can delete video objects"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'videos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_staff(auth.uid())
    )
  );

-- Storage RLS: Update objects
DROP POLICY IF EXISTS "Owners can update own video objects" ON storage.objects;
CREATE POLICY "Owners can update own video objects"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'videos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_staff(auth.uid())
    )
  );
