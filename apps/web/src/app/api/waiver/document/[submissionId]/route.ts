import "server-only";
import { NextResponse } from "next/server";
import { getSubmissionPdf } from "@boxing-gym/data-access";
import { requireAdmin } from "@/lib/auth";

// Admin-only proxy for a signed waiver PDF. Jotform's PDF download URL
// embeds the secret API key as a query param, so it can never be handed to
// the browser directly (unlike Dropbox Sign's short-lived signed file URLs)
// -- this route fetches server-side and streams the bytes back instead.
// This is the URL stored as each waiver row's document_url.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  await requireAdmin();

  const apiKey = process.env.JOTFORM_API_KEY;
  const formId = process.env.JOTFORM_WAIVER_FORM_ID;
  if (!apiKey || !formId) {
    return NextResponse.json(
      { error: "Waiver document access is not configured." },
      {
        status: 500,
      },
    );
  }

  const { submissionId } = await params;

  try {
    const { bytes, contentType } = await getSubmissionPdf({
      apiKey,
      formId,
      submissionId,
      apiBase: process.env.JOTFORM_API_BASE,
    });
    return new NextResponse(bytes, { headers: { "Content-Type": contentType } });
  } catch (error) {
    console.error("waiver document proxy: getSubmissionPdf threw", error);
    return NextResponse.json({ error: "Could not load the waiver document." }, { status: 502 });
  }
}
