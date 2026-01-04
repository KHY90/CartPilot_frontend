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
  checkPriceNow,
  getPriceAnalysis,
  addToWishlist,
  WishlistItem,
  PriceCheckResult,
  PriceAnalysis,
} from '../services/wishlistApi';
import PriceHistoryChart from '../components/PriceHistoryChart/PriceHistoryChart';
import './WishlistPage.css';

// 카테고리 목록
const CATEGORIES = [
  { value: 'food', label: '식음료' },
  { value: 'fashion', label: '패션/의류' },
  { value: 'electronics', label: '전자기기' },
  { value: 'beauty', label: '뷰티/화장품' },
  { value: 'home', label: '생활/가전' },
  { value: 'sports', label: '스포츠/레저' },
  { value: 'books', label: '도서/문구' },
  { value: 'kids', label: '유아/아동' },
  { value: 'pet', label: '반려동물' },
  { value: 'other', label: '기타' },
];

function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [editingTargetPrice, setEditingTargetPrice] = useState<string | null>(null);
  const [targetPriceInput, setTargetPriceInput] = useState('');

  // 수동 가격 체크 상태
  const [checkingPriceId, setCheckingPriceId] = useState<string | null>(null);
  const [priceCheckResult, setPriceCheckResult] = useState<{
    itemId: string;
    result: PriceCheckResult;
  } | null>(null);

  // 가격 분석 데이터 캐시
  const [priceAnalyses, setPriceAnalyses] = useState<Record<string, PriceAnalysis>>({});
  const [loadingAnalysisIds, setLoadingAnalysisIds] = useState<Set<string>>(new Set());

  // 직접 등록 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

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

  // 수동 가격 체크
  const handleCheckPrice = async (item: WishlistItem) => {
    setCheckingPriceId(item.id);

    try {
      const result = await checkPriceNow(item.id);

      // 가격이 변경되었으면 목록 업데이트
      if (result.price_changed) {
        setItems(items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                current_price: result.current_price,
                lowest_price_90days: result.lowest_90days || i.lowest_price_90days,
              }
            : i
        ));
      }

      // 결과 모달 표시
      setPriceCheckResult({ itemId: item.id, result });
    } catch (err) {
      alert('가격 확인에 실패했습니다.');
      console.error(err);
    } finally {
      setCheckingPriceId(null);
    }
  };

  const closePriceCheckResult = () => {
    setPriceCheckResult(null);
  };

  // 직접 상품 등록
  const handleAddManualItem = async () => {
    if (!newItemName.trim()) {
      alert('상품명을 입력해주세요.');
      return;
    }
    if (!newItemCategory) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    setIsAddingItem(true);

    try {
      const newItem = await addToWishlist({
        product_id: `manual_${Date.now()}`,
        product_name: newItemName.trim(),
        category: newItemCategory,
        current_price: 0, // 직접 등록은 가격 추적 불가
      });

      setItems([newItem, ...items]);
      setShowAddModal(false);
      setNewItemName('');
      setNewItemCategory('');
    } catch (err) {
      alert('상품 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setIsAddingItem(false);
    }
  };

  // 가격 분석 데이터 로드
  const loadPriceAnalysis = async (itemId: string) => {
    if (priceAnalyses[itemId] || loadingAnalysisIds.has(itemId)) {
      return;
    }

    setLoadingAnalysisIds((prev) => new Set(prev).add(itemId));

    try {
      const analysis = await getPriceAnalysis(itemId);
      setPriceAnalyses((prev) => ({ ...prev, [itemId]: analysis }));
    } catch (err) {
      console.error(`가격 분석 로드 실패 (${itemId}):`, err);
    } finally {
      setLoadingAnalysisIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // 아이템 로드 후 가격 분석 데이터도 로드
  useEffect(() => {
    if (items.length > 0) {
      items.forEach((item) => loadPriceAnalysis(item.id));
    }
  }, [items.length]);

  // 추천 배지 텍스트/스타일 결정
  const getRecommendationBadge = (recommendation: 'buy' | 'wait' | 'neutral') => {
    switch (recommendation) {
      case 'buy':
        return { text: '지금 구매 추천', className: 'badge-buy' };
      case 'wait':
        return { text: '대기 권장', className: 'badge-wait' };
      case 'neutral':
      default:
        return { text: '보통', className: 'badge-neutral' };
    }
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
        <div className="header-top">
          <div>
            <h2>관심상품</h2>
            <p className="wishlist-subtitle">
              가격 변동을 추적하고, 최저가일 때 알림을 받으세요
            </p>
          </div>
          <button className="add-manual-button" onClick={() => setShowAddModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            직접 등록
          </button>
        </div>
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

                  {/* 가격 분석 정보 */}
                  {priceAnalyses[item.id] && (
                    <div className="price-analysis-section">
                      <div className="analysis-header">
                        <span className="analysis-title">가격 분석</span>
                        <span className={`recommendation-badge ${getRecommendationBadge(priceAnalyses[item.id].recommendation).className}`}>
                          {getRecommendationBadge(priceAnalyses[item.id].recommendation).text}
                        </span>
                      </div>

                      <div className="analysis-stats">
                        {priceAnalyses[item.id].highest_90days && (
                          <div className="analysis-stat">
                            <span className="stat-label">90일 최고</span>
                            <span className="stat-value high">{formatPrice(priceAnalyses[item.id].highest_90days!)}</span>
                          </div>
                        )}
                        {priceAnalyses[item.id].average_90days && (
                          <div className="analysis-stat">
                            <span className="stat-label">90일 평균</span>
                            <span className="stat-value">{formatPrice(priceAnalyses[item.id].average_90days!)}</span>
                          </div>
                        )}
                        {priceAnalyses[item.id].price_change_percent !== undefined && (
                          <div className="analysis-stat">
                            <span className="stat-label">변동률</span>
                            <span className={`stat-value ${priceAnalyses[item.id].price_change_percent! < 0 ? 'down' : 'up'}`}>
                              {priceAnalyses[item.id].price_change_percent! > 0 ? '+' : ''}
                              {priceAnalyses[item.id].price_change_percent!.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {priceAnalyses[item.id].is_lowest && (
                        <div className="is-lowest-indicator">
                          현재 90일 최저가입니다!
                        </div>
                      )}
                    </div>
                  )}

                  {loadingAnalysisIds.has(item.id) && (
                    <div className="price-analysis-loading">
                      <div className="analysis-spinner" />
                      <span>분석 중...</span>
                    </div>
                  )}

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
                    className={`action-btn check-price-btn ${checkingPriceId === item.id ? 'loading' : ''}`}
                    onClick={() => handleCheckPrice(item)}
                    disabled={checkingPriceId === item.id}
                    title="지금 가격 확인"
                  >
                    {checkingPriceId === item.id ? (
                      <>
                        <div className="btn-spinner" />
                        확인 중...
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        가격 확인
                      </>
                    )}
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

      {/* 가격 체크 결과 모달 */}
      {priceCheckResult && (
        <div className="price-check-overlay" onClick={closePriceCheckResult}>
          <div className="price-check-modal" onClick={(e) => e.stopPropagation()}>
            <div className="price-check-header">
              <h3>가격 확인 결과</h3>
              <button className="close-button" onClick={closePriceCheckResult}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="price-check-content">
              {priceCheckResult.result.price_changed ? (
                <>
                  <div className={`price-change-indicator ${priceCheckResult.result.change_amount < 0 ? 'down' : 'up'}`}>
                    <span className="change-icon">
                      {priceCheckResult.result.change_amount < 0 ? '↓' : '↑'}
                    </span>
                    <span className="change-text">
                      {priceCheckResult.result.change_amount < 0 ? '가격 하락!' : '가격 상승'}
                    </span>
                  </div>

                  <div className="price-comparison">
                    <div className="price-item previous">
                      <span className="label">이전 가격</span>
                      <span className="value">{priceCheckResult.result.previous_price.toLocaleString()}원</span>
                    </div>
                    <div className="price-arrow">→</div>
                    <div className="price-item current">
                      <span className="label">현재 가격</span>
                      <span className="value">{priceCheckResult.result.current_price.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="change-details">
                    <span className={`change-amount ${priceCheckResult.result.change_amount < 0 ? 'down' : 'up'}`}>
                      {priceCheckResult.result.change_amount < 0 ? '' : '+'}
                      {priceCheckResult.result.change_amount.toLocaleString()}원
                      ({priceCheckResult.result.change_percent > 0 ? '+' : ''}
                      {priceCheckResult.result.change_percent.toFixed(1)}%)
                    </span>
                  </div>

                  {priceCheckResult.result.is_lowest && (
                    <div className="lowest-alert">
                      지금이 90일 최저가입니다!
                    </div>
                  )}
                </>
              ) : (
                <div className="no-change">
                  <div className="no-change-icon">✓</div>
                  <p>가격 변동이 없습니다.</p>
                  <p className="current-price-display">
                    현재 가격: {priceCheckResult.result.current_price.toLocaleString()}원
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 직접 등록 모달 */}
      {showAddModal && (
        <div className="add-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-modal-header">
              <h3>관심상품 직접 등록</h3>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="add-modal-content">
              <div className="form-group">
                <label>카테고리</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>상품명</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="예: 펩시 제로 500ml"
                  className="product-name-input"
                  autoFocus
                />
              </div>

              <p className="add-modal-note">
                직접 등록한 상품은 가격 추적이 불가능합니다.
              </p>
            </div>

            <div className="add-modal-actions">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowAddModal(false);
                  setNewItemName('');
                  setNewItemCategory('');
                }}
              >
                취소
              </button>
              <button
                className="submit-button"
                onClick={handleAddManualItem}
                disabled={isAddingItem}
              >
                {isAddingItem ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
