# CartPilot Frontend

AI 쇼핑 어시스턴트 프론트엔드 - React + TypeScript

## 서비스 소개

CartPilot 프론트엔드는 AI 기반 스마트 쇼핑 어시스턴트의 사용자 인터페이스입니다. 자연어 대화를 통해 상품 추천을 받고, 관심 상품의 가격 변동을 한눈에 확인할 수 있습니다.

### 주요 기능

- **AI 채팅**: 자연어로 상품 추천 요청 및 실시간 응답
- **소셜 로그인**: 카카오/네이버 원클릭 로그인
- **관심상품 관리**: 상품 저장, 목표가 설정, 알림 설정
- **가격 히스토리**: 90일 가격 변동 차트 시각화
- **구매 기록**: 구매 이력 관리 및 평점 등록
- **반응형 UI**: 데스크톱/모바일 최적화

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | React 18.x |
| **Language** | TypeScript 5.x |
| **Build Tool** | Vite 6.x |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **State** | React Context API |
| **Styling** | CSS (CSS Variables) |
| **Chart** | (가격 히스토리 차트) |

## 프로젝트 구조

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ChatPanel/               # 채팅 영역
│   │   │   ├── ChatPanel.tsx            # 메인 채팅 패널
│   │   │   ├── InputBox.tsx             # 메시지 입력
│   │   │   ├── MessageBubble.tsx        # 메시지 버블
│   │   │   └── *.css
│   │   ├── RecommendationPanel/     # 추천 결과 영역
│   │   │   ├── RecommendationPanel.tsx  # 메인 추천 패널
│   │   │   ├── GiftCard.tsx             # GIFT 모드 카드
│   │   │   ├── ProductCard.tsx          # 공통 상품 카드
│   │   │   └── *.css
│   │   ├── Header/                  # 헤더
│   │   │   └── Header.tsx               # 사용자 정보, 네비게이션
│   │   ├── PriceHistoryChart/       # 가격 차트
│   │   │   └── PriceHistoryChart.tsx    # 90일 가격 추이 차트
│   │   └── common/                  # 공통 컴포넌트
│   │       ├── Loading.tsx              # 로딩 스피너
│   │       ├── ErrorMessage.tsx         # 에러 메시지
│   │       ├── SearchProgress.tsx       # 검색 진행 표시
│   │       ├── StarRating.tsx           # 별점 컴포넌트
│   │       └── WishlistButton.tsx       # 관심상품 버튼
│   ├── pages/                       # 페이지 컴포넌트
│   │   ├── LoginPage.tsx                # 소셜 로그인 페이지
│   │   ├── AuthCallback.tsx             # OAuth 콜백 처리
│   │   ├── WishlistPage.tsx             # 관심상품 페이지
│   │   └── PurchasesPage.tsx            # 구매 기록 페이지
│   ├── contexts/                    # React Context
│   │   └── AuthContext.tsx              # 인증 상태 관리
│   ├── services/                    # API 서비스
│   │   ├── api.ts                       # Axios 인스턴스
│   │   ├── authApi.ts                   # 인증 API
│   │   ├── wishlistApi.ts               # 관심상품 API
│   │   ├── ratingsApi.ts                # 평점 API
│   │   └── purchasesApi.ts              # 구매 기록 API
│   ├── hooks/                       # 커스텀 훅
│   │   └── useChat.ts                   # 채팅 상태 관리
│   ├── types/                       # TypeScript 타입
│   │   └── index.ts                     # 공통 타입 정의
│   ├── App.tsx                      # 메인 앱 (라우팅)
│   ├── App.css                      # 글로벌 스타일
│   └── main.tsx                     # 진입점
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 주요 페이지

### 메인 페이지 (AI 채팅)
- **좌측**: 채팅 패널 - AI와 대화, 예시 질문
- **우측**: 추천 결과 패널 - 모드별 맞춤 UI

### 로그인 페이지
- 카카오 로그인 버튼
- 네이버 로그인 버튼
- OAuth 2.0 플로우

### 관심상품 페이지
- 저장된 상품 목록
- 가격 히스토리 차트
- 목표가/알림 설정
- 수동 가격 체크

### 구매 기록 페이지
- 구매 이력 목록
- 별점 및 리뷰 등록
- 구매 통계

## 5가지 추천 모드 UI

| 모드 | 아이콘 | UI 특징 |
|------|--------|---------|
| **GIFT** | 🎁 | 수신자 정보, 예산별 카드, 선물 포장 옵션 |
| **VALUE** | 💰 | 저가/표준/프리미엄 3티어 탭 |
| **BUNDLE** | 📦 | 조합별 상품 그룹, 총 가격 표시 |
| **REVIEW** | 📝 | 장단점 리스트, 추천/비추천 조건 |
| **TREND** | 📈 | 인기 키워드 태그, 트렌드 지표 |

## 설치 및 실행

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 접속

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

### Docker 실행

