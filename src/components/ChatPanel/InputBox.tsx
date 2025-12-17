/**
 * InputBox 컴포넌트
 * 메시지 입력 필드
 */
import React, { useState, KeyboardEvent } from 'react';
import './InputBox.css';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

function InputBox({ onSend, disabled = false }: InputBoxProps) {
  const [input, setInput] = useState('');

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
      <button onClick={handleSend} disabled={disabled || !input.trim()}>
        전송
      </button>
    </div>
  );
}

export default InputBox;
