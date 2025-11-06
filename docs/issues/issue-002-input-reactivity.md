# Issue #002: PropertiesPanel 입력 필드 반응성 문제

## 메타데이터
- **발생 날짜**: 2025-11-06
- **심각도**: 🔴 High
- **상태**: ✅ 해결됨
- **관련 Phase**: Phase 5 (Component Selection & Properties Editing)

## 증상

PropertiesPanel에서 텍스트 내용, 버튼 텍스트, 폰트 크기 등을 입력하면:
- Input 필드에 값을 입력해도 UI에 반영되지 않음
- Console.log로 확인하면 상태는 정상적으로 업데이트됨
- 하지만 Input의 value는 변경되지 않음

**사용자 보고**:
> "지금 속성탭에서 폰트사이즈 같은거 input 변경하는데 변경이 안되네?"
> "텍스트 내용 추가하고싶어서 input 에 값 입력했더니 저렇게 나오고 내용이 안바껴"

**Console 로그 증거**:
```
✅ Props updated: {content: 'ㅇㅇㅇㅇㅇㅇㅇㅇ'}
// 하지만 UI의 input value는 여전히 이전 값
```

## 디버깅 과정

이 이슈는 3단계의 디버깅을 거쳐 해결되었습니다.

### 시도 1: Object.assign Shallow Merge 문제

**문제 코드**:
```typescript
updateNode: (nodeId, updates) => {
  set((state) => {
    const updateInTree = (current: ComponentNode): boolean => {
      if (current.id === nodeId) {
        // ❌ Object.assign은 shallow merge
        Object.assign(current, updates);
        return true;
      }
      // ...
    };
  });
};
```

**증상**:
- fontSize를 변경하면 color, fontWeight 등 다른 속성이 사라짐
- Styles 객체 전체가 교체됨

**해결 시도**:
```typescript
if (updates.props) {
  current.props = {
    ...current.props,
    ...updates.props,
  };
}

if (updates.styles) {
  current.styles = {
    desktop: {
      ...current.styles.desktop,
      ...updates.styles.desktop,
    },
    tablet: {
      ...current.styles.tablet,
      ...updates.styles.tablet,
    },
    mobile: {
      ...current.styles.mobile,
      ...updates.styles.mobile,
    },
  };
}

const { props, styles, ...rest } = updates;
Object.assign(current, rest);
```

**결과**: 여전히 input이 제대로 작동하지 않음

### 시도 2: 불필요한 Styles Spread 제거

**문제 코드** (`PropertiesPanel.tsx`):
```typescript
const handleStyleChange = (key: string, value: string) => {
  updateNode(node.id, {
    styles: {
      ...node.styles, // ❌ 모든 breakpoint를 불필요하게 포함
      [currentBreakpoint]: {
        ...currentStyles,
        [key]: value,
      },
    },
  });
};
```

**문제점**:
- 현재 breakpoint만 변경하는데 desktop, tablet, mobile 모두 전송
- 불필요한 데이터 전송 및 처리

**해결 시도**:
```typescript
const handleStyleChange = (key: string, value: string) => {
  updateNode(node.id, {
    styles: {
      [currentBreakpoint]: { // ✅ 현재 breakpoint만
        ...currentStyles,
        [key]: value,
      },
    },
  });
};
```

**결과**: 여전히 input이 제대로 작동하지 않음

### 시도 3: 핵심 원인 발견 - Zustand Reactivity

**문제 코드**:
```typescript
export function PropertiesPanel() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const updateNode = useEditorStore((state) => state.updateNode);

  // ❌ 함수 호출로 데이터를 가져옴 (반응성 깨짐)
  const getCurrentPage = useEditorStore((state) => state.getCurrentPage);
  const currentPage = getCurrentPage();

  const selectedNode = selectedNodeId && currentPage
    ? findNodeById(currentPage.root, selectedNodeId)
    : null;

  // ... rest of component
}
```

## 근본 원인

### Zustand의 Reactivity 시스템

**Zustand는 Selector 기반 구독**:
```typescript
// ✅ 반응형: Zustand가 state.pages 변경 추적
const selectedNode = useEditorStore((state) => {
  return findNodeById(state.pages, nodeId);
});

// ❌ 비반응형: 함수 호출로 구독 시스템 우회
const getPage = useEditorStore((state) => state.getPage);
const page = getPage(); // 이 시점의 스냅샷, 업데이트 안 됨
```

### 왜 문제가 되는가?

1. **초기 렌더링**:
   - `getCurrentPage()` 호출 → 현재 페이지 반환
   - `selectedNode`에 초기 상태 저장
   - Input이 이 `selectedNode`의 props를 표시

2. **사용자가 Input 입력**:
   - `handlePropChange` 호출
   - `updateNode()`로 Zustand 상태 업데이트 ✅
   - **하지만** PropertiesPanel은 리렌더링 안 됨 ❌
   - 왜? `getCurrentPage()`는 Zustand 구독 밖에 있음

3. **결과**:
   - 상태: 업데이트됨 (console.log로 확인 가능)
   - UI: 오래된 `selectedNode` 참조 사용
   - Input value: 변경 안 됨 (controlled input 패턴 깨짐)

### Controlled Input 패턴

React의 Controlled Input:
```typescript
<input
  value={node.props.content} // state에서 가져옴
  onChange={(e) => updateState(e.target.value)} // state 업데이트
/>
```

