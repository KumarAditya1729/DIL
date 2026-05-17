"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fetchEvents() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return [];

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_participants ( count )
    `)
    .order('event_date', { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    date: e.event_date,
    time: e.event_time || '',
    venue: e.venue || '',
    type: e.status || 'Main Event', // Assuming status is used for type in this UI
    participants: e.event_participants?.[0]?.count || 0
  }));
}

export async function createEvent(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from('profiles')
    .select('academy_id')
    .eq('id', user.user.id)
    .single();

  const academyId = profile?.academy_id;

  const data = {
    title: formData.get("title") as string,
    event_date: formData.get("date") as string,
    event_time: formData.get("time") as string,
    venue: formData.get("venue") as string,
    status: formData.get("type") as string,
  };

  if (!data.title || !data.event_date || !data.venue) {
    return { error: "Missing required fields" };
  }

  const { error } = await supabase.from('events').insert({
    ...(academyId ? { academy_id: academyId } : {}),
    ...data
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/events');
  return { success: true };
}
