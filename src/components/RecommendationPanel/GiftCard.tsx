/**
 * GiftCard 컴포넌트
 * GIFT 모드 전용 상품 카드
 */
import { useState, useEffect } from 'react';
import { RecommendationCard } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import WishlistButton from '../common/WishlistButton';
import StarRating from '../common/StarRating';
import { addToWishlist, removeFromWishlist, getWishlist } from '../../services/wishlistApi';
import { rateProduct, getRatingForProduct } from '../../services/ratingsApi';
import './GiftCard.css';

interface GiftCardProps {
  card: RecommendationCard;
  index: number;
}

function GiftCard({ card, index }: GiftCardProps) {
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

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

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(card.link, '_blank', 'noopener,noreferrer');
  };

  const rankClass = index < 3 ? `top-${index + 1}` : '';

  return (
    <div className="gift-card">
      <div className={`gift-card-rank ${rankClass}`}>#{index + 1}</div>

      <div className="gift-card-image">
        {card.image ? (
          <img src={card.image} alt={card.title} loading="lazy" />
        ) : (
          <div className="gift-card-no-image">이미지 없음</div>
        )}
        {isAuthenticated && (
          <div className="gift-card-wishlist">
            <WishlistButton
              isWishlisted={isWishlisted}
              onToggle={handleWishlistToggle}
              size="medium"
            />
          </div>
        )}
      </div>

      <div className="gift-card-content">
        <h3 className="gift-card-title">{card.title}</h3>

        <div className="gift-card-price">
          <span className="price">{card.price_display}</span>
          <span className="mall">{card.mall_name}</span>
        </div>

        {isAuthenticated && (
          <div className="gift-card-rating">
            <StarRating rating={rating} onRate={handleRate} size="small" />
            {rating > 0 && <span className="rating-text">{rating}점</span>}
          </div>
        )}

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

        <button className="gift-card-button" onClick={handleBuyClick}>
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
