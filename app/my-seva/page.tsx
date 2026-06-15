"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { CalendarCheck, HeartHandshake } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

type AssignedSeva = {
  id: string;
  seva_role: string;
  status: string;
  notes: string | null;
  events: {
    title: string;
    event_date: string;
    event_time: string | null;
    location: string | null;
    expected_people: number | null;
  } | null;
  staff: {
    full_name: string;
    role_name: string | null;
  } | null;
};

export default function MySevaPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [assignedSeva, setAssignedSeva] = useState<AssignedSeva[]>([]);
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

    const { data, error } = await supabase
      .schema("satsangflow")
      .from("event_sevadars")
      .select(`
        id,
        seva_role,
        status,
        notes,
        events (
          title,
          event_date,
          event_time,
          location,
          expected_people
        ),
        staff (
          full_name,
          role_name
        )
      `)
      .eq("workspace_id", activeWorkspace.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("My Seva load error:", error.message);
    } else {
      setAssignedSeva((data || []) as unknown as AssignedSeva[]);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .schema("satsangflow")
      .from("event_sevadars")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadPage();
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
          View assigned seva duties for approved Satsang events.
        </p>
      </section>

      <section className="grid gap-4">
        {assignedSeva.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 text-sm text-gray-600 shadow-lg">
            No seva assigned yet.
          </div>
        ) : (
          assignedSeva.map((item) => (
            <div
              key={item.id}
              className="rounded-[2rem] bg-white p-6 shadow-[0_18px_48px_rgba(90,35,12,0.12)]"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-orange-50 p-3 text-[#e95414]">
                  <HeartHandshake size={26} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#35170c]">
                        {item.events?.title || "Satsang Event"}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <CalendarCheck size={16} />
                        {item.events?.event_date} {item.events?.event_time || ""}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Location: {item.events?.location || "Guruji Mandir Melbourne"}
                      </p>

                      <p className="mt-2 text-sm text-gray-600">
                        Expected Sangat: {item.events?.expected_people || 0}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold capitalize text-[#e95414]">
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#fffaf3] p-4 text-sm text-gray-700">
                    <p className="font-bold text-[#35170c]">
                      Assigned Seva: {item.seva_role}
                    </p>
                    <p className="mt-1">
                      Sevadar: {item.staff?.full_name || "Assigned Sevadar"}
                    </p>
                    {item.notes && <p className="mt-1">Notes: {item.notes}</p>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(item.id, "accepted")}
                      className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "completed")}
                      className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700"
                    >
                      Mark Completed
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, "cancelled")}
                      className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700"
                    >
                      Cancel
                    </button>
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
