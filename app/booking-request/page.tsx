"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import NewBookingForm from "@/components/bookings/NewBookingForm";
import { getMyWorkspace } from "@/lib/workspace";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

export default function BookingRequestPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function loadWorkspace() {
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

  useEffect(() => {
    loadWorkspace();
  }, []);

  if (!workspace) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">Loading booking page...</p>
      </main>
    );
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">
          Satsang Booking Request
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Request a Satsang appointment
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          Families and devotees can request a suitable date and time. Admin can
          approve the request and create the Satsang event.
        </p>
      </div>

      {saved && (
        <div className="mb-4 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          Booking request submitted successfully.
        </div>
      )}

      <NewBookingForm
        workspaceId={workspace.id}
        onSaved={() => setSaved(true)}
      />
    </AppShell>
  );
}