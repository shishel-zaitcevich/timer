'use client';

import { useState } from 'react';
import s from './SetInterval.module.scss'

interface Props {
  value: number;
  onChange: (val: number) => void;
}

export default function SetInterval({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Если поле пустое, не отправляем значение
    if (newValue === '') {
      return;
    }

    const parsedValue = Number(newValue);
    // Отправляем только валидное число >= 1
    if (!isNaN(parsedValue) && parsedValue >= 1) {
      onChange(parsedValue);
    }
  };

  return (
    <div>
      <label className={s.label}>
        Интервал оповещения (мин):{' '}
        <input
          type="number"
          min={1}
          value={inputValue}
          onChange={handleChange}
          className={`${s.input} ${inputValue === '' ? s.placeholder : ''}`}
          placeholder="0"
        />
      </label>
    </div>
  );
}