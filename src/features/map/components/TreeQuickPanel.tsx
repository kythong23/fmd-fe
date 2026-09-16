import { ExternalLink, MousePointerClick, X } from 'lucide-react';
import durianTreeImg from '@/assets/durian-tree.png';
import { Button, Card } from '@/components/ui';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { DateText } from '@/components/shared/DateText';
import { STATUS_CONFIG } from '@/constants/status-config';
import { formatNumber, formatText } from '@/utils/format';
import type { Tree } from '@/types';

export interface TreeQuickPanelProps {
  tree: Tree | null;
  onOpen: (code: string) => void;
  onClose: () => void;
}

export function TreeQuickPanel({ tree, onOpen, onClose }: TreeQuickPanelProps) {
  if (!tree) {
    return (
      <Card padding="sm">
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <MousePointerClick aria-hidden className="size-6 text-text-muted" />
          <p className="text-body-sm font-semibold text-text-primary">Chưa chọn cây nào</p>
          <p className="text-caption text-text-secondary">
            Chạm vào một cây trên bản đồ để xem nhanh tình trạng của nó.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <Card.Header>
        <div className="flex items-center gap-3">
          <div
            className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-surface-sunken shadow-sm"
            style={{ borderColor: STATUS_CONFIG[tree.status].colorVar }}
          >
            <img
              src={durianTreeImg}
              alt={tree.code}
              className="size-full scale-110 object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-h3 font-extrabold text-text-primary">{tree.code}</p>
            <p className="text-caption text-text-secondary">{tree.variety}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconOnly aria-label="Bỏ chọn cây" onClick={onClose}>
          <X aria-hidden className="size-4" />
        </Button>
      </Card.Header>

      <div className="flex flex-col gap-3">
        <StatusBadge status={tree.status} size="md" />
        <HealthScore score={tree.healthScore} variant="block" />
        <dl className="grid grid-cols-2 gap-2 text-caption">
          <div>
            <dt className="text-text-muted">Vị trí</dt>
            <dd className="text-text-primary">
              Lô {tree.location.block} — hàng {tree.location.row}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Liếp</dt>
            <dd className="text-text-primary">{formatText(tree.location.bedName)}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Độ ẩm đất</dt>
            <dd className="text-text-primary">{formatNumber(tree.soilMoisture, '%')}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Cập nhật</dt>
            <dd className="text-text-primary">
              <DateText value={tree.lastUpdated} variant="relative" />
            </dd>
          </div>
        </dl>
        <Button
          fullWidth
          onClick={() => onOpen(tree.code)}
          leftIcon={<ExternalLink className="size-5" />}
        >
          Mở hồ sơ cây
        </Button>
      </div>
    </Card>
  );
}
