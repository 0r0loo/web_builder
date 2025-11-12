import { useEffect, useRef } from "react";
import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";

/**
 * react-hook-form과 Zustand를 통합하는 커스텀 훅
 * 폼 변경사항을 디바운스하여 Zustand 스토어에 업데이트
 */
export function useDebouncedForm<TFieldValues extends Record<string, unknown>>(
  options: UseFormProps<TFieldValues> & {
    onSubmit: (data: TFieldValues) => void;
    debounceMs?: number;
  },
): UseFormReturn<TFieldValues> {
  const { onSubmit, debounceMs = 300, ...formOptions } = options;
  const form = useForm<TFieldValues>(formOptions);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // watch all form values
  const formValues = form.watch();

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced submission
    timeoutRef.current = setTimeout(() => {
      const data = form.getValues();
      onSubmit(data);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formValues, form, onSubmit, debounceMs]);

  return form;
}