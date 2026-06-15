"use client";

import Link from "next/link";
import { CalendarPlus, HeartHandshake, Radio, PlayCircle, Phone } from "lucide-react";

export default function SangatHomePage() {
  return (
    <main className="min-h-screen bg-[#fff7ec] px-4 py-6">
      <section className="mx-auto max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#5d0b14] via-[#8f1d14] to-[#e95414] p-6 text-center text-white">
          <img
            src="/guruji-logo.jpg"
            alt="Guruji"
            className="mx-auto h-28 w-28 rounded-full border-4 border-[#ffd166] object-cover shadow-2xl"
          />

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd166]">
            Jai Guru Ji
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold">
            Guruji Mandir Melbourne
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/85">
            Request Satsang, listen to Guruji Radio and join Live Satsang from one app.
          </p>
        </div>

        <div className="grid gap-3 p-5">
          <Link
            href="/booking-request"
            className="flex items-center gap-4 rounded-3xl bg-[#fff3e4] p-5 text-[#35170c] shadow-sm"
          >
            <div className="rounded-2xl bg-[#e95414] p-3 text-white">
              <CalendarPlus size={24} />
            </div>
            <div>
              <p className="font-bold">Request Satsang Booking</p>
              <p className="text-sm text-gray-600">Submit preferred date and time</p>
            </div>
          </Link>

          <Link
            href="/live-satsang"
            className="flex items-center gap-4 rounded-3xl bg-[#fff3e4] p-5 text-[#35170c] shadow-sm"
          >
            <div className="rounded-2xl bg-[#5d0b14] p-3 text-white">
              <PlayCircle size={24} />
            </div>
            <div>
              <p className="font-bold">Watch Live Satsang</p>
              <p className="text-sm text-gray-600">Join live from your phone</p>
            </div>
          </Link>

          <Link
            href="/radio-library"
            className="flex items-center gap-4 rounded-3xl bg-[#fff3e4] p-5 text-[#35170c] shadow-sm"
          >
            <div className="rounded-2xl bg-[#d97706] p-3 text-white">
              <Radio size={24} />
            </div>
            <div>
              <p className="font-bold">Guruji Radio</p>
              <p className="text-sm text-gray-600">Listen to spiritual songs</p>
            </div>
          </Link>

          <Link
            href="/events"
            className="flex items-center gap-4 rounded-3xl bg-[#fff3e4] p-5 text-[#35170c] shadow-sm"
          >
            <div className="rounded-2xl bg-[#249447] p-3 text-white">
              <HeartHandshake size={24} />
            </div>
            <div>
              <p className="font-bold">Upcoming Events</p>
              <p className="text-sm text-gray-600">View scheduled Satsang events</p>
            </div>
          </Link>

          <a
            href="tel:"
            className="flex items-center gap-4 rounded-3xl bg-[#fff3e4] p-5 text-[#35170c] shadow-sm"
          >
            <div className="rounded-2xl bg-[#7c3aed] p-3 text-white">
              <Phone size={24} />
            </div>
            <div>
              <p className="font-bold">Contact Mandir</p>
              <p className="text-sm text-gray-600">Call or contact support</p>
            </div>
          </a>
        </div>
      </section>
    </main>
  );
}
