import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, dynamicTranslations } from '../lib/translations.js';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (section: keyof typeof translations, key: string) => string;
  localize: (hiText: string, enText: string) => string;
  localizeDynamic: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sharma_woodcraft_lang');
      if (saved === 'en' || saved === 'hi') {
        return saved;
      }
    }
    return 'hi'; // Default to Hindi as previously requested
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharma_woodcraft_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (section: keyof typeof translations, key: string): string => {
    const sec = translations[section] as any;
    if (sec && sec[key]) {
      return sec[key][language] || sec[key]['hi'] || '';
    }
    return '';
  };

  const localize = (hiText: string, enText: string): string => {
    return language === 'en' ? enText : hiText;
  };

  const localizeDynamic = (text: string): string => {
    if (!text) return '';
    if (language === 'hi') return text;
    // If in English mode, check dynamicTranslations dictionary
    if (dynamicTranslations[text]) {
      return dynamicTranslations[text].en;
    }
    // Check partial matches
    for (const [hiKey, item] of Object.entries(dynamicTranslations)) {
      if (text.includes(hiKey)) {
        return item.en;
      }
    }
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        localize,
        localizeDynamic
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
