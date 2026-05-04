'use client';

import { useState, useEffect } from 'react';

export function MajsterMannt() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Inject official SDK script
    const script = document.createElement('script');
    script.src = "https://api.nxcode.ai/sdk/nxcode.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="nxcode.js"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    // Initialize widget when opening
    setTimeout(() => {
      if (window.Nxcode) {
        try {
          window.Nxcode.init({
            apiKey: 'nx_592384102',
            container: 'majster-mannt-container',
            theme: 'light',
            welcomeMessage: 'Cześć! Jestem Majster Mannt. W czym mogę pomóc w Twoim kamperze?'
          });
        } catch (e) {
          console.error('Majster Init Error:', e);
        }
      }
    }, 300);
  };

  return (
    <>
      {/* Custom Button - Guaranteed to show */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-700 text-white shadow-xl hover:scale-105 transition-transform"
        >
          <div className="text-left">
            <div className="text-xs opacity-70 uppercase font-bold">AI Doradca</div>
            <div className="font-bold">Majster Mannt</div>
          </div>
        </button>
      )}

      {/* Container - Guaranteed to show */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100" style={{ width: 'min(400px, 90vw)', height: 'min(600px, 80vh)' }}>
          <div className="bg-green-800 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold">Majster Mannt</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 opacity-50 hover:opacity-100 text-xl">✕</button>
          </div>
          <div id="majster-mannt-container" className="flex-1 bg-gray-50 min-h-[400px]">
            {/* SDK will inject chat here */}
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    Nxcode?: any;
  }
}
