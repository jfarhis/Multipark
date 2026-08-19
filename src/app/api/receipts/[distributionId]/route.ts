import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { distributions, investorProjectStakes } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ distributionId: string }> },
) {
  const [session, { distributionId }] = await Promise.all([getSession(), params]);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const db = getDb();
  const [distribution] = await db.select().from(distributions).where(eq(distributions.id, distributionId)).limit(1);
  if (!distribution?.receiptPathname) return new Response("Receipt not found", { status: 404 });

  if (session.role === "investor") {
    if (distribution.investorId !== session.investorId) return new Response("Forbidden", { status: 403 });
    const [stake] = await db.select({ investorId: investorProjectStakes.investorId }).from(investorProjectStakes).where(and(eq(investorProjectStakes.investorId, session.investorId!), eq(investorProjectStakes.projectId, distribution.projectId))).limit(1);
    if (!stake) return new Response("Forbidden", { status: 403 });
  }

  const result = await get(distribution.receiptPathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Receipt not found", { status: 404 });
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": result.blob.contentDisposition,
      "Cache-Control": "private, no-store",
    },
  });
}
