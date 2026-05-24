"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { resolveCurrentAcademyId, slugifyAcademyName } from "./academy";

export async function fetchAcademySettings() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
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

  let academyId = await resolveCurrentAcademyId(supabase, user.user.id);

  if (!academyId) {
    const academyPayload = {
      ...updates,
      slug: slugifyAcademyName(updates.name),
    };

    const { data: academy, error: createError } = await supabase
      .from("academies")
      .insert(academyPayload)
      .select("id")
      .single();

    if (createError) {
      const adminClient = createAdminClient();
      const { data: adminAcademy, error: adminCreateError } = adminClient
        ? await adminClient.from("academies").insert(academyPayload).select("id").single()
        : { data: null, error: createError };

      if (adminCreateError || !adminAcademy?.id) {
        return { error: adminCreateError?.message || createError.message };
      }

      academyId = adminAcademy.id;
    } else {
      academyId = academy.id;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ academy_id: academyId })
      .eq("id", user.user.id);

    if (profileError) {
      await createAdminClient()
        ?.from("profiles")
        .update({ academy_id: academyId, role: "super_admin" })
        .eq("id", user.user.id);
    }
  }

  const { error } = await supabase.from('academies').update(updates).eq('id', academyId);
  if (error) {
    const adminClient = createAdminClient();
    const { error: adminUpdateError } = adminClient
      ? await adminClient.from("academies").update(updates).eq("id", academyId)
      : { error };

    if (adminUpdateError) return { error: adminUpdateError.message };
  }
  revalidatePath('/dashboard/settings');
  return { success: true };
}
