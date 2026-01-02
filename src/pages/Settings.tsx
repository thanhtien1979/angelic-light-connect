import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Palette, Bell, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import AngelStyleGallery from "@/components/AngelPresence/AngelStyleGallery";
import { useAngelPresence } from "@/hooks/useAngelPresence";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NavigationHeader from "@/components/NavigationHeader";

type SettingsSection = "angel" | "appearance" | "notifications" | "privacy";

const Settings = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>("angel");
  const {
    isEnabled: angelEnabled,
    style: angelStyle,
    sparklesEnabled,
    trailEnabled,
    toggle: toggleAngel,
    setStyle,
    setSparklesEnabled,
    setTrailEnabled,
  } = useAngelPresence();

  const sections = [
    {
      id: "angel" as const,
      label: "Angel Presence",
      icon: Sparkles,
      description: "Customize your angelic companion",
    },
    {
      id: "appearance" as const,
      label: "Appearance",
      icon: Palette,
      description: "Theme and display preferences",
    },
    {
      id: "notifications" as const,
      label: "Notifications",
      icon: Bell,
      description: "Manage your notifications",
    },
    {
      id: "privacy" as const,
      label: "Privacy",
      icon: Shield,
      description: "Privacy and security settings",
    },
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
              <h1 className="text-3xl font-light text-foreground">Settings</h1>
              <p className="text-muted-foreground">Personalize your sacred experience</p>
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
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Angel Presence
                    </CardTitle>
                    <CardDescription>
                      Customize your gentle angelic companion that follows you across the site
                    </CardDescription>
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
                          sparklesEnabled={sparklesEnabled}
                          trailEnabled={trailEnabled}
                          onSparklesChange={setSparklesEnabled}
                          onTrailChange={setTrailEnabled}
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
                  <CardContent>
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <p>Theme settings coming soon...</p>
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
                  <CardContent>
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <p>Notification settings coming soon...</p>
                    </div>
                  </CardContent>
                </>
              )}

              {activeSection === "privacy" && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Privacy
                    </CardTitle>
                    <CardDescription>
                      Control your privacy and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <p>Privacy settings coming soon...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-4">
                        <User className="h-12 w-12 opacity-50" />
                        <p>Sign in to manage privacy settings</p>
                      </div>
                    )}
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
