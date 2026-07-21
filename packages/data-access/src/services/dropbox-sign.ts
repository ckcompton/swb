// Thin Dropbox Sign (formerly HelloSign) REST API adapter. Deliberately uses
// plain fetch + the global Web Crypto API rather than the @dropbox/sign SDK
// or Node's `crypto` module, so this file stays import-safe for the Expo
// mobile app per the shared-package rules in CLAUDE.md -- Node builtins
// aren't resolvable by Metro's bundler. In practice these functions only
// ever run server-side (Next.js Server Actions / Route Handlers); the API
// key must never reach a client bundle.
//
// API shape verified against Dropbox Sign's long-stable v3 REST conventions
// (HTTP Basic auth with the API key as username; webhook payloads posted as
// a single `json` form field; event_hash = HMAC-SHA256(event_time +
// event_type) keyed by the API key). Cross-check against
// https://developers.hellosign.com when wiring up real credentials.

const API_BASE = "https://api.hellosign.com/v3";

function basicAuthHeader(apiKey: string): string {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

export interface CreateEmbeddedSignatureRequestInput {
  apiKey: string;
  clientId: string;
  templateId: string;
  signerEmail: string;
  signerName: string;
  testMode?: boolean;
}

export interface CreateEmbeddedSignatureRequestResult {
  signatureRequestId: string;
  signatureId: string;
}

export async function createEmbeddedSignatureRequestFromTemplate(
  input: CreateEmbeddedSignatureRequestInput,
): Promise<CreateEmbeddedSignatureRequestResult> {
  const response = await fetch(`${API_BASE}/signature_request/create_embedded_with_template`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(input.apiKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: input.clientId,
      template_ids: [input.templateId],
      test_mode: input.testMode ?? false,
      title: `${input.signerName} - Liability Waiver`,
      signers: [{ role: "SWB Waiver", name: input.signerName, email_address: input.signerEmail }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Dropbox Sign create_embedded_with_template failed: ${response.status} ${body}`,
    );
  }

  const data = await response.json();
  const signatureRequestId: string = data.signature_request.signature_request_id;
  const signatureId: string | undefined = data.signature_request.signatures?.[0]?.signature_id;
  if (!signatureId) {
    throw new Error("Dropbox Sign response did not include a signature_id");
  }

  return { signatureRequestId, signatureId };
}

export interface GetEmbeddedSignUrlInput {
  apiKey: string;
  signatureId: string;
}

export interface GetEmbeddedSignUrlResult {
  signUrl: string;
  expiresAt: number;
}

export async function getEmbeddedSignUrl(
  input: GetEmbeddedSignUrlInput,
): Promise<GetEmbeddedSignUrlResult> {
  const response = await fetch(`${API_BASE}/embedded/sign_url/${input.signatureId}`, {
    headers: { Authorization: basicAuthHeader(input.apiKey) },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Dropbox Sign embedded/sign_url failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return { signUrl: data.embedded.sign_url, expiresAt: data.embedded.expires_at };
}

export interface GetSignedFileUrlInput {
  apiKey: string;
  signatureRequestId: string;
}

export async function getSignedFileUrl(input: GetSignedFileUrlInput): Promise<string> {
  const response = await fetch(
    `${API_BASE}/signature_request/files/${input.signatureRequestId}?file_type=pdf&get_url=true`,
    { headers: { Authorization: basicAuthHeader(input.apiKey) } },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Dropbox Sign signature_request/files failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return data.file_url;
}

export interface WebhookEvent {
  eventType: string;
  eventTime: string;
  eventHash: string;
  signatureRequestId: string | null;
}

// Dropbox Sign posts callbacks as multipart/form-data with a single `json`
// field containing the event payload -- the caller extracts that field via
// the Web FormData API (which handles multipart parsing) and passes its
// string value here, since this package can't depend on a Request type.
export function parseWebhookPayload(json: string): WebhookEvent {
  const payload = JSON.parse(json);
  return {
    eventType: payload.event.event_type,
    eventTime: payload.event.event_time,
    eventHash: payload.event.event_hash,
    signatureRequestId: payload.signature_request?.signature_request_id ?? null,
  };
}

export async function verifyWebhookEventHash(input: {
  apiKey: string;
  eventTime: string;
  eventType: string;
  eventHash: string;
}): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(input.apiKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${input.eventTime}${input.eventType}`),
  );
  const computedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === input.eventHash;
}
