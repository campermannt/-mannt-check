'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ChecklistItem, ChecklistCategory } from '@/types';
import { CHECKLIST_CATEGORIES } from '@/types';
import { saveChecklistSync, fetchAndCacheChecklist, saveChecklist } from '@/lib/storage';

const DEFAULT_ITEMS: Record<ChecklistCategory, string[]> = {
  'Bezpieczeństwo i dokumenty': ['Dowód rejestracyjny', 'Prawo jazdy', 'Polisa ubezpieczeniowa', 'Apteczka', 'Trójkąt ostrzegawczy', 'Kamizelki odblaskowe'],
  'Instalacja wodna i gazowa': ['Sprawdzenie szczelności instalacji gazowej', 'Stan butli gazowej', 'Poziom wody w zbiornikach', 'Sprawność pompy wodnej'],
  'Zabezpieczenie wnętrza i bagażu': ['Zamknięcie szafek', 'Zabezpieczenie lodówki', 'Sprawdzenie bagażników', 'Uporządkowanie wnętrza'],
  'Stan techniczny i opony': ['Ciśnienie w oponach', 'Stan bieżnika', 'Poziom oleju', 'Płyn hamulcowy', 'Światła i kierunkowskazy'],
  'Zapasy i kuchnia': ['Zapas wody pitnej', 'Produkty spożywcze', 'Naczynia i sztućce', 'Środki czystości'],
  'Elektronika i akumulatory': ['Naładowanie akumulatora', 'Sprawność instalacji 12V/230V', 'Panele fotowoltaiczne', 'Ładowarki i kable']
};

const CAT_META: Record<ChecklistCategory, { icon: React.ReactElement; color: string; bg: string; darkBg: string }> = {
  'Bezpieczeństwo i dokumenty': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    color: '#1d4ed8', bg: '#dbeafe', darkBg: 'rgba(59,130,246,.15)',
  },
  'Instalacja wodna i gazowa': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 00-6.88 17.25M12 2v4M12 22a10 10 0 006.88-17.25M12 22v-4"/></svg>,
    color: '#0e7490', bg: '#cffafe', darkBg: 'rgba(6,182,212,.15)',
  },
  'Zabezpieczenie wnętrza i bagażu': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    color: '#7c3aed', bg: '#ede9fe', darkBg: 'rgba(124,58,237,.15)',
  },
  'Stan techniczny i opony': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
    color: '#374151', bg: '#f3f4f6', darkBg: 'rgba(107,114,128,.18)',
  },
  'Zapasy i kuchnia': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    color: '#d97706', bg: '#fef3c7', darkBg: 'rgba(217,119,6,.15)',
  },
  'Elektronika i akumulatory': {
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    color: '#1F5F2E', bg: '#d6edd9', darkBg: 'rgba(31,95,46,.20)',
  },
};

interface ChecklistProps {
  onAction?: () => void;
  vehicleId?: string;
}

