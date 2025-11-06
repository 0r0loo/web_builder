# Container Flex 레이아웃 버그

## 문제 설명

Container 컴포넌트의 레이아웃을 `display: flex; flex-direction: row`로 설정해도 자식 요소들이 가로로 배치되지 않고 세로(column)로 배치되는 버그

## 증상

- PropertiesPanel에서 Container의 Layout을 다음과 같이 설정:
  - `display: flex`
  - `flexDirection: row`
- 예상 동작: 자식 요소들이 가로로 한 줄에 배치
- 실제 동작: 자식 요소들이 세로로 column 상태로 배치됨

## 영향받는 파일

- `src/features/builder-components/primitives/Container.tsx`

## 근본 원인 분석

### 문제의 DOM 구조

```html
<!-- ComponentRenderer의 wrapper div (flex 스타일이 적용됨) -->
<div style="display: flex; flex-direction: row;">
  <!-- Container가 추가한 불필요한 wrapper div -->
  <div>
    <!-- 실제 자식 컴포넌트들 -->
    <div>Child 1</div>
    <div>Child 2</div>
  </div>
</div>
```

### 문제점

1. **이중 래핑**: ComponentRenderer가 이미 wrapper div를 제공하는데, Container가 또 다른 div를 추가
2. **스타일 적용 대상 불일치**: flex 스타일은 ComponentRenderer의 wrapper에 적용되지만, 실제 자식들은 Container의 div 안에 있음
3. **flex 컨텍스트 단절**: Container의 불필요한 div가 flex 컨텍스트를 차단

### ComponentRenderer의 구조

```tsx
// ComponentRenderer.tsx
export function ComponentRenderer({ node, breakpoint, children }: ComponentRendererProps) {
  // 반응형 스타일 병합
  const styles = mergeResponsiveStyles(node, breakpoint);

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(...)}
      style={{ ...styles, ...dragStyle }}  // 여기에 flex 스타일 적용
      data-component-id={node.id}
      data-component-type={node.type}
      {...(isSelected ? { ...attributes, ...listeners } : {})}
    >
      <Component node={node}>{children}</Component>  {/* Container 렌더링 */}
    </div>
  );
}
```

### 초기 Container 구현

```tsx
// Container.tsx (버그 있는 버전)
export function Container({ node, children }: ContainerProps) {
  return <div>{children}</div>;  // 불필요한 wrapper div
}
```

## 해결 방법

Container 컴포넌트가 불필요한 wrapper div를 생성하지 않도록 Fragment로 변경

### 수정된 코드

```tsx
// Container.tsx (수정된 버전)
export function Container({ children }: ContainerProps) {
  return <>{children}</>;  // Fragment로 변경
}
```

### 수정 후 DOM 구조

```html
<!-- ComponentRenderer의 wrapper div (flex 스타일이 직접 적용됨) -->
<div style="display: flex; flex-direction: row;">
  <!-- 자식 컴포넌트들이 바로 flex item이 됨 -->
  <div>Child 1</div>
  <div>Child 2</div>
</div>
```

## 기술적 세부사항

### React Fragment의 역할

- Fragment (`<>...</>`)는 추가 DOM 노드 없이 여러 자식을 그룹화
- DOM에는 렌더링되지 않고 React의 가상 DOM에만 존재
- 불필요한 wrapper 제거에 이상적

### Flex 레이아웃의 작동 원리

```css
/* Flex Container */
.container {
  display: flex;
  flex-direction: row;
}

/* Direct children이 flex items이 됨 */
.container > .child {
  /* flex item 속성 적용 가능 */
}

/* 중간에 다른 요소가 있으면 flex가 적용되지 않음 */
.container > .wrapper > .child {
  /* flex item이 아님 - 단순히 .wrapper의 자식 */
}
```

### ComponentRenderer의 역할

ComponentRenderer는 모든 컴포넌트에 대해:
1. 스타일 적용을 위한 wrapper div 제공
2. Drag & Drop 기능 (draggable, droppable) 제공
3. 선택 상태 관리 및 시각적 피드백
4. 이벤트 핸들링 (클릭, 드래그 등)

따라서 Container는 자체적인 wrapper를 제공할 필요가 없음

## 다른 컴포넌트들과의 일관성

### Text, Button 컴포넌트

```tsx
// Text.tsx
export function Text({ node }: TextProps) {
  const { content = "텍스트 입력" } = node.props;
  return <span>{content}</span>;  // wrapper 없음
}

// Button.tsx
export function Button({ node }: ButtonProps) {
  const { label = "버튼" } = node.props;
  return <button type="button">{label}</button>;  // wrapper 없음
}
```

### Container의 특수성

- **allowChildren: true**: 자식을 가질 수 있는 유일한 primitive 컴포넌트
- **Layout Container**: flex, grid 등의 레이아웃을 제어하는 역할
- **Fragment 사용**: 자식들을 직접 노출하여 ComponentRenderer의 스타일이 직접 적용되도록 함

## 테스트 시나리오

### 테스트 1: Flex Row 레이아웃

1. Container 추가
2. Container에 Text 컴포넌트 2개 추가
3. Container 선택 → PropertiesPanel에서 설정:
   - Layout → Display: `flex`
   - Layout → Flex Direction: `row`
4. 결과 확인: 두 Text가 가로로 나란히 배치

### 테스트 2: Flex Column 레이아웃

1. Container 추가
2. Container에 Button 컴포넌트 3개 추가
3. Container 선택 → PropertiesPanel에서 설정:
   - Layout → Display: `flex`
   - Layout → Flex Direction: `column`
   - Layout → Gap: `10px`
4. 결과 확인: 세 Button이 세로로 10px 간격으로 배치

### 테스트 3: Grid 레이아웃

1. Container 추가
2. Container에 Image 컴포넌트 6개 추가
3. Container 선택 → PropertiesPanel에서 설정:
   - Layout → Display: `grid`
   - Layout → Grid Template Columns: `repeat(3, 1fr)`
   - Layout → Gap: `16px`
4. 결과 확인: 6개 이미지가 3열 그리드로 배치

## 커밋 정보

- Commit: `cb4c16d`
- Message: "fix: Container 컴포넌트의 불필요한 wrapper div 제거"
- 날짜: 2025-11-06

## 교훈

1. **ComponentRenderer 이해**: 모든 컴포넌트가 이미 wrapper div를 갖고 있음을 인지
2. **불필요한 래핑 지양**: 추가 DOM 노드는 스타일 적용을 방해할 수 있음
3. **Fragment 활용**: 자식을 그룹화하되 DOM 구조를 깨뜨리지 않는 패턴
4. **Layout 컴포넌트의 특수성**: Container는 자식들의 배치를 제어하므로 추가 래핑이 오히려 방해가 됨
5. **일관성 있는 아키텍처**: 모든 컴포넌트가 ComponentRenderer를 통해 렌더링되는 구조 이해 필요