import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Sparkles, Heart, MessageCircle, Users, 
  TrendingUp, Star, Filter, Grid, List
} from "lucide-react";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { useTestimonialTags, TestimonialTag } from "@/hooks/useTestimonialTags";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import TestimonialComments from "@/components/TestimonialComments";
import TestimonialReactions from "@/components/TestimonialReactions";
import TestimonialVideoPlayer from "@/components/TestimonialVideoPlayer";
import TestimonialShareDialog from "@/components/TestimonialShareDialog";

const TestimonialCategory = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { tags, isLoading: tagsLoading } = useTestimonialTags();
  const { 
    testimonials, 
    isLoading,
    toggleLike,
    userLikes,
    fetchComments,
    addComment,
    deleteComment,
  } = useTestimonials();

  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Decode category name from URL
  const decodedCategory = categoryName ? decodeURIComponent(categoryName) : "";

  // Find current tag
  const currentTag = useMemo(() => {
    return tags.find(t => t.name === decodedCategory);
  }, [tags, decodedCategory]);

  // Filter testimonials by category
  const categoryTestimonials = useMemo(() => {
    let filtered = testimonials.filter(t => 
      t.tags?.includes(decodedCategory)
    );

    // Sort
    if (sortBy === "popular") {
      filtered = [...filtered].sort((a, b) => b.likes_count - a.likes_count);
    } else {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return filtered;
  }, [testimonials, decodedCategory, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: categoryTestimonials.length,
    totalLikes: categoryTestimonials.reduce((sum, t) => sum + t.likes_count, 0),
    totalComments: categoryTestimonials.reduce((sum, t) => sum + t.comments_count, 0),
    featured: categoryTestimonials.filter(t => t.is_featured).length,
  }), [categoryTestimonials]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (tagsLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!currentTag) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy chủ đề này</p>
        <Link to="/testimonials">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundEffects showAurora />

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/testimonials">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentTag.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{currentTag.name}</h1>
                  <p className="text-sm text-muted-foreground">{stats.total} nhân chứng</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="hidden sm:flex border border-border/50 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Nhân chứng</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground">Lượt yêu thích</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
                <p className="text-xs text-muted-foreground">Bình luận</p>
              </div>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/10">
                <Star className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.featured}</p>
                <p className="text-xs text-muted-foreground">Nổi bật</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sort tabs */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <TabsList>
              <TabsTrigger value="newest" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Mới nhất
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Phổ biến
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Testimonials Grid/List */}
        {categoryTestimonials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-6xl mb-4 block">{currentTag.icon}</span>
            <h3 className="text-xl font-medium text-foreground mb-2">
              Chưa có nhân chứng nào
            </h3>
            <p className="text-muted-foreground mb-6">
              Hãy là người đầu tiên chia sẻ câu chuyện về {currentTag.name}
            </p>
            <Link to="/testimonials">
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Chia sẻ ngay
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            <AnimatePresence mode="popLayout">
              {categoryTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="group"
                >
                  <div className={`
                    relative bg-card/70 backdrop-blur-xl rounded-2xl border border-border/30 
                    p-6 h-full group-hover:border-primary/50 transition-all duration-300
                    ${viewMode === "list" ? "flex gap-6" : ""}
                  `}>
                    {testimonial.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-gold to-primary text-primary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Nổi bật
                      </Badge>
                    )}

                    {/* Content */}
                    <div className={viewMode === "list" ? "flex-1" : ""}>
                      {/* Stars */}
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                        ))}
                      </div>

                      {/* Testimony */}
                      <p className="text-foreground/90 mb-4 leading-relaxed italic font-serif line-clamp-4">
                        "{testimonial.testimony}"
                      </p>

                      {/* Media */}
                      {testimonial.video_url && (
                        <div className="mb-4">
                          <TestimonialVideoPlayer 
                            videoUrl={testimonial.video_url}
                            className="h-32"
                          />
                        </div>
                      )}
                      {testimonial.image_url && !testimonial.video_url && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                          <img 
                            src={testimonial.image_url} 
                            alt="Testimonial" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Profile */}
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-10 h-10 ring-2 ring-primary/30">
                          <AvatarImage src={testimonial.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/30 to-gold/30">
                            {getInitials(testimonial.profile?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {testimonial.profile?.display_name || "Linh hồn ẩn danh"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(testimonial.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {/* Reactions */}
                      <div className="mb-3">
                        <TestimonialReactions testimonialId={testimonial.id} />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(testimonial.id)}
                            className={`gap-1.5 ${
                              userLikes.has(testimonial.id) ? "text-red-500" : "text-muted-foreground"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${userLikes.has(testimonial.id) ? "fill-current" : ""}`} />
                            <span>{testimonial.likes_count}</span>
                          </Button>

                          <TestimonialComments
                            testimonialId={testimonial.id}
                            commentsCount={testimonial.comments_count}
                            testimonialOwnerId={testimonial.user_id}
                            fetchComments={fetchComments}
                            addComment={addComment}
                            deleteComment={deleteComment}
                          />
                        </div>

                        <TestimonialShareDialog 
                          testimony={testimonial.testimony}
                          authorName={testimonial.profile?.display_name || "Linh hồn ẩn danh"}
                          avatarUrl={testimonial.profile?.avatar_url || null}
                          likesCount={testimonial.likes_count}
                          imageUrl={testimonial.image_url}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestimonialCategory;
