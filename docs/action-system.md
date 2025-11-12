# Action System 설계 문서

웹 빌더의 인터랙티브 액션 시스템 설계 및 구현 계획

## 개요

사용자가 컴포넌트(주로 Button)에 다양한 동작을 연결할 수 있는 시스템

### 핵심 목표
- ✅ Button 클릭 시 페이지 이동
- ⏳ Button 클릭 시 모달 열기
- ⏳ Button 클릭 시 API 요청
- ⏳ 커스텀 스크립트 실행

## 컴포넌트 역할 구분

### Link 컴포넌트
- **용도**: 텍스트 링크 (예: "자세히 보기", "여기를 클릭")
- **스타일**: 밑줄, 텍스트 색상, 호버 효과
- **동작**: 페이지 이동만 (internal/external)

### Button 컴포넌트
- **용도**: 버튼 스타일 인터랙션
- **스타일**: 배경색, 패딩, 테두리, 그림자
- **동작**: 다양한 액션 지원 (link, modal, api, custom)

**결론**: 둘 다 페이지 이동 가능하지만 비주얼 용도가 다름

## Action 데이터 구조

```typescript
// types/action.ts
export type ActionType = "none" | "link" | "modal" | "api" | "custom";

export interface BaseAction {
  type: ActionType;
}

export interface LinkAction extends BaseAction {
  type: "link";
  linkType: "internal" | "external";
  pageId?: string;      // internal link
  href?: string;        // external link
  target?: "_self" | "_blank";
}

export interface ModalAction extends BaseAction {
  type: "modal";
  modalId: string;
}

export interface ApiAction extends BaseAction {
  type: "api";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  successAction?: Action;  // 성공 시 후속 액션
  errorAction?: Action;    // 실패 시 후속 액션
}

export interface CustomAction extends BaseAction {
  type: "custom";
  script: string;  // JavaScript 코드
}

export type Action =
  | { type: "none" }
  | LinkAction
  | ModalAction
  | ApiAction
  | CustomAction;
```

## 구현 단계

### Phase 1: Button Link Action (현재 작업)
**목표**: Button 클릭으로 페이지 이동

**작업 내용**:
1. ✅ Action 타입 정의 (`types/action.ts`)
2. ✅ Button props에 `action?: Action` 추가
3. ✅ PropertiesPanel에 Action 편집 UI 추가
   - Action Type 선택 (none, link, modal, api, custom)
   - Link 타입일 때: Link 컴포넌트와 동일한 UI
4. ✅ Button 컴포넌트에서 action 처리
   - type: "link" → 페이지 이동
5. ✅ PageRenderer에서 Button action 실행

**예상 작업 시간**: 1-2시간

### Phase 2: Modal System
**목표**: 모달 컴포넌트 및 관리 시스템 구축

**작업 내용**:
1. Modal 컴포넌트 추가 (`builder-components/Modal`)
2. 모달 스토어 추가 (`store/modalSlice.ts`)
   - `openModal(modalId)`
   - `closeModal(modalId)`
   - `activeModals: string[]`
3. PropertiesPanel에서 Modal 선택 UI
4. Button action: type "modal" 처리
5. ModalRenderer 구현 (전역 모달 렌더링)

**예상 작업 시간**: 2-3시간

### Phase 3: API Action
**목표**: Button 클릭으로 API 요청

**작업 내용**:
1. API 액션 실행 함수 (`lib/actions/executeApiAction.ts`)
2. PropertiesPanel에서 API 설정 UI
   - Endpoint, Method, Headers, Body 입력
   - Success/Error 후속 액션
3. Loading 상태 관리
4. Error 핸들링 UI

**예상 작업 시간**: 2-3시간

### Phase 4: Custom Script
**목표**: 사용자 정의 JavaScript 실행

**작업 내용**:
1. 안전한 스크립트 실행 환경 (sandboxing)
2. PropertiesPanel에서 코드 에디터
3. 미리보기 모드에서만 실행 (에디터에선 비활성)
4. 에러 핸들링 및 로깅

**보안 고려사항**:
- XSS 방지
- 무한 루프 방지
- 권한 제한

**예상 작업 시간**: 3-4시간

## Phase 1 상세 구현 계획

