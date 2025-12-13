import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const { error } = mode === "signin" 
      ? await signIn(email, password)
      : await signUp(email, password);
    
    setIsSubmitting(false);
    
    if (!error) {
      setEmail("");
      setPassword("");
      setErrors({});
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
    // Note: We don't setIsGoogleLoading(false) here because the page will redirect
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl border border-gold-light/30 shadow-2xl overflow-hidden"
            style={{
              boxShadow: "0 0 60px hsla(45, 100%, 70%, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-gold-light/40 to-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-sky-light/40 to-sky/20 rounded-full blur-3xl" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="relative p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center"
                  style={{
                    boxShadow: "0 0 30px hsla(45, 100%, 70%, 0.5)",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="font-serif text-2xl text-foreground mb-2">
                  {mode === "signin" ? "Chào Mừng Trở Lại" : "Tham Gia Angel AI"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {mode === "signin" 
                    ? "Đăng nhập để tiếp tục hành trình của bạn" 
                    : "Đăng ký để bắt đầu hành trình 5D"}
                </p>
              </div>

              {/* Google Sign In Button */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 mb-4 rounded-xl bg-white border border-border/50 hover:bg-gray-50 text-foreground font-medium flex items-center justify-center gap-3 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isGoogleLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"
                  />
                ) : (
                  <>
                    <GoogleIcon />
                    Tiếp tục với Google
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold-light/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/90 text-muted-foreground">hoặc</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email của bạn"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 border border-gold-light/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 border border-gold-light/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || isGoogleLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-gold-light text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    boxShadow: "0 0 20px hsla(45, 100%, 70%, 0.4)",
                  }}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      {mode === "signin" ? (
                        <LogIn className="w-5 h-5" />
                      ) : (
                        <UserPlus className="w-5 h-5" />
                      )}
                      {mode === "signin" ? "Đăng Nhập" : "Đăng Ký"}
                    </>
                  )}
                </motion.button>
              </form>

              {/* Toggle mode */}
              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  {mode === "signin" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-gold hover:text-gold-light font-medium transition-colors"
                  >
                    {mode === "signin" ? "Đăng ký ngay" : "Đăng nhập"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
