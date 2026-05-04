'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const QUICK_QUESTIONS = [
  'Jak sprawdzić poziom oleju?',
  'Co to jest DMC?',
  'Jak zadbać o uszczelki?',
  'Jak ładować akumulator?',
];

export function MajsterMannt() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Direct fetch to AI service to bypass SDK loading issues
      const response = await fetch('https://api.nxcode.ai/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Jesteś Majster Mannt - ekspert od kamperów. Odpowiadaj krótko i po polsku.' },
            ...messages,
            userMessage
          ],
          model: 'fast'
        })
      });

      if (!response.ok) throw new Error('Problem z połączeniem z Majstrem.');
      
      const data = await response.json();
      const content = data.content || data.message || (data.choices && data.choices[0]?.message?.content) || 'Przepraszam, chwilowy brak zasięgu u Majstra.';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      setError('Majster jest teraz zajęty w warsztacie. Spróbuj za chwilę.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600 text-white shadow-xl hover:scale-105 transition-transform"
      >
        <div className="text-left">
          <div className="text-xs opacity-70 uppercase font-bold">AI Doradca</div>
          <div className="font-bold">Majster Mannt</div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100" style={{ width: 'min(400px, 90vw)', height: 'min(500px, 70vh)' }}>
      <div className="bg-green-800 p-4 text-white flex justify-between items-center">
        <h3 className="font-bold">Majster Mannt v2.2.2</h3>
        <button onClick={() => setIsOpen(false)} className="p-1 opacity-50 hover:opacity-100">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center mb-4">W czym mogę pomóc w Twoim kamperze?</p>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} className="block w-full text-left p-3 bg-white border border-gray-200 rounded-xl text-sm hover:border-green-500 shadow-sm">
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

        {isLoading && <div className="text-xs text-gray-400 animate-pulse">Majster myśli...</div>}
        {error && <div className="p-2 bg-red-50 text-red-600 rounded-lg text-xs text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Zadaj pytanie..."
          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-green-600 text-white px-3 rounded-lg disabled:opacity-50">
          ➔
        </button>
      </form>
    </div>
  );
}
