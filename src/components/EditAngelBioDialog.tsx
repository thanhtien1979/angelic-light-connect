import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Sparkles, Upload, Image, Video, X } from "lucide-react";

interface EditAngelBioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  angelId: string;
  angelName: string;
  defaultBio?: string;
  defaultQuote?: string;
  defaultSpecialties?: string[];
  defaultMission?: string;
  onSave: (data: {
    bio?: string;
    quote?: string;
    specialties?: string[];
    mission?: string;
    avatar_url?: string;
    video_url?: string;
  }) => void;
}

export const EditAngelBioDialog = ({
  isOpen,
  onClose,
  angelId,
  angelName,
  defaultBio = "",
  defaultQuote = "",
  defaultSpecialties = [],
  defaultMission = "",
  onSave,
}: EditAngelBioDialogProps) => {
  const [bio, setBio] = useState(defaultBio);
  const [quote, setQuote] = useState(defaultQuote);
  const [mission, setMission] = useState(defaultMission);
  const [specialtiesText, setSpecialtiesText] = useState(defaultSpecialties.join(", "));
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && angelId) {
      loadExistingBio();
    }
  }, [isOpen, angelId]);

  const loadExistingBio = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("angel_bios")
        .select("*")
        .eq("angel_id", angelId)
        .single();

      if (data) {
        setBio(data.bio || defaultBio);
        setQuote(data.quote || defaultQuote);
        setMission(data.mission || defaultMission);
        setSpecialtiesText((data.specialties || defaultSpecialties).join(", "));
        setAvatarUrl(data.avatar_url || "");
        setVideoUrl(data.video_url || "");
        setAvatarPreview(data.avatar_url || "");
        setVideoPreview(data.video_url || "");
      } else {
        setBio(defaultBio);
        setQuote(defaultQuote);
        setMission(defaultMission);
        setSpecialtiesText(defaultSpecialties.join(", "));
        setAvatarUrl("");
        setVideoUrl("");
        setAvatarPreview("");
        setVideoPreview("");
      }
    } catch (error) {
      setBio(defaultBio);
      setQuote(defaultQuote);
      setMission(defaultMission);
      setSpecialtiesText(defaultSpecialties.join(", "));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, type: 'avatar' | 'video'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${angelId}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('angel-media')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('angel-media')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file tối đa là 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    const url = await uploadFile(file, 'avatar');
    if (url) {
      setAvatarUrl(url);
      toast.success("Đã tải lên avatar thành công!");
    } else {
      toast.error("Không thể tải lên avatar");
      setAvatarPreview(avatarUrl);
    }
    setIsUploadingAvatar(false);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Kích thước video tối đa là 50MB");
      return;
    }

    setIsUploadingVideo(true);

    // Create preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    const uploadedUrl = await uploadFile(file, 'video');
    if (uploadedUrl) {
      setVideoUrl(uploadedUrl);
      setVideoPreview(uploadedUrl);
      toast.success("Đã tải lên video thành công!");
    } else {
      toast.error("Không thể tải lên video");
      setVideoPreview(videoUrl);
    }
    setIsUploadingVideo(false);
  };

  const removeAvatar = () => {
    setAvatarUrl("");
    setAvatarPreview("");
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    setVideoUrl("");
    setVideoPreview("");
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const specialties = specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.from("angel_bios").upsert(
        {
          angel_id: angelId,
          bio: bio.trim(),
          quote: quote.trim(),
          mission: mission.trim(),
          specialties,
          avatar_url: avatarUrl || null,
          video_url: videoUrl || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "angel_id",
        }
      );

      if (error) {
        throw error;
      }

      toast.success("Đã lưu tiểu sử thành công!", {
        description: `Thông tin của ${angelName} đã được cập nhật`,
        icon: <Sparkles className="w-4 h-4 text-gold" />,
      });

      onSave({
        bio: bio.trim(),
        quote: quote.trim(),
        specialties,
        mission: mission.trim(),
        avatar_url: avatarUrl,
        video_url: videoUrl,
      });
      onClose();
    } catch (error: any) {
      console.error("Error saving angel bio:", error);
      toast.error("Không thể lưu tiểu sử", {
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Chỉnh sửa tiểu sử {angelName}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Cập nhật thông tin tiểu sử của Thiên Thần
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
          </div>
        ) : (
          <div className="space-y-5 mt-4">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label className="text-white/80 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Avatar hình ảnh
              </Label>
              <div className="flex items-center gap-3">
                {avatarPreview ? (
                  <div className="relative">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                    />
                    <button
                      onClick={removeAvatar}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Image className="w-8 h-8 text-white/40" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Tải lên avatar
                  </Button>
                  <p className="text-xs text-white/40 mt-1">PNG, JPG, tối đa 5MB</p>
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label className="text-white/80 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video giới thiệu
              </Label>
              <div className="space-y-2">
                {videoPreview ? (
                  <div className="relative">
                    <video 
                      src={videoPreview} 
                      className="w-full h-32 object-cover rounded-lg border border-white/20"
                      controls
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-lg bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Video className="w-10 h-10 text-white/40" />
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploadingVideo}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {isUploadingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Tải lên video
                </Button>
                <p className="text-xs text-white/40">MP4, WEBM, tối đa 50MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Câu nói đặc trưng</Label>
              <Input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Nhập câu nói đặc trưng..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Tiểu sử</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Nhập tiểu sử..."
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Sứ mệnh / Câu chuyện</Label>
              <Textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Nhập câu chuyện hoặc sứ mệnh..."
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">
                Lĩnh vực đặc biệt (phân cách bằng dấu phẩy)
              </Label>
              <Input
                value={specialtiesText}
                onChange={(e) => setSpecialtiesText(e.target.value)}
                placeholder="VD: Thiền định, Chữa lành, Tư vấn..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isUploadingAvatar || isUploadingVideo}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
