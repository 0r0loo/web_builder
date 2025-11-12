import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web Builder - Editor",
  description: "드래그 앤 드롭으로 웹사이트를 만드세요",
};

/**
 * 에디터 레이아웃
 * 에디터 전용 라우트 그룹으로 메인 레이아웃과 분리
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
