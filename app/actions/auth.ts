"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function authenticate(state: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // LOCAL DEV BYPASS — only active when Supabase is not configured
  // Remove this block after connecting a real Supabase project
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

  if (!isSupabaseConfigured) {
    if (email === "admin@dil.academy" && password === "admin123") {
      redirect("/dashboard");
    }
    return { error: "Invalid credentials. Use admin@dil.academy / admin123 for local preview." };
  }

  const supabase = createClient();



  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function ensureAdminProfileExists() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  const email = user.user.email?.toLowerCase() || "";
  const isAdmin =
    email === "admin@dil.academy" ||
    email.includes("kumaraditya") ||
    email === "arkashrios@gmail.com";

  if (!isAdmin) return null;

  const { data: academy } = await supabase
    .from("academies")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const profilePayload = {
    full_name: user.user.email?.split("@")[0] || "Admin",
    role: "super_admin",
    ...(academy?.id ? { academy_id: academy.id } : {}),
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.user.id)
    .maybeSingle();

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: user.user.id,
      ...profilePayload,
    });
    if (error) {
      await createAdminClient()?.from("profiles").upsert({
        id: user.user.id,
        ...profilePayload,
      });
    }
    return null;
  }

  const { error } = await supabase.from("profiles").update(profilePayload).eq("id", user.user.id);
  if (error) {
    await createAdminClient()?.from("profiles").update(profilePayload).eq("id", user.user.id);
  }
  return null;
}

export async function getUserRole() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  // Auto-heal admin profile first
  await ensureAdminProfileExists();

  // Safe fallback to grant full Admin rights to the owner / developer instantly
  const email = user.user.email?.toLowerCase() || "";
  if (
    email === "admin@dil.academy" ||
    email.includes("kumaraditya") ||
    email === "arkashrios@gmail.com"
  ) {
    return 'super_admin';
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.user.id)
    .single();

  return profile?.role || 'teacher';
}
