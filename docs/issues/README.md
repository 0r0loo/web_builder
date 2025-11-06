# Issues Documentation

프로젝트 개발 중 발생한 주요 이슈들의 기록과 해결 방법을 문서화합니다.

## 목적

이 문서들은 다음을 위해 작성되었습니다:
- 🔍 **문제 해결 과정 기록**: 비슷한 문제 발생 시 빠른 참고
- 📚 **학습 자료**: 각 이슈에서 얻은 교훈과 베스트 프랙티스
- 🤖 **AI Assistant 컨텍스트**: Claude가 향후 작업 시 참고할 수 있는 히스토리
- 👥 **팀 공유**: 다른 개발자들이 같은 실수를 반복하지 않도록

## 이슈 목록

### 🔴 High Priority

| ID | 제목 | 상태 | Phase | 날짜 |
|----|------|------|-------|------|
| [#001](./issue-001-drag-drop-no-rerender.md) | 드래그앤드롭 후 즉시 리렌더링 안 되는 문제 | ✅ 해결됨 | Phase 4 | 2025-11-06 |
| [#002](./issue-002-input-reactivity.md) | PropertiesPanel 입력 필드 반응성 문제 | ✅ 해결됨 | Phase 5 | 2025-11-06 |

## 이슈 카테고리

### 🎨 UI/UX
- None yet

### ⚡ 상태 관리 (State Management)
- [#001 - 드래그앤드롭 리렌더링](./issue-001-drag-drop-no-rerender.md) - Zustand + Immer
- [#002 - Input 반응성](./issue-002-input-reactivity.md) - Zustand Reactivity

### 🔧 빌드/설정 (Build/Configuration)
- None yet

### 🐛 버그 (Bugs)
- [#001 - 드래그앤드롭 리렌더링](./issue-001-drag-drop-no-rerender.md)
- [#002 - Input 반응성](./issue-002-input-reactivity.md)

### 📦 의존성 (Dependencies)
- [#001 - Immer 통합](./issue-001-drag-drop-no-rerender.md)

## 주요 교훈

### Zustand 상태 관리
1. **Shallow Copy의 한계**: 중첩된 객체/배열은 참조가 변경되지 않아 리렌더링 실패
2. **Immer 미들웨어**: 복잡한 불변성 관리를 단순화하고 직접 수정 가능
3. **Selector vs Getter**: 반응성을 위해 함수 호출이 아닌 selector 직접 사용 필요

### React 패턴
1. **Controlled Input**: State 업데이트 + 컴포넌트 리렌더링이 모두 필요
2. **참조 동일성**: React/Zustand는 얕은 비교로 변경 감지
3. **Deep Merge**: Nested 객체 업데이트 시 모든 레벨에서 새 참조 생성 필요

### 디버깅 전략
1. **계층적 접근**: 증상 → 상태 → 렌더링 → 데이터 흐름 순으로 추적
2. **Console.log**: 상태 변경과 UI 업데이트의 괴리 확인
3. **React DevTools**: 컴포넌트 리렌더링 추적
4. **타입스크립트**: 컴파일 타임에 많은 오류 사전 방지

## 문서 작성 가이드

새로운 이슈를 문서화할 때는 다음 템플릿을 사용하세요:

```markdown
# Issue #XXX: [문제 제목]

## 메타데이터
- **발생 날짜**: YYYY-MM-DD
- **심각도**: 🔴 High / 🟡 Medium / 🟢 Low
- **상태**: ✅ 해결됨 / 🔄 진행중 / ⏸️ 보류
- **관련 Phase**: Phase X

## 증상
[사용자가 경험한 문제를 구체적으로 설명]

## 근본 원인
[문제의 기술적 원인을 코드와 함께 설명]

## 해결 방법
[적용한 해결책과 코드 변경사항]

## 관련 커밋
- [커밋 메시지] (해시)

## 교훈
[이 이슈에서 배운 점과 향후 적용할 사항]

## 관련 파일
- 수정된 파일 목록

## 참고 자료
- 관련 문서 링크
```

## 통계

- **총 이슈 수**: 2
- **해결됨**: 2 (100%)
- **진행중**: 0
- **보류**: 0

## 버전 히스토리

- **2025-11-06**: 이슈 문서화 시스템 구축
  - Issue #001: 드래그앤드롭 리렌더링 문제
  - Issue #002: Input 반응성 문제

---

> 💡 **Tip**: 각 이슈 문서는 독립적으로 읽을 수 있도록 작성되었습니다. 비슷한 문제가 발생하면 해당 문서를 먼저 참고하세요!