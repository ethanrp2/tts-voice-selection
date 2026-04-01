"use client";

import { useState, useRef, useCallback } from "react";

const audioCache = new Map<string, string>(); // key: "voiceId:text" → blob URL

function cacheKey(voiceId: string, text: string) {
  return `${voiceId}:${text}`;
}

async function fetchTTS(voiceId: string, text: string): Promise<string> {
  const key = cacheKey(voiceId, text);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voiceId, text }),
  });

  if (!response.ok) throw new Error("TTS request failed");

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}

export function prefetchAudio(voiceId: string, text: string) {
  const key = cacheKey(voiceId, text);
  if (audioCache.has(key)) return;
  // Fire and forget - silently cache for later
  fetchTTS(voiceId, text).catch(() => {});
}

export function useAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
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
        const url = await fetchTTS(voiceId, text);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setPlayingId(null);
        };

        audio.onerror = () => {
          setPlayingId(null);
          setLoadingId(null);
        };

        await audio.play();
        setPlayingId(voiceId);
      } catch {
        // Button will reset via finally
      } finally {
        setLoadingId(null);
      }
    },
    [playingId, stop]
  );

  return { play, stop, playingId, loadingId };
}
