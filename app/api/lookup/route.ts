import { NextRequest, NextResponse } from 'next/server';
import { resolveOwnership } from '@/lib/resolve';
import { MultcoApiError } from '@/lib/multco';
import type { LookupResult } from '@/lib/types';

const ARTIFICIAL_FLOOR_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function apiDownResult(address: string): LookupResult {
  return {
    address,
    matched: false,
    message:
      "Couldn't reach Multnomah County's data API right now. Try again in a moment.",
    entities: [],
    edges: [],
    sources: [],
    queried_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { address?: string };
  const address = (body.address ?? '').trim();

  const start = Date.now();

  try {
    const result = await resolveOwnership(address);
    const elapsed = Date.now() - start;
    if (elapsed < ARTIFICIAL_FLOOR_MS) {
      await delay(ARTIFICIAL_FLOOR_MS - elapsed);
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MultcoApiError) {
      console.error('MultcoApiError:', err.url, err.status, err.message);
      return NextResponse.json(apiDownResult(address));
    }
    console.error('Lookup error:', err);
    return NextResponse.json({ error: 'Internal lookup error' }, { status: 500 });
  }
}

// Keep GET for direct browser testing convenience
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address') ?? '';
  const start = Date.now();

  try {
    const result = await resolveOwnership(address);
    const elapsed = Date.now() - start;
    if (elapsed < ARTIFICIAL_FLOOR_MS) {
      await delay(ARTIFICIAL_FLOOR_MS - elapsed);
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof MultcoApiError) {
      console.error('MultcoApiError:', err.url, err.status, err.message);
      return NextResponse.json(apiDownResult(address));
    }
    console.error('Lookup error:', err);
    return NextResponse.json({ error: 'Internal lookup error' }, { status: 500 });
  }
}