```bash
docker build -t cartpilot-frontend .
docker run -p 3000:3000 cartpilot-frontend
```

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run lint:fix` | ESLint 자동 수정 |
| `npm run format` | Prettier 포맷팅 |

## 환경 설정

### API 엔드포인트

`.env` 파일 또는 `src/services/api.ts`에서 백엔드 URL 설정:

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

### Vite 설정

`vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
```

## 인증 플로우

```
1. 사용자가 "카카오 로그인" 클릭
   ↓
2. 백엔드 /api/auth/kakao로 리다이렉트
   ↓
3. 카카오 인증 페이지
   ↓
4. 백엔드 콜백 처리 → JWT 발급
   ↓
5. 프론트엔드 /auth/callback으로 리다이렉트
   ↓
6. AuthContext에서 토큰 저장
   ↓
7. 메인 페이지로 이동
```

### 토큰 관리
- **Access Token**: localStorage 저장, API 요청 헤더에 포함
- **Refresh Token**: HTTP-only 쿠키 (백엔드 관리)
- **자동 갱신**: Access Token 만료 시 자동 갱신

## 타입 정의

### 주요 인터페이스

```typescript
// 의도 유형
type IntentType = 'GIFT' | 'VALUE' | 'BUNDLE' | 'REVIEW' | 'TREND';

// 사용자
interface User {
  id: string;
  email: string | null;
  name: string | null;
  profile_image: string | null;
  provider: 'kakao' | 'naver';
}

// 관심상품
interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  current_price: number;
  target_price: number | null;
  lowest_price_90days: number | null;
  notification_enabled: boolean;
  alert_on_lowest: boolean;
  alert_on_target: boolean;
}

// 가격 이력
interface PriceHistory {
  price: number;
  recorded_at: string;
}

// 추천 카드 (공통)
interface RecommendationCard {
  product_id: string;
  title: string;
  image?: string;
  price: number;
  price_display: string;
  mall_name: string;
  link: string;
  recommendation_reason: string;
  warnings: string[];
}

// 채팅 응답
interface ChatResponse {
  type: 'recommendation' | 'clarification' | 'error';
  intent?: IntentType;
  recommendations?: GiftRecommendation | ValueRecommendation | ...;
  processing_time_ms: number;
  cached: boolean;
}
```

## 컴포넌트 구조

```
App (Router)
├── LoginPage (비로그인 시)
├── AuthCallback (OAuth 콜백)
├── MainPage (로그인 후)
│   ├── Header
│   │   ├── 로고
│   │   ├── 네비게이션 (채팅 | 관심상품 | 구매기록)
│   │   └── 사용자 프로필
│   ├── ChatPanel
│   │   ├── MessageBubble (메시지 목록)
│   │   ├── InputBox (입력창)
│   │   └── 예시 질문 리스트
│   └── RecommendationPanel
│       ├── GIFT 모드 → GiftCard
│       ├── VALUE 모드 → ProductCard (티어별)
│       ├── BUNDLE 모드 → ProductCard (그룹별)
│       ├── REVIEW 모드 → 장단점 리스트
│       └── TREND 모드 → 트렌드 아이템
├── WishlistPage
│   ├── 상품 목록
│   ├── PriceHistoryChart
│   ├── 알림 설정 모달
│   └── WishlistButton
└── PurchasesPage
    ├── 구매 기록 목록
    └── StarRating
```

## 스타일링

CSS Variables를 사용한 테마 시스템:

```css
:root {
  /* 색상 */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* 배경 */
  --color-surface: #ffffff;
  --color-background: #f8fafc;
  --color-border: #e5e7eb;

  /* 텍스트 */
  --color-text: #111827;
  --color-text-secondary: #6b7280;

  /* 레이아웃 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}
```

## API 서비스

### authApi.ts
```typescript
// 소셜 로그인 URL
getKakaoLoginUrl(): string
getNaverLoginUrl(): string

// 토큰 관리
refreshToken(): Promise<TokenResponse>
logout(): Promise<void>

// 사용자 정보
getMe(): Promise<User>
```

### wishlistApi.ts
```typescript
// CRUD
getWishlist(): Promise<WishlistItem[]>
addToWishlist(item: CreateWishlistRequest): Promise<WishlistItem>
updateWishlist(id: string, data: UpdateWishlistRequest): Promise<WishlistItem>
removeFromWishlist(id: string): Promise<void>

// 가격 관련
getPriceHistory(id: string, days?: number): Promise<PriceHistory[]>
getPriceAnalysis(id: string): Promise<PriceAnalysis>
checkPriceNow(id: string): Promise<PriceCheckResult>
```

### ratingsApi.ts
```typescript
getRatings(): Promise<Rating[]>
addRating(data: CreateRatingRequest): Promise<Rating>
```

### purchasesApi.ts
```typescript
getPurchases(): Promise<Purchase[]>
addPurchase(data: CreatePurchaseRequest): Promise<Purchase>
```
