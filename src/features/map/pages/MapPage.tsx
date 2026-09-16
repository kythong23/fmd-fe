import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Card, Checkbox, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { FarmMapSvg } from '@/components/shared/FarmMapSvg';
import type { MapLayerKey } from '@/components/shared/FarmMapSvg';
import { useFarm, useTrees } from '@/hooks/tree-queries';
import { ROUTES } from '@/constants/routes';
import { TreeQuickPanel } from '../components/TreeQuickPanel';
import { MapLegend } from '../components/MapLegend';

const LAYER_LABELS: Array<{ key: MapLayerKey; label: string }> = [
  { key: 'boundary', label: 'Ranh giới thửa' },
  { key: 'beds', label: 'Liếp trồng' },
  { key: 'canals', label: 'Mương nước' },
  { key: 'roads', label: 'Đường nội bộ' },
  { key: 'reservoir', label: 'Hồ trữ nước' },
  { key: 'facilities', label: 'Tiện ích' },
  { key: 'trees', label: 'Cây' },
];

const DEFAULT_LAYERS: Record<MapLayerKey, boolean> = {
  boundary: true,
  beds: true,
  canals: true,
  roads: true,
  reservoir: true,
  facilities: true,
  trees: true,
};

export default function MapPage() {
  const navigate = useNavigate();
  const farmQuery = useFarm();
  const treesQuery = useTrees();
  const [visible, setVisible] = useState(DEFAULT_LAYERS);
  const [zoom, setZoom] = useState(1);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const trees = useMemo(() => treesQuery.data ?? [], [treesQuery.data]);
  const selectedTree = trees.find((tree) => tree.code === selectedCode) ?? null;

  // Zoom bằng viewBox — giữ nét ở mọi mức phóng, không cần canvas
  const viewBox = useMemo(() => {
    const box = farmQuery.data?.mapLayers.viewBox;
    if (!box) return undefined;
    const width = box.width / zoom;
    const height = box.height / zoom;
    return (box.width - width) / 2 + ' ' + (box.height - height) / 2 + ' ' + width + ' ' + height;
  }, [farmQuery.data, zoom]);

  return (
    <PageContainer>
      <PageHeader
        title="Bản đồ vườn"
        description="MVP chỉ xem vị trí cây. Kéo-thả đổi vị trí thuộc giai đoạn 2."
        breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Bản đồ vườn' }]}
      />

      <StateBoundary
        isLoading={farmQuery.isPending || treesQuery.isPending}
        error={farmQuery.error ?? treesQuery.error}
        onRetry={() => {
          void farmQuery.refetch();
          void treesQuery.refetch();
        }}
        skeleton={<Skeleton className="h-120 w-full" />}
      >
        {farmQuery.data && (
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <Card padding="sm">
              <div className="mb-2 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label="Thu nhỏ"
                  onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
                >
                  <Minus aria-hidden className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label="Phóng to"
                  onClick={() => setZoom((value) => Math.min(4, value + 0.25))}
                >
                  <Plus aria-hidden className="size-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setZoom(1)}
                  leftIcon={<RotateCcw className="size-4" />}
                >
                  Về mặc định
                </Button>
              </div>

              <FarmMapSvg
                layers={farmQuery.data.mapLayers}
                trees={trees}
                visible={visible}
                viewBox={viewBox}
                selectedCode={selectedCode}
                onSelectTree={setSelectedCode}
                className="h-104 w-full touch-pan-y lg:h-140"
              />

              <MapLegend />
            </Card>

            <div className="flex flex-col gap-4">
              <Card padding="sm">
                <Card.Header>
                  <Card.Title>Lớp hiển thị</Card.Title>
                </Card.Header>
                <div className="flex flex-col gap-2">
                  {LAYER_LABELS.map((layer) => (
                    <Checkbox
                      key={layer.key}
                      label={layer.label}
                      checked={visible[layer.key]}
                      onChange={(event) =>
                        setVisible((current) => ({
                          ...current,
                          [layer.key]: event.target.checked,
                        }))
                      }
                    />
                  ))}
                </div>
              </Card>

              <TreeQuickPanel
                tree={selectedTree}
                onOpen={(code) => navigate(ROUTES.tree(code))}
                onClose={() => setSelectedCode(null)}
              />
            </div>
          </div>
        )}
      </StateBoundary>
    </PageContainer>
  );
}
