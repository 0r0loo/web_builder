import { useEffect, useState } from "react";
import type { Page } from "@/types/page";

/**
 * localStorage에서 특정 페이지 데이터를 로드하는 hook
 */
export function usePageData(pageId: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("web-builder-project");
      if (!data) {
        setError("저장된 데이터가 없습니다.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(data);
      const foundPage = parsed.pages?.find((p: Page) => p.id === pageId);

      if (!foundPage) {
        setError("페이지를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      setPage(foundPage);
      setLoading(false);
    } catch (_err) {
      setError("페이지를 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  }, [pageId]);

  return { page, loading, error };
}
