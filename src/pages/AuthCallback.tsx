/**
 * OAuth 콜백 처리 페이지
 * 소셜 로그인 후 토큰을 저장하고 메인 페이지로 리다이렉트
 */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { saveTokens } from '../services/authApi';
import { useAuth } from '../contexts/AuthContext';
import './AuthCallback.css';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        return;
      }

      if (accessToken) {
        // Access Token 저장 (Refresh Token은 HTTP-only 쿠키로 자동 설정됨)
        saveTokens(accessToken);

        // 사용자 정보 새로고침
        await refreshUser();

        // 메인 페이지로 이동
        navigate('/', { replace: true });
      } else {
        setError('로그인 정보를 받지 못했습니다');
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  if (error) {
    return (
      <div className="auth-callback">
        <div className="callback-container error">
          <div className="callback-icon">❌</div>
          <h2>로그인 실패</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback">
      <div className="callback-container">
        <div className="callback-spinner"></div>
        <p>로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
