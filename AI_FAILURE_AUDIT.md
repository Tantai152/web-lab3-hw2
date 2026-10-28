# AI FAILURE MODE AUDIT — 88-Key Polyphonic Piano

## Overview
Audit of common errors when prompting AI to generate React 19 code for Web Audio API, Event Handling, and Memory Management algorithms.

## Vulnerability 1: Memory Leak due to missing Oscillator disconnect()

**AI Prompt used:**
"Play a note by creating an Oscillator and stopping it after 1 second."

**AI Generated Code (Bug):**
```javascript
noteOn(midi, freq) {
  const osc = this.ctx.createOscillator();
  osc.frequency.value = freq;
  osc.connect(this.ctx.destination);
  osc.start();
  setTimeout(() => osc.stop(), 1000); // Bug: Missing disconnect
}
```

**Risk:**
CWE-401 (Memory Leak). When calling `stop()`, the `OscillatorNode` stops generating sound but is NOT automatically disconnected from the audio graph (`destination`). If a key is pressed 50 times continuously, 50 nodes remain in the audio graph, causing severe memory leaks and browser lag.

**Detection Method:**
Open Chrome Task Manager (`Shift + Esc`), press keys continuously for 1 minute. The "Memory Footprint" metric will continuously increase without dropping.

**Engineering Refactor:**
```javascript
noteOff(midi) {
  const voice = this.voices.get(midi);
  if (!voice) return;
  
  voice.osc.onended = () => {
    voice.osc.disconnect(); // Must disconnect
    voice.gain.disconnect();
  };
  voice.osc.stop();
  this.voices.delete(midi);
}
```

**Verification:**
Use `console.log` inside `onended`, press keys continuously, and observe logs indicating that nodes have been cleaned up successfully.

## Vulnerability 2: Click/Pop Artifacts due to missing ADSR Envelope

**AI Prompt used:**
"Create a synth that plays a sine wave note when a key is pressed"

**AI Generated Code (Bug):**
```javascript
noteOn(midi, freq) {
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  gain.gain.value = 0.5; // Suddenly set volume to 0.5
  osc.connect(gain).connect(this.ctx.destination);
  osc.start();
}
```

**Risk:**
Audio Quality Issue / Click Artifact. Abruptly setting Gain from 0 to 0.5 creates a square wave component at extremely high frequencies, resulting in an unpleasant clicking or popping sound at the beginning of each note. Similarly when stopping audio abruptly.

**Detection Method:**
Press a key and listen carefully for clicking/popping sounds at the start and end of each note. Observing the waveform in Audacity reveals sudden step changes in amplitude.

**Engineering Refactor:**
```javascript
const now = this.ctx.currentTime;
// Attack 20ms
gain.gain.setValueAtTime(0, now);
gain.gain.linearRampToValueAtTime(0.3, now + 0.02);

// Release 50ms (during noteOff)
gainParam.cancelScheduledValues(now);
gainParam.setValueAtTime(gainParam.value, now);
gainParam.exponentialRampToValueAtTime(0.001, now + 0.05);
```

**Verification:**
Press and release keys; the sound is smooth with no clicking artifacts.

## Vulnerability 3: Re-rendering all 88 keys (Performance Bottleneck)

**AI Prompt used:**
"Create a piano with 88 keys and highlight the pressed key"

**AI Generated Code (Bug):**
```javascript
export function PianoKeyboard({ activeNotes }) {
  const keys = [];
  for (let i = 21; i <= 108; i++) {
    // Bug: Child component is not memoized, re-rendering the entire tree when state changes
    keys.push(<PianoKey key={i} isPressed={activeNotes.has(i)} />); 
  }
  return <div>{keys}</div>;
}
```

**Risk:**
CWE-1050 (Excessive Component Re-rendering). Every time a key is pressed, the `activeNotes` state changes, triggering a re-render of `PianoKeyboard`, which consequently forces all 88 child `PianoKey` components to re-render. This causes high CPU load and frame drops when playing fast notes.

**Detection Method:**
Open React DevTools Profiler -> Record -> Press 1 key. All 88 components will be highlighted in yellow (re-rendered) instead of just the single pressed key.

**Engineering Refactor:**
```javascript
import { memo } from 'react';
// Wrap child component in React.memo and compare props
export const PianoKey = memo(function PianoKey({ midi, isPressed, onNoteOn }) {
  // ...
});
```

**Verification:**
Open React DevTools Profiler, press 1 key. Only the exact single `PianoKey` component re-renders.

## Summary Table

| Number | Vulnerability | CWE | Severity | Fixed |
|---|---|---|---|---|
| 1 | Memory Leak (Missing disconnect) | CWE-401 | Critical | Yes |
| 2 | Click/Pop Artifacts | N/A | Medium | Yes |
| 3 | Re-render 88 keys (Performance) | CWE-1050 | High | Yes |
