/**
 * 인증 API 서비스
 * Refresh Token은 HTTP-only 쿠키로 관리됨
 */
import apiClient from './api';
import { User, TokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 토큰 저장 키 (Access Token만 localStorage에 저장)
const ACCESS_TOKEN_KEY = 'cartpilot_access_token';

/**
 * 액세스 토큰 저장
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/**
 * 액세스 토큰 조회
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 토큰 삭제 (Access Token만 - Refresh Token은 서버에서 쿠키 삭제)
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * 토큰 저장 (Access Token만 저장, Refresh Token은 쿠키로 자동 관리)
 */
export function saveTokens(accessToken: string): void {
  setAccessToken(accessToken);
}

/**
 * 카카오 로그인 URL
 */
export function getKakaoLoginUrl(): string {
  return `${API_BASE_URL}/api/auth/kakao`;
}

/**
 * 네이버 로그인 URL
 */
export function getNaverLoginUrl(): string {
  return `${API_BASE_URL}/api/auth/naver`;
}

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  const response = await apiClient.get<User>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * 토큰 갱신 (Refresh Token은 쿠키로 자동 전송됨)
 */
export async function refreshAccessToken(): Promise<TokenResponse> {
  // withCredentials: true로 설정되어 있으므로 쿠키가 자동 전송됨
  const response = await apiClient.post<TokenResponse>('/api/auth/refresh');

  const { access_token } = response.data;
  setAccessToken(access_token);

  return response.data;
}

/**
 * 로그아웃 (서버에서 쿠키 삭제)
 */
export async function logout(): Promise<void> {
  try {
    // 서버에서 refresh_token 쿠키를 삭제함
    await apiClient.post('/api/auth/logout');
  } catch {
    // 로그아웃 API 실패해도 로컬 토큰은 삭제
  }
  clearTokens();
}

/**
 * API 요청에 인증 헤더 추가
 */
export function getAuthHeaders(): { Authorization: string } | Record<string, never> {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
