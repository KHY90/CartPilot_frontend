/**
 * API 클라이언트
 * Axios 기반 백엔드 통신
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ChatRequest, ChatResponse, HealthResponse, ConversationMessage } from '../types';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 토큰 키 (authApi.ts와 동일)
const ACCESS_TOKEN_KEY = 'cartpilot_access_token';

// 토큰 갱신 중 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 (8초 응답 목표 + 여유)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함 (refresh_token 자동 전송)
});

// 요청 인터셉터 (인증 토큰 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리 및 토큰 갱신)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 엔드포인트 자체의 401은 갱신하지 않음
      if (originalRequest.url?.includes('/api/auth/refresh')) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.location.href = '/';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 이미 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 (refresh_token은 쿠키로 자동 전송)
        const response = await apiClient.post('/api/auth/refresh');
        const { access_token } = response.data;

        localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        window.location.href = '/';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      // 서버 응답 에러
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답 없음
      console.error('Network Error:', error.message);
    } else {
      // 요청 설정 에러
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * 채팅 메시지 전송
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/api/chat', request);
  return response.data;
}

/**
 * 대화 기록 조회
 */
export async function getChatHistory(): Promise<ConversationMessage[]> {
  const response = await apiClient.get<ConversationMessage[]>('/api/history');
  return response.data;
}

/**
 * 대화 기록 삭제
 */
export async function clearChatHistory(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>('/api/clear-history');
  return response.data;
}

/**
 * 헬스체크
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/api/health');
  return response.data;
}

/**
 * 캐시된 검색 결과 타입
 */
export interface CachedProduct {
  product_id: string;
  title: string;
  price: number;
  price_display: string;
  mall_name: string;
  link: string;
  image?: string;
}

export interface CachedSearchResults {
  session_id: string;
  products: CachedProduct[];
}

/**
 * 캐시된 검색 결과 조회
 */
export async function getCachedSearchResults(sessionId: string): Promise<CachedSearchResults> {
  const response = await apiClient.get<CachedSearchResults>(`/api/search-results/${sessionId}`);
  return response.data;
}

export default apiClient;
