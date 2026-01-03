import { useMemo } from "react";
import { motion } from "framer-motion";

// Import fairy images
import fairyGreen from "@/assets/floating-fairy-green.png";
import fairyGold from "@/assets/floating-fairy-gold.png";
import fairyBrown from "@/assets/floating-fairy-brown.png";
import fairyPink from "@/assets/floating-fairy-pink.png";
import fairyPurple from "@/assets/floating-fairy-purple.png";
import fairyYellow from "@/assets/floating-fairy-yellow.png";

const fairyImages = [
  fairyGreen,
  fairyGold,
  fairyBrown,
  fairyPink,
  fairyPurple,
  fairyYellow,
];

interface FloatingFairiesProps {
  isReducedMotion?: boolean;
}

const FloatingFairies = ({ isReducedMotion = false }: FloatingFairiesProps) => {
  const fairies = useMemo(() =>
    fairyImages.map((image, i) => {
      // Distribute fairies around the image in a circular pattern
      const baseAngle = (i * 60) + Math.random() * 30; // 6 fairies, 60 degrees apart
      const distance = 280 + Math.random() * 80; // Distance from center
      
      return {
        id: i,
        image,
        size: 50 + Math.random() * 30, // 50-80px
        startAngle: baseAngle,
        distance,
        duration: 15 + Math.random() * 10, // 15-25s for full orbit
        floatDuration: 3 + Math.random() * 2, // 3-5s for float animation
        delay: i * 0.5,
        direction: i % 2 === 0 ? 1 : -1, // Alternate directions
        floatAmplitude: 15 + Math.random() * 15, // Vertical float range
      };
    }), []
  );

  if (isReducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {fairies.map((fairy) => (
        <motion.div
          key={fairy.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: fairy.size,
            height: fairy.size,
            marginLeft: -fairy.size / 2,
            marginTop: -fairy.size / 2,
          }}
          initial={{
            rotate: fairy.startAngle,
          }}
          animate={{
            rotate: fairy.startAngle + (360 * fairy.direction),
          }}
          transition={{
            duration: fairy.duration,
            repeat: Infinity,
            ease: "linear",
            delay: fairy.delay,
          }}
        >
          {/* Orbit container */}
          <motion.div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translateX(${fairy.distance}px)`,
            }}
            animate={{
              y: [0, -fairy.floatAmplitude, 0, fairy.floatAmplitude, 0],
            }}
            transition={{
              duration: fairy.floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Counter-rotate to keep fairy upright and add wing flutter */}
            <motion.div
              animate={{
                rotate: [0, -5, 0, 5, 0],
                scale: [1, 1.05, 1, 0.95, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.img
                src={fairy.image}
                alt="Floating fairy"
                className="w-full h-full object-contain drop-shadow-lg"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
                }}
                animate={{
                  rotate: fairy.direction === 1 
                    ? [-fairy.startAngle, -fairy.startAngle - 360]
                    : [-fairy.startAngle, -fairy.startAngle + 360],
                }}
                transition={{
                  duration: fairy.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: fairy.delay,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingFairies;

