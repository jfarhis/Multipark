import { get } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { documents, investorProjectStakes } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { documentId } = await params;
  const [document] = await getDb()
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);
  if (!document?.pathname) return new Response("Document not found", { status: 404 });

  if (session.role === "investor") {
    if (document.investorId && document.investorId !== session.investorId) {
      return new Response("Forbidden", { status: 403 });
    }
    const [stake] = await getDb()
      .select({ investorId: investorProjectStakes.investorId })
      .from(investorProjectStakes)
      .where(
        and(
          eq(investorProjectStakes.investorId, session.investorId!),
          eq(investorProjectStakes.projectId, document.projectId),
        ),
      )
      .limit(1);
    if (!stake) return new Response("Forbidden", { status: 403 });
  }

  const result = await get(document.pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return new Response("Document not found", { status: 404 });
  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": result.blob.contentDisposition,
      "Cache-Control": "private, no-store",
    },
  });
}
