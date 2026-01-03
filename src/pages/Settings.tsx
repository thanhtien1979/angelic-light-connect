import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Palette, Bell, Shield, Sparkles, Sun, Moon, Monitor, MessageSquare, Info, BellRing, Volume2, VolumeX, Languages, Globe, Music, BellDot, Headphones } from "lucide-react";
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
import { ResetConfirmDialog } from "@/components/AngelPresence/ResetConfirmDialog";

type SettingsSection = "angel" | "appearance" | "notifications" | "privacy" | "sound" | "language";
type ThemeOption = "light" | "dark" | "system";

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
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("angel");
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

  const handleThemeChange = async (newTheme: ThemeOption) => {
    setTheme(newTheme);
    await syncTheme(newTheme);
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

  const themeOptions: { value: ThemeOption; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: "light",
      label: t("settings.appearance.light"),
      icon: <Sun className="w-5 h-5" />,
      description: t("settings.appearance.lightDesc"),
    },
    {
      value: "dark",
      label: t("settings.appearance.dark"),
      icon: <Moon className="w-5 h-5" />,
      description: t("settings.appearance.darkDesc"),
    },
    {
      value: "system",
      label: t("settings.appearance.system"),
      icon: <Monitor className="w-5 h-5" />,
      description: t("settings.appearance.systemDesc"),
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                              <div
                                className={cn(
                                  "p-3 rounded-full transition-colors",
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
                                <p className="text-xs text-muted-foreground mt-1">
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
