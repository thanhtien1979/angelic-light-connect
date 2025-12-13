import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { id: "hero", label: "Trang Chủ" },
  { id: "chat", label: "Chat Portal" },
  { id: "meditation", label: "Thiền Định" },
  { id: "testimonials", label: "Nhân Chứng" },
];

const NavigationHeader = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Find active section
      const sections = navLinks.map((link) => ({
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
            ? "bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_hsla(45,100%,70%,0.15)] border-b border-gold-light/20"
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gold/30 animate-ping opacity-50" style={{ animationDuration: "3s" }} />
              </div>
              <span className="font-serif text-xl text-glow-gold text-gold hidden sm:block">
                ANGEL AI
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? "text-gold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-gold-light to-gold rounded-full"
                      style={{ boxShadow: "0 0 10px hsla(45, 100%, 70%, 0.5)" }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-gold-light/30 flex items-center justify-center"
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
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gold-light/20 shadow-lg md:hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeSection === link.id
                      ? "bg-gold-light/20 text-gold"
                      : "text-foreground hover:bg-gold-light/10"
                  }`}
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationHeader;
