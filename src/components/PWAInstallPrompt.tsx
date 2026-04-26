'use client';

interface PWAInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ onInstall, onDismiss }: PWAInstallPromptProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm"
        style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 24px 60px rgb(0 0 0 / .2)', overflow: 'hidden' }}
      >
        {/* Green header */}
        <div className="px-6 pt-6 pb-5 text-center"
          style={{ background: 'linear-gradient(135deg, #1e5428, #228B22)' }}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl mx-auto mb-3">📱</div>
          <h3 className="text-white text-lg leading-snug" style={{ fontWeight: 700 }}>
            Zainstaluj Mannt Check
          </h3>
          <p className="text-white/75 text-sm mt-1">Dodaj do ekranu głównego dla szybkiego dostępu</p>
        </div>

        {/* Features */}
        <div className="px-6 pt-5 pb-4 space-y-3">
          {[
            { icon: '⚡', text: 'Błyskawiczny dostęp bez przeglądarki' },
            { icon: '📶', text: 'Działa offline – nawet bez internetu' },
            { icon: '💾', text: 'Lekka – nie zajmuje miejsca' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#e6f4e6] flex items-center justify-center text-base flex-shrink-0">{icon}</div>
              <p className="text-sm text-[#3f3f46]">{text}</p>
            </div>
          ))}
        </div>

        <hr className="divider mx-6" />

        <div className="px-6 py-4 flex gap-3">
          <button onClick={onDismiss} className="btn btn-ghost flex-1">Może później</button>
          <button onClick={onInstall} className="btn btn-green flex-1">Zainstaluj</button>
        </div>
      </div>
    </div>
  );
}
