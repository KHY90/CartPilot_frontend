/**
 * ProductCardSkeleton 컴포넌트
 * 상품 카드 로딩 플레이스홀더
 */
import Skeleton from '../common/Skeleton';
import './ProductCardSkeleton.css';

interface ProductCardSkeletonProps {
  count?: number;
}

function ProductCardSkeleton({ count = 3 }: ProductCardSkeletonProps) {
  return (
    <div className="product-card-skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-card-skeleton">
          {/* 이미지 영역 */}
          <div className="skeleton-image">
            <Skeleton width="100%" height="160px" borderRadius="8px" />
          </div>

          {/* 콘텐츠 영역 */}
          <div className="skeleton-content">
            {/* 제목 */}
            <Skeleton width="90%" height="18px" className="skeleton-title" />
            <Skeleton width="60%" height="18px" className="skeleton-title-sub" />

            {/* 가격 및 쇼핑몰 */}
            <div className="skeleton-price-row">
              <Skeleton width="80px" height="22px" />
              <Skeleton width="50px" height="16px" />
            </div>

            {/* 별점 */}
            <div className="skeleton-rating">
              <Skeleton width="100px" height="16px" />
            </div>

            {/* 추천 이유 */}
            <Skeleton width="100%" height="14px" className="skeleton-reason" />
            <Skeleton width="70%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductCardSkeleton;
