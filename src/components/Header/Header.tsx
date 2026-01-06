/**
 * 헤더 컴포넌트
 * 로고, 로그인/로그아웃 버튼, 테마 토글
 */
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Header.css';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-logo" onClick={() => navigate('/')}>
          <div className="app-logo-icon">
            <svg
              width="24"
              height="24"
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
        </div>
        <span className="app-subtitle">AI 쇼핑 어시스턴트</span>
      </div>

      <div className="header-right">
        <ThemeToggle />
        {isAuthenticated ? (
          <div className="user-menu">
            <nav className="header-nav">
              <button className="nav-link" onClick={() => navigate('/wishlist')}>
                관심상품
              </button>
              <button className="nav-link" onClick={() => navigate('/purchases')}>
                구매 기록
              </button>
            </nav>
            {user?.profile_image ? (
              <img src={user.profile_image} alt={user.name || '프로필'} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
            <span className="user-name">{user?.name || '사용자'}</span>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate('/login')}>
            로그인
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
