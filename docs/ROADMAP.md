# Web Builder MVP Roadmap

범용 웹 빌더 MVP 개발 로드맵 및 구현 우선순위

## 개발 원칙

1. **점진적 개발**: 작동하는 최소 기능부터 시작, 단계적 확장
2. **사용자 중심**: 각 단계마다 실제 사용 가능한 기능 완성
3. **기술 부채 최소화**: 확장 가능한 구조로 초기 설계
4. **빠른 피드백**: 주 단위로 데모 가능한 결과물

## Phase 0: 프로젝트 초기화 (1-2일) ✅

- [x] ARCHITECTURE.md 작성
- [x] 기술 스택 선정
- [x] 핵심 라이브러리 설치
- [x] ROADMAP.md 작성
- [x] 프로젝트 디렉토리 구조 생성
- [x] 기본 타입 정의

## Phase 1: 기초 인프라 (3-5일) ✅

### 목표
기본적인 프로젝트 구조와 핵심 타입 시스템을 구축합니다.

### 작업 항목

#### 1.1 타입 시스템 구축
- [x] `types/component.ts` - 컴포넌트 정의 타입
- [x] `types/page.ts` - 페이지 구조 타입
- [x] `types/editor.ts` - 에디터 상태 타입
- [x] `types/styles.ts` - 스타일 시스템 타입

```typescript
// 예시: types/component.ts
export type ComponentType =
  | 'container'
  | 'text'
  | 'heading'
  | 'button'
  | 'image'

export interface ComponentNode {
  id: string
  type: ComponentType
  props: Record<string, any>
  styles: ResponsiveStyles
  children?: ComponentNode[]
}
```

#### 1.2 유틸리티 함수
- [x] `lib/utils/id.ts` - ID 생성 (nanoid)
- [x] `lib/utils/cn.ts` - 클래스명 병합 (clsx + tailwind-merge)
- [x] `lib/utils/tree.ts` - 트리 순회 및 조작 유틸리티

#### 1.3 Zustand Store 초기 구조
- [x] `features/editor/store/editorStore.ts` - 기본 store 구조
- [x] 페이지 상태 관리 (CRUD)
- [x] 선택 상태 관리
- [x] 히스토리 관리 (undo/redo) 기본 구조

#### 1.4 라우팅 구조
- [x] `app/(builder)/page.tsx` - 에디터 메인 페이지
- [x] `app/(builder)/layout.tsx` - 에디터 레이아웃
- [x] 기본 UI 골격 (헤더, 사이드바, 캔버스 영역)

**결과물**: 빈 캔버스가 있는 에디터 화면

---

## Phase 2: 컴포넌트 레지스트리 시스템 (2-3일) ✅

### 목표
재사용 가능한 컴포넌트를 등록하고 관리하는 시스템을 구축합니다.

### 작업 항목

#### 2.1 레지스트리 코어
- [x] `features/builder-components/registry.ts` - 컴포넌트 레지스트리
- [x] 컴포넌트 등록/조회 API
- [x] 카테고리별 컴포넌트 분류

```typescript
// 예시
export const componentRegistry = {
  register: (definition: ComponentDefinition) => void
  get: (type: string) => ComponentDefinition
  getByCategory: (category: string) => ComponentDefinition[]
}
```

#### 2.2 기본 Primitive 컴포넌트 (3개)
- [x] `Text` - 단순 텍스트
- [x] `Button` - 버튼
- [x] `Container` - div 컨테이너 (flex/grid 지원)

각 컴포넌트에 필요한 것:
- 컴포넌트 정의 (defaultProps, editableProps)
- 렌더 함수
- 아이콘 (lucide-react)

#### 2.3 컴포넌트 라이브러리 UI
- [x] `features/editor/components/ComponentLibrary.tsx`
- [x] 카테고리별 컴포넌트 목록
- [x] 드래그 가능한 컴포넌트 아이템

**결과물**: 3개의 컴포넌트를 사이드바에서 볼 수 있음 (아직 드래그는 안 됨)

---

## Phase 3: 기본 렌더러 (2-3일) ✅

