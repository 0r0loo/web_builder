# 리팩토링 룰

프로젝트의 코드 품질과 유지보수성을 위한 리팩토링 가이드라인

## 핵심 원칙

### 1. 단일 책임 원칙 (Single Responsibility)
- **하나의 파일은 하나의 책임만**
- 각 모듈/컴포넌트는 명확한 단일 목적을 가져야 함

### 2. 파일 크기 제한
- **최대 200-300줄**을 권장
- 300줄 초과 시 분리 검토
- 500줄 이상은 반드시 분리

### 3. 로직 분리

#### Store 분리 (Zustand Slices 패턴)
```
features/editor/store/
├── editorStore.ts          # Store 조합 (메인)
├── slices/
│   ├── pageSlice.ts        # 페이지 관리
│   ├── nodeSlice.ts        # 노드 CRUD
│   ├── selectionSlice.ts   # 선택/호버
│   ├── viewportSlice.ts    # 브레이크포인트/모드
│   ├── historySlice.ts     # Undo/Redo
│   └── uiSlice.ts          # UI 패널 토글
```

#### 유틸리티 함수 분리
```
lib/utils/
├── tree.ts                 # 트리 조작 함수
├── node.ts                 # 노드 헬퍼
├── id.ts                   # ID 생성
└── cn.ts                   # 클래스명 병합
```

#### 컴포넌트 분리
```
components/
├── ComponentName.tsx       # 메인 컴포넌트 (100줄 이하)
├── ComponentName/
│   ├── index.tsx           # 메인 컴포넌트
│   ├── SubComponent.tsx    # 하위 컴포넌트
│   ├── hooks.ts            # 커스텀 훅
│   └── utils.ts            # 유틸리티
```

### 4. 명확한 네이밍

#### 파일명
- **파일명 = 책임** (파일명만 봐도 역할 파악 가능)
- `userAuthentication.ts` ✅
- `utils.ts` ❌ (너무 광범위)

#### 변수명 규칙
- **절대 한 글자 변수명 사용 금지**
- 의미를 명확하게 표현하는 이름 사용
- 예외: 반복문의 `index`는 `i` 허용 (단, 중첩 시 `i`, `j`, `k` 대신 명확한 이름 사용)

```typescript
// ❌ 나쁜 예
pages.map((p) => p.id)
users.filter((u) => u.active)
const e = document.getElementById('btn')

// ✅ 좋은 예
pages.map((page) => page.id)
users.filter((user) => user.active)
const button = document.getElementById('btn')

// 반복문 예외
for (let i = 0; i < 10; i++) { } // ✅ 허용
for (let index = 0; index < 10; index++) { } // ✅ 더 좋음

// 중첩 반복문
for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
  for (let colIndex = 0; colIndex < cols; colIndex++) { }
}
```

### 5. Import 구조화
```typescript
// 1. 외부 라이브러리
import { create } from "zustand";
import { useState } from "react";

// 2. 타입
import type { Page } from "@/types/page";

// 3. 내부 모듈
import { generateId } from "@/lib/utils/id";
import { findNodeById } from "@/lib/utils/tree";

// 4. 상대 경로
import { Button } from "./Button";
```

## 리팩토링 체크리스트

### 파일이 다음에 해당하면 분리하세요:

- [ ] 300줄 이상
- [ ] 여러 책임을 가짐 (예: Store + 헬퍼 함수)
- [ ] 스크롤이 너무 길어서 전체 파악 어려움
- [ ] 함수가 10개 이상
- [ ] 다른 곳에서도 재사용 가능한 로직 포함

### 좋은 분리 예시

#### Before (나쁜 예 ❌)
```typescript
// userManagement.ts (500줄)
export function createUser() { ... }
export function updateUser() { ... }
export function deleteUser() { ... }
export function validateEmail() { ... }
export function hashPassword() { ... }
export function sendWelcomeEmail() { ... }
export function generateUserReport() { ... }
```

#### After (좋은 예 ✅)
```typescript
// user/crud.ts (100줄)
export function createUser() { ... }
export function updateUser() { ... }
export function deleteUser() { ... }

// user/validation.ts (50줄)
export function validateEmail() { ... }
export function validatePassword() { ... }

// user/auth.ts (80줄)
export function hashPassword() { ... }
export function verifyPassword() { ... }

// user/notifications.ts (60줄)
export function sendWelcomeEmail() { ... }
export function sendPasswordReset() { ... }

// user/reports.ts (100줄)
export function generateUserReport() { ... }
```

## Zustand Store 분리 패턴

### Slice 구조
```typescript
// slices/pageSlice.ts
import type { StateCreator } from "zustand";

export interface PageSlice {
  pages: Page[];
  currentPageId: string | null;
  createPage: (input: CreatePageInput) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string) => void;
  getCurrentPage: () => Page | null;
}

export const createPageSlice: StateCreator<
  EditorStore,
  [],
  [],
  PageSlice
> = (set, get) => ({
  pages: [],
  currentPageId: null,

  createPage: (input) => {
    // 구현...
  },

  // ... 기타 액션
});
```

### Store 조합
```typescript
// editorStore.ts
import { create } from "zustand";
import { createPageSlice } from "./slices/pageSlice";
import { createNodeSlice } from "./slices/nodeSlice";
import { createSelectionSlice } from "./slices/selectionSlice";

export const useEditorStore = create<EditorStore>()((...a) => ({
  ...createPageSlice(...a),
  ...createNodeSlice(...a),
  ...createSelectionSlice(...a),
}));
```

## 컴포넌트 분리 패턴

### 단일 파일 (간단한 컴포넌트)
```typescript
// Button.tsx (50줄 이하)
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

### 디렉토리 구조 (복잡한 컴포넌트)
```typescript
// DataTable/
//   ├── index.tsx              # 메인 컴포넌트 (50줄)
//   ├── TableHeader.tsx        # 헤더 (40줄)
//   ├── TableRow.tsx           # 행 (60줄)
//   ├── TablePagination.tsx    # 페이지네이션 (80줄)
//   ├── useTableState.ts       # 상태 관리 훅 (100줄)
//   ├── useTableSort.ts        # 정렬 로직 (70줄)
//   └── utils.ts               # 유틸리티 (50줄)
```

## 적용 타이밍

### 즉시 리팩토링
- 새 기능 추가 전
- PR 리뷰 시 지적된 경우
- 파일이 500줄 넘어갈 때

### 점진적 리팩토링
- 기존 코드 수정할 때 함께
- "보이스카웃 룰": 코드를 체크아웃할 때보다 더 깨끗하게

### 리팩토링 하지 말 것
- 동작하는 코드를 "그냥 보기 싫어서"
- 마감이 급할 때
- 테스트가 없을 때

## 예외 사항

다음은 300줄 넘어도 괜찮음:
- **설정 파일** (예: tailwind.config.js with lots of theme)
- **타입 정의 파일** (types.ts with comprehensive interfaces)
- **레거시 코드** (점진적 개선 계획 있을 때)

---

**원칙**: 코드는 "읽히기 쉬워야" 하고, "수정하기 쉬워야" 한다.