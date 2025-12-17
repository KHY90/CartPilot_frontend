/**
 * ChatPanel 컴포넌트
 * 좌측 채팅 영역
 */
import React, { useRef, useEffect } from 'react';
import { ConversationMessage } from '../../types';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';
import ErrorMessage from '../common/ErrorMessage';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onClearError: () => void;
}

function ChatPanel({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearChat,
  onClearError,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <span>대화</span>
        <button className="clear-button" onClick={onClearChat} disabled={messages.length === 0}>
          초기화
        </button>
      </div>

      <div className="chat-panel-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p>무엇을 찾고 계신가요?</p>
            <div className="chat-examples">
              <p className="examples-title">이렇게 물어보세요</p>
              <ul>
                <li>30대 남자 동료 퇴사 선물 5만원</li>
                <li>가성비 무선 키보드 추천해줘</li>
                <li>노트북+마우스+키보드 100만원에 맞춰줘</li>
                <li>에어프라이어 사도 돼?</li>
                <li>요즘 뭐 사?</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && (
          <div className="chat-loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && <ErrorMessage message={error} onDismiss={onClearError} />}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-panel-input">
        <InputBox onSend={onSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default ChatPanel;
