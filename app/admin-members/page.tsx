"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getMyWorkspace } from "@/lib/workspace";
import { supabase } from "@/lib/supabase";
import { CheckCircle, UserCheck, XCircle } from "lucide-react";

type Workspace = { id: string; name: string; slug: string };

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  member_number: string | null;
  role: string;
  status: string;
  created_at: string;
};

export default function AdminMembersPage() {
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  async function loadMembers() {
    const result = await getMyWorkspace();

    if (result.error === "Not logged in") {
      router.push("/login");
      return;
    }

    if (!result.workspace) return;

    const activeWorkspace = result.workspace as unknown as Workspace;
    setWorkspace(activeWorkspace);
    setRole(result.role);

    const { data } = await supabase
      .schema("satsangflow")
      .from("member_profiles")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("created_at", { ascending: false });

    setMembers(data || []);
  }

  function makeMemberNumber() {
    return `GMM-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  async function updateMember(member: Member, newStatus: string, newRole?: string) {
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase
      .schema("satsangflow")
      .from("member_profiles")
      .update({
        status: newStatus,
        role: newRole || member.role,
        member_number: member.member_number || makeMemberNumber(),
        approved_at: newStatus === "approved" ? new Date().toISOString() : null,
        approved_by: userData.user?.id,
      })
      .eq("id", member.id);

    if (error) {
      alert(error.message);
      return;
    }

    loadMembers();
  }

  useEffect(() => {
    loadMembers();
  }, []);

  if (!workspace) {
    return <main className="min-h-screen bg-[#fff7ec] p-6">Loading...</main>;
  }

  return (
    <AppShell workspaceName={workspace.name} role={role}>
      <section className="mb-6 rounded-[2rem] bg-white p-8 shadow-[0_20px_55px_rgba(120,53,15,0.16)]">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d94a12]">
          Admin Approval
        </p>

        <h1 className="mt-4 font-serif text-5xl font-bold text-[#35170c]">
          Member Approvals
        </h1>

        <p className="mt-4 max-w-2xl text-gray-600">
          Approve Sangat registrations and mark selected members as Sevadar.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_18px_48px_rgba(90,35,12,0.12)]">
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No registrations yet.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-orange-100 bg-[#fffaf3] p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="font-bold text-[#35170c]">{member.full_name}</p>
                    <p className="text-sm text-gray-600">
                      {member.email || "-"} · {member.phone || "-"}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#e95414]">
                      {member.role} · {member.status} · {member.member_number || "No member number"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateMember(member, "approved", "sangat")}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700"
                    >
                      <CheckCircle size={15} />
                      Approve Sangat
                    </button>

                    <button
                      onClick={() => updateMember(member, "approved", "sevadar")}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700"
                    >
                      <UserCheck size={15} />
                      Approve Sevadar
                    </button>

                    <button
                      onClick={() => updateMember(member, "rejected")}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
