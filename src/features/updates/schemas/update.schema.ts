import { z } from 'zod';
import { MEASUREMENT_LIMITS } from '@/constants/activity-types';

const LIMITS = MEASUREMENT_LIMITS;

function measurement(key: keyof typeof LIMITS) {
  const { min, max, label, unit } = LIMITS[key];
  return z
    .union([z.literal(''), z.coerce.number()])
    .optional()
    .refine(
      (value) => value === '' || value === undefined || (value >= min && value <= max),
      label + ' phải trong khoảng ' + min + '–' + max + ' ' + unit,
    );
}

/** FE validate bằng schema này; BE enforce bằng schema tương đương (04_API §2.1) */
export const updateSchema = z.object({
  status: z.enum(['healthy', 'monitoring', 'problem', 'unknown'], {
    message: 'Chọn tình trạng cây',
  }),
  conditions: z.array(
    z.enum(['leaf', 'stem', 'branch', 'flower', 'fruit', 'pest', 'soil', 'other']),
  ),
  description: z.string().trim().max(1000, 'Mô tả tối đa 1000 ký tự'),
  images: z.array(z.string()),
  height: measurement('height'),
  trunkDiameter: measurement('trunkDiameter'),
  soilMoisture: measurement('soilMoisture'),
  fruitCount: measurement('fruitCount'),
  actionTaken: z.enum(['watering', 'fertilizing', 'spraying', 'pruning', 'treatment', 'none']),
  notes: z.string().trim().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
  performer: z.string().trim().min(1, 'Nhập tên người thực hiện'),
});

export type UpdateFormValues = z.infer<typeof updateSchema>;
