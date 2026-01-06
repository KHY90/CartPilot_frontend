/**
 * CompareTable - 상품 비교 테이블
 * 가격, 쇼핑몰, 추천 이유 등을 테이블 형식으로 비교
 */
import { RecommendationCard } from '../../types';
import './ComparePanel.css';

interface CompareTableProps {
  items: RecommendationCard[];
}

function CompareTable({ items }: CompareTableProps) {
  // 가격 정렬 (최저가 찾기)
  const prices = items.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // 가격 차이 계산
  const priceDiff = maxPrice - minPrice;

  return (
    <div className="compare-table-container">
      <table className="compare-table">
        <thead>
          <tr>
            <th className="attribute-header">비교 항목</th>
            {items.map((item) => (
              <th key={item.product_id} className="product-header">
                {item.title.length > 30 ? item.title.slice(0, 30) + '...' : item.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 가격 */}
          <tr>
            <td className="attribute-name">가격</td>
            {items.map((item) => (
              <td
                key={item.product_id}
                className={`price-cell ${item.price === minPrice ? 'lowest' : ''}`}
              >
                <span className="price-value">{item.price_display}</span>
                {item.price === minPrice && items.length > 1 && (
                  <span className="lowest-badge">최저가</span>
                )}
                {item.price === maxPrice && item.price !== minPrice && (
                  <span className="price-diff">+{(item.price - minPrice).toLocaleString()}원</span>
                )}
              </td>
            ))}
          </tr>

          {/* 쇼핑몰 */}
          <tr>
            <td className="attribute-name">쇼핑몰</td>
            {items.map((item) => (
              <td key={item.product_id} className="mall-cell">
                {item.mall_name}
              </td>
            ))}
          </tr>

          {/* 브랜드/티어 */}
          {items.some(item => item.tier) && (
            <tr>
              <td className="attribute-name">가격대</td>
              {items.map((item) => (
                <td key={item.product_id} className="tier-cell">
                  {item.tier === 'budget' && <span className="tier-badge budget">저가</span>}
                  {item.tier === 'standard' && <span className="tier-badge standard">표준</span>}
                  {item.tier === 'premium' && <span className="tier-badge premium">프리미엄</span>}
                  {!item.tier && '-'}
                </td>
              ))}
            </tr>
          )}

          {/* 추천 이유 */}
          <tr>
            <td className="attribute-name">추천 이유</td>
            {items.map((item) => (
              <td key={item.product_id} className="reason-cell">
                {item.recommendation_reason}
              </td>
            ))}
          </tr>

          {/* 장점 */}
          {items.some(item => item.tier_benefits) && (
            <tr>
              <td className="attribute-name">장점</td>
              {items.map((item) => (
                <td key={item.product_id} className="benefits-cell">
                  {item.tier_benefits || '-'}
                </td>
              ))}
            </tr>
          )}

          {/* 단점 */}
          {items.some(item => item.tier_tradeoffs) && (
            <tr>
              <td className="attribute-name">단점</td>
              {items.map((item) => (
                <td key={item.product_id} className="tradeoffs-cell">
                  {item.tier_tradeoffs || '-'}
                </td>
              ))}
            </tr>
          )}

          {/* 주의사항 */}
          {items.some(item => item.warnings.length > 0) && (
            <tr>
              <td className="attribute-name">주의사항</td>
              {items.map((item) => (
                <td key={item.product_id} className="warnings-cell">
                  {item.warnings.length > 0 ? (
                    <ul>
                      {item.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    '-'
                  )}
                </td>
              ))}
            </tr>
          )}

          {/* 구매 링크 */}
          <tr>
            <td className="attribute-name">구매</td>
            {items.map((item) => (
              <td key={item.product_id} className="link-cell">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="buy-link"
                >
                  구매하기
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* 가격 차이 요약 */}
      {priceDiff > 0 && (
        <div className="price-summary">
          <span className="summary-icon">💡</span>
          <span>
            최저가와 최고가 차이: <strong>{priceDiff.toLocaleString()}원</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export default CompareTable;
