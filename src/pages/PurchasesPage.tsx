/**
 * 구매 기록 페이지
 * 수동 입력 기반 구매 이력 관리
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPurchases,
  createPurchase,
  deletePurchase,
  updatePurchase,
  getPurchaseStats,
  getCategories,
  PurchaseRecord,
  PurchaseStats,
  PurchaseCreate,
  PurchaseUpdate,
} from '../services/purchasesApi';
import { getCachedSearchResults, CachedProduct } from '../services/api';
import './PurchasesPage.css';

function PurchasesPage() {
  const { isAuthenticated } = useAuth();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 추가 폼 상태
  const [formData, setFormData] = useState<PurchaseCreate>({
    product_name: '',
    category: '',
    mall_name: '',
    price: 0,
    quantity: 1,
    purchased_at: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // 수정 모달 상태
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseRecord | null>(null);
  const [editFormData, setEditFormData] = useState<PurchaseUpdate>({
    product_name: '',
    category: '',
    mall_name: '',
    price: 0,
    quantity: 1,
    purchased_at: '',
    notes: '',
  });

  // 검색 결과에서 추가 모달 상태
  const [showSearchResultsModal, setShowSearchResultsModal] = useState(false);
  const [searchResults, setSearchResults] = useState<CachedProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [searchResultsError, setSearchResultsError] = useState<string | null>(null);
  const [isAddingFromSearch, setIsAddingFromSearch] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [purchaseData, statsData, categoryData] = await Promise.all([
        getPurchases(50, 0, selectedCategory || undefined),
        getPurchaseStats(),
        getCategories(),
      ]);
      setPurchases(purchaseData);
      setStats(statsData);
      setCategories(categoryData);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPurchase = await createPurchase({
        ...formData,
        purchased_at: new Date(formData.purchased_at).toISOString(),
      });
      setPurchases([newPurchase, ...purchases]);
      setShowForm(false);
      setFormData({
        product_name: '',
        category: '',
        mall_name: '',
        price: 0,
        quantity: 1,
        purchased_at: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadData(); // 통계 갱신
    } catch (error) {
      console.error('구매 기록 저장 실패:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 구매 기록을 삭제하시겠습니까?')) return;

    try {
      await deletePurchase(id);
      setPurchases(purchases.filter((p) => p.id !== id));
      loadData(); // 통계 갱신
    } catch (error) {
      console.error('삭제 실패:', error);
    }
  };

  // 수정 모달 열기
  const handleEditClick = (purchase: PurchaseRecord) => {
    setEditingPurchase(purchase);
    setEditFormData({
      product_name: purchase.product_name,
      category: purchase.category || '',
      mall_name: purchase.mall_name || '',
      price: purchase.price,
      quantity: purchase.quantity,
      purchased_at: new Date(purchase.purchased_at).toISOString().split('T')[0],
      notes: purchase.notes || '',
    });
    setShowEditForm(true);
  };

  // 수정 모달 닫기
  const handleEditClose = () => {
    setShowEditForm(false);
    setEditingPurchase(null);
    setEditFormData({
      product_name: '',
      category: '',
      mall_name: '',
      price: 0,
      quantity: 1,
      purchased_at: '',
      notes: '',
    });
  };

  // 수정 제출
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPurchase) return;

    try {
      const updatedPurchase = await updatePurchase(editingPurchase.id, {
        ...editFormData,
        purchased_at: new Date(editFormData.purchased_at!).toISOString(),
      });

      // 목록 업데이트
      setPurchases(purchases.map((p) => (p.id === editingPurchase.id ? updatedPurchase : p)));

      // 모달 닫기
      handleEditClose();

      // 통계 갱신
      loadData();
    } catch (error) {
      console.error('구매 기록 수정 실패:', error);
      alert('구매 기록 수정에 실패했습니다.');
    }
  };

  // 검색 결과 모달 열기
  const handleOpenSearchResults = async () => {
    setShowSearchResultsModal(true);
    setIsLoadingResults(true);
    setSearchResultsError(null);
    setSelectedProducts(new Set());

    try {
      const sessionId = localStorage.getItem('cartpilot_last_session_id');
      if (!sessionId) {
        setSearchResultsError('최근 검색 기록이 없습니다. 먼저 상품을 검색해 주세요.');
        return;
      }

      const results = await getCachedSearchResults(sessionId);
      setSearchResults(results.products);
    } catch (error) {
      setSearchResultsError('검색 결과를 불러올 수 없습니다. 먼저 상품을 검색해 주세요.');
      console.error(error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // 상품 선택 토글
  const handleToggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedProducts.size === searchResults.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(searchResults.map((p) => p.product_id)));
    }
  };

  // 선택된 상품들 구매 기록에 추가
  const handleAddSelectedProducts = async () => {
    if (selectedProducts.size === 0) {
      alert('추가할 상품을 선택해 주세요.');
      return;
    }

    setIsAddingFromSearch(true);

    try {
      const today = new Date().toISOString();
      const selectedItems = searchResults.filter((p) => selectedProducts.has(p.product_id));

      // 순차적으로 추가
      for (const item of selectedItems) {
        await createPurchase({
          product_name: item.title,
          mall_name: item.mall_name,
          price: item.price,
          quantity: 1,
          purchased_at: today,
        });
      }

      // 모달 닫기 및 데이터 새로고침
      setShowSearchResultsModal(false);
      setSelectedProducts(new Set());
      loadData();

      alert(`${selectedItems.length}개 상품이 구매 기록에 추가되었습니다.`);
    } catch (error) {
      console.error('구매 기록 추가 실패:', error);
      alert('일부 상품 추가에 실패했습니다.');
    } finally {
      setIsAddingFromSearch(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="purchases-page">
        <div className="auth-required">
          <p>구매 기록을 관리하려면 로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-page">
      <header className="page-header">
        <h1>구매 기록</h1>
        <div className="header-actions">
          <button className="btn-purple" onClick={handleOpenSearchResults}>
            + 검색 결과에서 추가
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + 구매 기록 추가
          </button>
        </div>
      </header>

      {/* 통계 카드 */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">총 구매 횟수</span>
            <span className="stat-value">{stats.total_purchases}회</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">총 지출</span>
            <span className="stat-value">{stats.total_spent.toLocaleString()}원</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">평균 구매가</span>
            <span className="stat-value">{Math.round(stats.average_price).toLocaleString()}원</span>
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* 구매 기록 목록 */}
      <div className="purchase-list">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : purchases.length === 0 ? (
          <div className="empty-state">
            <p>구매 기록이 없습니다.</p>
            <p>구매 기록을 추가하여 소비 패턴을 분석해보세요.</p>
          </div>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-card">
              <div className="purchase-main">
                <h3 className="product-name">{purchase.product_name}</h3>
                <div className="purchase-details">
                  <span className="price">{purchase.price.toLocaleString()}원</span>
                  {purchase.quantity > 1 && <span className="quantity">x {purchase.quantity}</span>}
                  {purchase.mall_name && <span className="mall">{purchase.mall_name}</span>}
                </div>
              </div>
              <div className="purchase-meta">
                {purchase.category && <span className="category-tag">{purchase.category}</span>}
                <span className="date">
                  {new Date(purchase.purchased_at).toLocaleDateString('ko-KR')}
                </span>
                <button className="btn-edit" onClick={() => handleEditClick(purchase)} title="수정">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(purchase.id)}
                  title="삭제"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 구매 기록 추가 모달 */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>구매 기록 추가</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>상품명 *</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                  placeholder="구매한 상품명"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>가격 *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>수량</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>카테고리</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="예: 전자제품, 식품"
                    list="category-list"
                  />
                  <datalist id="category-list">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>구매처</label>
                  <input
                    type="text"
                    value={formData.mall_name}
                    onChange={(e) => setFormData({ ...formData, mall_name: e.target.value })}
                    placeholder="예: 쿠팡, 11번가"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>구매일 *</label>
                <input
                  type="date"
                  value={formData.purchased_at}
                  onChange={(e) => setFormData({ ...formData, purchased_at: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>메모</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="구매 관련 메모"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 구매 기록 수정 모달 */}
      {showEditForm && editingPurchase && (
        <div className="modal-overlay" onClick={handleEditClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>구매 기록 수정</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>상품명 *</label>
                <input
                  type="text"
                  value={editFormData.product_name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, product_name: e.target.value })
                  }
                  required
                  placeholder="구매한 상품명"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>가격 *</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, price: parseInt(e.target.value) || 0 })
                    }
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>수량</label>
                  <input
                    type="number"
                    value={editFormData.quantity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 1 })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>카테고리</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    placeholder="예: 전자제품, 식품"
                    list="edit-category-list"
                  />
                  <datalist id="edit-category-list">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>구매처</label>
                  <input
                    type="text"
                    value={editFormData.mall_name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mall_name: e.target.value })
                    }
                    placeholder="예: 쿠팡, 11번가"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>구매일 *</label>
                <input
                  type="date"
                  value={editFormData.purchased_at}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, purchased_at: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>메모</label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="구매 관련 메모"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleEditClose}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 검색 결과에서 추가 모달 */}
      {showSearchResultsModal && (
        <div className="modal-overlay" onClick={() => setShowSearchResultsModal(false)}>
          <div className="modal-content search-results-modal" onClick={(e) => e.stopPropagation()}>
            <h2>검색 결과에서 구매 기록 추가</h2>

            {isLoadingResults ? (
              <div className="loading">검색 결과 불러오는 중...</div>
            ) : searchResultsError ? (
              <div className="error-state">
                <p className="error-title">최근 검색 기록이 없습니다.</p>
                <p className="error-sub">먼저 상품을 검색해 주세요.</p>
                <button className="btn-secondary" onClick={() => setShowSearchResultsModal(false)}>
                  닫기
                </button>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="empty-state">
                <p>검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="select-header">
                  <label className="select-all">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === searchResults.length}
                      onChange={handleSelectAll}
                    />
                    전체 선택 ({selectedProducts.size}/{searchResults.length})
                  </label>
                </div>

                <div className="search-results-list">
                  {searchResults.map((product) => (
                    <label key={product.product_id} className="product-item">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.product_id)}
                        onChange={() => handleToggleProduct(product.product_id)}
                      />
                      <div className="product-info">
                        <span className="product-name">{product.title}</span>
                        <div className="product-details">
                          <span className="product-price">{product.price_display}</span>
                          <span className="product-mall">{product.mall_name}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowSearchResultsModal(false)}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleAddSelectedProducts}
                    disabled={selectedProducts.size === 0 || isAddingFromSearch}
                  >
                    {isAddingFromSearch
                      ? '추가 중...'
                      : `${selectedProducts.size}개 구매 기록에 추가`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchasesPage;
