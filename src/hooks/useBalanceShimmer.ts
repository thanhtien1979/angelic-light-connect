import { useState, useEffect, useRef } from "react";

/**
 * Hook to track balance changes and trigger shimmer animation
 * Only triggers on balance increase, not on initial load
 */
export const useBalanceShimmer = (balance: number) => {
  const [isShimmering, setIsShimmering] = useState(false);
  const previousBalanceRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Skip initial load
    if (isInitialLoadRef.current) {
      previousBalanceRef.current = balance;
      isInitialLoadRef.current = false;
      return;
    }

    // Only trigger shimmer if balance increased
    if (previousBalanceRef.current !== null && balance > previousBalanceRef.current) {
      setIsShimmering(true);
      
      // Reset shimmer after animation completes (1s)
      const timer = setTimeout(() => {
        setIsShimmering(false);
      }, 1000);

      return () => clearTimeout(timer);
    }

    previousBalanceRef.current = balance;
  }, [balance]);

  return isShimmering;
};
