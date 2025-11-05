# Web Builder Architecture

범용 드래그 앤 드롭 웹사이트 빌더 아키텍처 설계 문서

## 프로젝트 개요

**목표**: 비개발자가 드래그 앤 드롭으로 반응형 웹사이트를 제작하고 발행할 수 있는 범용 웹 빌더

**핵심 기능**:
- 드래그 앤 드롭 방식의 직관적인 페이지 편집
- 재사용 가능한 컴포넌트 라이브러리
- 반응형 디자인 지원 (모바일/태블릿/데스크톱)
- 실시간 프리뷰
- 정적 페이지 생성 및 호스팅

## 시스템 아키텍처

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Builder App                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Editor    │  │  Component   │  │   Canvas     │  │
│  │   Sidebar   │  │  Library     │  │   Preview    │  │
│  │             │  │              │  │              │  │
│  │ - Layers    │  │ - Buttons    │  │ - Drag Drop  │  │
│  │ - Settings  │  │ - Text       │  │ - Resize     │  │
│  │ - Assets    │  │ - Images     │  │ - Select     │  │
│  └─────────────┘  │ - Containers │  │ - Highlight  │  │
│                   │ - Forms      │  └──────────────┘  │
│                   └──────────────┘                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │            State Management                      │  │
│  │  - Page Structure (JSON Tree)                    │  │
│  │  - Selected Element                              │  │
│  │  - Undo/Redo History                            │  │
│  │  - Responsive Breakpoint                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │            Export & Publish                      │  │
│  │  - Static HTML/CSS/JS Generation                │  │
│  │  - Asset Optimization                            │  │
│  │  - Deployment (Vercel/Netlify)                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 핵심 모듈

### 1. Data Model (페이지 구조)

페이지는 컴포넌트 트리로 표현됩니다:

```typescript
interface PageNode {
  id: string
  type: ComponentType // 'container' | 'text' | 'button' | 'image' | ...
  props: Record<string, any>
  styles: ResponsiveStyles
  children?: PageNode[]
}

interface ResponsiveStyles {
  mobile?: CSSProperties
  tablet?: CSSProperties
  desktop?: CSSProperties
}

interface Page {
  id: string
  name: string
  slug: string
  root: PageNode
  metadata: {
    title: string
    description: string
    ogImage?: string
  }
}
```

### 2. Editor Core (편집 엔진)

**기술 선택**: `@dnd-kit/core` + `@dnd-kit/sortable`
- 접근성 우수 (키보드 네비게이션)
- 성능 최적화
- 터치 디바이스 지원

**주요 기능**:
- 컴포넌트 드래그 앤 드롭
- 컴포넌트 선택 및 하이라이트
- 중첩 컨테이너 지원
- 실시간 위치 프리뷰
- 리사이징 (선택적)

```typescript
// 예시 구조
src/
  features/
    editor/
      hooks/
        useDragAndDrop.ts
        useSelection.ts
        useHistory.ts (undo/redo)
      components/
        Canvas.tsx
        DropZone.tsx
        ComponentOverlay.tsx
      store/
        editorStore.ts
```

### 3. Component System (컴포넌트 라이브러리)

**레이어 구조**:
1. **Primitive Components**: 기본 HTML 요소 래퍼
   - Text, Heading, Paragraph
   - Button, Link
   - Image, Video
   - Container (div with flex/grid)

2. **Layout Components**: 레이아웃 패턴
   - Section (full-width container)
   - Grid, Flex Container
   - Column, Row
   - Card, Panel

3. **Composite Components**: 조합 컴포넌트
   - Hero Section
   - Feature Grid
   - Testimonial Card
   - Navigation Bar
   - Footer

**컴포넌트 등록 시스템**:
```typescript
interface ComponentDefinition {
  type: string
  label: string
  icon: React.ComponentType
  category: 'layout' | 'content' | 'media' | 'form'
  defaultProps: Record<string, any>
  defaultStyles: ResponsiveStyles
  editableProps: PropDefinition[]
  render: (props: any, children?: React.ReactNode) => React.ReactNode
}

// 컴포넌트 레지스트리
const componentRegistry = new Map<string, ComponentDefinition>()
```

### 4. Canvas & Renderer

