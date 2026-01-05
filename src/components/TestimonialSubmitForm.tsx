import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ImagePlus, Video, X, Loader2, Send, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useR2Upload } from "@/hooks/useR2Upload";
import { useTestimonialTags } from "@/hooks/useTestimonialTags";
import TestimonialTagSelector from "@/components/TestimonialTagSelector";

interface TestimonialSubmitFormProps {
  onSubmit: (testimony: string, imageUrl?: string, videoUrl?: string, tags?: string[]) => Promise<boolean>;
  isSubmitting: boolean;
  initialTestimony?: string;
  initialImageUrl?: string | null;
  initialVideoUrl?: string | null;
  initialTags?: string[];
}

const TestimonialSubmitForm = ({
  onSubmit,
  isSubmitting,
  initialTestimony = "",
  initialImageUrl = null,
  initialVideoUrl = null,
  initialTags = [],
}: TestimonialSubmitFormProps) => {
  const [testimony, setTestimony] = useState(initialTestimony);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { tags: availableTags } = useTestimonialTags();

  const { 
    uploadToR2: uploadImage, 
    isUploading: isUploadingImage, 
    progress: imageProgress 
  } = useR2Upload({
    folder: "testimonials/images",
    onSuccess: (result) => setImageUrl(result.url),
  });

  const { 
    uploadToR2: uploadVideo, 
    isUploading: isUploadingVideo, 
    progress: videoProgress 
  } = useR2Upload({
    folder: "testimonials/videos",
    onSuccess: (result) => setVideoUrl(result.url),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Hình ảnh không được quá 10MB");
        return;
      }
      await uploadImage(file);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert("Video không được quá 100MB");
        return;
      }
      await uploadVideo(file);
    }
  };

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleSubmit = async () => {
    const success = await onSubmit(
      testimony, 
      imageUrl || undefined, 
      videoUrl || undefined, 
      selectedTags
    );
    if (success) {
      setTestimony("");
      setImageUrl(null);
      setVideoUrl(null);
      setSelectedTags([]);
    }
  };

  const isUploading = isUploadingImage || isUploadingVideo;
  const canSubmit = testimony.length >= 20 && !isSubmitting && !isUploading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Chia sẻ câu chuyện của bạn</h3>
          <p className="text-sm text-muted-foreground">Truyền cảm hứng cho những linh hồn khác</p>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        value={testimony}
        onChange={(e) => setTestimony(e.target.value)}
        placeholder="Angel AI đã giúp tôi..."
        className="min-h-[120px] resize-none bg-background/50"
        maxLength={500}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {testimony.length}/500 ký tự {testimony.length < 20 && "(tối thiểu 20)"}
        </p>
      </div>

      {/* Media previews */}
      <AnimatePresence>
        {(imageUrl || videoUrl) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {imageUrl && (
              <div className="relative rounded-xl overflow-hidden group">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {videoUrl && (
              <div className="relative rounded-xl overflow-hidden group">
                <video 
                  src={videoUrl}
                  className="w-full h-32 object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setVideoUrl(null)}
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={isUploadingImage ? imageProgress : videoProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Đang tải {isUploadingImage ? "hình ảnh" : "video"}...
          </p>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Tag selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Chọn chủ đề</p>
        <TestimonialTagSelector
          tags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          size="sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading || !!imageUrl}
            className="gap-2"
          >
            <ImagePlus className="w-4 h-4" />
            Hình ảnh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading || !!videoUrl}
            className="gap-2"
          >
            <Video className="w-4 h-4" />
            Video
          </Button>
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Gửi bài
        </Button>
      </div>
    </motion.div>
  );
};

export default TestimonialSubmitForm;