export function Checklist({ onAction, vehicleId }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(
    new Set([CHECKLIST_CATEGORIES[0]])
  );
  // Add item state per category
  const [addingIn, setAddingIn] = useState<ChecklistCategory | null>(null);
  const [addText, setAddText] = useState('');
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAndCacheChecklist(vehicleId).then(fetched => {
      if (fetched.length > 0) {
        setItems(fetched);
      } else {
        const defaults = CHECKLIST_CATEGORIES.flatMap(category =>
          DEFAULT_ITEMS[category].map(label => ({ id: crypto.randomUUID(), category, label, checked: false }))
        );
        setItems(defaults);
        saveChecklist(defaults, vehicleId);
      }
    });
  }, [vehicleId]);

  useEffect(() => {
    if (addingIn && addInputRef.current) addInputRef.current.focus();
  }, [addingIn]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const persist = (updated: ChecklistItem[]) => {
    setItems(updated);
    // Save locally immediately, then sync to server (fire-and-forget)
    saveChecklistSync(updated, vehicleId);
    saveChecklist(updated, vehicleId);
    onAction?.();
  };

  const toggleCategory = (category: ChecklistCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  };

  const toggleItem = (id: string) => {
    persist(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const startEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditText(item.label);
    setAddingIn(null);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editText.trim();
    if (!trimmed) { cancelEdit(); return; }
    persist(items.map(item => item.id === editingId ? { ...item, label: trimmed } : item));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => { setEditingId(null); setEditText(''); };

  const deleteItem = (id: string) => {
    persist(items.filter(item => item.id !== id));
  };

  const startAdd = (category: ChecklistCategory) => {
    setAddingIn(category);
    setAddText('');
    setEditingId(null);
  };

  const commitAdd = (category: ChecklistCategory) => {
    const trimmed = addText.trim();
    if (!trimmed) { setAddingIn(null); return; }
    const newItem: ChecklistItem = { id: crypto.randomUUID(), category, label: trimmed, checked: false };
    persist([...items, newItem]);
    setAddText('');
    setAddingIn(null);
  };

  const resetChecklist = () => {
    persist(items.map(item => ({ ...item, checked: false })));
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const cat = items.filter(i => i.category === category);
    return { total: cat.length, checked: cat.filter(i => i.checked).length };
  };

  const overall = items.length > 0
    ? Math.round((items.filter(i => i.checked).length / items.length) * 100)
    : 0;
  const checkedCount = items.filter(i => i.checked).length;

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Overall progress */}
      <div className="card anim-fade-up" style={{ padding: '24px 24px 20px' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '.10em', textTransform: 'uppercase', marginBottom: 4 }}>
              Gotowość do wyjazdu
            </p>
            <h3 style={{ fontWeight: 900, fontSize: '1.1875rem', color: 'var(--text-primary)', letterSpacing: '-.04em', lineHeight: 1.2 }}>
              Checklista przed wyjazdem
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            {/* Reset button */}
            {checkedCount > 0 && (
              <button
                onClick={resetChecklist}
                title="Resetuj checklistę"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-all"
                style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
                Reset
              </button>
            )}
            {/* Score */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: overall === 100
                  ? 'linear-gradient(135deg, #1F5F2E, #35964a)'
                  : overall > 0
                  ? 'linear-gradient(135deg, #d96f22, #FF8C42)'
                  : 'var(--sand-bg)',
                boxShadow: overall === 100 ? '0 4px 14px rgb(31 95 46 / .28)' : overall > 0 ? '0 4px 14px rgb(255 140 66 / .22)' : 'none',
                transition: 'all .3s ease',
              }}
            >
              {overall === 100 ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <span style={{ fontWeight: 900, fontSize: '1rem', color: overall > 0 ? '#fff' : 'var(--text-primary)', letterSpacing: '-.03em', lineHeight: 1 }}>
                  {overall}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="progress-track" style={{ height: '8px' }}>
          <div
            className={`progress-fill ${overall < 100 ? 'progress-fill-amber' : ''}`}
            style={{ width: `${overall}%`, height: '8px' }}
          />
        </div>

        <p style={{ fontSize: '.8125rem', marginTop: 10, color: 'var(--text-muted)' }}>
          {checkedCount} z {items.length} punktów
          {overall === 100 && (
            <span style={{ marginLeft: 8, color: '#1F5F2E', fontWeight: 700 }}>— Gotowy do drogi!</span>
          )}
        </p>
      </div>

      {/* Categories */}
      {CHECKLIST_CATEGORIES.map((category, catIdx) => {
        const { total, checked } = getCategoryProgress(category);
        const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
        const isExpanded = expandedCategories.has(category);
        const isDone = checked === total && total > 0;
        const categoryItems = items.filter(i => i.category === category);
        const meta = CAT_META[category];

        return (
          <div
            key={category}
            className={`card anim-fade-up-${Math.min(catIdx + 1, 4) as 1 | 2 | 3 | 4}`}
            style={{ overflow: 'hidden' }}
          >
            {/* Category header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center gap-4 text-left transition-colors"
              style={{
                padding: '16px 20px',
                background: isExpanded ? 'var(--sand-bg)' : 'transparent',
                border: 'none', cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: isDone ? 'linear-gradient(135deg, #1F5F2E, #35964a)' : meta.bg,
                  color: isDone ? '#fff' : meta.color,
                  boxShadow: isDone ? '0 2px 10px rgb(31 95 46 / .25)' : 'none',
                  transition: 'all .2s ease',
                }}
              >
                {isDone
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  : meta.icon
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: '.875rem', fontWeight: 700, color: isDone ? '#1F5F2E' : 'var(--text-primary)', letterSpacing: '-.01em' }}>
                    {category}
                  </span>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: isDone ? '#1F5F2E' : 'var(--text-muted)', marginLeft: 8, flexShrink: 0 }}>
                    {checked}/{total}
                  </span>
                </div>
                <div className="progress-track" style={{ height: '4px' }}>
                  <div
                    className={`progress-fill ${pct === 100 ? '' : 'progress-fill-amber'}`}
                    style={{ width: `${pct}%`, height: '4px' }}
                  />
                </div>
              </div>

              <svg
                style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : '', transition: 'transform .2s ease' }}
                width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Items list */}
            {isExpanded && (
              <div style={{ borderTop: '1px solid var(--divider)', padding: '8px 16px 4px' }}>
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-3 rounded-xl transition-all"
                    style={{
                      padding: '8px 8px',
                      background: item.checked ? 'var(--sand-bg)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!item.checked) (e.currentTarget as HTMLElement).style.background = 'var(--sand-bg)'; }}
                    onMouseLeave={e => { if (!item.checked && editingId !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => { if (editingId !== item.id) toggleItem(item.id); }}
                      className="check-box flex-shrink-0"
                    />

                    {editingId === item.id ? (
                      /* Edit mode */
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                          className="field flex-1"
                          style={{ padding: '6px 10px', fontSize: '.875rem', borderRadius: 10, height: 'auto' }}
                        />
                        <button
                          onClick={commitEdit}
                          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: '#1F5F2E', border: 'none', cursor: 'pointer' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: 'var(--sand-dark)', border: 'none', cursor: 'pointer' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ) : (
                      /* View mode */
                      <>
                        <span
                          className="flex-1 text-sm leading-snug"
                          style={{
                            textDecoration: item.checked ? 'line-through' : 'none',
                            color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)',
                            transition: 'all .15s',
                          }}
                        >
                          {item.label}
                        </span>
                        {/* Action buttons — visible on hover */}
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--sand-dark)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                            title="Edytuj"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                            title="Usuń"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                        {item.checked && (
                          <svg className="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#35964a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Add item row */}
                <div style={{ padding: '8px 8px 12px' }}>
                  {addingIn === category ? (
                    <div className="flex items-center gap-2">
                      <input
                        ref={addInputRef}
                        value={addText}
                        onChange={e => setAddText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitAdd(category); if (e.key === 'Escape') setAddingIn(null); }}
                        placeholder="Nowy punkt…"
                        className="field flex-1"
                        style={{ padding: '8px 12px', fontSize: '.875rem', borderRadius: 12, height: 'auto' }}
                      />
                      <button
                        onClick={() => commitAdd(category)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #2a7a3a, #1F5F2E)', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgb(31 95 46 / .25)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </button>
                      <button
                        onClick={() => setAddingIn(null)}
                        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--sand-bg)', border: 'none', cursor: 'pointer' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { startAdd(category); if (!isExpanded) toggleCategory(category); }}
                      className="flex items-center gap-2 text-xs transition-all rounded-xl"
                      style={{
                        padding: '7px 10px', border: '1.5px dashed var(--field-border)',
                        background: 'transparent', cursor: 'pointer',
                        color: 'var(--text-muted)', fontWeight: 600,
                        width: '100%', letterSpacing: '-.01em',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1F5F2E'; (e.currentTarget as HTMLElement).style.color = '#1F5F2E'; (e.currentTarget as HTMLElement).style.background = '#eef7f0'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--field-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Dodaj punkt
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
