import { nanoid } from "nanoid";

/**
 * 컴포넌트용 고유 ID를 생성합니다
 * nanoid 10자 사용 (충돌 확률: 시간당 1000개 생성 시 약 400년)
 */
export function generateId(): string {
  return nanoid(10);
}

/**
 * 접두사가 포함된 고유 ID를 생성합니다
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}-${nanoid(8)}`;
}
