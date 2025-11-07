# 이미지 컴포넌트 순서 변경(드래그) 문제

## 문제 설명

이미지 컴포넌트를 선택(클릭)은 가능하지만, 드래그해서 순서를 변경하는 것이 작동하지 않습니다.

## 현재 상태

- ✅ 이미지 클릭 시 선택됨 (파란색 테두리 표시)
- ❌ 선택된 이미지를 드래그해서 다른 위치로 이동 불가
- ✅ 텍스트, 버튼, 컨테이너 등 다른 컴포넌트는 드래그가 정상 작동

## 재현 방법

1. 에디터에서 여러 개의 컴포넌트 추가 (예: 이미지 2개)
2. 이미지 중 하나를 클릭해서 선택
3. 선택된 이미지를 드래그해서 다른 위치로 이동 시도
4. 이동이 되지 않음

## 예상 원인

### 1. 브라우저 기본 드래그 동작
- `<img>` 태그는 브라우저에서 기본적으로 드래그 가능
- 브라우저 기본 드래그와 dnd-kit sortable 드래그가 충돌

### 2. 이벤트 전달 문제
- 이미지가 wrapper div를 100% 채우고 있어서 드래그 이벤트가 제대로 전달되지 않음
- `pointerEvents: "none"` 추가 시 클릭은 되지만 드래그 시작 이벤트가 제대로 작동하지 않음

### 3. ComponentRenderer의 sortable 설정
```tsx
const { attributes, listeners, ... } = useSortable({
  id: node.id,
  disabled: !isSelected, // 선택된 컴포넌트만 드래그 가능
});
```
- `listeners`가 wrapper div에 적용되어야 하는데, 이미지가 100% 영역을 차지해서 실제 드래그 시작 포인트를 잡지 못함

## 시도한 해결 방법들

### 1. `draggable={false}` 추가 (Image.tsx)
```tsx
<img draggable={false} />
```
- 브라우저 기본 드래그 비활성화 시도
- 효과 없음

### 2. `pointerEvents: "none"` 추가 (Image.tsx)
```tsx
<img style={{ pointerEvents: "none" }} />
```
- 클릭 이벤트를 wrapper로 전달하려는 시도
- 클릭은 작동하지만 드래그 이벤트는 여전히 작동하지 않음

### 3. `userSelect: "none"`, `touchAction: "none"` 추가 (ComponentRenderer.tsx)
```tsx
style={{
  ...wrapperStyles,
  ...(isSelected && {
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
  }),
}}
```
- 텍스트 선택 및 터치 이벤트 차단 시도
- 효과 없음

### 4. Image를 div로 감싸기
```tsx
<div style={wrapperStyle}>
  <img draggable={false} />
</div>
```
- 이벤트를 받을 수 있는 영역 생성 시도
- 효과 없음

## 필요한 추가 조사

1. **dnd-kit의 센서 설정 확인**
   - PointerSensor, MouseSensor, TouchSensor 설정 확인
   - activationConstraint 설정 필요 여부 확인

2. **다른 컴포넌트와의 비교**
   - Text, Button 컴포넌트는 왜 정상 작동하는지 분석
   - 구조적 차이점 파악

3. **이미지 특성 때문인지 확인**
   - `<img>` 태그 자체의 특수성
   - 대체 방법 (background-image 사용 등) 검토

## 제안하는 해결 방법

### 방법 1: 투명한 드래그 핸들 레이어 추가
선택된 이미지 위에 투명한 overlay를 추가하여 드래그 이벤트를 받도록 함

```tsx
{isSelected && (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      cursor: 'grab',
      zIndex: 10,
    }}
    {...attributes}
    {...listeners}
  />
)}
```

### 방법 2: dnd-kit 센서 커스터마이징
PointerSensor의 activationConstraint 설정으로 드래그 활성화 조건 조정

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 8px 이동 후 드래그 활성화
    },
  })
);
```

### 방법 3: 이미지를 background-image로 렌더링
`<img>` 대신 `<div>`의 background-image로 렌더링하여 기본 드래그 동작 회피

```tsx
<div
  style={{
    backgroundImage: `url(${src})`,
    backgroundSize: objectFit,
    ...
  }}
/>
```

## 참고 자료

- [dnd-kit 공식 문서 - Sensors](https://docs.dndkit.com/api-documentation/sensors)
- [dnd-kit 공식 문서 - Sortable](https://docs.dndkit.com/presets/sortable)
- [React DnD 이미지 드래그 이슈](https://github.com/react-dnd/react-dnd/issues/1345)

## 우선순위

🔴 **High** - 이미지는 웹 빌더의 핵심 컴포넌트이며, 순서 변경 기능은 필수적임

## 영향 범위

- Image 컴포넌트
- ComponentRenderer
- 전체 sortable 시스템 (다른 컴포넌트에도 영향 가능성)

## 생성일

2025-11-07

## 상태

🔴 **미해결** (Open)