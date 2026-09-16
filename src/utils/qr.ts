import QRCode from 'qrcode';

const PUBLIC_URL: string = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

/** QR chỉ chứa URL, không chứa dữ liệu nghiệp vụ (02_ARCHITECTURE §4) */
export function treeQrUrl(code: string): string {
  return `${PUBLIC_URL.replace(/\/$/, '')}/tree/${code}`;
}

/** Mức sửa lỗi H — thẻ ngoài vườn bị bẩn/mờ vẫn quét được (05_FRONTEND §6.8) */
function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

// Màu lấy từ token, không hard-code: đổi --color-primary là QR đổi theo
const OPTIONS = () => ({
  errorCorrectionLevel: 'H' as const,
  width: 320,
  margin: 1,
  color: { dark: token('--color-primary', '#047857'), light: token('--color-surface', '#ffffff') },
});

export function qrDataUrl(code: string): Promise<string> {
  return QRCode.toDataURL(treeQrUrl(code), OPTIONS());
}

export function qrSvg(code: string): Promise<string> {
  return QRCode.toString(treeQrUrl(code), { ...OPTIONS(), type: 'svg' });
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const url = mime === 'image/png' ? content : URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  if (mime !== 'image/png') URL.revokeObjectURL(url);
}
