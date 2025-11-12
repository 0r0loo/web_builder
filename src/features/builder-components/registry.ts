import type { ComponentType } from "@/types/component";
import type {
  ComponentCategory,
  ComponentMetadata,
  ComponentRegistry,
} from "./types";

/**
 * 전역 컴포넌트 레지스트리
 */
const registry: ComponentRegistry = new Map();

/**
 * 컴포넌트를 레지스트리에 등록
 */
export function registerComponent(metadata: ComponentMetadata): void {
  if (registry.has(metadata.type)) {
    console.warn(
      `컴포넌트 "${metadata.type}"가 이미 등록되어 있습니다. 덮어씁니다.`,
    );
  }
  registry.set(metadata.type, metadata);
}

/**
 * 여러 컴포넌트를 한번에 등록
 */
export function registerComponents(metadataList: ComponentMetadata[]): void {
  for (const metadata of metadataList) {
    registerComponent(metadata);
  }
}

/**
 * 컴포넌트 메타데이터 조회
 */
export function getComponent(type: ComponentType): ComponentMetadata | null {
  return registry.get(type) || null;
}

/**
 * 모든 컴포넌트 조회
 */
export function getAllComponents(): ComponentMetadata[] {
  return Array.from(registry.values());
}

/**
 * 카테고리별 컴포넌트 조회
 */
export function getComponentsByCategory(
  category: ComponentCategory,
): ComponentMetadata[] {
  return getAllComponents().filter(
    (component) => component.category === category,
  );
}

/**
 * 카테고리별 그룹핑된 컴포넌트 조회
 */
export function getComponentsGroupedByCategory(): Record<
  ComponentCategory,
  ComponentMetadata[]
> {
  const grouped: Record<ComponentCategory, ComponentMetadata[]> = {
    layout: [],
    typography: [],
    form: [],
    media: [],
    navigation: [],
  };

  for (const component of getAllComponents()) {
    grouped[component.category].push(component);
  }

  return grouped;
}

/**
 * 레지스트리 초기화 (테스트용)
 */
export function clearRegistry(): void {
  registry.clear();
}

/**
 * 레지스트리 상태 확인
 */
export function getRegistrySize(): number {
  return registry.size;
}
