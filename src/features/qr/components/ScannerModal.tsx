import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CameraOff, Search } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { useQrScanner } from '../hooks/use-qr-scanner';

export interface ScannerModalProps {
  open: boolean;
  onClose: () => void;
}

/** Lấy mã cây từ URL trong QR; chấp nhận cả khi người dùng gõ tay mã */
function extractCode(text: string): string | null {
  const trimmed = text.trim();
  const match = /\/tree\/([A-Za-z0-9_-]+)/.exec(trimmed);
  if (match) return match[1].toUpperCase();
  if (/^[A-Za-z]{2}-\d{3,}$/.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

export function ScannerModal({ open, onClose }: ScannerModalProps) {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function goToTree(raw: string) {
    const code = extractCode(raw);
    if (!code) {
      setError('Mã đọc được không đúng định dạng: "' + raw + '". Thử quét lại hoặc nhập tay.');
      return;
    }
    onClose();
    navigate(ROUTES.tree(code));
  }

  const { videoRef, state } = useQrScanner(goToTree);

  const cameraFailed = state === 'denied' || state === 'unsupported' || state === 'error';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quét mã QR trên cây"
      description="Đưa camera vào thẻ QR dán tại gốc cây. Không quét được thì nhập mã bên dưới."
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-text-primary">
          <video
            ref={videoRef}
            muted
            playsInline
            className="size-full object-cover"
            aria-label="Khung hình camera"
          />
          {cameraFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-sunken p-4 text-center">
              <CameraOff aria-hidden className="size-6 text-text-muted" />
              <p className="text-body-sm font-semibold text-text-primary">
                {state === 'denied' ? 'Trình duyệt đang chặn camera' : 'Không dùng được camera'}
              </p>
              <p className="text-caption text-text-secondary">
                {state === 'denied'
                  ? 'Mở phần cài đặt quyền của trình duyệt, cho phép camera rồi mở lại. Trong lúc đó bạn vẫn nhập mã tay được.'
                  : 'Máy này không có camera sau dùng được. Nhập mã cây ở ô bên dưới.'}
              </p>
            </div>
          )}
          {state === 'starting' && (
            <p className="absolute inset-x-0 bottom-3 text-center text-caption text-text-inverse">
              Đang mở camera…
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-body-sm font-medium text-error">
            {error}
          </p>
        )}

        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            goToTree(manualCode);
          }}
        >
          <Input
            label="Nhập mã cây thủ công"
            placeholder="SD-001"
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value)}
            containerClassName="flex-1"
          />
          <Button type="submit" disabled={!manualCode.trim()} leftIcon={<Search className="size-5" />}>
            Mở
          </Button>
        </form>
      </div>
    </Modal>
  );
}
