import { NextResponse, type NextRequest } from "next/server";
import { getRating, getVote, rate } from "@/lib/ratings";

const PLACE_ID = /^(node|way|relation)\/\d+$/;
const VOTER_ID = /^[A-Za-z0-9-]{8,64}$/;

/** GET /api/ratings?placeId=node/123&voterId=… → { average, count, myVote } */
export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId") ?? "";
  const voterId = request.nextUrl.searchParams.get("voterId") ?? "";
  if (!PLACE_ID.test(placeId)) return NextResponse.json({ error: "Invalid placeId" }, { status: 400 });
  return NextResponse.json({
    ...getRating(placeId),
    myVote: VOTER_ID.test(voterId) ? getVote(placeId, voterId) : null,
  });
}

/** POST { placeId, voterId, stars: 1-5 } → updated { average, count, myVote } */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { placeId, voterId, stars } = body ?? {};
  if (typeof placeId !== "string" || !PLACE_ID.test(placeId)) {
    return NextResponse.json({ error: "Invalid placeId" }, { status: 400 });
  }
  if (typeof voterId !== "string" || !VOTER_ID.test(voterId)) {
    return NextResponse.json({ error: "Invalid voterId" }, { status: 400 });
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "stars must be a whole number from 1 to 5" }, { status: 400 });
  }
  return NextResponse.json({ ...rate(placeId, voterId, stars), myVote: stars });
}
