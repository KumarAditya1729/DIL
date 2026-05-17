"use server";

import { createClient } from "@/lib/supabase/server";
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
