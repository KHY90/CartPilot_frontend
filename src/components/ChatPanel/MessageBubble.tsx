/**
 * MessageBubble 컴포넌트
 * 개별 메시지 버블
 */
import React from 'react';
import { ConversationMessage } from '../../types';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: ConversationMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-time">
        {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

export default MessageBubble;
