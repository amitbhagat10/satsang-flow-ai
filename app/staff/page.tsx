"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { Users, CalendarCheck } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

type Staff = {
  id: string;
  full_name: string;
  phone: string | null;
  role_name: string | null;
  active: boolean;
};

export default function StaffPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleName, setRoleName] = useState("");

  const [availabilityDate, setAvailabilityDate] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("available");
  const [availabilityNotes, setAvailabilityNotes] = useState("");

  const [loading, setLoading] = useState(true);

  async function loadStaff() {
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
      .from("staff")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Staff load error:", error.message);
    } else {
      setStaff(data || []);
    }

    setLoading(false);
  }

  async function addStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!workspace) return;

    const { error } = await supabase.schema("satsangflow").from("staff").insert({
      workspace_id: workspace.id,
      full_name: fullName,
      phone,
      role_name: roleName,
      active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setFullName("");
    setPhone("");
    setRoleName("");
    loadStaff();
  }

  async function saveAvailability(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!workspace || !selectedStaffId || !availabilityDate) return;

    const { error } = await supabase
      .schema("satsangflow")
      .from("staff_availability")
      .upsert(
        {
          workspace_id: workspace.id,
          staff_id: selectedStaffId,
          available_date: availabilityDate,
          availability_status: availabilityStatus,
          notes: availabilityNotes,
        },
        {
          onConflict: "staff_id,available_date",
        }
      );

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedStaffId("");
    setAvailabilityDate("");
    setAvailabilityStatus("available");
    setAvailabilityNotes("");

    alert("Availability saved.");
  }

  useEffect(() => {
    loadStaff();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">Loading staff...</p>
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
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-purple-600 to-orange-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">
          Staff & Volunteers
        </p>
        <h1 className="mt-2 text-3xl font-bold">Seva team management</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          Add speakers, volunteers, coordinators and support staff for Satsang
          events.
        </p>
      </div>

      <form
        onSubmit={addStaff}
        className="mb-6 rounded-3xl bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-950">
          Add Staff / Volunteer
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Role e.g. Speaker, Coordinator"
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />
        </div>

        <button className="mt-4 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700">
          Add Staff
        </button>
      </form>

      <form
        onSubmit={saveAvailability}
        className="mb-6 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
            <CalendarCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              Mark Staff Availability
            </h2>
            <p className="text-sm text-gray-500">
              Select staff and mark availability for a given Satsang day.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            required
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          >
            <option value="">Select staff</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
              </option>
            ))}
          </select>

          <input
            value={availabilityDate}
            onChange={(e) => setAvailabilityDate(e.target.value)}
            type="date"
            required
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <select
            value={availabilityStatus}
            onChange={(e) => setAvailabilityStatus(e.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="partial">Partial</option>
          </select>

          <input
            value={availabilityNotes}
            onChange={(e) => setAvailabilityNotes(e.target.value)}
            placeholder="Notes"
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />
        </div>

        <button className="mt-4 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">
          Save Availability
        </button>
      </form>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-purple-100 p-3 text-purple-700">
            <Users size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-950">
            Staff / Volunteer List
          </h2>
        </div>

        {staff.length === 0 ? (
          <p className="text-sm text-gray-500">No staff added yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.map((person) => (
              <div
                key={person.id}
                className="rounded-3xl border border-orange-100 bg-[#fffaf3] p-5"
              >
                <h3 className="text-lg font-bold text-gray-950">
                  {person.full_name}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  {person.role_name || "Volunteer"}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {person.phone || "No phone added"}
                </p>

                <span className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}