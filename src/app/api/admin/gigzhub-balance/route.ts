import { NextResponse } from 'next/server';
import { getGigzHubBalance } from '@/lib/gigzhub';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Verify caller has admin access
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Double check admin role in public.users table using service role (bypass RLS for auth check)
    const serviceRoleClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return ''; } } }
    );

    const { data: dbUser, error: dbError } = await serviceRoleClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (dbError || dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch the GigzHub API balance
    const balanceResult = await getGigzHubBalance();
    return NextResponse.json(balanceResult);
  } catch (err: unknown) {
    console.error('[GigzHub Balance API] Error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
