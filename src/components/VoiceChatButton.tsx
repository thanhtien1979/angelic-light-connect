import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceChatWithAngel } from './VoiceChatWithAngel';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function VoiceChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-violet-500/40 border-2 border-white/20"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Phone className="w-6 h-6 text-white" />
              </motion.div>
              
              {/* Sparkle effect */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-violet-900/90 border-violet-500/30 text-violet-100">
          <p>🎙️ Nói chuyện với Thiên Thần</p>
        </TooltipContent>
      </Tooltip>

      <VoiceChatWithAngel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
