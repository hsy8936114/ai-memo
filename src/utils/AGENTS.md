# Utils - AI Agent 지침서

## 모듈 역할

순수 유틸리티 함수 및 헬퍼 집합. 비즈니스 로직과 독립적인 재사용 가능한 기능을 제공한다.

## 의존성 관계

- `@/types/memo` — Memo 타입

## 유틸리티 목록

| 파일 | 역할 |
|------|------|
| `supabase/server.ts` | 서버 전용 Supabase 클라이언트 생성 (`createSupabaseServerClient`) |
| `memoMapper.ts` | DB 행(snake_case) ↔ `Memo`(camelCase) 변환 |
| `summarize.ts` | Claude로 메모 한국어 요약 생성 (`summarizeMemo`, 실패 시 null) |
| `memoDisplay.ts` | 날짜 포맷, 카테고리 색상 |

## 데이터 접근 구조

DB CRUD는 `src/app/actions/memoActions.ts`(Server Actions)가 담당하며, 이 유틸들을 조합해 사용한다.

```typescript
// memoActions.ts ('use server')
getMemos(): Promise<Memo[]>
createMemo(formData): Promise<Memo>           // insert 후 요약 생성
updateMemo(id, formData): Promise<Memo>       // update 후 요약 재생성
deleteMemo(id): Promise<void>
clearAllMemos(): Promise<void>
```

## 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase 접속
- `ANTHROPIC_API_KEY` — 요약 생성 (없으면 요약 없이 저장)
- `.env*` 파일은 읽기·쓰기 모두 차단되어 있으므로 사용자가 `.env.local`에 직접 관리한다 (필요한 키는 위 목록)

## Implementation Patterns

### SSR 안전한 브라우저 API 접근

```typescript
export const browserUtil = {
  doSomething: (): ReturnType => {
    // SSR 환경 체크 필수
    if (typeof window === 'undefined') return defaultValue

    try {
      // 브라우저 API 사용
      return window.someApi()
    } catch (error) {
      console.error('Error:', error)
      return defaultValue
    }
  },
}
```

### 새 유틸리티 파일 작성 템플릿

```typescript
// 타입 import
import { SomeType } from '@/types/someType'

// 상수 정의
const STORAGE_KEY = 'app-key'

// 객체 형태로 관련 함수 그룹화
export const utilName = {
  method1: (param: ParamType): ReturnType => {
    // 구현
  },

  method2: (param: ParamType): ReturnType => {
    // 구현
  },
}
```

## Local Golden Rules

### Do's

- 모든 유틸리티는 순수 함수로 작성 (사이드 이펙트 최소화)
- SSR 환경 체크는 함수 최상단에서 수행
- 에러 발생 시 적절한 기본값 반환
- JSON 파싱/직렬화 시 try-catch 필수

### Don'ts

- React 훅 사용 금지 (유틸리티는 훅이 아님)
- 전역 상태 변경 금지
- 직접 DOM 조작 금지 (React에 위임)
- 비동기 함수에서 에러 무시 금지

## DB 스키마

`public.memos` 테이블 (RLS 활성화, anon 전체 허용 정책 — 인증이 없는 앱이라 키를 아는 누구나 CRUD 가능하다. 인증 도입 시 사용자 기준 정책으로 교체할 것)

| 컬럼 | 타입 |
|------|------|
| `id` | uuid PK (v4) |
| `title`, `content`, `category` | text |
| `tags` | text[] |
| `summary` | text (nullable) |
| `created_at`, `updated_at` | timestamptz |

## 테스트 고려사항

- 순수 함수(`memoMapper`)는 입력 -> 출력 테스트
- `summarize.ts`, `supabase/server.ts`는 외부 서비스 의존이라 모킹 필요
