import { getComponent } from "@/features/builder-components/registry";
import type { ComponentType } from "@/types/component";

/**
 * 드래그 프리뷰 컴포넌트
 * 컴포넌트 라이브러리에서 드래그할 때 표시되는 미리보기
 */
interface DragPreviewProps {
  componentType: ComponentType;
}

export function DragPreview({ componentType }: DragPreviewProps) {
  const metadata = getComponent(componentType);

  if (!metadata) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-400 bg-white p-4 shadow-lg dark:bg-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          알 수 없는 컴포넌트
        </p>
      </div>
    );
  }

  const Icon = metadata.icon;

  return (
    <div className="flex items-center gap-3 rounded-lg border-2 border-blue-500 bg-white p-3 shadow-lg dark:bg-zinc-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {metadata.label}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {metadata.description}
        </div>
      </div>
    </div>
  );
}
