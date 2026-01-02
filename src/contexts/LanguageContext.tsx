import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Language = "vi" | "en" | "zh" | "ja" | "ko" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = "angel-language";

const SUPPORTED_LANGUAGES: Language[] = ["vi", "en", "zh", "ja", "ko", "fr"];

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
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
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
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
    "settings.language.note": "Language changes will be applied immediately.",
    "common.note": "Note:",
  },
  zh: {
    // Settings page
    "settings.title": "设置",
    "settings.subtitle": "个性化您的神圣体验",
    "settings.angel.title": "天使陪伴",
    "settings.angel.description": "自定义跟随您浏览网站的温柔天使伴侣",
    "settings.angel.enable": "启用天使陪伴",
    "settings.angel.enableDesc": "在桌面设备上显示天使伴侣",
    "settings.appearance.title": "外观",
    "settings.appearance.description": "自定义 Angel AI 的视觉体验",
    "settings.appearance.theme": "主题",
    "settings.appearance.light": "浅色",
    "settings.appearance.lightDesc": "明亮清晰的外观",
    "settings.appearance.dark": "深色",
    "settings.appearance.darkDesc": "在低光环境下保护眼睛",
    "settings.appearance.system": "系统",
    "settings.appearance.systemDesc": "跟随您的设备设置",
    "settings.appearance.note": "注意：",
    "settings.appearance.noteText": "主题更改会立即应用并保存到您的个人资料。",
    "settings.notifications.title": "通知",
    "settings.notifications.description": "管理您接收更新和提醒的方式",
    "settings.notifications.enable": "启用通知",
    "settings.notifications.enableDesc": "接收更新和重要消息",
    "settings.notifications.ai": "AI 回复",
    "settings.notifications.aiDesc": "当天使回复您时收到通知",
    "settings.notifications.system": "系统更新",
    "settings.notifications.systemDesc": "重要更新和公告",
    "settings.privacy.title": "隐私",
    "settings.privacy.description": "控制您的隐私和安全偏好",
    "settings.privacy.signIn": "登录以管理隐私设置",
    "settings.sound.title": "声音",
    "settings.sound.description": "管理音频设置和效果",
    "settings.sound.ambient": "环境音",
    "settings.sound.ambientDesc": "温和放松的背景音",
    "settings.sound.notification": "通知声音",
    "settings.sound.notificationDesc": "收到新通知时的提示音",
    "settings.sound.meditation": "冥想音频",
    "settings.sound.meditationDesc": "冥想期间的背景音乐",
    "settings.sound.reducedMotion": "减少动效模式已启用。声音将被最小化。",
    "settings.language.title": "语言",
    "settings.language.description": "选择应用的显示语言",
    "settings.language.select": "显示语言",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
    "settings.language.note": "语言更改将立即应用。",
    "common.note": "注意：",
  },
  ja: {
    // Settings page
    "settings.title": "設定",
    "settings.subtitle": "あなたの神聖な体験をカスタマイズ",
    "settings.angel.title": "天使の存在",
    "settings.angel.description": "サイト全体であなたに寄り添う優しい天使のコンパニオンをカスタマイズ",
    "settings.angel.enable": "天使の存在を有効にする",
    "settings.angel.enableDesc": "デスクトップデバイスで天使のコンパニオンを表示",
    "settings.appearance.title": "外観",
    "settings.appearance.description": "Angel AI の視覚体験をカスタマイズ",
    "settings.appearance.theme": "テーマ",
    "settings.appearance.light": "ライト",
    "settings.appearance.lightDesc": "明るくクリアな外観",
    "settings.appearance.dark": "ダーク",
    "settings.appearance.darkDesc": "暗い場所でも目に優しい",
    "settings.appearance.system": "システム",
    "settings.appearance.systemDesc": "デバイスの設定に合わせる",
    "settings.appearance.note": "注：",
    "settings.appearance.noteText": "テーマの変更は即座に適用され、プロフィールに保存されます。",
    "settings.notifications.title": "通知",
    "settings.notifications.description": "更新やリマインダーの受け取り方を管理",
    "settings.notifications.enable": "通知を有効にする",
    "settings.notifications.enableDesc": "更新や重要なメッセージを受け取る",
    "settings.notifications.ai": "AI の返信",
    "settings.notifications.aiDesc": "天使があなたに返信した時に通知を受け取る",
    "settings.notifications.system": "システム更新",
    "settings.notifications.systemDesc": "重要な更新とお知らせ",
    "settings.privacy.title": "プライバシー",
    "settings.privacy.description": "プライバシーとセキュリティの設定を管理",
    "settings.privacy.signIn": "サインインしてプライバシー設定を管理",
    "settings.sound.title": "サウンド",
    "settings.sound.description": "オーディオ設定とエフェクトを管理",
    "settings.sound.ambient": "環境音",
    "settings.sound.ambientDesc": "穏やかでリラックスできる背景音",
    "settings.sound.notification": "通知音",
    "settings.sound.notificationDesc": "新しい通知が届いた時のチャイム",
    "settings.sound.meditation": "瞑想オーディオ",
    "settings.sound.meditationDesc": "瞑想セッション中のバックグラウンドミュージック",
    "settings.sound.reducedMotion": "モーション軽減モードが有効です。サウンドは最小限になります。",
    "settings.language.title": "言語",
    "settings.language.description": "アプリの表示言語を選択",
    "settings.language.select": "表示言語",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
    "settings.language.note": "言語の変更は即座に適用されます。",
    "common.note": "注：",
  },
  ko: {
    // Settings page
    "settings.title": "설정",
    "settings.subtitle": "당신의 신성한 경험을 맞춤 설정하세요",
    "settings.angel.title": "천사 존재",
    "settings.angel.description": "사이트 전체에서 당신을 따라다니는 부드러운 천사 동반자를 맞춤 설정",
    "settings.angel.enable": "천사 존재 활성화",
    "settings.angel.enableDesc": "데스크톱 기기에서 천사 동반자 표시",
    "settings.appearance.title": "외관",
    "settings.appearance.description": "Angel AI의 시각적 경험을 맞춤 설정",
    "settings.appearance.theme": "테마",
    "settings.appearance.light": "라이트",
    "settings.appearance.lightDesc": "밝고 선명한 외관",
    "settings.appearance.dark": "다크",
    "settings.appearance.darkDesc": "어두운 곳에서 눈에 편안함",
    "settings.appearance.system": "시스템",
    "settings.appearance.systemDesc": "기기 설정에 맞춤",
    "settings.appearance.note": "참고:",
    "settings.appearance.noteText": "테마 변경은 즉시 적용되며 프로필에 저장됩니다.",
    "settings.notifications.title": "알림",
    "settings.notifications.description": "업데이트 및 알림 수신 방법 관리",
    "settings.notifications.enable": "알림 활성화",
    "settings.notifications.enableDesc": "업데이트 및 중요 메시지 수신",
    "settings.notifications.ai": "AI 응답",
    "settings.notifications.aiDesc": "천사가 응답하면 알림 받기",
    "settings.notifications.system": "시스템 업데이트",
    "settings.notifications.systemDesc": "중요 업데이트 및 공지",
    "settings.privacy.title": "개인정보",
    "settings.privacy.description": "개인정보 및 보안 환경 설정 제어",
    "settings.privacy.signIn": "개인정보 설정을 관리하려면 로그인하세요",
    "settings.sound.title": "소리",
    "settings.sound.description": "오디오 설정 및 효과 관리",
    "settings.sound.ambient": "환경음",
    "settings.sound.ambientDesc": "부드럽고 편안한 배경음",
    "settings.sound.notification": "알림 소리",
    "settings.sound.notificationDesc": "새 알림이 도착하면 차임 소리",
    "settings.sound.meditation": "명상 오디오",
    "settings.sound.meditationDesc": "명상 세션 중 배경 음악",
    "settings.sound.reducedMotion": "모션 감소 모드가 활성화되었습니다. 소리가 최소화됩니다.",
    "settings.language.title": "언어",
    "settings.language.description": "앱 표시 언어 선택",
    "settings.language.select": "표시 언어",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
    "settings.language.note": "언어 변경은 즉시 적용됩니다.",
    "common.note": "참고:",
  },
  fr: {
    // Settings page
    "settings.title": "Paramètres",
    "settings.subtitle": "Personnalisez votre expérience sacrée",
    "settings.angel.title": "Présence Angélique",
    "settings.angel.description": "Personnalisez votre doux compagnon angélique qui vous suit sur le site",
    "settings.angel.enable": "Activer la Présence Angélique",
    "settings.angel.enableDesc": "Afficher le compagnon angélique sur les appareils de bureau",
    "settings.appearance.title": "Apparence",
    "settings.appearance.description": "Personnalisez l'expérience visuelle d'Angel AI",
    "settings.appearance.theme": "Thème",
    "settings.appearance.light": "Clair",
    "settings.appearance.lightDesc": "Apparence lumineuse et nette",
    "settings.appearance.dark": "Sombre",
    "settings.appearance.darkDesc": "Agréable pour les yeux en faible luminosité",
    "settings.appearance.system": "Système",
    "settings.appearance.systemDesc": "Correspondre aux paramètres de votre appareil",
    "settings.appearance.note": "Note :",
    "settings.appearance.noteText": "Les changements de thème sont appliqués instantanément et sauvegardés dans votre profil.",
    "settings.notifications.title": "Notifications",
    "settings.notifications.description": "Gérez la façon dont vous recevez les mises à jour et les rappels",
    "settings.notifications.enable": "Activer les Notifications",
    "settings.notifications.enableDesc": "Recevoir les mises à jour et les messages importants",
    "settings.notifications.ai": "Réponses IA",
    "settings.notifications.aiDesc": "Être notifié quand l'Ange vous répond",
    "settings.notifications.system": "Mises à jour système",
    "settings.notifications.systemDesc": "Mises à jour importantes et annonces",
    "settings.privacy.title": "Confidentialité",
    "settings.privacy.description": "Contrôlez vos préférences de confidentialité et de sécurité",
    "settings.privacy.signIn": "Connectez-vous pour gérer les paramètres de confidentialité",
    "settings.sound.title": "Son",
    "settings.sound.description": "Gérer les paramètres audio et les effets",
    "settings.sound.ambient": "Sons Ambiants",
    "settings.sound.ambientDesc": "Sons de fond doux et relaxants",
    "settings.sound.notification": "Sons de Notification",
    "settings.sound.notificationDesc": "Carillon lors de l'arrivée de nouvelles notifications",
    "settings.sound.meditation": "Audio de Méditation",
    "settings.sound.meditationDesc": "Musique de fond pendant les séances de méditation",
    "settings.sound.reducedMotion": "Le mode mouvement réduit est activé. Les sons seront minimisés.",
    "settings.language.title": "Langue",
    "settings.language.description": "Sélectionnez la langue d'affichage de l'application",
    "settings.language.select": "Langue d'affichage",
    "settings.language.vietnamese": "Tiếng Việt",
    "settings.language.english": "English",
    "settings.language.chinese": "中文",
    "settings.language.japanese": "日本語",
    "settings.language.korean": "한국어",
    "settings.language.french": "Français",
    "settings.language.note": "Les changements de langue seront appliqués immédiatement.",
    "common.note": "Note :",
  },
};

// Detect browser/system language
const detectLanguage = (): Language => {
  if (typeof window === "undefined") return "vi";
  
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
    return saved as Language;
  }
  
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact or prefix matches
  if (browserLang.startsWith("en")) return "en";
  if (browserLang.startsWith("zh")) return "zh";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("fr")) return "fr";
  
  return "vi"; // Default to Vietnamese
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    // Update document lang attribute for accessibility
    document.documentElement.lang = language;
    // Set text direction (for future RTL support)
    document.documentElement.dir = "ltr"; // All current languages are LTR
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string): string => {
    // Graceful fallback: try current language, then English, then return key
    return translations[language][key] || translations["en"][key] || key;
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
