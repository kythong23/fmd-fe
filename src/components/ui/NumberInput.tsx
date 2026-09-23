import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

export interface NumberInputProps
  extends Omit<InputProps, 'value' | 'onChange' | 'type' | 'inputMode'> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toDisplay(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value)
    ? ''
    : groupThousands(String(value));
}

/**
 * Input số nguyên hiển thị nhóm 3 chữ số cách nhau bởi dấu phẩy (vd: giá, số lượng lớn).
 * Chỉ format phần hiển thị — `onChange` luôn trả số raw, không có dấu phẩy, để gửi thẳng xuống BE.
 */
export function NumberInput({ value, onChange, ...rest }: NumberInputProps) {
  const [display, setDisplay] = useState(() => toDisplay(value));

  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '');
    setDisplay(groupThousands(digits));
    onChange(digits === '' ? null : Number(digits));
  }

  return (
    <Input {...rest} type="text" inputMode="numeric" value={display} onChange={handleChange} />
  );
}
