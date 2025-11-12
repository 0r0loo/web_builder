"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "../store/editorStore";
import { findNodeById } from "@/lib/utils/tree";
import { getComponent } from "@/features/builder-components/registry";
import { Monitor, Tablet, Smartphone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Input, Label, Textarea, Select } from "@/components/ui/forms";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { FontSizeSlider } from "@/components/ui/FontSizeSlider";
import { UnitInput } from "@/components/ui/UnitInput";
import { useDebouncedForm } from "@/hooks/useDebouncedForm";
import { Controller } from "react-hook-form";
import type { ComponentNode } from "@/types/component";

/**
 * 속성 패널
 * 선택된 컴포넌트의 속성과 스타일을 편집
 */
export function PropertiesPanel() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const updateNode = useEditorStore((state) => state.updateNode);
  const deleteNode = useEditorStore((state) => state.deleteNode);

  // selectedNode를 직접 selector로 가져와서 리액티브하게 만듦
  const selectedNode = useEditorStore((state) => {
    if (!selectedNodeId) return null;
    const currentPage = state.pages.find(
      (page) => page.id === state.currentPageId,
    );
    if (!currentPage) return null;
    return findNodeById(currentPage.root, selectedNodeId);
  });

  // 삭제 핸들러
  const handleDelete = () => {
    if (!selectedNode) return;

    // 자식 노드가 있으면 확인
    const childrenCount = selectedNode.children?.length || 0;
    if (childrenCount > 0) {
      const confirmed = window.confirm(
        `이 컴포넌트는 ${childrenCount}개의 자식 컴포넌트를 포함하고 있습니다.\n모두 삭제하시겠습니까?`,
      );
      if (!confirmed) return;
    }

    deleteNode(selectedNode.id);
  };

  if (!selectedNodeId || !selectedNode) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            속성
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              컴포넌트를 선택하면
              <br />
              속성을 편집할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  const metadata = getComponent(selectedNode.type);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              속성
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {metadata?.label || selectedNode.type}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            title="Delete (Del)"
          >
            삭제
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* 컴포넌트 ID */}
          <div>
            <Label htmlFor="component-id">컴포넌트 ID</Label>
            <Input
              id="component-id"
              value={selectedNodeId}
              readOnly
              variant="readonly"
            />
          </div>

          {/* Props 편집 섹션 */}
          <PropsEditor node={selectedNode} updateNode={updateNode} />

          {/* Styles 편집 섹션 */}
          <StylesEditor node={selectedNode} updateNode={updateNode} />
        </div>
      </div>
    </div>
  );
}

/**
 * Props 편집기 (react-hook-form 사용)
 */
interface PropsEditorProps {
  node: ComponentNode;
  updateNode: (
    nodeId: string,
    updates: Partial<Omit<ComponentNode, "id">>,
  ) => void;
}

