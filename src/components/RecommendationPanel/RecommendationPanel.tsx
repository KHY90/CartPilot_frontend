/**
 * RecommendationPanel 컴포넌트
 * 우측 추천 카드 영역 (5개씩 표시, 재추천 버튼으로 다음 5개)
 */
import { useState, useEffect } from 'react';
import {
  ChatResponse,
  GiftRecommendation,
  ValueRecommendation,
  BundleRecommendation,
  ReviewAnalysis,
  TrendSignal,
  RecommendationCard,
  IntentType
} from '../../types';
import GiftCard from './GiftCard';
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

  // GIFT 모드 (5개씩 페이징)
  if (intent === 'GIFT' && 'cards' in recommendations) {
    const giftRec = recommendations as GiftRecommendation;
    return <GiftRecommendationWithPaging recommendation={giftRec} />;
  }

  // VALUE 모드
  if (intent === 'VALUE' && 'budget_tier' in recommendations) {
    const valueRec = recommendations as ValueRecommendation;
    return (
      <div className="value-recommendations">
        <div className="rec-summary">
          <div className="summary-header">
            <span className="value-icon">💰</span>
            <div>
              <p className="category">
                <strong>{valueRec.category}</strong> 가성비 추천
              </p>
              <p className="tier-info">가격대별 추천 상품</p>
            </div>
          </div>
        </div>

        {/* 저가 티어 */}
        {valueRec.budget_tier.length > 0 && (
          <div className="tier-section budget">
            <div className="tier-header">
              <span className="tier-badge budget">💵 저가</span>
              <span className="tier-desc">가성비 최우선</span>
            </div>
            <div className="tier-cards">
              {valueRec.budget_tier.map((card) => (
                <ValueCard key={card.product_id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* 표준 티어 */}
        {valueRec.standard_tier.length > 0 && (
          <div className="tier-section standard">
            <div className="tier-header">
              <span className="tier-badge standard">⚖️ 표준</span>
              <span className="tier-desc">가격 대비 성능 균형</span>
            </div>
            <div className="tier-cards">
              {valueRec.standard_tier.map((card) => (
                <ValueCard key={card.product_id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* 프리미엄 티어 */}
        {valueRec.premium_tier.length > 0 && (
          <div className="tier-section premium">
            <div className="tier-header">
              <span className="tier-badge premium">👑 프리미엄</span>
              <span className="tier-desc">최고 품질/기능</span>
            </div>
            <div className="tier-cards">
              {valueRec.premium_tier.map((card) => (
                <ValueCard key={card.product_id} card={card} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // BUNDLE 모드
  if (intent === 'BUNDLE' && 'combinations' in recommendations) {
    const bundleRec = recommendations as BundleRecommendation;
    return (
      <div className="bundle-recommendations">
        <div className="rec-summary">
          <div className="summary-header">
            <span className="bundle-icon">📦</span>
            <div>
              <p className="category">
                <strong>{bundleRec.items_count}개 품목</strong> 묶음 구매
              </p>
              <p className="budget-info">예산: {bundleRec.total_budget.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        {bundleRec.combinations.map((combo) => (
          <div key={combo.combination_id} className={`bundle-combo ${combo.budget_fit ? 'fit' : 'over'}`}>
            <div className="combo-header">
              <span className="combo-badge">조합 {combo.combination_id}</span>
              <span className={`combo-total ${combo.budget_fit ? 'fit' : 'over'}`}>
                {combo.total_display}
                {!combo.budget_fit && ' (예산 초과)'}
              </span>
            </div>
            {combo.adjustment_note && (
              <p className="adjustment-note">💡 {combo.adjustment_note}</p>
            )}
            <div className="combo-items">
              {combo.items.map((item) => (
                <div key={item.item_category} className="bundle-item">
                  <p className="item-category">{item.item_category}</p>
                  <BundleProductCard card={item.product} />
                  {item.alternatives.length > 0 && (
                    <div className="alternatives">
                      <p className="alt-label">대체 옵션:</p>
                      {item.alternatives.map((alt) => (
                        <a key={alt.product_id} href={alt.link} target="_blank" rel="noopener noreferrer" className="alt-item">
                          {alt.title.slice(0, 30)}... - {alt.price_display}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // REVIEW 모드
  if (intent === 'REVIEW' && 'top_complaints' in recommendations) {
    const reviewRec = recommendations as ReviewAnalysis;
    return (
      <div className="review-recommendations">
        <div className="rec-summary">
          <div className="summary-header">
            <span className="review-icon">📝</span>
            <div>
              <p className="category">
                <strong>{reviewRec.product_category}</strong> 리뷰 분석
              </p>
              <p className={`sentiment ${reviewRec.overall_sentiment}`}>
                전반적 평가: {reviewRec.overall_sentiment === 'positive' ? '긍정적 👍' : reviewRec.overall_sentiment === 'negative' ? '부정적 👎' : '보통 🤔'}
              </p>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h4>⚠️ 주요 불만/단점</h4>
          <ul className="complaints-list">
            {reviewRec.top_complaints.map((c) => (
              <li key={c.rank} className={`complaint severity-${c.severity}`}>
                <span className="rank">#{c.rank}</span>
                <span className="issue">{c.issue}</span>
                <span className={`severity ${c.severity}`}>{c.severity === 'high' ? '심각' : c.severity === 'medium' ? '보통' : '낮음'}</span>
              </li>
            ))}
          </ul>
        </div>

        {reviewRec.not_recommended_conditions.length > 0 && (
          <div className="review-section">
            <h4>🚫 이런 경우엔 비추천</h4>
            <ul className="conditions-list">
              {reviewRec.not_recommended_conditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {reviewRec.management_tips.length > 0 && (
          <div className="review-section">
            <h4>💡 관리/사용 팁</h4>
            <ul className="tips-list">
              {reviewRec.management_tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="disclaimer">{reviewRec.disclaimer}</p>
      </div>
    );
  }

  // TREND 모드
  if (intent === 'TREND' && 'trending_items' in recommendations) {
    const trendRec = recommendations as TrendSignal;
    return (
      <div className="trend-recommendations">
        <div className="rec-summary">
          <div className="summary-header">
            <span className="trend-icon">📈</span>
            <div>
              <p className="category">
                <strong>요즘 뜨는 상품</strong>
              </p>
              <p className="data-source">출처: {trendRec.data_source}</p>
            </div>
          </div>
        </div>

        {trendRec.trending_items.map((item, index) => (
          <div key={index} className="trend-item">
            <div className="trend-header">
              <span className="trend-keyword">{item.keyword}</span>
              {item.growth_rate && <span className="growth-rate">{item.growth_rate}</span>}
            </div>
            <div className="trend-meta">
              <span className="period">{item.period}</span>
              {item.target_segment && <span className="segment">{item.target_segment}</span>}
            </div>
            {item.products.length > 0 && (
              <div className="trend-products">
                {item.products.map((p) => (
                  <a key={p.product_id} href={p.link} target="_blank" rel="noopener noreferrer" className="trend-product">
                    {p.image && <img src={p.image} alt={p.title} />}
                    <div className="product-info">
                      <p className="title">{p.title}</p>
                      <p className="price">{p.price_display}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <p className="disclaimer">{trendRec.disclaimer}</p>
      </div>
    );
  }

  // 기타
  return (
    <div className="generic-recommendations">
      <p>추천 결과가 준비되었습니다.</p>
    </div>
  );
}

// BUNDLE 모드용 카드 컴포넌트
function BundleProductCard({ card }: { card: RecommendationCard }) {
  return (
    <a href={card.link} target="_blank" rel="noopener noreferrer" className="bundle-product-card">
      {card.image && <img src={card.image} alt={card.title} />}
      <div className="product-info">
        <p className="title">{card.title}</p>
        <p className="price">{card.price_display}</p>
        <p className="mall">{card.mall_name}</p>
      </div>
    </a>
  );
}

// GIFT 모드 - 5개씩 페이징 컴포넌트
function GiftRecommendationWithPaging({ recommendation }: { recommendation: GiftRecommendation }) {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [allCards] = useState(recommendation.cards);

  // 새 추천이 오면 페이지 초기화
  useEffect(() => {
    setCurrentPage(0);
  }, [recommendation]);

  const totalPages = Math.ceil(allCards.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleCards = allCards.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const hasMore = currentPage < totalPages - 1;
  const hasPrev = currentPage > 0;

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="gift-recommendations">
      <div className="rec-summary">
        <div className="summary-header">
          <span className="gift-icon">🎁</span>
          <div>
            <p className="recipient">
              <strong>{recommendation.recipient_summary}</strong>
              {recommendation.occasion && <span className="occasion"> · {recommendation.occasion}</span>}
            </p>
            <p className="budget-info">예산: {recommendation.budget_range}</p>
          </div>
        </div>
        <p className="rec-count">
          {allCards.length}개 중 {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, allCards.length)}번째
        </p>
      </div>

      <div className="gift-cards-grid">
        {visibleCards.map((card, index) => (
          <GiftCard key={card.product_id} card={card} index={index} />
        ))}
      </div>

      {/* 페이징 버튼 */}
      {totalPages > 1 ? (
        <div className="paging-controls">
          <button
            className="paging-button prev"
            onClick={handlePrevPage}
            disabled={!hasPrev}
          >
            ← 이전
          </button>
          <span className="page-info">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className="paging-button next"
            onClick={handleNextPage}
            disabled={!hasMore}
          >
            다른 추천 →
          </button>
        </div>
      ) : (
        <div className="no-more-hint">
          <p>마음에 드는 상품이 없으신가요?</p>
          <p className="hint-sub">다른 조건으로 다시 검색해 보세요!</p>
        </div>
      )}
    </div>
  );
}

// VALUE 모드용 카드 컴포넌트
function ValueCard({ card }: { card: RecommendationCard }) {
  return (
    <div className="value-card">
      <a href={card.link} target="_blank" rel="noopener noreferrer" className="card-link">
        <div className="card-image">
          {card.image ? (
            <img src={card.image} alt={card.title} loading="lazy" />
          ) : (
            <div className="no-image">이미지 없음</div>
          )}
        </div>
        <div className="card-content">
          <h4 className="card-title">{card.title}</h4>
          <p className="card-price">{card.price_display}</p>
          <p className="card-mall">{card.mall_name}</p>
        </div>
      </a>
      <div className="card-details">
        <p className="recommendation-reason">{card.recommendation_reason}</p>
        {card.tier_benefits && (
          <p className="tier-benefits">
            <span className="label">✓ 장점:</span> {card.tier_benefits}
          </p>
        )}
        {card.tier_tradeoffs && (
          <p className="tier-tradeoffs">
            <span className="label">△ 단점:</span> {card.tier_tradeoffs}
          </p>
        )}
        {card.warnings.length > 0 && (
          <ul className="warnings">
            {card.warnings.map((w, i) => (
              <li key={i}>⚠️ {w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RecommendationPanel;
