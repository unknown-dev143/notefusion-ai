import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
];

const LanguageSelector: React.FC = () => {
  const [current, setCurrent] = useState<string>(
    localStorage.getItem('i18nextLng') || 'en'
  );
  const [open, setOpen] = useState(false);

  const changeLanguage = (code: string) => {
    setCurrent(code);
    localStorage.setItem('i18nextLng', code);
    setOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'inherit',
          fontSize: '14px',
          padding: '4px 8px',
          borderRadius: '6px',
        }}
        aria-label="Select language"
      >
        🌐 {currentLang.nativeName}
      </button>
      {open && (
        <ul
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            margin: 0,
            padding: '4px 0',
            listStyle: 'none',
            background: '#1e1e2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            zIndex: 9999,
            minWidth: '140px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {LANGUAGES.map((lang) => (
            <li
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                color: current === lang.code ? '#a78bfa' : '#e2e8f0',
                fontWeight: current === lang.code ? 600 : 400,
                fontSize: '14px',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(167,139,250,0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'transparent')
              }
            >
              <span>{lang.nativeName}</span>
              <span style={{ opacity: 0.5, fontSize: '12px' }}>{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
