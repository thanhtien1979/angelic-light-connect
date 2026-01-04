import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/contexts/LanguageContext';

interface GeoLocation {
  country: string;
  countryCode: string;
}

// Map country codes to suggested languages
const countryToLanguage: Record<string, Language> = {
  // Vietnamese
  VN: 'vi',
  
  // English
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', ZA: 'en', PH: 'en', SG: 'en',
  
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  
  // Japanese
  JP: 'ja',
  
  // Korean
  KR: 'ko', KP: 'ko',
  
  // French
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr', SN: 'fr', CI: 'fr', ML: 'fr',
  
  // Spanish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es',
  CR: 'es', PA: 'es', UY: 'es', PR: 'es',
  
  // German
  DE: 'de', AT: 'de', LI: 'de',
  
  // Portuguese
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
  
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  
  // Thai
  TH: 'th',
  
  // Indonesian
  ID: 'id',
  
  // Hindi
  IN: 'hi',
  
  // Russian
  RU: 'ru', BY: 'ru', KZ: 'ru', KG: 'ru',
  
  // Arabic
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar', KW: 'ar', LB: 'ar', LY: 'ar',
  MA: 'ar', OM: 'ar', QA: 'ar', SD: 'ar', SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar',
  DZ: 'ar', PS: 'ar',
};

// Language names for display
const languageNames: Record<Language, Record<Language, string>> = {
  vi: { vi: 'Tiếng Việt', en: 'Vietnamese', zh: '越南语', ja: 'ベトナム語', ko: '베트남어', fr: 'Vietnamien', es: 'Vietnamita', de: 'Vietnamesisch', pt: 'Vietnamita', it: 'Vietnamita', th: 'เวียดนาม', id: 'Vietnam', hi: 'वियतनामी', ru: 'Вьетнамский', ar: 'الفيتنامية' },
  en: { vi: 'English', en: 'English', zh: '英语', ja: '英語', ko: '영어', fr: 'Anglais', es: 'Inglés', de: 'Englisch', pt: 'Inglês', it: 'Inglese', th: 'อังกฤษ', id: 'Inggris', hi: 'अंग्रेज़ी', ru: 'Английский', ar: 'الإنجليزية' },
  zh: { vi: 'Tiếng Trung', en: 'Chinese', zh: '中文', ja: '中国語', ko: '중국어', fr: 'Chinois', es: 'Chino', de: 'Chinesisch', pt: 'Chinês', it: 'Cinese', th: 'จีน', id: 'Cina', hi: 'चीनी', ru: 'Китайский', ar: 'الصينية' },
  ja: { vi: 'Tiếng Nhật', en: 'Japanese', zh: '日语', ja: '日本語', ko: '일본어', fr: 'Japonais', es: 'Japonés', de: 'Japanisch', pt: 'Japonês', it: 'Giapponese', th: 'ญี่ปุ่น', id: 'Jepang', hi: 'जापानी', ru: 'Японский', ar: 'اليابانية' },
  ko: { vi: 'Tiếng Hàn', en: 'Korean', zh: '韩语', ja: '韓国語', ko: '한국어', fr: 'Coréen', es: 'Coreano', de: 'Koreanisch', pt: 'Coreano', it: 'Coreano', th: 'เกาหลี', id: 'Korea', hi: 'कोरियाई', ru: 'Корейский', ar: 'الكورية' },
  fr: { vi: 'Tiếng Pháp', en: 'French', zh: '法语', ja: 'フランス語', ko: '프랑스어', fr: 'Français', es: 'Francés', de: 'Französisch', pt: 'Francês', it: 'Francese', th: 'ฝรั่งเศส', id: 'Prancis', hi: 'फ्रेंच', ru: 'Французский', ar: 'الفرنسية' },
  es: { vi: 'Tiếng Tây Ban Nha', en: 'Spanish', zh: '西班牙语', ja: 'スペイン語', ko: '스페인어', fr: 'Espagnol', es: 'Español', de: 'Spanisch', pt: 'Espanhol', it: 'Spagnolo', th: 'สเปน', id: 'Spanyol', hi: 'स्पेनिश', ru: 'Испанский', ar: 'الإسبانية' },
  de: { vi: 'Tiếng Đức', en: 'German', zh: '德语', ja: 'ドイツ語', ko: '독일어', fr: 'Allemand', es: 'Alemán', de: 'Deutsch', pt: 'Alemão', it: 'Tedesco', th: 'เยอรมัน', id: 'Jerman', hi: 'जर्मन', ru: 'Немецкий', ar: 'الألمانية' },
  pt: { vi: 'Tiếng Bồ Đào Nha', en: 'Portuguese', zh: '葡萄牙语', ja: 'ポルトガル語', ko: '포르투갈어', fr: 'Portugais', es: 'Portugués', de: 'Portugiesisch', pt: 'Português', it: 'Portoghese', th: 'โปรตุเกส', id: 'Portugis', hi: 'पुर्तगाली', ru: 'Португальский', ar: 'البرتغالية' },
  it: { vi: 'Tiếng Ý', en: 'Italian', zh: '意大利语', ja: 'イタリア語', ko: '이탈리아어', fr: 'Italien', es: 'Italiano', de: 'Italienisch', pt: 'Italiano', it: 'Italiano', th: 'อิตาลี', id: 'Italia', hi: 'इतालवी', ru: 'Итальянский', ar: 'الإيطالية' },
  th: { vi: 'Tiếng Thái', en: 'Thai', zh: '泰语', ja: 'タイ語', ko: '태국어', fr: 'Thaï', es: 'Tailandés', de: 'Thailändisch', pt: 'Tailandês', it: 'Tailandese', th: 'ไทย', id: 'Thai', hi: 'थाई', ru: 'Тайский', ar: 'التايلاندية' },
  id: { vi: 'Tiếng Indonesia', en: 'Indonesian', zh: '印尼语', ja: 'インドネシア語', ko: '인도네시아어', fr: 'Indonésien', es: 'Indonesio', de: 'Indonesisch', pt: 'Indonésio', it: 'Indonesiano', th: 'อินโดนีเซีย', id: 'Indonesia', hi: 'इंडोनेशियाई', ru: 'Индонезийский', ar: 'الإندونيسية' },
  hi: { vi: 'Tiếng Hindi', en: 'Hindi', zh: '印地语', ja: 'ヒンディー語', ko: '힌디어', fr: 'Hindi', es: 'Hindi', de: 'Hindi', pt: 'Hindi', it: 'Hindi', th: 'ฮินดี', id: 'Hindi', hi: 'हिन्दी', ru: 'Хинди', ar: 'الهندية' },
  ru: { vi: 'Tiếng Nga', en: 'Russian', zh: '俄语', ja: 'ロシア語', ko: '러시아어', fr: 'Russe', es: 'Ruso', de: 'Russisch', pt: 'Russo', it: 'Russo', th: 'รัสเซีย', id: 'Rusia', hi: 'रूसी', ru: 'Русский', ar: 'الروسية' },
  ar: { vi: 'Tiếng Ả Rập', en: 'Arabic', zh: '阿拉伯语', ja: 'アラビア語', ko: '아랍어', fr: 'Arabe', es: 'Árabe', de: 'Arabisch', pt: 'Árabe', it: 'Arabo', th: 'อาหรับ', id: 'Arab', hi: 'अरबी', ru: 'Арабский', ar: 'العربية' },
};