이 패턴이 작동하려면:
1. State 업데이트
2. **컴포넌트 리렌더링** ← 여기서 실패!
3. 새 value로 input 다시 렌더링

## 해결 방법

### Zustand Selector 직접 사용

**수정된 코드**:
```typescript
export function PropertiesPanel() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const updateNode = useEditorStore((state) => state.updateNode);

  // ✅ 직접 selector로 selectedNode 계산
  const selectedNode = useEditorStore((state) => {
    if (!selectedNodeId) return null;
    const currentPage = state.pages.find(
      (page) => page.id === state.currentPageId,
    );
    if (!currentPage) return null;
    return findNodeById(currentPage.root, selectedNodeId);
  });

  if (!selectedNodeId || !selectedNode) {
    return (/* empty state */);
  }

  // ... rest of component
}
```

### 동작 원리

1. **Zustand가 Selector 추적**:
   - `state.pages` 접근 감지
   - `state.currentPageId` 접근 감지
   - 이들이 변경되면 자동으로 컴포넌트 리렌더링

2. **Input 입력 시**:
   - `handlePropChange` → `updateNode` → Zustand state 업데이트
   - Zustand: "state.pages가 변경됨" 감지
   - PropertiesPanel 리렌더링 트리거
   - `selectedNode` selector 재실행
   - 새로운 props로 input value 업데이트

3. **결과**:
   - 상태 업데이트 ✅
   - 컴포넌트 리렌더링 ✅
   - Input value 반영 ✅

## 관련 커밋

- `fix: updateNode에서 props/styles deep merge로 수정` (c8f9a21)
- `fix: StylesEditor에서 불필요한 styles spread 제거` (8e4d2f3)
- `fix: PropertiesPanel 입력 필드 반응성 수정` (fb5af4c)

## 교훈

### 1. Zustand Reactivity 이해

**DO**:
```typescript
// ✅ Selector 사용 - 반응형
const data = useStore((state) => state.data);
const computed = useStore((state) => compute(state.data));
```

**DON'T**:
```typescript
// ❌ 함수 호출 - 비반응형
const getData = useStore((state) => state.getData);
const data = getData();
```

### 2. Controlled Input 디버깅

Input이 업데이트 안 될 때 체크리스트:
1. State가 실제로 변경되는가? (console.log)
2. 컴포넌트가 리렌더링되는가? (React DevTools)
3. Input의 value prop이 state에서 오는가?
4. onChange가 state를 업데이트하는가?

### 3. Zustand의 Getter 함수 주의

Store에 getter 함수를 만들 때:
```typescript
interface Store {
  data: Data[];
  getData: () => Data[]; // ⚠️ 주의: 구독 안 됨
}

// 대신 직접 selector 사용:
const data = useStore((state) => state.data);
```

### 4. 디버깅 프로세스

복잡한 버그는 단계적 접근:
1. **증상 확인**: UI가 업데이트 안 됨
2. **상태 확인**: console.log로 state 추적
3. **렌더링 확인**: React DevTools
4. **데이터 흐름 추적**: 어디서 끊기는지 확인
5. **근본 원인 파악**: 반응성 시스템 이해

### 5. Console Log의 Proxy 객체

Immer 사용 시 console에 Proxy 객체가 보임:
```
Proxy {content: "text"}
  [[Handler]]: Object
  [[Target]]: Object
  [[IsRevoked]]: false
```
이것은 정상이며, Immer의 draft state를 나타냄.

## 관련 파일

- `src/features/editor/components/PropertiesPanel.tsx` ⭐ 핵심
- `src/features/editor/store/slices/nodeSlice.ts`

## 참고 자료

- [Zustand - Selecting Multiple State Slices](https://docs.pmnd.rs/zustand/guides/auto-generating-selectors)
- [React Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- [Immer with Zustand](https://docs.pmnd.rs/zustand/integrations/immer-middleware)

## 디버깅 타임라인

```
1️⃣ 문제 발견: "input 변경이 안되네?"
   ↓
2️⃣ 시도 1: Object.assign → Deep merge
   ↓ (실패)
3️⃣ 시도 2: 불필요한 spread 제거
   ↓ (실패)
4️⃣ Console 로그 분석: "상태는 변경되는데 UI가 안 바뀜"
   ↓
5️⃣ 사용자 힌트: "혹시 여기에 문제 있는거아니야?" (handlePropChange)
   ↓
6️⃣ 데이터 흐름 역추적: selectedNode 획득 방식 확인
   ↓
7️⃣ 근본 원인 발견: getCurrentPage() 함수 호출 → 반응성 깨짐
   ↓
8️⃣ 해결: Zustand selector 직접 사용
   ↓
✅ 성공: Input 정상 작동
```

## 성능 고려사항

Selector를 직접 사용할 때 매번 `findNodeById`를 실행하므로 성능이 우려될 수 있음. 하지만:

1. **트리 깊이**: 일반적으로 얕음 (< 10 levels)
2. **업데이트 빈도**: 사용자 입력 시에만 (throttle 가능)
3. **Zustand 최적화**: 참조 동일성 체크로 불필요한 리렌더링 방지
4. **필요시 memoization**: useMemo로 최적화 가능

현재 구조에서는 성능 문제 없음.