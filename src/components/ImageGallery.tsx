import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Share2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Download,
  X,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useImageGallery } from "@/hooks/useImageGallery";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ImageModalProps {
  image: {
    id: string;
    image_url: string;
    prompt: string;
    is_public: boolean;
    likes_count: number;
  };
  onClose: () => void;
  isOwner: boolean;
  onTogglePublic?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

const ImageModal = ({ image, onClose, isOwner, onTogglePublic, onDelete, onLike }: ImageModalProps) => {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Angel AI Art",
          text: image.prompt,
          url: image.image_url,
        });
      } else {
        await navigator.clipboard.writeText(image.image_url);
        toast.success("Đã sao chép link ảnh!");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.image_url;
    link.download = `angel-art-${image.id}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl w-full bg-card rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-black flex items-center justify-center">
            <img
              src={image.image_url}
              alt={image.prompt}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              {image.is_public ? (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                  <Globe className="w-3 h-3" />
                  Công khai
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  Riêng tư
                </span>
              )}
            </div>

            <h3 className="font-serif text-lg mb-2">Prompt</h3>
            <p className="text-muted-foreground text-sm flex-1 mb-6">{image.prompt}</p>

            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onLike}
                className="flex items-center gap-1"
              >
                <Heart className="w-4 h-4" />
                {image.likes_count}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTogglePublic}
                  className="flex-1"
                >
                  {image.is_public ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ẩn khỏi cộng đồng
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Chia sẻ cộng đồng
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ImageCardProps {
  image: {
    id: string;
    user_id: string;
    image_url: string;
    prompt: string;
    is_public: boolean;
    likes_count: number;
  };
  onClick: () => void;
  isOwner: boolean;
}

const ImageCard = ({ image, onClick, isOwner }: ImageCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <Card className="overflow-hidden border-rose-soft/30 bg-white/80 backdrop-blur-sm">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={image.image_url}
          alt={image.prompt}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs line-clamp-2">{image.prompt}</p>
          </div>
        </div>
        {image.is_public && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
            <Heart className="w-3 h-3" />
            {image.likes_count}
          </div>
        )}
        {isOwner && (
          <div className="absolute top-2 left-2">
            {image.is_public ? (
              <Globe className="w-4 h-4 text-green-400" />
            ) : (
              <Lock className="w-4 h-4 text-white/70" />
            )}
          </div>
        )}
      </div>
    </Card>
  </motion.div>
);

export default function ImageGallery() {
  const { user } = useAuth();
  const { myImages, publicImages, togglePublic, deleteImage, likeImage } = useImageGallery();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("community");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2">
          <TabsTrigger value="community" className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            Cộng Đồng
          </TabsTrigger>
          <TabsTrigger value="my-gallery" className="flex items-center gap-1" disabled={!user}>
            <Lock className="w-4 h-4" />
            Của Tôi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="community" className="mt-6">
          {publicImages.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Chưa có ảnh được chia sẻ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image)}
                  isOwner={user?.id === image.user_id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-gallery" className="mt-6">
          {!user ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Đăng nhập để xem ảnh của bạn</p>
            </div>
          ) : myImages.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Bạn chưa lưu ảnh nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image)}
                  isOwner={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            isOwner={user?.id === selectedImage.user_id}
            onTogglePublic={() => {
              togglePublic(selectedImage.id, selectedImage.is_public);
              setSelectedImage(null);
            }}
            onDelete={() => {
              deleteImage(selectedImage.id, selectedImage.image_url);
              setSelectedImage(null);
            }}
            onLike={() => likeImage(selectedImage.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
