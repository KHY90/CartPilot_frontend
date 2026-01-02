/**
 * ProductCard 컴포넌트
 * 상품 추천 카드 (별점, 관심상품 기능 포함)
 */
import { useState, useEffect } from 'react';
import { RecommendationCard } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from '../common/StarRating';
import WishlistButton from '../common/WishlistButton';
import { rateProduct, getRatingForProduct } from '../../services/ratingsApi';
import { addToWishlist, removeFromWishlist, getWishlist } from '../../services/wishlistApi';
import './ProductCard.css';

interface ProductCardProps {
  card: RecommendationCard;
}

function ProductCard({ card }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);

  // 초기 상태 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, card.product_id]);

  const loadUserData = async () => {
    try {
      // 별점 로드
      const existingRating = await getRatingForProduct(card.product_id);
      if (existingRating) {
        setRating(existingRating.rating);
      }

      // 관심상품 여부 확인
      const wishlist = await getWishlist();
      const item = wishlist.find((w) => w.product_id === card.product_id);
      if (item) {
        setIsWishlisted(true);
        setWishlistItemId(item.id);
      }
    } catch {
      // 조용히 실패
    }
  };

  const handleClick = () => {
    window.open(card.link, '_blank', 'noopener,noreferrer');
  };

  const handleRate = async (newRating: number) => {
    if (!isAuthenticated) return;

    try {
      await rateProduct({
        product_id: card.product_id,
        product_name: card.title,
        price: card.price,
        rating: newRating,
      });
      setRating(newRating);
    } catch {
      // 에러 처리
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) return;

    try {
      if (isWishlisted && wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
        setIsWishlisted(false);
        setWishlistItemId(null);
      } else {
        const item = await addToWishlist({
          product_id: card.product_id,
          product_name: card.title,
          product_image: card.image,
          product_link: card.link,
          mall_name: card.mall_name,
          current_price: card.price,
        });
        setIsWishlisted(true);
        setWishlistItemId(item.id);
      }
    } catch {
      // 에러 처리
    }
  };

  return (
    <div className="product-card">
      {card.image && (
        <div className="card-image" onClick={handleClick}>
          <img src={card.image} alt={card.title} loading="lazy" />
          {isAuthenticated && (
            <div className="card-wishlist">
              <WishlistButton
                isWishlisted={isWishlisted}
                onToggle={handleWishlistToggle}
                size="medium"
              />
            </div>
          )}
        </div>
      )}

      <div className="card-content">
        <h3 className="card-title" onClick={handleClick}>{card.title}</h3>

        <div className="card-price">
          <span className="price">{card.price_display}</span>
          <span className="mall">{card.mall_name}</span>
        </div>

        {isAuthenticated && (
          <div className="card-rating">
            <StarRating rating={rating} onRate={handleRate} size="small" />
            {rating > 0 && <span className="rating-text">{rating}점</span>}
          </div>
        )}

        <p className="card-reason">{card.recommendation_reason}</p>

        {card.warnings.length > 0 && (
          <div className="card-warnings">
            {card.warnings.map((warning, index) => (
              <span key={index} className="warning-tag">
                {warning}
              </span>
            ))}
          </div>
        )}

        {card.tier && (
          <div className="card-tier">
            <span className={`tier-badge ${card.tier}`}>{getTierLabel(card.tier)}</span>
            {card.tier_benefits && <p className="tier-benefits">{card.tier_benefits}</p>}
            {card.tier_tradeoffs && <p className="tier-tradeoffs">{card.tier_tradeoffs}</p>}
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
