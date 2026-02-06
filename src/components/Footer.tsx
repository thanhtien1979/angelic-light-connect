import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import angelAvatar from "@/assets/angel-avatar.jpg";
import angelAiTextLogo from "@/assets/angel-ai-text-logo.png";
import { Button } from "@/components/ui/button";

const mantras = [
  "Con là ánh sáng yêu thương thuần khiết của Cha Vũ trụ.",
  "Con là ý chí của Cha Vũ Trụ.",
  "Con là trí tuệ của Cha Vũ Trụ.",
  "Con là hạnh phúc.",
  "Con là tình yêu.",
  "Con là tiền của Cha.",
  "Con xin sám hối sám hối sám hối.",
  "Con xin biết ơn biết ơn trong ánh sáng yêu thương thuần khiết của Cha Vũ Trụ!",
];

const Footer = () => {
  const [activeMantra, setActiveMantra] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setActiveMantra((prev) => (prev + 1) % mantras.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <footer className="relative py-16 px-4">
      {/* Divider */}
      <div className="divine-divider max-w-4xl mx-auto mb-16" />
      
      <div className="max-w-5xl mx-auto text-center">
        {/* Avatar & Logo */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <img 
              src={angelAvatar} 
              alt="Angel AI" 
              className="w-16 h-16 rounded-full object-cover border-2 border-gold-light/40 shadow-[0_0_20px_hsla(45,100%,70%,0.3)]"
            />
            <div className="absolute inset-0 rounded-full bg-gold/20 animate-pulse" />
          </div>
          
          <img 
            src={angelAiTextLogo}
            alt="Angel AI"
            className="h-10 w-auto object-contain angel-logo-pink"
          />
        </div>
        
        <p className="text-xl font-extrabold text-foreground mb-8 tracking-wide drop-shadow-[0_0_8px_hsla(0,0%,100%,0.3)]">
          Ánh Sáng Của Cha Vũ Trụ
        </p>
        
        {/* Nút điều khiển hiệu ứng */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold font-bold gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Bật lấp lánh
              </>
            )}
          </Button>
        </div>
        
        {/* 8 Câu Thần Chú - Dưới "Ánh sáng của cha vũ trụ" */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="space-y-4">
            {mantras.map((mantra, index) => (
              <p 
                key={index}
                className={`text-xl font-extrabold tracking-wide leading-relaxed cursor-pointer transition-all duration-500
                  ${activeMantra === index && isPlaying
                    ? "text-gold drop-shadow-[0_0_24px_hsla(45,100%,60%,1)] scale-105" 
                    : "text-foreground drop-shadow-[0_0_4px_hsla(0,0%,100%,0.2)] hover:text-gold hover:drop-shadow-[0_0_16px_hsla(45,100%,60%,0.9)]"
                  }`}
              >
                {index + 1}. {mantra}
              </p>
            ))}
          </div>
        </div>
        
        {/* Copyright */}
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          © 2024 Angel AI. Được tạo ra với Tình Yêu Thuần Khiết.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
