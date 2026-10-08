import { useState } from 'react';
import { TreeDeciduous } from 'lucide-react';

export interface TreeAvatarProps {
  code: string;
  /** Ảnh đại diện của cây — sửa ở "Sửa hồ sơ cây", không phải ảnh tình trạng */
  image: string | null;
}

export function TreeAvatar({ code, image }: TreeAvatarProps) {
  const [broken, setBroken] = useState(false);

  if (!image || broken) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-sunken text-text-muted">
        <TreeDeciduous aria-hidden className="size-8" />
        <p className="text-caption">Chưa có ảnh đại diện cho cây {code}</p>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={'Ảnh đại diện cây ' + code}
      width={800}
      height={600}
      loading="lazy"
      onError={() => setBroken(true)}
      className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
    />
  );
}
