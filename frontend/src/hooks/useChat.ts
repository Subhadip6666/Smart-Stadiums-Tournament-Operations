import { useState, useCallback } from 'react';
import type { ChatMessage, SupportedLanguage, ChatResponse } from '../types';
import { api, getMockChatResponse } from '../services/api';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (text: string, language: SupportedLanguage) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const sendMessage = useCallback(
    async (text: string, language: SupportedLanguage) => {
      if (!text.trim()) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: text.trim(),
        language,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        // Try real API first
        const response = await api.sendMessage(
          { session_id: sessionId, message: text, language }
        );

        const data = response.data as ChatResponse;

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: data.reply,
          language: data.language as SupportedLanguage,
          timestamp: new Date().toISOString(),
          confidence: data.confidence,
          sources: data.sources,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        // Fall back to mock response
        const mockResponse = getMockChatResponse(text, language);

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: mockResponse.reply,
          language: mockResponse.language as SupportedLanguage,
          timestamp: new Date().toISOString(),
          confidence: mockResponse.confidence,
          sources: mockResponse.sources,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sessionId, sendMessage, clearMessages };
}