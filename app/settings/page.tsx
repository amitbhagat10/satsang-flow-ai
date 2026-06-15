"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { Settings } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

export default function SettingsPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [mandirName, setMandirName] = useState("Guruji Mandir Melbourne");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [radioEnabled, setRadioEnabled] = useState(true);
  const [liveStreamEnabled, setLiveStreamEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
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
      .from("settings")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .maybeSingle();

    if (data) {
      setMandirName(data.mandir_name || "Guruji Mandir Melbourne");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setAddress(data.address || "");
      setRadioEnabled(data.radio_enabled ?? true);
      setLiveStreamEnabled(data.live_stream_enabled ?? true);
    }
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspace) return;

    setSaving(true);

    const { error } = await supabase
      .schema("satsangflow")
      .from("settings")
      .upsert(
        {
          workspace_id: workspace.id,
          mandir_name: mandirName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          address,
          radio_enabled: radioEnabled,
          live_stream_enabled: liveStreamEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id" }
      );

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Settings saved.");
  }

  useEffect(() => {
    loadSettings();
  }, []);

  if (!workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading...</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="mb-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
          Admin Control Centre
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          Settings
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          Manage Mandir details, radio availability and live satsang settings.
        </p>
      </section>

      <form
        onSubmit={saveSettings}
        className="rounded-[2rem] bg-white p-7 shadow-[0_18px_48px_rgba(90,35,12,0.12)]"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-orange-50 p-3 text-[#e95414]">
            <Settings size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#35170c]">
            Mandir App Settings
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={mandirName}
            onChange={(e) => setMandirName(e.target.value)}
            placeholder="Mandir name"
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />

          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Contact email"
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />

          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Contact phone"
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#e95414]"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl border border-orange-100 bg-[#fffaf3] p-4">
            <span className="font-bold text-[#35170c]">Guruji Radio Enabled</span>
            <input
              type="checkbox"
              checked={radioEnabled}
              onChange={(e) => setRadioEnabled(e.target.checked)}
              className="h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-orange-100 bg-[#fffaf3] p-4">
            <span className="font-bold text-[#35170c]">Live Satsang Enabled</span>
            <input
              type="checkbox"
              checked={liveStreamEnabled}
              onChange={(e) => setLiveStreamEnabled(e.target.checked)}
              className="h-5 w-5"
            />
          </label>
        </div>

        <button
          disabled={saving}
          className="mt-6 rounded-2xl bg-[#e95414] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </AppShell>
  );
}