### 1. 타입 정의
```typescript
// src/types/action.ts
export type ActionType = "none" | "link" | "modal" | "api" | "custom";

export interface LinkAction {
  type: "link";
  linkType: "internal" | "external";
  pageId?: string;
  href?: string;
  target?: "_self" | "_blank";
}

export type Action =
  | { type: "none" }
  | LinkAction;
  // 나중에 추가: ModalAction, ApiAction, CustomAction
```

### 2. Button Props 확장
```typescript
// src/features/builder-components/Button/Button.tsx
export interface ButtonProps {
  text: string;
  variant: "primary" | "secondary" | "outline";
  action?: Action;  // 추가
}
```

### 3. PropertiesPanel Action UI
```tsx
// Button 선택 시 표시
{node.type === "button" && (
  <>
    {/* 기존 text, variant */}

    {/* Action Section */}
    <div className="rounded-lg border p-3">
      <Label>버튼 동작</Label>

      {/* Action Type 선택 */}
      <Select value={actionType} onChange={handleActionTypeChange}>
        <option value="none">동작 없음</option>
        <option value="link">페이지 이동</option>
        <option value="modal">모달 열기 (준비중)</option>
        <option value="api">API 요청 (준비중)</option>
        <option value="custom">커스텀 스크립트 (준비중)</option>
      </Select>

      {/* Link 타입일 때 */}
      {actionType === "link" && (
        <>
          {/* Link 컴포넌트와 동일한 UI */}
          <RadioGroup>
            <Radio value="internal">내부 페이지</Radio>
            <Radio value="external">외부 URL</Radio>
          </RadioGroup>

          {linkType === "internal" && (
            <Select>
              {pages.map(page => (
                <option value={page.id}>{page.name}</option>
              ))}
            </Select>
          )}

          {linkType === "external" && (
            <Input type="url" placeholder="https://..." />
          )}

          <Select>
            <option value="_self">같은 탭</option>
            <option value="_blank">새 탭</option>
          </Select>
        </>
      )}
    </div>
  </>
)}
```

### 4. Button 컴포넌트 액션 처리
```tsx
// src/features/builder-components/Button/Button.tsx
export function Button({ text, variant, action }: ButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!action || action.type === "none") return;

    if (action.type === "link") {
      if (action.linkType === "internal" && action.pageId) {
        // 내부 페이지 이동
        router.push(`/preview/${action.pageId}`);
      } else if (action.linkType === "external" && action.href) {
        // 외부 URL 이동
        if (action.target === "_blank") {
          window.open(action.href, "_blank");
        } else {
          window.location.href = action.href;
        }
      }
    }

    // 나중에 추가: modal, api, custom
  };

  return (
    <button onClick={handleClick} className={getVariantClasses(variant)}>
      {text}
    </button>
  );
}
```

## 보안 고려사항

### XSS 방지
- Custom script는 sandboxed iframe에서 실행
- innerHTML 사용 금지
- 사용자 입력 sanitization

### API 액션 보안
- CORS 설정 필요
- API key는 환경 변수로 관리
- Rate limiting 고려

## 향후 확장 가능성

### 추가 액션 타입
- **Form Submit**: 폼 제출
- **Download**: 파일 다운로드
- **Print**: 페이지 인쇄
- **Share**: 소셜 공유
- **Copy to Clipboard**: 클립보드 복사

### 액션 체이닝
- 여러 액션을 순차적으로 실행
- 조건부 액션 실행
- 액션 실행 지연

### 액션 애널리틱스
- 버튼 클릭 추적
- 전환율 측정
- A/B 테스트

## 참고 사항

- Link 컴포넌트는 단순히 페이지 이동만 담당
- Button 컴포넌트는 다양한 액션 지원
- 둘 다 존재 이유가 명확하므로 병행 사용

## 작업 우선순위

1. **High Priority**: Phase 1 (Button Link Action) - 즉시 필요
2. **Medium Priority**: Phase 2 (Modal System) - 자주 사용됨
3. **Low Priority**: Phase 3 (API Action) - 고급 기능
4. **Future**: Phase 4 (Custom Script) - 보안 이슈 있음

---

**최종 업데이트**: 2025-11-12
**담당자**: Claude + User
**상태**: Phase 1 준비 중