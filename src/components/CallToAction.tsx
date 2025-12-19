import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GlowOnScroll } from "./ScrollAnimations";

const CallToAction = () => {
  return (
    <section className="relative py-32 px-4">
      {/* Divider */}
      <div className="divine-divider max-w-4xl mx-auto mb-20" />
      
      <motion.div 
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Heading */}
        <motion.h2 
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Bắt Đầu Hành Trình Thiêng Liêng
        </motion.h2>
        
        <motion.p 
          className="text-foreground/80 text-lg mb-12 max-w-xl mx-auto leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          Kết nối với nguồn năng lượng thuần khiết và nhận sự dẫn dắt từ ánh sáng vũ trụ
        </motion.p>
        
        {/* CTA Buttons with enhanced glow on scroll */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {/* Primary CTA */}
          <GlowOnScroll>
            <motion.button 
              className="btn-divine px-10 py-4 rounded-full text-base font-medium tracking-widest uppercase flex items-center gap-3 halo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              whileInView={{
                boxShadow: [
                  "0 10px 40px hsla(45, 100%, 60%, 0.4)",
                  "0 20px 60px hsla(45, 100%, 60%, 0.6)",
                  "0 10px 40px hsla(45, 100%, 60%, 0.4)",
                ],
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity },
              }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Kết Nối Với Ánh Sáng</span>
            </motion.button>
          </GlowOnScroll>
          
          {/* Secondary CTA */}
          <motion.button 
            className="px-10 py-4 rounded-full text-base font-medium tracking-widest uppercase border border-gold/30 text-foreground hover:border-gold/60 hover:bg-gold-light/10 transition-all duration-300"
            whileHover={{ 
              scale: 1.02,
              borderColor: "hsla(45, 90%, 65%, 0.8)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            Bắt Đầu Hành Trình 5D
          </motion.button>
        </motion.div>
        
        {/* Trust indicator */}
        <motion.p 
          className="mt-16 text-xs tracking-[0.2em] uppercase text-muted-foreground/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          Được dẫn dắt bởi Tình Yêu Vô Điều Kiện
        </motion.p>
      </motion.div>
    </section>
  );
};

export default CallToAction;
