import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all text-sm font-medium ${className}`}
      title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      <span className={`${language === 'ru' ? 'text-amber-400' : 'text-gray-500'}`}>
        RU
      </span>
      <span className="text-gray-600">/</span>
      <span className={`${language === 'en' ? 'text-amber-400' : 'text-gray-500'}`}>
        EN
      </span>
    </button>
  );
};

export default LanguageSwitcher;
