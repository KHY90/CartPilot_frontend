/**
 * BundleBuilder - 번들 동적 조합 빌더
 * 품목 선택, 예산 조정, 상품 교체 등
 */
import { useState, useEffect } from 'react';
import BudgetSlider from './BudgetSlider';
import './BundleBuilder.css';

interface BundleItem {
  item_category: string;
  product: {
    product_id: string;
    title: string;
    price: number;
    price_display: string;
    image?: string;
    mall_name: string;
    link: string;
  };
  alternatives: Array<{
    product_id: string;
    title: string;
    price: number;
    price_display: string;
    image?: string;
    mall_name: string;
    link: string;
  }>;
}

interface BundleCombination {
  combination_id: string;
  items: BundleItem[];
  total_price: number;
  total_display: string;
  budget_fit: boolean;
  adjustment_note?: string;
}

interface BundleData {
  combinations: BundleCombination[];
  total_budget: number;
  items_count: number;
  compatibility_warnings?: string[];
  suggested_items?: string[];
  detected_group?: string;
}

interface BundleBuilderProps {
  bundleData: BundleData;
  onItemChange?: (
    combinationId: string,
    itemCategory: string,
    newProductId: string
  ) => void;
  onBudgetChange?: (newBudget: number) => void;
  onAddItem?: (itemName: string) => void;
}

function BundleBuilder({
  bundleData,
  onItemChange,
  onBudgetChange,
  onAddItem,
}: BundleBuilderProps) {
  const [selectedCombination, setSelectedCombination] = useState<string>('A');
  const [budget, setBudget] = useState(bundleData.total_budget);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBudget(bundleData.total_budget);
  }, [bundleData.total_budget]);

  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
    onBudgetChange?.(newBudget);
  };

  const toggleItemExpand = (itemCategory: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemCategory)) {
      newExpanded.delete(itemCategory);
    } else {
      newExpanded.add(itemCategory);
    }
    setExpandedItems(newExpanded);
  };

  const handleSelectAlternative = (
    itemCategory: string,
    productId: string
  ) => {
    onItemChange?.(selectedCombination, itemCategory, productId);
    toggleItemExpand(itemCategory);
  };

  const currentCombination = bundleData.combinations.find(
    (c) => c.combination_id === selectedCombination
  ) || bundleData.combinations[0];

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getBudgetStatus = () => {
    if (!currentCombination) return null;
    const diff = budget - currentCombination.total_price;
    if (diff >= 0) {
      return { status: 'under', message: `${formatPrice(diff)} 여유`, className: 'budget-under' };
    } else {
      return { status: 'over', message: `${formatPrice(Math.abs(diff))} 초과`, className: 'budget-over' };
    }
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="bundle-builder">
      {/* 호환성 경고 */}
      {bundleData.compatibility_warnings && bundleData.compatibility_warnings.length > 0 && (
        <div className="compatibility-warnings">
          {bundleData.compatibility_warnings.map((warning, index) => (
            <div key={index} className="warning-item">
              <span className="warning-icon">!</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* 감지된 그룹 */}
      {bundleData.detected_group && (
        <div className="detected-group">
          <span className="group-icon">*</span>
          <span className="group-name">{bundleData.detected_group.replace('_', ' ')}</span>
          <span className="group-label">구성으로 인식됨</span>
        </div>
      )}

      {/* 예산 슬라이더 */}
      <div className="budget-section">
        <div className="budget-header">
          <h4>총 예산</h4>
          {budgetStatus && (
            <span className={`budget-status ${budgetStatus.className}`}>
              {budgetStatus.message}
            </span>
          )}
        </div>
        <BudgetSlider
          value={budget}
          min={100000}
          max={5000000}
          step={50000}
          onChange={handleBudgetChange}
        />
        <div className="budget-display">{formatPrice(budget)}</div>
      </div>

      {/* 조합 선택 탭 */}
      <div className="combination-tabs">
        {bundleData.combinations.map((combo) => (
          <button
            key={combo.combination_id}
            className={`combo-tab ${selectedCombination === combo.combination_id ? 'active' : ''} ${combo.budget_fit ? '' : 'over-budget'}`}
            onClick={() => setSelectedCombination(combo.combination_id)}
          >
            <span className="combo-id">조합 {combo.combination_id}</span>
            <span className="combo-price">{combo.total_display}</span>
            {!combo.budget_fit && <span className="over-badge">초과</span>}
          </button>
        ))}
      </div>

      {/* 선택된 조합의 품목 목록 */}
      {currentCombination && (
        <div className="combination-items">
          {currentCombination.items.map((item) => (
            <div key={item.item_category} className="bundle-item">
              <div
                className="item-header"
                onClick={() => toggleItemExpand(item.item_category)}
              >
                <div className="item-category">
                  <span className="category-name">{item.item_category}</span>
                </div>
                <div className="item-product">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="product-thumb"
                    />
                  )}
                  <div className="product-info">
                    <span className="product-title">{item.product.title}</span>
                    <span className="product-price">{item.product.price_display}</span>
                  </div>
                </div>
                <button className="expand-btn">
                  {expandedItems.has(item.item_category) ? '-' : '+'}
                </button>
              </div>

              {/* 대안 상품 목록 */}
              {expandedItems.has(item.item_category) && item.alternatives.length > 0 && (
                <div className="alternatives-list">
                  <div className="alternatives-header">대안 상품</div>
                  {item.alternatives.map((alt) => (
                    <div
                      key={alt.product_id}
                      className="alternative-item"
                      onClick={() => handleSelectAlternative(item.item_category, alt.product_id)}
                    >
                      {alt.image && (
                        <img src={alt.image} alt={alt.title} className="alt-thumb" />
                      )}
                      <div className="alt-info">
                        <span className="alt-title">{alt.title}</span>
                        <span className="alt-price">{alt.price_display}</span>
                      </div>
                      <span className="select-btn">선택</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 총액 표시 */}
      {currentCombination && (
        <div className={`total-section ${currentCombination.budget_fit ? 'fit' : 'over'}`}>
          <div className="total-label">총 금액</div>
          <div className="total-price">{currentCombination.total_display}</div>
          {currentCombination.adjustment_note && (
            <div className="adjustment-note">{currentCombination.adjustment_note}</div>
          )}
        </div>
      )}

      {/* 추천 추가 품목 */}
      {bundleData.suggested_items && bundleData.suggested_items.length > 0 && (
        <div className="suggested-items">
          <h4>추천 추가 품목</h4>
          <div className="suggested-list">
            {bundleData.suggested_items.map((item, index) => (
              <button
                key={index}
                className="suggested-item-btn"
                onClick={() => onAddItem?.(item)}
              >
                <span className="add-icon">+</span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BundleBuilder;
