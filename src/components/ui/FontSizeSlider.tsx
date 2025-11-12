"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface FontSizeSliderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const PRESET_SIZES = [12, 14, 16, 18, 24, 32, 48];
const UNITS = ["px", "rem", "em"] as const;
type Unit = (typeof UNITS)[number];

/**
 * Font Size Slider 컴포넌트 (Fully Controlled)
 * 슬라이더, 텍스트 입력, 프리셋 버튼, 단위 선택 제공
 * react-hook-form과 완벽하게 호환되는 controlled component
 */
export function FontSizeSlider({
  value,
  onChange,
  label,
  className,
}: FontSizeSliderProps) {
  // value를 파싱하여 숫자와 단위 추출 (메모이제이션)
  const { numValue, unit } = useMemo(() => {
    if (!value || value === "") {
      return { numValue: 16, unit: "px" as Unit };
    }

    const match = String(value).match(/^(\d+(?:\.\d+)?)(px|rem|em)?$/);
    if (match) {
      return {
        numValue: Number.parseFloat(match[1]),
        unit: (match[2] as Unit) || "px",
      };
    }

    return { numValue: 16, unit: "px" as Unit };
  }, [value]);

  // 슬라이더 범위 (단위에 따라 조정)
  const { sliderMin, sliderMax, sliderStep } = useMemo(() => {
    if (unit === "px") {
      return { sliderMin: 8, sliderMax: 96, sliderStep: 1 };
    }
    return { sliderMin: 0.5, sliderMax: 6, sliderStep: 0.1 };
  }, [unit]);

  // 슬라이더 변경
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value);
    onChange(`${newValue}${unit}`);
  };

  // 텍스트 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value);
    if (!Number.isNaN(newValue) && newValue > 0) {
      onChange(`${newValue}${unit}`);
    }
  };

  // 프리셋 버튼 클릭
  const handlePresetClick = (presetValue: number) => {
    onChange(`${presetValue}${unit}`);
  };

  // 단위 변경
  const handleUnitChange = (newUnit: Unit) => {
    onChange(`${numValue}${newUnit}`);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      {/* 슬라이더 + 텍스트 입력 + 단위 선택 */}
      <div className="flex items-center gap-2">
        {/* 슬라이더 */}
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={numValue}
          onChange={handleSliderChange}
          className="flex-1 accent-blue-500"
        />

        {/* 텍스트 입력 */}
        <input
          type="number"
          value={numValue}
          onChange={handleInputChange}
          className="w-16 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
        />

        {/* 단위 선택 */}
        <select
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as Unit)}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* 프리셋 버튼 (px 단위일 때만 표시) */}
      {unit === "px" && (
        <div className="flex flex-wrap gap-1">
          {PRESET_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handlePresetClick(size)}
              className={cn(
                "rounded border px-2 py-1 text-xs transition-colors",
                numValue === size
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-200"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
