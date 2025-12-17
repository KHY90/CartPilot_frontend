/**
 * API 클라이언트
 * Axios 기반 백엔드 통신
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ChatRequest, ChatResponse, HealthResponse, ConversationMessage } from '../types';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 (8초 응답 목표 + 여유)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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

export default apiClient;
