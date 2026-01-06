/**
 * 가격 예측 컴포넌트
 * 추세 분석, 세일 정보, 구매 추천 표시
 */
import { useState, useEffect } from 'react';
import { getPricePrediction, PricePrediction as PricePredictionType } from '../../services/wishlistApi';
import './PricePrediction.css';

interface PricePredictionProps {
  itemId: string;
  productName: string;
  onClose: () => void;
}

function PricePrediction({ itemId, productName, onClose }: PricePredictionProps) {
  const [prediction, setPrediction] = useState<PricePredictionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrediction();
  }, [itemId]);

  const loadPrediction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getPricePrediction(itemId);
      setPrediction(data);
    } catch (err) {
      setError('가격 예측 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return { icon: '📈', label: '상승 추세', className: 'trend-up' };
      case 'down':
        return { icon: '📉', label: '하락 추세', className: 'trend-down' };
      case 'stable':
        return { icon: '➡️', label: '안정', className: 'trend-stable' };
    }
  };

  const getRecommendationStyle = (rec: 'buy_now' | 'wait' | 'neutral') => {
    switch (rec) {
      case 'buy_now':
        return { icon: '🛒', className: 'rec-buy', label: '지금 구매' };
      case 'wait':
        return { icon: '⏳', className: 'rec-wait', label: '대기 추천' };
      case 'neutral':
        return { icon: '🤔', className: 'rec-neutral', label: '중립' };
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return { label: '높음', className: 'conf-high' };
    if (confidence >= 0.5) return { label: '보통', className: 'conf-medium' };
    return { label: '낮음', className: 'conf-low' };
  };

  return (
    <div className="prediction-overlay" onClick={onClose}>
      <div className="prediction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prediction-header">
          <h3>가격 예측</h3>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="prediction-product-name">{productName}</p>

        {isLoading ? (
          <div className="prediction-loading">
            <div className="spinner" />
            <p>분석 중...</p>
          </div>
        ) : error ? (
          <div className="prediction-error">
            <p>{error}</p>
            <button onClick={loadPrediction}>다시 시도</button>
          </div>
        ) : prediction ? (
          <div className="prediction-content">
            {/* 구매 추천 */}
            <div className={`recommendation-box ${getRecommendationStyle(prediction.buy_recommendation).className}`}>
              <div className="rec-header">
                <span className="rec-icon">{getRecommendationStyle(prediction.buy_recommendation).icon}</span>
                <span className="rec-label">{getRecommendationStyle(prediction.buy_recommendation).label}</span>
              </div>
              <p className="rec-reason">{prediction.recommendation_reason}</p>
              <p className="rec-timing">{prediction.best_buy_timing}</p>
            </div>

            {/* 가격 추세 */}
            <div className="trend-section">
              <h4>가격 추세</h4>
              <div className={`trend-box ${getTrendIcon(prediction.trend.direction).className}`}>
                <span className="trend-icon">{getTrendIcon(prediction.trend.direction).icon}</span>
                <div className="trend-info">
                  <span className="trend-label">{getTrendIcon(prediction.trend.direction).label}</span>
                  <span className="trend-rate">
                    {prediction.trend.change_rate > 0 ? '+' : ''}{prediction.trend.change_rate}%
                    <span className="trend-period"> (최근 {prediction.trend.period_days}일)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 가격 정보 */}
            <div className="price-info-section">
              <h4>가격 정보</h4>
              <div className="price-grid">
                <div className="price-item">
                  <span className="price-label">현재가</span>
                  <span className="price-value current">{formatPrice(prediction.current_price)}</span>
                </div>
                {prediction.lowest_price_90d && (
                  <div className="price-item">
                    <span className="price-label">90일 최저</span>
                    <span className="price-value lowest">{formatPrice(prediction.lowest_price_90d)}</span>
                  </div>
                )}
                {prediction.highest_price_90d && (
                  <div className="price-item">
                    <span className="price-label">90일 최고</span>
                    <span className="price-value highest">{formatPrice(prediction.highest_price_90d)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 예측 가격 */}
            {(prediction.predicted_price_7d || prediction.predicted_price_30d) && (
              <div className="predicted-section">
                <h4>예상 가격</h4>
                <div className="predicted-grid">
                  {prediction.predicted_price_7d && (
                    <div className="predicted-item">
                      <span className="predicted-label">7일 후</span>
                      <span className={`predicted-value ${prediction.predicted_price_7d < prediction.current_price ? 'down' : 'up'}`}>
                        {formatPrice(prediction.predicted_price_7d)}
                      </span>
                    </div>
                  )}
                  {prediction.predicted_price_30d && (
                    <div className="predicted-item">
                      <span className="predicted-label">30일 후</span>
                      <span className={`predicted-value ${prediction.predicted_price_30d < prediction.current_price ? 'down' : 'up'}`}>
                        {formatPrice(prediction.predicted_price_30d)}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`confidence-badge ${getConfidenceLabel(prediction.confidence).className}`}>
                  예측 신뢰도: {getConfidenceLabel(prediction.confidence).label} ({Math.round(prediction.confidence * 100)}%)
                </div>
              </div>
            )}

            {/* 예상 세일 일정 */}
            {prediction.upcoming_sales.length > 0 && (
              <div className="sales-section">
                <h4>예상 세일 일정</h4>
                <p className="sales-disclaimer">
                  * 과거 세일 패턴 기반 예상 일정입니다. 실제 할인 여부와 할인율은 쇼핑몰에서 직접 확인하세요.
                </p>
                <div className="sales-list">
                  {prediction.upcoming_sales.map((sale, index) => (
                    <div key={index} className={`sale-item ${sale.applicable ? 'applicable' : 'not-applicable'}`}>
                      <div className="sale-header">
                        <span className="sale-name">{sale.name}</span>
                        {sale.days_until === 0 ? (
                          <span className="sale-badge ongoing">예상 기간</span>
                        ) : (
                          <span className="sale-badge">D-{sale.days_until}</span>
                        )}
                      </div>
                      <div className="sale-info">
                        <span className="sale-dates">{sale.start_date} ~ {sale.end_date}</span>
                        <span className="sale-discount">예상 할인 ~{sale.expected_discount}%</span>
                      </div>
                      {!sale.applicable && (
                        <span className="not-applicable-badge">카테고리 미적용</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 분석 정보 */}
            <div className="analysis-meta">
              <span>분석 데이터: {prediction.history_points}개</span>
              <span>분석 시점: {new Date(prediction.analyzed_at).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PricePrediction;
