import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AngelBio {
  bio?: string;
  quote?: string;
  mission?: string;
  specialties?: string[];
  avatar_url?: string;
  video_url?: string;
}

export const useAngelBio = (angelId: string) => {
  const [customBio, setCustomBio] = useState<AngelBio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!angelId) return;

    const fetchBio = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("angel_bios")
          .select("*")
          .eq("angel_id", angelId)
          .single();

        if (data && !error) {
          setCustomBio({
            bio: data.bio || undefined,
            quote: data.quote || undefined,
            mission: data.mission || undefined,
            specialties: data.specialties || undefined,
            avatar_url: data.avatar_url || undefined,
            video_url: data.video_url || undefined,
          });
        } else {
          setCustomBio(null);
        }
      } catch (error) {
        setCustomBio(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBio();
  }, [angelId]);

  const updateBio = (newBio: AngelBio) => {
    setCustomBio(newBio);
  };

  const uploadMedia = async (file: File, type: 'avatar' | 'video'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${angelId}/${type}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('angel-media')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('angel-media')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  return { customBio, isLoading, updateBio, uploadMedia };
};
