import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import '@/styles/index.css';
import { Providers } from './providers';
import { router } from './router';

// ponytail: dev-only — CSS đã clip tràn ngang, đoạn này để không giấu luôn nguyên nhân.
// Mở console ở viewport mobile, log ra đúng element nào rộng hơn màn hình.
if (import.meta.env.DEV) {
  const findOverflow = () => {
    const limit = document.documentElement.clientWidth;
    const guilty = [...document.querySelectorAll<HTMLElement>('body *')].filter(
      (el) => el.getBoundingClientRect().right > limit + 1,
    );
    if (guilty.length) console.warn('[overflow-x] tràn ngang ở ' + limit + 'px:', guilty);
    return guilty;
  };
  window.addEventListener('load', () => setTimeout(findOverflow, 500));
  (window as unknown as { findOverflow: typeof findOverflow }).findOverflow = findOverflow;
}

const container = document.getElementById('root');
if (!container) throw new Error('Không tìm thấy #root trong index.html');

createRoot(container).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
