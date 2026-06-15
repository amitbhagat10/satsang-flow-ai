"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InstallAppButton from "@/components/pwa/InstallAppButton";
import GurujiRadioPlayer from "@/components/radio/GurujiRadioPlayer";
import {
  CalendarPlus,
  HeartHandshake,
  ReceiptText,
  DollarSign,
  Users,
  LogOut,
  Home,
  ChevronRight,
  Radio,
  Video,
  Music,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  workspaceName?: string;
  role?: string | null;
};

export default function AppShell({ children, workspaceName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "New Booking", href: "/booking-request", icon: CalendarPlus },
    { label: "Satsang Events", href: "/events", icon: HeartHandshake },
    { label: "Live Satsang", href: "/live-satsang", icon: Radio },
    { label: "Live Studio", href: "/live-studio", icon: Video },
    { label: "Radio Library", href: "/radio-library", icon: Music },
    { label: "Donations", href: "/donations", icon: DollarSign },
    { label: "Expenses", href: "/expenses", icon: ReceiptText },
    { label: "Staff", href: "/staff", icon: Users },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#fff7ec] text-[#34170d]">
      <aside className="fixed left-0 top-0 hidden h-screen w-[310px] overflow-hidden bg-gradient-to-b from-[#4b0711] via-[#5d0b14] to-[#210306] text-white shadow-2xl xl:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffb84a33,transparent_35%),radial-gradient(circle_at_bottom,#ff3f6d22,transparent_38%)]" />

        <div className="relative z-10 flex h-full min-h-0 flex-col px-5 py-6">
          <div className="shrink-0 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[radial-gradient(circle,#fff7cc_0%,#ffbe3d_33%,#9b1c16_70%)] p-2 shadow-[0_0_60px_rgba(255,185,65,0.55)]">
              <img
                src="/guruji-logo.jpg"
                alt="Guruji"
                className="h-full w-full rounded-full object-cover"
              />
            </div>

            <p className="mt-5 text-lg font-bold text-[#ffd166]">
              SevaSangam
            </p>

            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">
              Guruji Mandir
            </h1>

            <div className="mx-auto mt-4 flex w-32 items-center gap-3">
              <div className="h-px flex-1 bg-[#d99a2b]" />
              <span className="text-[#ffd166]">✦</span>
              <div className="h-px flex-1 bg-[#d99a2b]" />
            </div>

            <p className="mx-auto mt-4 max-w-[220px] text-xs leading-5 text-white/80">
              Bookings, donations, expenses and seva management for Melbourne
              Satsang community.
            </p>
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <nav className="min-h-0 flex-1 overflow-y-auto rounded-[1.6rem] border border-white/10 bg-black/20 pb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between border-b border-white/10 px-5 py-4 text-sm font-bold transition last:border-b-0 ${
                      active
                        ? "bg-gradient-to-r from-[#ffb020] to-[#ffd36a] text-[#321306] shadow-[0_0_28px_rgba(255,176,32,0.45)]"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <Icon size={21} />
                      {item.label}
                    </span>

                    {active && <ChevronRight size={18} />}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-5 flex shrink-0 items-center justify-center gap-3 rounded-[1.5rem] border border-[#ff6b7a]/35 bg-[#7a1024]/50 px-5 py-4 text-sm font-bold text-[#ffb1b9] hover:bg-[#93142b]/70"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[310px]">
        <header className="sticky top-0 z-20 border-b border-[#efd7b7] bg-[#fff7ec]/90 px-8 py-6 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-[#d94a12]">
                SevaSangam Management Portal
              </p>

              <h2 className="mt-2 font-serif text-4xl font-bold text-[#32170d]">
                {workspaceName || "Guruji Mandir Melbourne"}
              </h2>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px w-32 bg-gradient-to-r from-[#d97706] to-transparent" />
                <span className="text-lg text-[#d97706]">✦</span>
                <div className="h-px w-32 bg-gradient-to-l from-[#d97706] to-transparent" />
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="rounded-full bg-white px-6 py-3 text-sm font-black text-[#d94a12] shadow-lg">
                {role ? role.toUpperCase() : "USER"}
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ffd166] via-[#f97316] to-[#7c2d12] p-[4px] shadow-[0_15px_45px_rgba(217,74,18,0.35)]">
                <div className="h-full w-full rounded-full bg-white p-1.5">
                  <img
                    src="/guruji-logo.jpg"
                    alt="Guruji"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>


        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-100 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(120,53,15,0.12)] backdrop-blur-xl xl:hidden">
          <div className="grid grid-cols-5 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[10px] font-bold ${
                    active
                      ? "bg-[#fff3e4] text-[#e95414]"
                      : "text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                  <span className="mt-1 truncate">{item.label.replace("Satsang ", "")}</span>
                </Link>
              );
            })}
          </div>
        </nav>


        <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 xl:px-8 xl:py-8">{children}</main>
      </div>
      <GurujiRadioPlayer />
      <InstallAppButton />
    </div>
  );
}