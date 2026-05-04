'use client';

import Script from 'next/script';

/**
 * Majster Mannt v2.3.0 - Final Surgical Fix
 * This version uses ONLY the official Nxcode SDK as recommended by the provider.
 * All custom UI wrappers are removed to ensure the widget can initialize correctly.
 */
export default function MajsterMannt() {
  return (
    <>
      <Script
        id="nxcode-widget-script"
        src="https://api.nxcode.ai/nxcode.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore
          if (window.Nxcode) {
            // @ts-ignore
            window.Nxcode.init({
              key: "1726743425555x218764956412149760",
              title: "Majster Mannt",
              welcomeMessage: "Cześć! Jestem Majster Mannt. W czym mogę Ci dzisiaj pomóc?",
              primaryColor: "#166534",
              position: "right"
            });
          }
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    Nxcode?: any;
  }
}
