import { useEffect, useRef, useState } from 'react';
import styles from './Sequencer.module.css';

export function Sequencer({ onPlayNote, onStopNote }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const recordedNotesRef = useRef([]);
  const startTimeRef = useRef(0);
  const abortControllerRef = useRef(null);

  const handleRecordNote = (midi, type) => {
    if (!isRecording) {
      return;
    }

    const timeOffset = performance.now() - startTimeRef.current;

    recordedNotesRef.current.push({
      midi,
      type,
      timeOffset,
    });
  };

  const handleRecord = () => {
    abortControllerRef.current?.abort();
    setIsPlaying(false);

    recordedNotesRef.current = [];
    startTimeRef.current = performance.now();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handlePlay = async () => {
    if (isPlaying || recordedNotesRef.current.length === 0) {
      return;
    }

    setIsRecording(false);
    setIsPlaying(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let previousTimeOffset = 0;

    try {
      for (const note of recordedNotesRef.current) {
        const delay = note.timeOffset - previousTimeOffset;
        previousTimeOffset = note.timeOffset;

        await new Promise((resolve) => {
          setTimeout(resolve, Math.max(0, delay / playbackSpeed));
        });

        // AbortController cho phép hủy replay ngay khi người dùng nhấn Stop.
        if (controller.signal.aborted) {
          return;
        }

        if (note.type === 'on') {
          onPlayNote?.(note.midi);
        } else if (note.type === 'off') {
          onStopNote?.(note.midi);
        }
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsPlaying(false);
      }
    }
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsPlaying(false);

    // Hủy phiên phát hiện tại mà không ảnh hưởng đến phiên replay mới.
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <section
      className={styles.container}
      aria-label="Sequencer Controls"
    >
      <button
        type="button"
        aria-pressed={isRecording}
        onClick={isRecording ? handleStopRecording : handleRecord}
        disabled={isPlaying}
      >
        {isRecording ? 'Recording...' : 'Record'}
      </button>

      <button
        type="button"
        onClick={handleStop}
      >
        Stop
      </button>

      <button
        type="button"
        aria-pressed={isPlaying}
        onClick={handlePlay}
        disabled={isRecording || isPlaying}
      >
        Play
      </button>

      <label>
        Playback Speed
        <select
          value={playbackSpeed}
          onChange={(event) =>
            setPlaybackSpeed(Number(event.target.value))
          }
          disabled={isPlaying}
        >
          <option value={0.5}>0.5x</option>
          <option value={1.0}>1.0x</option>
          <option value={2.0}>2.0x</option>
        </select>
      </label>
    </section>
  );
}
