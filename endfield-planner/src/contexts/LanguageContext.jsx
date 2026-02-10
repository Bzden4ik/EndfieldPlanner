import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Получаем язык из localStorage или используем 'ru' по умолчанию
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('endfield-language');
    return saved || 'ru';
  });

  // Сохраняем язык при изменении
  useEffect(() => {
    localStorage.setItem('endfield-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ru' ? 'en' : 'ru');
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isRussian: language === 'ru',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
