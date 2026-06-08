import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';

export async function DELETE(req: Request) {
  try {
    // 1. Verify the caller is an authenticated admin using their session cookie
    const cookieStore = await cookies();
    const supabaseSession = createSupabaseServerClient(
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

    const { data: { user }, error: sessionError } = await supabaseSession.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check the caller has admin role in the users table
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: callerData, error: callerError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerError || !callerData || callerData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // 3. Get agent ID from the request body
    const { agentId } = await req.json();
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    // 4. Snapshot agent name/email BEFORE deletion (for the response)
    const { data: agentSnapshot } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', agentId)
      .single();

    // 5. Delete from Supabase Auth — removes login account permanently
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(agentId);
    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError);
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
    }

    // 6. Safety-net: explicitly delete public.users row (CASCADE should handle it,
    //    but this guarantees it even without the migration SQL applied yet)
    await supabaseAdmin.from('users').delete().eq('id', agentId);

    // 7. VERIFY: Try to fetch the auth user — should fail with "User not found"
    const { data: verifyAuth, error: verifyAuthError } = await supabaseAdmin.auth.admin.getUserById(agentId);
    const authDeleted = !verifyAuth?.user || !!verifyAuthError;

    // 8. VERIFY: Check the public.users row is also gone
    const { data: verifyDb } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', agentId)
      .maybeSingle();
    const dbDeleted = !verifyDb;

    console.log(`[DeleteAgent] ${agentSnapshot?.name} (${agentSnapshot?.email}) — auth_deleted: ${authDeleted}, db_deleted: ${dbDeleted}`);

    return NextResponse.json({
      success: true,
      deleted: {
        id: agentId,
        name: agentSnapshot?.name ?? 'Unknown',
        email: agentSnapshot?.email ?? 'Unknown',
        auth_deleted: authDeleted,   // true = removed from Supabase Auth ✅
        db_deleted: dbDeleted,       // true = removed from public.users ✅
      }
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Delete agent error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
