'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import direct des fichiers de traduction
import enTranslations from '../public/locales/en/common.json';
import frTranslations from '../public/locales/fr/common.json';
import arTranslations from '../public/locales/ar/common.json';
import ptTranslations from '../public/locales/pt/common.json';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar', 'pt'],
    defaultNS: 'translation', // Ajout du namespace par défaut
    resources: {
      en: {
        translation: enTranslations, // Assurez-vous que c'est sous 'translation'
      },
      fr: {
        translation: frTranslations, // Assurez-vous que c'est sous 'translation'
      },
      ar: {
        translation: arTranslations, // Assurez-vous que c'est sous 'translation'
      },
      pt: {
        translation: ptTranslations, // Assurez-vous que c'est sous 'translation'
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
