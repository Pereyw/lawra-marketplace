'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSocket } from '@/hooks/useSocket';
import { Send, Loader } from 'lucide-react';

interface ChatInterfaceProps {
  recipientId: number;
  recipientName: string;
}

export function ChatInterface({ recipientId, recipientName }: ChatInterfaceProps) {
  const {
    isConnected,
    messages,
    isTyping,
    typingUser,
    sendMessage,
    emitTyping,
    stopTyping,
    getMessages,
  } = useSocket();

  const { register, handleSubmit, reset, watch } = useForm();
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const messageValue = watch('message');

  // Load message history
  useEffect(() => {
    if (isConnected) {
      getMessages(recipientId);
    }
  }, [isConnected, recipientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (messageValue && messageValue.length > 0) {
      emitTyping(recipientId, 'You');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(recipientId);
      }, 2000);
    }
  }, [messageValue]);

  const onSubmit = (data: any) => {
    if (!data.message.trim()) return;

    try {
      sendMessage(recipientId, data.message);
      stopTyping(recipientId);
      reset();
    } catch (err: any) {
      setError('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">{recipientName}</h2>
          <p className="text-sm opacity-75">
            {isConnected ? '🟢 Online' : '🔴 Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === 1 ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <p className="text-sm">{typingUser} is typing</p>
              <div className="flex gap-1 mt-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input
            type="text"
            {...register('message')}
            placeholder="Type your message..."
            maxLength={500}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!isConnected || !messageValue?.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {!isConnected ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
