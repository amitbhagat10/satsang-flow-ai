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
  Music,
  Video,
  Settings as SettingsIcon,
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
    { label: "Home", href: "/", icon: Home },
    { label: "Booking", href: "/booking-request", icon: CalendarPlus },
    { label: "Events", href: "/events", icon: HeartHandshake },
    { label: "Live", href: "/live-satsang", icon: Radio },
    { label: "Studio", href: "/live-studio", icon: Video },
    { label: "Radio", href: "/radio-library", icon: Music },
    { label: "Donations", href: "/donations", icon: DollarSign },
    { label: "Expenses", href: "/expenses", icon: ReceiptText },
    { label: "Staff", href: "/staff", icon: Users },
    { label: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fff7ec] text-[#34170d]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[310px] overflow-hidden bg-gradient-to-b from-[#4b0711] via-[#5d0b14] to-[#210306] text-white shadow-2xl xl:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffb84a33,transparent_35%),radial-gradient(circle_at_bottom,#ff3f6d22,transparent_38%)]" />

        <div className="relative z-10 flex h-full min-h-0 flex-col px-5 py-6">
          <div className="shrink-0 text-center">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle,#fff7cc_0%,#ffbe3d_33%,#9b1c16_70%)] p-2 shadow-[0_0_60px_rgba(255,185,65,0.55)]">
              <img
                src="/guruji-logo.jpg"
                alt="Guruji"
                className="h-full w-full rounded-full object-cover"
              />
            </div>

            <p className="mt-4 text-lg font-bold text-[#ffd166]">
              SevaSangam
            </p>

            <h1 className="mt-1 font-serif text-3xl font-bold leading-tight">
              Guruji Mandir
            </h1>

            <p className="mx-auto mt-3 max-w-[220px] text-xs leading-5 text-white/75">
              Bookings, donations, radio and live satsang management.
            </p>
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col">
            <nav className="min-h-0 flex-1 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-black/20">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between border-b border-white/10 px-5 py-3.5 text-sm font-bold transition last:border-b-0 ${
                      active
                        ? "bg-gradient-to-r from-[#ffb020] to-[#ffd36a] text-[#321306]"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <Icon size={20} />
                      {item.label}
                    </span>
                    {active && <ChevronRight size={18} />}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-4 flex shrink-0 items-center justify-center gap-3 rounded-[1.2rem] border border-[#ff6b7a]/35 bg-[#7a1024]/50 px-5 py-3 text-sm font-bold text-[#ffb1b9]"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[310px]">
        {/* MOBILE HEADER */}
        <header className="sticky top-0 z-30 border-b border-[#efd7b7] bg-[#fff7ec]/95 px-4 py-3 backdrop-blur-xl xl:px-8 xl:py-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-[#d94a12] sm:text-xs">
                SevaSangam Portal
              </p>

              <h2 className="mt-1 truncate font-serif text-xl font-bold text-[#32170d] sm:text-3xl xl:text-4xl">
                {workspaceName || "Guruji Mandir Melbourne"}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-black text-[#d94a12] shadow md:block">
                {role ? role.toUpperCase() : "USER"}
              </div>

              <img
                src="/guruji-logo.jpg"
                alt="Guruji"
                className="h-12 w-12 rounded-full border-2 border-[#ffd166] bg-white object-cover shadow-lg xl:h-16 xl:w-16"
              />
            </div>
          </div>
        </header>

        {/* MOBILE QUICK MENU */}
        <div className="sticky top-[73px] z-20 overflow-x-auto border-b border-orange-100 bg-white/95 px-3 py-2 shadow-sm backdrop-blur xl:hidden">
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                    active
                      ? "bg-[#e95414] text-white"
                      : "bg-[#fff3e4] text-[#7c2d12]"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-3 pb-36 pt-4 sm:px-5 xl:px-8 xl:py-8">
          {children}
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-100 bg-white/95 px-2 py-2 shadow-[0_-10px_30px_rgba(120,53,15,0.12)] backdrop-blur-xl xl:hidden">
          <div className="grid grid-cols-5 gap-1">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-bold ${
                    active
                      ? "bg-[#fff3e4] text-[#e95414]"
                      : "text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                  <span className="mt-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <GurujiRadioPlayer />
      <InstallAppButton />
    </div>
  );
}
