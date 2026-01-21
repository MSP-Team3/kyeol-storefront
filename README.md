# KYEOL Storefront

> Saleor GraphQL API를 사용하는 Next.js 기반 전자상거래 프론트엔드
> 고객용 온라인 쇼핑몰 UI

---

## 개요

KYEOL 프로젝트의 고객용 웹 스토어프론트입니다. Saleor GraphQL API를 통해 제품 목록, 장바구니, 결제 등의 기능을 제공하며, Next.js의 SSR(Server-Side Rendering)과 SSG(Static Site Generation)를 활용하여 빠른 페이지 로딩과 SEO를 최적화합니다.

### 기술 스택

- **Next.js 13.5**: React Server Components, App Router
- **TypeScript 5.3**: 타입 안전성
- **urql 4.0**: GraphQL 클라이언트
- **Tailwind CSS 3.4**: 유틸리티 기반 스타일링
- **Saleor Auth SDK**: 인증/인가
- **Stripe/Adyen**: 결제 통합

---

## 주요 기능

- **제품 브라우징**: 카테고리, 컬렉션별 제품 목록
- **제품 검색**: 키워드 기반 제품 검색
- **장바구니**: 제품 추가/제거, 수량 조절
- **체크아웃**: 배송 주소, 결제 정보 입력
- **사용자 계정**: 로그인, 회원가입, 주문 내역
- **다국어 지원**: 영어, 한국어 (확장 가능)
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

---

## 디렉토리 구조

```
kyeol-storefront-org/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [channel]/             # 채널별 라우팅
│   │   │   ├── (main)/
│   │   │   │   ├── cart/          # 장바구니 페이지
│   │   │   │   ├── products/      # 제품 목록/상세
│   │   │   │   ├── categories/    # 카테고리 페이지
│   │   │   │   ├── collections/   # 컬렉션 페이지
│   │   │   │   └── login/         # 로그인 페이지
│   │   │   └── layout.tsx
│   │   ├── checkout/               # 체크아웃 페이지
│   │   ├── api/                    # API 라우트
│   │   │   ├── auth/              # 인증 API
│   │   │   ├── cart/              # 장바구니 API
│   │   │   └── checkout/          # 체크아웃 API
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── checkout/                   # 체크아웃 로직 (별도 디렉토리)
│   │   ├── components/            # 체크아웃 컴포넌트
│   │   ├── sections/              # 체크아웃 섹션
│   │   └── hooks/                 # 체크아웃 훅
│   ├── graphql/                    # GraphQL 쿼리/뮤테이션
│   │   ├── ProductDetails.graphql
│   │   ├── ProductList.graphql
│   │   ├── CheckoutCreate.graphql
│   │   └── ...
│   ├── gql/                        # 생성된 GraphQL 타입
│   │   ├── graphql.ts
│   │   └── gql.ts
│   ├── lib/                        # 유틸리티 함수
│   │   ├── checkout.ts
│   │   ├── graphql.ts
│   │   └── utils.ts
│   └── ui/                         # UI 컴포넌트
│       ├── components/            # 재사용 가능한 컴포넌트
│       └── atoms/                 # Atomic 디자인 컴포넌트
├── public/                         # 정적 파일
│   ├── screenshot.png
│   └── github-mark.svg
├── .github/
│   └── workflows/
│       └── build-push-ecr.yml     # ECR 빌드/푸시 워크플로
├── Dockerfile                      # 컨테이너 이미지 정의
├── next.config.js                  # Next.js 설정
├── tailwind.config.ts              # Tailwind CSS 설정
├── .graphqlrc.ts                   # GraphQL Code Generator 설정
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

## 빠른 시작

### 사전 요구사항

- Node.js >= 18
- pnpm >= 9.4.0
- Saleor GraphQL API 실행 중

### 로컬 개발

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에서 NEXT_PUBLIC_SALEOR_API_URL 설정

# GraphQL 코드 생성
pnpm run generate

# 개발 서버 실행
pnpm dev
```

브라우저에서 http://localhost:3000 접속

### 환경변수 설정

```bash
# .env.local
NEXT_PUBLIC_SALEOR_API_URL=https://dev-api.kyeol.com/graphql/
NEXT_PUBLIC_STOREFRONT_URL=https://dev.kyeol.com
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel
```

---

## 주요 작업

### 1. GraphQL 쿼리 추가

```bash
# 1. src/graphql/ 디렉토리에 .graphql 파일 생성
cat > src/graphql/MyNewQuery.graphql <<EOF
query GetProducts {
  products(first: 10) {
    edges {
      node {
        id
        name
        pricing {
          priceRange {
            start {
              gross {
                amount
                currency
              }
            }
          }
        }
      }
    }
  }
}
EOF

# 2. GraphQL 코드 생성
pnpm run generate

# 3. 생성된 타입 사용
import { useGetProductsQuery } from '@/gql/graphql'
```

### 2. 새 페이지 추가

```typescript
// src/app/[channel]/(main)/about/page.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">About KYEOL</h1>
      <p>KYEOL is an e-commerce platform...</p>
    </div>
  );
}
```

### 3. 컴포넌트 추가

```typescript
// src/ui/components/ProductCard.tsx
import type { ProductListItemFragment } from '@/gql/graphql';

interface ProductCardProps {
  product: ProductListItemFragment;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.pricing?.priceRange?.start?.gross?.amount}</p>
    </div>
  );
}
```

