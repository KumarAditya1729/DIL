"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveCurrentAcademyId } from "./academy";

export async function fetchBroadcasts() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return [];

  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createBroadcast(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy found" };

  const insert = {
    academy_id: academyId,
    user_id: user.user.id,
    title: formData.get("audience") as string,
    message: formData.get("message") as string,
    type: formData.get("channel") as string,
  };

  const { error } = await supabase.from('notifications').insert(insert);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/communication');
  return { success: true };
}

export async function fetchLiveNotifications() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return [];

  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('academy_id', academyId)
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}

export async function markNotificationAsRead(id: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };
  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy" };

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('academy_id', academyId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const academyId = await resolveCurrentAcademyId(supabase, user.user.id);
  if (!academyId) return { error: "No academy" };

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('academy_id', academyId).eq('is_read', false);
  if (error) return { error: error.message };
  return { success: true };
}
