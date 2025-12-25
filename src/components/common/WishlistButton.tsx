/**
 * 관심상품 추가/제거 버튼 (하트 아이콘)
 */
import { useState } from 'react';
import './WishlistButton.css';

interface WishlistButtonProps {
  isWishlisted: boolean;
  onToggle: () => Promise<void>;
  size?: 'small' | 'medium' | 'large';
}

function WishlistButton({ isWishlisted, onToggle, size = 'medium' }: WishlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-button wishlist-button--${size} ${isWishlisted ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={isWishlisted ? '관심상품 해제' : '관심상품 등록'}
      title={isWishlisted ? '관심상품 해제' : '관심상품 등록'}
    >
      <svg viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

export default WishlistButton;
