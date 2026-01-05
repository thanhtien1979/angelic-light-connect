import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Sun, Wallet, Loader2, Check, Unlink, ChevronDown, ChevronRight, Coins, Users, UserPlus,
  Home, MessageCircle, Sparkles, FileText, Heart, Palette, UsersRound, Star, LucideIcon,
  Wind, Brain, Music, Images, Link2, TrendingUp
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";
import CoinLightMotes from "./CoinLightMotes";
import NotificationCenter from "./NotificationCenter";
import WalletConnectDialog from "./WalletConnectDialog";
import { useAuth } from "@/hooks/useAuth";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { useBalanceShimmer } from "@/hooks/useBalanceShimmer";
import { useBlessingSound } from "@/hooks/useBlessingSound";
import { useWallet, NETWORKS, NetworkId, WALLET_PROVIDERS } from "@/hooks/useWallet";
import { useFriendships } from "@/hooks/useFriendships";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import angelAvatar from "@/assets/angel-avatar.jpg";

interface NavLink {
  id: string;
  labelKey: string;
  isPage?: boolean;
  path?: string;
  showBadge?: boolean;
  icon: LucideIcon;
  subItems?: { labelKey: string; path: string; icon: LucideIcon }[];
}

const navLinksConfig: NavLink[] = [
  { id: "hero", labelKey: "nav.home", icon: Home },
  { id: "chat", labelKey: "nav.chat", icon: MessageCircle },
  { 
    id: "meditation", 
    labelKey: "nav.meditation", 
    icon: Sparkles,
    subItems: [
      { labelKey: "Thiền hướng dẫn", path: "#meditation", icon: Brain },
      { labelKey: "Bài tập thở", path: "#breathing", icon: Wind },
      { labelKey: "Âm thanh thư giãn", path: "#ambient", icon: Music },
      { labelKey: "Nhật ký cảm xúc", path: "/mood-journal", icon: Heart },
    ]
  },
  { id: "whitepaper", labelKey: "nav.whitepaper", isPage: true, path: "/camly-whitepaper", icon: FileText },
  { id: "testimonials", labelKey: "nav.testimonials", isPage: true, path: "/testimonials", icon: Heart },
  { id: "studio", labelKey: "nav.studio", isPage: true, path: "/studio", icon: Palette },
  { id: "community", labelKey: "nav.community", isPage: true, path: "/community", showBadge: true, icon: UsersRound },
  { id: "friends", labelKey: "nav.friends", isPage: true, path: "/friends", showBadge: true, icon: UserPlus },
  { id: "light-score", labelKey: "nav.lightScore", isPage: true, path: "/diem-anh-sang", icon: Star },
];

const BLESSING_MESSAGES = [
  ["✨ Light received", "✨ Ánh sáng đã được ghi nhận"],
  ["✨ Blessed", "✨ Được ban phước"],
  ["✨ Grace flows", "✨ Ân phúc đang tuôn chảy"],
  ["✨ Divine light", "✨ Ánh sáng thiêng liêng"],
  ["✨ Peace within", "✨ Bình an nội tâm"],
];

