interface MobileEnv {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

function readEnv(): MobileEnv {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and " +
        "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see apps/mobile/.env.example).",
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}

export const env = readEnv();
