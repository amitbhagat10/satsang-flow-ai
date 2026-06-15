"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarPlus } from "lucide-react";

type Props = {
  workspaceId: string;
  onSaved: () => void;
};

export default function NewBookingForm({ workspaceId, onSaved }: Props) {
  const [requesterName, setRequesterName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [expectedPeople, setExpectedPeople] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .schema("satsangflow")
      .from("booking_requests")
      .insert({
        workspace_id: workspaceId,
        requester_name: requesterName,
        phone,
        address,
        preferred_date: preferredDate,
        preferred_time: preferredTime || null,
        expected_people: expectedPeople ? Number(expectedPeople) : null,
        notes,
        status: "pending",
        created_by: userData.user?.id,
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setRequesterName("");
    setPhone("");
    setAddress("");
    setPreferredDate("");
    setPreferredTime("");
    setExpectedPeople("");
    setNotes("");

    onSaved();
  }

  return (
    <form onSubmit={saveBooking} className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
          <CalendarPlus size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            New Satsang Booking Request
          </h2>
          <p className="text-sm text-gray-500">
            Add a family or devotee request for Satsang booking.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={requesterName}
          onChange={(e) => setRequesterName(e.target.value)}
          placeholder="Requester name"
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
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
          type="date"
          required
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />

        <input
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          type="time"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />

        <input
          value={expectedPeople}
          onChange={(e) => setExpectedPeople(e.target.value)}
          placeholder="Expected gathering count"
          type="number"
          min="0"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address / location"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
        />
      </div>

      <button
        disabled={saving}
        className="mt-4 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Create Booking Request"}
      </button>
    </form>
  );
}