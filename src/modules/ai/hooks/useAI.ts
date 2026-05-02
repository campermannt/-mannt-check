"use client"

/**
 * AI hook wrapping Nxcode SDK
 *
 * Usage:
 *   const { chat, generate, chatStream } = useAI()
 */

import { useState, useCallback } from 'react'

// Nxcode SDK types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatOptions {
  messages: ChatMessage[]
  model?: 'fast' | 'pro'
}

interface ChatResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

interface GenerateOptions {
  prompt: string
  model?: 'fast' | 'pro'
}

interface GenerateResponse {
  text: string
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

interface StreamChunk {
  content: string
  done: boolean
}

interface NxcodeSDK {
  ai: {
    chat(options: ChatOptions): Promise<ChatResponse>
    generate(options: GenerateOptions): Promise<GenerateResponse>
    chatStream(options: ChatOptions & { onChunk: (chunk: StreamChunk) => void }): Promise<void>
    generateStream(options: GenerateOptions & { onChunk: (chunk: StreamChunk) => void }): Promise<void>
  }
  ready(): Promise<void>
}

// Safely handle the global Nxcode variable
const getGlobalNxcode = (): NxcodeSDK | undefined => {
  if (typeof window !== 'undefined') {
    return (window as any).Nxcode;
  }
  return undefined;
};

export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Browser only'));
      
      // If already loaded
      if ((window as any).Nxcode) return resolve();

      // Check if script is already in document
      const existingScript = document.querySelector(`script[src="${SDK_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load AI SDK script')));
        return;
      }

      // Create and inject script
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load AI SDK script'));
      document.head.appendChild(script);
    });
  }, []);

  const getNxcode = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('AI features are only available in the browser')
    }

    try {
      await loadScript();
    } catch (e) {
      console.error("SDK Load Error:", e);
    }

    // Wait for Nxcode to be available on window with polling
    let attempts = 0;
    const maxAttempts = 60; // 6 seconds
    
    while (typeof (window as any).Nxcode === 'undefined' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    const sdk = (window as any).Nxcode as NxcodeSDK;
    if (!sdk) {
      throw new Error('Nxcode SDK not found after loading attempt. Please check your connection.');
    }

    await sdk.ready();
    return sdk;
  }, [loadScript]);

  const chat = useCallback(async (options: ChatOptions): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getNxcode()
      return await sdk.ai.chat(options)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      console.error("AI Chat Error:", err);
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getNxcode])

  const generate = useCallback(async (options: GenerateOptions): Promise<GenerateResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getNxcode()
      return await sdk.ai.generate(options)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getNxcode])

  const chatStream = useCallback(async (
    options: ChatOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getNxcode()
      await sdk.ai.chatStream({ ...options, onChunk })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getNxcode])

  const generateStream = useCallback(async (
    options: GenerateOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getNxcode()
      await sdk.ai.generateStream({ ...options, onChunk })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getNxcode])

  return {
    chat,
    generate,
    chatStream,
    generateStream,
    isLoading,
    error
  }
}

export type { ChatMessage, ChatOptions, ChatResponse, GenerateOptions, GenerateResponse, StreamChunk }
