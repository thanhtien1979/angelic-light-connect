import { useState } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import GiftRewardModal from "./GiftRewardModal";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReceiverProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface GiftButtonProps {
  receiverId: string;
  receiverProfile?: ReceiverProfile | null;
  postId?: string;
  variant?: "default" | "icon" | "compact";
  className?: string;
  onSuccess?: () => void;
}

export default function GiftButton({
  receiverId,
  receiverProfile,
  postId,
  variant = "default",
  className = "",
  onSuccess,
}: GiftButtonProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tặng thưởng");
      return;
    }
    
    if (user.id === receiverId) {
      toast.error("Bạn không thể tự tặng thưởng cho chính mình");
      return;
    }

    setIsModalOpen(true);
  };

  if (variant === "icon") {
    return (
      <>
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 hover:from-rose-500/30 hover:to-pink-500/30 transition-all group ${className}`}
          title="Tặng thưởng"
        >
          <Gift className="w-4 h-4 text-rose-500 group-hover:text-rose-400" />
        </motion.button>
        
        <GiftRewardModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          receiverId={receiverId}
          receiverProfile={receiverProfile}
          postId={postId}
          onSuccess={onSuccess}
        />
      </>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-600 hover:from-rose-500/30 hover:to-pink-500/30 transition-all ${className}`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Tặng</span>
        </motion.button>
        
        <GiftRewardModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          receiverId={receiverId}
          receiverProfile={receiverProfile}
          postId={postId}
          onSuccess={onSuccess}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={className}
      >
        <Button
          onClick={handleClick}
          className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 text-white hover:from-violet-500 hover:via-pink-500 hover:to-rose-500 shadow-lg shadow-rose-500/25 transition-all duration-300"
        >
          <Gift className="w-4 h-4 mr-2" />
          Tặng thưởng
        </Button>
      </motion.div>
      
      <GiftRewardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        receiverId={receiverId}
        receiverProfile={receiverProfile}
        postId={postId}
        onSuccess={onSuccess}
      />
    </>
  );
}
