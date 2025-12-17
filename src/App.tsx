/**
 * CartPilot 메인 앱
 * 좌측 채팅 + 우측 추천 카드 레이아웃
 */
import React from 'react';
import ChatPanel from './components/ChatPanel/ChatPanel';
import RecommendationPanel from './components/RecommendationPanel/RecommendationPanel';
import useChat from './hooks/useChat';
import './App.css';

function App() {
  const { messages, isLoading, error, currentResponse, sendMessage, clearChat, clearError } =
    useChat();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 CartPilot</h1>
        <span className="app-subtitle">AI 쇼핑 어시스턴트</span>
      </header>

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
        <p>
          선물, 가성비, 묶음 구매, 리뷰 검증, 트렌드 추천까지 - AI가 도와드립니다
        </p>
      </footer>
    </div>
  );
}

export default App;
