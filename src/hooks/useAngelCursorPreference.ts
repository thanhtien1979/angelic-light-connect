import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type AngelCursorColor = 'pink' | 'gold' | 'white' | 'purple';
export type AngelCursorSize = 'small' | 'medium' | 'large';
export type AngelCursorStyle = 'classic' | 'cherub' | 'seraph' | 'guardian';

export const useAngelCursorPreference = () => {
  const { user } = useAuth();
  const [cursorColor, setCursorColor] = useState<AngelCursorColor>('pink');
  const [cursorSize, setCursorSize] = useState<AngelCursorSize>('medium');
  const [cursorStyle, setCursorStyle] = useState<AngelCursorStyle>('classic');
  const [trailEnabled, setTrailEnabled] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Load preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (!user?.id) {
        // Use localStorage for non-authenticated users
        const storedColor = localStorage.getItem('angel_cursor_color') as AngelCursorColor | null;
        const storedSize = localStorage.getItem('angel_cursor_size') as AngelCursorSize | null;
        const storedEnabled = localStorage.getItem('angel_cursor_enabled');
        
        if (storedColor && ['pink', 'gold', 'white', 'purple'].includes(storedColor)) {
          setCursorColor(storedColor);
        }
        if (storedSize && ['small', 'medium', 'large'].includes(storedSize)) {
          setCursorSize(storedSize);
        }
        if (storedEnabled !== null) {
          setIsEnabled(storedEnabled === 'true');
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('angel_cursor_color, angel_cursor_size, angel_cursor_enabled, angel_cursor_video_url')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.angel_cursor_color) {
          setCursorColor(data.angel_cursor_color as AngelCursorColor);
        }
        if (data?.angel_cursor_size) {
          setCursorSize(data.angel_cursor_size as AngelCursorSize);
        }
        if (data?.angel_cursor_enabled !== null && data?.angel_cursor_enabled !== undefined) {
          setIsEnabled(data.angel_cursor_enabled);
        }
        if (data?.angel_cursor_video_url) {
          setCustomVideoUrl(data.angel_cursor_video_url);
        }
        // Load style and trail from localStorage (not stored in DB yet)
        const storedStyle = localStorage.getItem('angel_cursor_style') as AngelCursorStyle | null;
        const storedTrail = localStorage.getItem('angel_cursor_trail');
        if (storedStyle && ['classic', 'cherub', 'seraph', 'guardian'].includes(storedStyle)) {
          setCursorStyle(storedStyle);
        }
        if (storedTrail !== null) {
          setTrailEnabled(storedTrail === 'true');
        }
      } catch (error) {
        console.error('Error loading angel cursor preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, [user?.id]);

  // Sync color preference
  const syncCursorColor = async (color: AngelCursorColor) => {
    setCursorColor(color);
    localStorage.setItem('angel_cursor_color', color);

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_color: color,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor color:', error);
    }
  };

  // Sync size preference
  const syncCursorSize = async (size: AngelCursorSize) => {
    setCursorSize(size);
    localStorage.setItem('angel_cursor_size', size);

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_size: size,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor size:', error);
    }
  };

  // Sync enabled preference
  const syncIsEnabled = async (enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('angel_cursor_enabled', String(enabled));

    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_enabled: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving angel cursor enabled:', error);
    }
  };

  // Upload custom video
  const uploadCustomVideo = async (file: File) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tải video thiên thần");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Video không được vượt quá 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/angel-cursor.${fileExt}`;

      // Delete old video if exists
      await supabase.storage
        .from('angel-cursor-videos')
        .remove([fileName]);

      // Upload new video
      const { error: uploadError } = await supabase.storage
        .from('angel-cursor-videos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('angel-cursor-videos')
        .getPublicUrl(fileName);

      // Save URL to preferences
      const { error: dbError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          angel_cursor_video_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (dbError) throw dbError;

      setCustomVideoUrl(publicUrl);
      toast.success("Đã tải lên video thiên thần tùy chỉnh!");
    } catch (error) {
      console.error('Error uploading custom video:', error);
      toast.error("Lỗi khi tải video. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove custom video
  const removeCustomVideo = async () => {
    if (!user?.id) return;

    try {
      const fileName = `${user.id}/angel-cursor`;
      
      // List and remove all files in user folder
      const { data: files } = await supabase.storage
        .from('angel-cursor-videos')
        .list(user.id);

      if (files && files.length > 0) {
        await supabase.storage
          .from('angel-cursor-videos')
          .remove(files.map(f => `${user.id}/${f.name}`));
      }

      // Update preferences
      const { error } = await supabase
        .from('user_preferences')
        .update({
          angel_cursor_video_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomVideoUrl(null);
      toast.success("Đã xóa video thiên thần tùy chỉnh");
    } catch (error) {
      console.error('Error removing custom video:', error);
      toast.error("Lỗi khi xóa video");
    }
  };

  // Sync style preference
  const syncCursorStyle = (style: AngelCursorStyle) => {
    setCursorStyle(style);
    localStorage.setItem('angel_cursor_style', style);
  };

  // Sync trail preference
  const syncTrailEnabled = (enabled: boolean) => {
    setTrailEnabled(enabled);
    localStorage.setItem('angel_cursor_trail', String(enabled));
  };

  return { 
    cursorColor, 
    setCursorColor: syncCursorColor, 
    cursorSize,
    setCursorSize: syncCursorSize,
    cursorStyle,
    setCursorStyle: syncCursorStyle,
    trailEnabled,
    setTrailEnabled: syncTrailEnabled,
    isEnabled,
    setIsEnabled: syncIsEnabled,
    customVideoUrl,
    uploadCustomVideo,
    removeCustomVideo,
    isLoading,
    isUploading
  };
};
