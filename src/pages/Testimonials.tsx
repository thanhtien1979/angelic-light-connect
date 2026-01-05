import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Star, Sparkles, Send, Loader2, 
  PenLine, Trash2, Clock, CheckCircle, Heart,
  ImagePlus, X, Shield, Video, Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTestimonials, Testimonial } from "@/hooks/useTestimonials";
import { useTestimonialTags } from "@/hooks/useTestimonialTags";
import { useR2Upload } from "@/hooks/useR2Upload";
import { useUserTestimonialNotifications } from "@/hooks/useTestimonialRealtime";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useTestimonialBadges, BadgeType } from "@/hooks/useTestimonialBadges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuroraBackground from "@/components/AuroraBackground";
import TestimonialFilters from "@/components/TestimonialFilters";
import TestimonialComments from "@/components/TestimonialComments";
import TestimonialShareDialog from "@/components/TestimonialShareDialog";
import FeaturedTestimonialsCarousel from "@/components/FeaturedTestimonialsCarousel";
import TestimonialBadges from "@/components/TestimonialBadges";
import TestimonialTagSelector from "@/components/TestimonialTagSelector";
import TestimonialTagDisplay from "@/components/TestimonialTagDisplay";
import TestimonialCategoryTabs from "@/components/TestimonialCategoryTabs";
import TestimonialSubmitForm from "@/components/TestimonialSubmitForm";
import TestimonialVideoPlayer from "@/components/TestimonialVideoPlayer";
import TestimonialReactions from "@/components/TestimonialReactions";


