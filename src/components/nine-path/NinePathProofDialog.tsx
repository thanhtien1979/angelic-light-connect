import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image, Video, Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useNinePath, NinePathDailyTask } from '@/hooks/useNinePath';
import { useR2Upload } from '@/hooks/useR2Upload';
import { toast } from '@/hooks/use-toast';

interface NinePathProofDialogProps {
  task: NinePathDailyTask | null;
  isOpen: boolean;
  onClose: () => void;
}

const NinePathProofDialog = ({ task, isOpen, onClose }: NinePathProofDialogProps) => {
  const { submitProof, isSubmittingProof } = useNinePath();
  const { uploadToR2, isUploading } = useR2Upload({ folder: 'nine-path-proofs' });
  
  const [proofText, setProofText] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Lỗi',
          description: 'Chỉ chấp nhận file ảnh',
          variant: 'destructive',
        });
        continue;
      }

      const result = await uploadToR2(file);
      if (result?.url) {
        setImageUrls(prev => [...prev, result.url]);
      }
    }
  }, [uploadToR2]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ chấp nhận file video',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Video không được vượt quá 50MB',
        variant: 'destructive',
      });
      return;
    }

    const result = await uploadToR2(file);
    if (result?.url) {
      setVideoUrl(result.url);
    }
  }, [uploadToR2]);

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(() => {
    if (!task) return;

    if (!proofText.trim() && imageUrls.length === 0 && !videoUrl) {
      toast({
        title: 'Cần có nội dung',
        description: 'Vui lòng thêm mô tả hoặc hình ảnh/video chứng minh',
        variant: 'destructive',
      });
      return;
    }

    submitProof({
      taskId: task.id,
      proofText: proofText.trim(),
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      videoUrl: videoUrl || undefined,
    }, {
      onSuccess: () => {
        setProofText('');
        setImageUrls([]);
        setVideoUrl('');
        onClose();
      }
    });
  }, [task, proofText, imageUrls, videoUrl, submitProof, onClose]);

  if (!task) return null;

  const isSubmitDisabled = isSubmittingProof || isUploading || 
    (!proofText.trim() && imageUrls.length === 0 && !videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-violet-500" />
            Gửi Proof cho nhiệm vụ
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">{task.task_title}</p>
            {task.task_description && (
              <p className="text-xs text-muted-foreground mt-1">{task.task_description}</p>
            )}
          </div>

          {/* Verification Levels Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              📝 Proof = +25 điểm
            </Badge>
            <Badge variant="outline" className="text-xs">
              👥 Community = +50 điểm
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✅ Impact = +100 điểm
            </Badge>
          </div>

          {/* Text Input */}
          <Textarea
            placeholder="Mô tả những gì bạn đã làm..."
            value={proofText}
            onChange={(e) => setProofText(e.target.value)}
            className="min-h-24"
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <span>
                    <Image className="w-4 h-4" />
                    Thêm ảnh
                  </span>
                </Button>
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={isUploading || !!videoUrl}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  disabled={!!videoUrl}
                  asChild
                >
                  <span>
                    <Video className="w-4 h-4" />
                    Thêm video
                  </span>
                </Button>
              </label>

              {isUploading && (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Image Previews */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, index) => (
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="relative">
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full max-h-48 rounded-lg"
                />
                <button
                  onClick={() => setVideoUrl('')}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
          >
            {isSubmittingProof ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Gửi Proof
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NinePathProofDialog;
