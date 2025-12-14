import { motion } from "framer-motion";
import { ExternalLink, Image as ImageIcon } from "lucide-react";

interface AttachmentData {
  type: "image" | "link";
  previewUrl?: string;
  fileName?: string;
  url?: string;
  displayUrl?: string;
}

interface MessageAttachmentsProps {
  attachments: AttachmentData[];
  isUserMessage?: boolean;
}

const MessageAttachments = ({ attachments, isUserMessage = false }: MessageAttachmentsProps) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {attachment.type === "image" && attachment.previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-gold-light/30 shadow-sm max-w-[200px]">
              <img
                src={attachment.previewUrl}
                alt={attachment.fileName || "Attached image"}
                className="w-full h-auto max-h-[150px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-2 py-1">
                <div className="flex items-center gap-1 text-white text-xs">
                  <ImageIcon className="w-3 h-3" />
                  <span className="truncate">{attachment.fileName || "Image"}</span>
                </div>
              </div>
            </div>
          ) : attachment.type === "link" && attachment.url ? (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                isUserMessage
                  ? "bg-white/20 border-white/30 hover:bg-white/30 text-white"
                  : "bg-gold-light/10 border-gold-light/30 hover:bg-gold-light/20 text-foreground"
              }`}
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate max-w-[150px]">{attachment.displayUrl}</span>
            </a>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
};

export default MessageAttachments;
