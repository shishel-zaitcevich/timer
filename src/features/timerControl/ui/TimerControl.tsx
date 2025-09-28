"use client";

import Button from "../../../shared/ui/Button/Button";
import { beep } from "../../../shared/lib/beep";

// interface Props {
//   running: boolean;
//   onStart: () => void;
//   onStop: () => void;
// }

// export default function TimerControl({ running, onStart, onStop }: Props) {
//   const handleStart = () => {
//     // "разблокировка" звука на мобильных браузерах
//     beep(50, 1000, 0.2);
//     onStart();
//   };

//   return (
//     <div>
//       {!running ? (
//         <Button onClick={handleStart}> Запустить</Button>
//       ) : (
//         <Button onClick={onStop}> Остановить</Button>
//       )}
//     </div>
//   );
// }


interface TimerControlProps {
  running: boolean;
  paused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export default function TimerControl({ running, paused, onStart, onStop, onPause, onResume }: TimerControlProps) {
  return (
    <div >
 {!running || paused ? (
        paused ? (
          <Button  onClick={onResume}>
            Продолжить
          </Button>
        ) : (
          <Button onClick={onStart}>
            Старт
          </Button>
        )
      ) : (
        <Button  onClick={onPause}>
          Пауза
        </Button>
      )}
      {running && (
        <Button  onClick={onStop}>
          Стоп
        </Button>
      )}
    </div>
  );
}