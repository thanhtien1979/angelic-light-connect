import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Palette, Bell, Shield, Sparkles, Sun, Moon, Monitor, MessageSquare, Info, BellRing, Volume2, VolumeX, Languages, Globe, Music, BellDot, Headphones, Zap, Flame, Waves, TreePine, Star, Sunrise, Camera, Trash2, Loader2, Pencil, Check, Mail } from "lucide-react";
import AmbientSoundPlayer from "@/components/AmbientSoundPlayer";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import AngelStyleGallery from "@/components/AngelPresence/AngelStyleGallery";
import { useAngelPresence } from "@/hooks/useAngelPresence";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NavigationHeader from "@/components/NavigationHeader";
import { PrivacySettings } from "@/components/PrivacySettings";
import { useThemePreference } from "@/hooks/useThemePreference";
import { useSoundSettings } from "@/hooks/useSoundSettings";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SyncIndicator } from "@/components/AngelPresence/SyncIndicator";
import { useLightBurst, LIGHT_BURST_COLORS, LIGHT_BURST_SIZES, LIGHT_BURST_EFFECTS, LightBurstSettings, LightBurstSize, LightBurstEffect } from "@/contexts/LightBurstContext";
import { ResetConfirmDialog } from "@/components/AngelPresence/ResetConfirmDialog";
import { useUserAvatar } from "@/hooks/useUserAvatar";
import { getUserInitials, getAvatarColor } from "@/lib/userInitials";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SettingsSection = "profile" | "angel" | "appearance" | "notifications" | "privacy" | "sound" | "language";
type ThemeOption = "light" | "dark" | "system" | "twilight" | "ocean" | "forest" | "midnight" | "sunrise";

