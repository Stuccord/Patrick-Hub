// scripts/check_website_supabase.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://sufmjnkqktqilnipnlmw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjI2MDcsImV4cCI6MjA5NTAzODYwN30.HiWvGDjXXUtRua_vEgVywV-po9O2uFVwhrOHpkAxX5A";

// Disable realtime to avoid WebSocket errors in Node
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { enabled: false } });

(async () => {
  // Attempt to fetch a small piece of data; for example, list profiles (if any)
  const { data, error } = await supabase.from("profiles").select("id,email,role").limit(5);
  if (error) {
    console.error("Supabase connection error (website test):", error);
    process.exit(1);
  }
  console.log("Supabase connection from website context successful. Sample data:", data);
})();
