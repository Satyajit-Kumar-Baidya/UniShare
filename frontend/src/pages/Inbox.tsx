import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Search, Send, Smile, Trash2, PencilLine, Reply } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

type ConversationPreview = {
  participantId: string;
  participantName: string;
  lastMessage: string;
  lastTimestamp: string;
};

export default function Inbox() {
  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    sendTyping,
    typingByUserId,
    onlineUsers,
    markThreadRead,
  } = useSocket();
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [reactionTargetId, setReactionTargetId] = useState<string | null>(null);
  const [reactionInput, setReactionInput] = useState('');

  const conversations = useMemo<ConversationPreview[]>(() => {
    if (!user) {
      return [];
    }

    const map = new Map<string, ConversationPreview>();

    messages.forEach((message) => {
      if (message.senderId !== user.id && message.receiverId !== user.id) {
        return;
      }

      const participantId = message.senderId === user.id ? message.receiverId : message.senderId;
      const participantName = message.senderId === user.id ? 'Marketplace Contact' : message.senderName;
      const existing = map.get(participantId);

      if (!existing || new Date(message.timestamp) > new Date(existing.lastTimestamp)) {
        map.set(participantId, {
          participantId,
          participantName,
          lastMessage: message.content,
          lastTimestamp: message.timestamp,
        });
      }
    });

    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime()
    );
    if (!conversationSearch.trim()) {
      return sorted;
    }
    const query = conversationSearch.trim().toLowerCase();
    return sorted.filter(
      (conversation) =>
        conversation.participantName.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query)
    );
  }, [messages, user, conversationSearch]);

  const selectedConversationId = activeParticipantId || conversations[0]?.participantId || null;

  const allThreadMessages = useMemo(() => {
    if (!user || !selectedConversationId) {
      return [];
    }

    return messages
      .filter(
        (message) =>
          (message.senderId === user.id && message.receiverId === selectedConversationId) ||
          (message.senderId === selectedConversationId && message.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, selectedConversationId, user]);

  const threadMessages = useMemo(() => {
    if (!messageSearch.trim()) {
      return allThreadMessages;
    }
    const query = messageSearch.trim().toLowerCase();
    return allThreadMessages.filter((message) => message.content.toLowerCase().includes(query));
  }, [allThreadMessages, messageSearch]);

  useEffect(() => {
    if (selectedConversationId) {
      markThreadRead(selectedConversationId);
    }
    return () => {
      if (selectedConversationId && typeof sendTyping === 'function') {
        sendTyping(selectedConversationId, false);
      }
    };
  }, [markThreadRead, selectedConversationId, sendTyping]);

  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allThreadMessages.length, selectedConversationId]);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedConversationId || !messageDraft.trim()) {
      return;
    }

    if (editingMessageId) {
      editMessage(editingMessageId, messageDraft.trim());
      setEditingMessageId(null);
    } else {
      if (replyToMessageId) {
        sendMessage(selectedConversationId, messageDraft.trim(), replyToMessageId);
      } else {
        sendMessage(selectedConversationId, messageDraft.trim());
      }
    }

    setMessageDraft('');
    setReplyToMessageId(null);
    if (selectedConversationId && typeof sendTyping === 'function') {
      sendTyping(selectedConversationId, false);
    }
  };

  const isTyping = selectedConversationId
    ? Boolean(typingByUserId?.[selectedConversationId])
    : false;

  const isParticipantOnline = selectedConversationId
    ? Boolean(onlineUsers?.includes(selectedConversationId))
    : false;

  const replyToMessage = replyToMessageId
    ? allThreadMessages.find((message) => message.id === replyToMessageId)
    : null;

  const extractUrl = (content: string) => {
    const match = content.match(/https?:\/\/[^\s]+/i);
    return match?.[0];
  };

  const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp)$/i.test(url);
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  const renderMessageBody = (content: string) => {
    const url = extractUrl(content);
    if (!url) {
      return <p className="leading-relaxed whitespace-pre-wrap">{content}</p>;
    }

    const isOnlyUrl = content.trim() === url.trim();
    return (
      <div className="space-y-2">
        {!isOnlyUrl && <p className="leading-relaxed whitespace-pre-wrap">{content}</p>}
        {isImageUrl(url) && (
          <img
            src={url}
            alt="Shared media"
            className="max-h-60 rounded-xl border border-slate-200"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
        {isVideoUrl(url) && (
          <video controls className="max-h-60 rounded-xl border border-slate-200">
            <source src={url} />
          </video>
        )}
        {!isImageUrl(url) && !isVideoUrl(url) && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-200 underline"
          >
            {url}
          </a>
        )}
      </div>
    );
  };

  const getReactionSummary = (message: any) => {
    const reactions = message.reactions ?? [];
    const map = new Map<string, number>();
    reactions.forEach((reaction: any) => {
      map.set(reaction.emoji, (map.get(reaction.emoji) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([emoji, count]) => ({ emoji, count }));
  };

  return (
    <section className="relative isolate overflow-hidden py-10 sm:py-14 min-h-screen bg-slate-50/30">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#fae8ff_0,transparent_40%),radial-gradient(circle_at_bottom_right,#e0f2fe_0,transparent_45%)]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Inbox</h1>
          <p className="mt-2 text-slate-600">Chat with buyers, sellers, and group members in one place.</p>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr] items-start">
          {/* Sidebar */}
          <aside className="flex flex-col h-150 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-white flex justify-between items-center z-10 sticky top-0">
              <h2 className="text-base font-semibold text-slate-900">Messages</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{conversations.length}</span>
            </div>

            <div className="px-5 py-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={conversationSearch}
                  onChange={(event) => setConversationSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                    <MessageSquare className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">No messages yet</p>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-50">
                    Connect with users from the marketplace or groups to start chatting.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50">
                  {conversations.map((conversation) => {
                    const isActive = conversation.participantId === selectedConversationId;
                    return (
                      <li key={conversation.participantId}>
                        <button
                          onClick={() => setActiveParticipantId(conversation.participantId)}
                          className={`w-full px-5 py-4 text-left transition-all flex items-start gap-4 ${
                            isActive ? 'bg-indigo-50/60 relative' : 'hover:bg-slate-50'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
                          )}
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-lg shadow-sm border border-indigo-200/50">
                            {conversation.participantName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-baseline mb-1">
                              <p className={`text-sm font-semibold truncate pr-3 ${isActive ? 'text-indigo-950' : 'text-slate-900'}`}>
                                {conversation.participantName}
                              </p>
                              <span className={`text-[11px] whitespace-nowrap ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                                {new Date(conversation.lastTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className={`truncate text-xs ${isActive ? 'text-indigo-800' : 'text-slate-500'}`}>
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat Window */}
          <div className="flex flex-col h-150 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
            {!selectedConversationId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-5">
                  <MessageSquare className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Your Messages</h3>
                <p className="mt-3 text-sm text-slate-500 max-w-sm leading-relaxed">
                  Select a conversation from the sidebar to view messages, or explore the marketplace to contact sellers directly.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-6 py-4 flex items-center gap-4 bg-white/95 backdrop-blur-sm shadow-sm z-10 sticky top-0">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base shadow-sm border border-indigo-200/50">
                    {conversations.find(c => c.participantId === selectedConversationId)?.participantName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {conversations.find(c => c.participantId === selectedConversationId)?.participantName || 'User'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_0_2px_rgba(16,185,129,0.2)] ${
                        isParticipantOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-[12px] font-medium text-slate-500">
                        {isParticipantOnline ? 'Active now' : 'Offline'}
                      </span>
                      {isTyping && (
                        <span className="ml-2 text-[12px] font-medium text-indigo-600">typing...</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={messageSearch}
                      onChange={(event) => setMessageSearch(event.target.value)}
                      placeholder="Search messages"
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6 bg-slate-50/50 scroll-smooth">
                  {threadMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                       <span className="text-xs font-medium text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm mt-auto mb-4">
                         Start of conversation
                       </span>
                    </div>
                  ) : (
                    threadMessages.map((message) => {
                      const isMine = message.senderId === user?.id;
                      const isDeleted = Boolean(message.deletedAt);
                      const showReceipt =
                        isMine &&
                        message.read &&
                        message.id === allThreadMessages[allThreadMessages.length - 1]?.id;
                      const reactionSummary = getReactionSummary(message);
                      return (
                        <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {message.replyToId && (
                              <div className={`mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 ${
                                isMine ? 'self-end' : 'self-start'
                              }`}>
                                Replying to {message.replyToSenderName || 'User'}: {message.replyToContent || 'Message'}
                              </div>
                            )}
                            <div
                              className={`rounded-2xl px-5 py-3 text-[15px] shadow-sm ${
                                isMine
                                  ? 'rounded-tr-sm bg-indigo-600 text-white'
                                  : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'
                              }`}
                            >
                              {isDeleted ? (
                                <p className="italic text-slate-200">Message deleted</p>
                              ) : (
                                renderMessageBody(message.content)
                              )}
                            </div>
                            {reactionSummary.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {reactionSummary.map((reaction) => (
                                  <button
                                    key={reaction.emoji}
                                    onClick={() => reactToMessage(message.id, reaction.emoji)}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                                  >
                                    {reaction.emoji} {reaction.count}
                                  </button>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isDeleted && (
                                <>
                                  <button
                                    onClick={() => setReplyToMessageId(message.id)}
                                    className="text-[10px] text-slate-500 hover:text-indigo-600"
                                  >
                                    <Reply className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => setReactionTargetId(message.id)}
                                    className="text-[10px] text-slate-500 hover:text-indigo-600"
                                  >
                                    <Smile className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                              {isMine && !isDeleted && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(message.id);
                                      setMessageDraft(message.content);
                                    }}
                                    className="text-[10px] text-slate-500 hover:text-indigo-600"
                                  >
                                    <PencilLine className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteMessage(message.id)}
                                    className="text-[10px] text-slate-500 hover:text-rose-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {message.editedAt && <span>Edited</span>}
                              {isMine && message.status === 'sending' && <span>Sending...</span>}
                              {showReceipt && <span>Seen</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-5 bg-white">
                  {(replyToMessage || editingMessageId) && (
                    <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between">
                      <span>
                        {editingMessageId
                          ? 'Editing message'
                          : `Replying to ${replyToMessage?.senderName || 'User'}: ${replyToMessage?.content || 'Message'}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyToMessageId(null);
                          setEditingMessageId(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  {reactionTargetId && (
                    <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
                      <input
                        value={reactionInput}
                        onChange={(event) => setReactionInput(event.target.value)}
                        placeholder="Type emoji and press Add"
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (reactionInput.trim()) {
                            reactToMessage(reactionTargetId, reactionInput.trim());
                          }
                          setReactionInput('');
                          setReactionTargetId(null);
                        }}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-xs text-white"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReactionInput('');
                          setReactionTargetId(null);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <div className="flex items-end gap-3 relative">
                    <textarea
                      value={messageDraft}
                      onChange={(event) => {
                        setMessageDraft(event.target.value);
                        if (selectedConversationId && typeof sendTyping === 'function') {
                          sendTyping(selectedConversationId, event.target.value.trim().length > 0);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as unknown as FormEvent);
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1 resize-none overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-800 outline-none transition-all min-h-13 max-h-30 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50/50"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!messageDraft.trim()}
                      className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      <Send className="h-5 w-5 ml-1" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
