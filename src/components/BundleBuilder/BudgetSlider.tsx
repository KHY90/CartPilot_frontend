/**
 * BudgetSlider - 예산 조절 슬라이더
 */
import { useCallback, useRef, useState } from 'react';
import './BudgetSlider.css';

interface BudgetSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

function BudgetSlider({
  value,
  min,
  max,
  step = 10000,
  onChange,
}: BudgetSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value;

      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, value]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const newValue = calculateValue(e.clientX);
    onChange(newValue);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newValue = calculateValue(e.clientX);
      onChange(newValue);
    },
    [isDragging, calculateValue, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 마우스 이벤트 리스너
  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    },
    [handleMouseMove, handleMouseUp]
  );

  // 프리셋 버튼들
  const presets = [
    { label: '50만', value: 500000 },
    { label: '100만', value: 1000000 },
    { label: '150만', value: 1500000 },
    { label: '200만', value: 2000000 },
    { label: '300만', value: 3000000 },
  ];

  const formatValue = (val: number) => {
    if (val >= 10000) {
      return `${Math.floor(val / 10000)}만원`;
    }
    return `${val.toLocaleString()}원`;
  };

  return (
    <div className="budget-slider-container" ref={handleRef}>
      <div
        ref={sliderRef}
        className={`slider-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div
          className="slider-fill"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="slider-thumb"
          style={{ left: `${percentage}%` }}
        />
      </div>

      <div className="slider-range">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      <div className="preset-buttons">
        {presets.map((preset) => (
          <button
            key={preset.value}
            className={`preset-btn ${value === preset.value ? 'active' : ''}`}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default BudgetSlider;
