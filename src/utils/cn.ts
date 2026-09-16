/** Ghép className, bỏ giá trị rỗng. Đủ dùng thay clsx — không thêm dependency. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
