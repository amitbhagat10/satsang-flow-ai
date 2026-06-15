"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { DollarSign, ReceiptText } from "lucide-react";

type Props = {
  workspaceId: string;
  onSaved: () => void;
};

export default function FinanceQuickEntry({ workspaceId, onSaved }: Props) {
  const [donorName, setDonorName] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function addDonation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.schema("satsangflow").from("donations").insert({
      workspace_id: workspaceId,
      donor_name: donorName || "Anonymous",
      amount: Number(donationAmount),
      donation_date: new Date().toISOString().slice(0, 10),
      payment_method: "Cash",
      created_by: userData.user?.id,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setDonorName("");
    setDonationAmount("");
    onSaved();
  }

  async function addExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.schema("satsangflow").from("expenses").insert({
      workspace_id: workspaceId,
      category: expenseCategory,
      amount: Number(expenseAmount),
      expense_date: new Date().toISOString().slice(0, 10),
      payment_status: "paid",
      created_by: userData.user?.id,
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setExpenseCategory("");
    setExpenseAmount("");
    onSaved();
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <form onSubmit={addDonation} className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700">
            <DollarSign size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Add Donation</h2>
            <p className="text-sm text-gray-500">Record today’s received donation.</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Donor name"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <input
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Amount $"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <button
            disabled={saving}
            className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            Save Donation
          </button>
        </div>
      </form>

      <form onSubmit={addExpense} className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-red-100 p-3 text-red-700">
            <ReceiptText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Add Expense</h2>
            <p className="text-sm text-gray-500">Record food, bills, hall, transport, etc.</p>
          </div>
        </div>

        <div className="space-y-3">
          <input
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            placeholder="Expense category"
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <input
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="Amount $"
            type="number"
            min="0"
            step="0.01"
            required
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
          />

          <button
            disabled={saving}
            className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}