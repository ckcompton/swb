// Thin Jotform REST API adapter. Plain fetch, no SDK, config passed as args
// (no process.env / client creation here) -- same shared-package rules as
// the rest of this file's siblings (see CLAUDE.md): must stay import-safe
// for a future Expo app.
//
// Jotform has no API to create a per-signer document (confirmed via Jotform
// support -- unlike Dropbox Sign's create_embedded_with_template). So the
// waiver is one classic Jotform *Form* every member fills out, embedded
// directly; the signer is identified by a hidden field (unique name
// `memberId`) pre-filled with their profile id via URL query param.
//
// Jotform doesn't sign webhook callbacks (no HMAC like Dropbox Sign) -- the
// recommended, more-secure pattern is to treat the callback purely as a
// "go re-fetch this submission" notification and pull the authoritative
// answers from Jotform's API by submissionID, never trusting the posted body.

const DEFAULT_API_BASE = "https://api.jotform.com";

export interface BuildWaiverFormUrlInput {
  formId: string;
  profileId: string;
  name?: string;
  email?: string;
}

// Pure string-building -- the field "unique names" (memberId, name, email)
// must match whatever unique names the owner configured on the Jotform form.
export function buildWaiverFormUrl(input: BuildWaiverFormUrlInput): string {
  const url = new URL(`https://form.jotform.com/${input.formId}`);
  url.searchParams.set("memberId", input.profileId);
  if (input.name) url.searchParams.set("name", input.name);
  if (input.email) url.searchParams.set("email", input.email);
  return url.toString();
}

export interface JotformWebhookEvent {
  formId: string | null;
  submissionId: string | null;
}

// Jotform posts callbacks as multipart/form-data -- the caller extracts
// fields via the Web FormData API (request.formData()), which correctly
// parses multipart, and passes the FormData here since this package can't
// depend on a Request type.
export function parseWebhookPayload(formData: FormData): JotformWebhookEvent {
  const formId = formData.get("formID");
  const submissionId = formData.get("submissionID");
  return {
    formId: typeof formId === "string" ? formId : null,
    submissionId: typeof submissionId === "string" ? submissionId : null,
  };
}

export interface GetSubmissionInput {
  apiKey: string;
  submissionId: string;
  apiBase?: string;
}

export interface JotformSubmission {
  formId: string;
  answers: Record<string, string>;
}

// Fetches the authoritative submission straight from Jotform's servers --
// this is the actual verification step, since the webhook body itself is
// unsigned and shouldn't be trusted. Answers are keyed by each field's
// unique name (e.g. "memberId") for easy lookup.
export async function getSubmission(input: GetSubmissionInput): Promise<JotformSubmission> {
  const apiBase = input.apiBase || DEFAULT_API_BASE;
  const response = await fetch(
    `${apiBase}/submission/${input.submissionId}?apiKey=${encodeURIComponent(input.apiKey)}`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jotform get submission failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const rawAnswers = data.content?.answers ?? {};
  const answers: Record<string, string> = {};
  for (const field of Object.values(rawAnswers) as Array<{ name?: string; answer?: unknown }>) {
    if (typeof field.name === "string" && typeof field.answer === "string") {
      answers[field.name] = field.answer;
    }
  }

  return { formId: String(data.content?.form_id ?? ""), answers };
}

export interface GetSubmissionPdfInput {
  apiKey: string;
  formId: string;
  submissionId: string;
  apiBase?: string;
}

// Returns the signed PDF's bytes and content type, for the admin proxy
// route to stream back -- the API key must never reach the browser, so this
// can't just return a URL the way Dropbox Sign's getSignedFileUrl did.
export async function getSubmissionPdf(
  input: GetSubmissionPdfInput,
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const apiBase = input.apiBase || DEFAULT_API_BASE;
  const response = await fetch(
    `${apiBase}/generatePDF?formid=${encodeURIComponent(input.formId)}&submissionid=${encodeURIComponent(input.submissionId)}&apiKey=${encodeURIComponent(input.apiKey)}&download=1`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jotform generatePDF failed: ${response.status} ${body}`);
  }

  const bytes = await response.arrayBuffer();
  return { bytes, contentType: response.headers.get("content-type") ?? "application/pdf" };
}
