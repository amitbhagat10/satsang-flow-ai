"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { PlayCircle } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

type LiveSession = {
  id: string;
  offer_sdp: string | null;
  broadcaster_candidates: RTCIceCandidateInit[] | null;
};

export default function LiveSatsangPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("Checking for live satsang...");

  async function load() {
    const result = await getMyWorkspace();

    if (result.error === "Not logged in") {
      router.push("/login");
      return;
    }

    if (result.workspace) {
      setWorkspace(result.workspace as unknown as Workspace);
      setRole(result.role);
    }
  }

  async function watchLive() {
    if (!workspace) return;

    setStatus("Looking for active live satsang...");

    const { data: session } = await supabase
      .schema("satsangflow")
      .from("live_sessions")
      .select("id,offer_sdp,broadcaster_candidates")
      .eq("workspace_id", workspace.id)
      .eq("status", "live")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (!session?.offer_sdp) {
      setStatus("No live satsang is running right now.");
      return;
    }

    const liveSession = session as LiveSession;
    sessionIdRef.current = liveSession.id;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;

    pc.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
      setStatus("You are watching Live Satsang.");
    };

    const viewerCandidates: RTCIceCandidateInit[] = [];

    pc.onicecandidate = async (event) => {
      if (!event.candidate || !sessionIdRef.current) return;

      viewerCandidates.push(event.candidate.toJSON());

      await supabase
        .schema("satsangflow")
        .from("live_sessions")
        .update({ viewer_candidates: viewerCandidates })
        .eq("id", sessionIdRef.current);
    };

    await pc.setRemoteDescription({
      type: "offer",
      sdp: liveSession.offer_sdp ?? undefined,
    });

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await supabase
      .schema("satsangflow")
      .from("live_sessions")
      .update({ answer_sdp: answer.sdp })
      .eq("id", liveSession.id);

    const addedBroadcasterCandidates = new Set<string>();

    const interval = setInterval(async () => {
      if (!sessionIdRef.current || !pcRef.current) return;

      const { data } = await supabase
        .schema("satsangflow")
        .from("live_sessions")
        .select("broadcaster_candidates,status")
        .eq("id", sessionIdRef.current)
        .single();

      if (!data || data.status !== "live") {
        clearInterval(interval);
        setStatus("Live satsang has ended.");
        return;
      }

      const candidates = data.broadcaster_candidates || [];

      for (const c of candidates) {
        if (!c?.candidate || addedBroadcasterCandidates.has(c.candidate)) continue;
        addedBroadcasterCandidates.add(c.candidate);
        await pcRef.current.addIceCandidate(c);
      }
    }, 1500);
  }

  useEffect(() => {
    load();
  }, []);

  if (!workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading...</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="rounded-[2rem] bg-white p-8 shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
          Jai Guru Ji
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          Live Satsang
        </h1>

        <p className="mt-4 text-gray-600">
          Join and watch live satsang directly inside SevaSangam.
        </p>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="mt-8 aspect-video w-full rounded-[2rem] bg-black object-cover shadow-2xl"
        />

        <p className="mt-4 rounded-2xl bg-[#fffaf3] p-4 text-sm font-bold text-[#35170c]">
          {status}
        </p>

        <button
          onClick={watchLive}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#e95414] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c]"
        >
          <PlayCircle size={18} />
          Watch Live Satsang
        </button>
      </section>
    </AppShell>
  );
}