### 목표
JSON 데이터를 실제 React 컴포넌트로 렌더링합니다.

### 작업 항목

#### 3.1 렌더러 코어
- [x] `features/renderer/PageRenderer.tsx` - 재귀적 렌더러
- [x] `features/renderer/ComponentRenderer.tsx` - 개별 컴포넌트 렌더러
- [x] 스타일 적용 로직 (CSS-in-JS or inline styles)

```typescript
function PageRenderer({ node }: { node: ComponentNode}) {
  const Component = componentRegistry.get(node.type)

  return (
    <Component.render {...node.props} style={node.styles.desktop}>
      {node.children?.map(child => (
        <PageRenderer key={child.id} node={child} />
      ))}
    </Component.render>
  )
}
```

#### 3.2 캔버스 통합
- [x] `features/editor/components/Canvas.tsx`
- [x] 렌더러를 캔버스에 통합
- [x] 기본 샘플 페이지 데이터로 테스트

**결과물**: JSON 데이터로 페이지가 렌더링되는 것을 볼 수 있음

---

## Phase 4: 드래그 앤 드롭 (4-5일) ✅ 🎯 **핵심**

### 목표
컴포넌트를 드래그해서 캔버스에 배치할 수 있습니다.

### 작업 항목

#### 4.1 DnD Kit 기본 설정
- [x] `features/editor/hooks/useDragAndDrop.ts`
- [x] DndContext 설정
- [x] Sensors 설정 (마우스, 터치, 키보드)

#### 4.2 Draggable 컴포넌트
- [x] 컴포넌트 라이브러리의 아이템을 draggable로 만들기
- [x] 드래그 시 preview 표시

#### 4.3 Droppable 캔버스
- [x] 캔버스를 droppable 영역으로 만들기
- [x] 드롭 시 새 컴포넌트 추가 로직
- [x] store에 상태 저장
- [x] Immer 미들웨어 적용으로 리렌더링 문제 해결

#### 4.4 중첩 드롭 (Nested Drop)
- [x] Container 내부에 드롭 가능하게
- [x] 드롭 영역 하이라이트
- [x] 드롭 위치 indicator

**결과물**: 컴포넌트를 드래그해서 캔버스에 배치하고 계층 구조를 만들 수 있음

---

## Phase 5: 컴포넌트 선택 및 조작 (3-4일) ✅ **완료**

### 목표
캔버스의 컴포넌트를 선택하고 이동/삭제할 수 있습니다.

### 작업 항목

#### 5.1 선택 시스템
- [x] 컴포넌트 클릭 시 선택 (selectionSlice 활용)
- [x] 선택된 컴포넌트 하이라이트 (파란색 링)
- [x] 이벤트 버블링 방지
- [x] ESC로 선택 해제

#### 5.2 컴포넌트 이동
- [x] 선택된 컴포넌트를 드래그로 이동
- [x] 다른 컨테이너로 이동 가능
- [x] Sortable 지원 (형제 간 순서 변경)

#### 5.3 컴포넌트 삭제
- [x] Delete/Backspace 키로 삭제
- [x] 컨텍스트 메뉴에서 삭제
- [x] 삭제 확인 (자식이 있을 경우)

#### 5.4 레이어 패널
- [x] `features/editor/components/LayersPanel.tsx`
- [x] 트리 구조로 페이지 표시
- [x] 레이어 클릭 시 선택
- [x] 레이어 드래그로 순서 변경 (Sortable 통합으로 자동 지원)

**결과물**: 컴포넌트를 선택하고 이동하고 삭제할 수 있음

---

## Phase 6: 속성 편집 (3-4일) ✅ **완료**

### 목표
선택된 컴포넌트의 속성을 편집할 수 있습니다.

### 작업 항목

#### 6.1 속성 패널 UI
- [x] `features/editor/components/PropertiesPanel.tsx` 완전 구현 (720줄)
- [x] 선택된 컴포넌트의 Props 표시 및 편집
- [x] 타입별 입력 컨트롤 (textarea, text, select)
- [x] Zustand selector 방식으로 반응성 보장

