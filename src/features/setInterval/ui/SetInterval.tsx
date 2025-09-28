'use client';

import s from './SetInterval.module.scss'

interface Props {
  value: number;
  onChange: (val: number) => void;
}

export default function SetInterval({ value, onChange }: Props) {
  return (
    <div>
      <label className={s.label}>
        Интервал оповещения (мин):{' '}
        <input 
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={s.input}
        />
      </label>
    </div>
  );
}
