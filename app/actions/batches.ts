"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchBatches() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .eq("id", user.user.id)
    .single();

  const query = supabase.from("batches").select("*, instructor:profiles(full_name, id)");
  if (profile?.academy_id) query.eq("academy_id", profile.academy_id);

  const { data } = await query.order("created_at", { ascending: false });
  return data || [];
}

export async function fetchInstructors() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .eq("id", user.user.id)
    .single();

  const query = supabase.from("profiles").select("id, full_name").eq("role", "teacher");
  if (profile?.academy_id) query.eq("academy_id", profile.academy_id);

  const { data } = await query;
  return data || [];
}

export async function createBatch(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .eq("id", user.user.id)
    .single();

  const name = formData.get("name") as string;
  const style = formData.get("style") as string;
  const max_capacity = parseInt(formData.get("max_capacity") as string, 10) || 30;
  const instructor_id = formData.get("instructor_id") as string;
  
  // Basic schedule parsing from form
  const days = formData.getAll("days");
  const time = formData.get("time") as string;
  const schedule = { days, time };

  const { error } = await supabase.from("batches").insert({
    academy_id: profile?.academy_id,
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
  }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/batches");
  return { success: true };
}

export async function deleteBatch(id: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const { error } = await supabase.from("batches").delete().eq("id", id);

  if (error) return { error: "Cannot delete batch. Students may still be enrolled." };
  revalidatePath("/dashboard/batches");
  return { success: true };
}
