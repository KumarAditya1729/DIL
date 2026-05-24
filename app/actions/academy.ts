import { createClient } from "@/lib/supabase/server";
import { ensureAdminProfileExists } from "./auth";

export function slugifyAcademyName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "academy";
}

export async function resolveCurrentAcademyId(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
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

  if (!academy?.id) return null;

  await supabase
    .from("profiles")
    .update({ academy_id: academy.id })
    .eq("id", userId);

  return academy.id as string;
}
