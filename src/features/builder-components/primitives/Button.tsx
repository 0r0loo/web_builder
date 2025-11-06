import type { ComponentNode } from "@/types/component";
import type { ComponentMetadata } from "../types";
import { MousePointerClick } from "lucide-react";

/**
 * Button 컴포넌트 메타데이터
 */
export const buttonMetadata: ComponentMetadata = {
	type: "button",
	label: "버튼",
	description: "클릭 가능한 버튼 요소",
	category: "form",
	icon: MousePointerClick,
	allowChildren: false,
	defaultProps: {
		text: "버튼",
		variant: "primary", // primary | secondary | outline
	},
	defaultStyles: {
		desktop: {
			padding: "12px 24px",
			fontSize: "16px",
			fontWeight: "500",
			borderRadius: "8px",
			border: "none",
			cursor: "pointer",
			backgroundColor: "#3b82f6",
			color: "#ffffff",
			transition: "all 0.2s",
		},
		tablet: {},
		mobile: {
			padding: "10px 20px",
			fontSize: "14px",
		},
	},
};

/**
 * Button 렌더 컴포넌트
 */
interface ButtonProps {
	node: ComponentNode;
	children?: React.ReactNode;
}

export function Button({ node }: ButtonProps) {
	const { text = "버튼", variant = "primary" } = node.props;

	return (
		<button type="button" data-variant={variant}>
			{text}
		</button>
	);
}
