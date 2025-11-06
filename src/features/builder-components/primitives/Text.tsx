import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { Type } from "lucide-react";

/**
 * Text 컴포넌트 메타데이터
 */
export const textMetadata: ComponentMetadata = {
	type: "text",
	label: "텍스트",
	description: "편집 가능한 텍스트 요소",
	category: "typography",
	icon: Type,
	allowChildren: false,
	defaultProps: {
		content: "텍스트를 입력하세요",
	},
	defaultStyles: {
		desktop: {
			fontSize: "16px",
			lineHeight: "1.5",
			color: "#000000",
		},
		tablet: {},
		mobile: {},
	},
};

/**
 * Text 렌더 컴포넌트
 */
interface TextProps {
	node: ComponentNode;
	children?: React.ReactNode;
}

export function Text({ node }: TextProps) {
	const { content = "텍스트를 입력하세요" } = node.props;

	return <span>{content}</span>;
}
