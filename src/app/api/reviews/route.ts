import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAllReviews } from "@/lib/reviews";

const QuerySchema = z.object({
  hotelName: z.string().min(1),
  city: z.string().optional(),
  language: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const result = await fetchAllReviews(parsed.data);
  return NextResponse.json(result);
}
