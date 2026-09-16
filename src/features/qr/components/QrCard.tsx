import { Download, FileCode2 } from 'lucide-react';
import { Button, Checkbox, Skeleton } from '@/components/ui';
import { downloadFile, qrSvg, treeQrUrl } from '@/utils/qr';
import type { Tree } from '@/types';
import { useQrImage } from '../hooks/use-qr-image';

export interface QrCardProps {
  tree: Tree;
  selected: boolean;
  onToggle: (code: string) => void;
}

export function QrCard({ tree, selected, onToggle }: QrCardProps) {
  const { dataUrl, error } = useQrImage(tree.code);

  async function downloadSvg() {
    const svg = await qrSvg(tree.code);
    downloadFile(tree.code + '.svg', svg, 'image/svg+xml');
  }

  return (
    <div
      data-print-card
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center"
    >
      <div data-print-hide className="self-start">
        <Checkbox
          label={'Chọn ' + tree.code}
          checked={selected}
          onChange={() => onToggle(tree.code)}
        />
      </div>

      {error ? (
        <p className="py-8 text-caption text-error">{error}</p>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt={'Mã QR của cây ' + tree.code}
          width={160}
          height={160}
          className="size-40"
        />
      ) : (
        <Skeleton className="size-40" />
      )}

      <p className="font-mono text-h4 font-extrabold text-text-primary">{tree.code}</p>
      <p className="text-caption text-text-secondary">
        {tree.variety} — Lô {tree.location.block}, hàng {tree.location.row}
      </p>
      <p className="text-caption break-all text-text-muted">{treeQrUrl(tree.code)}</p>

      <div data-print-hide className="mt-2 flex w-full gap-2">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          disabled={!dataUrl}
          onClick={() => dataUrl && downloadFile(tree.code + '.png', dataUrl, 'image/png')}
          leftIcon={<Download className="size-4" />}
        >
          PNG
        </Button>
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={downloadSvg}
          leftIcon={<FileCode2 className="size-4" />}
        >
          SVG
        </Button>
      </div>
    </div>
  );
}
