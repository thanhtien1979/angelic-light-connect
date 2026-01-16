import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook để lấy encryption salt riêng của user từ profiles
 * Salt này được dùng cho client-side encryption
 */
export const useEncryptionSalt = () => {
  const { user } = useAuth();
  const [salt, setSalt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSalt = useCallback(async () => {
    if (!user) {
      setSalt(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('encryption_salt')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching encryption salt:', error);
        setSalt(null);
      } else {
        setSalt(data?.encryption_salt || null);
      }
    } catch (error) {
      console.error('Error fetching encryption salt:', error);
      setSalt(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSalt();
  }, [fetchSalt]);

  return {
    salt,
    isLoading,
    refetch: fetchSalt
  };
};
