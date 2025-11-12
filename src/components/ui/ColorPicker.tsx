"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils/cn";
import "./ColorPicker.css";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

/**
 * Color Picker 컴포넌트
 * react-colorful 기반의 컬러 선택기
 */
export function ColorPicker({
  value,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "#000000");
  const pickerRef = useRef<HTMLDivElement>(null);

  // value가 변경되면 inputValue도 업데이트
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Hex 값 검증
  const isValidHex = (hex: string) => {
    return /^#[0-9A-F]{6}$/i.test(hex);
  };

  // Input 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  };

  // Picker 변경 핸들러
  const handlePickerChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} ref={pickerRef}>
      {label && (
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Color Preview Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 rounded border-2 border-zinc-300 transition-all hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
          style={{ backgroundColor: inputValue }}
          title="색상 선택"
        />

        {/* Hex Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Color Picker Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-10 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
          <HexColorPicker color={inputValue} onChange={handlePickerChange} />

          {/* Preset Colors */}
          <div className="mt-3 grid grid-cols-8 gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handlePickerChange(color)}
                className="h-6 w-6 rounded border border-zinc-300 transition-transform hover:scale-110 dark:border-zinc-600"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 프리셋 컬러 팔레트
 */
const PRESET_COLORS = [
  // Grays
  "#000000",
  "#4B5563",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#E5E7EB",
  "#F3F4F6",
  "#FFFFFF",
  // Primary Colors
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  // Secondary Colors
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
];