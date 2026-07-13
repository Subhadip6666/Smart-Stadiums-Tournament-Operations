import React, { useState } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { VoiceInput } from '../components/chat/VoiceInput';
import { useChat } from '../hooks/useChat';
import type { SupportedLanguage } from '../types';
import { LANGUAGE_LABELS } from '../types';
import { Globe } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const { messages, isLoading, sendMessage } = useChat();

  const handleSend = (text: string) => {
    sendMessage(text, language);
  };

  return (
    <div className="flex-1 w-full max-w-[900px] mx-auto p-3 lg:p-5 flex flex-col overflow-hidden">
      <div className="glass-card flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/60 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Stadium Assistant</h2>
              <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <VoiceInput />
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                {(Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][]).map(([code, label]) => (
                  <option key={code} value={code} className="bg-slate-900">{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chat */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          className="flex-1"
        />
      </div>
    </div>
  );
};