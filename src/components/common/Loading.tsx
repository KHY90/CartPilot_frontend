/**
 * Loading 컴포넌트
 * 로딩 상태 표시
 */
import React from 'react';
import './Loading.css';

interface LoadingProps {
  text?: string;
}

function Loading({ text = '로딩 중...' }: LoadingProps) {
  return (
    <div className="loading">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <p className="loading-text">{text}</p>
    </div>
  );
}

export default Loading;
