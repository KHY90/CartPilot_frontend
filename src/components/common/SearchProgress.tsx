/**
 * SearchProgress Component
 * Enhanced loading experience with animated search steps
 */
import { useState, useEffect } from 'react';
import './SearchProgress.css';

interface SearchStep {
  id: number;
  label: string;
  icon: string;
}

const searchSteps: SearchStep[] = [
  { id: 1, label: '요청 분석 중', icon: '🔍' },
  { id: 2, label: '상품 검색 중', icon: '🛍️' },
  { id: 3, label: '가격 비교 중', icon: '💰' },
  { id: 4, label: '리뷰 분석 중', icon: '⭐' },
  { id: 5, label: '최적 상품 선정 중', icon: '✨' },
];

const funFacts = [
  '한국인이 가장 많이 검색하는 선물은 화장품이에요',
  '가성비 제품은 평균 리뷰 수가 2배 이상 많아요',
  '주말에 구매하면 배송이 하루 더 걸릴 수 있어요',
  '쿠폰 적용 시 평균 15% 할인받을 수 있어요',
  '리뷰 100개 이상인 제품이 만족도가 높아요',
];

interface SearchProgressProps {
  isSearching?: boolean;
}

function SearchProgress({ isSearching = true }: SearchProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [dotsCount, setDotsCount] = useState(1);

  // Progress through steps
  useEffect(() => {
    if (!isSearching) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < searchSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [isSearching]);

  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDotsCount((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  // Rotate fun facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length);
    }, 4000);

    return () => clearInterval(factInterval);
  }, []);

  const dots = '.'.repeat(dotsCount);

  return (
    <div className="search-progress">
      <div className="search-progress-content">
        {/* Main Animation */}
        <div className="search-animation">
          <div className="search-pulse-ring"></div>
          <div className="search-icon-container">
            <svg className="search-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Current Status */}
        <div className="search-status">
          <span className="search-status-icon">{searchSteps[currentStep].icon}</span>
          <span className="search-status-text">
            {searchSteps[currentStep].label}{dots}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="search-steps">
          {searchSteps.map((step, index) => (
            <div
              key={step.id}
              className={`search-step ${
                index < currentStep ? 'completed' :
                index === currentStep ? 'active' : ''
              }`}
            >
              <div className="search-step-dot">
                {index < currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : null}
              </div>
              {index < searchSteps.length - 1 && (
                <div className={`search-step-line ${index < currentStep ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Fun Fact */}
        <div className="search-fun-fact">
          <span className="fun-fact-icon">💡</span>
          <span className="fun-fact-text" key={currentFact}>
            {funFacts[currentFact]}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchProgress;
