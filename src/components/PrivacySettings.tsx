import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Users, Lock, Eye, EyeOff, Clock, Loader2, Check } from "lucide-react";
import { usePrivacySettings, VisibilityOption } from "@/hooks/usePrivacySettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface VisibilityOptionProps {
  value: VisibilityOption;
  selected: boolean;
  onChange: (value: VisibilityOption) => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled?: boolean;
}

const VisibilityOptionCard = ({
  value,
  selected,
  onChange,
  icon,
  label,
  description,
  disabled,
}: VisibilityOptionProps) => (
  <button
    type="button"
    onClick={() => onChange(value)}
    disabled={disabled}
    className={cn(
      "w-full p-3 rounded-xl border text-left transition-all duration-200 group",
      selected
        ? "border-primary bg-primary/10 shadow-sm"
        : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "p-2 rounded-full transition-colors",
          selected ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-medium text-sm", selected ? "text-primary" : "text-foreground")}>
            {label}
          </span>
          {selected && <Check className="w-3.5 h-3.5 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  </button>
);

export const PrivacySettings = () => {
  const { settings, isLoading, isSaving, updateSettings } = usePrivacySettings();
  const [pendingChanges, setPendingChanges] = useState<{
    profile_visibility?: VisibilityOption;
    online_status_visibility?: VisibilityOption;
    show_last_seen?: boolean;
  }>({});

  const handleProfileVisibilityChange = async (value: VisibilityOption) => {
    setPendingChanges((prev) => ({ ...prev, profile_visibility: value }));
    await updateSettings({ profile_visibility: value });
    setPendingChanges((prev) => {
      const { profile_visibility, ...rest } = prev;
      return rest;
    });
  };

  const handleOnlineStatusVisibilityChange = async (value: VisibilityOption) => {
    setPendingChanges((prev) => ({ ...prev, online_status_visibility: value }));
    await updateSettings({ online_status_visibility: value });
    setPendingChanges((prev) => {
      const { online_status_visibility, ...rest } = prev;
      return rest;
    });
  };

  const handleShowLastSeenChange = async (checked: boolean) => {
    setPendingChanges((prev) => ({ ...prev, show_last_seen: checked }));
    await updateSettings({ show_last_seen: checked });
    setPendingChanges((prev) => {
      const { show_last_seen, ...rest } = prev;
      return rest;
    });
  };

  const currentProfileVisibility = pendingChanges.profile_visibility ?? settings.profile_visibility;
  const currentOnlineStatusVisibility = pendingChanges.online_status_visibility ?? settings.online_status_visibility;
  const currentShowLastSeen = pendingChanges.show_last_seen ?? settings.show_last_seen;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Visibility */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium text-foreground">Ai có thể xem hồ sơ của bạn?</Label>
          {isSaving && pendingChanges.profile_visibility !== undefined && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          )}
        </div>
        <div className="grid gap-2">
          <VisibilityOptionCard
            value="everyone"
            selected={currentProfileVisibility === "everyone"}
            onChange={handleProfileVisibilityChange}
            icon={<Globe className="w-4 h-4" />}
            label="Mọi người"
            description="Tất cả người dùng đã đăng nhập có thể xem hồ sơ của bạn"
            disabled={isSaving}
          />
          <VisibilityOptionCard
            value="friends"
            selected={currentProfileVisibility === "friends"}
            onChange={handleProfileVisibilityChange}
            icon={<Users className="w-4 h-4" />}
            label="Chỉ bạn bè"
            description="Chỉ những người bạn đã kết bạn mới có thể xem hồ sơ của bạn"
            disabled={isSaving}
          />
          <VisibilityOptionCard
            value="nobody"
            selected={currentProfileVisibility === "nobody"}
            onChange={handleProfileVisibilityChange}
            icon={<Lock className="w-4 h-4" />}
            label="Không ai"
            description="Chế độ riêng tư hoàn toàn - chỉ bạn có thể xem hồ sơ của mình"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Online Status Visibility */}
      <div className="space-y-3 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium text-foreground">Ai có thể xem trạng thái online?</Label>
          {isSaving && pendingChanges.online_status_visibility !== undefined && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          )}
        </div>
        <div className="grid gap-2">
          <VisibilityOptionCard
            value="everyone"
            selected={currentOnlineStatusVisibility === "everyone"}
            onChange={handleOnlineStatusVisibilityChange}
            icon={<Globe className="w-4 h-4" />}
            label="Mọi người"
            description="Tất cả người dùng có thể thấy khi bạn đang online"
            disabled={isSaving}
          />
          <VisibilityOptionCard
            value="friends"
            selected={currentOnlineStatusVisibility === "friends"}
            onChange={handleOnlineStatusVisibilityChange}
            icon={<Users className="w-4 h-4" />}
            label="Chỉ bạn bè"
            description="Chỉ bạn bè mới thấy trạng thái online của bạn"
            disabled={isSaving}
          />
          <VisibilityOptionCard
            value="nobody"
            selected={currentOnlineStatusVisibility === "nobody"}
            onChange={handleOnlineStatusVisibilityChange}
            icon={<Lock className="w-4 h-4" />}
            label="Không ai"
            description="Ẩn hoàn toàn trạng thái online của bạn"
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Show Last Seen */}
      <div className="pt-4 border-t border-border/30">
        <div className="flex items-center justify-between p-3 rounded-xl bg-card/30 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Hiển thị lần cuối hoạt động</Label>
              <p className="text-xs text-muted-foreground">Cho phép người khác thấy lần cuối bạn online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && pendingChanges.show_last_seen !== undefined && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            )}
            <Switch
              checked={currentShowLastSeen}
              onCheckedChange={handleShowLastSeenChange}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-primary">Lưu ý:</span> Cài đặt quyền riêng tư sẽ được áp dụng ngay lập tức. 
          Những người đã là bạn bè vẫn có thể nhắn tin cho bạn bất kể cài đặt hiển thị.
        </p>
      </div>
    </motion.div>
  );
};

export default PrivacySettings;