function PropsEditor({ node, updateNode }: PropsEditorProps) {
  const pages = useEditorStore((state) => state.pages);

  // react-hook-form 설정
  const { control, reset } = useDebouncedForm<Record<string, unknown>>({
    defaultValues: node.props,
    onSubmit: (data) => {
      updateNode(node.id, { props: data });
    },
    debounceMs: 300,
  });

  // node.props가 변경되면 폼 리셋
  useEffect(() => {
    reset(node.props);
  }, [node.id, reset]); // node.id 변경 시에만 리셋

  // Link 타입 결정 (내부 페이지 또는 외부 URL)
  const linkType =
    node.type === "link"
      ? (node.props.pageId as string)
        ? "internal"
        : "external"
      : null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
        Props
      </h3>

      <div className="space-y-3">
        {/* Text 컴포넌트 */}
        {node.type === "text" && (
          <div>
            <Label htmlFor="prop-content">텍스트 내용</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="prop-content"
                  value={(field.value as string) || ""}
                  onChange={field.onChange}
                  rows={3}
                />
              )}
            />
          </div>
        )}

        {/* Button 컴포넌트 */}
        {node.type === "button" && (
          <>
            <div>
              <Label htmlFor="prop-text">버튼 텍스트</Label>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Input
                    id="prop-text"
                    value={(field.value as string) || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="prop-variant">스타일 변형</Label>
              <Controller
                name="variant"
                control={control}
                render={({ field }) => (
                  <Select
                    id="prop-variant"
                    value={(field.value as string) || "primary"}
                    onChange={field.onChange}
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="outline">Outline</option>
                  </Select>
                )}
              />
            </div>
          </>
        )}

        {/* Container 컴포넌트 */}
        {node.type === "container" && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Container는 별도의 props가 없습니다
          </p>
        )}

        {/* Image 컴포넌트 */}
        {node.type === "image" && (
          <>
            <div>
              <Label htmlFor="prop-src">이미지 URL</Label>
              <Controller
                name="src"
                control={control}
                render={({ field }) => (
                  <Input
                    id="prop-src"
                    type="url"
                    value={(field.value as string) || ""}
                    onChange={field.onChange}
                    placeholder="https://example.com/image.jpg"
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="prop-alt">대체 텍스트 (Alt)</Label>
              <Controller
                name="alt"
                control={control}
                render={({ field }) => (
                  <Input
                    id="prop-alt"
                    value={(field.value as string) || ""}
                    onChange={field.onChange}
                    placeholder="이미지 설명"
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="prop-objectFit">Object Fit</Label>
              <Controller
                name="objectFit"
                control={control}
                render={({ field }) => (
                  <Select
                    id="prop-objectFit"
                    value={(field.value as string) || "cover"}
                    onChange={field.onChange}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                    <option value="none">None</option>
                    <option value="scale-down">Scale Down</option>
                  </Select>
                )}
              />
            </div>
          </>
        )}

        {/* Link 컴포넌트 */}
        {node.type === "link" && (
          <>
            <div>
              <Label htmlFor="prop-text">링크 텍스트</Label>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Input
                    id="prop-text"
                    value={(field.value as string) || ""}
                    onChange={field.onChange}
                    placeholder="링크"
                  />
                )}
              />
            </div>

            {/* 링크 타입 선택 */}
            <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
              <Label className="mb-2 block">링크 타입</Label>
              <div className="space-y-2">
                {/* 내부 페이지 라디오 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="link-type"
                    value="internal"
                    checked={linkType === "internal"}
                    onChange={() => {
                      // 외부 URL 제거, 첫 번째 페이지로 설정
                      updateNode(node.id, {
                        props: {
                          ...node.props,
                          href: "",
                          pageId: pages[0]?.id || "",
                        },
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    내부 페이지
                  </span>
                </label>

                {/* 외부 URL 라디오 */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="link-type"
                    value="external"
                    checked={linkType === "external"}
                    onChange={() => {
                      // 페이지 ID 제거
                      updateNode(node.id, {
                        props: {
                          ...node.props,
                          pageId: "",
                          href: "https://",
                        },
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    외부 URL
                  </span>
                </label>
              </div>
            </div>

            {/* 내부 페이지 선택 */}
            {linkType === "internal" && (
              <div>
                <Label htmlFor="prop-pageId">대상 페이지</Label>
                <Controller
                  name="pageId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="prop-pageId"
                      value={(field.value as string) || ""}
                      onChange={field.onChange}
                    >
                      <option value="">페이지 선택...</option>
                      {pages.map((page) => (
                        <option key={page.id} value={page.id}>
                          {page.name}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>
            )}

            {/* 외부 URL 입력 */}
            {linkType === "external" && (
              <div>
                <Label htmlFor="prop-href">외부 URL</Label>
                <Controller
                  name="href"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="prop-href"
                      type="url"
                      value={(field.value as string) || ""}
                      onChange={field.onChange}
                      placeholder="https://example.com"
                    />
                  )}
                />
              </div>
            )}

            {/* Target 선택 */}
            <div>
              <Label htmlFor="prop-target">링크 열기</Label>
              <Controller
                name="target"
                control={control}
                render={({ field }) => (
                  <Select
                    id="prop-target"
                    value={(field.value as string) || "_self"}
                    onChange={field.onChange}
                  >
                    <option value="_self">같은 탭에서 열기</option>
                    <option value="_blank">새 탭에서 열기</option>
                  </Select>
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Styles 편집기 (react-hook-form 사용)
 */
interface StylesEditorProps {
  node: ComponentNode;
  updateNode: (
    nodeId: string,
    updates: Partial<Omit<ComponentNode, "id">>,
  ) => void;
}

function StylesEditor({ node, updateNode }: StylesEditorProps) {
  const currentBreakpoint = useEditorStore((state) => state.currentBreakpoint);
  const currentStyles = node.styles[currentBreakpoint] || {};

  // 카테고리별 펼침/접힘 상태
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      layout: true,
      spacing: false,
      typography: false,
      colors: false,
      border: false,
      size: false,
      shadow: false,
    },
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // react-hook-form 설정
  const { control, reset } = useDebouncedForm<Record<string, unknown>>({
    defaultValues: currentStyles,
    onSubmit: (data) => {
      updateNode(node.id, {
        styles: {
          [currentBreakpoint]: data,
        },
      });
    },
    debounceMs: 300,
  });

  // currentStyles가 변경되면 폼 리셋
  useEffect(() => {
    reset(currentStyles);
  }, [currentBreakpoint, node.id, reset]); // breakpoint 또는 node.id 변경 시에만 리셋

  // 브레이크포인트별 아이콘 및 라벨
  const breakpointInfo = {
    mobile: { icon: Smartphone, label: "모바일", size: "< 768px" },
    tablet: { icon: Tablet, label: "태블릿", size: "768px - 1023px" },
    desktop: { icon: Monitor, label: "데스크톱", size: ">= 1024px" },
  }[currentBreakpoint];

  const BreakpointIcon = breakpointInfo.icon;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          Styles
        </h3>
        <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 dark:bg-blue-900/30">
          <BreakpointIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {breakpointInfo.label}
          </span>
          <span className="text-xs text-blue-600/70 dark:text-blue-400/70">
            {breakpointInfo.size}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Layout 카테고리 */}
        <StyleCategory
          title="Layout"
          isOpen={openCategories.layout}
          onToggle={() => toggleCategory("layout")}
        >
          <Controller
            name="display"
            control={control}
            render={({ field }) => (
              <StyleSelect
                label="Display"
                value={field.value || "flex"}
                onChange={field.onChange}
                options={[
                  { value: "flex", label: "Flex" },
                  { value: "block", label: "Block" },
                  { value: "inline-block", label: "Inline Block" },
                  { value: "grid", label: "Grid" },
                  { value: "inline-flex", label: "Inline Flex" },
                  { value: "inline", label: "Inline" },
                  { value: "none", label: "None" },
                ]}
              />
            )}
          />
          <Controller
            name="flexDirection"
            control={control}
            render={({ field }) => (
              <StyleSelect
                label="Flex Direction"
                value={field.value || "row"}
                onChange={field.onChange}
                options={[
                  { value: "row", label: "Row" },
                  { value: "row-reverse", label: "Row Reverse" },
                  { value: "column", label: "Column" },
                  { value: "column-reverse", label: "Column Reverse" },
                ]}
              />
            )}
          />
          <Controller
            name="justifyContent"
            control={control}
            render={({ field }) => (
              <StyleSelect
                label="Justify Content"
                value={field.value || "flex-start"}
                onChange={field.onChange}
                options={[
                  { value: "flex-start", label: "Flex Start" },
                  { value: "flex-end", label: "Flex End" },
                  { value: "center", label: "Center" },
                  { value: "space-between", label: "Space Between" },
                  { value: "space-around", label: "Space Around" },
                  { value: "space-evenly", label: "Space Evenly" },
                ]}
              />
            )}
          />
          <Controller
            name="alignItems"
            control={control}
            render={({ field }) => (
              <StyleSelect
                label="Align Items"
                value={field.value || "flex-start"}
                onChange={field.onChange}
                options={[
                  { value: "flex-start", label: "Flex Start" },
                  { value: "flex-end", label: "Flex End" },
                  { value: "center", label: "Center" },
                  { value: "stretch", label: "Stretch" },
                  { value: "baseline", label: "Baseline" },
                ]}
              />
            )}
          />
          <Controller
            name="flexWrap"
            control={control}
            render={({ field }) => (
              <StyleSelect
                label="Flex Wrap"
                value={field.value || "wrap"}
                onChange={field.onChange}
                options={[
                  { value: "wrap", label: "Wrap (줄바꿈)" },
                  { value: "nowrap", label: "No Wrap (한 줄 유지)" },
                  { value: "wrap-reverse", label: "Wrap Reverse (역순)" },
                ]}
              />
            )}
          />
          <Controller
            name="gap"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Gap"
                value={field.value}
                onChange={field.onChange}
                units={["px", "rem", "em"]}
                placeholder="16"
              />
            )}
          />
          <Controller
            name="gridTemplateColumns"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Grid Template Columns"
                value={field.value}
                onChange={field.onChange}
                placeholder="repeat(3, 1fr)"
              />
            )}
          />
          <Controller
            name="gridTemplateRows"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Grid Template Rows"
                value={field.value}
                onChange={field.onChange}
                placeholder="auto"
              />
            )}
          />
        </StyleCategory>

        {/* Spacing 카테고리 */}
        <StyleCategory
          title="Spacing"
          isOpen={openCategories.spacing}
          onToggle={() => toggleCategory("spacing")}
        >
          <Controller
            name="margin"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Margin"
                value={field.value}
                onChange={field.onChange}
                units={["px", "rem", "em", "auto"]}
                placeholder="0"
              />
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="marginTop"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Margin Top"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em", "auto"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="marginRight"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Margin Right"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em", "auto"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="marginBottom"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Margin Bottom"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em", "auto"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="marginLeft"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Margin Left"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em", "auto"]}
                  placeholder="0"
                />
              )}
            />
          </div>
          <Controller
            name="padding"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Padding"
                value={field.value}
                onChange={field.onChange}
                units={["px", "rem", "em"]}
                placeholder="0"
              />
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="paddingTop"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Padding Top"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="paddingRight"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Padding Right"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="paddingBottom"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Padding Bottom"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em"]}
                  placeholder="0"
                />
              )}
            />
            <Controller
              name="paddingLeft"
              control={control}
              render={({ field }) => (
                <UnitInput
                  label="Padding Left"
                  value={field.value}
                  onChange={field.onChange}
                  units={["px", "rem", "em"]}
                  placeholder="0"
                />
              )}
            />
          </div>
        </StyleCategory>

        {/* Typography 카테고리 */}
        <StyleCategory
          title="Typography"
          isOpen={openCategories.typography}
          onToggle={() => toggleCategory("typography")}
        >
          <Controller
            name="fontFamily"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Font Family"
                value={field.value}
                onChange={field.onChange}
                placeholder="inherit"
              />
            )}
          />
          <Controller
            name="fontSize"
            control={control}
            render={({ field }) => (
              <FontSizeSlider
                label="Font Size"
                value={(field.value as string) || "16px"}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="fontWeight"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Font Weight"
                value={field.value}
                onChange={field.onChange}
                placeholder="400"
              />
            )}
          />
          <Controller
            name="lineHeight"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Line Height"
                value={field.value}
                onChange={field.onChange}
                placeholder="1.5"
              />
            )}
          />
          <Controller
            name="textAlign"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Text Align"
                value={field.value}
                onChange={field.onChange}
                placeholder="left"
              />
            )}
          />
          <Controller
            name="textDecoration"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Text Decoration"
                value={field.value}
                onChange={field.onChange}
                placeholder="none"
              />
            )}
          />
          <Controller
            name="letterSpacing"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Letter Spacing"
                value={field.value}
                onChange={field.onChange}
                placeholder="normal"
              />
            )}
          />
        </StyleCategory>

        {/* Colors 카테고리 */}
        <StyleCategory
          title="Colors"
          isOpen={openCategories.colors}
          onToggle={() => toggleCategory("colors")}
        >
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                label="Color"
                value={(field.value as string) || "#000000"}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="backgroundColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                label="Background Color"
                value={(field.value as string) || "transparent"}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="opacity"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Opacity"
                value={field.value}
                onChange={field.onChange}
                placeholder="1"
              />
            )}
          />
        </StyleCategory>

        {/* Border 카테고리 */}
        <StyleCategory
          title="Border"
          isOpen={openCategories.border}
          onToggle={() => toggleCategory("border")}
        >
          <Controller
            name="border"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Border"
                value={field.value}
                onChange={field.onChange}
                placeholder="1px solid #000"
              />
            )}
          />
          <Controller
            name="borderWidth"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Border Width"
                value={field.value}
                onChange={field.onChange}
                placeholder="1px"
              />
            )}
          />
          <Controller
            name="borderStyle"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Border Style"
                value={field.value}
                onChange={field.onChange}
                placeholder="solid"
              />
            )}
          />
          <Controller
            name="borderColor"
            control={control}
            render={({ field }) => (
              <ColorPicker
                label="Border Color"
                value={(field.value as string) || "#000000"}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="borderRadius"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Border Radius"
                value={field.value}
                onChange={field.onChange}
                units={["px", "rem", "em", "%"]}
                placeholder="0"
              />
            )}
          />
        </StyleCategory>

        {/* Size 카테고리 */}
        <StyleCategory
          title="Size"
          isOpen={openCategories.size}
          onToggle={() => toggleCategory("size")}
        >
          <Controller
            name="width"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Width"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vw", "auto"]}
                placeholder="auto"
              />
            )}
          />
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Height"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vh", "auto"]}
                placeholder="auto"
              />
            )}
          />
          <Controller
            name="minWidth"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Min Width"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vw"]}
                placeholder="0"
              />
            )}
          />
          <Controller
            name="minHeight"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Min Height"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vh"]}
                placeholder="0"
              />
            )}
          />
          <Controller
            name="maxWidth"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Max Width"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vw", "none"]}
                placeholder="none"
              />
            )}
          />
          <Controller
            name="maxHeight"
            control={control}
            render={({ field }) => (
              <UnitInput
                label="Max Height"
                value={field.value}
                onChange={field.onChange}
                units={["px", "%", "rem", "em", "vh", "none"]}
                placeholder="none"
              />
            )}
          />
        </StyleCategory>

        {/* Shadow 카테고리 */}
        <StyleCategory
          title="Shadow"
          isOpen={openCategories.shadow}
          onToggle={() => toggleCategory("shadow")}
        >
          <Controller
            name="boxShadow"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Box Shadow"
                value={field.value}
                onChange={field.onChange}
                placeholder="0 2px 4px rgba(0,0,0,0.1)"
              />
            )}
          />
          <Controller
            name="textShadow"
            control={control}
            render={({ field }) => (
              <StyleInput
                label="Text Shadow"
                value={field.value}
                onChange={field.onChange}
                placeholder="0 1px 2px rgba(0,0,0,0.1)"
              />
            )}
          />
        </StyleCategory>
      </div>
    </div>
  );
}

/**
 * 스타일 카테고리 아코디언
 */
interface StyleCategoryProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function StyleCategory({
  title,
  isOpen,
  onToggle,
  children,
}: StyleCategoryProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform dark:text-zinc-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-700">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * 스타일 입력 필드
 */
interface StyleInputProps {
  label: string;
  value: string | number | undefined | unknown;
  onChange: (value: string) => void;
  placeholder?: string;
}

function StyleInput({ label, value, onChange, placeholder }: StyleInputProps) {
  // number를 string으로 변환
  const stringValue = value !== undefined ? String(value) : "";

  return (
    <div>
      <Label className="mb-1">{label}</Label>
      <Input
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="py-1.5"
      />
    </div>
  );
}

/**
 * 스타일 셀렉트 필드
 */
interface StyleSelectProps {
  label: string;
  value: string | number | undefined | unknown;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function StyleSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: StyleSelectProps) {
  // number를 string으로 변환
  const stringValue = value !== undefined ? String(value) : "";

  return (
    <div>
      <Label className="mb-1">{label}</Label>
      <Select
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        className="py-1.5"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}