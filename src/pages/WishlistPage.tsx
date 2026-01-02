/**
 * 관심상품 페이지
 * 관심상품 목록, 가격 추이, 알림 설정 관리
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getWishlist,
  removeFromWishlist,
  updateWishlistItem,
  WishlistItem,
} from '../services/wishlistApi';
import PriceHistoryChart from '../components/PriceHistoryChart/PriceHistoryChart';
import './WishlistPage.css';

function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [editingTargetPrice, setEditingTargetPrice] = useState<string | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [isAuthenticated, navigate]);

  const loadWishlist = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getWishlist();
      setItems(data);
    } catch (err) {
      setError('관심상품을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('이 상품을 관심상품에서 삭제하시겠습니까?')) return;

    try {
      await removeFromWishlist(itemId);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleToggleNotification = async (item: WishlistItem) => {
    try {
      const updated = await updateWishlistItem(item.id, {
        notification_enabled: !item.notification_enabled,
      });
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      alert('알림 설정 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleSetTargetPrice = async (itemId: string) => {
    const price = parseInt(targetPriceInput.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      alert('올바른 가격을 입력해주세요.');
      return;
    }

    try {
      const updated = await updateWishlistItem(itemId, { target_price: price });
      setItems(items.map((i) => (i.id === itemId ? updated : i)));
      setEditingTargetPrice(null);
      setTargetPriceInput('');
    } catch (err) {
      alert('목표가 설정에 실패했습니다.');
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const getPriceStatus = (item: WishlistItem) => {
    if (!item.lowest_price_90days) return null;

    if (item.current_price <= item.lowest_price_90days) {
      return { label: '90일 최저가', className: 'status-lowest' };
    }

    const diff = ((item.current_price - item.lowest_price_90days) / item.lowest_price_90days) * 100;
    if (diff <= 5) {
      return { label: '최저가 근접', className: 'status-near' };
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-loading">
          <div className="spinner" />
          <p>관심상품 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-error">
          <p>{error}</p>
          <button onClick={loadWishlist}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h2>관심상품</h2>
        <p className="wishlist-subtitle">
          가격 변동을 추적하고, 최저가일 때 알림을 받으세요
        </p>
      </div>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3>아직 관심상품이 없습니다</h3>
          <p>상품 추천 결과에서 하트 버튼을 눌러 관심상품을 등록하세요.</p>
          <button className="go-home-button" onClick={() => navigate('/')}>
            상품 검색하러 가기
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const priceStatus = getPriceStatus(item);

            return (
              <div key={item.id} className="wishlist-card">
                <div className="card-image">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} />
                  ) : (
                    <div className="no-image">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21,15 16,10 5,21" />
                      </svg>
                    </div>
                  )}
                  {priceStatus && (
                    <span className={`price-status-badge ${priceStatus.className}`}>
                      {priceStatus.label}
                    </span>
                  )}
                </div>

                <div className="card-content">
                  <div className="card-mall">{item.mall_name || '쇼핑몰'}</div>
                  <h4 className="card-title">{item.product_name}</h4>

                  <div className="price-info">
                    <div className="current-price">
                      <span className="price-label">현재가</span>
                      <span className="price-value">{formatPrice(item.current_price)}</span>
                    </div>
                    {item.lowest_price_90days && (
                      <div className="lowest-price">
                        <span className="price-label">90일 최저</span>
                        <span className="price-value">{formatPrice(item.lowest_price_90days)}</span>
                      </div>
                    )}
                  </div>

                  <div className="target-price-section">
                    {editingTargetPrice === item.id ? (
                      <div className="target-price-edit">
                        <input
                          type="text"
                          value={targetPriceInput}
                          onChange={(e) => setTargetPriceInput(e.target.value)}
                          placeholder="목표가 입력"
                          autoFocus
                        />
                        <button className="save-btn" onClick={() => handleSetTargetPrice(item.id)}>
                          저장
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => {
                            setEditingTargetPrice(null);
                            setTargetPriceInput('');
                          }}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="target-price-display">
                        <span className="price-label">목표가</span>
                        <span
                          className="price-value clickable"
                          onClick={() => {
                            setEditingTargetPrice(item.id);
                            setTargetPriceInput(item.target_price?.toString() || '');
                          }}
                        >
                          {item.target_price ? formatPrice(item.target_price) : '설정하기'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-meta">
                    <span className="added-date">등록: {formatDate(item.created_at)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="action-btn chart-btn"
                    onClick={() => setSelectedItem(item)}
                    title="가격 추이 보기"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                    </svg>
                    가격 추이
                  </button>

                  <button
                    className={`action-btn notification-btn ${item.notification_enabled ? 'active' : ''}`}
                    onClick={() => handleToggleNotification(item)}
                    title={item.notification_enabled ? '알림 끄기' : '알림 켜기'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {item.notification_enabled ? '알림 ON' : '알림 OFF'}
                  </button>

                  <a
                    href={item.product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn link-btn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15,3 21,3 21,9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    상품 보기
                  </a>

                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(item.id)}
                    title="삭제"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <PriceHistoryChart
          itemId={selectedItem.id}
          currentPrice={selectedItem.current_price}
          lowestPrice90days={selectedItem.lowest_price_90days}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default WishlistPage;
