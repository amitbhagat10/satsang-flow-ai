"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Radio } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getMyWorkspace } from "@/lib/workspace";

type Track = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
};

export default function GurujiRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  async function loadTracks() {
    const result = await getMyWorkspace();
    if (!result.workspace) return;

    const workspace = result.workspace as unknown as { id: string };

    const { data } = await supabase
      .schema("satsangflow")
      .from("radio_tracks")
      .select("id,title,artist,audio_url")
      .eq("workspace_id", workspace.id)
      .eq("active", true)
      .order("sort_order", { ascending: true });

    setTracks(data || []);
  }

  useEffect(() => {
    loadTracks();
  }, []);

  async function toggleRadio() {
    if (!audioRef.current || tracks.length === 0) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    await audioRef.current.play();
    setPlaying(true);
  }

  function playNext() {
    if (tracks.length === 0) return;
    setTrackIndex((current) => (current + 1) % tracks.length);
    setTimeout(() => {
      audioRef.current?.play();
      setPlaying(true);
    }, 200);
  }

  const currentTrack = tracks[trackIndex];

  if (tracks.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-xl -translate-x-1/2 rounded-full border border-orange-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl xl:left-[calc(50%+155px)]">
      <audio
        ref={audioRef}
        src={currentTrack?.audio_url}
        onEnded={playNext}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 pl-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5d0b14] text-white">
            <Radio size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#35170c]">
              {currentTrack?.title || "Guruji Radio"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {playing ? "Playing now" : "Tap to start Guruji Radio"}
            </p>
          </div>
        </div>

        <button
          onClick={toggleRadio}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e95414] text-white shadow-lg"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
    </div>
  );
}
