import { NextRequest, NextResponse } from 'next/server';
import { lookupFixture } from '@/lib/fixtures';
import type { LookupResult } from '@/lib/types';

const ARTIFICIAL_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function noMatchResult(address: string): LookupResult {
  return {
    address,
    matched: false,
    entities: [],
    edges: [],
    sources: ['Multnomah County Assessor', 'Oregon Secretary of State'],
    queried_at: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address') ?? '';
  await delay(ARTIFICIAL_DELAY_MS);
  const result = lookupFixture(address) ?? noMatchResult(address);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { address?: string };
  const address = body.address ?? '';
  await delay(ARTIFICIAL_DELAY_MS);
  const result = lookupFixture(address) ?? noMatchResult(address);
  return NextResponse.json(result);
}
