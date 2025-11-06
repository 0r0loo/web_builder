# 프로젝트 관리 시스템 설계

## 개요
사용자가 여러 웹사이트 프로젝트를 만들고 관리할 수 있는 시스템

---

## 1. 데이터 구조

### 1.1 Project (프로젝트/사이트)
```typescript
interface Project {
  id: string;                    // 프로젝트 고유 ID
  name: string;                  // 프로젝트 이름 (예: "내 포트폴리오", "회사 홈페이지")
  description?: string;          // 설명
  thumbnail?: string;            // 썸네일 이미지 URL
  pages: Page[];                 // 페이지 목록
  settings: ProjectSettings;     // 프로젝트 설정
  createdAt: number;
  updatedAt: number;
}

interface ProjectSettings {
  defaultPage: string;           // 홈페이지로 사용할 페이지 ID
  domain?: string;               // 커스텀 도메인
  favicon?: string;              // 파비콘
  theme?: {
    primaryColor: string;
    fontFamily: string;
  };
}
```

### 1.2 Page (페이지)
```typescript
interface Page {
  id: string;
  name: string;                  // 페이지 이름 (예: "홈", "소개", "연락처")
  slug: string;                  // URL 경로 (예: "/", "/about", "/contact")
  root: ComponentNode;           // 컴포넌트 트리
  metadata: PageMetadata;
  connections: PageConnection[]; // 🆕 다른 페이지와의 연결
  createdAt: number;
  updatedAt: number;
}

interface PageConnection {
  fromComponentId: string;       // 링크를 가진 컴포넌트 ID
  toPageId: string;              // 연결된 페이지 ID
  type: "navigation" | "modal" | "redirect";
}
```

---

## 2. UI 구조

### 2.1 프로젝트 대시보드 (새 라우트)
```
/dashboard
┌─────────────────────────────────────┐
│ 내 프로젝트                          │
│                                     │
│ ┌──────────┐  ┌──────────┐         │
│ │ 포트폴리오│  │ 쇼핑몰    │  [+]    │
│ │ 5 pages  │  │ 8 pages  │         │
│ │ 2일 전   │  │ 1주일 전  │         │
│ └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
```

### 2.2 프로젝트 내 페이지 관리
```
/editor/[projectId]
┌─────────────────────────────────────┐
│ [← 대시보드]  포트폴리오              │
├─────────────────────────────────────┤
│ Pages:                              │
│ ┌───────────────────────────────┐   │
│ │ 🏠 Home    (/        ) [편집] │   │
│ │ 📄 About   (/about   ) [편집] │   │
│ │ 📧 Contact (/contact ) [편집] │   │
│ │ [+ 새 페이지]                 │   │
│ └───────────────────────────────┘   │
│                                     │
│ [페이지 구조 보기] [설정] [배포]     │
└─────────────────────────────────────┘
```

### 2.3 페이지 구조 시각화 (플로우차트)
```
페이지 맵:
┌──────────────────────────────────────┐
│                                      │
│         ┌─────────┐                  │
│         │  Home   │                  │
│         └────┬────┘                  │
│              │                       │
│      ┌───────┼───────┐              │
│      │       │       │              │
│  ┌───▼──┐ ┌─▼────┐ ┌▼─────┐        │
│  │About │ │Blog  │ │Contact│        │
│  └──────┘ └──┬───┘ └───────┘        │
│              │                       │
│          ┌───▼────┐                  │
│          │ Post 1 │                  │
│          └────────┘                  │
│                                      │
│ 범례: ─► = 링크 연결                 │
└──────────────────────────────────────┘
```

---

## 3. 라우팅 구조

### 3.1 새로운 라우트
```
/                          → 랜딩 페이지
/dashboard                 → 프로젝트 목록
/editor/[projectId]        → 프로젝트 에디터 (페이지 관리)
/editor/[projectId]/page/[pageId] → 개별 페이지 편집
/preview/[projectId]       → 전체 프로젝트 미리보기
```

### 3.2 현재 구조와의 차이
```
현재:  /editor → 단일 페이지 편집
변경후: /editor/[projectId]/page/[pageId] → 프로젝트 > 페이지
```

---

## 4. 데이터 저장 구조