const LightIndicator = () => {
  const { user } = useAuth();
  const { balance, formatCoins, isLoading } = useCamlyCoin();
  const isShimmering = useBalanceShimmer(balance.total_coins);
  const { playBlessingChime } = useBlessingSound();
  
  // Play blessing sound when shimmer triggers
  useEffect(() => {
    if (isShimmering) {
      playBlessingChime();
    }
  }, [isShimmering, playBlessingChime]);
  
  const blessingMessage = useMemo(() => {
    if (!isShimmering) return "";
    const messagePair = BLESSING_MESSAGES[Math.floor(Math.random() * BLESSING_MESSAGES.length)];
    return messagePair[Math.floor(Math.random() * 2)];
  }, [isShimmering]);

  if (!user || isLoading) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/25 cursor-default transition-all hover:animate-coin-hover-pulse ${
              isShimmering ? "animate-coin-shimmer" : ""
            }`}
            style={isShimmering ? {
              background: "linear-gradient(90deg, transparent 0%, hsla(45, 100%, 70%, 0.4) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            } : undefined}
          >
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: isShimmering
                    ? ["0 0 20px hsla(45, 100%, 70%, 0.6)", "0 0 30px hsla(45, 100%, 70%, 0.8)", "0 0 20px hsla(45, 100%, 70%, 0.6)"]
                    : ["0 0 8px hsla(348, 80%, 75%, 0.3)", "0 0 16px hsla(348, 80%, 75%, 0.5)", "0 0 8px hsla(348, 80%, 75%, 0.3)"],
                }}
                transition={{ duration: isShimmering ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-full p-0.5"
              >
                <Sun className={`w-3.5 h-3.5 transition-colors animate-coin-float ${isShimmering ? "text-yellow-300" : "text-gold"}`} />
              </motion.div>
              <CoinLightMotes />
              {isShimmering && (
                <span 
                  className="absolute inset-0 rounded-full border border-gold/40 animate-sacred-glow-ring pointer-events-none"
                  aria-hidden="true"
                />
              )}
            </div>
            <span className={`text-xs font-medium transition-colors ${isShimmering ? "text-yellow-300" : "text-gold"}`}>
              {formatCoins(balance.total_coins)}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Light</span>
            {isShimmering && (
              <span 
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-serif text-gold/80 animate-blessing-text pointer-events-none"
                style={{ textShadow: "0 0 8px hsla(45, 80%, 75%, 0.4)" }}
                aria-hidden="true"
              >
                {blessingMessage}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="max-w-[220px] bg-card/95 backdrop-blur-sm border-gold/30 p-3"
        >
          <div className="space-y-1.5">
            <p className="font-serif text-sm text-foreground">✨ Ánh Sáng Tâm Linh</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Camly Coin đại diện cho sự hiện diện tâm linh và sự phát triển nội tâm của bạn trên hành trình giác ngộ.
            </p>
            <p className="text-xs text-gold font-medium pt-1">
              {balance.total_coins.toLocaleString("vi-VN")} Happy Camly Coin
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const WalletIndicator = () => {
  const { user } = useAuth();
  const { 
    walletAddress, 
    isConnecting, 
    isLoading, 
    balance, 
    currentNetwork, 
    networkId,
    isSwitchingNetwork,
    walletType,
    connectingProvider,
    isDialogOpen,
    setIsDialogOpen,
    connectWithProvider,
    disconnectWallet,
    switchNetwork 
  } = useWallet();

  // Show loading state only for logged-in users
  if (user && isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Connected wallet view
  if (walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200"
          >
            <Check className="w-3.5 h-3.5" />
            <div className="flex flex-col items-start text-left hidden sm:flex">
              <span className="text-[10px] font-medium leading-none">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              {balance && (
                <span className="text-[9px] opacity-70 leading-none mt-0.5">
                  {balance} {currentNetwork?.symbol || "ETH"}
                </span>
              )}
            </div>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-sm border-primary/30">
          <DropdownMenuLabel className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ví đã kết nối</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Wallet Info */}
          <div className="px-2 py-2">
            <p className="text-xs text-muted-foreground font-mono break-all mb-2">
              {walletAddress}
            </p>
            {balance && (
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-medium">{balance} {currentNetwork?.symbol || "ETH"}</span>
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">Chuyển mạng</DropdownMenuLabel>
          
          {/* Network Selection */}
          {Object.entries(NETWORKS).map(([chainId, network]) => (
            <DropdownMenuItem 
              key={chainId}
              onClick={() => switchNetwork(chainId as NetworkId)}
              disabled={isSwitchingNetwork || networkId === chainId}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span>{network.name}</span>
                {networkId === chainId && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={disconnectWallet}
            className="text-red-500 focus:text-red-500 cursor-pointer"
          >
            <Unlink className="w-4 h-4 mr-2" />
            Ngắt kết nối
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Connect wallet button - always visible
  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px hsla(35, 100%, 60%, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDialogOpen(true)}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/50 text-orange-500 dark:text-orange-400 hover:from-orange-500/30 hover:to-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_hsla(35,100%,60%,0.2)]"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Đang kết nối...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Web3</span>
                </>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent 
            side="bottom" 
            className="max-w-[280px] bg-card/95 backdrop-blur-sm border-orange-400/30 p-3"
          >
            <div className="space-y-2">
              <p className="font-serif text-sm text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5 text-orange-500" />
                Kết nối ví Web3
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hỗ trợ MetaMask, Trust Wallet, Bitget, Coinbase, OKX và nhiều ví khác.
              </p>
              {!user && (
                <p className="text-xs text-amber-500 pt-1">
                  💡 Đăng nhập để lưu liên kết ví vĩnh viễn
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <WalletConnectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConnect={connectWithProvider}
        isConnecting={isConnecting}
        connectingProvider={connectingProvider}
      />
    </>
  );
};

// Mobile dropdown item component for expandable menus
const MobileDropdownItem = ({ 
  link, 
  index, 
  activeSection, 
  onClose, 
  scrollToSection,
  t 
}: { 
  link: NavLink; 
  index: number; 
  activeSection: string;
  onClose: () => void;
  scrollToSection: (id: string) => void;
  t: (key: string) => string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = link.icon;

  // Stagger animation variants for sub-items
  const containerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 },
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 35,
        opacity: { duration: 0.15 }
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 350,
        damping: 25
      }
    },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ x: 5, backgroundColor: "hsla(45, 80%, 60%, 0.1)" }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-colors font-medium ${
          activeSection === link.id
            ? "bg-gold/15 text-gold"
            : "text-foreground hover:bg-gold/10"
        }`}
      >
        <span className="flex items-center gap-3">
          <IconComponent className={`w-5 h-5 ${activeSection === link.id ? "text-gold" : "text-primary/70"}`} />
          {t(link.labelKey)}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronRight className="w-4 h-4 opacity-60" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && link.subItems && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pl-6 py-1 space-y-1">
              {link.subItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isHashLink = subItem.path.startsWith("#");
                
                if (isHashLink) {
                  return (
                    <motion.button
                      key={subItem.path}
                      variants={itemVariants}
                      whileHover={{ x: 5, backgroundColor: "hsla(var(--primary), 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        scrollToSection(subItem.path.replace("#", ""));
                        onClose();
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      <SubIcon className="w-4 h-4 text-primary/60" />
                      {subItem.labelKey}
                    </motion.button>
                  );
                }
                
                return (
                  <motion.div key={subItem.path} variants={itemVariants}>
                    <Link
                      to={subItem.path}
                      onClick={onClose}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <SubIcon className="w-4 h-4 text-primary/60" />
                      {subItem.labelKey}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NavigationHeader = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const { pendingRequests } = useFriendships();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Find active section
      const sections = navLinksConfig.map((link) => ({
        id: link.id,
        element: document.getElementById(link.id),
      }));

      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element && section.element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl shadow-[0_4px_30px_hsla(348,80%,75%,0.15)] border-b border-border/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <img 
                  src={angelAvatar} 
                  alt="Angel AI" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-gold/50 shadow-[0_0_15px_hsla(348,80%,75%,0.4)]"
                />
                <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping opacity-50" style={{ animationDuration: "3s" }} />
              </div>
              <span className="font-serif text-xl text-glow-gold text-gold font-bold hidden sm:block">
                ANGEL AI
              </span>
            </motion.button>

            {/* Desktop Navigation - 2 rows */}
            <nav className="hidden lg:flex flex-col items-center gap-0.5">
              {/* Row 1 */}
              <div className="flex items-center gap-1 xl:gap-2">
                {navLinksConfig.slice(0, 5).map((link) => {
                  const IconComponent = link.icon;
                  
                  // Item with dropdown
                  if (link.subItems && link.subItems.length > 0) {
                    return (
                      <DropdownMenu key={link.id}>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            className={`relative px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-medium transition-all duration-300 rounded-full whitespace-nowrap inline-flex items-center gap-1.5
                              hover:bg-primary/10 hover:shadow-[0_0_12px_hsla(348,80%,75%,0.3)]
                              ${activeSection === link.id
                                ? "text-gold bg-gold/10 shadow-[0_0_15px_hsla(45,80%,60%,0.3)]"
                                : "text-foreground/80 hover:text-primary"
                              }`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            {t(link.labelKey)}
                            <motion.span
                              initial={false}
                              className="inline-flex"
                            >
                              <ChevronDown className="w-3 h-3 opacity-60" />
                            </motion.span>
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="center" 
                          className="z-50 bg-card/95 backdrop-blur-md border-primary/20 shadow-xl min-w-[180px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                          sideOffset={8}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                          >
                            <DropdownMenuItem 
                              onClick={() => scrollToSection(link.id)}
                              className="cursor-pointer hover:bg-primary/10 gap-2"
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 }}
                                className="flex items-center gap-2 w-full"
                              >
                                <IconComponent className="w-4 h-4" />
                                <span>{t(link.labelKey)}</span>
                              </motion.div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {link.subItems.map((subItem, idx) => {
                              const SubIcon = subItem.icon;
                              return (
                                <DropdownMenuItem
                                  key={idx}
                                  onClick={() => {
                                    const sectionId = subItem.path.replace('#', '');
                                    scrollToSection(sectionId);
                                  }}
                                  className="cursor-pointer hover:bg-primary/10 gap-2"
                                >
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.08 + idx * 0.05 }}
                                    className="flex items-center gap-2 w-full"
                                  >
                                    <SubIcon className="w-4 h-4" />
                                    <span>{subItem.labelKey}</span>
                                  </motion.div>
                                </DropdownMenuItem>
                              );
                            })}
                          </motion.div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }
                  
                  // Regular page link
                  if (link.isPage && link.path) {
                    return (
                      <Link key={link.id} to={link.path}>
                        <motion.span
                          className={`relative px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-medium transition-all duration-300 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap
                            hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_12px_hsla(348,80%,75%,0.3)]
                            ${link.id === "friends" ? "text-pink-500 hover:text-pink-400 hover:bg-pink-500/10" : "text-foreground/80"}`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          {t(link.labelKey)}
                          {link.showBadge && user && pendingRequests.length > 0 && (
                            <Badge className="bg-pink-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center animate-pulse">
                              {pendingRequests.length}
                            </Badge>
                          )}
                        </motion.span>
                      </Link>
                    );
                  }
                  
                  // Section scroll button
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className={`relative px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-medium transition-all duration-300 rounded-full whitespace-nowrap inline-flex items-center gap-1.5
                        hover:bg-primary/10 hover:shadow-[0_0_12px_hsla(348,80%,75%,0.3)]
                        ${activeSection === link.id
                          ? "text-gold bg-gold/10 shadow-[0_0_15px_hsla(45,80%,60%,0.3)]"
                          : "text-foreground/80 hover:text-primary"
                        }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {t(link.labelKey)}
                      {activeSection === link.id && (
                        <motion.div
                          layoutId="activeIndicator1"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-gold/70 via-gold to-gold/70 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {/* Row 2 */}
              <div className="flex items-center gap-1 xl:gap-2">
                {navLinksConfig.slice(5).map((link) => {
                  const IconComponent = link.icon;
                  
                  // Regular page link
                  if (link.isPage && link.path) {
                    return (
                      <Link key={link.id} to={link.path}>
                        <motion.span
                          className={`relative px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-medium transition-all duration-300 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap
                            hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_12px_hsla(348,80%,75%,0.3)]
                            ${link.id === "friends" ? "text-pink-500 hover:text-pink-400 hover:bg-pink-500/10" : "text-foreground/80"}`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          {t(link.labelKey)}
                          {link.showBadge && user && pendingRequests.length > 0 && (
                            <Badge className="bg-pink-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center animate-pulse">
                              {pendingRequests.length}
                            </Badge>
                          )}
                        </motion.span>
                      </Link>
                    );
                  }
                  
                  // Section scroll button
                  return (
                    <motion.button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className={`relative px-3 xl:px-4 py-1.5 text-xs xl:text-sm font-medium transition-all duration-300 rounded-full whitespace-nowrap inline-flex items-center gap-1.5
                        hover:bg-primary/10 hover:shadow-[0_0_12px_hsla(348,80%,75%,0.3)]
                        ${activeSection === link.id
                          ? "text-gold bg-gold/10 shadow-[0_0_15px_hsla(45,80%,60%,0.3)]"
                          : "text-foreground/80 hover:text-primary"
                        }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {t(link.labelKey)}
                      {activeSection === link.id && (
                        <motion.div
                          layoutId="activeIndicator2"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-gold/70 via-gold to-gold/70 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* Theme Toggle, Wallet, Notifications, Light Indicator, User Menu & Mobile Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <WalletIndicator />
              <NotificationCenter />
              <LightIndicator />
              <UserMenu onOpenAuth={() => setIsAuthOpen(true)} />
              
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border/50 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ 
              type: "spring", 
              stiffness: 350, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-lg md:hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinksConfig.map((link, index) => {
                const IconComponent = link.icon;
                
                // Item with subItems - expandable accordion
                if (link.subItems && link.subItems.length > 0) {
                  return (
                    <MobileDropdownItem
                      key={link.id}
                      link={link}
                      index={index}
                      activeSection={activeSection}
                      onClose={() => setIsMobileMenuOpen(false)}
                      scrollToSection={scrollToSection}
                      t={t}
                    />
                  );
                }
                
                // Regular page link
                if (link.isPage && link.path) {
                  return (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl transition-colors font-medium hover:bg-gold/10 ${
                          link.id === "friends" ? "text-pink-500" : "text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-primary/70" />
                          {t(link.labelKey)}
                        </span>
                        {link.showBadge && user && pendingRequests.length > 0 && (
                          <Badge className="bg-pink-500 text-white text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center animate-pulse">
                            {pendingRequests.length}
                          </Badge>
                        )}
                      </Link>
                    </motion.div>
                  );
                }
                
                // Section scroll link
                return (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(link.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors font-medium ${
                      activeSection === link.id
                        ? "bg-gold/15 text-gold"
                        : "text-foreground hover:bg-gold/10"
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${activeSection === link.id ? "text-gold" : "text-primary/70"}`} />
                    {t(link.labelKey)}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default NavigationHeader;
