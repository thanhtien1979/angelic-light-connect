import { motion } from "framer-motion";
import { X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import type { Attachment } from "@/hooks/useChatAttachments";

interface ChatAttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  compact?: boolean;
}

const ChatAttachmentPreview = ({ attachments, onRemove, compact = false }: ChatAttachmentPreviewProps) => {
  if (attachments.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "px-2 py-1" : "px-4 py-2"}`}>
      {attachments.map((attachment) => (
        <motion.div
          key={attachment.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative group"
        >
          {attachment.type === "image" ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gold-light/40 shadow-sm">
              <img
                src={attachment.previewUrl}
                alt="Attachment preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-1 left-1">
                <ImageIcon className="w-3 h-3 text-white drop-shadow" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-light/20 border border-gold-light/40 text-xs text-foreground/80 max-w-[180px]">
              <LinkIcon className="w-3 h-3 text-gold flex-shrink-0" />
              <span className="truncate">{attachment.displayUrl}</span>
            </div>
          )}
          
          {/* Remove button */}
          <motion.button
            type="button"
            onClick={() => onRemove(attachment.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-3 h-3" />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
};

export default ChatAttachmentPreview;
