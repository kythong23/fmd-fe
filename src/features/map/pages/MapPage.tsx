import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Minus, Move, Plus, RotateCcw, ZoomIn } from 'lucide-react';
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
  { key: 'facilities', label: 'Công trình / Nhà ở' },
  { key: 'roads', label: 'Đường giao thông' },
  { key: 'trees', label: 'Cây sầu riêng' },
];

const DEFAULT_LAYERS: Record<MapLayerKey, boolean> = {
  boundary: true,
  beds: false,
  canals: false,
  roads: true,
  reservoir: false,
  facilities: true,
  trees: true,
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export default function MapPage() {
  const navigate = useNavigate();
  const farmQuery = useFarm();
  const treesQuery = useTrees();
  const [visible, setVisible] = useState(DEFAULT_LAYERS);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const isDragging = useRef(false);
  const startDrag = useRef({ x: 0, y: 0 });
  const startPan = useRef({ x: 0, y: 0 });

  const trees = useMemo(() => treesQuery.data ?? [], [treesQuery.data]);
  const selectedTree = trees.find((tree) => tree.code === selectedCode) ?? null;

  const handleZoomIn = useCallback(() => {
    setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(2))));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Kéo pan bản đồ: cho phép pan tự do, không bị chặn quá ngặt khi zoom = 1
  const clamp = useCallback((value: number, limit: number) => {
    return Math.min(limit, Math.max(-limit, value));
  }, []);

  // Tính toán viewBox theo zoom và pan: cho phép pan rộng rãi (tối thiểu 600px ngay cả khi zoom 1)
  const viewBox = useMemo(() => {
    const box = farmQuery.data?.mapLayers.viewBox;
    if (!box) return undefined;
    const w = box.width / zoom;
    const h = box.height / zoom;
    // Cho phép pan tự do xung quanh bản đồ
    const maxPanX = Math.max(600, box.width * 0.8 + (box.width - w) / 2);
    const maxPanY = Math.max(450, box.height * 0.8 + (box.height - h) / 2);
    const minX = (box.width - w) / 2 - clamp(pan.x, maxPanX);
    const minY = (box.height - h) / 2 - clamp(pan.y, maxPanY);
    return `${minX} ${minY} ${w} ${h}`;
  }, [farmQuery.data, zoom, pan, clamp]);

  // Zoom CHỈ khi giữ phím Shift + lăn chuột.
  // ponytail: callback ref thay useEffect vì khung bản đồ chỉ mount sau khi query xong,
  // lúc effect chạy lần đầu ref vẫn null nên listener không bao giờ được gắn.
  const wheelCleanup = useRef<(() => void) | null>(null);
  const stageRef = useCallback((node: HTMLDivElement | null) => {
    wheelCleanup.current?.();
    wheelCleanup.current = null;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      const delta = e.deltaY || e.deltaX;
      setZoom((z) =>
        delta < 0
          ? Math.min(MAX_ZOOM, Number((z + 0.15).toFixed(2)))
          : Math.max(MIN_ZOOM, Number((z - 0.15).toFixed(2))),
      );
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    wheelCleanup.current = () => node.removeEventListener('wheel', onWheel);
  }, []);

  // Lắng nghe di chuyển chuột trên toàn window khi đang kéo (drag mượt mà không bị khựng khi chuột ra ngoài div)
  const [isPointerDown, setIsPointerDown] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ kích hoạt khi click chuột trái
    if (e.button !== 0) return;
    isDragging.current = true;
    setIsPointerDown(true);
    startDrag.current = { x: e.clientX, y: e.clientY };
    startPan.current = { ...pan };
  }, [pan]);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const currentZoom = zoomRef.current;
      const dx = (e.clientX - startDrag.current.x) / currentZoom;
      const dy = (e.clientY - startDrag.current.y) / currentZoom;
      setPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setIsPointerDown(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Hỗ trợ Touch trên thiết bị di động: pan 1 ngón, pinch-zoom 2 ngón
  const lastTouchDistance = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && e.touches[0]) {
      isDragging.current = true;
      setIsPointerDown(true);
      startDrag.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startPan.current = { ...pan };
      lastTouchDistance.current = null;
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      isDragging.current = false;
      setIsPointerDown(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      lastTouchDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging.current && e.touches[0]) {
      const dx = (e.touches[0].clientX - startDrag.current.x) / zoom;
      const dy = (e.touches[0].clientY - startDrag.current.y) / zoom;
      setPan({
        x: startPan.current.x + dx,
        y: startPan.current.y + dy,
      });
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (lastTouchDistance.current !== null && lastTouchDistance.current > 0) {
        const factor = distance / lastTouchDistance.current;
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z * factor).toFixed(2)))));
      }
      lastTouchDistance.current = distance;
    }
  }, [zoom]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    setIsPointerDown(false);
    lastTouchDistance.current = null;
  }, []);

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden px-3 py-2 sm:px-5 sm:py-3 lg:px-6">
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-h3 font-extrabold tracking-tight text-text-primary">Bản đồ vườn</h1>
          <p className="text-caption text-text-muted">
            Kéo để di chuyển • Giữ <kbd className="rounded bg-surface-sunken px-1 font-mono text-xs font-semibold text-text-secondary">Shift</kbd> + lăn chuột hoặc chụm 2 ngón để zoom.
          </p>
        </div>
      </div>

      <StateBoundary
        isLoading={farmQuery.isPending || treesQuery.isPending}
        error={farmQuery.error ?? treesQuery.error}
        onRetry={() => {
          void farmQuery.refetch();
          void treesQuery.refetch();
        }}
        skeleton={<Skeleton className="h-full w-full flex-1" />}
      >
        {farmQuery.data && (
          <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1fr_20rem]">
            {/* Cột bản đồ chính: stretch tối đa chiều rộng màn hình, fit trọn chiều cao */}
            <Card padding="sm" className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Thanh công cụ Zoom & Phím bấm */}
              <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-1.5">
                <div className="flex items-center gap-2 text-caption text-text-secondary">
                  <span className="flex items-center gap-1 font-medium">
                    <Move className="size-3.5 text-text-muted" /> Kéo để di chuyển
                  </span>
                  <span className="text-text-muted">•</span>
                  <span className="hidden sm:inline">Shift + Lăn chuột để zoom</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconOnly
                    aria-label="Thu nhỏ"
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    title="Thu nhỏ (Zoom Out)"
                  >
                    <Minus aria-hidden className="size-4" />
                  </Button>

                  <div className="flex items-center gap-1 px-1 font-mono text-caption font-semibold text-text-primary sm:text-body-sm">
                    <ZoomIn className="size-3.5 text-text-muted" />
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>

                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    aria-label="Thanh trượt mức zoom"
                    className="hidden h-1.5 w-16 cursor-pointer accent-primary sm:block md:w-24"
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    iconOnly
                    aria-label="Phóng to"
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    title="Phóng to (Zoom In)"
                  >
                    <Plus aria-hidden className="size-4" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleReset}
                    leftIcon={<RotateCcw className="size-3.5" />}
                    title="Đặt lại mức thu phóng và vị trí ban đầu"
                  >
                    Mặc định
                  </Button>
                </div>
              </div>

              {/* Khung chứa SVG bản đồ tràn viền, nắm kéo hoặc Shift + cuộn chuột */}
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="application" là đúng ngữ nghĩa cho canvas pan/zoom; thao tác bàn phím đã có ở nút Zoom +/- và Mặc định */}
              <div
                ref={stageRef}
                role="application"
                aria-label="Khung bản đồ: kéo để di chuyển, Shift + lăn chuột để thu phóng"
                className={`relative min-h-0 w-full flex-1 touch-none overflow-hidden rounded-md bg-[#5c6551] select-none ${
                  isPointerDown ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                <FarmMapSvg
                  layers={farmQuery.data.mapLayers}
                  trees={trees}
                  visible={visible}
                  viewBox={viewBox}
                  selectedCode={selectedCode}
                  onSelectTree={setSelectedCode}
                  className="size-full select-none"
                />
              </div>

              <div className="shrink-0">
                <MapLegend />
              </div>
            </Card>

            {/* Cột thông tin phụ bên phải */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              <Card padding="sm" className="shrink-0">
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
    </div>
  );
}
