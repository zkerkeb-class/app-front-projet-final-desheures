import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const initI18next = async (locale) => {
  await i18next.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'fr',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      ar: {
        common: await fetch('/locales/ar/common.json').then((r) => r.json()),
      },
      en: {
        common: await fetch('/locales/en/common.json').then((r) => r.json()),
      },
      fr: {
        common: await fetch('/locales/fr/common.json').then((r) => r.json()),
      },
      pt: {
        common: await fetch('/locales/pt/common.json').then((r) => r.json()),
      },
    },
  });
  return i18next;
};
