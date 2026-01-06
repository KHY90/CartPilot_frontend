/**
 * 관심상품 API 서비스
 */
import apiClient from './api';
import { getAuthHeaders } from './authApi';

export interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_link?: string;
  mall_name?: string;
  category?: string;
  current_price: number;
  target_price?: number;
  lowest_price_90days?: number;
  notification_enabled: boolean;
  alert_on_lowest: boolean;
  alert_on_target: boolean;
  alert_on_drop_percent?: number;
  created_at: string;
}

export interface PriceAnalysis {
  current_price: number;
  lowest_90days?: number;
  highest_90days?: number;
  average_90days?: number;
  price_change_percent?: number;
  is_lowest: boolean;
  recommendation: 'buy' | 'wait' | 'neutral';
  data_points: number;
}

export interface PriceCheckResult {
  previous_price: number;
  current_price: number;
  price_changed: boolean;
  change_amount: number;
  change_percent: number;
  is_lowest: boolean;
  lowest_90days?: number;
}

export interface WishlistItemCreate {
  product_id: string;
  product_name: string;
  product_image?: string;
  product_link?: string;
  mall_name?: string;
  category?: string;
  current_price: number;
  target_price?: number;
}

export interface PriceHistoryItem {
  price: number;
  recorded_at: string;
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable';
  change_rate: number;
  period_days: number;
}

export interface UpcomingSale {
  name: string;
  start_date: string;
  end_date: string;
  days_until: number;
  expected_discount: number;
  applicable: boolean;
}

export interface PricePrediction {
  product_id: string;
  current_price: number;
  trend: PriceTrend;
  lowest_price_90d?: number;
  highest_price_90d?: number;
  predicted_price_7d?: number;
  predicted_price_30d?: number;
  confidence: number;
  upcoming_sales: UpcomingSale[];
  best_buy_timing: string;
  buy_recommendation: 'buy_now' | 'wait' | 'neutral';
  recommendation_reason: string;
  analyzed_at: string;
  history_points: number;
}

export interface PredictionSummary {
  total_products: number;
  buy_now_count: number;
  wait_count: number;
  neutral_count: number;
  next_sale?: UpcomingSale;
  potential_savings: number;
}

/**
 * 관심상품 목록 조회
 */
export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await apiClient.get<WishlistItem[]>('/api/wishlist', {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 관심상품 등록
 */
export async function addToWishlist(item: WishlistItemCreate): Promise<WishlistItem> {
  const response = await apiClient.post<WishlistItem>('/api/wishlist', item, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 관심상품 삭제
 */
export async function removeFromWishlist(itemId: string): Promise<void> {
  await apiClient.delete(`/api/wishlist/${itemId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 관심상품 수정
 */
export async function updateWishlistItem(
  itemId: string,
  updates: {
    target_price?: number;
    notification_enabled?: boolean;
    alert_on_lowest?: boolean;
    alert_on_target?: boolean;
    alert_on_drop_percent?: number;
  }
): Promise<WishlistItem> {
  const response = await apiClient.put<WishlistItem>(`/api/wishlist/${itemId}`, updates, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 가격 이력 조회
 */
export async function getPriceHistory(itemId: string, days = 90): Promise<PriceHistoryItem[]> {
  const response = await apiClient.get<PriceHistoryItem[]>(
    `/api/wishlist/${itemId}/price-history?days=${days}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * 가격 분석 조회
 */
export async function getPriceAnalysis(itemId: string): Promise<PriceAnalysis> {
  const response = await apiClient.get<PriceAnalysis>(
    `/api/wishlist/${itemId}/price-analysis`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * 수동 가격 체크
 */
export async function checkPriceNow(itemId: string): Promise<PriceCheckResult> {
  const response = await apiClient.post<PriceCheckResult>(
    `/api/wishlist/${itemId}/check-price`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * 가격 예측 조회
 */
export async function getPricePrediction(itemId: string): Promise<PricePrediction> {
  const response = await apiClient.get<PricePrediction>(
    `/api/wishlist/${itemId}/prediction`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * 예측 요약 조회
 */
export async function getPredictionsSummary(): Promise<PredictionSummary> {
  const response = await apiClient.get<PredictionSummary>(
    '/api/wishlist/predictions/summary',
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}
