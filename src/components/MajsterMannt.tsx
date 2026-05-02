'use client';

import { useState, useRef, useEffect } from 'react';

// Inline types to be independent
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const MAJSTER_PROMPT = `Jesteś Majster Mannt - doświadczony mechanik i doradca techniczny specjalizujący się w kamperach i przyczepach kempingowych. Odpowiadaj po polsku.`;

const QUICK_QUESTIONS = [
  'Jak sprawdzić poziom oleju?',
  'Co to jest DMC?',
  'Jak zadbać o uszczelki?',
  'Jak ładować akumulator?',
];

const SDK_URL = "https://sdk.nxcode.ai/nxcode.js";

export function MajsterMannt({ onAction }: { onAction?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const getSDK = async () => {
    if (typeof window === 'undefined') return null;
    
    // Check if already loaded
    if ((window as any).Nxcode) {
      await (window as any).Nxcode.ready();
      return (window as any).Nxcode;
    }

    // Inject if not present
    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }

    // Poll
    for (let i = 0; i < 100; i++) {
      if ((window as any).Nxcode) {
        await (window as any).Nxcode.ready();
        return (window as any).Nxcode;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('AI SDK failed to load');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreamingContent('');
    setIsLoading(true);
    setError(null);

    try {
      const sdk = await getSDK();
      let fullContent = '';
      await sdk.ai.chatStream({
        messages: [{ role: 'system', content: MAJSTER_PROMPT }, ...newMessages],
        model: 'fast',
        onChunk: (chunk: any) => {
          fullContent += chunk.content;
          setStreamingContent(fullContent);
          if (chunk.done) {
            setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
            setStreamingContent('');
          }
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd AI');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-700 text-white shadow-xl"
      >
        <div className="text-left">
          <div className="text-xs opacity-70 uppercase font-bold">AI Doradca</div>
          <div className="font-bold">Majster Mannt</div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100" style={{ width: 'min(420px, 90vw)', height: 'min(600px, 80vh)' }}>
      <div className="bg-green-800 p-4 text-white flex justify-between items-center">
        <div>
          <h3 className="font-bold">Majster Mannt <span className="text-[10px] opacity-50">v2.1</span></h3>
          <p className="text-xs opacity-70">Zawsze pomocny</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white opacity-50 hover:opacity-100">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-600">W czym mogę pomóc?</p>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} className="block w-full text-left p-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-green-500 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-white border border-gray-200 text-gray-800">
              {streamingContent}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-xl text-xs border border-red-200">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Zadaj pytanie..."
          className="flex-1 p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 text-white p-2 rounded-xl disabled:opacity-50">
          ➔
        </button>
      </form>
    </div>
  );
}
