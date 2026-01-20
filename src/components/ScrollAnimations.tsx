import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxWrapperProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxWrapper = ({ children, speed = 0.5, className = "" }: ParallaxWrapperProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div 
      style={{ y, willChange: "transform" }} 
      className={`${className} backface-hidden`}
    >
      {children}
    </motion.div>
  );
};

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeInSection = ({ children, delay = 0, className = "" }: FadeInSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.4, 0, 0.2, 1] // cubic-bezier for smoother easing
      }}
      viewport={{ once: true, margin: "-80px" }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
};

interface GlowOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const GlowOnScroll = ({ children, className = "" }: GlowOnScrollProps) => {
  return (
    <motion.div
      className={className}
      initial={{ filter: "drop-shadow(0 0 0px transparent)" }}
      whileInView={{
        filter: "drop-shadow(0 0 25px hsla(45, 100%, 70%, 0.4))",
      }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      viewport={{ once: true, margin: "-50px" }}
      style={{ willChange: "filter" }}
    >
      {children}
    </motion.div>
  );
};

// Optimized parallax hook with RAF throttling
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      // Only update if scroll changed significantly (reduces repaints)
      if (Math.abs(currentScrollY - lastScrollY.current) > 1) {
        setOffset(currentScrollY * speed);
        lastScrollY.current = currentScrollY;
      }
      rafRef.current = undefined;
    });
  }, [speed]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  return offset;
};
