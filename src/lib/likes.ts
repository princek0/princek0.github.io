import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSecret } from "astro:env/server";

export const LIKE_COOKIE_NAME = "prince_like_visitor";
export const LIKE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface LikeStateRow {
  like_count: unknown;
  liked?: unknown;
  inserted?: unknown;
  rate_limited?: unknown;
}

export interface LikeState {
  count: number;
  liked: boolean;
}

export interface LikeRpcResult {
  data: unknown;
  error: { message: string } | null;
}

export type LikeRpc = (
  functionName: string,
  parameters: Record<string, string | null>,
) => Promise<LikeRpcResult>;

export class LikeConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LikeConfigurationError";
  }
}

export class LikeRateLimitError extends Error {
  readonly count: number;

  constructor(count: number) {
    super("Too many likes were submitted from this network. Try again later.");
    this.name = "LikeRateLimitError";
    this.count = count;
  }
}

let supabaseAdmin: SupabaseClient | undefined;

type ServerSecretName =
  "SUPABASE_URL" | "SUPABASE_SECRET_KEY" | "LIKE_COOKIE_SECRET";

function requireEnvironmentVariable(name: ServerSecretName): string {
  const value = getSecret(name)?.trim();
  if (!value) {
    throw new LikeConfigurationError(`${name} is not configured.`);
  }
  return value;
}

export function getLikeCookieSecret(): string {
  const secret = requireEnvironmentVariable("LIKE_COOKIE_SECRET");
  if (secret.length < 32) {
    throw new LikeConfigurationError(
      "LIKE_COOKIE_SECRET must contain at least 32 characters.",
    );
  }
  return secret;
}

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  supabaseAdmin = createClient(
    requireEnvironmentVariable("SUPABASE_URL"),
    requireEnvironmentVariable("SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  return supabaseAdmin;
}

export function isValidPostSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function hmacHex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSignedVisitorToken(secret: string): {
  token: string;
  visitorId: string;
} {
  const visitorId = randomUUID();
  const signature = hmacHex(secret, `cookie:${visitorId}`);
  return { token: `${visitorId}.${signature}`, visitorId };
}

export function verifySignedVisitorToken(
  token: string | undefined,
  secret: string,
): string | undefined {
  if (!token) {
    return undefined;
  }

  const [visitorId, suppliedSignature, extraPart] = token.split(".");
  if (
    extraPart !== undefined ||
    !UUID_PATTERN.test(visitorId ?? "") ||
    !HASH_PATTERN.test(suppliedSignature ?? "")
  ) {
    return undefined;
  }

  const expectedSignature = hmacHex(secret, `cookie:${visitorId}`);
  const suppliedBuffer = Buffer.from(suppliedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  return visitorId;
}

export function createVisitorHash(visitorId: string, secret: string): string {
  return hmacHex(secret, `visitor:${visitorId}`);
}

export function createDailyNetworkHash(
  clientAddress: string,
  secret: string,
  now = new Date(),
): string {
  const day = now.toISOString().slice(0, 10);
  return hmacHex(secret, `network:${day}:${clientAddress}`);
}

export function getClientAddress(
  request: Request,
  platformAddress?: string,
): string {
  const netlifyAddress = request.headers.get("x-nf-client-connection-ip");
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address =
    platformAddress?.trim() ||
    netlifyAddress?.trim() ||
    forwardedAddress ||
    request.headers.get("client-ip")?.trim();

  if (!address) {
    throw new Error("Unable to determine the client network address.");
  }

  return address;
}

function parseLikeCount(value: unknown): number {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("The like service returned an invalid count.");
  }
  return count;
}

function getFirstRow(data: unknown): LikeStateRow {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    throw new Error("The like service returned no data.");
  }
  return row as LikeStateRow;
}

async function runSupabaseRpc(
  functionName: string,
  parameters: Record<string, string | null>,
): Promise<LikeRpcResult> {
  const { data, error } = await getSupabaseAdmin().rpc(
    functionName,
    parameters,
  );
  return {
    data,
    error: error ? { message: error.message } : null,
  };
}

export async function getLikeStateWithRpc(
  postSlug: string,
  visitorHash?: string,
  rpc: LikeRpc = runSupabaseRpc,
): Promise<LikeState> {
  const { data, error } = await rpc("get_post_like_state", {
    p_post_slug: postSlug,
    p_visitor_hash: visitorHash ?? null,
  });

  if (error) {
    throw new Error(`Unable to load likes: ${error.message}`);
  }

  const row = getFirstRow(data);
  return {
    count: parseLikeCount(row.like_count),
    liked: row.liked === true,
  };
}

export async function getLikeState(
  postSlug: string,
  visitorHash?: string,
): Promise<LikeState> {
  return getLikeStateWithRpc(postSlug, visitorHash);
}

export async function recordLikeWithRpc(
  postSlug: string,
  visitorHash: string,
  networkHash: string,
  rpc: LikeRpc = runSupabaseRpc,
): Promise<LikeState> {
  const { data, error } = await rpc("record_post_like", {
    p_network_hash: networkHash,
    p_post_slug: postSlug,
    p_visitor_hash: visitorHash,
  });

  if (error) {
    throw new Error(`Unable to save like: ${error.message}`);
  }

  const row = getFirstRow(data);
  const count = parseLikeCount(row.like_count);
  if (row.rate_limited === true) {
    throw new LikeRateLimitError(count);
  }

  return { count, liked: true };
}

export async function recordLike(
  postSlug: string,
  visitorHash: string,
  networkHash: string,
): Promise<LikeState> {
  return recordLikeWithRpc(postSlug, visitorHash, networkHash);
}
