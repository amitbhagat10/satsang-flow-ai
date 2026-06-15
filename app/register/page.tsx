"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const { data: workspace } = await supabase
      .schema("satsangflow")
      .from("workspaces")
      .select("id")
      .eq("slug", "guruji-mandir-melbourne")
      .single();

    if (!workspace) {
      setMessage("Workspace not found.");
      return;
    }

    const { error } = await supabase
      .schema("satsangflow")
      .from("member_profiles")
      .insert({
        workspace_id: workspace.id,
        full_name: fullName,
        email,
        phone,
        role: "sangat",
        status: "pending",
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setFullName("");
    setEmail("");
    setPhone("");
    setMessage("Registration submitted. Admin approval required before login.");
  }

  return (
    <main className="min-h-screen bg-[#fff7ec] px-4 py-8">
      <section className="mx-auto max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#5d0b14] via-[#8f1d14] to-[#e95414] p-7 text-center text-white">
          <img
            src="/guruji-logo.jpg"
            alt="Guruji"
            className="mx-auto h-24 w-24 rounded-full border-4 border-[#ffd166] object-cover shadow-2xl"
          />

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.25em] text-[#ffd166]">
            Jai Guru Ji
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold">
            Sangat Registration
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/85">
            Register your profile. Admin will approve your access.
          </p>
        </div>

        <form onSubmit={register} className="space-y-4 p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-[#fff3e4] p-4 text-[#35170c]">
            <UserPlus className="text-[#e95414]" />
            <p className="font-bold">Create Sangat Profile</p>
          </div>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm outline-none"
          />

          {message && (
            <div className="rounded-2xl bg-orange-50 p-3 text-sm font-bold text-[#e95414]">
              {message}
            </div>
          )}

          <button className="w-full rounded-2xl bg-[#e95414] px-5 py-3 text-sm font-bold text-white shadow-lg">
            Submit Registration
          </button>
        </form>
      </section>
    </main>
  );
}
