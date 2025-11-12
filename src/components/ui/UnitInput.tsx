"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface UnitInputProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  units?: string[];
  placeholder?: string;
  allowEmpty?: boolean;
}

/**
 * Unit Input 컴포넌트 (Fully Controlled)
 * 숫자 입력 + 단위 선택이 가능한 입력 필드
 * react-hook-form과 완벽하게 호환되는 controlled component
 */
export function UnitInput({
  value,
  onChange,
  label,
  className,
  units = ["px", "%", "rem", "em", "auto"],
  placeholder,
  allowEmpty = true,
}: UnitInputProps) {
  // value를 파싱하여 numValue와 unit 추출 (메모이제이션)
  const { numValue, unit } = useMemo(() => {
    if (value === undefined || value === "") {
      return { numValue: "", unit: units[0] || "px" };
    }

    const stringValue = String(value);

    // auto, inherit 등 키워드 값인 경우
    if (units.includes(stringValue)) {
      return { numValue: "", unit: stringValue };
    }

    // 숫자 + 단위 파싱
    const match = stringValue.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh|auto)?$/);
    if (match) {
      return {
        numValue: match[1],
        unit: match[2] || units[0] || "px",
      };
    }

    return { numValue: "", unit: units[0] || "px" };
  }, [value, units]);

  // 텍스트 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // auto, inherit 등 키워드 단위인 경우
    if (units.includes(unit) && ["auto", "inherit", "none"].includes(unit)) {
      onChange(unit);
      return;
    }

    // 빈 값 처리
    if (newValue === "" || newValue === "-") {
      if (allowEmpty) {
        onChange("");
      }
      return;
    }

    // 숫자 + 단위
    const numericValue = Number.parseFloat(newValue);
    if (!Number.isNaN(numericValue)) {
      onChange(`${numericValue}${unit}`);
    } else if (allowEmpty) {
      onChange("");
    }
  };

  // 단위 변경
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;

    // auto, inherit 등 키워드 단위인 경우
    if (["auto", "inherit", "none"].includes(newUnit)) {
      onChange(newUnit);
      return;
    }

    // 숫자가 있으면 숫자 + 새 단위
    if (numValue && numValue !== "") {
      const numericValue = Number.parseFloat(numValue);
      if (!Number.isNaN(numericValue)) {
        onChange(`${numericValue}${newUnit}`);
        return;
      }
    }

    // 숫자가 없으면 단위만 변경 (기본값 0)
    onChange(`0${newUnit}`);
  };

  // auto 등 키워드 단위인지 확인
  const isKeywordUnit = ["auto", "inherit", "none"].includes(unit);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-1.5">
        {/* 숫자 입력 */}
        <input
          type="text"
          value={numValue}
          onChange={handleInputChange}
          disabled={isKeywordUnit}
          className={cn(
            "w-16 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400",
            isKeywordUnit && "opacity-50 cursor-not-allowed",
          )}
          placeholder={placeholder || "0"}
        />

        {/* 단위 선택 */}
        <select
          value={unit}
          onChange={handleUnitChange}
          className="rounded border border-zinc-300 bg-white px-1.5 py-1 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}