#### 6.2 스타일 편집 (7개 카테고리 완전 구현)
- [x] Layout (display, flexDirection, justifyContent, alignItems, gap, grid)
- [x] Spacing (margin, marginTop/Right/Bottom/Left, padding, paddingTop/Right/Bottom/Left)
- [x] Typography (fontSize, fontWeight, lineHeight, textAlign, letterSpacing, color)
- [x] Colors (color, backgroundColor, opacity)
- [x] Border (border, borderWidth, borderStyle, borderColor, borderRadius)
- [x] Size (width, height, minWidth, minHeight, maxWidth, maxHeight)
- [x] Shadow (boxShadow, textShadow)
- [x] 브레이크포인트별 스타일 편집 지원
- [x] 실시간 업데이트

#### 6.3 컴포넌트별 속성
- [x] Text: content (textarea 편집)
- [x] Button: text, variant (primary/secondary/outline)
- [x] Container: layout (flex/grid는 스타일 편집에서 지원)
- [x] Image: src, alt, objectFit (Phase 13에서 조기 구현)

**결과물**: 컴포넌트의 모든 속성과 스타일을 자유롭게 편집할 수 있음

---

## Phase 7: Undo/Redo (1-2일)

### 목표
변경 사항을 취소하고 다시 실행할 수 있습니다.

### 작업 항목

#### 7.1 히스토리 관리
- [ ] `features/editor/hooks/useHistory.ts` 완성
- [ ] 상태 변경 시 히스토리에 스냅샷 저장
- [ ] 최대 히스토리 크기 제한 (예: 50개)

#### 7.2 Undo/Redo 액션
- [ ] Ctrl+Z / Cmd+Z로 Undo
- [ ] Ctrl+Shift+Z / Cmd+Shift+Z로 Redo
- [ ] 툴바에 Undo/Redo 버튼

**결과물**: 작업을 실수해도 되돌릴 수 있음

---

## Phase 8: 더 많은 컴포넌트 (2-3일)

### 목표
컴포넌트 라이브러리를 확장합니다.

### 작업 항목

#### 8.1 추가 Primitive 컴포넌트
- [ ] Heading (h1-h6)
- [ ] Paragraph
- [ ] Image (이미 완료)
- [ ] Link

#### 8.2 Layout 컴포넌트
- [ ] Section (full-width container)
- [ ] Grid (CSS Grid)
- [ ] Flex (flexbox)
- [ ] Spacer

**결과물**: 10개 정도의 컴포넌트로 기본적인 페이지를 만들 수 있음

---

## Phase 8.5: 인터랙션 시스템 (2-3일) 🆕

### 목표
컴포넌트에 클릭/호버 등의 인터랙션을 추가할 수 있습니다.

### 작업 항목

#### 8.5.1 모달/다이얼로그 시스템
- [ ] Modal 컴포넌트 추가
- [ ] Button에 `onClick` 액션 설정 (openModal, closeModal, navigate)
- [ ] 모달 트리거 및 타겟 연결
- [ ] 모달 오픈/클로즈 상태 관리
- [ ] 모달 내부에 컴포넌트 배치 가능

#### 8.5.2 페이지 간 네비게이션
- [ ] Link 컴포넌트 확장
  - 외부 URL (href)
  - 내부 페이지 참조 (pageId)
  - 모달 열기 (modalId)
- [ ] 페이지 관리 UI (헤더에 페이지 탭)
- [ ] 페이지 생성/삭제/전환
- [ ] Export 시 다중 HTML 파일 생성

#### 8.5.3 고급 인터랙션 (선택적)
- [ ] 탭 컴포넌트
- [ ] 아코디언 컴포넌트
- [ ] 캐러셀/슬라이더
- [ ] 드롭다운 메뉴

**결과물**: 버튼 클릭 시 모달이 열리거나 다른 페이지로 이동할 수 있음

---

## Phase 9: 반응형 시스템 (3-4일)

### 목표
모바일/태블릿/데스크톱 대응 페이지를 만들 수 있습니다.

### 작업 항목

