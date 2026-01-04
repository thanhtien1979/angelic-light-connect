import { useLanguage, isRTL } from "@/contexts/LanguageContext";

/**
 * Hook to check if current language is RTL
 * Returns boolean and utility classes for RTL styling
 */
export const useRTL = () => {
  const { language } = useLanguage();
  const rtl = isRTL(language);

  return {
    isRTL: rtl,
    // Direction-aware flex utilities
    flexDirection: rtl ? "flex-row-reverse" : "flex-row",
    // Direction-aware text alignment
    textAlign: rtl ? "text-right" : "text-left",
    // Direction-aware margins
    marginStart: rtl ? "mr" : "ml",
    marginEnd: rtl ? "ml" : "mr",
    // Direction-aware paddings
    paddingStart: rtl ? "pr" : "pl",
    paddingEnd: rtl ? "pl" : "pr",
    // Direction-aware positions
    start: rtl ? "right" : "left",
    end: rtl ? "left" : "right",
    // Icon transform for directional icons (arrows, chevrons)
    iconFlip: rtl ? "scale-x-[-1]" : "",
  };
};

export default useRTL;
