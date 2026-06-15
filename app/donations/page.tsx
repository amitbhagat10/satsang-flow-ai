"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { DollarSign } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

type Donation = {
  id: string;
  donor_name: string | null;
  amount: number;
  donation_date: string;
  payment_method: string | null;
  receipt_number: string | null;
  notes: string | null;
};

export default function DonationsPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDonations() {
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
      .from("donations")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("donation_date", { ascending: false });

    if (error) {
      console.error("Donations load error:", error.message);
    } else {
      setDonations(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDonations();
  }, []);

  const total = donations.reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">Loading donations...</p>
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
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-green-600 to-emerald-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">Donations</p>
        <h1 className="mt-2 text-3xl font-bold">Donation register</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          Track daily and event-wise donations received by Guruji Mandir
          Melbourne.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Donations</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            ${total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Donation Records</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {donations.length}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700">
            <DollarSign size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-950">
            Recent Donations
          </h2>
        </div>

        {donations.length === 0 ? (
          <p className="text-sm text-gray-500">No donations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Date</th>
                  <th>Donor</th>
                  <th>Method</th>
                  <th>Receipt</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-4 text-gray-600">{item.donation_date}</td>
                    <td className="font-medium text-gray-900">
                      {item.donor_name || "Anonymous"}
                    </td>
                    <td className="text-gray-600">
                      {item.payment_method || "-"}
                    </td>
                    <td className="text-gray-600">
                      {item.receipt_number || "-"}
                    </td>
                    <td className="text-right font-bold text-green-700">
                      ${Number(item.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}