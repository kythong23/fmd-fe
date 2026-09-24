import { Camera } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DateText } from '@/components/shared/DateText';
import { useTreeHistory } from '@/hooks/tree-queries';

/**
 * Ảnh tình trạng hiện tại = ảnh của lần cập nhật gần nhất có chụp ảnh (history sort mới → cũ).
 * Luôn ghi rõ ngày chụp: lần cập nhật mới nhất có thể không kèm ảnh.
 */
export function TreeStatusPhotos({ code }: { code: string }) {
  const query = useTreeHistory(code);
  const record = query.data?.find((item) => item.images.length > 0);

  return (
    <Card>
      <Card.Header>
        <Card.Title>Ảnh tình trạng hiện tại</Card.Title>
      </Card.Header>

      {query.isPending ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      ) : !record ? (
        <p className="flex items-center gap-2 text-body-sm text-text-muted">
          <Camera aria-hidden className="size-5 shrink-0" />
          {query.isError
            ? 'Không tải được ảnh tình trạng.'
            : 'Chưa có ảnh tình trạng. Chụp ảnh khi "Cập nhật tình trạng" để hiện ở đây.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-muted">
            {record.status && <StatusBadge status={record.status} />}
            <span>
              Chụp <DateText value={record.occurredAt} variant="relative" /> · {record.performer}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {record.images.map((url, index) => (
              <a
                key={url.slice(0, 64) + index}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={'Mở ảnh tình trạng ' + (index + 1)}
                className="overflow-hidden rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <img
                  src={url}
                  alt={'Ảnh tình trạng ' + (index + 1)}
                  width={200}
                  height={200}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </a>
            ))}
          </div>
          {record.description && (
            <p className="text-body-sm text-text-secondary">{record.description}</p>
          )}
        </div>
      )}
    </Card>
  );
}
