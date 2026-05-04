'use client';

import Script from 'next/script';

/**
 * Majster Mannt v2.3.1 - Fix for client-side exception
 * Restoring named export to match the import in page.tsx
 */
export function MajsterMannt({ onAction }: { onAction?: (action: string) => void }) {
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
