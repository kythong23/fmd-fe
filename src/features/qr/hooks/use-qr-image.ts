import { useEffect, useState } from 'react';
import { qrDataUrl } from '@/utils/qr';

/** Sinh ảnh QR cho 1 mã cây; trả null khi đang tạo hoặc lỗi */
export function useQrImage(code: string): { dataUrl: string | null; error: string | null } {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setDataUrl(null);
    setError(null);
    qrDataUrl(code)
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setError('Không tạo được mã QR cho ' + code);
      });
    return () => {
      active = false;
    };
  }, [code]);

  return { dataUrl, error };
}
