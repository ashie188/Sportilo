import { createClient } from "@supabase/supabase-js";

const CHAT_SUPABASE_URL = process.env.CHAT_SUPABASE_URL;
const CHAT_SUPABASE_SECRET_KEY = process.env.CHAT_SUPABASE_SECRET_KEY;

if (!CHAT_SUPABASE_URL) {
  throw new Error("CHAT_SUPABASE_URL is not configured");
}

if (!CHAT_SUPABASE_SECRET_KEY) {
  throw new Error("CHAT_SUPABASE_SECRET_KEY is not configured");
}
/*
 * Server-side Supabase client.
 *
 * IMPORTANT:
 * This client uses the secret/service-role key and
 * must NEVER be exposed to the frontend.
 *
 * It is used only for trusted backend operations such as
 * checking chat_participants.
 */
const chatSupabase = createClient(CHAT_SUPABASE_URL, CHAT_SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default chatSupabase;
