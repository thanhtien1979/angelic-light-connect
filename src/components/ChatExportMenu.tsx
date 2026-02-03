import { Download, FileJson, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatExport } from "@/hooks/useChatExport";
import { Spinner } from "@/components/ui/spinner";

interface ChatExportMenuProps {
  disabled?: boolean;
}

const ChatExportMenu = ({ disabled }: ChatExportMenuProps) => {
  const { isExporting, exportAsJSON, exportAsText, isAuthenticated } = useChatExport();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={disabled || isExporting}
                className="p-2 rounded-full hover:bg-rose-light/30 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Spinner className="w-5 h-5 text-primary" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </motion.button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white/95 backdrop-blur border-rose-soft/30">
            <p className="text-sm">Tải xuống lịch sử chat</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent 
        align="end" 
        className="bg-white/95 backdrop-blur-xl border-rose-soft/30 shadow-lg min-w-[200px]"
      >
        <DropdownMenuLabel className="text-sm text-muted-foreground font-normal">
          Chọn định dạng xuất
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-rose-soft/20" />
        
        <DropdownMenuItem
          onClick={exportAsJSON}
          disabled={isExporting}
          className="flex items-center gap-3 cursor-pointer hover:bg-rose-light/30 focus:bg-rose-light/30"
        >
          <FileJson className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">JSON</span>
            <span className="text-xs text-muted-foreground">Dữ liệu có cấu trúc</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={exportAsText}
          disabled={isExporting}
          className="flex items-center gap-3 cursor-pointer hover:bg-rose-light/30 focus:bg-rose-light/30"
        >
          <FileText className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="font-medium">Văn bản (TXT)</span>
            <span className="text-xs text-muted-foreground">Dễ đọc và chia sẻ</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatExportMenu;
