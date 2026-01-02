/**
 * CartPilot 메인 앱
 * 라우팅 및 레이아웃 구성
 */
import { Routes, Route } from 'react-router-dom';
import ChatPanel from './components/ChatPanel/ChatPanel';
import RecommendationPanel from './components/RecommendationPanel/RecommendationPanel';
import Header from './components/Header/Header';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import PurchasesPage from './pages/PurchasesPage';
import WishlistPage from './pages/WishlistPage';
import useChat from './hooks/useChat';
import './App.css';

function HomePage() {
  const { messages, isLoading, error, currentResponse, sendMessage, clearChat, clearError } =
    useChat();

  return (
    <>
      <main className="app-main">
        <div className="chat-section">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
            onClearError={clearError}
          />
        </div>

        <div className="recommendation-section">
          <RecommendationPanel response={currentResponse} isLoading={isLoading} />
        </div>
      </main>

      <footer className="app-footer">
        <p>선물, 가성비, 묶음 구매, 리뷰 검증, 트렌드 추천까지 - AI가 도와드립니다</p>
      </footer>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/wishlist"
          element={
            <>
              <Header />
              <WishlistPage />
            </>
          }
        />
        <Route
          path="/purchases"
          element={
            <>
              <Header />
              <PurchasesPage />
            </>
          }
        />
        <Route
          path="/*"
          element={
            <>
              <Header />
              <HomePage />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
