"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMyWorkspace } from "@/lib/workspace";
import AppShell from "@/components/layout/AppShell";
import BookingRequestsPanel from "@/components/bookings/BookingRequestsPanel";
import FinanceQuickEntry from "@/components/finance/FinanceQuickEntry";
import {
  CalendarDays,
  HeartHandshake,
  DollarSign,
  ReceiptText,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

type Workspace = {
  id: string;
  name: string;
  slug: string;
};

type Summary = {
  workspace_id: string;
  report_date: string;
  donations_today: number;
  expenses_today: number;
  net_balance_today: number;
  pending_booking_requests: number;
  events_today: number;
  gathering_count_today: number;
};

export default function SatsangDashboard() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);

    const workspaceResult = await getMyWorkspace();

    if (workspaceResult.error === "Not logged in") {
      router.push("/login");
      return;
    }

    if (!workspaceResult.workspace) {
      setLoading(false);
      return;
    }

    const activeWorkspace = workspaceResult.workspace as unknown as Workspace;

    setWorkspace(activeWorkspace);
    setRole(workspaceResult.role);

    const { data, error } = await supabase
      .schema("satsangflow")
      .from("v_daily_finance_summary")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .single();

    if (error) {
      console.error("Dashboard summary error:", error.message);
    }

    if (data) {
      setSummary(data as Summary);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7ec] p-6">
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="min-h-screen bg-[#fff7ec] p-6">
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <h1 className="text-xl font-semibold text-gray-900">
            No workspace found
          </h1>
        </div>
      </main>
    );
  }

  const cards = [
    {
      title: "Pending Bookings",
      value: summary?.pending_booking_requests ?? 0,
      subtitle: "Need approval",
      icon: CalendarDays,
      color: "text-[#e95414]",
      bg: "bg-orange-50",
    },
    {
      title: "Events Today",
      value: summary?.events_today ?? 0,
      subtitle: "Scheduled today",
      icon: HeartHandshake,
      color: "text-[#d94670]",
      bg: "bg-pink-50",
    },
    {
      title: "Donations Today",
      value: `$${Number(summary?.donations_today ?? 0).toLocaleString()}`,
      subtitle: "Received today",
      icon: DollarSign,
      color: "text-[#249447]",
      bg: "bg-green-50",
    },
    {
      title: "Expenses Today",
      value: `$${Number(summary?.expenses_today ?? 0).toLocaleString()}`,
      subtitle: "Paid today",
      icon: ReceiptText,
      color: "text-[#2473c9]",
      bg: "bg-blue-50",
    },
    {
      title: "Net Balance",
      value: `$${Number(summary?.net_balance_today ?? 0).toLocaleString()}`,
      subtitle: "Today",
      icon: TrendingUp,
      color: "text-[#b7791f]",
      bg: "bg-amber-50",
    },
    {
      title: "Gathering Count",
      value: summary?.gathering_count_today ?? 0,
      subtitle: "People attended",
      icon: Users,
      color: "text-[#7c3aed]",
      bg: "bg-purple-50",
    },
  ];

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fffdf8_0%,#fff7ec_50%,#ffe0c2_100%)]" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,#ffd16666,transparent_58%)]" />

        <div className="relative z-10 grid min-h-[320px] items-center gap-8 p-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
              Jai Guru Ji
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-px w-24 bg-[#d97706]" />
              <span className="text-[#d97706]">✦</span>
            </div>

            <h1 className="mt-7 font-serif text-5xl font-bold text-[#35170c]">
              Welcome back
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-gray-600">
              Manage Satsang bookings, approvals, donations, expenses and seva
              activities for Guruji Mandir Melbourne.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/booking-request"
                className="rounded-full bg-[#e95414] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c]"
              >
                New Booking
              </Link>

              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#d94a12] shadow-lg hover:bg-orange-50"
              >
                View Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative flex justify-end">
            <div className="absolute right-8 top-4 h-64 w-64 rounded-full bg-[#ffd166]/50 blur-3xl" />
            <img
              src="/guruji-logo.jpg"
              alt="Guruji"
              className="relative z-10 max-h-80 rounded-[2rem] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="relative overflow-hidden rounded-[1.7rem] bg-white p-7 shadow-[0_16px_42px_rgba(120,53,15,0.11)] transition hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(120,53,15,0.18)]"
            >
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-orange-50 to-orange-100" />

              <div className="relative z-10">
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${card.bg}`}
                >
                  <Icon className={card.color} size={30} />
                </div>

                <p className="text-sm font-black uppercase tracking-[0.12em] text-gray-500">
                  {card.title}
                </p>

                <p className={`mt-5 font-serif text-5xl font-bold ${card.color}`}>
                  {card.value}
                </p>

                <p className="mt-3 text-sm text-gray-500">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      <FinanceQuickEntry workspaceId={workspace.id} onSaved={loadDashboard} />

      <BookingRequestsPanel workspaceId={workspace.id} />
    </AppShell>
  );
}