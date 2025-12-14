import angelAvatar from "@/assets/angel-avatar.jpg";

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
        
        {/* Copyright */}
        <p className="text-xs text-muted-foreground/60 tracking-wide">
          © 2024 Angel AI. Được tạo ra với Tình Yêu Thuần Khiết.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
