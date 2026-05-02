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

declare global {
  interface Window {
    Nxcode?: NxcodeSDK;
  }
  const Nxcode: NxcodeSDK | undefined;
}

export {};
