# 빈 캔버스 드래그 앤 드롭 버그

## 문제 설명

빈 캔버스 상태 (컴포넌트가 없는 초기 상태)에서 컴포넌트 라이브러리로부터 컴포넌트를 드래그 앤 드롭해도 캔버스에 추가되지 않는 버그

## 증상

- 캔버스가 비어있을 때 "여기에 컴포넌트를 드래그하세요" 플레이스홀더 메시지가 표시됨
- 좌측 사이드바에서 컴포넌트를 드래그하여 캔버스에 드롭 시도
- 드롭 이벤트가 발생하지 않고 컴포넌트가 추가되지 않음
- 이미 컴포넌트가 하나라도 있는 상태에서는 정상 작동

## 영향받는 파일

- `src/features/editor/components/Canvas.tsx`

## 근본 원인 분석

### 초기 코드 구조

```tsx
{!currentPage && (
  <div>페이지를 불러오는 중...</div>
)}

{currentPage && (
  <div>
    {hasChildren ? (
      <PageRenderer page={currentPage} breakpoint={currentBreakpoint} />
    ) : (
      <div>여기에 컴포넌트를 드래그하세요 (빈 메시지)</div>
    )}
  </div>
)}
```

### 문제점

1. **PageRenderer가 조건부 렌더링됨**: `hasChildren`이 false일 때 PageRenderer가 렌더링되지 않음
2. **Root 컴포넌트가 DOM에 없음**: PageRenderer가 렌더링되지 않으면 root 컴포넌트도 DOM에 존재하지 않음
3. **Droppable 영역 부재**: dnd-kit의 droppable 영역이 없어서 드롭 이벤트가 발생하지 않음

### PageRenderer와 Root의 관계

```tsx
// PageRenderer.tsx
export function PageRenderer({ page, breakpoint }: PageRendererProps) {
  return (
    <ComponentRenderer
      node={page.root}  // root 컴포넌트 렌더링
      breakpoint={breakpoint}
    >
      {/* children rendering */}
    </ComponentRenderer>
  );
}
```

```tsx
// ComponentRenderer.tsx - Container는 droppable 설정됨
const { setNodeRef: setDroppableRef, isOver } = useDroppable({
  id: node.id,  // root의 id
  data: {
    type: "canvas-container",
    nodeId: node.id,
    accepts: ["component-library", "canvas-node"],
  },
  disabled: !isContainer,
});
```

## 해결 시도

### 1차 시도 (실패)

**접근**: 빈 메시지 div에 `pointer-events-none` 추가

```tsx
<div className="pointer-events-none flex h-full min-h-[600px] ...">
  여기에 컴포넌트를 드래그하세요
</div>
```

**결과**: 실패 ❌

**이유**: 근본 원인을 해결하지 못함. PageRenderer가 렌더링되지 않아 droppable 영역 자체가 없음

### 2차 시도 (성공)

**접근**: PageRenderer를 항상 렌더링하고, 빈 메시지를 absolute overlay로 표시

```tsx
<div className="relative min-h-[600px] bg-white shadow-lg ...">
  {/* 항상 PageRenderer를 렌더하여 root가 droppable이 되도록 함 */}
  <PageRenderer page={currentPage} breakpoint={currentBreakpoint} />

  {/* 빈 캔버스 상태 메시지 (overlay) */}
  {!hasChildren && (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
      <div className="text-center">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          여기에 컴포넌트를 드래그하세요
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          좌측 사이드바에서 컴포넌트를 선택하여 시작하세요
        </p>
      </div>
    </div>
  )}
</div>
```

**결과**: 성공 ✅

**핵심 변경사항**:
1. **PageRenderer 항상 렌더링**: root 컴포넌트가 항상 DOM에 존재
2. **빈 메시지는 overlay로**: `position: absolute`로 PageRenderer 위에 겹쳐서 표시
3. **pointer-events-none 유지**: overlay가 드롭 이벤트를 차단하지 않음

## 기술적 세부사항

### DnD Kit의 Droppable 작동 원리

1. `useDroppable` 훅이 호출되면 해당 요소를 droppable 영역으로 등록
2. 드래그 이벤트 발생 시 등록된 droppable 영역들과 마우스 위치를 비교
3. `over` 객체에 현재 마우스가 위치한 droppable의 id 정보 전달
4. `handleDragEnd`에서 `over.id`를 parentId로 사용하여 노드 추가

### 왜 PageRenderer가 렌더링되어야 하는가?

```tsx
// useDragAndDrop.ts
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over) return;  // over가 없으면 드롭 실패

  // over.id는 드롭 타겟의 id (root의 id)
  const parentId = String(over.id);
  addNode(parentId, newNode);  // parentId로 노드 추가
};
```

- `over` 객체가 존재하려면 droppable 영역이 DOM에 있어야 함
- PageRenderer가 렌더링되지 않으면 root가 DOM에 없어서 `over`가 null
- 결과적으로 드롭이 실패하고 노드가 추가되지 않음

## 테스트 방법

1. 개발 서버 실행: `yarn dev`
2. `/editor` 페이지 접속
3. 빈 캔버스 상태 확인 (플레이스홀더 메시지 표시)
4. 좌측 사이드바에서 아무 컴포넌트 선택
5. 캔버스 중앙으로 드래그 앤 드롭
6. 컴포넌트가 캔버스에 정상 추가되는지 확인

## 커밋 정보

- Commit: `f45555e`
- Message: "fix: 빈 캔버스에서 드래그 앤 드롭이 작동하지 않는 버그 수정"
- 날짜: 2025-11-06

## 교훈

1. **조건부 렌더링 주의**: 핵심 기능(droppable 영역)이 조건에 따라 사라지지 않도록 주의
2. **라이브러리 작동 원리 이해**: dnd-kit은 DOM 요소가 존재해야 droppable로 인식
3. **UI와 기능의 분리**: 시각적 요소(플레이스홀더)와 기능적 요소(droppable 영역)는 독립적으로 처리
4. **Overlay 패턴 활용**: absolute positioning을 활용하면 UI와 기능을 분리할 수 있음