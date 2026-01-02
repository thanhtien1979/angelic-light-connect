import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = "angel-language";

// Translation dictionaries
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Settings page
    "settings.title": "Cài đặt",
    "settings.subtitle": "Cá nhân hóa trải nghiệm linh thiêng của bạn",
    "settings.angel.title": "Thiên thần đồng hành",
    "settings.angel.description": "Tùy chỉnh thiên thần hiền dịu đồng hành cùng bạn",
    "settings.angel.enable": "Bật Thiên thần đồng hành",
    "settings.angel.enableDesc": "Hiển thị thiên thần trên thiết bị máy tính",
    "settings.appearance.title": "Giao diện",
    "settings.appearance.description": "Tùy chỉnh trải nghiệm hình ảnh của Angel AI",
    "settings.appearance.theme": "Chủ đề",
    "settings.appearance.light": "Sáng",
    "settings.appearance.lightDesc": "Giao diện sáng và rõ ràng",
    "settings.appearance.dark": "Tối",
    "settings.appearance.darkDesc": "Dễ nhìn trong ánh sáng yếu",
    "settings.appearance.system": "Hệ thống",
    "settings.appearance.systemDesc": "Theo cài đặt thiết bị của bạn",
    "settings.appearance.note": "Ghi chú:",
    "settings.appearance.noteText": "Thay đổi chủ đề được áp dụng ngay và lưu vào hồ sơ của bạn.",
    "settings.notifications.title": "Thông báo",
    "settings.notifications.description": "Quản lý cách bạn nhận cập nhật và nhắc nhở",
    "settings.notifications.enable": "Bật Thông báo",
    "settings.notifications.enableDesc": "Nhận cập nhật và tin nhắn quan trọng",
    "settings.notifications.ai": "Phản hồi AI",
    "settings.notifications.aiDesc": "Nhận thông báo khi Thiên thần trả lời bạn",
    "settings.notifications.system": "Cập nhật hệ thống",
    "settings.notifications.systemDesc": "Cập nhật và thông báo quan trọng",
    "settings.privacy.title": "Quyền riêng tư",
    "settings.privacy.description": "Kiểm soát cài đặt quyền riêng tư và bảo mật",
    "settings.privacy.signIn": "Đăng nhập để quản lý cài đặt quyền riêng tư",
    "settings.sound.title": "Âm thanh",
    "settings.sound.description": "Quản lý cài đặt âm thanh và hiệu ứng",
    "settings.sound.ambient": "Âm thanh môi trường",
    "settings.sound.ambientDesc": "Âm thanh nền nhẹ nhàng và thư giãn",
    "settings.sound.notification": "Âm thanh thông báo",
    "settings.sound.notificationDesc": "Tiếng chuông khi có thông báo mới",
    "settings.sound.meditation": "Âm thanh thiền định",
    "settings.sound.meditationDesc": "Nhạc nền trong các buổi thiền",
    "settings.sound.reducedMotion": "Chế độ giảm chuyển động đang bật. Âm thanh sẽ được giảm thiểu.",
    "settings.language.title": "Ngôn ngữ",
    "settings.language.description": "Chọn ngôn ngữ hiển thị cho ứng dụng",
    "settings.language.select": "Ngôn ngữ hiển thị",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.note": "Thay đổi ngôn ngữ sẽ được áp dụng ngay lập tức.",
    "common.note": "Ghi chú:",
  },
  en: {
    // Settings page
    "settings.title": "Settings",
    "settings.subtitle": "Personalize your sacred experience",
    "settings.angel.title": "Angel Presence",
    "settings.angel.description": "Customize your gentle angelic companion that follows you across the site",
    "settings.angel.enable": "Enable Angel Presence",
    "settings.angel.enableDesc": "Show the angelic companion on desktop devices",
    "settings.appearance.title": "Appearance",
    "settings.appearance.description": "Customize the visual experience of Angel AI",
    "settings.appearance.theme": "Theme",
    "settings.appearance.light": "Light",
    "settings.appearance.lightDesc": "Bright and clear appearance",
    "settings.appearance.dark": "Dark",
    "settings.appearance.darkDesc": "Easy on the eyes in low light",
    "settings.appearance.system": "System",
    "settings.appearance.systemDesc": "Match your device settings",
    "settings.appearance.note": "Note:",
    "settings.appearance.noteText": "Theme changes are applied instantly and saved to your profile.",
    "settings.notifications.title": "Notifications",
    "settings.notifications.description": "Manage how you receive updates and reminders",
    "settings.notifications.enable": "Enable Notifications",
    "settings.notifications.enableDesc": "Receive updates and important messages",
    "settings.notifications.ai": "AI Responses",
    "settings.notifications.aiDesc": "Get notified when Angel responds to you",
    "settings.notifications.system": "System Updates",
    "settings.notifications.systemDesc": "Important updates and announcements",
    "settings.privacy.title": "Privacy",
    "settings.privacy.description": "Control your privacy and security preferences",
    "settings.privacy.signIn": "Sign in to manage privacy settings",
    "settings.sound.title": "Sound",
    "settings.sound.description": "Manage audio settings and effects",
    "settings.sound.ambient": "Ambient Sounds",
    "settings.sound.ambientDesc": "Gentle and relaxing background sounds",
    "settings.sound.notification": "Notification Sounds",
    "settings.sound.notificationDesc": "Chime when new notifications arrive",
    "settings.sound.meditation": "Meditation Audio",
    "settings.sound.meditationDesc": "Background music during meditation sessions",
    "settings.sound.reducedMotion": "Reduced motion mode is enabled. Sounds will be minimized.",
    "settings.language.title": "Language",
    "settings.language.description": "Select display language for the app",
    "settings.language.select": "Display Language",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.note": "Language changes will be applied immediately.",
    "common.note": "Note:",
  },
};

// Detect browser/system language
const detectLanguage = (): Language => {
  if (typeof window === "undefined") return "vi";
  
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === "vi" || saved === "en")) {
    return saved;
  }
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("en")) return "en";
  return "vi"; // Default to Vietnamese
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    // Update document lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
