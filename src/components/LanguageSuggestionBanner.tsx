import { motion, AnimatePresence } from "framer-motion";
import { Globe, X, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useGeoLanguageDetection } from "@/hooks/useGeoLanguageDetection";

const LanguageSuggestionBanner = () => {
  const { language, setLanguage, t } = useLanguage();
  const {
    suggestedLanguage,
    countryName,
    showSuggestion,
    dismissSuggestion,
    acceptSuggestion,
    getSuggestedLanguageName,
  } = useGeoLanguageDetection(language);

  const handleAccept = () => {
    const newLang = acceptSuggestion();
    if (newLang) {
      setLanguage(newLang);
    }
  };

  // Translation messages based on current language
  const getMessage = () => {
    const langName = suggestedLanguage ? getSuggestedLanguageName(suggestedLanguage) : '';
    
    const messages: Record<Language, { detected: string; suggestion: string; switchButton: string; keepButton: string }> = {
      vi: {
        detected: `Chúng tôi phát hiện bạn đang ở ${countryName}`,
        suggestion: `Bạn có muốn chuyển sang ${langName}?`,
        switchButton: `Chuyển sang ${langName}`,
        keepButton: 'Giữ nguyên',
      },
      en: {
        detected: `We detected you're in ${countryName}`,
        suggestion: `Would you like to switch to ${langName}?`,
        switchButton: `Switch to ${langName}`,
        keepButton: 'Keep current',
      },
      zh: {
        detected: `我们检测到您在${countryName}`,
        suggestion: `您想切换到${langName}吗？`,
        switchButton: `切换到${langName}`,
        keepButton: '保持当前',
      },
      ja: {
        detected: `${countryName}からのアクセスを検出しました`,
        suggestion: `${langName}に切り替えますか？`,
        switchButton: `${langName}に切り替え`,
        keepButton: '現在の言語を維持',
      },
      ko: {
        detected: `${countryName}에서 접속하신 것 같습니다`,
        suggestion: `${langName}로 전환하시겠습니까?`,
        switchButton: `${langName}로 전환`,
        keepButton: '현재 언어 유지',
      },
      fr: {
        detected: `Nous avons détecté que vous êtes en ${countryName}`,
        suggestion: `Voulez-vous passer en ${langName}?`,
        switchButton: `Passer en ${langName}`,
        keepButton: 'Garder actuel',
      },
      es: {
        detected: `Detectamos que estás en ${countryName}`,
        suggestion: `¿Te gustaría cambiar a ${langName}?`,
        switchButton: `Cambiar a ${langName}`,
        keepButton: 'Mantener actual',
      },
      de: {
        detected: `Wir haben erkannt, dass Sie sich in ${countryName} befinden`,
        suggestion: `Möchten Sie zu ${langName} wechseln?`,
        switchButton: `Zu ${langName} wechseln`,
        keepButton: 'Beibehalten',
      },
      pt: {
        detected: `Detectamos que você está em ${countryName}`,
        suggestion: `Gostaria de mudar para ${langName}?`,
        switchButton: `Mudar para ${langName}`,
        keepButton: 'Manter atual',
      },
      it: {
        detected: `Abbiamo rilevato che sei in ${countryName}`,
        suggestion: `Vuoi passare a ${langName}?`,
        switchButton: `Passa a ${langName}`,
        keepButton: 'Mantieni attuale',
      },
      th: {
        detected: `เราตรวจพบว่าคุณอยู่ใน${countryName}`,
        suggestion: `คุณต้องการเปลี่ยนเป็น${langName}หรือไม่?`,
        switchButton: `เปลี่ยนเป็น${langName}`,
        keepButton: 'คงไว้',
      },
      id: {
        detected: `Kami mendeteksi Anda berada di ${countryName}`,
        suggestion: `Apakah Anda ingin beralih ke ${langName}?`,
        switchButton: `Beralih ke ${langName}`,
        keepButton: 'Pertahankan',
      },
      hi: {
        detected: `हमने पाया कि आप ${countryName} में हैं`,
        suggestion: `क्या आप ${langName} में बदलना चाहेंगे?`,
        switchButton: `${langName} में बदलें`,
        keepButton: 'वर्तमान रखें',
      },
      ru: {
        detected: `Мы определили, что вы находитесь в ${countryName}`,
        suggestion: `Хотите переключиться на ${langName}?`,
        switchButton: `Переключить на ${langName}`,
        keepButton: 'Оставить текущий',
      },
      ar: {
        detected: `لقد اكتشفنا أنك في ${countryName}`,
        suggestion: `هل تريد التبديل إلى ${langName}؟`,
        switchButton: `التبديل إلى ${langName}`,
        keepButton: 'الإبقاء على الحالي',
      },
    };

    return messages[language] || messages.en;
  };

  const msg = getMessage();

  return (
    <AnimatePresence>
      {showSuggestion && suggestedLanguage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md"
        >
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 shadow-xl">
            {/* Close button */}
            <button
              onClick={dismissSuggestion}
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 pr-6">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  {msg.detected}
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {msg.suggestion}
                </p>

                {/* Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="gap-1.5 text-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {msg.switchButton}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissSuggestion}
                    className="text-xs text-muted-foreground"
                  >
                    {msg.keepButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageSuggestionBanner;
