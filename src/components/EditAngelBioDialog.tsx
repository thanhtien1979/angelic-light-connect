import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Sparkles } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } else {
        // Use defaults if no saved data
        setBio(defaultBio);
        setQuote(defaultQuote);
        setMission(defaultMission);
        setSpecialtiesText(defaultSpecialties.join(", "));
      }
    } catch (error) {
      // Use defaults on error
      setBio(defaultBio);
      setQuote(defaultQuote);
      setMission(defaultMission);
      setSpecialtiesText(defaultSpecialties.join(", "));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const specialties = specialtiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Upsert the bio data
      const { error } = await supabase.from("angel_bios").upsert(
        {
          angel_id: angelId,
          bio: bio.trim(),
          quote: quote.trim(),
          mission: mission.trim(),
          specialties,
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
                disabled={isSaving}
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
