'use client';

import { useState, useEffect } from 'react';
import { incrementActionCount, getActionCount, setInstallShown, wasInstallShown } from '@/lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const checkShouldShowPrompt = () => {
    const actionCount = getActionCount();
    const alreadyShown = wasInstallShown();

    if (actionCount >= 2 && !alreadyShown && deferredPrompt) {
      setShowInstallPrompt(true);
    }
  };

  const trackAction = () => {
    const count = incrementActionCount();
    if (count >= 2 && !wasInstallShown() && deferredPrompt) {
      setShowInstallPrompt(true);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    setInstallShown();

    return outcome === 'accepted';
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    setInstallShown();
  };

  return {
    showInstallPrompt,
    installApp,
    dismissPrompt,
    trackAction,
    canInstall: !!deferredPrompt
  };
}
