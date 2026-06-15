"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("amitbhagat10@yahoo.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f4eb] p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">
        <div className="relative hidden min-h-[620px] md:block">
          <img
            src="/guruji.jpg"
            alt="Guruji"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">
              Guruji Mandir Melbourne
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Satsang Management
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/85">
              Bookings, donations, expenses and seva team management in one
              elegant platform.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/guruji.jpg"
              alt="Guruji"
              className="h-14 w-14 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <p className="text-sm font-medium text-orange-700">
                SevaSangam
              </p>
              <h2 className="text-xl font-bold text-gray-950">Sign in</h2>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Login to manage bookings, donations, expenses and Satsang events.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            {errorMsg && (
              <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}