### 4.1 현재 (LocalStorage)
```typescript
localStorage.setItem('web-builder-editor', JSON.stringify({
  pages: [...],
  currentPageId: "...",
  // ...
}));
```

### 4.2 변경 후 (PostgreSQL + Drizzle ORM)
```typescript
// Railway PostgreSQL 데이터베이스
// Drizzle ORM으로 타입 안전한 쿼리

// 프로젝트 테이블
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  thumbnail: text('thumbnail'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 페이지 테이블
export const pages = pgTable('pages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  root: jsonb('root').notNull(), // ComponentNode 트리
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### 4.3 LocalStorage → DB 마이그레이션
- 첫 로그인 시 기존 localStorage 데이터를 DB로 자동 마이그레이션
- 마이그레이션 완료 후 localStorage는 캐시로만 사용

---

## 5. 구현 단계

### Phase 0: 데이터 마이그레이션 (1시간)
- [ ] Project 타입 정의
- [ ] 기존 단일 프로젝트를 새 구조로 마이그레이션
- [ ] LocalStorage 키 구조 변경

### Phase 1: 프로젝트 대시보드 (3-4시간)
- [ ] `/dashboard` 라우트 생성
- [ ] 프로젝트 카드 UI
- [ ] 프로젝트 생성/삭제/이름변경
- [ ] 썸네일 자동 생성 (첫 페이지 스크린샷)

### Phase 2: 페이지 관리 UI (2-3시간)
- [ ] 페이지 목록 보기
- [ ] 페이지 추가/삭제/순서변경
- [ ] Slug 설정 UI
- [ ] 홈페이지 설정

### Phase 3: 페이지 연결 분석 (2시간)
- [ ] 페이지 간 링크 자동 감지
- [ ] PageConnection 생성
- [ ] 연결 관계 데이터 구조 저장

### Phase 4: 페이지 맵 시각화 (4-5시간)
- [ ] React Flow 또는 D3.js 사용
- [ ] 페이지를 노드로 표시
- [ ] 링크를 엣지로 표시
- [ ] 클릭 시 해당 페이지로 이동
- [ ] 줌/팬 기능

### Phase 5: 프로젝트 설정 (2시간)
- [ ] 프로젝트 설정 다이얼로그
- [ ] 기본 색상/폰트 설정
- [ ] 파비콘 업로드
- [ ] 도메인 설정

**총 예상 시간: 14-17시간 (약 2-3일)**

---

## 6. 페이지 맵 구현 예시

### 6.1 React Flow 사용
```typescript
import ReactFlow, { Node, Edge } from 'reactflow';

function PageMapView({ project }: { project: Project }) {
  // 페이지 → 노드 변환
  const nodes: Node[] = project.pages.map(page => ({
    id: page.id,
    type: 'custom',
    position: { x: 0, y: 0 }, // 자동 레이아웃
    data: {
      label: page.name,
      slug: page.slug,
      thumbnail: generateThumbnail(page),
    },
  }));

  // 링크 → 엣지 변환
  const edges: Edge[] = project.pages.flatMap(page =>
    page.connections.map(conn => ({
      id: `${page.id}-${conn.toPageId}`,
      source: page.id,
      target: conn.toPageId,
      type: conn.type,
    }))
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
    />
  );
}
```

---

## 7. 우선순위

### MVP에 필수적인 것 (Must Have)
1. ✅ 프로젝트 생성/목록
2. ✅ 프로젝트별 페이지 관리
3. ✅ 페이지 간 링크 (Link 컴포넌트)

### 있으면 좋은 것 (Nice to Have)
4. ⭐ 페이지 맵 시각화
5. ⭐ 프로젝트 썸네일
6. ⭐ 페이지 복제

### 나중에 추가할 것 (Future)
7. 🔮 프로젝트 템플릿
8. 🔮 프로젝트 공유
9. 🔮 버전 관리

---

## 8. 다음 액션

지금 바로 구현할 수 있는 옵션:

**옵션 A: 빠른 프로토타입 (2-3시간)**
- 프로젝트 타입 정의
- 간단한 프로젝트 선택 UI
- 페이지 탭으로 전환 가능

**옵션 B: 완전한 구현 (2-3일)**
- 대시보드 + 페이지 관리 + 페이지 맵

**추천: 옵션 A를 먼저 하고, 나중에 확장**