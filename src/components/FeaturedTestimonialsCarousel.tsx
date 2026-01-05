import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star, Sparkles, Heart, MessageCircle, Eye, TrendingUp, Users, Award, Zap } from "lucide-react";
import { Testimonial } from "@/hooks/useTestimonials";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TestimonialReactions from "@/components/TestimonialReactions";
import TestimonialComments from "@/components/TestimonialComments";
import TestimonialShareDialog from "@/components/TestimonialShareDialog";
import TestimonialVideoPlayer from "@/components/TestimonialVideoPlayer";

interface FeaturedTestimonialsCarouselProps {
  testimonials: Testimonial[];
  onLike: (id: string) => void;
  userLikes: Set<string>;
  fetchComments?: (testimonialId: string) => Promise<any[]>;
  addComment?: (testimonialId: string, content: string) => Promise<boolean>;
  deleteComment?: (commentId: string) => Promise<boolean>;
}

const FeaturedTestimonialsCarousel = ({
  testimonials,
  onLike,
  userLikes,
  fetchComments,
  addComment,
  deleteComment,
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
    }, 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Calculate total stats
  const totalStats = {
    totalLikes: testimonials.reduce((sum, t) => sum + t.likes_count, 0),
    totalComments: testimonials.reduce((sum, t) => sum + t.comments_count, 0),
    totalTestimonials: testimonials.length,
  };

  if (testimonials.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Section header with stats */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-gold" />
          </motion.div>
          <h2 className="font-serif text-3xl text-foreground font-bold">Nhân chứng nổi bật</h2>
          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-gold" />
          </motion.div>
        </div>
        
        {/* Real-time stats bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold/10 to-primary/10 border border-gold/20">
            <Award className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">{totalStats.totalTestimonials} nổi bật</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-foreground">{totalStats.totalLikes} lượt thích</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">{totalStats.totalComments} bình luận</span>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        {/* Carousel */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {testimonials.map((testimonial, index) => {
              const isLiked = userLikes.has(testimonial.id);
              const isSelected = selectedIndex === index;
              const name = testimonial.profile?.display_name || "Linh hồn ẩn danh";
              
              return (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_85%] md:flex-[0_0_70%] lg:flex-[0_0_55%] px-4"
                >
                  <motion.div
                    animate={{
                      scale: isSelected ? 1 : 0.92,
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    {/* Glowing border effect for selected */}
                    {isSelected && (
                      <motion.div
                        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-gold via-primary to-gold opacity-50 blur-md"
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ backgroundSize: "200% 200%" }}
                      />
                    )}
                    
                    <div className={`relative bg-gradient-to-br from-card via-card/95 to-primary/5 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 p-6 ${
                      isSelected 
                        ? "border-gold/50 shadow-2xl shadow-gold/20" 
                        : "border-border/30"
                    }`}>
                      {/* Featured badge with animation */}
                      <motion.div 
                        className="absolute -top-4 left-1/2 -translate-x-1/2"
                        animate={isSelected ? { y: [0, -3, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="px-5 py-1.5 bg-gradient-to-r from-gold via-primary to-gold rounded-full text-xs font-bold text-primary-foreground flex items-center gap-1.5 shadow-lg shadow-gold/30">
                          <Zap className="w-3 h-3" />
                          <span>NỔI BẬT</span>
                          <Zap className="w-3 h-3" />
                        </div>
                      </motion.div>

                      {/* Stats badges */}
                      <div className="flex justify-center gap-3 mt-4 mb-4">
                        <Badge variant="secondary" className="gap-1 bg-red-500/10 text-red-500 border-red-500/20">
                          <Heart className="w-3 h-3 fill-current" />
                          {testimonial.likes_count}
                        </Badge>
                        <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <MessageCircle className="w-3 h-3" />
                          {testimonial.comments_count}
                        </Badge>
                      </div>

                      {/* Stars */}
                      <div className="flex justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={isSelected ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                          >
                            <Star className="w-5 h-5 fill-gold text-gold drop-shadow-sm" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Testimony */}
                      <p className="text-foreground text-center font-serif italic text-lg leading-relaxed mb-5">
                        "{testimonial.testimony.length > 200 
                          ? testimonial.testimony.slice(0, 200) + "..." 
                          : testimonial.testimony}"
                      </p>

                      {/* Video if exists */}
                      {testimonial.video_url && (
                        <div className="mb-5">
                          <TestimonialVideoPlayer 
                            videoUrl={testimonial.video_url}
                            className="h-48 rounded-xl"
                          />
                        </div>
                      )}

                      {/* Image if exists */}
                      {testimonial.image_url && !testimonial.video_url && (
                        <div className="mb-5 rounded-xl overflow-hidden max-w-[280px] mx-auto shadow-lg">
                          <img 
                            src={testimonial.image_url} 
                            alt="Testimonial" 
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Author */}
                      <div className="flex items-center justify-center gap-4 mb-5">
                        <div className="relative">
                          <Avatar className="w-14 h-14 ring-2 ring-gold/50 shadow-lg">
                            <AvatarImage src={testimonial.profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-gold/30 to-primary/30 text-foreground font-bold">
                              {getInitials(testimonial.profile?.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <motion.div 
                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground text-lg">
                            {name}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-gold" />
                            Người truyền cảm hứng
                          </p>
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="mb-4">
                        <TestimonialReactions testimonialId={testimonial.id} />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          {/* Like button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onLike(testimonial.id)}
                            className={`gap-1.5 transition-all ${
                              isLiked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                            }`}
                          >
                            <motion.div
                              animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                            </motion.div>
                            <span className="font-bold">{testimonial.likes_count}</span>
                          </Button>

                          {/* Comments */}
                          {fetchComments && addComment && deleteComment && (
                            <TestimonialComments
                              testimonialId={testimonial.id}
                              commentsCount={testimonial.comments_count}
                              testimonialOwnerId={testimonial.user_id}
                              fetchComments={fetchComments}
                              addComment={addComment}
                              deleteComment={deleteComment}
                            />
                          )}
                        </div>

                        {/* Share */}
                        <TestimonialShareDialog
                          testimony={testimonial.testimony}
                          authorName={name}
                          avatarUrl={testimonial.profile?.avatar_url || null}
                          likesCount={testimonial.likes_count}
                          imageUrl={testimonial.image_url}
                        />
                      </div>
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 hidden md:flex bg-background/90 backdrop-blur-sm border-gold/30 hover:border-gold hover:bg-gold/10 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 hidden md:flex bg-background/90 backdrop-blur-sm border-gold/30 hover:border-gold hover:bg-gold/10 shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Dots with animation */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                selectedIndex === index 
                  ? "bg-gradient-to-r from-gold to-primary w-8" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedTestimonialsCarousel;
