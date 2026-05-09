"use client"

import { useState, useCallback } from 'react'
import { Nxcode } from '@nxcode/sdk'

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

export function useAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const chatStream = useCallback(async (
    options: ChatOptions,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await Nxcode.ai.chatStream({ ...options, onChunk })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      console.error("AI Error:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const chat = useCallback(async (options: ChatOptions): Promise<ChatResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      return await Nxcode.ai.chat(options)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generate = useCallback(async (options: GenerateOptions): Promise<GenerateResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      return await Nxcode.ai.generate(options)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI failed'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    chat,
    generate,
    chatStream,
    isLoading,
    error
  }
}
