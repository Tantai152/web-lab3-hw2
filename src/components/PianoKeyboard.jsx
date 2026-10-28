import { useCallback } from 'react';
import { PianoKey } from './PianoKey.jsx';
import styles from './PianoKeyboard.module.css';

const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
];

const START_MIDI = 21; // A0
const END_MIDI = 108; // C8
const BLACK_KEY_INDICES = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;

  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function PianoKeyboard({
  synth,
  activeNotes,
  onNoteOn,
  onNoteOff,
}) {
  const handleNoteOn = useCallback(
    (midi) => {
      if (onNoteOn) {
        onNoteOn(midi);
      } else if (synth) {
        synth.noteOn(midi, midiToFrequency(midi));
      }
    },
    [synth, onNoteOn],
  );

  const handleNoteOff = useCallback(
    (midi) => {
      if (onNoteOff) {
        onNoteOff(midi);
      } else if (synth) {
        synth.noteOff(midi);
      }
    },
    [synth, onNoteOff],
  );

  const keys = [];

  for (let i = START_MIDI; i <= END_MIDI; i++) {
    const midi = i;
    const noteName = midiToNoteName(midi);
    const isBlack = BLACK_KEY_INDICES.includes(midi % 12);
    const isPressed = activeNotes.has(midi);

    keys.push(
      <PianoKey
        key={midi}
        midi={midi}
        noteName={noteName}
        isBlack={isBlack}
        isPressed={isPressed}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />,
    );
  }

  return (
    <section
      className={styles.keyboard}
      aria-label="88-Key Piano"
    >
      {keys}
    </section>
  );
}