#### 9.1 Breakpoint 전환 UI
- [ ] 툴바에 디바이스 선택기 (📱 모바일, 📱 태블릿, 🖥️ 데스크톱)
- [ ] 선택한 breakpoint에 따라 캔버스 크기 변경
- [ ] 현재 breakpoint 상태 저장

#### 9.2 반응형 스타일 관리
- [ ] breakpoint별 독립적인 스타일 저장
- [ ] 스타일 상속 로직 (desktop → tablet → mobile)
- [ ] 속성 패널에서 breakpoint별 편집

#### 9.3 반응형 렌더링
- [ ] 렌더러가 현재 breakpoint의 스타일 적용
- [ ] CSS media queries 생성 (export 시)

**결과물**: 디바이스별로 다른 스타일을 적용할 수 있음

---

## Phase 10: 프리뷰 모드 (1-2일)

### 목표
편집 UI 없이 순수한 페이지를 미리 볼 수 있습니다.

### 작업 항목

#### 10.1 프리뷰 라우트
- [ ] `app/(preview)/preview/[pageId]/page.tsx`
- [ ] 에디터 UI 없이 페이지만 렌더링
- [ ] 현재 페이지 데이터 로드 (localStorage or 서버)

#### 10.2 프리뷰 토글
- [ ] 툴바에 "프리뷰" 버튼
- [ ] 새 탭으로 프리뷰 열기
- [ ] 또는 에디터 내에서 모드 전환

**결과물**: 완성된 페이지를 미리 볼 수 있음

---

## Phase 11: Export 시스템 (4-5일)

### 목표
페이지를 HTML/CSS로 내보낼 수 있습니다.

### 작업 항목

#### 11.1 HTML/CSS 생성기
- [ ] `features/export/generators/htmlGenerator.ts`
- [ ] `features/export/generators/cssGenerator.ts`
- [ ] 컴포넌트 트리 → HTML 문자열
- [ ] 스타일 → CSS 문자열 (media queries 포함)

#### 11.2 코드 최적화
- [ ] `features/export/optimizers/codeMinifier.ts`
- [ ] HTML/CSS minification
- [ ] 사용하지 않는 스타일 제거

#### 11.3 Export UI
- [ ] Export 다이얼로그
- [ ] 다운로드 옵션 (HTML 파일, ZIP)
- [ ] 코드 프리뷰

**결과물**: 완성된 페이지를 HTML 파일로 다운로드할 수 있음

---

## Phase 12: 발행 시스템 (3-4일)

### 목표
페이지를 실제로 배포하고 URL로 접근할 수 있습니다.

### 작업 항목

#### 12.1 Vercel 배포 통합
- [ ] `features/export/publishers/vercelPublisher.ts`
- [ ] Vercel API 연동
- [ ] 프로젝트 생성 및 배포
- [ ] 배포 상태 추적

#### 12.2 발행 UI
- [ ] 발행 다이얼로그
- [ ] 프로젝트 이름 설정
- [ ] 배포 진행 상태 표시
- [ ] 배포 완료 후 URL 표시

#### 12.3 페이지 관리
- [ ] 발행된 페이지 목록
- [ ] 재배포
- [ ] URL 복사

**결과물**: 만든 페이지를 실제 URL로 공유할 수 있음

---

## Phase 13: UX 개선 및 마무리 (2-3일)

### 목표
사용성을 높이고 버그를 수정합니다.

### 작업 항목

#### 13.1 키보드 단축키
- [ ] Ctrl/Cmd + S: 저장
- [ ] Ctrl/Cmd + Z: Undo
- [ ] Ctrl/Cmd + Shift + Z: Redo
- [ ] Delete: 삭제
- [ ] Ctrl/Cmd + C/V: 복사/붙여넣기 (선택적)

#### 13.2 툴팁 및 가이드
- [ ] 주요 버튼에 툴팁 추가
- [ ] 빈 캔버스일 때 시작 가이드
- [ ] 컴포넌트 hover 시 설명 표시

#### 13.3 에러 핸들링
- [ ] 전역 에러 바운더리
- [ ] 사용자 친화적 에러 메시지
- [ ] Export/Publish 실패 시 재시도 옵션

