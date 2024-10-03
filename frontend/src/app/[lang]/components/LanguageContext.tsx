"use client"
import React, { createContext, useContext } from 'react';

type Language = 'en' | 'fr' | 'es';

const LanguageContext = createContext<Language>('en');

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ lang: Language; children: React.ReactNode }> = ({ lang, children }) => (
  <LanguageContext.Provider value={lang}>
    {children}
  </LanguageContext.Provider>
);