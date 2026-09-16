import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, MapPin } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Card, Checkbox, Input, Skeleton, StatusModal, useToast } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { ErrorState } from '@/components/shared/ErrorState';
import { DateText } from '@/components/shared/DateText';
import { useFarm, useUpdateBenchmark, useUpdateFarmSettings } from '@/hooks/tree-queries';
import { parseCoordinate } from '@/utils/coords';
import { ROUTES } from '@/constants/routes';

interface SettingsForm {
  name: string;
  techLead: string;
  estimatedTreeCount: number;
  offlineSyncEnabled: boolean;
}

export default function SettingsPage() {
  const toast = useToast();
  const farmQuery = useFarm();
  const settingsMutation = useUpdateFarmSettings();
  const benchmarkMutation = useUpdateBenchmark();
  const [coordinateInput, setCoordinateInput] = useState('');
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  const farm = farmQuery.data;

  const { register, handleSubmit, formState } = useForm<SettingsForm>({
    values: farm
      ? {
          name: farm.name,
          techLead: farm.techLead,
          estimatedTreeCount: farm.estimatedTreeCount,
          offlineSyncEnabled: farm.offlineSyncEnabled,
        }
      : undefined,
  });

  async function onSubmit(values: SettingsForm) {
    try {
      await settingsMutation.mutateAsync(values);
      setSaveResult('success');
    } catch {
      setSaveResult('error');
    }
  }

  async function onSaveBenchmark() {
    const point = parseCoordinate(coordinateInput);
    if (!point) {
      setCoordinateError(
        'Không đọc được tọa độ. Dán link Google Maps, "10.4604, 107.2165" hoặc dạng DMS.',
      );
      return;
    }
    setCoordinateError(null);
    await benchmarkMutation.mutateAsync({
      lat: point.lat,
      lng: point.lng,
      code: farm?.benchmark.code ?? 'M0-TT',
      name: farm?.benchmark.name ?? 'Mốc trắc địa trung tâm vườn',
      source: 'manual',
    });
    setCoordinateInput('');
    toast.success('Đã lưu mốc trắc địa trung tâm');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Cài đặt vườn"
        description="Thông tin chung và mốc trắc địa dùng cho bản đồ. Lưu về server, mọi tài khoản thấy như nhau."
        breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Cài đặt vườn' }]}
      />

      <StateBoundary
        isLoading={farmQuery.isPending}
        error={farmQuery.error}
        onRetry={() => farmQuery.refetch()}
        skeleton={<Skeleton className="h-96 w-full" />}
      >
        {farm && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <Card.Header>
                <Card.Title>Thông tin vườn</Card.Title>
              </Card.Header>

              {settingsMutation.isError && (
                <div className="mb-4">
                  <ErrorState
                    error={settingsMutation.error}
                    title="Lưu cài đặt thất bại"
                    onRetry={() => settingsMutation.reset()}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input label="Tên vườn" required {...register('name', { required: true })} />
                <Input label="Kỹ thuật viên trưởng ca" {...register('techLead')} />
                <Input
                  label="Tổng số cây vườn đang có"
                  type="number"
                  min={0}
                  error={formState.errors.estimatedTreeCount ? 'Nhập số cây hợp lệ (≥ 0)' : undefined}
                  {...register('estimatedTreeCount', { required: true, valueAsNumber: true, min: 0 })}
                />
                <Checkbox
                  label="Bật đồng bộ ngoại tuyến"
                  hint="Chuẩn bị cho giai đoạn 2 — MVP chưa xử lý hàng đợi offline."
                  {...register('offlineSyncEnabled')}
                />
                <Button
                  type="submit"
                  loading={settingsMutation.isPending || formState.isSubmitting}
                  leftIcon={<Save className="size-5" />}
                >
                  Lưu cài đặt
                </Button>
                <p className="text-caption text-text-muted">
                  Cập nhật gần nhất: <DateText value={farm.updatedAt} />
                </p>
              </form>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Mốc trắc địa trung tâm</Card.Title>
              </Card.Header>

              <dl className="mb-4 grid grid-cols-2 gap-3 text-body-sm">
                <div>
                  <dt className="text-caption text-text-muted">Mã mốc</dt>
                  <dd className="font-mono font-semibold">{farm.benchmark.code}</dd>
                </div>
                <div>
                  <dt className="text-caption text-text-muted">Hệ quy chiếu</dt>
                  <dd>{farm.benchmark.datum}</dd>
                </div>
                <div>
                  <dt className="text-caption text-text-muted">Vĩ độ</dt>
                  <dd className="font-mono">{farm.benchmark.lat.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-text-muted">Kinh độ</dt>
                  <dd className="font-mono">{farm.benchmark.lng.toFixed(6)}</dd>
                </div>
                <div>
                  <dt className="text-caption text-text-muted">Số thửa / tờ bản đồ</dt>
                  <dd>{farm.benchmark.plotNumber}</dd>
                </div>
                <div>
                  <dt className="text-caption text-text-muted">Cao độ</dt>
                  <dd className="font-mono">
                    {farm.benchmark.elevationMeters === null
                      ? '—'
                      : farm.benchmark.elevationMeters + ' m'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-caption text-text-muted">Địa chỉ</dt>
                  <dd>{farm.benchmark.address}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-caption text-text-muted">Kinh tuyến trục</dt>
                  <dd>{farm.benchmark.zone}</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-3">
                <Input
                  label="Đặt lại mốc trung tâm"
                  hint='Dán link Google Maps, "10.4604, 107.2165" hoặc dạng DMS.'
                  leftIcon={<MapPin className="size-5" />}
                  value={coordinateInput}
                  error={coordinateError ?? undefined}
                  onChange={(event) => setCoordinateInput(event.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={onSaveBenchmark}
                  loading={benchmarkMutation.isPending}
                  disabled={!coordinateInput.trim()}
                >
                  Lưu mốc trắc địa
                </Button>
                {benchmarkMutation.isError && (
                  <ErrorState
                    error={benchmarkMutation.error}
                    title="Lưu mốc thất bại"
                    onRetry={() => benchmarkMutation.reset()}
                  />
                )}
                <p className="text-caption text-text-muted">
                  Điểm neo ảnh nền: {farm.mapLayers.anchors.map((anchor) => anchor.label).join(' • ')}
                </p>
              </div>
            </Card>
          </div>
        )}
      </StateBoundary>

      <StatusModal
        open={saveResult !== null}
        tone={saveResult === 'error' ? 'error' : 'success'}
        title={saveResult === 'error' ? 'Lưu cài đặt thất bại' : 'Đã lưu cài đặt vườn!'}
        description={
          saveResult === 'error'
            ? (settingsMutation.error?.message ?? 'Thử lại sau ít phút hoặc báo quản trị viên.')
            : 'Thông tin vườn đã cập nhật cho mọi tài khoản đang dùng.'
        }
        actionLabel={saveResult === 'error' ? 'Thử lại' : undefined}
        onAction={() => {
          setSaveResult(null);
          void handleSubmit(onSubmit)();
        }}
        onClose={() => setSaveResult(null)}
      />
    </PageContainer>
  );
}
