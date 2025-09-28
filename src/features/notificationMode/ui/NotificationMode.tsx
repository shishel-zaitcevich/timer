'use client';

import s from './NotificationMode.module.scss';

interface Props {
  mode: 'speech' | 'beep' | 'off';
  onChange: (mode: 'speech' | 'beep' | 'off') => void;
}

export default function NotificationMode({ mode, onChange }: Props) {
  return (
    <div className={s.notifications}>
      <label>
        <input
          type="radio"
          name="mode"
          value="speech"
          checked={mode === 'speech'}
          onChange={() => onChange('speech')}
          className={s.input}
        />
        Озвучка
      </label>

      <label className={s.label}>
        <input
          type="radio"
          name="mode"
          value="beep"
          checked={mode === 'beep'}
          onChange={() => onChange('beep')}
          className={s.input}
        />
        Сигнал
      </label>

      <label className={s.label}>
        <input
          type="radio"
          name="mode"
          value="off"
          checked={mode === 'off'}
          onChange={() => onChange('off')}
          className={s.input}
        />
        Выключить звук
      </label>
    </div>
  );
}
