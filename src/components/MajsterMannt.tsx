'use client';

import { useEffect } from 'react';

export function MajsterMannt() {
  useEffect(() => {
    // Official SDK implementation
    const script = document.createElement('script');
    script.src = "https://api.nxcode.ai/sdk/nxcode.js";
    script.async = true;
    script.onload = () => {
      if (window.Nxcode) {
        window.Nxcode.init({
          apiKey: 'nx_592384102',
          theme: 'light',
          welcomeMessage: 'Cześć! Jestem Majster Mannt. W czym mogę pomóc?'
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Clean up on unmount
      const existingScript = document.querySelector('script[src*="nxcode.js"]');
      if (existingScript) document.head.removeChild(existingScript);
      const widget = document.getElementById('nxcode-chat-widget');
      if (widget) widget.remove();
    };
  }, []);

  return null; // The SDK creates its own button and window
}

declare global {
  interface Window {
    Nxcode?: any;
  }
}
