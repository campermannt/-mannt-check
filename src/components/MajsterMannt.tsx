'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Nxcode?: any;
  }
}

export function MajsterMannt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if SDK is already there
    if (window.Nxcode) {
      setIsReady(true);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    // When opening, try to initialize if SDK is ready
    if (window.Nxcode && !document.getElementById('nxcode-chat-widget')) {
      try {
        window.Nxcode.init({
          apiKey: 'nx_592384102', // Your original key
          container: 'majster-mannt-container',
          theme: 'light',
          welcomeMessage: 'Cześć! Jestem Majster Mannt. W czym mogę pomóc w Twoim kamperze?'
        });
      } catch (e) {
        console.error('Majster Init Error:', e);
      }
    }
  };

  return (
    <>
      <Script 
        src="https://api.nxcode.ai/sdk/nxcode.js"
        onLoad={() => {
          console.log('Majster SDK Loaded');
          setIsReady(true);
        }}
      />

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
            <h3 className="font-bold">Majster Mannt v2.2.6</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 opacity-50 hover:opacity-100">✕</button>
          </div>
          <div id="majster-mannt-container" className="flex-1 min-h-[400px]">
            {!isReady && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm animate-pulse">
                Ładowanie warsztatu Majstra...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
