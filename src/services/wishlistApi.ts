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
  created_at: string;
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
  updates: { target_price?: number; notification_enabled?: boolean }
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
