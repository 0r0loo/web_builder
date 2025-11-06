import { registerComponents } from "../registry";
import { textMetadata } from "./Text";
import { buttonMetadata } from "./Button";
import { containerMetadata } from "./Container";

/**
 * 모든 프리미티브 컴포넌트 메타데이터
 */
const primitiveComponents = [textMetadata, buttonMetadata, containerMetadata];

/**
 * 프리미티브 컴포넌트 등록
 */
export function registerPrimitiveComponents() {
	registerComponents(primitiveComponents);
}

/**
 * 개별 컴포넌트 export
 */
export { Text, textMetadata } from "./Text";
export { Button, buttonMetadata } from "./Button";
export { Container, containerMetadata } from "./Container";
