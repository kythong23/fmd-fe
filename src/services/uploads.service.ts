import { appError } from './http';
import { delay } from './mock/db';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Upload ảnh trả URL bền. Mock hiện lưu data URL để ảnh sống qua reload —
 * prototype dùng URL.createObjectURL nên mất ảnh khi F5 (ref §4.4).
 * Khi có BE: đổi thân hàm sang POST /uploads, giữ nguyên signature.
 */
export const uploadsService = {
  async upload(file: File): Promise<string> {
    if (!ALLOWED.includes(file.type)) {
      throw appError('VALIDATION', {
        message: 'Chỉ nhận ảnh JPG, PNG, WEBP hoặc HEIC.',
        retryable: false,
      });
    }
    if (file.size > MAX_BYTES) {
      throw appError('VALIDATION', {
        message: 'Ảnh vượt quá 8MB. Chụp lại ở độ phân giải thấp hơn giúp bạn.',
        retryable: false,
      });
    }

    await delay(400, 1200);
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(appError('UNKNOWN', { message: 'Không đọc được file ảnh.' }));
      reader.readAsDataURL(file);
    });
  },
};
