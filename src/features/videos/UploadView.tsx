/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Film, AlertCircle, CheckCircle2, Lock, Eye, Globe } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useVideos } from './VideoContext';
import { useRouter } from '../../app/Router';
import { validateVideoFile, validateVideoMetadata } from '../../lib/validation/rules';
import { VideoVisibility } from '../../types';

export const UploadView: React.FC = () => {
  const { user } = useAuth();
  const { uploadVideo } = useVideos();
  const { navigate } = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<VideoVisibility>('public');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccessId, setUploadSuccessId] = useState<string | null>(null);

  const handleFileChange = (file: File) => {
    setErrorMessage(null);
    const val = validateVideoFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!val.valid) {
      setErrorMessage(val.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-fill title with file name if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please select a video file.');
      return;
    }

    const metaVal = validateVideoMetadata(title, description);
    if (!metaVal.valid) {
      setErrorMessage(metaVal.error || 'Invalid metadata');
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);
    setErrorMessage(null);

    // Simulated step intervals for responsive UI feedback
    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 200);

    const res = await uploadVideo({
      file: selectedFile,
      title,
      description,
      visibility,
    });

    clearInterval(timer);
    setUploadProgress(100);
    setIsUploading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.video) {
      setUploadSuccessId(res.video.id);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold">Authentication Required</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Sign in to upload short and long videos directly to Supabase storage.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-900/30 transition-colors"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Upload Video</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Instant publication after validation • Up to 200MB • MP4, WebM, MOV
        </p>
      </div>

      {uploadSuccessId ? (
        <div className="bg-zinc-900 border border-emerald-800/60 rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Video Published Successfully!</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Your video has been validated and published to the platform feed according to standard moderation rules.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/video/${uploadSuccessId}`)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              View Published Video
            </button>
            <button
              onClick={() => {
                setUploadSuccessId(null);
                setSelectedFile(null);
                setPreviewUrl(null);
                setTitle('');
                setDescription('');
              }}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Selector Dropzone */}
          {!previewUrl ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-rose-500/60 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900/40 transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-rose-400 group-hover:scale-105 transition-all mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-semibold text-white">Select video to upload</h3>
              <p className="text-xs text-zinc-500 mt-1">Or drag and drop video files here</p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-600">
                <span>MP4, WebM or MOV</span>
                <span>•</span>
                <span>Up to 200MB</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Preview */}
              <div className="md:col-span-5 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden aspect-[9/16] relative max-h-[420px]">
                <video src={previewUrl} controls className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors"
                >
                  Change Video
                </button>
              </div>

              {/* Form Metadata Fields */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a catchy title..."
                    maxLength={150}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block text-right">
                    {title.length}/150
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Description & Hashtags
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Tell viewers what your video is about, tags, credits..."
                    maxLength={2000}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Visibility</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'public', label: 'Public', icon: Globe },
                      { key: 'unlisted', label: 'Unlisted', icon: Eye },
                      { key: 'private', label: 'Private', icon: Lock },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setVisibility(item.key as VideoVisibility)}
                          className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-colors ${
                            visibility === item.key
                              ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Uploading to Supabase Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUploading || !title.trim()}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-900/40 transition-colors"
                  >
                    {isUploading ? 'Validating and Uploading...' : 'Publish Video Immediately'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
