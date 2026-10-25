/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReportTargetType, RoleType } from '../../types';

export const MAX_VIDEO_SIZE_BYTES = 200 * 1024 * 1024; // 200MB default safe limit for v1
export const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates video file properties before upload.
 */
export function validateVideoFile(file: { name: string; size: number; type?: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Video file exceeds maximum size limit of ${MAX_VIDEO_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  const mime = file.type ? file.type.toLowerCase() : '';
  const ext = file.name.split('.').pop()?.toLowerCase();

  const isMimeValid = mime && ALLOWED_VIDEO_MIME_TYPES.includes(mime);
  const isExtValid = ext && ['mp4', 'webm', 'mov'].includes(ext);

  if (!isMimeValid && !isExtValid) {
    return {
      valid: false,
      error: 'Unsupported format. Allowed formats: MP4, WebM, and MOV.',
    };
  }

  return { valid: true };
}

/**
 * Validates video title and description.
 */
export function validateVideoMetadata(title: string, description?: string | null): ValidationResult {
  const trimmedTitle = (title || '').trim();
  if (trimmedTitle.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters long.' };
  }
  if (trimmedTitle.length > 150) {
    return { valid: false, error: 'Title cannot exceed 150 characters.' };
  }

  if (description && description.length > 2000) {
    return { valid: false, error: 'Description cannot exceed 2000 characters.' };
  }

  return { valid: true };
}

/**
 * Validates usernames (alphanumeric and underscore, 3-30 chars).
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = (username || '').trim().toLowerCase();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters.' };
  }

  const regex = /^[a-z0-9_]+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'Username may only contain letters, numbers, and underscores.' };
  }

  return { valid: true };
}

/**
 * Validates URLs to prevent script injections (e.g. javascript:).
 */
export function validateSafeUrl(url: string | null | undefined): ValidationResult {
  if (!url || !url.trim()) {
    return { valid: true }; // optional empty url is safe
  }
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('data:')
  ) {
    return { valid: false, error: 'Unsafe URL scheme detected.' };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only http and https protocols are supported.' };
    }
  } catch {
    // Relative URLs starting with / are allowed
    if (!url.startsWith('/')) {
      return { valid: false, error: 'Must be a valid HTTP(S) URL or internal path.' };
    }
  }

  return { valid: true };
}

/**
 * Validates report target types against canonical schema.
 */
export function isValidReportTargetType(type: string): type is ReportTargetType {
  return ['video', 'comment', 'user', 'live_stream', 'message'].includes(type);
}

/**
 * Checks permissions for administrative actions.
 */
export function canPerformAdminAction(
  roles: RoleType[] | null | undefined,
  action: 'review_reports' | 'moderate_videos' | 'manage_roles' | 'manage_settings' | 'view_audit_logs'
): boolean {
  if (!roles || roles.length === 0) return false;

  const isSuperAdmin = roles.includes('super_admin');
  const isStaff = roles.includes('staff') || isSuperAdmin;

  switch (action) {
    case 'review_reports':
    case 'moderate_videos':
    case 'view_audit_logs':
      return isStaff;
    case 'manage_roles':
    case 'manage_settings':
      return isSuperAdmin;
    default:
      return false;
  }
}
