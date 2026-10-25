/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Flag, ShieldAlert, CheckCheck } from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { useAuth } from '../auth/AuthContext';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES, DEMO_PROFILES } from '../../lib/mockData';
import { Message, Conversation } from '../../types';
import { ReportModal } from '../../components/ReportModal';

export const ConversationView: React.FC = () => {
  const { params, navigate } = useRouter();
  const { user } = useAuth();
  const conversationId = params.conversationId;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      const conv = DEMO_CONVERSATIONS.find((c) => c.id === conversationId);
      if (conv) {
        setConversation(conv);
      }
      const thread = DEMO_MESSAGES[conversationId] || [];
      setMessages(thread);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !user || !conversationId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: DEMO_PROFILES['current-user'],
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const otherMember = conversation?.members?.find((m) => m.id !== user?.id) || conversation?.members?.[0];

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full flex flex-col h-[calc(100vh-4rem)] bg-zinc-950 sm:border sm:border-zinc-850 sm:rounded-2xl sm:my-3 overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inbox')}
            aria-label="Back to inbox"
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Link href={`/u/${otherMember?.username || 'user'}`} className="flex items-center gap-2.5">
            <img
              src={
                otherMember?.avatar_path ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <span className="font-bold text-xs sm:text-sm text-white block">
                @{otherMember?.username || 'user'}
              </span>
              <span className="text-[10px] text-zinc-400">Direct message</span>
            </div>
          </Link>
        </div>

        <button
          onClick={() => setIsReportOpen(true)}
          aria-label="Report conversation"
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          <Flag className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center text-[11px] text-zinc-400 max-w-sm mx-auto">
          Messages in this conversation are strictly isolated to authenticated members via PostgreSQL RLS.
        </div>

        {messages.map((m) => {
          const isMe = m.sender_id === user?.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-rose-600 text-white rounded-tr-sm shadow-md shadow-rose-900/20'
                    : 'bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-750'
                }`}
              >
                {m.body}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 px-1">
                <span>
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {isMe && <CheckCheck className="w-3 h-3 text-rose-400" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message @${otherMember?.username || 'user'}...`}
          maxLength={1000}
          className="flex-1 bg-zinc-800 border border-zinc-750 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          aria-label="Send message"
          className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="message"
        targetId={conversationId || 'msg-target'}
        targetTitle={`Conversation with @${otherMember?.username || 'user'}`}
      />
    </div>
  );
};
