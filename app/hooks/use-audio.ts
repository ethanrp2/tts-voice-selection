"use client";

import { useState, useRef, useCallback } from "react";

export function useAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const play = useCallback(
    async (voiceId: string, text: string) => {
      // If already playing this voice, stop it
      if (playingId === voiceId) {
        stop();
        return;
      }

      // Stop any current playback
      stop();
      setLoadingId(voiceId);

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId, text }),
        });

        if (!response.ok) {
          throw new Error("TTS request failed");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
          urlRef.current = null;
        };

        audio.onerror = () => {
          setPlayingId(null);
          setLoadingId(null);
        };

        await audio.play();
        setPlayingId(voiceId);
      } catch {
        // Silently handle errors - button will reset
      } finally {
        setLoadingId(null);
      }
    },
    [playingId, stop]
  );

  return { play, stop, playingId, loadingId };
}
