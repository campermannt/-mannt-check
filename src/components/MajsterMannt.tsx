'use client';

import { useState, useRef, useEffect } from 'react';
import { useAI, type ChatMessage } from '@/modules/ai/hooks/useManntAI';

const MAJSTER_PROMPT = `Jesteś Majster Mannt - doświadczony mechanik i doradca techniczny specjalizujący się w kamperach i przyczepach kempingowych.

Twoja rola:
- Pomagasz użytkownikom rozwiązywać problemy techniczne na trasie
- Doradzasz w kwestiach konserwacji i dbania o zabudowę kampera
- Odpowiadasz prostym, zrozumiałym językiem po polsku
- Jesteś cierpliwy, przyjazny i pomocny
- Zawsze dbasz o bezpieczeństwo użytkowników

Styl komunikacji:
- Mów zwięźle i konkretnie
- Używaj praktycznych przykładów
- Gdy coś wymaga pilnej uwagi, wyraźnie to zaznacz
- Jeśli problem przekracza możliwości pomocy zdalnej, sugeruj wizytę w serwisie Mannt w Kielcach

Pamiętaj: Jesteś częścią aplikacji Mannt Check - cyfrowego opiekuna kampera stworzonego przez serwis Mannt z pasji do kamperów.`;

const QUICK_QUESTIONS = [
  'Jak sprawdzić poziom oleju?',
  'Co to jest DMC?',
  'Jak zadbać o uszczelki?',
  'Jak ładować akumulator?',
];

interface MajsterManntProps { onAction?: () => void; }

export function MajsterMannt({ onAction }: MajsterManntProps) {
  const { chatStream, isLoading, error } = useAI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreamingContent('');
    onAction?.();

    try {
      let fullContent = '';
      await chatStream({
        messages: [{ role: 'system', content: MAJSTER_PROMPT }, ...newMessages],
        model: 'fast'
      }, (chunk) => {
        fullContent += chunk.content;
        setStreamingContent(fullContent);
        if (chunk.done) {
          setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
          setStreamingContent('');
        }
      });
    } catch (err) {
      console.error('Chat Error:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  /* ── Floating button ──────────────────────────────────────── */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Porozmawiaj z Majstrem Manntem"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: 'linear-gradient(150deg, #2a7a3a 0%, #1F5F2E 100%)',
          color: '#fff',
          boxShadow: '0 8px 32px rgb(31 95 46 / .42), 0 2px 0 #0f2d14',
          border: 'none',
          cursor: 'pointer',
          transition: 'all .2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgb(31 95 46 / .50), 0 2px 0 #0f2d14'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgb(31 95 46 / .42), 0 2px 0 #0f2d14'; }}
      >
        {/* Wrench icon */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,.18)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div className="text-left">
          <div className="text-white/65 leading-none mb-0.5" style={{ fontWeight: 500, fontSize: '.7rem', letterSpacing: '.04em', textTransform: 'uppercase' }}>AI Doradca</div>
          <div className="text-white leading-none" style={{ fontWeight: 700, fontSize: '.9375rem', letterSpacing: '-.02em' }}>Majster Mannt</div>
        </div>
      </button>
    );
  }

  /* ── Chat window ──────────────────────────────────────────── */
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden"
      style={{
        width: 'min(420px, calc(100vw - 1.5rem))',
        height: 'min(580px, calc(100dvh - 2rem))',
        borderRadius: '24px',
        boxShadow: '0 32px 80px rgb(0 0 0 / .22), 0 4px 16px rgb(0 0 0 / .12)',
        border: '1px solid rgba(0,0,0,.06)',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{ background: 'linear-gradient(150deg, #1a4522 0%, #1F5F2E 60%, #2a7a3a 100%)' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,.18)' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white leading-none" style={{ fontWeight: 800, fontSize: '.9375rem', letterSpacing: '-.02em' }}>
            Majster Mannt
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
            <p className="text-white/65 leading-none" style={{ fontSize: '.72rem', fontWeight: 500 }}>AI doradca techniczny</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
          style={{ background: 'rgba(255,255,255,.14)', border: 'none', cursor: 'pointer' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F5F0E8' }}>
        {messages.length === 0 && (
          <div className="text-center py-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #d6edd9, #a8d5b5)', boxShadow: '0 4px 14px rgb(31 95 46 / .18)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F5F2E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <p className="text-sm mb-0.5" style={{ fontWeight: 700, color: '#1a4522', letterSpacing: '-.01em' }}>
              Cześć! Jestem Majster Mannt
            </p>
            <p className="text-xs mb-4" style={{ color: '#9ea3b0' }}>
              Pytaj o technikę, konserwację, usterki.
            </p>
            {/* Quick questions */}
            <div className="flex flex-col gap-1.5">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-3.5 py-2.5 rounded-xl text-xs transition-all"
                  style={{
                    background: '#fff', border: '1px solid #ddd0b8',
                    color: '#2e3038', fontWeight: 500, cursor: 'pointer',
                    boxShadow: '0 1px 3px rgb(0 0 0 / .04)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F5F2E'; (e.currentTarget as HTMLElement).style.background = '#eef7f0'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ddd0b8'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                style={{ background: '#1F5F2E' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            )}
            <div
              className="max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(150deg, #2a7a3a, #1F5F2E)'
                  : '#fff',
                color: msg.role === 'user' ? '#fff' : '#111318',
                boxShadow: '0 1px 4px rgb(0 0 0 / .08)',
                border: msg.role === 'assistant' ? '1px solid #ede6d8' : 'none',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
              style={{ background: '#1F5F2E' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div
              className="max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ borderRadius: '16px 16px 16px 4px', background: '#fff', color: '#111318', boxShadow: '0 1px 4px rgb(0 0 0 / .08)', border: '1px solid #ede6d8' }}
            >
              {streamingContent}
              <span className="inline-block w-0.5 h-3.5 ml-0.5 animate-pulse" style={{ background: '#1F5F2E', borderRadius: '2px', verticalAlign: 'text-bottom' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-3.5 py-2.5 text-xs" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-3.5 py-3.5 flex-shrink-0"
        style={{ borderTop: '1px solid #ede6d8', background: '#fff' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Zadaj pytanie Majstrowi…"
          disabled={isLoading}
          className="field flex-1"
          style={{ padding: '.625rem .875rem', fontSize: '.875rem', borderRadius: '12px' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn btn-green"
          style={{ padding: '.625rem .875rem', flexShrink: 0, borderRadius: '12px' }}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
