# 🛒 kyeol-storefront

> **KYEOL Saleor Storefront - Next.js 기반 e-Commerce 프론트엔드**

---

## 📌 이 레포는 무엇을 하는가

Saleor GraphQL API를 사용하는 **고객용 쇼핑몰 프론트엔드**입니다.

**기술 스택**:
- Next.js 14+ (React Server Components)
- TypeScript
- GraphQL (urql)
- Tailwind CSS

---

## 👤 언제 / 누가 / 왜 사용하는가

| 상황 | 사용 여부 |
|------|:--------:|
| 프론트엔드 UI 개발 | ✅ 사용 |
| 새 컴포넌트/페이지 추가 | ✅ 사용 |
| Kubernetes 배포 | ❌ 미사용 (kyeol-app-gitops 사용) |
| 인프라 관리 | ❌ 미사용 (kyeol-infra-terraform 사용) |

---

## 🏛️ 전체 아키텍처에서의 위치

```
[이 레포] kyeol-storefront
    ↓ (GitHub Actions: Docker Build & Push)
[ECR] min-kyeol-*-storefront:*-latest
    ↓ (이미지 참조)
[kyeol-app-gitops] Deployment 배포
    ↓
[EKS] Pod 실행
    ↓
[인터넷] origin-*.msp-g1.click
```

---

## 📁 주요 디렉터리 설명

```
kyeol-storefront/
├── src/                   # 소스 코드
│   ├── app/              # Next.js App Router
│   ├── components/       # React 컴포넌트
│   └── graphql/          # GraphQL 쿼리/뮤테이션
├── .github/
│   └── workflows/
│       └── build-push-ecr.yml  # ECR 빌드/푸시 워크플로
├── Dockerfile             # 컨테이너 이미지 정의
└── next.config.js         # Next.js 설정
```

---

## ⚠️ 주의사항

### 🔧 로컬 개발

```powershell
pnpm install
pnpm dev  # localhost:3000
```

### 🚫 절대 하지 말아야 할 것

1. **환경변수를 코드에 하드코딩하지 마세요**
   - `.env.local`은 Git 커밋 금지

2. **main 브랜치에 직접 push 금지**
   - PR 리뷰 후 merge

---

## 🔗 다른 레포와의 관계

| 레포지토리 | 관계 |
|-----------|------|
| kyeol-app-gitops | 이 레포의 이미지를 배포 |
| kyeol-infra-terraform | ECR 레포지토리 생성 |

---

## 🚀 CI/CD (GitHub Actions)

`main` 브랜치 push 시 자동 실행:
- DEV, STAGE, PROD 환경별 Docker 이미지 빌드
- 환경별 ECR 레포지토리에 push

**태그 규칙**: `{env}-latest`, `{env}-{commit-sha}`

---

> **마지막 업데이트**: 2026-01-03
