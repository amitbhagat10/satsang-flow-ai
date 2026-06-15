"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { Video, Square } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

export default function LiveStudioPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to start live satsang");

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

  async function startLive() {
    if (!workspace) return;

    setStatus("Opening camera and microphone...");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pcRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const candidates: RTCIceCandidateInit[] = [];

    pc.onicecandidate = async (event) => {
      if (!event.candidate || !sessionIdRef.current) return;

      candidates.push(event.candidate.toJSON());

      await supabase
        .schema("satsangflow")
        .from("live_sessions")
        .update({ broadcaster_candidates: candidates })
        .eq("id", sessionIdRef.current);
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const { data, error } = await supabase
      .schema("satsangflow")
      .from("live_sessions")
      .insert({
        workspace_id: workspace.id,
        title: "Live Satsang",
        status: "live",
        offer_sdp: offer.sdp,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      alert(error?.message || "Could not start live session");
      return;
    }

    sessionIdRef.current = data.id;
    setStatus("Live started. Waiting for sangat viewer to join...");

    const addedViewerCandidates = new Set<string>();
    let answerAdded = false;

    const interval = setInterval(async () => {
      if (!sessionIdRef.current || !pcRef.current) return;

      const { data: session } = await supabase
        .schema("satsangflow")
        .from("live_sessions")
        .select("answer_sdp,viewer_candidates,status")
        .eq("id", sessionIdRef.current)
        .single();

      if (!session || session.status !== "live") {
        clearInterval(interval);
        return;
      }

      if (session.answer_sdp && !answerAdded) {
        await pcRef.current.setRemoteDescription({
          type: "answer",
          sdp: session.answer_sdp,
        });
        answerAdded = true;
        setStatus("Sangat connected and watching live.");
      }

      const viewerCandidates = session.viewer_candidates || [];
      for (const c of viewerCandidates) {
        if (!c?.candidate || addedViewerCandidates.has(c.candidate)) continue;
        addedViewerCandidates.add(c.candidate);
        await pcRef.current.addIceCandidate(c);
      }
    }, 1500);
  }

  async function endLive() {
    if (sessionIdRef.current) {
      await supabase
        .schema("satsangflow")
        .from("live_sessions")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionIdRef.current);
    }

    pcRef.current?.close();
    pcRef.current = null;
    sessionIdRef.current = null;

    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());

    if (videoRef.current) videoRef.current.srcObject = null;

    setStatus("Live ended.");
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
          Admin Live Studio
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          Start Live Satsang
        </h1>

        <p className="mt-4 text-gray-600">
          Use this page on mobile or laptop to stream camera and microphone.
        </p>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="mt-8 aspect-video w-full rounded-[2rem] bg-black object-cover shadow-2xl"
        />

        <p className="mt-4 rounded-2xl bg-[#fffaf3] p-4 text-sm font-bold text-[#35170c]">
          {status}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={startLive}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#e95414] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c]"
          >
            <Video size={18} />
            Start Live
          </button>

          <button
            onClick={endLive}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#5d0b14] px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            <Square size={18} />
            End Live
          </button>
        </div>
      </section>
    </AppShell>
  );
}
