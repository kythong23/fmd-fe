import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@/styles/index.css';
import { Providers } from './providers';
import { router } from './router';

const container = document.getElementById('root');
if (!container) throw new Error('Không tìm thấy #root trong index.html');

createRoot(container).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
