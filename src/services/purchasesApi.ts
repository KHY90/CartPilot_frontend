/**
 * 구매 기록 API 서비스
 */

import { getAuthHeaders } from './authApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`${API_BASE}/api/purchases?${params}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('구매 기록 조회 실패');
  }

  return response.json();
}

/**
 * 구매 기록 생성
 */
export async function createPurchase(data: PurchaseCreate): Promise<PurchaseRecord> {
  const response = await fetch(`${API_BASE}/api/purchases`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('구매 기록 생성 실패');
  }

  return response.json();
}

/**
 * 구매 기록 상세 조회
 */
export async function getPurchase(purchaseId: string): Promise<PurchaseRecord> {
  const response = await fetch(`${API_BASE}/api/purchases/${purchaseId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('구매 기록 조회 실패');
  }

  return response.json();
}

/**
 * 구매 기록 수정
 */
export async function updatePurchase(
  purchaseId: string,
  data: PurchaseUpdate
): Promise<PurchaseRecord> {
  const response = await fetch(`${API_BASE}/api/purchases/${purchaseId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('구매 기록 수정 실패');
  }

  return response.json();
}

/**
 * 구매 기록 삭제
 */
export async function deletePurchase(purchaseId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/purchases/${purchaseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('구매 기록 삭제 실패');
  }
}

/**
 * 구매 통계 조회
 */
export async function getPurchaseStats(): Promise<PurchaseStats> {
  const response = await fetch(`${API_BASE}/api/purchases/stats/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('구매 통계 조회 실패');
  }

  return response.json();
}

/**
 * 카테고리 목록 조회
 */
export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/purchases/categories`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('카테고리 목록 조회 실패');
  }

  return response.json();
}
