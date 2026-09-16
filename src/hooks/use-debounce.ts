import { useEffect, useState } from 'react';

/** Trì hoãn giá trị ô tìm kiếm — tránh lọc lại mỗi phím gõ */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
