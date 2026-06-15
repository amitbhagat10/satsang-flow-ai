"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Users, HeartHandshake } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

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

type Sevadar = {
  id: string;
  full_name: string;
  role_name: string | null;
};

export default function EventsPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sevadars, setSevadars] = useState<Sevadar[]>([]);
  const [selectedSevadar, setSelectedSevadar] = useState<Record<string, string>>({});
  const [sevaRole, setSevaRole] = useState<Record<string, string>>({});
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

    const { data: eventData } = await supabase
      .schema("satsangflow")
      .from("events")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("event_date", { ascending: true });

    setEvents(eventData || []);

    const { data: sevadarData } = await supabase
      .schema("satsangflow")
      .from("staff")
      .select("id, full_name, role_name")
      .eq("workspace_id", activeWorkspace.id)
      .eq("active", true)
      .order("full_name", { ascending: true });

    setSevadars(sevadarData || []);

    setLoading(false);
  }

  async function assignSevadar(eventId: string) {
    if (!workspace) return;

    const sevadarId = selectedSevadar[eventId];
    const roleName = sevaRole[eventId] || "General Seva";

    if (!sevadarId) {
      alert("Please select a sevadar.");
      return;
    }

    const { error } = await supabase
      .schema("satsangflow")
      .from("event_sevadars")
      .insert({
        workspace_id: workspace.id,
        event_id: eventId,
        sevadar_id: sevadarId,
        seva_role: roleName,
        status: "assigned",
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Sevadar assigned.");
    setSelectedSevadar((prev) => ({ ...prev, [eventId]: "" }));
    setSevaRole((prev) => ({ ...prev, [eventId]: "" }));
  }

  useEffect(() => {
    loadEvents();
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading events...</main>;
  }

  if (!workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">No workspace found.</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-orange-600 to-amber-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">Satsang Events</p>
        <h1 className="mt-2 font-serif text-5xl font-bold">Approved Satsang calendar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          View approved bookings and assign sevadars for seva duties.
        </p>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_48px_rgba(90,35,12,0.12)]">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500">
            No approved events yet. Approve a booking from the dashboard first.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-gray-950">
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

                      <p>{event.location || "Guruji Mandir Melbourne"}</p>
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

                <div className="mt-5 rounded-2xl bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <HeartHandshake size={18} className="text-[#e95414]" />
                    <p className="font-bold text-[#35170c]">Assign Sevadar</p>
                  </div>

                  <div className="grid gap-3">
                    <select
                      value={selectedSevadar[event.id] || ""}
                      onChange={(e) =>
                        setSelectedSevadar((prev) => ({
                          ...prev,
                          [event.id]: e.target.value,
                        }))
                      }
                      className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
                    >
                      <option value="">Select sevadar</option>
                      {sevadars.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.full_name} {person.role_name ? `- ${person.role_name}` : ""}
                        </option>
                      ))}
                    </select>

                    <input
                      value={sevaRole[event.id] || ""}
                      onChange={(e) =>
                        setSevaRole((prev) => ({
                          ...prev,
                          [event.id]: e.target.value,
                        }))
                      }
                      placeholder="Seva role e.g. Setup, Langar, Coordination"
                      className="rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
                    />

                    <button
                      onClick={() => assignSevadar(event.id)}
                      className="rounded-2xl bg-[#e95414] px-4 py-3 text-sm font-bold text-white shadow-lg"
                    >
                      Assign Sevadar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
