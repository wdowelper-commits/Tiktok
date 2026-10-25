/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DEMO_PROFILES } from '../../lib/mockData';
import { Profile, RoleType } from '../../types';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  roles: RoleType[];
  isStaff: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  // Demo role switcher for testing when Supabase is in preview/demo mode
  demoRole: 'guest' | 'user' | 'staff' | 'super_admin';
  setDemoRole: (role: 'guest' | 'user' | 'staff' | 'super_admin') => void;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Demo testing role state
  const [demoRole, setDemoRoleState] = useState<'guest' | 'user' | 'staff' | 'super_admin'>('user');

  const setDemoRole = (role: 'guest' | 'user' | 'staff' | 'super_admin') => {
    setDemoRoleState(role);
    if (!isConfigured) {
      applyDemoRole(role);
    }
  };

  const applyDemoRole = (role: 'guest' | 'user' | 'staff' | 'super_admin') => {
    if (role === 'guest') {
      setUser(null);
      setProfile(null);
      setRoles([]);
    } else if (role === 'user') {
      setUser({ id: 'current-user', email: 'creator@shortvideo.io' });
      setProfile(DEMO_PROFILES['current-user']);
      setRoles([]);
    } else if (role === 'staff') {
      setUser({ id: 'current-user', email: 'staff@shortvideo.io' });
      setProfile({
        ...DEMO_PROFILES['current-user'],
        display_name: 'Staff Moderator',
      });
      setRoles(['staff']);
    } else if (role === 'super_admin') {
      setUser({ id: 'current-user', email: 'admin@shortvideo.io' });
      setProfile({
        ...DEMO_PROFILES['current-user'],
        display_name: 'Super Administrator',
      });
      setRoles(['staff', 'super_admin']);
    }
  };

  useEffect(() => {
    if (!isConfigured || !supabase) {
      applyDemoRole(demoRole);
      setIsLoading(false);
      return;
    }

    // Supabase is configured
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          await loadUserProfileAndRoles(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRoles([]);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        await loadUserProfileAndRoles(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRoles([]);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isConfigured]);

  const loadUserProfileAndRoles = async (userId: string) => {
    if (!supabase) return;
    try {
      // Load Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileErr && profileData) {
        setProfile(profileData);
      }

      // Load Roles
      const { data: rolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!rolesErr && rolesData) {
        setRoles(rolesData.map((r: { role: RoleType }) => r.role));
      }
    } catch (e) {
      console.error('Error loading user profile or roles:', e);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!isConfigured || !supabase) {
      return { error: 'Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ error?: string }> => {
    if (!isConfigured || !supabase) {
      return { error: 'Supabase is not configured yet. Please configure credentials.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (error) return { error: error.message };

    // Create profile row if user was created
    if (data.user) {
      const { error: pErr } = await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        display_name: username,
      });
      if (pErr) console.warn('Could not auto-insert profile:', pErr.message);
    }

    return {};
  };

  const signOut = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setRoles([]);
    setDemoRole('guest');
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    if (!isConfigured || !supabase) {
      if (profile) {
        setProfile({ ...profile, ...updates, updated_at: new Date().toISOString() });
      }
      return {};
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error: error.message };
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
    return {};
  };

  const isStaff = roles.includes('staff') || roles.includes('super_admin');
  const isSuperAdmin = roles.includes('super_admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isStaff,
        isSuperAdmin,
        isLoading,
        isConfigured,
        demoRole,
        setDemoRole,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
