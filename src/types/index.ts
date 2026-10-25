/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleType = 'staff' | 'super_admin';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: RoleType;
  created_at: string;
}

export type VideoVisibility = 'public' | 'unlisted' | 'private';
export type VideoStatus = 'processing' | 'published' | 'restricted' | 'removed' | 'failed';

export interface Video {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  storage_path: string;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  visibility: VideoVisibility;
  status: VideoStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  // Extended fields joined in queries:
  owner?: Profile;
  likes_count?: number;
  comments_count?: number;
  is_liked_by_me?: boolean;
  is_following_owner?: boolean;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface VideoLike {
  user_id: string;
  video_id: string;
  created_at: string;
}

export type CommentStatus = 'published' | 'hidden' | 'removed';

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  // Joined fields:
  user?: Profile;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  // Joined fields:
  members?: Profile[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
  // Joined fields:
  sender?: Profile;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'message';

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, any>;
  read_at: string | null;
  created_at: string;
  actor?: Profile;
}

export type ReportTargetType = 'video' | 'comment' | 'user' | 'live_stream' | 'message';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined fields:
  reporter?: Profile;
  reviewer?: Profile;
  target_label?: string;
}

export type LiveStreamStatus = 'pending' | 'live' | 'ended' | 'cancelled' | 'failed';

export interface LiveStream {
  id: string;
  host_id: string;
  title: string;
  status: LiveStreamStatus;
  provider: string | null;
  provider_stream_id: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  host?: Profile;
}

export interface Banner {
  id: string;
  title: string;
  image_path: string | null;
  target_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: Record<string, any>;
  updated_by: string | null;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, any>;
  created_at: string;
  actor?: Profile;
}
