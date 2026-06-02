// scripts/check_supabase.js
const { createClient } = require("@supabase/supabase-js");
// No WebSocket import needed; disable realtime to avoid WebSocket errors

const SUPABASE_URL = "https://sufmjnkqktqilnipnlmw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjI2MDcsImV4cCI6MjA5NTAzODYwN30.HiWvGDjXXUtRua_vEgVywV-po9O2uFVwhrOHpkAxX5A";

// Provide transport option to avoid native WebSocket requirement
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { enabled: false } });

(async () => {
  // Simple query: fetch first profile (if any)
  const { data, error } = await supabase.from("profiles").select("id,email,role").limit(1);
  if (error) {
    console.error("Supabase connection error:", error);
    process.exit(1);
  }
  console.log("Supabase connection successful. Sample data:", data);
})();
