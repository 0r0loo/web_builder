# Issue #001: 드래그앤드롭 후 즉시 리렌더링 안 되는 문제

## 메타데이터
- **발생 날짜**: 2025-11-06
- **심각도**: 🔴 High
- **상태**: ✅ 해결됨
- **관련 Phase**: Phase 4 (Drag & Drop)

## 증상

컴포넌트를 드래그앤드롭했을 때 즉시 캔버스에 나타나지 않음. 브라우저 창 크기를 조절하거나 레이아웃 변경을 유도하면 그제서야 컴포넌트가 나타남.

**사용자 보고**:
> "드래그앤드랍 하자마자 바로 리렌더링이 안되는것같아 레이아웃 변경하면 리렌더링되서 블록 추가되는데 드래그앤 드랍만하면 아무것도 추가가 안되네"

## 근본 원인

### 문제의 핵심: Shallow Copy + Direct Mutation

`src/lib/utils/tree.ts`의 `addNodeToTree` 함수가 shallow copy를 사용한 후 중첩된 배열을 직접 수정:

```typescript
// 문제 코드
export function addNodeToTree(
  page: Page,
  parentId: string | null,
  node: ComponentNode,
  index?: number,
): Page {
  const newRoot = { ...page.root }; // ❌ shallow copy

  // ... parentNode 찾기

  if (!parentNode.children) {
    parentNode.children = [];
  }

  if (index !== undefined) {
    parentNode.children.splice(index, 0, node); // ❌ 직접 수정
  } else {
    parentNode.children.push(node); // ❌ 직접 수정
  }

  return { ...page, root: newRoot, updatedAt: Date.now() };
}
```

### 왜 문제가 되는가?

1. **Shallow Copy의 한계**:
   - `{ ...page.root }`는 최상위 레벨만 복사
   - `children` 배열은 여전히 같은 참조를 공유

2. **Zustand의 동작 방식**:
   - Zustand는 객체 참조(reference)가 변경되었는지 확인
   - `children` 배열의 참조가 변경되지 않아서 변경 감지 실패
   - 결과적으로 리렌더링 트리거 안 됨

3. **우연한 성공**:
   - 창 크기 조절 → 다른 상태 변경 → 전체 리렌더링
   - 그제서야 업데이트된 상태가 화면에 반영

## 해결 방법

### Immer 미들웨어 도입

**1단계: Immer 설치**
```bash
yarn add immer
```

**2단계: Zustand Store에 Immer 미들웨어 적용**

`src/features/editor/store/editorStore.ts`:
```typescript
import { immer } from "zustand/middleware/immer";

export const useEditorStore = create<EditorStore>()(
  immer((...a) => ({
    ...createPageSlice(...a),
    ...createNodeSlice(...a),
    ...createSelectionSlice(...a),
    ...createViewportSlice(...a),
    ...createHistorySlice(...a),
    ...createUISlice(...a),
  })),
);
```

**3단계: NodeSlice를 Immer 스타일로 변경**

`src/features/editor/store/slices/nodeSlice.ts`:
```typescript
export const createNodeSlice: StateCreator<
  EditorStore,
  [["zustand/immer", never]], // ✅ Immer 미들웨어 타입 추가
  [],
  NodeSlice
> = (set, get) => ({
  addNode: (parentId, node) => {
    set((state) => {
      const currentPage = state.pages.find(
        (page) => page.id === state.currentPageId,
      );
      if (!currentPage) return;

      // ✅ Immer draft state를 직접 수정 가능
      if (parentId === null || parentId === currentPage.root.id) {
        if (!currentPage.root.children) currentPage.root.children = [];
        currentPage.root.children.push(node); // ✅ 직접 push 가능
      } else {
        const addToParent = (current: ComponentNode): boolean => {
          if (current.id === parentId) {
            if (!current.children) current.children = [];
            current.children.push(node); // ✅ 직접 push 가능
            return true;
          }

          if (current.children) {
            for (const child of current.children) {
              if (addToParent(child)) return true;
            }
          }

          return false;
        };

        addToParent(currentPage.root);
      }

      currentPage.updatedAt = Date.now();
    });

    get().saveToHistory();
  },
  // ... 나머지 메서드
});
```

### Immer의 동작 원리

1. **Draft State**: Immer가 state의 Proxy 객체 생성
2. **직접 수정**: Draft를 직접 수정 (push, splice 등)
3. **자동 불변성**: Immer가 자동으로 새로운 불변 객체 생성
4. **참조 변경**: 변경된 모든 경로의 참조가 새로워짐
5. **Zustand 감지**: 참조 변경을 감지하여 리렌더링 트리거

## 관련 커밋

- `chore: Immer 미들웨어 추가 및 Zustand 스토어 설정` (b27fe63)
- `fix: addNode를 Immer 스타일로 변경하여 드래그앤드롭 즉시 반영` (28d4f8e)

## 교훈

### 1. 상태 관리에서의 불변성 중요성
- React/Zustand는 참조 동일성(reference equality)으로 변경 감지
- Shallow copy + 직접 수정은 변경 감지 실패의 주요 원인
- 중첩된 객체/배열은 특히 주의 필요

### 2. Immer의 장점
- 복잡한 불변성 코드 제거 (`...spread`, `map`, `filter` 체이닝)
- 읽기 쉬운 직관적인 코드 (직접 수정)
- 자동 참조 변경으로 안전한 상태 관리

### 3. 디버깅 팁
- 상태는 변경되는데 UI가 안 바뀐다면 → 참조 변경 확인
- `console.log`로 객체 내용 비교 (얕은 vs 깊은 비교)
- React DevTools로 리렌더링 추적

### 4. 타입스크립트 통합
```typescript
StateCreator<
  StoreType,
  [["zustand/immer", never]], // 미들웨어 타입 명시
  [],
  SliceType
>
```
- 타입 안전성 유지하면서 Immer 사용
- 컴파일 시점에 타입 체크

## 관련 파일

- `src/features/editor/store/editorStore.ts`
- `src/features/editor/store/slices/nodeSlice.ts`
- `src/lib/utils/tree.ts`
- `package.json` (immer 의존성)

## 참고 자료

- [Zustand Immer Middleware](https://docs.pmnd.rs/zustand/integrations/immer-middleware)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [React Re-rendering Guide](https://react.dev/learn/render-and-commit)