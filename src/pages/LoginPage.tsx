/**
 * 로그인 페이지
 * 카카오, 네이버 소셜 로그인
 */
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const { loginWithKakao, loginWithNaver, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <h1>CartPilot</h1>
          <p className="login-subtitle">AI 쇼핑 어시스턴트에 로그인하세요</p>
        </div>

        <div className="login-buttons">
          <button className="login-button kakao" onClick={loginWithKakao}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#000000"
                d="M12 3c-5.523 0-10 3.582-10 8 0 2.837 1.893 5.328 4.734 6.728l-.914 3.325c-.074.27.197.506.45.394l3.893-1.723c.615.08 1.243.123 1.837.123 5.523 0 10-3.582 10-8s-4.477-8-10-8z"
              />
            </svg>
            <span>카카오로 시작하기</span>
          </button>

          <button className="login-button naver" onClick={loginWithNaver}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#FFFFFF"
                d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"
              />
            </svg>
            <span>네이버로 시작하기</span>
          </button>
        </div>

        <div className="login-features">
          <h3>로그인하고 더 많은 기능을 사용하세요</h3>
          <ul>
            <li>
              <span className="feature-icon">❤️</span>
              <span>관심상품 등록 및 가격 알림</span>
            </li>
            <li>
              <span className="feature-icon">⭐</span>
              <span>추천상품 별점으로 맞춤 추천</span>
            </li>
            <li>
              <span className="feature-icon">📊</span>
              <span>구매 주기 분석</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
