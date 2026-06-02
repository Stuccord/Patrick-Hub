// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Public (anon) client – can be used in the browser
export const supabasePublic: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sufmjnkqktqilnipnlmw.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjI2MDcsImV4cCI6MjA5NTAzODYwN30.HiWvGDjXXUtRua_vEgVywV-po9O2uFVwhrOHpkAxX5A"
);

// Service role client – for server‑side privileged operations (e.g., RLS bypass)
export const supabaseService: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sufmjnkqktqilnipnlmw.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ2MjYwNywiZXhwIjoyMDk1MDM4NjA3fQ.ZD5HrOM0O6EZz5-9DGLqjBQH90TGYafu0yK6qp_ZJrU"
);

// Export a default client that uses the public key (suitable for most front‑end code)
export default supabasePublic;
