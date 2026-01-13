import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AngelBio {
  bio?: string;
  quote?: string;
  mission?: string;
  specialties?: string[];
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

  return { customBio, isLoading, updateBio };
};
