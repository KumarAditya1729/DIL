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

  return (data || []).map((e: any) => {
    // Parse description to extract cover_image and gallery if they were stuffed there
    let cover_image = e.cover_image || "";
    let gallery = e.gallery || [];
    let desc = e.description || "";
    
    try {
      if (desc.startsWith("JSON:")) {
        const parsed = JSON.parse(desc.replace("JSON:", ""));
        cover_image = cover_image || parsed.cover_image || "";
        gallery = (gallery.length > 0 ? gallery : parsed.gallery) || [];
        desc = parsed.description || "";
      }
    } catch (e) {}

    return {
      id: e.id,
      title: e.title,
      date: e.event_date,
      time: e.event_time || '',
      venue: e.venue || '',
      type: e.status || 'Main Event',
      description: desc,
      cover_image,
      gallery,
      participants: e.event_participants?.[0]?.count || 0
    };
  });
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

  const title = formData.get("title") as string;
  const event_date = formData.get("date") as string;
  const event_time = formData.get("time") as string;
  const venue = formData.get("venue") as string;
  const status = formData.get("type") as string;
  const cover_image = formData.get("cover_image") as string || "";
  const description = formData.get("description") as string || "";

  if (!title || !event_date || !venue) {
    return { error: "Missing required fields" };
  }

  // Stuff extra data into description to prevent DB errors if schema is out of date
  const stuffedDescription = "JSON:" + JSON.stringify({ description, cover_image, gallery: [] });

  const { error } = await supabase.from('events').insert({
    academy_id: profile?.academy_id,
    title,
    event_date,
    event_time,
    venue,
    status,
    description: stuffedDescription,
  });

  if (error) return { error: error.message };

  revalidatePath('/dashboard/events');
  return { success: true };
}

export async function uploadEventGallery(eventId: string, imageUrls: string[]) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized" };

  // Get current
  const { data: current } = await supabase.from('events').select('description, gallery').eq('id', eventId).single();
  if (!current) return { error: "Event not found" };

  let descStr = current.description || "";
  let parsed = { description: descStr, cover_image: "", gallery: current.gallery || [] };

  if (descStr.startsWith("JSON:")) {
    try {
      parsed = JSON.parse(descStr.replace("JSON:", ""));
    } catch(e) {}
  }

  parsed.gallery = [...(parsed.gallery || []), ...imageUrls];

  const { error } = await supabase.from('events').update({
    description: "JSON:" + JSON.stringify(parsed)
  }).eq('id', eventId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/events');
  return { success: true };
}
