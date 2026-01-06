/**
 * CompareContext - 상품 비교 상태 관리
 * 최대 4개 상품까지 비교 가능
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RecommendationCard } from '../types';

const MAX_COMPARE_ITEMS = 4;

interface CompareContextType {
  compareItems: RecommendationCard[];
  addToCompare: (item: RecommendationCard) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareFull: boolean;
  isPanelOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [compareItems, setCompareItems] = useState<RecommendationCard[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const isCompareFull = compareItems.length >= MAX_COMPARE_ITEMS;

  const addToCompare = useCallback((item: RecommendationCard): boolean => {
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return false;
    }

    if (compareItems.some(i => i.product_id === item.product_id)) {
      return false;
    }

    setCompareItems(prev => [...prev, item]);
    setIsPanelOpen(true);
    return true;
  }, [compareItems]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems(prev => prev.filter(item => item.product_id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareItems([]);
    setIsPanelOpen(false);
  }, []);

  const isInCompare = useCallback((productId: string): boolean => {
    return compareItems.some(item => item.product_id === productId);
  }, [compareItems]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareFull,
        isPanelOpen,
        togglePanel,
        openPanel,
        closePanel,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
