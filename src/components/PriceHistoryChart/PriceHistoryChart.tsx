/**
 * 가격 추이 차트 컴포넌트
 * 관심상품의 가격 변동을 시각화
 */
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getPriceHistory, PriceHistoryItem } from '../../services/wishlistApi';
import './PriceHistoryChart.css';

interface PriceHistoryChartProps {
  itemId: string;
  currentPrice: number;
  lowestPrice90days?: number;
  onClose: () => void;
}

interface ChartData {
  date: string;
  price: number;
  displayDate: string;
}

function PriceHistoryChart({
  itemId,
  currentPrice,
  lowestPrice90days,
  onClose,
}: PriceHistoryChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<30 | 60 | 90>(90);

  useEffect(() => {
    loadPriceHistory();
  }, [itemId, period]);

  const loadPriceHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const history = await getPriceHistory(itemId, period);

      if (history.length === 0) {
        setData([]);
        return;
      }

      const chartData: ChartData[] = history.map((item: PriceHistoryItem) => {
        const date = new Date(item.recorded_at);
        return {
          date: item.recorded_at,
          price: item.price,
          displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        };
      });

      setData(chartData);
    } catch (err) {
      setError('가격 이력을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + '원';
  };

  const getStats = () => {
    if (data.length === 0) return null;

    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return { min, max, avg };
  };

  const stats = getStats();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(payload[0].payload.date);
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">
            {date.getFullYear()}.{date.getMonth() + 1}.{date.getDate()}
          </p>
          <p className="tooltip-price">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="price-chart-overlay" onClick={onClose}>
      <div className="price-chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chart-header">
          <h3>가격 추이</h3>
          <button className="close-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="period-selector">
          {([30, 60, 90] as const).map((p) => (
            <button
              key={p}
              className={`period-button ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}일
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="chart-loading">
            <div className="spinner" />
            <p>가격 이력 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="chart-error">
            <p>{error}</p>
            <button onClick={loadPriceHistory}>다시 시도</button>
          </div>
        ) : data.length === 0 ? (
          <div className="chart-empty">
            <p>아직 수집된 가격 데이터가 없습니다.</p>
            <p className="chart-empty-sub">가격은 매일 자동으로 수집됩니다.</p>
          </div>
        ) : (
          <>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">현재가</span>
                <span className="stat-value current">{formatPrice(currentPrice)}</span>
              </div>
              {stats && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">{period}일 최저</span>
                    <span className="stat-value lowest">{formatPrice(stats.min)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{period}일 최고</span>
                    <span className="stat-value highest">{formatPrice(stats.max)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">평균</span>
                    <span className="stat-value">{formatPrice(stats.avg)}</span>
                  </div>
                </>
              )}
            </div>

            {currentPrice === lowestPrice90days && (
              <div className="lowest-price-badge">
                지금이 90일 최저가입니다!
              </div>
            )}

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickLine={{ stroke: '#444' }}
                  />
                  <YAxis
                    stroke="#888"
                    tick={{ fill: '#888', fontSize: 12 }}
                    tickLine={{ stroke: '#444' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    domain={['dataMin - 1000', 'dataMax + 1000']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {lowestPrice90days && (
                    <ReferenceLine
                      y={lowestPrice90days}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      label={{
                        value: '90일 최저',
                        fill: '#22c55e',
                        fontSize: 12,
                        position: 'right',
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#667eea"
                    strokeWidth={2}
                    dot={{ fill: '#667eea', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 6, fill: '#667eea' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PriceHistoryChart;
