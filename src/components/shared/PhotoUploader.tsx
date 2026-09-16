import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { uploadsService } from '@/services/uploads.service';
import { toAppError } from '@/services/http';

export interface PhotoUploaderProps {
  /** URL đã upload — đây mới là dữ liệu lưu, không phải blob preview */
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
}

export function PhotoUploader({ value, onChange, max = 4, disabled }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const room = max - value.length;
      const picked = Array.from(files).slice(0, Math.max(0, room));
      const urls = await Promise.all(picked.map((file) => uploadsService.upload(file)));
      onChange([...value, ...urls]);
    } catch (cause) {
      setError(toAppError(cause).message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const full = value.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label font-semibold text-text-primary">
        Ảnh minh chứng
        <span className="ml-1 font-normal text-text-muted">
          (tùy chọn, tối đa {max} ảnh)
        </span>
      </span>

      <div className="flex flex-wrap gap-2">
        {value.map((url, index) => (
          <div
            key={url.slice(0, 64) + index}
            className="relative size-24 overflow-hidden rounded-md border border-border"
          >
            <img
              src={url}
              alt={'Ảnh minh chứng ' + (index + 1)}
              width={96}
              height={96}
              loading="lazy"
              className="size-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <button
              type="button"
              aria-label={'Xóa ảnh ' + (index + 1)}
              disabled={disabled}
              onClick={() => onChange(value.filter((item) => item !== url))}
              className="absolute top-1 right-1 rounded-full bg-surface p-1 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <X aria-hidden className="size-4 text-text-secondary" />
            </button>
          </div>
        ))}

        {!full && (
          <Button
            variant="secondary"
            size="lg"
            className="size-24 flex-col gap-1"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 aria-hidden className="size-5 animate-spin" />
            ) : (
              <ImagePlus aria-hidden className="size-5" />
            )}
            <span className="text-caption">{uploading ? 'Đang tải…' : 'Thêm ảnh'}</span>
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="sr-only"
        aria-label="Chọn ảnh minh chứng"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {error && (
        <p role="alert" className="text-caption font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}
