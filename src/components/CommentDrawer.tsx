/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Send, Trash2, Flag, MessageSquare } from 'lucide-react';
import { Comment, Video } from '../types';
import { useVideos } from '../features/videos/VideoContext';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '../app/Router';
import { ReportModal } from './ReportModal';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({ isOpen, onClose, video }) => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { getVideoComments, addComment, deleteComment } = useVideos();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && video) {
      loadComments();
    }
  }, [isOpen, video?.id]);

  const loadComments = async () => {
    setLoading(true);
    const data = await getVideoComments(video.id);
    setComments(data);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const res = await addComment(video.id, newComment.trim());
    setIsSubmitting(false);

    if (res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setNewComment('');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (confirm('Delete this comment?')) {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-h-[80vh] flex flex-col text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-sm">
                Comments <span className="text-zinc-500 font-normal">({comments.length})</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close comments"
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-zinc-500 text-xs">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-xs font-medium">No comments yet</p>
                <p className="text-zinc-600 text-[11px]">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isOwner = user?.id === comment.user_id;
                return (
                  <div key={comment.id} className="flex items-start gap-3 text-xs group">
                    <img
                      src={comment.user?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={comment.user?.username || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-800 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">
                          @{comment.user?.username || 'user'}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {isOwner ? (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              aria-label="Delete comment"
                              className="text-zinc-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setReportCommentId(comment.id)}
                              aria-label="Report comment"
                              className="text-zinc-500 hover:text-amber-400 p-1"
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-300 mt-1 leading-relaxed break-words">{comment.body}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Composer */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-950/80 rounded-b-3xl sm:rounded-b-2xl">
            {user ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={500}
                  className="flex-1 bg-zinc-800/80 border border-zinc-700/60 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  aria-label="Post comment"
                  className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 text-xs">
                <span className="text-zinc-400">Log in to leave a comment</span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Sign In
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {reportCommentId && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportCommentId(null)}
          targetType="comment"
          targetId={reportCommentId}
          targetTitle="User Comment"
        />
      )}
    </>
  );
};
