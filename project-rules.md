# UIT S3T - LAB 3 AI GOVERNANCE RULES (HW 2)

1. **STACK**: React 19 + Vite + ES2024.
2. **NO LEGACY APIS**: Ban `class extends React.Component`, `ReactDOM.render`, `defaultProps`, `keyCode`, `window.alert`.
3. **ZERO DIV-SOUP**: Use `<main>`, `<section>`, `<article>`, `<header>`, `<output>`, `<button>`.
4. **STATE HYGIENE**: Immutable updates only.
5. **EFFECT CLEANUP**: Every timer, listener, or fetch in `useEffect` MUST return a cleanup / `AbortController`.
6. **AUDIO CLEANUP**: Every `AudioContext` or `OscillatorNode` must be closed/disconnected on unmount.
7. **PERFORMANCE**: Use `React.memo` for `PianoKey`. Pressing 1 key must NOT re-render all 88 keys.
8. **ALGORITHM**: 88 keys must be generated mathematically (MIDI 21 to 108). NO hardcoding.
9. **CSS**: Use CSS Modules (`*.module.css`) and CSS Custom Properties. No inline styles.
