/**
 * PersonalizedSection - 개인화 인사이트 섹션
 * 사용자의 취향 분석 결과를 표시
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PersonalizedSection.css';

interface TasteInsight {
  icon: string;
  label: string;
  value: string;
  description?: string;
}

interface YourTasteData {
  has_data: boolean;
  insights: TasteInsight[];
  summary: string;
  data_points: number;
  last_updated?: string;
}

function PersonalizedSection() {
  const { isAuthenticated, accessToken } = useAuth();
  const [tasteData, setTasteData] = useState<YourTasteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchTasteData();
    }
  }, [isAuthenticated, accessToken]);

  const fetchTasteData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/preferences/your-taste', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasteData(data);
      }
    } catch (error) {
      console.error('Failed to fetch taste data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 비로그인 또는 데이터 없으면 표시 안함
  if (!isAuthenticated || isLoading) {
    return null;
  }

  if (!tasteData || !tasteData.has_data) {
    // 데이터 없을 때 간단한 안내 메시지
    return (
      <div className="personalized-section empty">
        <div className="empty-content">
          <span className="personalized-icon">✨</span>
          <span className="empty-message">
            상품을 탐색하고 평가하면 맞춤 추천을 받을 수 있어요!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`personalized-section ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="personalized-header clickable"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="header-left">
          <span className="personalized-icon">✨</span>
          <span className="personalized-title">당신의 취향</span>
          <span className="data-badge">{tasteData.data_points}개 데이터</span>
        </div>
        <span className={`expand-arrow ${isExpanded ? 'up' : 'down'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
          </svg>
        </span>
      </button>

      {/* 요약 */}
      <p className="personalized-summary">{tasteData.summary}</p>

      {/* 인사이트 목록 (펼쳤을 때) */}
      {isExpanded && (
        <div className="insights-grid">
          {tasteData.insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <span className="insight-icon">{insight.icon}</span>
              <div className="insight-content">
                <span className="insight-label">{insight.label}</span>
                <span className="insight-value">{insight.value}</span>
                {insight.description && (
                  <span className="insight-desc">{insight.description}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 간단한 미리보기 (접혔을 때) */}
      {!isExpanded && tasteData.insights.length > 0 && (
        <div className="insights-preview">
          {tasteData.insights.slice(0, 3).map((insight, index) => (
            <span key={index} className="preview-tag">
              {insight.icon} {insight.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PersonalizedSection;
