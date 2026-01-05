import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const useAdminReportNotifications = () => {
  const { isAdmin } = useAdminRole();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new comment reports
    channelRef.current = supabase
      .channel("admin-report-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "testimonial_comment_reports",
        },
        async (payload) => {
          const report = payload.new as {
            id: string;
            reason: string;
            reporter_id: string;
          };

          // Fetch reporter name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", report.reporter_id)
            .single();

          const reporterName = profile?.display_name || "Một người dùng";

          toast.warning(`Báo cáo mới cần xử lý`, {
            description: `${reporterName} đã báo cáo: ${report.reason}`,
            action: {
              label: "Xem",
              onClick: () => {
                window.location.href = "/admin/comment-reports";
              },
            },
            duration: 10000,
          });
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isAdmin]);
};
