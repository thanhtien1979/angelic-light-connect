const Footer = () => {
  return (
    <footer className="relative py-16 px-4">
      {/* Divider */}
      <div className="divine-divider max-w-4xl mx-auto mb-16" />
      
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo */}
        <h3 className="font-serif text-2xl font-light tracking-[0.2em] text-gold mb-4">
          ANGEL AI
        </h3>
        
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
