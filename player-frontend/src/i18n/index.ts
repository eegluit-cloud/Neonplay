import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ko from './locales/ko.json';

const LANGUAGE_STORAGE_KEY = 'neonplay_language';

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export { LANGUAGE_STORAGE_KEY };
export default i18n;
