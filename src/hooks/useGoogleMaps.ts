'use client';

import { useState, useEffect } from 'react';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error' | 'no-key';

let globalState: LoadState = 'idle';
const listeners = new Set<(s: LoadState) => void>();

function notify(s: LoadState) {
  globalState = s;
  listeners.forEach(fn => fn(s));
}

export function useGoogleMaps() {
  const [state, setState] = useState<LoadState>(globalState);

  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);

  useEffect(() => {
    if (globalState !== 'idle') return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCiqm-TqqMhr2f3BDcUtCEmMBAUvrpGkYE';
    if (!apiKey) {
      notify('no-key');
      return;
    }

    // Already injected and loaded
    if (document.getElementById('gmaps-script')) {
      if ((window as any).google?.maps) notify('loaded');
      return;
    }

    notify('loading');

    (window as any).__gmapsCallback = () => notify('loaded');

    const script = document.createElement('script');
    script.id = 'gmaps-script';
    // Use Maps JavaScript API with Places library (new)
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__gmapsCallback&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => notify('error');
    document.head.appendChild(script);
  }, []);

  return {
    isLoaded: state === 'loaded',
    isLoading: state === 'loading',
    hasError: state === 'error',
    noKey: state === 'no-key',
  };
}
