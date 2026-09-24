import { appError, http } from './http';

// Khớp BE (routes/uploads.ts): chỉ JPG/PNG/WEBP, tối đa 10MB — BE kiểm tra magic bytes lần nữa
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /uploads (multipart, field `files`) → URL bền do BE trả về.
 * Không gửi ảnh dạng data URL trong JSON: BE giới hạn body JSON 1MB, ảnh điện thoại vượt ngay.
 */
export const uploadsService = {
  async upload(file: File): Promise<string> {
    if (!ALLOWED.includes(file.type)) {
      throw appError('VALIDATION', {
        message: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.',
        retryable: false,
      });
    }
    if (file.size > MAX_BYTES) {
      throw appError('VALIDATION', {
        message: 'Ảnh vượt quá 10MB. Chụp lại ở độ phân giải thấp hơn giúp bạn.',
        retryable: false,
      });
    }

    const body = new FormData();
    body.append('files', file);
    const { urls } = await http<{ urls: string[] }>('/uploads', { method: 'POST', body });
    return urls[0];
  },
};
