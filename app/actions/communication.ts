"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchBroadcasts() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];
  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return [];

  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('academy_id', profile.academy_id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createBroadcast(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return { error: "No academy found" };

  const insert = {
    academy_id: profile.academy_id,
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

  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return [];

  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('academy_id', profile.academy_id)
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}

export async function markNotificationAsRead(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', user.user.id).single();
  if (!profile?.academy_id) return { error: "No academy" };

  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('academy_id', profile.academy_id).eq('is_read', false);
  if (error) return { error: error.message };
  return { success: true };
}
