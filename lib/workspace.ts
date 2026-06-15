import { supabase } from "./supabase";

export async function getMyWorkspace() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { workspace: null, role: null, error: "Not logged in" };
  }

  const { data, error } = await supabase
    .schema("satsangflow")
    .from("workspace_members")
    .select("role, workspaces:workspace_id(id, name, slug)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !data) {
    console.error("Workspace lookup error:", error?.message);
    return { workspace: null, role: null, error: error?.message };
  }

  return {
    workspace: data.workspaces,
    role: data.role,
    error: null,
  };
}