'use client';

import { useState, useEffect } from 'react';

export function MajsterMannt() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Inject script directly into head
    const script = document.createElement('script');
    script.src = "https://api.nxcode.ai/sdk/nxcode.js";
    script.async = true;
    script.onload = () => {
      console.log('Majster SDK Loaded');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    // Give a small delay for DOM to be ready
    setTimeout(() => {
      if (window.Nxcode) {
        try {
          window.Nxcode.init({
            apiKey: 'nx_592384102',
            container: 'majster-mannt-container',
            theme: 'light'
          });
        } catch (e) {
          console.error('Majster Init Error:', e);
        }
      }
    }, 500);
  };

  return (
    <>
      {/* Trigger Button */}
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

      {/* Widget Container */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100" style={{ width: 'min(400px, 90vw)', height: 'min(600px, 80vh)' }}>
          <div className="bg-green-800 p-4 text-white flex justify-between items-center">
            <h3 className="font-bold">Majster Mannt v2.2.7</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 opacity-50 hover:opacity-100">✕</button>
          </div>
          <div id="majster-mannt-container" className="flex-1 min-h-[400px] bg-gray-50">
            {/* SDK will inject here */}
          </div>
        </div>
      )}
    </>
  );
}

// Add Nxcode to window type
declare global {
  interface Window {
    Nxcode?: any;
  }
}
