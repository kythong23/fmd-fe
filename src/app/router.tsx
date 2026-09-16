import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/components/RequireAuth';
import { ROUTES } from '@/constants/routes';

// Lazy theo route — bundle đầu nhẹ (05_FRONTEND §15)
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const ForbiddenPage = lazy(() => import('@/features/auth/pages/ForbiddenPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const TreeListPage = lazy(() => import('@/features/trees/pages/TreeListPage'));
const TreePassportPage = lazy(() => import('@/features/trees/pages/TreePassportPage'));
const TreeHistoryPage = lazy(() => import('@/features/trees/pages/TreeHistoryPage'));
const MapPage = lazy(() => import('@/features/map/pages/MapPage'));
const QrManagementPage = lazy(() => import('@/features/qr/pages/QrManagementPage'));
const ActivityPage = lazy(() => import('@/features/activity/pages/ActivityPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/features/auth/pages/NotFoundPage'));
const DevUiPage = lazy(() => import('@/features/dev/DevUiPage'));

/** createBrowserRouter — QR trỏ path thật /tree/:code, không hash (09_DECISIONS D2) */
export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.trees, element: <TreeListPage /> },
          { path: '/tree/:code', element: <TreePassportPage /> },
          { path: '/tree/:code/history', element: <TreeHistoryPage /> },
          { path: ROUTES.map, element: <MapPage /> },
          { path: ROUTES.activity, element: <ActivityPage /> },
          { path: ROUTES.forbidden, element: <ForbiddenPage /> },
          ...(import.meta.env.DEV ? [{ path: '/dev/ui', element: <DevUiPage /> }] : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth permission="qr:manage" />,
    children: [
      { element: <AppLayout />, children: [{ path: ROUTES.qr, element: <QrManagementPage /> }] },
    ],
  },
  {
    element: <RequireAuth permission="farm:settings" />,
    children: [
      {
        element: <AppLayout />,
        children: [{ path: ROUTES.settings, element: <SettingsPage /> }],
      },
    ],
  },
]);
