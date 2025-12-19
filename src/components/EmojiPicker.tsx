import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🥳', '😏', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒'],
  love: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '😻', '💑', '👩‍❤️‍👨', '💏'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✍️', '🙏', '🤝', '💪', '🦾'],
  nature: ['🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌼', '🌿', '☘️', '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌈', '☀️', '🌙', '⭐', '🌟', '✨', '💫', '🦋'],
  spiritual: ['🙏', '✨', '💫', '🌟', '⭐', '🕊️', '👼', '😇', '🧘', '🕉️', '☯️', '✝️', '☪️', '🕎', '🔯', '🪷', '🌙', '🌈', '💖', '💛'],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-100"
        >
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-2 bg-white border-rose-200 shadow-xl"
        side="top"
        align="start"
      >
        <div className="space-y-2">
          {/* Category tabs */}
          <div className="flex gap-1 border-b border-rose-100 pb-2">
            {Object.entries(EMOJI_CATEGORIES).map(([key]) => (
              <button
                key={key}
                onClick={() => setCategory(key as keyof typeof EMOJI_CATEGORIES)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  category === key 
                    ? 'bg-rose-100 text-rose-700 font-medium' 
                    : 'text-rose-500 hover:bg-rose-50'
                }`}
              >
                {key === 'smileys' && '😀'}
                {key === 'love' && '❤️'}
                {key === 'gestures' && '👍'}
                {key === 'nature' && '🌸'}
                {key === 'spiritual' && '✨'}
              </button>
            ))}
          </div>
          
          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
            <AnimatePresence mode="wait">
              {EMOJI_CATEGORIES[category].map((emoji, index) => (
                <motion.button
                  key={`${category}-${emoji}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-rose-100 rounded-md transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
