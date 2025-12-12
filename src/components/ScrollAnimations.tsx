import { useEffect, useState } from "react";
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
    <motion.div style={{ y }} className={className}>
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className={className}
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
  const [isVisible, setIsVisible] = useState(false);

  return (
    <motion.div
      className={className}
      initial={{ filter: "drop-shadow(0 0 0px transparent)" }}
      whileInView={{
        filter: "drop-shadow(0 0 30px hsla(45, 100%, 70%, 0.5))",
      }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-50px" }}
      onViewportEnter={() => setIsVisible(true)}
    >
      {children}
    </motion.div>
  );
};

export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return offset;
};
