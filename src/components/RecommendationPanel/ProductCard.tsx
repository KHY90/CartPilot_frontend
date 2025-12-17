/**
 * ProductCard 컴포넌트
 * 상품 추천 카드
 */
import React from 'react';
import { RecommendationCard } from '../../types';
import './ProductCard.css';

interface ProductCardProps {
  card: RecommendationCard;
}

function ProductCard({ card }: ProductCardProps) {
  const handleClick = () => {
    window.open(card.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {card.image && (
        <div className="card-image">
          <img src={card.image} alt={card.title} loading="lazy" />
        </div>
      )}

      <div className="card-content">
        <h3 className="card-title">{card.title}</h3>

        <div className="card-price">
          <span className="price">{card.price_display}</span>
          <span className="mall">{card.mall_name}</span>
        </div>

        <p className="card-reason">{card.recommendation_reason}</p>

        {card.warnings.length > 0 && (
          <div className="card-warnings">
            {card.warnings.map((warning, index) => (
              <span key={index} className="warning-tag">
                ⚠️ {warning}
              </span>
            ))}
          </div>
        )}

        {card.tier && (
          <div className="card-tier">
            <span className={`tier-badge ${card.tier}`}>{getTierLabel(card.tier)}</span>
            {card.tier_benefits && <p className="tier-benefits">✓ {card.tier_benefits}</p>}
            {card.tier_tradeoffs && <p className="tier-tradeoffs">△ {card.tier_tradeoffs}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    budget: '저가',
    standard: '표준',
    premium: '프리미엄',
  };
  return labels[tier] || tier;
}

export default ProductCard;