#### 13.4 성능 최적화
- [ ] 불필요한 리렌더링 제거
- [ ] 큰 페이지에서 성능 테스트
- [ ] 로딩 상태 표시

**결과물**: 안정적이고 사용하기 편한 웹 빌더

---

## MVP 완성 체크리스트

### 필수 기능 (Must Have)
- [ ] 드래그 앤 드롭으로 컴포넌트 배치
- [ ] 최소 10개 이상의 컴포넌트
- [ ] 컴포넌트 속성 편집
- [ ] 반응형 디자인 (3개 breakpoints)
- [ ] Undo/Redo
- [ ] 프리뷰 모드
- [ ] HTML Export
- [ ] Vercel 배포

### 선택 기능 (Nice to Have)
- [ ] 컴포넌트 복사/붙여넣기
- [ ] 컴포넌트 그룹화
- [ ] 페이지 복제
- [ ] 템플릿 시스템
- [ ] 이미지 업로드
- [ ] 커스텀 CSS 입력

### 문서화
- [ ] README.md 업데이트
- [ ] 사용자 가이드 작성
- [ ] API 문서 (컴포넌트 개발자용)

---

## 예상 일정

**총 예상 기간**: 8-10주 (약 2-2.5개월)

| Phase | 기간 | 작업 내용 | 결과물 |
|-------|------|----------|--------|
| 0 | 1-2일 | 프로젝트 초기화 | 기본 구조 |
| 1 | 3-5일 | 기초 인프라 | 빈 에디터 화면 |
| 2 | 2-3일 | 컴포넌트 레지스트리 | 컴포넌트 목록 |
| 3 | 2-3일 | 렌더러 | JSON → UI 렌더링 |
| 4 | 4-5일 | 드래그 앤 드롭 | 🎯 **작동하는 에디터** |
| 5 | 3-4일 | 선택 및 조작 | 컴포넌트 조작 |
| 6 | 3-4일 | 속성 편집 | 스타일 커스터마이징 |
| 7 | 1-2일 | Undo/Redo | 실수 복구 |
| 8 | 2-3일 | 더 많은 컴포넌트 | 풍부한 라이브러리 |
| 9 | 3-4일 | 반응형 시스템 | 모바일 대응 |
| 10 | 1-2일 | 프리뷰 | 완성 페이지 미리보기 |
| 11 | 4-5일 | Export | HTML 다운로드 |
| 12 | 3-4일 | 발행 | 실제 배포 |
| 13 | 2-3일 | UX 개선 | 🎉 **MVP 완성** |

**마일스톤**:
- **Week 2**: Phase 4 완료 → 기본 드래그 앤 드롭 작동
- **Week 4**: Phase 8 완료 → 컴포넌트로 페이지 만들기 가능
- **Week 6**: Phase 11 완료 → HTML Export 작동
- **Week 8-10**: Phase 13 완료 → 🚀 MVP 출시

---

## 다음 단계 (Post-MVP)

MVP 완성 후 추가할 수 있는 기능:

### 단기 (1-2개월)
- 더 많은 컴포넌트 (30+개)
- 애니메이션 지원 (fade, slide, bounce)
- 커스텀 코드 삽입 (HTML, CSS, JS)
- 페이지 템플릿 시스템
- Asset 관리자 (이미지 라이브러리)
- 폼 빌더

### 중기 (3-6개월)
- 사용자 계정 시스템
- 프로젝트/워크스페이스
- 팀 협업 기능
- SEO 최적화 도구
- 다국어 지원
- A/B 테스트

### 장기 (6-12개월)
- 실시간 협업 (Yjs)
- 버전 관리
- 커스텀 도메인
- 분석 대시보드
- E-commerce 통합
- CMS 통합

---

## 참고 자료

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처 상세
- [@dnd-kit 문서](https://docs.dndkit.com/)
- [Zustand 문서](https://docs.pmnd.rs/zustand)
- [GrapesJS](https://grapesjs.com/) - 오픈소스 참고
- [Craft.js](https://craft.js.org/) - React 빌더 프레임워크

---

**시작 준비 완료!** 🚀

다음 단계: Phase 0의 남은 작업부터 시작합니다.
