import React from 'react';
import s from './AlarmClockLoader.module.scss';

interface AlarmClockLoaderProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const AlarmClockLoader: React.FC<AlarmClockLoaderProps> = ({
  size = 'medium',
  className,
}) => {
  return (
    <div className="wrapper">
      <div className="timer-base-3oclock"></div>
      <div className="timer-base-6oclock"></div>
      <div className="timer-base-9oclock"></div>
      <div className="timer-base-12oclock"></div>
      <div className="timer-leg-left"></div>
      <div className="timer-leg-right"></div>
      <div className="timer-ringer-base-left"></div>
      <div className="timer-ringer-base-right"></div>
      <div className="timer-ringer-left"></div>
      <div className="timer-ringer-right"></div>
      <div className="timer-ring-top">
        <div className="timer-ring-top-circle"></div>
      </div>
      <div className="timer-base">
        <div className="timer-base-inside">
          <div className="timer-base-inside-coremin">
            <div className="timer-base-inside-minutes"></div>
          </div>
          <div className="timer-base-inside-corehour">
            <div className="timer-base-inside-hours"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
