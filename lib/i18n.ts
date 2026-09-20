import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../src/locales/en.json";
import es from "../src/locales/es.json";

const resources = { en: { translation: en }, es: { translation: es } };

const deviceLanguage = getLocales()[0]?.languageCode;
const supportedLanguage = deviceLanguage === "es" ? "es" : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: supportedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
