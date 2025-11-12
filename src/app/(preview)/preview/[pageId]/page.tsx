"use client";

import { use } from "react";
import { usePageData } from "@/features/preview/hooks/usePageData";
import { PureRenderer } from "@/features/renderer/PureRenderer";

interface PreviewPageProps {
  params: Promise<{ pageId: string }>;
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { pageId } = use(params);
  const { page, loading, error } = usePageData(pageId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold text-red-600">
            {error || "페이지를 찾을 수 없습니다."}
          </div>
          <a
            href="/editor"
            className="mt-4 inline-block text-blue-600 underline"
          >
            에디터로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  return <PureRenderer root={page.root} breakpoint="desktop" />;
}