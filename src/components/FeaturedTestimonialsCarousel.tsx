import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star, Sparkles, Heart } from "lucide-react";
import { Testimonial } from "@/hooks/useTestimonials";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeaturedTestimonialsCarouselProps {
  testimonials: Testimonial[];
  onLike: (id: string) => void;
  userLikes: Set<string>;
}

const FeaturedTestimonialsCarousel = ({
  testimonials,
  onLike,
  userLikes,
}: FeaturedTestimonialsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (testimonials.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Section header */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-gold" />
        <h2 className="font-serif text-2xl text-center text-foreground">Nhân chứng nổi bật</h2>
        <Sparkles className="w-5 h-5 text-gold" />
      </div>

      <div className="relative">
        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {testimonials.map((testimonial, index) => {
              const isLiked = userLikes.has(testimonial.id);
              return (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_80%] md:flex-[0_0_60%] lg:flex-[0_0_50%] px-4"
                >
                  <motion.div
                    className={`relative bg-gradient-to-br from-primary/5 via-gold/5 to-primary/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 p-8 ${
                      selectedIndex === index 
                        ? "border-primary/50 shadow-lg shadow-primary/20 scale-100" 
                        : "border-border/30 scale-95 opacity-70"
                    }`}
                  >
                    {/* Featured badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-gold to-primary rounded-full text-xs font-medium text-primary-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Nổi bật
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-4 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                      ))}
                    </div>

                    {/* Testimony */}
                    <p className="text-foreground text-center font-serif italic text-lg leading-relaxed mb-6">
                      "{testimonial.testimony.length > 150 
                        ? testimonial.testimony.slice(0, 150) + "..." 
                        : testimonial.testimony}"
                    </p>

                    {/* Image if exists */}
                    {testimonial.image_url && (
                      <div className="mb-6 rounded-xl overflow-hidden max-w-[200px] mx-auto">
                        <img 
                          src={testimonial.image_url} 
                          alt="Testimonial" 
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    {/* Author */}
                    <div className="flex items-center justify-center gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/30">
                        <AvatarImage src={testimonial.profile?.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-gold/30 text-foreground">
                          {getInitials(testimonial.profile?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-medium text-foreground">
                          {testimonial.profile?.display_name || "Linh hồn ẩn danh"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Người tìm kiếm ánh sáng
                        </p>
                      </div>
                    </div>

                    {/* Like button */}
                    <div className="flex justify-center mt-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLike(testimonial.id)}
                        className={`gap-2 transition-all ${
                          isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        }`}
                      >
                        <motion.div
                          animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                        </motion.div>
                        <span className="font-medium">{testimonial.likes_count}</span>
                      </Button>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex bg-background/80 backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex bg-background/80 backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                selectedIndex === index 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedTestimonialsCarousel;
