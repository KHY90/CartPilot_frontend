/**
 * ComparePanel - 플로팅 비교 패널
 * 화면 하단에 고정되어 선택된 상품들을 표시
 */
import { useCompare } from '../../contexts/CompareContext';
import CompareTable from './CompareTable';
import './ComparePanel.css';

function ComparePanel() {
  const {
    compareItems,
    removeFromCompare,
    clearCompare,
    isPanelOpen,
    togglePanel,
    closePanel,
    isCompareFull,
  } = useCompare();

  // 비교 상품이 없으면 표시하지 않음
  if (compareItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* 플로팅 미니 바 (접혀있을 때) */}
      {!isPanelOpen && (
        <button className="compare-mini-bar" onClick={togglePanel}>
          <span className="compare-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span className="compare-count">{compareItems.length}개 상품 비교중</span>
          <span className="expand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </span>
        </button>
      )}

      {/* 확장된 비교 패널 */}
      {isPanelOpen && (
        <div className="compare-panel-overlay">
          <div className="compare-panel">
            <div className="compare-panel-header">
              <div className="header-left">
                <h3>상품 비교</h3>
                <span className="item-count">
                  {compareItems.length}개 {isCompareFull && '(최대)'}
                </span>
              </div>
              <div className="header-actions">
                <button className="clear-btn" onClick={clearCompare}>
                  전체 삭제
                </button>
                <button className="close-btn" onClick={closePanel}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="compare-panel-content">
              {/* 선택된 상품 미리보기 */}
              <div className="compare-items-preview">
                {compareItems.map((item) => (
                  <div key={item.product_id} className="compare-item-card">
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCompare(item.product_id)}
                      title="비교에서 제거"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="item-image" />
                    ) : (
                      <div className="item-image no-image">이미지 없음</div>
                    )}
                    <p className="item-title">{item.title}</p>
                    <p className="item-price">{item.price_display}</p>
                  </div>
                ))}

                {/* 빈 슬롯 */}
                {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="compare-item-card empty">
                    <div className="empty-slot">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>상품 추가</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 비교 테이블 (2개 이상일 때) */}
              {compareItems.length >= 2 && (
                <CompareTable items={compareItems} />
              )}

              {compareItems.length < 2 && (
                <div className="compare-hint">
                  <p>비교할 상품을 2개 이상 선택해주세요</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ComparePanel;
