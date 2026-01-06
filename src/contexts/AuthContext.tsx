/**
 * 인증 Context
 * 전역 인증 상태 관리
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AxiosError } from 'axios';
import { User } from '../types';
import {
  getCurrentUser,
  getAccessToken,
  clearTokens,
  getKakaoLoginUrl,
  getNaverLoginUrl,
  logout as logoutApi,
} from '../services/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  loginWithKakao: () => void;
  loginWithNaver: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      // 401/403 에러인 경우에만 토큰 삭제 (토큰이 무효한 경우)
      // 네트워크 에러나 서버 다운인 경우에는 토큰 유지
      if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
        clearTokens();
      } else {
        // 네트워크 에러 등: 토큰은 유지하고 사용자 정보만 없는 상태로 설정
        // 다음 새로고침 시 다시 시도
        console.warn('인증 확인 실패 (네트워크 에러 가능성):', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithKakao = () => {
    window.location.href = getKakaoLoginUrl();
  };

  const loginWithNaver = () => {
    window.location.href = getNaverLoginUrl();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      // 401/403 에러인 경우에만 토큰 삭제
      if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
        setUser(null);
        clearTokens();
      }
      // 네트워크 에러는 무시 (토큰 유지)
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    accessToken: getAccessToken(),
    loginWithKakao,
    loginWithNaver,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
