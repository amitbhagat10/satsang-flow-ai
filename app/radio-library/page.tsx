"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { Music, Upload } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

type Track = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  active: boolean;
  sort_order: number;
};

export default function RadioLibraryPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadPage() {
    const result = await getMyWorkspace();

    if (result.error === "Not logged in") {
      router.push("/login");
      return;
    }

    if (!result.workspace) return;

    const activeWorkspace = result.workspace as unknown as Workspace;
    setWorkspace(activeWorkspace);
    setRole(result.role);

    const { data } = await supabase
      .schema("satsangflow")
      .from("radio_tracks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("sort_order", { ascending: true });

    setTracks(data || []);
  }

  async function addTrack(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!workspace || !file) {
      alert("Please select an audio file.");
      return;
    }

    setSaving(true);

    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-");

    const filePath = `${workspace.id}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("radio-tracks")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setSaving(false);
      alert(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("radio-tracks")
      .getPublicUrl(filePath);

    const audioUrl = publicUrlData.publicUrl;

    const { error } = await supabase
      .schema("satsangflow")
      .from("radio_tracks")
      .insert({
        workspace_id: workspace.id,
        title,
        artist,
        audio_url: audioUrl,
        active: true,
        sort_order: tracks.length + 1,
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setArtist("");
    setFile(null);

    const fileInput = document.getElementById("audio-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    loadPage();
  }

  async function toggleActive(track: Track) {
    await supabase
      .schema("satsangflow")
      .from("radio_tracks")
      .update({ active: !track.active })
      .eq("id", track.id);

    loadPage();
  }


  async function deleteTrack(track: Track) {
    const confirmed = window.confirm(`Remove "${track.title}" from playlist?`);
    if (!confirmed) return;

    const { error } = await supabase
      .schema("satsangflow")
      .from("radio_tracks")
      .delete()
      .eq("id", track.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPage();
  }

  useEffect(() => {
    loadPage();
  }, []);

  if (!workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading...</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="mb-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
          Guruji Radio
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          Music Library
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          Admin can upload bhajans or spiritual songs. Uploaded songs become
          available in the Guruji Radio player for users.
        </p>
      </section>

      <form
        onSubmit={addTrack}
        className="mb-6 rounded-[2rem] bg-white p-7 shadow-[0_18px_48px_rgba(90,35,12,0.12)]"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-full bg-orange-50 p-3 text-[#e95414]">
            <Upload size={24} />
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#35170c]">
            Upload Song
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song title"
            required
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />

          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist / description"
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />

          <input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />
        </div>

        <button
          disabled={saving}
          className="mt-4 rounded-2xl bg-[#e95414] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c] disabled:opacity-60"
        >
          {saving ? "Uploading..." : "Upload to Radio Library"}
        </button>
      </form>

      <section className="rounded-[2rem] bg-white p-7 shadow-[0_18px_48px_rgba(90,35,12,0.12)]">
        <h2 className="mb-5 font-serif text-2xl font-bold text-[#35170c]">
          Current Playlist
        </h2>

        {tracks.length === 0 ? (
          <p className="text-sm text-gray-500">No songs uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-[#fffaf3] p-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#35170c]">{track.title}</p>
                  <p className="text-sm text-gray-500">
                    {track.artist || "Guruji Radio"}
                  </p>
                  <audio controls src={track.audio_url} className="mt-2 w-full max-w-sm" />
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => toggleActive(track)}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      track.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {track.active ? "Active" : "Inactive"}
                  </button>

                  <button
                    onClick={() => deleteTrack(track)}
                    className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
