/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve public environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Also check session/local storage for user-provided testing credentials
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('shortvideo_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('shortvideo_supabase_key') || '' : '';

export const supabaseUrl = (storedUrl || envUrl || '').trim();
export const supabasePublishableKey = (storedKey || envKey || '').trim();

/**
 * Checks if Supabase credentials are configured with actual valid values.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabasePublishableKey &&
    !supabaseUrl.includes('your-project') &&
    !supabasePublishableKey.includes('your-anon-or-publishable-key')
  );
}

// Instantiate client if configured
let clientInstance: SupabaseClient | null = null;
if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = clientInstance;

/**
 * Saves runtime testing credentials to localStorage and reloads.
 */
export function setCustomSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('shortvideo_supabase_url', url.trim());
      localStorage.setItem('shortvideo_supabase_key', key.trim());
    } else {
      localStorage.removeItem('shortvideo_supabase_url');
      localStorage.removeItem('shortvideo_supabase_key');
    }
    window.location.reload();
  }
}
