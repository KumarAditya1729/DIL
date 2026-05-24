"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ensureAdminProfileExists } from "./auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "academy";
}

async function resolveAcademyId(supabase: ReturnType<typeof createClient>, userId: string) {
  await ensureAdminProfileExists();

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.academy_id) return profile.academy_id as string;

  const { data: academy } = await supabase
    .from("academies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (academy?.id) {
    await supabase
      .from("profiles")
      .update({ academy_id: academy.id })
      .eq("id", userId);
    return academy.id as string;
  }

  return null;
}

export async function fetchAcademySettings() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const academyId = await resolveAcademyId(supabase, user.user.id);
  if (!academyId) return null;

  const { data } = await supabase.from('academies').select('*').eq('id', academyId).single();
  return data;
}

export async function updateAcademySettings(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const updates = {
    name: formData.get("name") as string,
    contact_email: formData.get("email") as string,
    contact_phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };

  let academyId = await resolveAcademyId(supabase, user.user.id);

  if (!academyId) {
    const { data: academy, error: createError } = await supabase
      .from("academies")
      .insert({
        ...updates,
        slug: slugify(updates.name),
      })
      .select("id")
      .single();

    if (createError) return { error: createError.message };
    academyId = academy.id;

    await supabase
      .from("profiles")
      .update({ academy_id: academyId })
      .eq("id", user.user.id);
  }

  const { error } = await supabase.from('academies').update(updates).eq('id', academyId);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/settings');
  return { success: true };
}