interface NotificationSettings {
  enabled: boolean;
  aiResponses: boolean;
  systemUpdates: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { syncTheme } = useThemePreference();
  const { settings: soundSettings, updateSetting: updateSoundSetting, prefersReducedMotion } = useSoundSettings();
  const { settings: lightBurstSettings, updateSetting: updateLightBurstSetting } = useLightBurst();
  const { language, setLanguage, t } = useLanguage();
  const { avatarUrl, isUploading: isUploadingAvatar, uploadAvatar, removeAvatar } = useUserAvatar();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const {
    isEnabled: angelEnabled,
    style: angelStyle,
    color: angelColor,
    sparklesEnabled,
    trailEnabled,
    customImageUrl,
    videoQuality,
    hiddenStyles,
    isUploading: angelUploading,
    isLoading: angelLoading,
    syncStatus,
    toggle: toggleAngel,
    setStyle,
    setColor,
    setSparklesEnabled,
    setTrailEnabled,
    setVideoQuality,
    uploadCustomImage,
    removeCustomImage,
    resetToDefaults,
    deleteStyle,
    restoreStyle,
  } = useAngelPresence();

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("angel-notification-settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { enabled: true, aiResponses: true, systemUpdates: true };
      }
    }
    return { enabled: true, aiResponses: true, systemUpdates: true };
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Save notification settings
  useEffect(() => {
    localStorage.setItem("angel-notification-settings", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // Fetch display name and bio from profile
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, bio")
        .eq("id", user.id)
        .single();
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      }
      if (data?.bio) {
        setBio(data.bio);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleThemeChange = async (newTheme: ThemeOption) => {
    setTheme(newTheme);
    await syncTheme(newTheme);
  };

  const handleSaveDisplayName = async () => {
    if (!user || !displayName.trim()) return;
    
    const trimmedName = displayName.trim();
    if (trimmedName.length > 50) {
      toast.error("Tên hiển thị không được quá 50 ký tự");
      return;
    }
    
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: trimmedName,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast.success("Đã cập nhật tên hiển thị!");
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error("Không thể cập nhật tên. Vui lòng thử lại.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => (checked: boolean) => {
    setNotificationSettings(prev => {
      // If disabling master toggle, disable all
      if (key === "enabled" && !checked) {
        return { enabled: false, aiResponses: false, systemUpdates: false };
      }
      // If enabling a sub-setting, ensure master is enabled
      if (key !== "enabled" && checked) {
        return { ...prev, [key]: checked, enabled: true };
      }
      return { ...prev, [key]: checked };
    });
  };

  const sections = [
    {
      id: "profile" as const,
      label: "Hồ sơ",
      icon: User,
      description: "Ảnh đại diện và thông tin cá nhân",
    },
    {
      id: "angel" as const,
      label: t("settings.angel.title"),
      icon: Sparkles,
      description: t("settings.angel.description"),
    },
    {
      id: "appearance" as const,
      label: t("settings.appearance.title"),
      icon: Palette,
      description: t("settings.appearance.description"),
    },
    {
      id: "notifications" as const,
      label: t("settings.notifications.title"),
      icon: Bell,
      description: t("settings.notifications.description"),
    },
    {
      id: "privacy" as const,
      label: t("settings.privacy.title"),
      icon: Shield,
      description: t("settings.privacy.description"),
    },
    {
      id: "sound" as const,
      label: t("settings.sound.title"),
      icon: Volume2,
      description: t("settings.sound.description"),
    },
    {
      id: "language" as const,
      label: t("settings.language.title"),
      icon: Languages,
      description: t("settings.language.description"),
    },
  ];

  const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode; description: string; swatch?: string }[] = [
    {
      value: "light",
      label: t("settings.appearance.light"),
      icon: <Sun className="w-5 h-5" />,
      description: t("settings.appearance.lightDesc"),
      swatch: "bg-gradient-to-br from-rose-100 to-pink-50",
    },
    {
      value: "dark",
      label: t("settings.appearance.dark"),
      icon: <Moon className="w-5 h-5" />,
      description: t("settings.appearance.darkDesc"),
      swatch: "bg-gradient-to-br from-indigo-900 to-purple-950",
    },
    {
      value: "twilight",
      label: "Twilight",
      icon: <Flame className="w-5 h-5" />,
      description: "Warm candlelight with twilight ambiance",
      swatch: "bg-gradient-to-br from-amber-500/80 to-indigo-900",
    },
    {
      value: "ocean",
      label: "Ocean",
      icon: <Waves className="w-5 h-5" />,
      description: "Calm, cleansing ocean depths",
      swatch: "bg-gradient-to-br from-teal-400 to-blue-900",
    },
    {
      value: "forest",
      label: "Forest",
      icon: <TreePine className="w-5 h-5" />,
      description: "Grounded, healing forest sanctuary",
      swatch: "bg-gradient-to-br from-emerald-400 to-green-900",
    },
    {
      value: "midnight",
      label: "Midnight",
      icon: <Star className="w-5 h-5" />,
      description: "Cosmic starfield atmosphere",
      swatch: "bg-gradient-to-br from-slate-300/50 to-slate-950",
    },
    {
      value: "sunrise",
      label: "Sunrise",
      icon: <Sunrise className="w-5 h-5" />,
      description: "Warm golden dawn ambiance",
      swatch: "bg-gradient-to-br from-amber-300 to-sky-300",
    },
    {
      value: "system",
      label: t("settings.appearance.system"),
      icon: <Monitor className="w-5 h-5" />,
      description: t("settings.appearance.systemDesc"),
      swatch: "bg-gradient-to-br from-gray-200 to-gray-600",
    },
  ];

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: "vi", label: t("settings.language.vietnamese"), flag: "🇻🇳" },
    { value: "en", label: t("settings.language.english"), flag: "🇺🇸" },
    { value: "zh", label: t("settings.language.chinese"), flag: "🇨🇳" },
    { value: "ja", label: t("settings.language.japanese"), flag: "🇯🇵" },
    { value: "ko", label: t("settings.language.korean"), flag: "🇰🇷" },
    { value: "fr", label: t("settings.language.french"), flag: "🇫🇷" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-light text-foreground">{t("settings.title")}</h1>
              <p className="text-muted-foreground">{t("settings.subtitle")}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                        <div>
                          <p className={`font-medium text-sm ${isActive ? "text-primary" : ""}`}>
                            {section.label}
                          </p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {section.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Hồ sơ cá nhân
                    </CardTitle>
                    <CardDescription>
                      Quản lý ảnh đại diện và thông tin cá nhân của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user ? (
                      <>
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-muted/30 border border-border/50">
                          {/* Avatar Display */}
                          <div className="relative group">
                            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20 shadow-lg">
                              {avatarUrl ? (
                                <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
                              ) : null}
                              <AvatarFallback className={`bg-gradient-to-br ${getAvatarColor(user?.user_metadata?.display_name || user?.email || "user")} text-white text-2xl sm:text-3xl font-medium`}>
                                {getUserInitials(user?.user_metadata?.display_name, user?.email)}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Upload overlay on hover */}
                            <motion.button
                              onClick={() => avatarInputRef.current?.click()}
                              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={isUploadingAvatar}
                            >
                              {isUploadingAvatar ? (
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              ) : (
                                <Camera className="w-8 h-8 text-white" />
                              )}
                            </motion.button>
                          </div>
                          
                          {/* Avatar Actions */}
                          <div className="flex-1 text-center sm:text-left space-y-4">
                            <div>
                              <h3 className="text-lg font-medium text-foreground">
                                {user?.user_metadata?.display_name || "Chưa có tên hiển thị"}
                              </h3>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => avatarInputRef.current?.click()}
                                disabled={isUploadingAvatar}
                                className="gap-2"
                              >
                                {isUploadingAvatar ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Camera className="w-4 h-4" />
                                )}
                                {avatarUrl ? "Đổi ảnh" : "Tải ảnh lên"}
                              </Button>
                              
                              {avatarUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeAvatar}
                                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xóa ảnh
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Hidden file input */}
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadAvatar(file);
                              }
                              e.target.value = "";
                            }}
                          />
                        </div>
                        
                        {/* Display Name Section */}
                        <div className="p-6 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Tên hiển thị</Label>
                            {!isEditingName && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingName(true)}
                                className="gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Chỉnh sửa
                              </Button>
                            )}
                          </div>
                          
                          {isEditingName ? (
                            <div className="flex gap-2">
                              <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Nhập tên hiển thị của bạn"
                                maxLength={50}
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveDisplayName();
                                  } else if (e.key === "Escape") {
                                    setIsEditingName(false);
                                  }
                                }}
                              />
                              <Button
                                onClick={handleSaveDisplayName}
                                disabled={isSavingName || !displayName.trim()}
                                size="icon"
                                className="shrink-0"
                              >
                                {isSavingName ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditingName(false)}
                                className="shrink-0"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <p className="text-foreground">
                              {displayName || <span className="text-muted-foreground italic">Chưa có tên hiển thị</span>}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Tên này sẽ hiển thị cho người khác trong cộng đồng và tin nhắn.
                          </p>
                        </div>
                        
                        {/* Bio Section */}
                        <div className="p-6 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Tiểu sử</Label>
                            {!isEditingBio && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditingBio(true)}
                                className="gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Chỉnh sửa
                              </Button>
                            )}
                          </div>
                          
                          {isEditingBio ? (
                            <div className="space-y-2">
                              <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Viết vài dòng giới thiệu về bản thân..."
                                maxLength={200}
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setIsEditingBio(false);
                                  }
                                }}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {bio.length}/200 ký tự
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditingBio(false)}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      if (!user) return;
                                      setIsSavingBio(true);
                                      try {
                                        const { error } = await supabase
                                          .from("profiles")
                                          .upsert({
                                            id: user.id,
                                            bio: bio.trim() || null,
                                            updated_at: new Date().toISOString(),
                                          });
                                        
                                        if (error) throw error;
                                        
                                        toast.success("Đã cập nhật tiểu sử!");
                                        setIsEditingBio(false);
                                      } catch (error) {
                                        console.error("Error updating bio:", error);
                                        toast.error("Không thể cập nhật tiểu sử. Vui lòng thử lại.");
                                      } finally {
                                        setIsSavingBio(false);
                                      }
                                    }}
                                    disabled={isSavingBio}
                                    className="gap-2"
                                  >
                                    {isSavingBio ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                    Lưu
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-foreground text-sm whitespace-pre-wrap">
                              {bio || <span className="text-muted-foreground italic">Chưa có tiểu sử</span>}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Tiểu sử ngắn gọn về bạn sẽ hiển thị trên hồ sơ công khai của bạn.
                          </p>
                        </div>
                        
                        {/* Email Section */}
                        <div className="p-6 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </Label>
                            {!isEditingEmail && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setNewEmail(user?.email || "");
                                  setIsEditingEmail(true);
                                }}
                                className="gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Thay đổi
                              </Button>
                            )}
                          </div>
                          
                          {isEditingEmail ? (
                            <div className="space-y-3">
                              <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Nhập email mới"
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") {
                                    setIsEditingEmail(false);
                                    setNewEmail("");
                                  }
                                }}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIsEditingEmail(false);
                                    setNewEmail("");
                                  }}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    if (!newEmail.trim() || newEmail === user?.email) {
                                      setIsEditingEmail(false);
                                      return;
                                    }
                                    
                                    // Basic email validation
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(newEmail.trim())) {
                                      toast.error("Email không hợp lệ");
                                      return;
                                    }
                                    
                                    setIsSavingEmail(true);
                                    try {
                                      const { error } = await supabase.auth.updateUser({
                                        email: newEmail.trim(),
                                      });
                                      
                                      if (error) throw error;
                                      
                                      toast.success("Đã gửi email xác nhận đến địa chỉ mới. Vui lòng kiểm tra hộp thư.");
                                      setIsEditingEmail(false);
                                      setNewEmail("");
                                    } catch (error: any) {
                                      console.error("Error updating email:", error);
                                      if (error.message?.includes("already registered")) {
                                        toast.error("Email này đã được sử dụng bởi tài khoản khác");
                                      } else {
                                        toast.error("Không thể cập nhật email. Vui lòng thử lại.");
                                      }
                                    } finally {
                                      setIsSavingEmail(false);
                                    }
                                  }}
                                  disabled={isSavingEmail || !newEmail.trim() || newEmail === user?.email}
                                  className="gap-2"
                                >
                                  {isSavingEmail ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                  Cập nhật
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-foreground">
                              {user?.email}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Khi thay đổi email, bạn sẽ nhận được email xác nhận tại địa chỉ mới.
                          </p>
                        </div>
                        
                        {/* Info Note */}
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>
                              <span className="font-medium text-primary">Lưu ý:</span> Ảnh đại diện, tên hiển thị và tiểu sử sẽ được hiển thị trong hồ sơ của bạn.
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
                        <User className="h-12 w-12 opacity-50" />
                        <p>Vui lòng đăng nhập để quản lý hồ sơ</p>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {activeSection === "angel" && (
                <>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Angel Presence
                          <SyncIndicator status={syncStatus} className="ml-2" />
                        </CardTitle>
                        <CardDescription>
                          Customize your gentle angelic companion that follows you across the site
                        </CardDescription>
                      </div>
                      <ResetConfirmDialog onConfirm={resetToDefaults} isLoading={angelLoading} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="space-y-1">
                        <Label htmlFor="angel-toggle" className="text-base font-medium">
                          Enable Angel Presence
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show the angelic companion on desktop devices
                        </p>
                      </div>
                      <Switch
                        id="angel-toggle"
                        checked={angelEnabled}
                        onCheckedChange={toggleAngel}
                      />
                    </div>

                    {angelEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Separator className="my-6" />
                        
                        <AngelStyleGallery
                          currentStyle={angelStyle}
                          onStyleChange={setStyle}
                          currentColor={angelColor}
                          onColorChange={setColor}
                          sparklesEnabled={sparklesEnabled}
                          trailEnabled={trailEnabled}
                          onSparklesChange={setSparklesEnabled}
                          onTrailChange={setTrailEnabled}
                          videoQuality={videoQuality}
                          onVideoQualityChange={setVideoQuality}
                          customImageUrl={customImageUrl}
                          onCustomImageUpload={uploadCustomImage}
                          onCustomImageRemove={removeCustomImage}
                          isUploading={angelUploading}
                          isLoggedIn={!!user}
                          hiddenStyles={hiddenStyles}
                          onDeleteStyle={deleteStyle}
                          onRestoreStyle={restoreStyle}
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </>
              )}

              {activeSection === "appearance" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize the visual experience of Angel AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Theme</Label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {mounted && themeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleThemeChange(option.value)}
                            className={cn(
                              "p-4 rounded-xl border text-left transition-all duration-200 group",
                              theme === option.value
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50"
                            )}
                          >
                            <div className="flex flex-col items-center text-center gap-3">
                              {/* Color swatch preview */}
                              {option.swatch && (
                                <div className={cn(
                                  "w-10 h-10 rounded-full shadow-inner border border-border/30",
                                  option.swatch
                                )} />
                              )}
                              <div
                                className={cn(
                                  "p-2 rounded-full transition-colors",
                                  theme === option.value
                                    ? "bg-primary/20 text-primary"
                                    : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
                                )}
                              >
                                {option.icon}
                              </div>
                              <div>
                                <p className={cn(
                                  "font-medium text-sm",
                                  theme === option.value ? "text-primary" : "text-foreground"
                                )}>
                                  {option.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <span className="font-medium text-primary">Note:</span> Theme changes are applied instantly and saved to your profile.
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </>
              )}

              {activeSection === "notifications" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage how you receive updates and reminders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <BellRing className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="notifications-toggle" className="text-base font-medium">
                            Enable Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates and important messages
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="notifications-toggle"
                        checked={notificationSettings.enabled}
                        onCheckedChange={handleNotificationChange("enabled")}
                      />
                    </div>

                    {/* AI Response Notifications */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted/50">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">AI Responses</Label>
                          <p className="text-xs text-muted-foreground">Get notified when Angel responds to you</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.aiResponses}
                        onCheckedChange={handleNotificationChange("aiResponses")}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>

                    {/* System Updates */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted/50">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">System Updates</Label>
                          <p className="text-xs text-muted-foreground">Important updates and announcements</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={handleNotificationChange("systemUpdates")}
                        disabled={!notificationSettings.enabled}
                      />
                    </div>

                    {/* Info Note */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <span className="font-medium text-primary">Note:</span> Notification preferences are saved locally and applied immediately.
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </>
              )}

              {activeSection === "privacy" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      {t("settings.privacy.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.privacy.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <PrivacySettings />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
                        <User className="h-12 w-12 opacity-50" />
                        <p>{t("settings.privacy.signIn")}</p>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {activeSection === "sound" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-primary" />
                      {t("settings.sound.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.sound.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Reduced Motion Warning */}
                    {prefersReducedMotion && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{t("settings.sound.reducedMotion")}</span>
                        </p>
                      </div>
                    )}

                    {/* Ambient Sounds */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-base font-medium">
                            {t("settings.sound.ambient")}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {t("settings.sound.ambientDesc")}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={soundSettings.ambientSounds}
                        onCheckedChange={(checked) => updateSoundSetting("ambientSounds", checked)}
                        disabled={prefersReducedMotion}
                      />
                    </div>

                    {/* Notification Sounds */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted/50">
                          <BellDot className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            {t("settings.sound.notification")}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {t("settings.sound.notificationDesc")}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={soundSettings.notificationSounds}
                        onCheckedChange={(checked) => updateSoundSetting("notificationSounds", checked)}
                        disabled={prefersReducedMotion}
                      />
                    </div>

                    {/* Meditation Audio */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted/50">
                          <Headphones className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-foreground">
                            {t("settings.sound.meditation")}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {t("settings.sound.meditationDesc")}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={soundSettings.meditationAudio}
                        onCheckedChange={(checked) => updateSoundSetting("meditationAudio", checked)}
                        disabled={prefersReducedMotion}
                      />
                    </div>

                    {/* Ambient Sound Player - only show when ambient sounds are enabled */}
                    {soundSettings.ambientSounds && !prefersReducedMotion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-border/50"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">{t("settings.sound.ambientPlayer")}</Label>
                          </div>
                          <AmbientSoundPlayer />
                        </div>
                      </motion.div>
                    )}

                    <Separator className="my-4" />

                    {/* Light Burst Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <Label className="text-sm font-medium">Hiệu Ứng Bùng Nổ Ánh Sáng</Label>
                      </div>

                      {/* Light Burst Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted/50">
                            <Sparkles className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-foreground">
                              Bật Hiệu Ứng
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Hiển thị ánh sáng bùng nổ khi nhấp chuột
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={lightBurstSettings.enabled}
                          onCheckedChange={(checked) => updateLightBurstSetting("enabled", checked)}
                        />
                      </div>

                      {/* Light Burst Sound */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-muted/50">
                            <Volume2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-foreground">
                              Âm Thanh
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Phát âm thanh nhẹ nhàng khi bùng nổ
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={lightBurstSettings.soundEnabled}
                          onCheckedChange={(checked) => updateLightBurstSetting("soundEnabled", checked)}
                          disabled={!lightBurstSettings.enabled}
                        />
                      </div>

                      {/* Color Selection */}
                      {lightBurstSettings.enabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3"
                        >
                          <Label className="text-sm font-medium">Màu Sắc Ánh Sáng</Label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {(Object.keys(LIGHT_BURST_COLORS) as Array<keyof typeof LIGHT_BURST_COLORS>).map((colorKey) => {
                              const colorInfo = LIGHT_BURST_COLORS[colorKey];
                              const isSelected = lightBurstSettings.color === colorKey;
                              const bgStyle = colorKey === 'rainbow' 
                                ? 'linear-gradient(135deg, hsl(0, 100%, 70%), hsl(60, 100%, 70%), hsl(120, 100%, 70%), hsl(180, 100%, 70%), hsl(240, 100%, 70%), hsl(300, 100%, 70%))'
                                : `hsl(${colorInfo.hue}, 100%, 75%)`;
                              
                              return (
                                <button
                                  key={colorKey}
                                  onClick={() => updateLightBurstSetting("color", colorKey)}
                                  className={cn(
                                    "p-3 rounded-xl border text-center transition-all duration-200",
                                    isSelected
                                      ? "border-primary shadow-md scale-105"
                                      : "border-border/50 hover:border-primary/30"
                                  )}
                                >
                                  <div
                                    className="w-8 h-8 rounded-full mx-auto mb-2 shadow-lg"
                                    style={{ background: bgStyle }}
                                  />
                                  <span className="text-xs font-medium">{colorInfo.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Size Selection */}
                          <div className="mt-4">
                            <Label className="text-sm font-medium mb-3 block">Kích Thước Hiệu Ứng</Label>
                            <div className="flex gap-2">
                              {(Object.keys(LIGHT_BURST_SIZES) as Array<LightBurstSize>).map((sizeKey) => {
                                const sizeInfo = LIGHT_BURST_SIZES[sizeKey];
                                const isSelected = lightBurstSettings.size === sizeKey;
                                
                                return (
                                  <button
                                    key={sizeKey}
                                    onClick={() => updateLightBurstSetting("size", sizeKey)}
                                    className={cn(
                                      "flex-1 p-3 rounded-xl border text-center transition-all duration-200",
                                      isSelected
                                        ? "border-primary bg-primary/10 shadow-md"
                                        : "border-border/50 hover:border-primary/30 bg-card/30"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-6 h-6 rounded-full mx-auto mb-2 bg-primary/20 flex items-center justify-center transition-transform",
                                      sizeKey === 'small' && "scale-75",
                                      sizeKey === 'large' && "scale-125"
                                    )}>
                                      <span className="text-xs font-bold text-primary">{sizeInfo.icon}</span>
                                    </div>
                                    <span className="text-xs font-medium">{sizeInfo.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Effect Type Selection */}
                          <div className="mt-4">
                            <Label className="text-sm font-medium mb-3 block">Kiểu Hiệu Ứng</Label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {(Object.keys(LIGHT_BURST_EFFECTS) as Array<LightBurstEffect>).map((effectKey) => {
                                const effectInfo = LIGHT_BURST_EFFECTS[effectKey];
                                const isSelected = lightBurstSettings.effect === effectKey;
                                
                                return (
                                  <button
                                    key={effectKey}
                                    onClick={() => updateLightBurstSetting("effect", effectKey)}
                                    className={cn(
                                      "p-3 rounded-xl border text-center transition-all duration-200",
                                      isSelected
                                        ? "border-primary bg-primary/10 shadow-md scale-105"
                                        : "border-border/50 hover:border-primary/30 bg-card/30"
                                    )}
                                  >
                                    <div className="text-2xl mb-1">{effectInfo.emoji}</div>
                                    <span className="text-xs font-medium">{effectInfo.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </>
              )}

              {activeSection === "language" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="h-5 w-5 text-primary" />
                      {t("settings.language.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.language.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Language Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">{t("settings.language.select")}</Label>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {languageOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setLanguage(option.value)}
                            className={cn(
                              "p-4 rounded-xl border text-left transition-all duration-200 group",
                              language === option.value
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{option.flag}</span>
                              <span className={cn(
                                "font-medium",
                                language === option.value ? "text-primary" : "text-foreground"
                              )}>
                                {option.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <span className="font-medium text-primary">{t("common.note")}</span> {t("settings.language.note")}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
