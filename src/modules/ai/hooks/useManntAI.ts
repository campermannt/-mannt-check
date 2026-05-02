"use client"

import { useState, useCallback } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  model?: 'fast' | 'pro'
}

export interface ChatResponse {
  content: string
}

export interface GenerateOptions {
  prompt: string
  model?: 'fast' | 'pro'
}

export interface GenerateResponse {
  text: string
}

export interface StreamChunk {
  content: string
  done: boolean
}

const SDK_URL = "https://sdk.nxcode.ai/nxcode.js";

export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSDK = useCallback(async (): Promise<any> => {
    if (typeof window === 'undefined') throw new Error('Browser only');

    // 1. Check if already exists
    if ((window as any).Nxcode) {
      await (window as any).Nxcode.ready();
      return (window as any).Nxcode;
    }

    // 2. Inject script if not present
    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }

    // 3. Poll for existence (max 10 seconds)
    for (let i = 0; i < 100; i++) {
      if ((window as any).Nxcode) {
        await (window as any).Nxcode.ready();
        return (window as any).Nxcode;
      }
      await new Promise(r => setTimeout(r, 100));
    }

    throw new Error('AI SDK failed to load. Please check your internet connection.');
  }, []);

  const chatStream = useCallback(async (
    options: ChatOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getSDK()
      await sdk.ai.chatStream({ ...options, onChunk })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      console.error("AI Error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getSDK])

  const chat = useCallback(async (options: ChatOptions): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getSDK()
      return await sdk.ai.chat(options)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getSDK])

  const generate = useCallback(async (options: GenerateOptions): Promise<GenerateResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const sdk = await getSDK()
      return await sdk.ai.generate(options)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getSDK])

  return {
    chat,
    generate,
    chatStream,
    isLoading,
    error
  }
}
