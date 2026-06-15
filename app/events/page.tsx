"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Users } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

type EventItem = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  expected_people: number | null;
  actual_people: number | null;
  status: string;
  notes: string | null;
};

export default function EventsPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);

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

    const { data, error } = await supabase
      .schema("satsangflow")
      .from("events")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Events load error:", error.message);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">Loading events...</p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">No workspace found.</p>
      </main>
    );
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">Satsang Events</p>
        <h1 className="mt-2 text-3xl font-bold">Approved Satsang calendar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          View approved bookings, expected gathering count and event location.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">
            No approved events yet. Approve a booking from the dashboard first.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-950">
                      {event.title}
                    </h2>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        {event.event_date} {event.event_time || ""}
                      </p>

                      <p className="flex items-center gap-2">
                        <Users size={16} />
                        Expected: {event.expected_people || 0} people
                      </p>

                      <p>{event.location || "Location not provided"}</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                    {event.status}
                  </span>
                </div>

                {event.notes && (
                  <p className="mt-4 rounded-2xl bg-white p-3 text-sm text-gray-600">
                    {event.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}