import { useRef, useState } from 'react';
import { PolyphonicSynth } from './audio/PolyphonicSynth.js';
import { PianoKeyboard } from './components/PianoKeyboard.jsx';
import { Sequencer } from './components/Sequencer.jsx';

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function App() {
  const synthRef = useRef(null);
  const sequencerRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());

  const handleNoteOn = (midi) => {
    if (!synthRef.current) {
      synthRef.current = new PolyphonicSynth();
    }

    synthRef.current.noteOn(midi, midiToFrequency(midi));

    setActiveNotes((prev) => new Set(prev).add(midi));

    sequencerRef.current?.handleRecordNote(midi, 'on');
  };

  const handleNoteOff = (midi) => {
    synthRef.current?.noteOff(midi);

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });

    sequencerRef.current?.handleRecordNote(midi, 'off');
  };

  return (
    <main>
      <header>
        <h1>88-Key Polyphonic Piano</h1>
      </header>

      <Sequencer
        ref={sequencerRef}
        onPlayNote={handleNoteOn}
        onStopNote={handleNoteOff}
      />

      <PianoKeyboard
        activeNotes={activeNotes}
        onNoteOn={handleNoteOn}
        onNoteOff={handleNoteOff}
      />
    </main>
  );
}
