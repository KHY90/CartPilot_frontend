/**
 * 구매 기록 API 서비스
 */
import apiClient from './api';

export interface PurchaseRecord {
  id: string;
  product_name: string;
  category: string | null;
  mall_name: string | null;
  price: number;
  quantity: number;
  purchased_at: string;
  notes: string | null;
  created_at: string;
}

export interface PurchaseCreate {
  product_name: string;
  category?: string;
  mall_name?: string;
  price: number;
  quantity?: number;
  purchased_at: string;
  notes?: string;
}

export interface PurchaseUpdate {
  product_name?: string;
  category?: string;
  mall_name?: string;
  price?: number;
  quantity?: number;
  purchased_at?: string;
  notes?: string;
}

export interface PurchaseStats {
  total_purchases: number;
  total_spent: number;
  average_price: number;
  categories: Record<string, number>;
  monthly_spending: Record<string, number>;
}

/**
 * 구매 기록 목록 조회
 */
export async function getPurchases(
  limit = 50,
  offset = 0,
  category?: string
): Promise<PurchaseRecord[]> {
  const params: Record<string, string> = {
    limit: limit.toString(),
    offset: offset.toString(),
  };
  if (category) {
    params.category = category;
  }

  const response = await apiClient.get<PurchaseRecord[]>('/api/purchases', { params });
  return response.data;
}

/**
 * 구매 기록 생성
 */
export async function createPurchase(data: PurchaseCreate): Promise<PurchaseRecord> {
  const response = await apiClient.post<PurchaseRecord>('/api/purchases', data);
  return response.data;
}

/**
 * 구매 기록 상세 조회
 */
export async function getPurchase(purchaseId: string): Promise<PurchaseRecord> {
  const response = await apiClient.get<PurchaseRecord>(`/api/purchases/${purchaseId}`);
  return response.data;
}

/**
 * 구매 기록 수정
 */
export async function updatePurchase(
  purchaseId: string,
  data: PurchaseUpdate
): Promise<PurchaseRecord> {
  const response = await apiClient.put<PurchaseRecord>(`/api/purchases/${purchaseId}`, data);
  return response.data;
}

/**
 * 구매 기록 삭제
 */
export async function deletePurchase(purchaseId: string): Promise<void> {
  await apiClient.delete(`/api/purchases/${purchaseId}`);
}

/**
 * 구매 통계 조회
 */
export async function getPurchaseStats(): Promise<PurchaseStats> {
  const response = await apiClient.get<PurchaseStats>('/api/purchases/stats/summary');
  return response.data;
}

/**
 * 카테고리 목록 조회
 */
export async function getCategories(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/api/purchases/categories');
  return response.data;
}
