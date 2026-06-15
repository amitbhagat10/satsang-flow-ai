"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, CalendarPlus } from "lucide-react";

type BookingRequest = {
  id: string;
  workspace_id: string;
  requester_name: string;
  phone: string | null;
  address: string | null;
  preferred_date: string;
  preferred_time: string | null;
  expected_people: number | null;
  notes: string | null;
  status: string;
};

type Props = {
  workspaceId: string;
};

export default function BookingRequestsPanel({ workspaceId }: Props) {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    setLoading(true);

    const { data, error } = await supabase
      .schema("satsangflow")
      .from("booking_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("preferred_date", { ascending: true });

    if (error) {
      console.error("Bookings load error:", error.message);
    } else {
      setBookings(data || []);
    }

    setLoading(false);
  }

  async function approveBooking(booking: BookingRequest) {
    const { data: userData } = await supabase.auth.getUser();

    const { error: eventError } = await supabase
      .schema("satsangflow")
      .from("events")
      .insert({
        workspace_id: booking.workspace_id,
        booking_request_id: booking.id,
        title: "Satsang Booking",
        event_date: booking.preferred_date,
        event_time: booking.preferred_time,
        location: booking.address,
        expected_people: booking.expected_people,
        status: "scheduled",
        notes: booking.notes,
        created_by: userData.user?.id,
      });

    if (eventError) {
      console.error("Event create error:", eventError.message);
      alert(eventError.message);
      return;
    }

    const { error: updateError } = await supabase
      .schema("satsangflow")
      .from("booking_requests")
      .update({
        status: "approved",
        approved_date: booking.preferred_date,
        approved_time: booking.preferred_time,
        approved_by: userData.user?.id,
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Booking approve error:", updateError.message);
      alert(updateError.message);
      return;
    }

    await loadBookings();
  }

  async function rejectBooking(id: string) {
    const { error } = await supabase
      .schema("satsangflow")
      .from("booking_requests")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      console.error("Reject booking error:", error.message);
      alert(error.message);
      return;
    }

    await loadBookings();
  }

  useEffect(() => {
    loadBookings();
  }, [workspaceId]);

  return (
    <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            Satsang Booking Requests
          </h2>
          <p className="text-sm text-gray-500">
            Approve requests and automatically create Satsang events.
          </p>
        </div>

        <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
          <CalendarPlus size={24} />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading booking requests...</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-500">No booking requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Name</th>
                <th>Phone</th>
                <th>Preferred Date</th>
                <th>Time</th>
                <th>People</th>
                <th>Address</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0">
                  <td className="py-4 font-medium text-gray-900">
                    {booking.requester_name}
                  </td>
                  <td className="text-gray-600">{booking.phone || "-"}</td>
                  <td className="text-gray-600">{booking.preferred_date}</td>
                  <td className="text-gray-600">
                    {booking.preferred_time || "-"}
                  </td>
                  <td className="text-gray-600">
                    {booking.expected_people || "-"}
                  </td>
                  <td className="max-w-[220px] truncate text-gray-600">
                    {booking.address || "-"}
                  </td>
                  <td>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                      {booking.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {booking.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => approveBooking(booking)}
                          className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          <CheckCircle size={15} />
                          Approve
                        </button>

                        <button
                          onClick={() => rejectBooking(booking.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}