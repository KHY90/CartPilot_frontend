/**
 * GiftCard 컴포넌트
 * GIFT 모드 전용 상품 카드
 */
import React from 'react';
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

  return (
    <div className="gift-card" onClick={handleClick}>
      <div className="gift-card-rank">#{index + 1}</div>

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
          <span className="reason-icon">💝</span>
          <p>{card.recommendation_reason}</p>
        </div>

        {card.warnings.length > 0 && (
          <div className="gift-card-warnings">
            {card.warnings.map((warning, i) => (
              <span key={i} className="warning-tag">
                ⚠️ {warning}
              </span>
            ))}
          </div>
        )}

        <button className="gift-card-button" onClick={(e) => e.stopPropagation()}>
          구매하기 →
        </button>
      </div>
    </div>
  );
}

export default GiftCard;
