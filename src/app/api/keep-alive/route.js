import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

/**
 * Lightweight keep-alive endpoint that runs a minimal read against Supabase
 * so free-tier projects stay active when pinged by an external monitor.
 */
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { status: 'error', message: 'Supabase is not configured' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { error } = await supabase
      .from('karyakars')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { status: 'alive', timestamp: new Date().toISOString() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err?.message || 'Unexpected error' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
