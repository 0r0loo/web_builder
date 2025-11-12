"use client";

import { useState, useEffect } from "react";
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
 * Unit Input 컴포넌트
 * 숫자 입력 + 단위 선택이 가능한 입력 필드
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
  const [numValue, setNumValue] = useState("");
  const [unit, setUnit] = useState("px");

  // value 파싱 (예: "16px", "50%", "auto")
  useEffect(() => {
    if (value === undefined || value === "") {
      if (numValue !== "" || unit !== (units[0] || "px")) {
        setNumValue("");
        setUnit(units[0] || "px");
      }
      return;
    }

    const stringValue = String(value);

    // auto, inherit 등 키워드 값인 경우
    if (units.includes(stringValue)) {
      if (numValue !== "" || unit !== stringValue) {
        setNumValue("");
        setUnit(stringValue);
      }
      return;
    }

    // 숫자 + 단위 파싱
    const match = stringValue.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|vw|vh|auto)?$/);
    if (match) {
      const parsedNum = match[1];
      const parsedUnit = match[2] || units[0] || "px";
      if (numValue !== parsedNum || unit !== parsedUnit) {
        setNumValue(parsedNum);
        setUnit(parsedUnit);
      }
    } else {
      if (numValue !== "" || unit !== (units[0] || "px")) {
        setNumValue("");
        setUnit(units[0] || "px");
      }
    }
  }, [value, units, numValue, unit]);

  // 값 변경 핸들러
  const handleValueChange = (newValue: string, newUnit: string = unit) => {
    setNumValue(newValue);
    setUnit(newUnit);

    // auto, inherit 등 키워드 단위인 경우
    if (units.includes(newUnit) && ["auto", "inherit", "none"].includes(newUnit)) {
      onChange(newUnit);
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
      onChange(`${numericValue}${newUnit}`);
    }
  };

  // 텍스트 입력 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    handleValueChange(newValue);
  };

  // 단위 변경
  const handleUnitChange = (newUnit: string) => {
    // auto, inherit 등 키워드 단위인 경우
    if (["auto", "inherit", "none"].includes(newUnit)) {
      setNumValue("");
      onChange(newUnit);
      setUnit(newUnit);
      return;
    }

    handleValueChange(numValue, newUnit);
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
          onChange={(e) => handleUnitChange(e.target.value)}
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