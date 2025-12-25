/**
 * 인증 API 서비스
 */
import apiClient from './api';
import { User, TokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 토큰 저장 키
const ACCESS_TOKEN_KEY = 'cartpilot_access_token';
const REFRESH_TOKEN_KEY = 'cartpilot_refresh_token';

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
 * 리프레시 토큰 저장
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

/**
 * 리프레시 토큰 조회
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 토큰 삭제
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 토큰 저장 (access + refresh)
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
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
 * 토큰 갱신
 */
export async function refreshAccessToken(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다');
  }

  const response = await apiClient.post<TokenResponse>('/api/auth/refresh', {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token } = response.data;
  saveTokens(access_token, refresh_token);

  return response.data;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  const token = getAccessToken();
  if (token) {
    try {
      await apiClient.post(
        '/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch {
      // 로그아웃 API 실패해도 토큰은 삭제
    }
  }
  clearTokens();
}

/**
 * API 요청에 인증 헤더 추가
 */
export function getAuthHeaders(): { Authorization: string } | {} {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
