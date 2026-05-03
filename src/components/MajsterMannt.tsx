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

  // Pre-load SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const getSDK = async () => {
    if (typeof window === 'undefined') return null;
    
    // Polling with safety
    for (let i = 0; i < 50; i++) {
      const nx = (window as any).Nxcode;
      if (nx && typeof nx.ready === 'function') {
        try {
          await nx.ready();
          return nx;
        } catch (e) {
          console.error("Nxcode ready error:", e);
        }
      }
      await new Promise(r => setTimeout(r, 200));
    }
    throw new Error('Asystent AI nie załadował się poprawnie. Odśwież stronę (F5).');
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
      if (!sdk || !sdk.ai || !sdk.ai.chatStream) {
        throw new Error('Błąd inicjalizacji asystenta AI.');
      }

      let fullContent = '';
      await sdk.ai.chatStream({
        messages: [{ role: 'system', content: MAJSTER_PROMPT }, ...newMessages],
        model: 'fast',
        onChunk: (chunk: any) => {
          if (chunk && chunk.content) {
            fullContent += chunk.content;
            setStreamingContent(fullContent);
          }
          if (chunk && chunk.done) {
            setMessages(prev => [...prev, { role: 'assistant', content: fullContent }]);
            setStreamingContent('');
          }
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd połączenia z AI');
      console.error("Majster Mannt Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-700 text-white shadow-xl hover:scale-105 transition-transform"
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
          <h3 className="font-bold">Majster Mannt <span className="text-[10px] opacity-50">v2.2.1</span></h3>
          <p className="text-xs opacity-70">Twój doradca techniczny</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white opacity-50 hover:opacity-100 p-2">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 text-center mb-4">Cześć! Jestem Majster Mannt. Pytaj o technikę, konserwację, usterki.</p>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} className="block w-full text-left p-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-green-500 transition-colors shadow-sm">
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-white border border-gray-200 text-gray-800 shadow-sm">
              {streamingContent}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 text-center font-medium">
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
          placeholder="Zadaj pytanie Majstrowi..."
          className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 text-white p-2.5 rounded-xl disabled:opacity-50 transition-opacity">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </form>
    </div>
  );
}
