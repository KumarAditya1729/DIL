// Environment variable validation utility

const requiredServerEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

export function validateEnv() {
  const missing = requiredServerEnvVars.filter(
    (key) => !process.env[key] || process.env[key] === "" || process.env[key]?.includes("placeholder")
  );

  if (missing.length > 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `❌ Missing required environment variables: ${missing.join(", ")}`
      );
    } else {
      console.warn(
        `⚠️ Missing environment variables: ${missing.join(", ")}. Mock data will be used.`
      );
    }
  }
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "mock_url",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock_key",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "mock_secret",
  cronSecret: process.env.CRON_SECRET || "mock_cron",
  isProduction: process.env.NODE_ENV === "production",
};