**Canvas 격리 전략**: Shadow DOM 사용
- 에디터 스타일과 완전 격리
- 사용자 스타일 충돌 방지
- 실제 렌더링 환경과 동일

**렌더링 모드**:
- **Edit Mode**: 드래그, 선택, 하이라이트 활성화
- **Preview Mode**: 순수한 사용자 뷰
- **Export Mode**: 최적화된 정적 HTML 생성

```typescript
// 렌더러 구조
function PageRenderer({
  node,
  mode = 'edit',
  breakpoint = 'desktop'
}: RendererProps) {
  const Component = componentRegistry.get(node.type)
  const styles = node.styles[breakpoint]

  return (
    <Component.render {...node.props} style={styles}>
      {node.children?.map(child => (
        <PageRenderer key={child.id} node={child} mode={mode} />
      ))}
    </Component.render>
  )
}
```

### 5. Responsive System

**Breakpoint 전략**:
```typescript
const breakpoints = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024 }
}
```

**반응형 편집 UI**:
- 상단 툴바에 디바이스 선택기 (📱 모바일, 📱 태블릿, 🖥️ 데스크톱)
- 각 breakpoint별로 독립적인 스타일 편집
- 자동 상속: desktop → tablet → mobile

### 6. State Management

**기술 선택**: Zustand (간단하고 TypeScript 친화적)

```typescript
interface EditorState {
  // 페이지 데이터
  pages: Page[]
  currentPageId: string

  // 편집 상태
  selectedNodeId: string | null
  hoveredNodeId: string | null
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop'

  // 히스토리
  history: Page[]
  historyIndex: number

  // 액션
  addNode: (parentId: string, node: PageNode) => void
  updateNode: (nodeId: string, updates: Partial<PageNode>) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string) => void
  undo: () => void
  redo: () => void
}
```

### 7. Export & Publish System

**정적 사이트 생성**:
1. 페이지 JSON → React 컴포넌트 변환
2. Next.js Static Export 활용
3. 최적화:
   - CSS 인라인화 (critical CSS)
   - 이미지 최적화 (next/image)
   - JS 번들 최소화

**배포 옵션**:
- **Option A**: Vercel API로 자동 배포
- **Option B**: GitHub Pages 정적 호스팅
- **Option C**: 다운로드 (ZIP 파일)

```typescript
// Export 로직
function exportPage(page: Page): string {
  // 1. JSON을 HTML/CSS로 변환
  const html = generateHTML(page.root)
  const css = generateCSS(page.root)

  // 2. 최적화
  const optimizedHTML = minifyHTML(html)
  const optimizedCSS = minifyCSS(css)

  // 3. 템플릿에 주입
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.metadata.title}</title>
        <style>${optimizedCSS}</style>
      </head>
      <body>
        ${optimizedHTML}
      </body>
    </html>
  `
}
```

## 기술 스택

### Core
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4

### Editor
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **State Management**: Zustand
- **Icons**: Lucide React
- **UI Components**: Radix UI (headless components)

### Publishing
- **Static Export**: Next.js static export
- **Deployment**: Vercel API or GitHub Pages
- **Image Optimization**: Sharp (server-side)

### Optional Enhancements
- **Rich Text**: TipTap or Slate (나중에 추가)
- **Asset Storage**: Vercel Blob or Cloudinary
- **Collaboration**: Yjs (실시간 협업, 나중에 추가)

## 디렉토리 구조

```
src/
  app/
    (builder)/              # 빌더 앱 라우트
      layout.tsx
      page.tsx              # 에디터 메인 화면
      [pageId]/
        page.tsx            # 특정 페이지 편집
    (preview)/              # 프리뷰 모드
      preview/[pageId]/
        page.tsx
    api/
      export/               # Export API
      publish/              # 배포 API

  components/
    ui/                     # Radix UI 기반 공통 컴포넌트
      button.tsx
      input.tsx
      select.tsx
      dialog.tsx

  features/
    editor/
      components/
        Canvas.tsx          # 메인 캔버스
        Sidebar.tsx         # 좌측 사이드바
        Toolbar.tsx         # 상단 툴바
        PropertiesPanel.tsx # 우측 속성 패널
        LayersPanel.tsx     # 레이어 트리
      hooks/
        useDragAndDrop.ts
        useSelection.ts
        useHistory.ts
      store/
        editorStore.ts

    builder-components/     # 빌더에서 사용할 컴포넌트
      registry.ts           # 컴포넌트 레지스트리
      primitives/
        Text.tsx
        Button.tsx
        Image.tsx
        Container.tsx
      layouts/
        Section.tsx
        Grid.tsx
        Flex.tsx
      composite/
        Hero.tsx
        FeatureGrid.tsx

    renderer/
      PageRenderer.tsx      # 페이지 렌더러
      ComponentRenderer.tsx # 개별 컴포넌트 렌더러

    export/
      generators/
        htmlGenerator.ts
        cssGenerator.ts
      optimizers/
        imageOptimizer.ts
        codeMinifier.ts
      publishers/
        vercelPublisher.ts
        githubPublisher.ts

  lib/
    schemas/
      page.ts               # Zod 스키마
      component.ts
    utils/
      id.ts                 # ID 생성
      styles.ts             # 스타일 유틸

  types/
    editor.ts
    component.ts
    page.ts
