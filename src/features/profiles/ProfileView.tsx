/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Edit3,
  Plus,
  Check,
  MessageSquare,
  Play,
  Heart,
  Grid,
  Lock,
  Flag,
} from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { useAuth } from '../auth/AuthContext';
import { useVideos } from '../videos/VideoContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import { Profile, Video } from '../../types';
import { ReportModal } from '../../components/ReportModal';

export const ProfileView: React.FC = () => {
  const { params, navigate } = useRouter();
  const { user, profile: currentProfile, updateProfile } = useAuth();
  const { videos, toggleFollow } = useVideos();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determine profile to display based on url params
  useEffect(() => {
    const username = params.username;
    if (username === 'me') {
      if (currentProfile) {
        setProfile(currentProfile);
      }
      return;
    }

    if (username) {
      // Find by username in demo or current profile
      const found =
        Object.values(DEMO_PROFILES).find((p) => p.username === username) ||
        (currentProfile?.username === username ? currentProfile : null);

      if (found) {
        setProfile(found);
      } else {
        // Fallback generic profile
        setProfile({
          id: `profile-${username}`,
          username,
          display_name: username,
          bio: 'Creator on ShortVideo',
          avatar_path: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else if (currentProfile) {
      setProfile(currentProfile);
    }
  }, [params.username, currentProfile]);

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        Loading profile...
      </div>
    );
  }

  const isOwner = user && (user.id === profile.id || profile.username === currentProfile?.username);

  // Published videos by this profile
  const userVideos = videos.filter(
    (v) => v.owner_id === profile.id || v.owner?.username === profile.username
  );

  const totalLikes = userVideos.reduce((acc, v) => acc + (v.likes_count || 0), 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      display_name: editDisplayName.trim() || profile.display_name,
      bio: editBio.trim() || profile.bio,
    });
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            display_name: editDisplayName.trim() || prev.display_name,
            bio: editBio.trim() || prev.bio,
          }
        : null
    );
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFollow(profile.id);
    setIsFollowing((prev) => !prev);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={
              profile.avatar_path ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
            }
            alt={profile.username}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-zinc-800 shadow-xl"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-medium">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setEditDisplayName(profile.display_name || '');
                        setEditBio(profile.bio || '');
                        setIsEditing(true);
                      }}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <Link
                      href="/upload"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-900/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollowToggle}
                      className={`px-5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                        isFollowing
                          ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/inbox')}
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    <button
                      onClick={() => setIsReportOpen(true)}
                      aria-label="Report account"
                      className="p-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Counts */}
            <div className="flex items-center justify-center sm:justify-start gap-6 text-xs text-zinc-300 pt-1">
              <div>
                <span className="font-bold text-white text-sm">184</span>{' '}
                <span className="text-zinc-500">Following</span>
              </div>
              <div>
                <span className="font-bold text-white text-sm">4.2K</span>{' '}
                <span className="text-zinc-500">Followers</span>
              </div>
              <div>
                <span className="font-bold text-white text-sm">{totalLikes}</span>{' '}
                <span className="text-zinc-500">Likes</span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-1 whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Videos Grid Header */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-xs font-semibold">
        <button className="flex items-center gap-1.5 text-white border-b-2 border-rose-500 pb-3 px-2">
          <Grid className="w-4 h-4" />
          <span>Videos ({userVideos.length})</span>
        </button>
      </div>

      {/* Videos Grid */}
      {userVideos.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Play className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No published videos</h3>
          <p className="text-xs text-zinc-500">
            {isOwner ? 'You have not uploaded any videos yet.' : 'This creator has no public videos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {userVideos.map((vid) => (
            <Link
              key={vid.id}
              href={`/video/${vid.id}`}
              className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-[9/16] flex flex-col justify-end p-2.5 transition-all hover:scale-[1.02]"
            >
              <img
                src={vid.thumbnail_path || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
                alt={vid.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 space-y-0.5">
                <h4 className="text-xs font-semibold text-white line-clamp-1">{vid.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-zinc-300">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{vid.likes_count || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-base font-bold mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-900/30 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Account Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="user"
        targetId={profile.id}
        targetTitle={`@${profile.username}`}
      />
    </div>
  );
};