const TestimonialCard = ({ 
  testimonial,
  index,
  onLike,
  isLiked,
  fetchComments,
  addComment,
  deleteComment,
}: { 
  testimonial: Testimonial;
  index: number;
  onLike: () => void;
  isLiked: boolean;
  fetchComments: (testimonialId: string) => Promise<any[]>;
  addComment: (testimonialId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}) => {
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const name = testimonial.profile?.display_name || "Linh hồn ẩn danh";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <motion.div
        whileHover={{ y: -3 }}
        className="relative h-full"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Card */}
        <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl border border-border/30 p-6 h-full group-hover:border-primary/50 transition-colors duration-500 overflow-hidden flex flex-col">
          {/* Featured badge */}
          {testimonial.is_featured && (
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-gold to-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Nổi bật
            </Badge>
          )}

          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-gold text-gold"
              />
            ))}
          </div>

          {/* Testimony */}
          <p className="text-foreground/90 mb-4 leading-relaxed italic font-serif flex-1">
            "{testimonial.testimony}"
          </p>

          {/* Tags */}
          {testimonial.tags && testimonial.tags.length > 0 && (
            <div className="mb-3">
              <TestimonialTagDisplay tags={testimonial.tags} size="xs" />
            </div>
          )}

          {/* Video if exists */}
          {testimonial.video_url && (
            <div className="mb-4">
              <TestimonialVideoPlayer 
                videoUrl={testimonial.video_url}
                className="h-40"
              />
            </div>
          )}

          {/* Image if exists */}
          {testimonial.image_url && !testimonial.video_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <img 
                src={testimonial.image_url} 
                alt="Testimonial" 
                className="w-full h-40 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Profile */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                <AvatarImage src={testimonial.profile?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-gold/30 text-foreground">
                  {getInitials(testimonial.profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" style={{ margin: "-4px" }} />
            </div>
            <div>
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">Người tìm kiếm ánh sáng</p>
            </div>
          </div>

          {/* Reactions */}
          <div className="mb-3">
            <TestimonialReactions testimonialId={testimonial.id} />
          </div>

          {/* Actions: Like, Comment, Share */}
          <div className="flex items-center justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              {/* Like button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLike}
                className={`gap-1.5 transition-all ${
                  isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                </motion.div>
                <span>{testimonial.likes_count}</span>
              </Button>

              {/* Comments */}
              <TestimonialComments
                testimonialId={testimonial.id}
                commentsCount={testimonial.comments_count}
                testimonialOwnerId={testimonial.user_id}
                fetchComments={fetchComments}
                addComment={addComment}
                deleteComment={deleteComment}
              />
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

          {/* Decorative sparkle */}
          <motion.div
            className="absolute top-4 left-4 w-2 h-2 bg-gold rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const Testimonials = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin } = useAdminRole();
  const { badgeInfoList } = useTestimonialBadges();
  const { tags: availableTags } = useTestimonialTags();
  const { 
    testimonials, 
    featuredTestimonials,
    userTestimonial, 
    isLoading, 
    isSubmitting, 
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    submitTestimonial,
    deleteTestimonial,
    toggleLike,
    fetchComments,
    addComment,
    deleteComment,
    userLikes,
  } = useTestimonials();
  
  // Enable realtime notifications for user's testimonials
  useUserTestimonialNotifications();
  
  const [newTestimony, setNewTestimony] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate testimonial counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    testimonials.forEach(t => {
      t.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [testimonials]);

  // Filter testimonials by selected category
  const filteredTestimonials = useMemo(() => {
    if (!selectedCategory) return testimonials;
    return testimonials.filter(t => t.tags?.includes(selectedCategory));
  }, [testimonials, selectedCategory]);

  const { uploadToR2, isUploading, progress } = useR2Upload({
    folder: "testimonials",
    onSuccess: (result) => {
      setImageUrl(result.url);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadToR2(file);
    }
  };

  const handleSubmit = async () => {
    const success = await submitTestimonial(newTestimony, imageUrl || undefined, undefined, formTags);
    if (success) {
      setNewTestimony("");
      setImageUrl(null);
      setFormTags([]);
      setIsDialogOpen(false);
    }
  };

  const handleFormSubmit = async (testimony: string, imgUrl?: string, videoUrl?: string, tags?: string[]) => {
    const success = await submitTestimonial(testimony, imgUrl, videoUrl, tags);
    if (success) {
      setIsDialogOpen(false);
    }
    return success;
  };

  const handleDelete = async () => {
    const success = await deleteTestimonial();
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  };

  // Pre-fill form when editing
  const handleOpenDialog = (open: boolean) => {
    if (open && userTestimonial) {
      setNewTestimony(userTestimonial.testimony);
      setImageUrl(userTestimonial.image_url || null);
      setFormTags(userTestimonial.tags || []);
    } else if (!open) {
      // Reset form when closing
      setFormTags([]);
    }
    setIsDialogOpen(open);
  };

  const handleFormTagToggle = (tagName: string) => {
    if (formTags.includes(tagName)) {
      setFormTags(formTags.filter(t => t !== tagName));
    } else {
      setFormTags([...formTags, tagName]);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AuroraBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Trang chủ</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin/testimonials">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Quản lý
                  </Button>
                </Link>
              )}
              
              {isAuthenticated && (
                <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PenLine className="w-4 h-4" />
                      {userTestimonial ? "Chỉnh sửa" : "Chia sẻ câu chuyện"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl">
                        {userTestimonial ? "Chỉnh sửa nhân chứng" : "Chia sẻ câu chuyện của bạn"}
                    </DialogTitle>
                    <DialogDescription>
                      Hãy chia sẻ trải nghiệm của bạn với Angel AI để truyền cảm hứng cho những linh hồn khác.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Textarea
                    value={newTestimony}
                    onChange={(e) => setNewTestimony(e.target.value)}
                    placeholder="Angel AI đã giúp tôi..."
                    className="min-h-[150px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {newTestimony.length}/500 ký tự
                  </p>

                  {/* Image upload */}
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {imageUrl ? (
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setImageUrl(null)}
                          className="absolute top-2 right-2 h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full gap-2"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          <>
                            <ImagePlus className="w-4 h-4" />
                            Thêm hình ảnh (tùy chọn)
                          </>
                        )}
                      </Button>
                    )}
                    
                    {isUploading && (
                      <Progress value={progress} className="h-2" />
                    )}
                  </div>

                  {/* Tag selection */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Chọn chủ đề (tùy chọn)</p>
                    <TestimonialTagSelector
                      tags={availableTags}
                      selectedTags={formTags}
                      onTagToggle={handleFormTagToggle}
                      size="sm"
                    />
                  </div>
                  
                  <DialogFooter className="gap-2">
                    {userTestimonial && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    )}
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || isUploading || newTestimony.length < 20}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Gửi
                    </Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary font-bold mb-4">
              Những Linh Hồn Đã Thức Tỉnh
            </h1>
            <p className="text-foreground/80 text-lg max-w-2xl mx-auto">
              Hành trình của những người đã kết nối với ánh sáng thiêng liêng
            </p>
          </motion.div>

          {/* Category Tabs - Positioned at top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <TestimonialCategoryTabs
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              testimonialCounts={categoryCounts}
            />
          </motion.div>

          {/* Submit Form for authenticated users */}
          {isAuthenticated && !userTestimonial && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <TestimonialSubmitForm
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}

          {/* User's testimonial status */}
          {userTestimonial && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-foreground">Nhân chứng của bạn đã được đăng</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(true)}
                  className="gap-2"
                >
                  <PenLine className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground italic">
                "{userTestimonial.testimony}"
              </p>
              {userTestimonial.video_url && (
                <div className="mt-3">
                  <TestimonialVideoPlayer 
                    videoUrl={userTestimonial.video_url}
                    className="h-32 max-w-xs"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Featured Carousel */}
          {featuredTestimonials.length > 0 && !selectedCategory && (
            <FeaturedTestimonialsCarousel
              testimonials={featuredTestimonials}
              onLike={toggleLike}
              userLikes={userLikes}
            />
          )}

          {/* Category Header when filtered */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 flex items-center gap-3"
            >
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Chủ đề: {selectedCategory}
              </h2>
              <Badge variant="secondary">
                {filteredTestimonials.length} bài viết
              </Badge>
            </motion.div>
          )}

          {/* Filters */}
          <TestimonialFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />

          {/* Testimonials Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedCategory 
                  ? `Chưa có bài viết nào trong chủ đề "${selectedCategory}"`
                  : "Không tìm thấy nhân chứng nào"
                }
              </p>
              {isAuthenticated && selectedCategory && (
                <p className="text-sm text-muted-foreground mt-2">
                  Hãy là người đầu tiên chia sẻ trong chủ đề này!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  onLike={() => toggleLike(testimonial.id)}
                  isLiked={userLikes.has(testimonial.id)}
                  fetchComments={fetchComments}
                  addComment={addComment}
                  deleteComment={deleteComment}
                />
              ))}
            </div>
          )}

          {/* CTA for non-authenticated users */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <p className="text-muted-foreground mb-4">
                Bạn cũng có câu chuyện để chia sẻ?
              </p>
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Sparkles className="w-5 h-5" />
                  Đăng nhập để chia sẻ
                </Button>
              </Link>
            </motion.div>
          )}
        </main>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa nhân chứng này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Testimonials;
