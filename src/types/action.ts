/**
 * Action System Types
 * 컴포넌트(주로 Button)에 연결할 수 있는 다양한 액션 타입
 */

export type ActionType = "none" | "link" | "modal" | "api" | "custom";

/**
 * 기본 액션 인터페이스
 */
export interface BaseAction {
  type: ActionType;
}

/**
 * 링크 액션 (페이지 이동)
 * Phase 1에서 구현
 */
export interface LinkAction extends BaseAction {
  type: "link";
  linkType: "internal" | "external";
  pageId?: string; // internal link
  href?: string; // external link
  target?: "_self" | "_blank";
}

/**
 * 모달 액션 (모달 열기)
 * Phase 2에서 구현 예정
 */
export interface ModalAction extends BaseAction {
  type: "modal";
  modalId: string;
}

/**
 * API 액션 (HTTP 요청)
 * Phase 3에서 구현 예정
 */
export interface ApiAction extends BaseAction {
  type: "api";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  successAction?: Action; // 성공 시 후속 액션
  errorAction?: Action; // 실패 시 후속 액션
}

/**
 * 커스텀 스크립트 액션
 * Phase 4에서 구현 예정
 */
export interface CustomAction extends BaseAction {
  type: "custom";
  script: string; // JavaScript 코드
}

/**
 * Action Union Type
 * Phase 1: none, link만 구현
 * Phase 2+: modal, api, custom 추가
 */
export type Action =
  | { type: "none" }
  | LinkAction
  | ModalAction
  | ApiAction
  | CustomAction;
