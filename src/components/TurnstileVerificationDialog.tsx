import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sparkles, Heart, Loader2 } from "lucide-react";

interface TurnstileVerificationDialogProps {
  open: boolean;
  onVerified: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export default function TurnstileVerificationDialog({
  open,
  onVerified,
  onClose,
}: TurnstileVerificationDialogProps) {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTurnstileScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile script"));
      document.head.appendChild(script);
    });
  }, []);

  const renderWidget = useCallback(async () => {
    if (!turnstileRef.current || !TURNSTILE_SITE_KEY) {
      setError("Turnstile configuration missing");
      setIsLoading(false);
      return;
    }

    try {
      await loadTurnstileScript();
      setIsLoading(false);

      // Wait for turnstile to be available
      const checkTurnstile = setInterval(() => {
        if (window.turnstile && turnstileRef.current) {
          clearInterval(checkTurnstile);
          
          // Clear existing widget if any
          if (widgetIdRef.current) {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch (e) {
              // Ignore removal errors
            }
          }

          widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              if (token) {
                onVerified();
              }
            },
            "error-callback": () => {
              setError("Verification failed. Please try again.");
            },
            "expired-callback": () => {
              setError("Verification expired. Please try again.");
            },
            theme: "light",
            appearance: "always",
          });
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkTurnstile), 10000);
    } catch (err) {
      setError("Failed to load verification. Please refresh the page.");
      setIsLoading(false);
    }
  }, [loadTurnstileScript, onVerified]);

  useEffect(() => {
    if (open) {
      setError(null);
      setIsLoading(true);
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // Ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [open, renderWidget]);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-md border-rose-soft/40 bg-gradient-to-b from-white via-rose-light/30 to-white shadow-[0_0_60px_hsla(348,80%,80%,0.3)]">
        {/* Decorative glow effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose/20 via-rose-glow/30 to-rose/20 rounded-2xl blur-xl opacity-60" />
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "radial-gradient(circle at 50% 0%, hsla(348, 80%, 85%, 0.3), transparent 70%)",
          }}
        />
        
        <div className="relative z-10">
          <AlertDialogHeader className="text-center space-y-4">
            {/* Animated icon */}
            <motion.div 
              className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-light to-rose-glow/50 flex items-center justify-center shadow-[0_0_30px_hsla(348,80%,80%,0.4)]"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 30px hsla(348, 80%, 80%, 0.4)",
                  "0 0 50px hsla(348, 80%, 80%, 0.6)",
                  "0 0 30px hsla(348, 80%, 80%, 0.4)",
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 text-rose-soft" />
            </motion.div>
            
            <AlertDialogTitle className="font-serif text-2xl text-primary">
              ✨ Xác minh năng lượng thiêng liêng ✨
            </AlertDialogTitle>
            
            <AlertDialogDescription className="text-foreground/80 text-base leading-relaxed">
              🌸 Before we continue, please take a moment to affirm you are human energy, not automated noise.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Turnstile Widget Container */}
          <div className="mt-6 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-8"
                >
                  <Loader2 className="w-8 h-8 text-rose-soft animate-spin" />
                  <p className="text-sm text-muted-foreground">Đang chuẩn bị xác minh...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-6"
                >
                  <p className="text-destructive text-sm">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      renderWidget();
                    }}
                    className="mt-3 text-primary hover:underline text-sm"
                  >
                    Thử lại
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="widget"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  {/* Rose glow around widget */}
                  <div className="absolute -inset-3 bg-rose-glow/20 rounded-xl blur-lg" />
                  <div 
                    ref={turnstileRef}
                    className="relative rounded-lg overflow-hidden"
                    style={{
                      minHeight: "65px",
                      minWidth: "300px",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer message */}
          <motion.p 
            className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Heart className="w-3 h-3 text-rose-soft" />
            Xác minh chỉ diễn ra một lần mỗi phiên
            <Heart className="w-3 h-3 text-rose-soft" />
          </motion.p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
