/**
 * GiftCard 컴포넌트
 * GIFT 모드 전용 상품 카드
 */
import { RecommendationCard } from '../../types';
import './GiftCard.css';

interface GiftCardProps {
  card: RecommendationCard;
  index: number;
}

function GiftCard({ card, index }: GiftCardProps) {
  const handleClick = () => {
    window.open(card.link, '_blank', 'noopener,noreferrer');
  };

  const rankClass = index < 3 ? `top-${index + 1}` : '';

  return (
    <div className="gift-card" onClick={handleClick}>
      <div className={`gift-card-rank ${rankClass}`}>#{index + 1}</div>

      {card.image && (
        <div className="gift-card-image">
          <img src={card.image} alt={card.title} loading="lazy" />
        </div>
      )}

      <div className="gift-card-content">
        <h3 className="gift-card-title">{card.title}</h3>

        <div className="gift-card-price">
          <span className="price">{card.price_display}</span>
          <span className="mall">{card.mall_name}</span>
        </div>

        <div className="gift-card-reason">
          <svg className="reason-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p>{card.recommendation_reason}</p>
        </div>

        {card.warnings.length > 0 && (
          <div className="gift-card-warnings">
            {card.warnings.map((warning, i) => (
              <span key={i} className="warning-tag">
                {warning}
              </span>
            ))}
          </div>
        )}

        <button className="gift-card-button" onClick={(e) => e.stopPropagation()}>
          구매하기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default GiftCard;