```

## MVP 구현 로드맵

### Phase 1: 기초 인프라 (1-2주)
- [ ] 프로젝트 구조 설정
- [ ] 기본 라우팅 (에디터, 프리뷰)
- [ ] State management 설정 (Zustand)
- [ ] 컴포넌트 레지스트리 시스템

### Phase 2: Editor Core (2-3주)
- [ ] 드래그 앤 드롭 구현 (@dnd-kit)
- [ ] Canvas 및 렌더러
- [ ] 컴포넌트 선택 시스템
- [ ] Undo/Redo 기능
- [ ] 기본 UI (사이드바, 툴바, 속성 패널)

### Phase 3: Component Library (1-2주)
- [ ] Primitive 컴포넌트 (Text, Button, Image, Container)
- [ ] Layout 컴포넌트 (Section, Grid, Flex)
- [ ] 컴포넌트 속성 편집 UI
- [ ] 스타일 편집 패널

### Phase 4: Responsive System (1주)
- [ ] Breakpoint 전환 UI
- [ ] 반응형 스타일 관리
- [ ] 디바이스 프리뷰

### Phase 5: Export & Publish (1-2주)
- [ ] HTML/CSS 생성기
- [ ] 코드 최적화
- [ ] Vercel 배포 통합
- [ ] 프리뷰 URL 생성

### Phase 6: Polish & UX (1주)
- [ ] 키보드 단축키
- [ ] 컨텍스트 메뉴
- [ ] 툴팁 및 가이드
- [ ] 에러 핸들링

**총 예상 기간**: 7-11주 (1.5-3개월)

## 성능 최적화 전략

1. **Virtual Scrolling**: 레이어 패널에서 많은 요소 처리
2. **Lazy Loading**: 컴포넌트 라이브러리 동적 로드
3. **Debouncing**: 스타일 변경 시 렌더링 최적화
4. **Memoization**: 불필요한 리렌더링 방지 (React Compiler 활용)
5. **Web Worker**: Export 작업을 백그라운드에서 처리

## 보안 고려사항

1. **XSS 방지**: 사용자 입력 sanitization
2. **CORS**: 이미지 업로드 및 외부 리소스 처리
3. **Rate Limiting**: Export/Publish API 제한
4. **권한 관리**: 페이지 소유권 및 공유 설정

## 확장 가능성

### 단기 확장 (MVP 이후)
- 더 많은 컴포넌트 추가
- 애니메이션 지원
- 커스텀 코드 삽입
- 페이지 복제 및 템플릿
- Asset 관리자 (이미지 라이브러리)

### 중기 확장
- 폼 빌더 및 제출 처리
- SEO 최적화 도구
- 다국어 지원
- A/B 테스트

### 장기 확장
- 실시간 협업 (Yjs)
- 버전 관리
- 커스텀 도메인
- 분석 대시보드
- CMS 통합

## 참고 레퍼런스

**유사 프로젝트**:
- [GrapesJS](https://grapesjs.com/) - 오픈소스 웹 빌더
- [Craft.js](https://craft.js.org/) - React 페이지 빌더 프레임워크
- [Builder.io](https://www.builder.io/) - 헤드리스 CMS + 비주얼 에디터

**핵심 라이브러리 문서**:
- [@dnd-kit](https://docs.dndkit.com/)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Radix UI](https://www.radix-ui.com/)