/**
 * RecommendationPanel 컴포넌트
 * 우측 추천 카드 영역
 */
import React from 'react';
import { ChatResponse, GiftRecommendation, IntentType } from '../../types';
import GiftCard from './GiftCard';
import ProductCard from './ProductCard';
import SearchProgress from '../common/SearchProgress';
import './RecommendationPanel.css';

interface RecommendationPanelProps {
  response: ChatResponse | null;
  isLoading: boolean;
}

function RecommendationPanel({ response, isLoading }: RecommendationPanelProps) {
  // 로딩 중
  if (isLoading) {
    return (
      <div className="recommendation-panel loading">
        <SearchProgress isSearching={true} />
      </div>
    );
  }

  // 응답 없음
  if (!response) {
    return (
      <div className="recommendation-panel empty">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p>채팅으로 질문하시면</p>
          <p>맞춤 추천을 보여드릴게요!</p>
        </div>
      </div>
    );
  }

  // 에러 응답
  if (response.type === 'error') {
    return (
      <div className="recommendation-panel error">
        <div className="error-state">
          <div className="error-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p>{response.error_message}</p>
          {response.fallback_suggestions.length > 0 && (
            <div className="suggestions">
              <p>이렇게 시도해 보세요:</p>
              <ul>
                {response.fallback_suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 추가 질문 응답
  if (response.type === 'clarification') {
    return (
      <div className="recommendation-panel clarification">
        <div className="clarification-state">
          <div className="clarification-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p>조금 더 정보가 필요해요</p>
          {response.clarification && (
            <p className="clarification-question">{response.clarification.question}</p>
          )}
        </div>
      </div>
    );
  }

  // 추천 결과
  if (response.type === 'recommendation' && response.recommendations) {
    return (
      <div className="recommendation-panel">
        <div className="panel-header">
          <span className="intent-badge">{getIntentLabel(response.intent)}</span>
          <span className="processing-time">
            {response.cached ? '캐시' : `${response.processing_time_ms}ms`}
          </span>
        </div>

        {renderRecommendations(response.intent, response.recommendations)}
      </div>
    );
  }

  // 추천 결과가 없는 경우 (Phase 3 이전)
  return (
    <div className="recommendation-panel pending">
      <div className="pending-state">
        <div className="pending-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <p>이 모드는 준비 중이에요</p>
        <p className="intent-info">
          감지된 의도: <strong>{getIntentLabel(response.intent)}</strong>
        </p>
      </div>
    </div>
  );
}

function getIntentLabel(intent?: IntentType): string {
  const labels: Record<IntentType, string> = {
    GIFT: '🎁 선물 추천',
    VALUE: '💰 가성비 추천',
    BUNDLE: '📦 묶음 구매',
    REVIEW: '📝 리뷰 분석',
    TREND: '📈 트렌드',
  };
  return intent ? labels[intent] : '분석 중';
}

function renderRecommendations(
  intent: IntentType | undefined,
  recommendations: ChatResponse['recommendations']
) {
  if (!recommendations) return null;

  // GIFT 모드
  if (intent === 'GIFT' && 'cards' in recommendations) {
    const giftRec = recommendations as GiftRecommendation;
    return (
      <div className="gift-recommendations">
        <div className="rec-summary">
          <div className="summary-header">
            <span className="gift-icon">🎁</span>
            <div>
              <p className="recipient">
                <strong>{giftRec.recipient_summary}</strong>
                {giftRec.occasion && <span className="occasion"> · {giftRec.occasion}</span>}
              </p>
              <p className="budget-info">예산: {giftRec.budget_range}</p>
            </div>
          </div>
          <p className="rec-count">{giftRec.cards.length}개의 추천 상품</p>
        </div>
        <div className="gift-cards-grid">
          {giftRec.cards.map((card, index) => (
            <GiftCard key={card.product_id} card={card} index={index} />
          ))}
        </div>
      </div>
    );
  }

  // 다른 모드들은 Phase 3-7에서 구현
  return (
    <div className="generic-recommendations">
      <p>추천 결과가 준비되었습니다.</p>
    </div>
  );
}

export default RecommendationPanel;
