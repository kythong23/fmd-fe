import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TreeGalleryProps {
  code: string;
  image: string | null;
  gallery: string[];
}

export function TreeGallery({ code, image, gallery }: TreeGalleryProps) {
  const images = Array.from(new Set([image, ...gallery].filter(Boolean) as string[]));
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState(false);

  if (images.length === 0 || broken) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-sunken text-text-muted">
        <ImageOff aria-hidden className="size-6" />
        <p className="text-caption">Chưa có ảnh cho cây {code}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <img
        src={images[active]}
        alt={'Ảnh cây ' + code}
        width={800}
        height={600}
        loading="lazy"
        onError={() => setBroken(true)}
        className="aspect-[4/3] w-full rounded-lg border border-border object-cover"
      />
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((url, index) => (
            <button
              key={url.slice(0, 64) + index}
              type="button"
              aria-label={'Xem ảnh ' + (index + 1)}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-md border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                index === active ? 'border-primary' : 'border-border',
              )}
            >
              <img
                src={url}
                alt=""
                width={64}
                height={64}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
