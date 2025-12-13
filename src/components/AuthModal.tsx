import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Sparkles, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp } = useAuth();

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
                  disabled={isSubmitting}
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
