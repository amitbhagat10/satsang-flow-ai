"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    const { data: workspace, error: workspaceError } = await supabase
      .schema("satsangflow")
      .from("workspaces")
      .select("id")
      .eq("slug", "guruji-mandir-melbourne")
      .single();

    if (workspaceError || !workspace) {
      setSaving(false);
      setMessage("Workspace not found. Please contact admin.");
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

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setFullName("");
    setEmail("");
    setPhone("");
    setMessage("Registration submitted successfully. Admin approval is required before login.");
  }

  return (
    <main className="min-h-screen bg-[#fff7ec] px-4 py-6">
      <section className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-[#5d0b14] via-[#8f1d14] to-[#e95414] px-6 py-8 text-center text-white">
          <img
            src="/guruji-logo.jpg"
            alt="Guruji"
            className="mx-auto h-24 w-24 rounded-full border-4 border-[#ffd166] bg-white object-cover shadow-2xl"
          />

          <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-[#ffd166]">
            Jai Guru Ji
          </p>

          <h1 className="mt-3 font-serif text-3xl font-bold leading-tight">
            Sangat Registration
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/85">
            Create your profile for Guruji Mandir Melbourne. Admin approval is required.
          </p>
        </div>

        <form onSubmit={register} className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-[#fff3e4] p-4 text-[#35170c]">
            <UserPlus className="shrink-0 text-[#e95414]" size={22} />
            <div>
              <p className="font-bold">Create Sangat Profile</p>
              <p className="text-xs text-gray-600">Fill your details below</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#35170c]">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-base text-[#35170c] outline-none placeholder:text-gray-400 focus:border-[#e95414]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#35170c]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              type="email"
              className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-base text-[#35170c] outline-none placeholder:text-gray-400 focus:border-[#e95414]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-[#35170c]">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full rounded-2xl border border-orange-100 bg-[#fffaf3] px-4 py-3 text-base text-[#35170c] outline-none placeholder:text-gray-400 focus:border-[#e95414]"
            />
          </div>

          {message && (
            <div className="rounded-2xl bg-orange-50 p-3 text-sm font-bold text-[#e95414]">
              {message}
            </div>
          )}

          <button
            disabled={saving}
            className="w-full rounded-2xl bg-[#e95414] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c2410c] disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </section>
    </main>
  );
}