### 4. 빌드 및 실행

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 모드 실행
pnpm start
```

---

## Docker 빌드

### 로컬 Docker 빌드

```bash
# 빌드
docker build \
  --build-arg NEXT_PUBLIC_SALEOR_API_URL=https://dev-api.kyeol.com/graphql/ \
  --build-arg NEXT_PUBLIC_STOREFRONT_URL=https://dev.kyeol.com \
  -t kyeol-storefront:local \
  .

# 실행
docker run -p 3000:3000 kyeol-storefront:local
```

### Dockerfile 설명

```dockerfile
# Multi-stage build for optimization
FROM node:22-slim AS base

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_SALEOR_API_URL
ARG NEXT_PUBLIC_STOREFRONT_URL
ENV NEXT_PUBLIC_SALEOR_API_URL=${NEXT_PUBLIC_SALEOR_API_URL}
ENV NEXT_PUBLIC_STOREFRONT_URL=${NEXT_PUBLIC_STOREFRONT_URL}

# GraphQL code generation + Next.js build
RUN pnpm build

# Runner stage (production)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## CI/CD (GitHub Actions)

### 자동 빌드 및 배포

`main` 브랜치에 Push 시 자동 실행:

```yaml
# .github/workflows/build-push-ecr.yml
on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, stage, prod]

    steps:
      - name: Build Docker Image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_SALEOR_API_URL=${{ secrets[format('{0}_API_URL', matrix.environment)] }} \
            -t kyeol-storefront:${{ matrix.environment }}-${{ github.sha }} \
            .

      - name: Push to ECR
        run: |
          docker push $ECR_REGISTRY/kyeol-${{ matrix.environment }}-storefront:latest
```

### 이미지 태그 규칙

- `dev-latest`: 최신 DEV 이미지
- `dev-abc1234`: 특정 커밋의 DEV 이미지
- `stage-latest`: 최신 STAGE 이미지
- `prod-latest`: 최신 PROD 이미지

---

## GraphQL Code Generation

### 설정

```typescript
// .graphqlrc.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
	schema: process.env.NEXT_PUBLIC_SALEOR_API_URL,
	documents: ["src/**/*.graphql"],
	generates: {
		"./src/gql/": {
			preset: "client",
			plugins: [],
		},
	},
};

export default config;
```

### 실행

```bash
# Saleor API에서 최신 스키마 가져오기 + 타입 생성
pnpm run generate

# 빌드 전 자동 실행 (prebuild hook)
pnpm build  # 내부적으로 pnpm generate 먼저 실행
```

---

## 트러블슈팅

### GraphQL 코드 생성 실패

**증상**: `pnpm run generate` 실행 시 에러

**원인**:

- Saleor API URL 잘못 설정
- Saleor API 미실행
- 네트워크 연결 문제

**해결**:

```bash
# API URL 확인
echo $NEXT_PUBLIC_SALEOR_API_URL

# API 접근 테스트
curl -X POST https://dev-api.kyeol.com/graphql/ \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

### 빌드 시 환경변수 없음 에러

**증상**: `ERROR: NEXT_PUBLIC_SALEOR_API_URL is not set`

**원인**: Dockerfile에서 ARG 미전달

**해결**:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SALEOR_API_URL=https://... \
  --build-arg NEXT_PUBLIC_STOREFRONT_URL=https://... \
  -t kyeol-storefront:local \
  .
```

### 로컬 개발 시 CORS 에러

**증상**: 브라우저에서 API 호출 시 CORS 에러

**원인**: Saleor API에서 Storefront URL 허용 안 함

**해결**:

```bash
# Saleor API 환경변수 설정
ALLOWED_CLIENT_HOSTS=localhost:3000,dev.kyeol.com
```

---

## 모범 사례

### 1. TypeScript 타입 안전성

GraphQL 쿼리에서 생성된 타입을 항상 사용합니다.

```typescript
// ✅ 올바른 방법
import { ProductListItemFragment } from '@/gql/graphql';

function ProductCard({ product }: { product: ProductListItemFragment }) {
  return <div>{product.name}</div>;
}

// ❌ 잘못된 방법
function ProductCard({ product }: { product: any }) {
  return <div>{product.name}</div>;
}
```

### 2. Server Components 활용

데이터 페칭은 Server Component에서 수행합니다.

```typescript
// ✅ 올바른 방법 (Server Component)
async function ProductListPage() {
  const products = await fetchProducts();  // 서버에서 실행
  return <ProductList products={products} />;
}

// ❌ 잘못된 방법 (Client Component에서 불필요한 useEffect)
'use client';
function ProductListPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);
}
```

### 3. 환경변수 검증

`.env.example` 파일을 최신 상태로 유지합니다.

```bash
# .env.example
NEXT_PUBLIC_SALEOR_API_URL=https://api.example.com/graphql/
NEXT_PUBLIC_STOREFRONT_URL=https://example.com
NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel
```

---

## 다른 레포지토리와의 관계

| 레포지토리            | 관계                            |
| --------------------- | ------------------------------- |
| saleor (Saleor Core)  | 이 레포가 API 클라이언트로 사용 |
| kyeol-app-gitops      | 이 레포의 이미지를 EKS에 배포   |
| kyeol-infra-terraform | ECR 레포지토리 생성             |

---

## 관련 문서

- **애플리케이션 운영**: [kyeol-docs/runbook/runbook-ops.md](../kyeol-docs/runbook/runbook-ops.md)
- **장애 대응**: [kyeol-docs/troubleshooting.md](../kyeol-docs/troubleshooting.md)
- **Saleor 공식 문서**: https://docs.saleor.io/

---

**마지막 업데이트**: 2026-01-21
**Next.js 버전**: 13.5.6
**Node.js 요구사항**: >= 18
**레포지토리**: https://github.com/saleor/storefront (Forked)
