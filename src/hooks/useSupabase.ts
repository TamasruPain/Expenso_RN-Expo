import { useSession } from "@clerk/clerk-expo";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client that automatically injects the Clerk session token.
 * Use this hook in any component that needs authenticated Supabase access.
 */
export function useSupabase() {
  const { session } = useSession();

  const client = useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        return session?.getToken({ template: "supabase" }) ?? null;
      },
    });
  }, [session]);

  return client;
}
