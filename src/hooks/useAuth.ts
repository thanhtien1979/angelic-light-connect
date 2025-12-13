import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Email đã được đăng ký. Vui lòng đăng nhập.");
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success("Đăng ký thành công! Chào mừng bạn đến với Angel AI.");
      return { error: null };
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email hoặc mật khẩu không đúng.");
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success("Đăng nhập thành công! Chào mừng trở lại.");
      return { error: null };
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Không thể đăng xuất. Vui lòng thử lại.");
        return { error };
      }
      toast.success("Đã đăng xuất.");
      return { error: null };
    } catch (error) {
      toast.error("Đã xảy ra lỗi.");
      return { error };
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  };
};
