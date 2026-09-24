import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router';
import { Skeleton } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useUi } from '@/stores/ui-context';
import { cn } from '@/utils/cn';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { PageContainer } from './PageContainer';

// Scanner (kèm zxing-wasm) và form cập nhật chỉ tải khi mở (05_FRONTEND §15)
const ScannerModal = lazy(() =>
  import('@/features/qr/components/ScannerModal').then((module) => ({
    default: module.ScannerModal,
  })),
);
const UpdateTreeModal = lazy(() =>
  import('@/features/updates/components/UpdateTreeModal').then((module) => ({
    default: module.UpdateTreeModal,
  })),
);

/** Layout DUY NHẤT của app. Ngoại lệ duy nhất là /login (căn giữa, không sidebar). */
export function AppLayout() {
  const { scannerOpen, closeScanner, updateCode, closeUpdate, sidebarCollapsed } = useUi();

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      {/* Sidebar desktop cao hết màn hình (chứa logo) → header + nội dung chừa lề theo độ rộng sidebar */}
      <div
        className={cn(
          'transition-[padding] duration-200 ease-out motion-reduce:transition-none',
          sidebarCollapsed ? 'lg:pl-18' : 'lg:pl-64',
        )}
      >
        <Header />

        <main className="pb-20 md:pb-0">
          <ErrorBoundary area="nội dung trang">
            <Suspense
              fallback={
                <PageContainer>
                  <Skeleton className="mb-4 h-10 w-64" />
                  <Skeleton className="h-64 w-full" />
                </PageContainer>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <MobileBottomNav />

      <Suspense fallback={null}>
        {scannerOpen && <ScannerModal open onClose={closeScanner} />}
        {updateCode && <UpdateTreeModal code={updateCode} onClose={closeUpdate} />}
      </Suspense>
    </div>
  );
}