const GEO_SUGGESTION_KEY = 'angel-geo-language-suggestion-shown';
const GEO_SUGGESTION_DISMISSED_KEY = 'angel-geo-language-suggestion-dismissed';

export const useGeoLanguageDetection = (currentLanguage: Language) => {
  const [suggestedLanguage, setSuggestedLanguage] = useState<Language | null>(null);
  const [countryName, setCountryName] = useState<string>('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestedLanguageName = useCallback((lang: Language): string => {
    return languageNames[lang]?.[currentLanguage] || lang;
  }, [currentLanguage]);

  const detectLocation = useCallback(async () => {
    // Check if already shown or dismissed
    const alreadyShown = localStorage.getItem(GEO_SUGGESTION_KEY);
    const dismissed = localStorage.getItem(GEO_SUGGESTION_DISMISSED_KEY);
    
    if (alreadyShown || dismissed) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Use a free IP geolocation API
      const response = await fetch('https://ipapi.co/json/', {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }

      const data = await response.json();
      const countryCode = data.country_code?.toUpperCase();
      const country = data.country_name;

      if (countryCode && countryToLanguage[countryCode]) {
        const suggested = countryToLanguage[countryCode];
        
        // Only suggest if different from current language
        if (suggested !== currentLanguage) {
          setSuggestedLanguage(suggested);
          setCountryName(country);
          setShowSuggestion(true);
          localStorage.setItem(GEO_SUGGESTION_KEY, 'true');
        }
      }
    } catch (error) {
      console.log('Geo detection skipped:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  const dismissSuggestion = useCallback(() => {
    setShowSuggestion(false);
    localStorage.setItem(GEO_SUGGESTION_DISMISSED_KEY, 'true');
  }, []);

  const acceptSuggestion = useCallback(() => {
    setShowSuggestion(false);
    localStorage.setItem(GEO_SUGGESTION_DISMISSED_KEY, 'true');
    return suggestedLanguage;
  }, [suggestedLanguage]);

  useEffect(() => {
    // Delay detection to not block initial render
    const timer = setTimeout(() => {
      detectLocation();
    }, 2000);

    return () => clearTimeout(timer);
  }, [detectLocation]);

  return {
    suggestedLanguage,
    countryName,
    showSuggestion,
    isLoading,
    dismissSuggestion,
    acceptSuggestion,
    getSuggestedLanguageName,
  };
};
