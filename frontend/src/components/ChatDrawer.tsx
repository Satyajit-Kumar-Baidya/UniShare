import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName?: string;
}

export default function ChatDrawer({ isOpen, onClose, recipientId, recipientName }: ChatDrawerProps) {
  const { messages, sendMessage } = useSocket();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for the current conversation
  const conversationMessages = messages.filter(
    (m) => 
      (m.senderId === user?.id && m.receiverId === recipientId) ||
      (m.senderId === recipientId && m.receiverId === user?.id)
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, conversationMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && recipientId) {
      sendMessage(recipientId, inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{recipientName || 'Chat'}</h3>
                  <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 scroll-smooth">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 p-4 text-center">
                  <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-2">
                    <MessageSquare className="w-6 h-6 text-indigo-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No messages yet</p>
                  <p className="text-xs text-slate-500">Send a message to start chatting.</p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-slate-100 text-slate-900 rounded-tl-sm'
                        }`}>
                          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-[10px] mt-1.5 font-medium px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 pb-safe">
              <form onSubmit={handleSend} className="flex items-end gap-3 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 resize-none overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-300 transition-all min-h-[50px] max-h-[120px]"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-[50px] h-[50px] rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
