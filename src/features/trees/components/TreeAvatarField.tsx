import { useRef, useState } from 'react';
import { ImagePlus, Loader2, TreeDeciduous } from 'lucide-react';
import { Button, useToast } from '@/components/ui';
import { uploadsService } from '@/services/uploads.service';
import { toAppError } from '@/services/http';

export interface TreeAvatarFieldProps {
  /** URL đã upload; '' = chưa có ảnh */
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

/**
 * Ảnh đại diện của cây (hồ sơ) — chỉ 1 ảnh, chọn ảnh mới là thay ảnh cũ.
 * Không có nút xoá: PATCH /trees/:code chưa nhận xoá ảnh (image phải là URL).
 */
export function TreeAvatarField({ value, onChange, disabled }: TreeAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadsService.upload(file));
      setBroken(false);
    } catch (error) {
      toast.error(toAppError(error).message, 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-label font-semibold text-text-primary">
        Ảnh đại diện
        <span className="ml-1 font-normal text-text-muted">(tùy chọn)</span>
      </span>
      <div className="flex items-center gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-sunken text-text-muted">
          {value && !broken ? (
            <img
              src={value}
              alt="Ảnh đại diện cây"
              width={80}
              height={80}
              className="size-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <TreeDeciduous aria-hidden className="size-7" />
          )}
        </div>
        <Button
          variant="secondary"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          leftIcon={
            uploading ? (
              <Loader2 aria-hidden className="size-5 animate-spin" />
            ) : (
              <ImagePlus aria-hidden className="size-5" />
            )
          }
        >
          {uploading ? 'Đang tải…' : value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Chọn ảnh đại diện cây"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  );
}
