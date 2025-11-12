import { registerComponents } from "../registry";
import { buttonMetadata } from "./Button";
import { containerMetadata } from "./Container";
import { imageMetadata } from "./Image";
import { linkMetadata } from "./Link";
import { textMetadata } from "./Text";

/**
 * 모든 프리미티브 컴포넌트 메타데이터
 */
const primitiveComponents = [
  textMetadata,
  buttonMetadata,
  containerMetadata,
  imageMetadata,
  linkMetadata,
];

/**
 * 프리미티브 컴포넌트 등록
 */
export function registerPrimitiveComponents() {
  registerComponents(primitiveComponents);
}

export { Button, buttonMetadata } from "./Button";
export { Container, containerMetadata } from "./Container";
export { Image, imageMetadata } from "./Image";
export { Link, linkMetadata } from "./Link";
/**
 * 개별 컴포넌트 export
 */
export { Text, textMetadata } from "./Text";
