"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { ReceiptText } from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

type Expense = {
  id: string;
  category: string;
  vendor_name: string | null;
  amount: number;
  expense_date: string;
  bill_number: string | null;
  payment_status: string;
  notes: string | null;
};

export default function ExpensesPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExpenses() {
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
      .from("expenses")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("Expenses load error:", error.message);
    } else {
      setExpenses(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const pending = expenses
    .filter((item) => item.payment_status === "pending")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f4eb] p-6">
        <p className="text-sm text-gray-600">Loading expenses...</p>
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
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-red-600 to-orange-500 p-8 text-white shadow-sm">
        <p className="text-sm font-semibold text-white/80">Expenses & Bills</p>
        <h1 className="mt-2 text-3xl font-bold">Expense register</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
          Track daily expenses, bills, vendors and pending payments for Guruji
          Mandir Melbourne.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            ${total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pending Bills</p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            ${pending.toLocaleString()}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Expense Records</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">
            {expenses.length}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-red-100 p-3 text-red-700">
            <ReceiptText size={22} />
          </div>
          <h2 className="text-lg font-semibold text-gray-950">
            Recent Expenses
          </h2>
        </div>

        {expenses.length === 0 ? (
          <p className="text-sm text-gray-500">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Date</th>
                  <th>Category</th>
                  <th>Vendor</th>
                  <th>Bill No.</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-4 text-gray-600">{item.expense_date}</td>
                    <td className="font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="text-gray-600">{item.vendor_name || "-"}</td>
                    <td className="text-gray-600">{item.bill_number || "-"}</td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                          item.payment_status === "pending"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="text-right font-bold text-red-700">
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