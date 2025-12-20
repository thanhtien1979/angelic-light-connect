import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sticker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Sticker data organized by categories
export const STICKER_PACKS = {
  love: {
    name: 'Tình yêu',
    icon: '💕',
    stickers: [
      { id: 'love_1', emoji: '💖', label: 'Trái tim hồng' },
      { id: 'love_2', emoji: '💝', label: 'Trái tim quà tặng' },
      { id: 'love_3', emoji: '💘', label: 'Mũi tên cupid' },
      { id: 'love_4', emoji: '💗', label: 'Trái tim lớn' },
      { id: 'love_5', emoji: '💓', label: 'Trái tim đập' },
      { id: 'love_6', emoji: '💞', label: 'Xoay trái tim' },
      { id: 'love_7', emoji: '💕', label: 'Hai trái tim' },
      { id: 'love_8', emoji: '❤️‍🔥', label: 'Tim cháy' },
      { id: 'love_9', emoji: '🥰', label: 'Mặt yêu' },
      { id: 'love_10', emoji: '😍', label: 'Mắt tim' },
      { id: 'love_11', emoji: '😘', label: 'Thơm' },
      { id: 'love_12', emoji: '💋', label: 'Nụ hôn' },
    ],
  },
  cute: {
    name: 'Dễ thương',
    icon: '🐱',
    stickers: [
      { id: 'cute_1', emoji: '🐱', label: 'Mèo' },
      { id: 'cute_2', emoji: '🐶', label: 'Chó' },
      { id: 'cute_3', emoji: '🐰', label: 'Thỏ' },
      { id: 'cute_4', emoji: '🐻', label: 'Gấu' },
      { id: 'cute_5', emoji: '🦊', label: 'Cáo' },
      { id: 'cute_6', emoji: '🐼', label: 'Gấu trúc' },
      { id: 'cute_7', emoji: '🐨', label: 'Koala' },
      { id: 'cute_8', emoji: '🦋', label: 'Bướm' },
      { id: 'cute_9', emoji: '🌸', label: 'Hoa anh đào' },
      { id: 'cute_10', emoji: '🌺', label: 'Hoa dâm bụt' },
      { id: 'cute_11', emoji: '🌷', label: 'Hoa tulip' },
      { id: 'cute_12', emoji: '✨', label: 'Lấp lánh' },
    ],
  },
  fun: {
    name: 'Vui vẻ',
    icon: '😂',
    stickers: [
      { id: 'fun_1', emoji: '😂', label: 'Cười lớn' },
      { id: 'fun_2', emoji: '🤣', label: 'Lăn lộn cười' },
      { id: 'fun_3', emoji: '😜', label: 'Nháy mắt' },
      { id: 'fun_4', emoji: '🤪', label: 'Crazy' },
      { id: 'fun_5', emoji: '😎', label: 'Cool' },
      { id: 'fun_6', emoji: '🥳', label: 'Tiệc' },
      { id: 'fun_7', emoji: '🎉', label: 'Ăn mừng' },
      { id: 'fun_8', emoji: '🎊', label: 'Pháo hoa' },
      { id: 'fun_9', emoji: '🎈', label: 'Bóng bay' },
      { id: 'fun_10', emoji: '🎁', label: 'Quà' },
      { id: 'fun_11', emoji: '🎂', label: 'Bánh sinh nhật' },
      { id: 'fun_12', emoji: '🍰', label: 'Bánh ngọt' },
    ],
  },
  spiritual: {
    name: 'Tâm linh',
    icon: '🙏',
    stickers: [
      { id: 'spiritual_1', emoji: '🙏', label: 'Cầu nguyện' },
      { id: 'spiritual_2', emoji: '✝️', label: 'Thánh giá' },
      { id: 'spiritual_3', emoji: '⛪', label: 'Nhà thờ' },
      { id: 'spiritual_4', emoji: '😇', label: 'Thiên thần' },
      { id: 'spiritual_5', emoji: '👼', label: 'Baby angel' },
      { id: 'spiritual_6', emoji: '🕊️', label: 'Bồ câu' },
      { id: 'spiritual_7', emoji: '🌟', label: 'Ngôi sao' },
      { id: 'spiritual_8', emoji: '☀️', label: 'Mặt trời' },
      { id: 'spiritual_9', emoji: '🌈', label: 'Cầu vồng' },
      { id: 'spiritual_10', emoji: '🕯️', label: 'Nến' },
      { id: 'spiritual_11', emoji: '📿', label: 'Chuỗi hạt' },
      { id: 'spiritual_12', emoji: '💫', label: 'Ngôi sao bay' },
    ],
  },
  reactions: {
    name: 'Phản ứng',
    icon: '👍',
    stickers: [
      { id: 'react_1', emoji: '👍', label: 'Like' },
      { id: 'react_2', emoji: '👎', label: 'Dislike' },
      { id: 'react_3', emoji: '👏', label: 'Vỗ tay' },
      { id: 'react_4', emoji: '🙌', label: 'Chúc mừng' },
      { id: 'react_5', emoji: '💪', label: 'Mạnh mẽ' },
      { id: 'react_6', emoji: '🤝', label: 'Bắt tay' },
      { id: 'react_7', emoji: '✌️', label: 'Hòa bình' },
      { id: 'react_8', emoji: '🤞', label: 'May mắn' },
      { id: 'react_9', emoji: '👀', label: 'Nhìn' },
      { id: 'react_10', emoji: '🔥', label: 'Lửa' },
      { id: 'react_11', emoji: '💯', label: '100 điểm' },
      { id: 'react_12', emoji: '⭐', label: 'Sao' },
    ],
  },
};

export interface StickerPickerProps {
  onSelect: (stickerId: string, emoji: string) => void;
}

const StickerPicker = ({ onSelect }: StickerPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('love');

  const handleSelect = (stickerId: string, emoji: string) => {
    onSelect(stickerId, emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-100"
          title="Sticker"
        >
          <Sticker className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 border-rose-200" 
        align="start"
        sideOffset={8}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-rose-100 p-2">
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-transparent">
              {Object.entries(STICKER_PACKS).map(([key, pack]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex-1 min-w-[40px] h-8 data-[state=active]:bg-rose-100 data-[state=active]:text-rose-600"
                  title={pack.name}
                >
                  <span className="text-lg">{pack.icon}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(STICKER_PACKS).map(([key, pack]) => (
            <TabsContent key={key} value={key} className="m-0">
              <ScrollArea className="h-[200px]">
                <div className="p-2">
                  <p className="text-xs text-rose-500 mb-2 font-medium">{pack.name}</p>
                  <div className="grid grid-cols-4 gap-1">
                    <AnimatePresence mode="popLayout">
                      {pack.stickers.map((sticker) => (
                        <motion.button
                          key={sticker.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelect(sticker.id, sticker.emoji)}
                          className="w-full aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-rose-100 transition-colors"
                          title={sticker.label}
                        >
                          {sticker.emoji}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default StickerPicker;