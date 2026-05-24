"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureAdminProfileExists } from "./auth";
import { revalidatePath } from "next/cache";
import { resolveCurrentAcademyId } from "./academy";

export type Teacher = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  is_active: boolean;
  created_at: string;
  assigned_batches?: string[];
};

export async function fetchTeachers(): Promise<Teacher[]> {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return [];

  // Fetch all profiles with role = 'teacher' for this academy
  const { data: teachersData } = await supabase
    .from("profiles")
    .select("*")
    .eq("academy_id", academyId)
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  if (!teachersData || teachersData.length === 0) return [];

  // Get active batches to map assigned batches per teacher
  const { data: batches } = await supabase
    .from("batches")
    .select("name, instructor_id")
    .eq("academy_id", academyId);

  // Fetch emails from auth.users (if service role is available) or use metadata
  const adminClient = createAdminClient();
  let authUsers: any[] = [];
  if (adminClient) {
    try {
      const { data } = await adminClient.auth.admin.listUsers();
      authUsers = data?.users || [];
    } catch (e) {
      console.warn("Failed to list auth users:", e);
    }
  }

  return teachersData.map((t: any) => {
    // Match corresponding auth email if present
    const authUser = authUsers.find(u => u.id === t.id);
    const email = authUser?.email || t.avatar_url?.split("|")[1] || "No email";
    const specialty = t.avatar_url?.split("|")[0] || "General Dance";

    // Filter batches assigned to this instructor
    const assigned = (batches || [])
      .filter(b => b.instructor_id === t.id)
      .map(b => b.name);

    return {
      id: t.id,
      full_name: t.full_name,
      phone: t.phone || "—",
      email,
      specialty,
      is_active: t.is_active !== false,
      created_at: t.created_at,
      assigned_batches: assigned,
    };
  });
}

export async function createTeacher(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  await ensureAdminProfileExists();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const specialty = formData.get("specialty") as string || "General Dance";
  const password = formData.get("password") as string || "DILTeacher123!";

  if (!fullName || !email || !phone) {
    return { error: "Name, Email, and Phone number are required." };
  }

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) {
    return { error: "No associated academy found for your profile." };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      error: "⚠️ Action Blocked: Live teacher registration requires a valid SUPABASE_SERVICE_ROLE_KEY inside .env.local to safely configure their login credentials."
    };
  }

  try {
    // 1. Create auth user securely
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "teacher" }
    });

    if (authError) throw authError;
    if (!authUser.user) throw new Error("Failed to create auth credentials.");

    // 2. Insert corresponding profile row linked to the correct academy
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authUser.user.id,
      academy_id: academyId,
      role: "teacher",
      full_name: fullName,
      phone,
      avatar_url: `${specialty}|${email}`, // Store serialized metadata in standard column
      is_active: true
    });

    if (profileError) {
      // Rollback auth user if profile insertion failed to keep DB clean
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    revalidatePath("/dashboard/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create teacher:", error);
    return { error: error.message || "An unexpected database error occurred." };
  }
}

export async function deleteTeacher(id: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  await ensureAdminProfileExists();
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No associated academy found for your profile." };

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      error: "⚠️ Action Blocked: Live teacher deletion requires a valid SUPABASE_SERVICE_ROLE_KEY inside .env.local."
    };
  }

  try {
    // 1. Remove profile first (will safely raise FK error if they are assigned to active batches)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("academy_id", academyId);

    if (profileError) {
      return { error: "Cannot delete teacher. They might be assigned to active batches." };
    }

    // 2. Remove auth user cleanly
    await adminClient.auth.admin.deleteUser(id);

    revalidatePath("/dashboard/teachers");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete teacher:", error);
    return { error: error.message || "An unexpected database error occurred." };
  }
}
