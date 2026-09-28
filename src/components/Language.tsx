'use client';
import {
  type Locale,
  normalize,
  preservesTerms,
  protectedDefaults,
} from '@/lib/i18n';
import dictionary from '@/translations/interface.json';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
type Entry = { en: string; es: string };
const Context = createContext<{
  locale: Locale;
  setLocale: (value: Locale) => void;
  t: (text: string) => string;
}>({ locale: 'pt', setLocale: () => {}, t: (text) => text });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLanguage] = useState<Locale>('pt');
  const [content, setContent] = useState<Record<string, string>>({});
  useEffect(() => {
    const saved = localStorage.getItem('museu-language');
    if (saved === 'en' || saved === 'es') setLanguage(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : locale;
    document.cookie = `museu_language=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    const controller = new AbortController();
    setContent({});
    if (locale !== 'pt')
      fetch(`/api/translations?locale=${locale}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : {}))
        .then(setContent)
        .catch(() => {});
    return () => controller.abort();
  }, [locale]);
  const setLocale = (value: Locale) => {
    localStorage.setItem('museu-language', value);
    setLanguage(value);
  };
  const t = (text: string) => {
    if (locale === 'pt') return text;
    const key = normalize(text);
    const entry = (dictionary as Record<string, Entry>)[key];
    const translated = content[key] || entry?.[locale];
    return translated && preservesTerms(key, translated, protectedDefaults)
      ? translated
      : text;
  };
  return (
    <Context.Provider value={{ locale, setLocale, t }}>
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
export function T({ text }: { text: ReactNode }) {
  const { t, locale } = useLanguage();
  if (typeof text !== 'string') return <>{text}</>;
  const result = t(text);
  return (
    <span lang={locale !== 'pt' && result === text ? 'pt-BR' : undefined}>
      {result}
    </span>
  );
}
export default function Language() {
  const { locale, setLocale } = useLanguage();
  return (
    <label className="language-picker">
      <span className="sr-only">Idioma / Language / Idioma</span>
      <select
        aria-label="Idioma / Language / Idioma"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
        <option value="es">ES</option>
      </select>
    </label>
  );
}
