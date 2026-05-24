"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ensureAdminProfileExists } from "./auth";
import { resolveCurrentAcademyId } from "./academy";

export async function fetchBatches() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  // Ensure administrator profile row exists in PostgreSQL
  await ensureAdminProfileExists();

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);

  const query = supabase.from("batches").select("*, instructor:profiles(full_name, id)");
  if (academyId) query.eq("academy_id", academyId);

  const { data } = await query.order("created_at", { ascending: false });
  return data || [];
}

export async function fetchInstructors() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);

  const query = supabase.from("profiles").select("id, full_name").eq("role", "teacher");
  if (academyId) query.eq("academy_id", academyId);

  const { data } = await query;
  return data || [];
}

export async function createBatch(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  // Ensure administrator profile row exists in PostgreSQL
  await ensureAdminProfileExists();

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found" };

  const name = formData.get("name") as string;
  const style = formData.get("style") as string;
  const max_capacity = parseInt(formData.get("max_capacity") as string, 10) || 30;
  const instructor_id = formData.get("instructor_id") as string;
  
  // Basic schedule parsing from form
  const days = formData.getAll("days");
  const time = formData.get("time") as string;
  const schedule = { days, time };

  const { error } = await supabase.from("batches").insert({
    academy_id: academyId,
    name,
    style,
    max_capacity,
    instructor_id: instructor_id || null,
    schedule,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/batches");
  return { success: true };
}

export async function updateBatch(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found" };

  const name = formData.get("name") as string;
  const style = formData.get("style") as string;
  const max_capacity = parseInt(formData.get("max_capacity") as string, 10) || 30;
  const instructor_id = formData.get("instructor_id") as string;
  
  const days = formData.getAll("days");
  const time = formData.get("time") as string;
  const schedule = { days, time };

  const { error } = await supabase.from("batches").update({
    name,
    style,
    max_capacity,
    instructor_id: instructor_id || null,
    schedule,
  }).eq("id", id).eq("academy_id", academyId);
  
  if (error) return { error: error.message };
  revalidatePath("/dashboard/batches");
  return { success: true };
}

export async function deleteBatch(id: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found" };

  const { error } = await supabase.from("batches").delete().eq("id", id).eq("academy_id", academyId);

  if (error) return { error: "Cannot delete batch. Students may still be enrolled." };
  revalidatePath("/dashboard/batches");
  return { success: true };
}
