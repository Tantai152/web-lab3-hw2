import { memo } from 'react';
import styles from './PianoKey.module.css';

export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  return (
    <button
      type="button"
      className={`${styles.key} ${isBlack ? styles.black : styles.white} ${isPressed ? styles.pressed : ''}`}
      aria-pressed={isPressed}
      aria-label={`Piano key ${noteName}`}
      onPointerDown={() => onNoteOn(midi)}
      onPointerUp={() => onNoteOff(midi)}
      onPointerLeave={() => {
        // Ngăn stuck note khi kéo con trỏ ra khỏi phím mà chưa nhả.
        if (isPressed) onNoteOff(midi);
      }}
    >
      <span className={styles.label}>{noteName}</span>
    </button>
  );
});
