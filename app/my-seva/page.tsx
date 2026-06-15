"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { CalendarCheck, HeartHandshake } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  expected_people: number | null;
  status: string;
  notes: string | null;
};

export default function MySevaPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPage() {
    const result = await getMyWorkspace();

    if (result.error === "Not logged in") {
      router.push("/login");
      return;
    }

    if (!result.workspace) {
      setLoading(false);
      return;
    }

    const activeWorkspace = result.workspace as unknown as Workspace;
    setWorkspace(activeWorkspace);
    setRole(result.role);

    const { data } = await supabase
      .schema("satsangflow")
      .from("events")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .in("status", ["scheduled"])
      .order("event_date", { ascending: true })
      .limit(10);

    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, []);

  if (loading || !workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading...</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="mb-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
          Sevadar View
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          My Seva
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          View today’s and upcoming seva duties after Satsang bookings are approved.
        </p>
      </section>

      <section className="grid gap-4">
        {events.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-sm text-gray-600 shadow-lg">
            No seva assigned yet.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-[2rem] bg-white p-6 shadow-[0_18px_48px_rgba(90,35,12,0.12)]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-orange-50 p-3 text-[#e95414]">
                  <HeartHandshake size={26} />
                </div>

                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-bold text-[#35170c]">
                    {event.title}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <CalendarCheck size={16} />
                    {event.event_date} {event.event_time || ""}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Location: {event.location || "Guruji Mandir Melbourne"}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Expected Sangat: {event.expected_people || 0}
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#fffaf3] p-4 text-sm text-gray-700">
                    Assigned Seva: Setup / Support / Coordination
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </AppShell>
  );
}
