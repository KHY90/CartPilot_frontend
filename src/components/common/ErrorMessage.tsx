/**
 * ErrorMessage 컴포넌트
 * 에러 메시지 표시
 */
import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button className="error-dismiss" onClick={onDismiss} aria-label="닫기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
