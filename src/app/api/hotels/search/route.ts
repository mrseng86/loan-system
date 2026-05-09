import { NextResponse } from "next/server";
import { z } from "zod";
import { searchAll } from "@/lib/connectors";
import { scoreOffers } from "@/lib/score";

const QuerySchema = z.object({
  destination: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(20).default(2),
  rooms: z.coerce.number().int().min(1).max(10).default(1),
  currency: z.string().min(3).max(3).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await searchAll(parsed.data);
  return NextResponse.json({
    query: parsed.data,
    offers: scoreOffers(result.offers),
    configured: result.configured,
    mocked: result.mocked,
    errors: result.errors,
  });
}
