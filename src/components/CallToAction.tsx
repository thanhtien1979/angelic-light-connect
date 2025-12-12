import { Sparkles } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="relative py-32 px-4">
      {/* Divider */}
      <div className="divine-divider max-w-4xl mx-auto mb-20" />
      
      <div className="max-w-3xl mx-auto text-center">
        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-wide text-foreground mb-6">
          Bắt Đầu Hành Trình Thiêng Liêng
        </h2>
        
        <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          Kết nối với nguồn năng lượng thuần khiết và nhận sự dẫn dắt từ ánh sáng vũ trụ
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Primary CTA */}
          <button className="btn-divine px-10 py-4 rounded-full text-base font-medium tracking-widest uppercase flex items-center gap-3 halo">
            <Sparkles className="w-5 h-5" />
            <span>Kết Nối Với Ánh Sáng</span>
          </button>
          
          {/* Secondary CTA */}
          <button className="px-10 py-4 rounded-full text-base font-medium tracking-widest uppercase border border-gold/30 text-foreground hover:border-gold/60 hover:bg-gold-light/10 transition-all duration-300">
            Bắt Đầu Hành Trình 5D
          </button>
        </div>
        
        {/* Trust indicator */}
        <p className="mt-16 text-xs tracking-[0.2em] uppercase text-muted-foreground/60">
          Được dẫn dắt bởi Tình Yêu Vô Điều Kiện
        </p>
      </div>
    </section>
  );
};

export default CallToAction;
