# CartPilot Frontend

AI 쇼핑 어시스턴트 프론트엔드 - React + TypeScript

## 기술 스택

- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 6.x
- **HTTP Client**: Axios
- **Styling**: CSS (CSS Variables)
- **Backend**: CartPilot Backend (LangGraph 1.0+, LangChain 1.2+)

## 프로젝트 구조

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ChatPanel/            # 채팅 영역
│   │   │   ├── ChatPanel.tsx         # 메인 채팅 패널
│   │   │   ├── InputBox.tsx          # 메시지 입력
│   │   │   ├── MessageBubble.tsx     # 메시지 버블
│   │   │   └── *.css
│   │   ├── RecommendationPanel/  # 추천 결과 영역
│   │   │   ├── RecommendationPanel.tsx  # 메인 추천 패널
│   │   │   ├── GiftCard.tsx             # GIFT 모드 카드
│   │   │   ├── ProductCard.tsx          # 공통 상품 카드
│   │   │   └── *.css
│   │   └── common/               # 공통 컴포넌트
│   │       ├── Loading.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── SearchProgress.tsx
│   ├── types/                    # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx                   # 메인 앱 컴포넌트
│   ├── App.css                   # 글로벌 스타일
│   └── main.tsx                  # 진입점
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 주요 기능

### 5가지 추천 모드 지원

| 모드 | 아이콘 | 설명 |
|------|--------|------|
| **GIFT** | 🎁 | 선물 추천 - 수신자 정보, 예산별 카드 표시 |
| **VALUE** | 💰 | 가성비 추천 - 저가/표준/프리미엄 3티어 |
| **BUNDLE** | 📦 | 묶음 구매 - 조합별 상품 및 대체 옵션 |
| **REVIEW** | 📝 | 리뷰 분석 - 장단점, 비추천 조건, 관리 팁 |
| **TREND** | 📈 | 트렌드 - 인기 키워드 및 상품 |

### UI 구성

- **좌측**: 채팅 패널 (대화 기록, 입력창, 예시 질문)
- **우측**: 추천 결과 패널 (모드별 맞춤 UI)

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

## 타입 정의

### 주요 인터페이스

```typescript
// 의도 유형
type IntentType = 'GIFT' | 'VALUE' | 'BUNDLE' | 'REVIEW' | 'TREND';

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

## 환경 설정

### API 엔드포인트

`src/App.tsx`에서 백엔드 URL 설정:

```typescript
const API_BASE_URL = 'http://localhost:8000';
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

## 컴포넌트 구조

```
App
├── ChatPanel
│   ├── MessageBubble (메시지 목록)
│   ├── InputBox (입력창)
│   └── 예시 질문 리스트
└── RecommendationPanel
    ├── GIFT 모드 → GiftCard
    ├── VALUE 모드 → ValueCard (티어별)
    ├── BUNDLE 모드 → BundleProductCard
    ├── REVIEW 모드 → 불만/팁 리스트
    └── TREND 모드 → 트렌드 아이템
```

## 스타일링

CSS Variables를 사용한 테마 시스템:

```css
:root {
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text: #111827;
  --radius-md: 8px;
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```
