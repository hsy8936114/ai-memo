# 📝 슈퍼 메모앱 (Super Memo App)

**핸즈온 실습용 Next.js 메모 애플리케이션**

Supabase(Postgres)에 데이터를 저장하는 완전한 CRUD 기능을 갖춘 슈퍼 메모앱으로, MCP 연동 및 GitHub PR 생성 실습의 기반이 되는 프로젝트입니다.

## 🚀 주요 기능

- ✅ 메모 생성, 읽기, 수정, 삭제 (CRUD)
- 📝 마크다운 편집기(`@uiw/react-md-editor`)로 작성하고, 상세 보기에서 마크다운 렌더링
- 📂 카테고리별 메모 분류 (개인, 업무, 학습, 아이디어, 기타)
- 🏷️ 태그 시스템으로 메모 태깅
- 🔍 제목, 내용, 태그 기반 실시간 검색
- 📱 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 💾 Supabase(Postgres) 기반 데이터 저장 (Next.js Server Actions 경유)
- 🤖 Anthropic Claude를 이용한 메모 AI 요약
- 🎨 모던한 UI/UX with Tailwind CSS

## 🛠 기술 스택

- **Framework**: Next.js 16.2.9 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: Supabase (`@supabase/supabase-js`) + Next.js Server Actions
- **AI 요약**: Anthropic Claude (`@anthropic-ai/sdk`, 서버 액션에서만 호출)
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Package Manager**: npm

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다. (`.env*`는 git에 올라가지 않습니다.)

```bash
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
ANTHROPIC_API_KEY=<Anthropic API 키>  # 선택: 없으면 AI 요약이 생성되지 않습니다
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 브라우저 접속

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
super-memo-app/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── memoActions.ts   # Supabase CRUD 서버 액션
│   │   ├── globals.css          # 글로벌 스타일
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   └── page.tsx             # 메인 페이지
│   ├── components/
│   │   ├── MemoForm.tsx         # 메모 생성/편집 폼
│   │   ├── MemoItem.tsx         # 개별 메모 카드
│   │   ├── MemoList.tsx         # 메모 목록 및 필터
│   │   └── MemoViewer.tsx       # 메모 상세 보기
│   ├── hooks/
│   │   └── useMemos.ts          # 메모 관리 커스텀 훅
│   ├── types/
│   │   └── memo.ts              # 메모 타입 정의
│   └── utils/
│       ├── memoDisplay.ts       # 메모 표시용 헬퍼
│       ├── memoMapper.ts        # DB 행 ↔ Memo 변환
│       ├── summarize.ts         # Claude AI 요약
│       └── supabase/
│           └── server.ts        # 서버용 Supabase 클라이언트
└── README.md                    # 프로젝트 문서
```

## 💡 주요 컴포넌트

### MemoItem

- 개별 메모를 카드 형태로 표시
- 편집/삭제 액션 버튼
- 카테고리 배지 및 태그 표시
- 날짜 포맷팅 및 텍스트 클램핑

### MemoForm

- 메모 생성/편집을 위한 모달 폼
- 제목, 내용(마크다운 편집기), 카테고리, 태그 입력
- 태그 추가/제거 기능
- 폼 검증 및 에러 처리

### MemoViewer

- 메모 상세 보기 모달 (ESC 키 또는 바깥 영역 클릭으로 닫기)
- 마크다운 렌더링 및 AI 요약 표시
- 편집/삭제 버튼 (삭제 시 확인 창)

### MemoList

- 메모 목록 그리드 표시
- 실시간 검색 및 카테고리 필터링
- 통계 정보 및 빈 상태 처리
- 반응형 그리드 레이아웃

## 📊 데이터 구조

```typescript
interface Memo {
  id: string // 고유 식별자
  title: string // 메모 제목
  content: string // 메모 내용
  category: string // 카테고리 (personal, work, study, idea, other)
  tags: string[] // 태그 배열
  summary?: string | null // AI 요약 (선택)
  createdAt: string // 생성 날짜 (ISO string)
  updatedAt: string // 수정 날짜 (ISO string)
}
```

## 🎯 실습 시나리오

이 프로젝트는 다음 3가지 실습의 기반으로 사용됩니다. 아래는 현재 진행 상태입니다:

### 실습 1: Supabase MCP 마이그레이션 (45분) — ✅ 적용 완료

- LocalStorage에서 Supabase 데이터베이스(`memos` 테이블)로 전환했습니다.
- 데이터 접근은 Server Actions(`src/app/actions/memoActions.ts`)를 통해서만 이루어집니다.

### 실습 2: 기능 확장 + GitHub PR (60분) — 진행 전

- 메모 즐겨찾기 기능 추가 (아직 구현되지 않았습니다)
- Cursor Custom Modes로 PR 생성
- 코드 리뷰 및 협업 실습

### 실습 3: Playwright MCP 테스트 (45분) — 설정만 완료

- Playwright 설정(`playwright.config.ts`)과 `npm run test` 계열 스크립트는 준비되어 있습니다.
- 테스트 파일(`tests/` 폴더)은 아직 작성되지 않았습니다.
- 브라우저 자동화 및 시각적 테스트, 성능 측정 및 리포트는 이후 단계입니다.

자세한 실습 가이드는 강의자료를 참고하세요.

## 🔧 개발 가이드

### 메모 CRUD 작업

```typescript
// useMemos 훅 사용 예시
const {
  memos, // 필터링된 메모 목록
  loading, // 로딩 상태
  error, // 에러 메시지
  createMemo, // 메모 생성
  updateMemo, // 메모 수정
  deleteMemo, // 메모 삭제
  searchMemos, // 검색
  filterByCategory, // 카테고리 필터링
  stats, // 통계 정보
} = useMemos()
```

### Supabase 서버 액션

DB 접근은 클라이언트에서 직접 하지 않고 `src/app/actions/memoActions.ts`의 서버 액션(`'use server'`)으로만 수행합니다. `useMemos` 훅이 이 액션을 호출합니다.

```typescript
import {
  getMemos,
  createMemo,
  updateMemo,
  deleteMemo,
} from '@/app/actions/memoActions'

// 모든 메모 가져오기 (최신순)
const memos = await getMemos()

// 메모 생성 (AI 요약 자동 생성)
const memo = await createMemo({ title, content, category, tags })
```

## 🚀 배포

### Vercel 배포

```bash
npm run build
npx vercel --prod
```

배포 환경에도 `.env.local`과 같은 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`)를 등록해야 합니다. 이 앱은 서버 액션을 사용하므로 정적 파일만 올리는 방식(`dist` 폴더 업로드 등)으로는 배포할 수 없고, Node.js 서버 실행을 지원하는 환경이 필요합니다.

### Netlify 배포

Netlify에서도 Git 저장소를 연결해 Next.js 빌드(`npm run build`)로 배포할 수 있으며, 위와 같은 환경변수를 사이트 설정에 등록합니다.

## 📄 라이선스

MIT License - 학습 및 실습 목적으로 자유롭게 사용 가능합니다.

## 🤝 기여

이 프로젝트는 교육용으로 제작되었습니다. 개선사항이나 버그 리포트는 이슈나 PR로 제출해 주세요.

---

**Made with ❤️ for hands-on workshop**
