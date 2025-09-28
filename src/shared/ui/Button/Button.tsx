import { ReactNode } from 'react';
import s from './Button.module.scss';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}

export default function Button({ onClick, children, disabled }: ButtonProps) {
  return (
    <button className={s.button} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
