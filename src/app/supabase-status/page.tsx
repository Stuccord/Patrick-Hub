// src/app/supabase-status/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { supabasePublic } from '@/lib/supabaseClient';

export default function Page() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    supabasePublic.auth.getSession()
      .then(({ error }) => {
        setStatus(error ? 'NO (auth error)' : 'YES');
      })
      .catch(error => {
        console.error('Error checking Supabase status:', error);
        setStatus('NO (error)');
      });
  }, []);

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: status === 'YES' ? '#2ecc71' : status === null ? '#95a5a6' : '#e74c3c' }}>
        Supabase Connected: {status || 'Checking...'}
      </h1>
    </main>
  );
}
