import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_CHAT_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_CHAT_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("VITE_CHAT_SUPABASE_URL is not configured");
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("VITE_CHAT_SUPABASE_PUBLISHABLE_KEY is not configured");
}

/*
 * Single browser-side Supabase client.
 *
 * Important:
 * - This client uses only the publishable key.
 * - The Supabase secret/service-role key must NEVER
 *   be included in frontend code.
 * - Authentication for chat is supplied explicitly
 *   through the short-lived Chat JWT.
 */
const chatSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },

  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const createChatClient = () => {
  return chatSupabase;
};

/*
 * Set the JWT used by Supabase Realtime.
 *
 * Read tokens are used for viewing chat.
 * The authenticated write token is obtained only
 * when the user attempts to send a message.
 */
export const setChatRealtimeAuth = async (token) => {
  if (typeof token !== "string" || token.trim() === "") {
    throw new Error("Chat authentication token is required");
  }

  await chatSupabase.realtime.setAuth(token);
};

export default chatSupabase;
