/**
 * 조합 별점 API 서비스
 * 묶음 구매 조합에 대한 평가 관리
 */
import apiClient from './api';
import { getAuthHeaders } from './authApi';
import { CombinationRating, CombinationRatingCreate } from '../types';

/**
 * 조합 해시 생성 (프론트엔드용)
 * 백엔드와 동일한 로직으로 상품 ID들을 해시
 */
export async function generateCombinationHash(productIds: string[]): Promise<string> {
  const sortedIds = [...productIds].sort();
  const combined = sortedIds.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 조합 별점 등록/수정
 */
export async function rateCombination(data: CombinationRatingCreate): Promise<CombinationRating> {
  const response = await apiClient.post<CombinationRating>('/api/combination-ratings', data, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 내 조합 별점 목록 조회
 */
export async function getMyCombinationRatings(): Promise<CombinationRating[]> {
  const response = await apiClient.get<CombinationRating[]>('/api/combination-ratings', {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * 특정 조합의 내 별점 조회 (해시로)
 */
export async function getCombinationRatingByHash(combinationHash: string): Promise<CombinationRating | null> {
  try {
    const response = await apiClient.get<CombinationRating>(
      `/api/combination-ratings/by-hash/${combinationHash}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch {
    return null;
  }
}

/**
 * 특정 조합의 내 별점 조회 (상품 ID 목록으로)
 */
export async function getCombinationRatingByProducts(productIds: string[]): Promise<CombinationRating | null> {
  try {
    const response = await apiClient.post<CombinationRating | null>(
      '/api/combination-ratings/by-products',
      productIds,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch {
    return null;
  }
}

/**
 * 조합 별점 삭제
 */
export async function deleteCombinationRating(combinationHash: string): Promise<void> {
  await apiClient.delete(`/api/combination-ratings/by-hash/${combinationHash}`, {
    headers: getAuthHeaders(),
  });
}
