import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

const TestComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="welcome">{t('welcome')}</span>
      <button onClick={() => setLanguage('es')} data-testid="btn-es">Switch to Spanish</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default english language', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
    expect(screen.getByTestId('welcome').textContent).toBe('Welcome to NoteFusion AI');
  });

  it('switches language and persists to localStorage', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    
    act(() => {
      screen.getByTestId('btn-es').click();
    });

    expect(screen.getByTestId('lang').textContent).toBe('es');
    expect(screen.getByTestId('welcome').textContent).toBe('Bienvenido a NoteFusion AI');
    expect(localStorage.getItem('app_language')).toBe('es');
  });

  it('loads language from localStorage', () => {
    localStorage.setItem('app_language', 'fr');
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    expect(screen.getByTestId('lang').textContent).toBe('fr');
    expect(screen.getByTestId('welcome').textContent).toBe('Bienvenue sur NoteFusion AI');
  });
});
