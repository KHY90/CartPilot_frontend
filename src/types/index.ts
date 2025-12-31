/**
 * CartPilot 타입 정의
 * OpenAPI 스펙과 동기화
 */

// 의도 유형
export type IntentType = 'GIFT' | 'VALUE' | 'BUNDLE' | 'REVIEW' | 'TREND';

// 응답 유형
export type ResponseType = 'recommendation' | 'clarification' | 'error';

// 가격 티어
export type PriceTier = 'budget' | 'standard' | 'premium';

// 심각도
export type Severity = 'low' | 'medium' | 'high';

// 감정
export type Sentiment = 'positive' | 'mixed' | 'negative';

// 추천 카드 (공통)
export interface RecommendationCard {
  product_id: string;
  title: string;
  image?: string;
  price: number;
  price_display: string;
  mall_name: string;
  link: string;
  recommendation_reason: string;
  warnings: string[];
  tier?: PriceTier;
  tier_benefits?: string;
  tier_tradeoffs?: string;
}

// GIFT 모드 추천
export interface GiftRecommendation {
  cards: RecommendationCard[];
  recipient_summary: string;
  occasion?: string;
  budget_range: string;
}

// VALUE 모드 추천
export interface ValueRecommendation {
  budget_tier: RecommendationCard[];
  standard_tier: RecommendationCard[];
  premium_tier: RecommendationCard[];
  category: string;
}

// BUNDLE 모드
export interface BundleItem {
  item_category: string;
  product: RecommendationCard;
  alternatives: RecommendationCard[];
}

export interface BundleCombination {
  combination_id: 'A' | 'B' | 'C';
  items: BundleItem[];
  total_price: number;
  total_display: string;
  budget_fit: boolean;
  adjustment_note?: string;
}

export interface BundleRecommendation {
  combinations: BundleCombination[];
  total_budget: number;
  items_count: number;
}

// REVIEW 모드
export interface ReviewComplaint {
  rank: number;
  issue: string;
  frequency: string;
  severity: Severity;
}

export interface ReviewAnalysis {
  product_category: string;
  top_complaints: ReviewComplaint[];
  not_recommended_conditions: string[];
  management_tips: string[];
  overall_sentiment: Sentiment;
  disclaimer: string;
}

// TREND 모드
export interface TrendingItem {
  category: string;
  keyword: string;
  growth_rate?: string;
  period: string;
  target_segment?: string;
  products: RecommendationCard[];
}

export interface TrendSignal {
  trending_items: TrendingItem[];
  data_source: string;
  generated_at: string;
  disclaimer: string;
}

// 추가 질문
export interface ClarificationQuestion {
  question: string;
  field: string;
  suggestions: string[];
}

// 채팅 요청
export interface ChatRequest {
  message: string;
  session_id?: string;
}

// 채팅 응답
export interface ChatResponse {
  type: ResponseType;
  intent?: IntentType;
  recommendations?:
    | GiftRecommendation
    | ValueRecommendation
    | BundleRecommendation
    | ReviewAnalysis
    | TrendSignal;
  clarification?: ClarificationQuestion;
  error_message?: string;
  fallback_suggestions: string[];
  processing_time_ms: number;
  cached: boolean;
}

// 대화 메시지
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// 헬스 응답
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  llm_provider: string;
  naver_api: 'up' | 'down' | 'unchecked';
  active_sessions: number;
}

// 에러 응답
export interface ErrorResponse {
  error: string;
  message: string;
  suggestions: string[];
}

// 채팅 상태
export interface ChatState {
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  currentResponse: ChatResponse | null;
  sessionId: string | null;
}

// ==================== 인증 관련 타입 ====================
// 사용자 정보
export interface User {
  id: string;
  email?: string;
  name?: string;
  profile_image?: string;
  provider: 'kakao' | 'naver';
  kakao_notification_enabled: boolean;
  email_notification_enabled: boolean;
  created_at?: string;
}

// 토큰 응답 (refresh_token은 HTTP-only 쿠키로 전송됨)
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// 인증 상태
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
