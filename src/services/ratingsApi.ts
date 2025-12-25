/**
 * 별점 API 서비스
 */
import apiClient from './api';
import { getAuthHeaders } from './authApi';

export interface ProductRating {
  id: string;
  product_id: string;
  product_name?: string;
  category?: string;
  brand?: string;
  price?: number;
  rating: number;
  created_at: string;
}

export interface RatingCreate {
  product_id: string;
  product_name?: string;
  category?: string;
  brand?: string;
  price?: number;
  rating: number;
}

export interface CategoryPreference {
  category: string;
  avg_rating: number;
  count: number;
}

export interface UserPreferences {
  total_ratings: number;
  avg_rating: number;
  category_preferences: CategoryPreference[];
  preferred_price_range?: string;
}

/**
 * 별점 등록/수정
 */
export async function rateProduct(data: RatingCreate): Promise<ProductRating> {
  const response = await apiClient.post<ProductRating>('/api/ratings', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 내 별점 목록 조회
 */
export async function getMyRatings(category?: string): Promise<ProductRating[]> {
  const url = category ? `/api/ratings?category=${category}` : '/api/ratings';
  const response = await apiClient.get<ProductRating[]>(url, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 특정 상품의 내 별점 조회
 */
export async function getRatingForProduct(productId: string): Promise<ProductRating | null> {
  try {
    const response = await apiClient.get<ProductRating>(`/api/ratings/${productId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch {
    return null;
  }
}

/**
 * 별점 삭제
 */
export async function deleteRating(productId: string): Promise<void> {
  await apiClient.delete(`/api/ratings/${productId}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * 성향 분석 결과 조회
 */
export async function getPreferences(): Promise<UserPreferences> {
  const response = await apiClient.get<UserPreferences>('/api/ratings/analysis/preferences', {
    headers: getAuthHeaders(),
  });
  return response.data;
}
