import { createContext, use, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface UiValue {
  /** Mã cây đang mở form cập nhật, null là đóng */
  updateCode: string | null;
  openUpdate: (code: string) => void;
  closeUpdate: () => void;
  scannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  /** Sidebar desktop thu gọn chỉ còn icon — nhớ theo máy */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  expandSidebar: () => void;
}

const SIDEBAR_KEY = 'fdm.sidebar-collapsed';

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0');
  } catch {
    // localStorage bị chặn: chỉ mất phần ghi nhớ, sidebar vẫn chạy
  }
}

const UiContext = createContext<UiValue | null>(null);

/**
 * Giữ 2 overlay dùng chung toàn app (form cập nhật, scanner QR). Nhờ vậy page ở
 * features/trees, features/map mở được chúng mà không import chéo feature (05_FRONTEND §2).
 */
export function UiProvider({ children }: { children: ReactNode }) {
  const [updateCode, setUpdateCode] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

  useEffect(() => writeSidebarCollapsed(sidebarCollapsed), [sidebarCollapsed]);

  const value = useMemo<UiValue>(
    () => ({
      updateCode,
      openUpdate: setUpdateCode,
      closeUpdate: () => setUpdateCode(null),
      scannerOpen,
      openScanner: () => setScannerOpen(true),
      closeScanner: () => setScannerOpen(false),
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((collapsed) => !collapsed),
      expandSidebar: () => setSidebarCollapsed(false),
    }),
    [updateCode, scannerOpen, sidebarCollapsed],
  );

  return <UiContext value={value}>{children}</UiContext>;
}

export function useUi(): UiValue {
  const value = use(UiContext);
  if (!value) throw new Error('useUi phải nằm trong UiProvider');
  return value;
}
