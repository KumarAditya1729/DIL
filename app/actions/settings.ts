"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchAcademySettings() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;
  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return null;
  const { data } = await supabase.from('academies').select('*').eq('id', profile.academy_id).single();
  return data;
}

export async function updateAcademySettings(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return { error: "No academy found" };

  const updates = {
    name: formData.get("name") as string,
    contact_email: formData.get("email") as string,
    contact_phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };

  const { error } = await supabase.from('academies').update(updates).eq('id', profile.academy_id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/settings');
  return { success: true };
}
