import { createContext, use, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface UiValue {
  /** Mã cây đang mở form cập nhật, null là đóng */
  updateCode: string | null;
  openUpdate: (code: string) => void;
  closeUpdate: () => void;
  scannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
}

const UiContext = createContext<UiValue | null>(null);

/**
 * Giữ 2 overlay dùng chung toàn app (form cập nhật, scanner QR). Nhờ vậy page ở
 * features/trees, features/map mở được chúng mà không import chéo feature (05_FRONTEND §2).
 */
export function UiProvider({ children }: { children: ReactNode }) {
  const [updateCode, setUpdateCode] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const value = useMemo<UiValue>(
    () => ({
      updateCode,
      openUpdate: setUpdateCode,
      closeUpdate: () => setUpdateCode(null),
      scannerOpen,
      openScanner: () => setScannerOpen(true),
      closeScanner: () => setScannerOpen(false),
    }),
    [updateCode, scannerOpen],
  );

  return <UiContext value={value}>{children}</UiContext>;
}

export function useUi(): UiValue {
  const value = use(UiContext);
  if (!value) throw new Error('useUi phải nằm trong UiProvider');
  return value;
}
