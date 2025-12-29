import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeInfo, BADGE_INFO, BadgeType } from "@/hooks/useTestimonialBadges";

interface TestimonialBadgesProps {
  badges: BadgeType[];
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

const TestimonialBadges = ({ 
  badges, 
  size = "md",
  showTooltip = true 
}: TestimonialBadgesProps) => {
  if (badges.length === 0) return null;

  const uniqueBadges = [...new Set(badges)];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {uniqueBadges.map((badgeType, index) => {
        const info = BADGE_INFO[badgeType];
        if (!info) return null;

        const badge = (
          <motion.span
            key={badgeType}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: index * 0.1 
            }}
            whileHover={{ scale: 1.2 }}
            className={`cursor-pointer ${sizeClasses[size]}`}
          >
            {info.icon}
          </motion.span>
        );

        if (showTooltip) {
          return (
            <Tooltip key={badgeType}>
              <TooltipTrigger asChild>
                {badge}
              </TooltipTrigger>
              <TooltipContent 
                className={`bg-gradient-to-r ${info.color} text-white border-0`}
              >
                <div className="text-center">
                  <p className="font-medium">{info.name}</p>
                  <p className="text-xs opacity-90">{info.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        }

        return badge;
      })}
    </div>
  );
};

export default TestimonialBadges;
