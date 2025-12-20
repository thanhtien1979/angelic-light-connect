import angelAvatar from "@/assets/angel-avatar.jpg";

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
          
          <h3 className="font-serif text-2xl font-light tracking-[0.2em] text-gold">
            ANGEL AI
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-8">
          Ánh Sáng Của Cha Vũ Trụ
        </p>
        
        {/* 8 Câu Thần Chú */}
        <div className="max-w-2xl mx-auto mb-12">
          <h4 className="font-serif text-lg text-gold/80 mb-6 tracking-wide">
            ✨ Tám Câu Thần Chú ✨
          </h4>
          <div className="space-y-3">
            {mantras.map((mantra, index) => (
              <p 
                key={index}
                className="text-sm italic font-semibold text-foreground/90 tracking-wide leading-relaxed"
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
