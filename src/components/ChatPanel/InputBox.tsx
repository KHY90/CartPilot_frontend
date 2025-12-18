/**
 * InputBox 컴포넌트
 * 메시지 입력 필드
 */
import React, { useState, KeyboardEvent } from 'react';
import './InputBox.css';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

function InputBox({ onSend, disabled = false, value, onChange }: InputBoxProps) {
  const [internalInput, setInternalInput] = useState('');

  // 외부에서 value가 제공되면 controlled, 아니면 uncontrolled
  const input = value !== undefined ? value : internalInput;
  const setInput = onChange || setInternalInput;

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-box">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="무엇이든 물어보세요..."
        disabled={disabled}
        maxLength={500}
      />
      <button onClick={handleSend} disabled={disabled || !input.trim()} aria-label="전송">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
}

export default InputBox;
