"use client";

import { useState } from "react";
import { useEditorStore } from "../store/editorStore";
import { findNodeById } from "@/lib/utils/tree";
import { getComponent } from "@/features/builder-components/registry";
import { Monitor, Tablet, Smartphone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Input, Label, Textarea, Select } from "@/components/ui/forms";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { FontSizeSlider } from "@/components/ui/FontSizeSlider";
import { UnitInput } from "@/components/ui/UnitInput";

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
 * Props 편집기
 */
interface PropsEditorProps {
  node: import("@/types/component").ComponentNode;
  updateNode: (
    nodeId: string,
    updates: Partial<Omit<import("@/types/component").ComponentNode, "id">>,
  ) => void;
}

function PropsEditor({ node, updateNode }: PropsEditorProps) {
  const handlePropChange = (key: string, value: string) => {
    updateNode(node.id, {
      props: {
        ...node.props,
        [key]: value,
      },
    });
  };

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
            <Textarea
              id="prop-content"
              value={(node.props.content as string) || ""}
              onChange={(e) => handlePropChange("content", e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Button 컴포넌트 */}
        {node.type === "button" && (
          <>
            <div>
              <Label htmlFor="prop-text">버튼 텍스트</Label>
              <Input
                id="prop-text"
                value={(node.props.text as string) || ""}
                onChange={(e) => handlePropChange("text", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="prop-variant">스타일 변형</Label>
              <Select
                id="prop-variant"
                value={(node.props.variant as string) || "primary"}
                onChange={(e) => handlePropChange("variant", e.target.value)}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </Select>
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
              <Input
                id="prop-src"
                type="url"
                value={(node.props.src as string) || ""}
                onChange={(e) => handlePropChange("src", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="prop-alt">대체 텍스트 (Alt)</Label>
              <Input
                id="prop-alt"
                value={(node.props.alt as string) || ""}
                onChange={(e) => handlePropChange("alt", e.target.value)}
                placeholder="이미지 설명"
              />
            </div>
            <div>
              <Label htmlFor="prop-objectFit">Object Fit</Label>
              <Select
                id="prop-objectFit"
                value={(node.props.objectFit as string) || "cover"}
                onChange={(e) => handlePropChange("objectFit", e.target.value)}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
                <option value="scale-down">Scale Down</option>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Styles 편집기
 */
interface StylesEditorProps {
  node: import("@/types/component").ComponentNode;
  updateNode: (
    nodeId: string,
    updates: Partial<Omit<import("@/types/component").ComponentNode, "id">>,
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

  const handleStyleChange = (key: string, value: string) => {
    updateNode(node.id, {
      styles: {
        [currentBreakpoint]: {
          ...currentStyles,
          [key]: value,
        },
      },
    });
  };

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
          <StyleSelect
            label="Display"
            value={currentStyles.display || "flex"}
            onChange={(v) => handleStyleChange("display", v)}
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
          <StyleSelect
            label="Flex Direction"
            value={currentStyles.flexDirection || "row"}
            onChange={(v) => handleStyleChange("flexDirection", v)}
            options={[
              { value: "row", label: "Row" },
              { value: "row-reverse", label: "Row Reverse" },
              { value: "column", label: "Column" },
              { value: "column-reverse", label: "Column Reverse" },
            ]}
          />
          <StyleSelect
            label="Justify Content"
            value={currentStyles.justifyContent || "flex-start"}
            onChange={(v) => handleStyleChange("justifyContent", v)}
            options={[
              { value: "flex-start", label: "Flex Start" },
              { value: "flex-end", label: "Flex End" },
              { value: "center", label: "Center" },
              { value: "space-between", label: "Space Between" },
              { value: "space-around", label: "Space Around" },
              { value: "space-evenly", label: "Space Evenly" },
            ]}
          />
          <StyleSelect
            label="Align Items"
            value={currentStyles.alignItems || "flex-start"}
            onChange={(v) => handleStyleChange("alignItems", v)}
            options={[
              { value: "flex-start", label: "Flex Start" },
              { value: "flex-end", label: "Flex End" },
              { value: "center", label: "Center" },
              { value: "stretch", label: "Stretch" },
              { value: "baseline", label: "Baseline" },
            ]}
          />
          <StyleSelect
            label="Flex Wrap"
            value={currentStyles.flexWrap || "wrap"}
            onChange={(v) => handleStyleChange("flexWrap", v)}
            options={[
              { value: "wrap", label: "Wrap (줄바꿈)" },
              { value: "nowrap", label: "No Wrap (한 줄 유지)" },
              { value: "wrap-reverse", label: "Wrap Reverse (역순)" },
            ]}
          />
          <UnitInput
            label="Gap"
            value={currentStyles.gap}
            onChange={(v) => handleStyleChange("gap", v)}
            units={["px", "rem", "em"]}
            placeholder="16"
          />
          <StyleInput
            label="Grid Template Columns"
            value={currentStyles.gridTemplateColumns}
            onChange={(v) => handleStyleChange("gridTemplateColumns", v)}
            placeholder="repeat(3, 1fr)"
          />
          <StyleInput
            label="Grid Template Rows"
            value={currentStyles.gridTemplateRows}
            onChange={(v) => handleStyleChange("gridTemplateRows", v)}
            placeholder="auto"
          />
        </StyleCategory>

        {/* Spacing 카테고리 */}
        <StyleCategory
          title="Spacing"
          isOpen={openCategories.spacing}
          onToggle={() => toggleCategory("spacing")}
        >
          <UnitInput
            label="Margin"
            value={currentStyles.margin}
            onChange={(v) => handleStyleChange("margin", v)}
            units={["px", "rem", "em", "auto"]}
            placeholder="0"
          />
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Margin Top"
              value={currentStyles.marginTop}
              onChange={(v) => handleStyleChange("marginTop", v)}
              units={["px", "rem", "em", "auto"]}
              placeholder="0"
            />
            <UnitInput
              label="Margin Right"
              value={currentStyles.marginRight}
              onChange={(v) => handleStyleChange("marginRight", v)}
              units={["px", "rem", "em", "auto"]}
              placeholder="0"
            />
            <UnitInput
              label="Margin Bottom"
              value={currentStyles.marginBottom}
              onChange={(v) => handleStyleChange("marginBottom", v)}
              units={["px", "rem", "em", "auto"]}
              placeholder="0"
            />
            <UnitInput
              label="Margin Left"
              value={currentStyles.marginLeft}
              onChange={(v) => handleStyleChange("marginLeft", v)}
              units={["px", "rem", "em", "auto"]}
              placeholder="0"
            />
          </div>
          <UnitInput
            label="Padding"
            value={currentStyles.padding}
            onChange={(v) => handleStyleChange("padding", v)}
            units={["px", "rem", "em"]}
            placeholder="0"
          />
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              label="Padding Top"
              value={currentStyles.paddingTop}
              onChange={(v) => handleStyleChange("paddingTop", v)}
              units={["px", "rem", "em"]}
              placeholder="0"
            />
            <UnitInput
              label="Padding Right"
              value={currentStyles.paddingRight}
              onChange={(v) => handleStyleChange("paddingRight", v)}
              units={["px", "rem", "em"]}
              placeholder="0"
            />
            <UnitInput
              label="Padding Bottom"
              value={currentStyles.paddingBottom}
              onChange={(v) => handleStyleChange("paddingBottom", v)}
              units={["px", "rem", "em"]}
              placeholder="0"
            />
            <UnitInput
              label="Padding Left"
              value={currentStyles.paddingLeft}
              onChange={(v) => handleStyleChange("paddingLeft", v)}
              units={["px", "rem", "em"]}
              placeholder="0"
            />
          </div>
        </StyleCategory>

        {/* Typography 카테고리 */}
        <StyleCategory
          title="Typography"
          isOpen={openCategories.typography}
          onToggle={() => toggleCategory("typography")}
        >
          <StyleInput
            label="Font Family"
            value={currentStyles.fontFamily}
            onChange={(v) => handleStyleChange("fontFamily", v)}
            placeholder="inherit"
          />
          <FontSizeSlider
            label="Font Size"
            value={(currentStyles.fontSize as string) || "16px"}
            onChange={(v) => handleStyleChange("fontSize", v)}
          />
          <StyleInput
            label="Font Weight"
            value={currentStyles.fontWeight}
            onChange={(v) => handleStyleChange("fontWeight", v)}
            placeholder="400"
          />
          <StyleInput
            label="Line Height"
            value={currentStyles.lineHeight}
            onChange={(v) => handleStyleChange("lineHeight", v)}
            placeholder="1.5"
          />
          <StyleInput
            label="Text Align"
            value={currentStyles.textAlign}
            onChange={(v) => handleStyleChange("textAlign", v)}
            placeholder="left"
          />
          <StyleInput
            label="Text Decoration"
            value={currentStyles.textDecoration}
            onChange={(v) => handleStyleChange("textDecoration", v)}
            placeholder="none"
          />
          <StyleInput
            label="Letter Spacing"
            value={currentStyles.letterSpacing}
            onChange={(v) => handleStyleChange("letterSpacing", v)}
            placeholder="normal"
          />
        </StyleCategory>

        {/* Colors 카테고리 */}
        <StyleCategory
          title="Colors"
          isOpen={openCategories.colors}
          onToggle={() => toggleCategory("colors")}
        >
          <ColorPicker
            label="Color"
            value={(currentStyles.color as string) || "#000000"}
            onChange={(v) => handleStyleChange("color", v)}
          />
          <ColorPicker
            label="Background Color"
            value={(currentStyles.backgroundColor as string) || "transparent"}
            onChange={(v) => handleStyleChange("backgroundColor", v)}
          />
          <StyleInput
            label="Opacity"
            value={currentStyles.opacity}
            onChange={(v) => handleStyleChange("opacity", v)}
            placeholder="1"
          />
        </StyleCategory>

        {/* Border 카테고리 */}
        <StyleCategory
          title="Border"
          isOpen={openCategories.border}
          onToggle={() => toggleCategory("border")}
        >
          <StyleInput
            label="Border"
            value={currentStyles.border}
            onChange={(v) => handleStyleChange("border", v)}
            placeholder="1px solid #000"
          />
          <StyleInput
            label="Border Width"
            value={currentStyles.borderWidth}
            onChange={(v) => handleStyleChange("borderWidth", v)}
            placeholder="1px"
          />
          <StyleInput
            label="Border Style"
            value={currentStyles.borderStyle}
            onChange={(v) => handleStyleChange("borderStyle", v)}
            placeholder="solid"
          />
          <ColorPicker
            label="Border Color"
            value={(currentStyles.borderColor as string) || "#000000"}
            onChange={(v) => handleStyleChange("borderColor", v)}
          />
          <UnitInput
            label="Border Radius"
            value={currentStyles.borderRadius}
            onChange={(v) => handleStyleChange("borderRadius", v)}
            units={["px", "rem", "em", "%"]}
            placeholder="0"
          />
        </StyleCategory>

        {/* Size 카테고리 */}
        <StyleCategory
          title="Size"
          isOpen={openCategories.size}
          onToggle={() => toggleCategory("size")}
        >
          <UnitInput
            label="Width"
            value={currentStyles.width}
            onChange={(v) => handleStyleChange("width", v)}
            units={["px", "%", "rem", "em", "vw", "auto"]}
            placeholder="auto"
          />
          <UnitInput
            label="Height"
            value={currentStyles.height}
            onChange={(v) => handleStyleChange("height", v)}
            units={["px", "%", "rem", "em", "vh", "auto"]}
            placeholder="auto"
          />
          <UnitInput
            label="Min Width"
            value={currentStyles.minWidth}
            onChange={(v) => handleStyleChange("minWidth", v)}
            units={["px", "%", "rem", "em", "vw"]}
            placeholder="0"
          />
          <UnitInput
            label="Min Height"
            value={currentStyles.minHeight}
            onChange={(v) => handleStyleChange("minHeight", v)}
            units={["px", "%", "rem", "em", "vh"]}
            placeholder="0"
          />
          <UnitInput
            label="Max Width"
            value={currentStyles.maxWidth}
            onChange={(v) => handleStyleChange("maxWidth", v)}
            units={["px", "%", "rem", "em", "vw", "none"]}
            placeholder="none"
          />
          <UnitInput
            label="Max Height"
            value={currentStyles.maxHeight}
            onChange={(v) => handleStyleChange("maxHeight", v)}
            units={["px", "%", "rem", "em", "vh", "none"]}
            placeholder="none"
          />
        </StyleCategory>

        {/* Shadow 카테고리 */}
        <StyleCategory
          title="Shadow"
          isOpen={openCategories.shadow}
          onToggle={() => toggleCategory("shadow")}
        >
          <StyleInput
            label="Box Shadow"
            value={currentStyles.boxShadow}
            onChange={(v) => handleStyleChange("boxShadow", v)}
            placeholder="0 2px 4px rgba(0,0,0,0.1)"
          />
          <StyleInput
            label="Text Shadow"
            value={currentStyles.textShadow}
            onChange={(v) => handleStyleChange("textShadow", v)}
            placeholder="0 1px 2px rgba(0,0,0,0.1)"
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
  value: string | number | undefined;
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
  value: string | number | undefined;
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
