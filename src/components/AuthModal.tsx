import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Sparkles, LogIn, UserPlus, Phone, ArrowLeft, User, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import LightLawAgreement from "./LightLawAgreement";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
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

type AuthMode = "signin" | "signup" | "phone" | "otp" | "light-law" | "forgot";
type AuthMethod = "google" | "email" | "phone";

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; displayName?: string }>({});
  const [agreedToLightLaw, setAgreedToLightLaw] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, signInWithPhone, verifyPhoneOtp, resetPassword } = useAuth();

  const authMethods = [
    { 
      id: "google" as AuthMethod, 
      label: "Google", 
      icon: <GoogleIcon className="w-5 h-5" />,
      color: "from-white to-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      description: "Nhanh và an toàn"
    },
    { 
      id: "email" as AuthMethod, 
      label: "Email", 
      icon: <Mail className="w-5 h-5 text-blue-500" />,
      color: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      description: "Email & mật khẩu"
    },
    { 
      id: "phone" as AuthMethod, 
      label: "Điện thoại", 
      icon: <Smartphone className="w-5 h-5 text-green-500" />,
      color: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      description: "Xác thực OTP"
    },
  ];

  const validate = () => {
    const newErrors: { email?: string; password?: string; phone?: string; displayName?: string } = {};
    
    if (mode === "signin" || mode === "signup") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Email không hợp lệ";
      }
      
      if (password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      // Validate display name for signup
      if (mode === "signup") {
        const trimmedName = displayName.trim();
        if (!trimmedName) {
          newErrors.displayName = "Vui lòng nhập tên hiển thị";
        } else if (trimmedName.length < 2) {
          newErrors.displayName = "Tên phải có ít nhất 2 ký tự";
        } else if (trimmedName.length > 50) {
          newErrors.displayName = "Tên không được quá 50 ký tự";
        }
      }
    }
    
    if (mode === "phone") {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại không hợp lệ (VD: +84912345678)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      setIsSubmitting(false);
      
      if (!error) {
        resetForm();
        onClose();
      }
    } else if (mode === "signup") {
      // Đăng ký với Light Law agreement và display name
      const { error, data } = await signUp(email, password, displayName.trim());
      setIsSubmitting(false);
      
      if (!error && data?.user) {
        // Cập nhật profile với Light Law agreement
        await supabase
          .from("profiles")
          .update({
            agreed_to_light_law: true,
            light_law_agreed_at: new Date().toISOString()
          })
          .eq("id", data.user.id);
        
        resetForm();
        onClose();
      }
    } else if (mode === "phone") {
      const { error } = await signInWithPhone(phone);
      setIsSubmitting(false);
      
      if (!error) {
        setMode("otp");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Email không hợp lệ" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);
    if (!error) {
      setMode("signin");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    
    setIsSubmitting(true);
    const { error } = await verifyPhoneOtp(phone, otp);
    setIsSubmitting(false);
    
    if (!error) {
      resetForm();
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setPhone("");
    setOtp("");
    setErrors({});
    setAgreedToLightLaw(false);
    setMode("signin");
  };

  const toggleMode = () => {
    if (mode === "signin") {
      // Khi chuyển sang đăng ký, hiển thị Luật Ánh Sáng trước
      setMode("light-law");
    } else {
      setMode("signin");
    }
    setErrors({});
  };

  const handleLightLawAgree = () => {
    setAgreedToLightLaw(true);
    setMode("signup");
  };

  const goBack = () => {
    if (mode === "otp") {
      setMode("phone");
      setOtp("");
    } else if (mode === "signup") {
      setMode("light-law");
    } else if (mode === "light-law") {
      setMode("signin");
    } else if (mode === "forgot") {
      setMode("signin");
      setErrors({});
    } else {
      setMode("signin");
    }
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
            className={`relative w-full ${mode === "light-law" ? "max-w-lg" : "max-w-md"} bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gold-light/30 shadow-2xl overflow-hidden`}
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

            {/* Back button for phone/otp/signup/light-law modes */}
            {(mode === "phone" || mode === "otp" || mode === "signup" || mode === "light-law") && (
              <button
                onClick={goBack}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            {mode === "forgot" && (
              <button
                onClick={goBack}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors z-10"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
            )}

            <div className="relative p-8">
              {/* Light Law Agreement Screen */}
              {mode === "light-law" && (
                <LightLawAgreement
                  onAgree={handleLightLawAgree}
                  onBack={goBack}
                />
              )}

              {/* Other modes - Header */}
              {mode !== "light-law" && (
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
                    {mode === "signin" && "Chào Mừng Trở Lại"}
                    {mode === "signup" && "Tham Gia Angel AI"}
                    {mode === "phone" && "Đăng Nhập Bằng SĐT"}
                    {mode === "otp" && "Xác Thực OTP"}
                    {mode === "forgot" && "Quên Mật Khẩu"}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {mode === "signin" && "Đăng nhập để tiếp tục hành trình của bạn"}
                    {mode === "signup" && "Bạn đã đồng ý với Luật Ánh Sáng ✨"}
                    {mode === "phone" && "Nhập số điện thoại để nhận mã OTP"}
                    {mode === "otp" && `Nhập mã 6 số đã gửi đến ${phone}`}
                    {mode === "forgot" && "Nhập email để nhận liên kết đặt lại mật khẩu"}
                  </p>
                </div>
              )}

              {/* OTP Verification Form */}
              {mode === "otp" && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  <motion.button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isSubmitting || otp.length !== 6}
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
                        <LogIn className="w-5 h-5" />
                        Xác Nhận
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Phone Sign In Form */}
              {mode === "phone" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+84 912 345 678"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/60 border border-gold-light/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
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
                        <Phone className="w-5 h-5" />
                        Gửi Mã OTP
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Email/Password Sign In/Up Form */}
              {(mode === "signin" || mode === "signup") && (
                <>
                  {/* Auth Method Tabs */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {authMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        type="button"
                        onClick={() => setAuthMethod(method.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                          authMethod === method.id
                            ? `bg-gradient-to-br ${method.color} ${method.borderColor} shadow-md`
                            : "bg-white/50 border-gray-200/50 hover:border-gray-300"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${authMethod === method.id ? "bg-white/80" : "bg-gray-100/50"}`}>
                          {method.icon}
                        </div>
                        <span className={`text-xs font-medium ${authMethod === method.id ? method.textColor : "text-gray-500"}`}>
                          {method.label}
                        </span>
                        {authMethod === method.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 rounded-xl border-2 border-gold/50"
                            style={{ boxShadow: "0 0 15px hsla(45, 100%, 70%, 0.3)" }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Selected method description */}
                  <motion.p
                    key={authMethod}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-muted-foreground mb-4"
                  >
                    {authMethods.find(m => m.id === authMethod)?.description}
                  </motion.p>

                  {/* Google Sign In */}
                  {authMethod === "google" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <motion.button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-foreground font-medium flex items-center justify-center gap-3 disabled:opacity-60 transition-all shadow-sm"
                      >
                        {isGoogleLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"
                          />
                        ) : (
                          <>
                            <GoogleIcon className="w-6 h-6" />
                            <span className="text-base">
                              {mode === "signin" ? "Đăng nhập với Google" : "Đăng ký với Google"}
                            </span>
                          </>
                        )}
                      </motion.button>
                      <p className="text-center text-xs text-muted-foreground">
                        ✨ Đăng nhập nhanh chóng và bảo mật với tài khoản Google của bạn
                      </p>
                    </motion.div>
                  )}

                  {/* Phone Sign In */}
                  {authMethod === "phone" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+84 912 345 678"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/60 border-2 border-green-200 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-500">{errors.phone}</p>
                      )}
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!validate()) return;
                          setIsSubmitting(true);
                          signInWithPhone(phone).then(({ error }) => {
                            setIsSubmitting(false);
                            if (!error) setMode("otp");
                          });
                        }}
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                        style={{ boxShadow: "0 0 20px hsla(145, 80%, 50%, 0.4)" }}
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <>
                            <Smartphone className="w-5 h-5" />
                            Gửi Mã OTP
                          </>
                        )}
                      </motion.button>
                      <p className="text-center text-xs text-muted-foreground">
                        📱 Mã xác thực sẽ được gửi đến số điện thoại của bạn
                      </p>
                    </motion.div>
                  )}

                  {/* Email Sign In */}
                  {authMethod === "email" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Display Name - Only for signup */}
                        {mode === "signup" && (
                          <div>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                              <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Tên hiển thị của bạn"
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/60 border-2 border-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                maxLength={50}
                              />
                            </div>
                            {errors.displayName && (
                              <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
                            )}
                          </div>
                        )}

                        <div>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email của bạn"
                              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/60 border-2 border-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Mật khẩu"
                              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/60 border-2 border-blue-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
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
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
                          style={{ boxShadow: "0 0 20px hsla(220, 80%, 60%, 0.4)" }}
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
                    </motion.div>
                  )}

                  {/* Toggle mode */}
                  <div className="mt-6 pt-4 border-t border-gold-light/20 text-center">
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
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
