// scripts/check_auth.js
// Simple script to test Supabase auth (sign‑up & sign‑in)
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://sufmjnkqktqilnipnlmw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Zm1qbmtxa3RxaWxuaXBubG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjI2MDcsImV4cCI6MjA5NTAzODYwN30.HiWvGDjXXUtRua_vEgVywV-po9O2uFVwhrOHpkAxX5A";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

(async () => {
  const timestamp = Date.now();
  const email = `testuser+${timestamp}@example.com`;
  const password = "TestPassword123!";

  console.log("Attempting sign‑up for", email);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    console.error("Sign‑up error:", signUpError.message);
    process.exit(1);
  }
  console.log("Sign‑up success:", signUpData);

  console.log("Attempting sign‑in for", email);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error("Sign‑in error:", signInError.message);
    process.exit(1);
  }
  console.log("Sign‑in success. Session:", signInData.session);
})();
