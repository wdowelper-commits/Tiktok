/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateVideoFile,
  validateVideoMetadata,
  validateUsername,
  validateSafeUrl,
  isValidReportTargetType,
  canPerformAdminAction,
  MAX_VIDEO_SIZE_BYTES,
} from './rules';

test('validateVideoFile: validates file existence, size, and extensions', () => {
  // Empty or missing
  assert.equal(validateVideoFile(null as any).valid, false);
  assert.equal(validateVideoFile({ name: 'clip.mp4', size: 0 }).valid, false);

  // Oversized
  assert.equal(
    validateVideoFile({ name: 'huge.mp4', size: MAX_VIDEO_SIZE_BYTES + 10 }).valid,
    false
  );

  // Valid MP4, WebM, MOV
  assert.equal(
    validateVideoFile({ name: 'clip.mp4', size: 1024 * 1024, type: 'video/mp4' }).valid,
    true
  );
  assert.equal(
    validateVideoFile({ name: 'dance.webm', size: 2 * 1024 * 1024, type: 'video/webm' }).valid,
    true
  );
  assert.equal(
    validateVideoFile({ name: 'vlog.mov', size: 5 * 1024 * 1024, type: 'video/quicktime' }).valid,
    true
  );

  // Invalid extension / type
  assert.equal(
    validateVideoFile({ name: 'script.exe', size: 1024, type: 'application/x-msdownload' }).valid,
    false
  );
});

test('validateVideoMetadata: enforces title limits and description constraints', () => {
  assert.equal(validateVideoMetadata('ab').valid, false); // too short
  assert.equal(validateVideoMetadata('Cool Short Video').valid, true);
  assert.equal(validateVideoMetadata('a'.repeat(151)).valid, false); // too long
  assert.equal(validateVideoMetadata('Valid Title', 'Valid desc').valid, true);
  assert.equal(validateVideoMetadata('Valid Title', 'x'.repeat(2001)).valid, false);
});

test('validateUsername: enforces alphanumeric and length standards', () => {
  assert.equal(validateUsername('ab').valid, false); // too short
  assert.equal(validateUsername('valid_user123').valid, true);
  assert.equal(validateUsername('Invalid-User!').valid, false); // dashes/exclamation not allowed
  assert.equal(validateUsername('a'.repeat(31)).valid, false); // >30
});

test('validateSafeUrl: rejects javascript: and dangerous schemes', () => {
  assert.equal(validateSafeUrl('javascript:alert(1)').valid, false);
  assert.equal(validateSafeUrl('vbscript:msgbox(1)').valid, false);
  assert.equal(validateSafeUrl('data:text/html,<script>').valid, false);
  assert.equal(validateSafeUrl('https://example.com/ad').valid, true);
  assert.equal(validateSafeUrl('/internal/path').valid, true);
  assert.equal(validateSafeUrl('').valid, true);
});

test('isValidReportTargetType: matches canonical target types only', () => {
  assert.equal(isValidReportTargetType('video'), true);
  assert.equal(isValidReportTargetType('comment'), true);
  assert.equal(isValidReportTargetType('user'), true);
  assert.equal(isValidReportTargetType('live_stream'), true);
  assert.equal(isValidReportTargetType('message'), true);
  assert.equal(isValidReportTargetType('unknown_target'), false);
});

test('canPerformAdminAction: differentiates staff vs super_admin vs user', () => {
  assert.equal(canPerformAdminAction(null, 'review_reports'), false);
  assert.equal(canPerformAdminAction([], 'moderate_videos'), false);

  // Staff
  assert.equal(canPerformAdminAction(['staff'], 'review_reports'), true);
  assert.equal(canPerformAdminAction(['staff'], 'moderate_videos'), true);
  assert.equal(canPerformAdminAction(['staff'], 'manage_roles'), false);
  assert.equal(canPerformAdminAction(['staff'], 'manage_settings'), false);

  // Super Admin
  assert.equal(canPerformAdminAction(['super_admin'], 'review_reports'), true);
  assert.equal(canPerformAdminAction(['super_admin'], 'manage_roles'), true);
  assert.equal(canPerformAdminAction(['super_admin'], 'manage_settings'), true);
});
