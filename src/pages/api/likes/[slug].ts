import type { APIRoute, AstroCookies } from "astro";

import {
  createDailyNetworkHash,
  createSignedVisitorToken,
  createVisitorHash,
  getClientAddress,
  getLikeCookieSecret,
  getLikeState,
  isSameOriginRequest,
  isValidPostSlug,
  LIKE_COOKIE_MAX_AGE_SECONDS,
  LIKE_COOKIE_NAME,
  LikeConfigurationError,
  LikeRateLimitError,
  recordLike,
  verifySignedVisitorToken,
  type LikeState,
} from "../../../lib/likes";
import { getPostSlug, getPublishedPosts } from "../../../lib/posts";

export const prerender = false;

let publishedSlugsPromise: Promise<Set<string>> | undefined;

function getPublishedSlugs(): Promise<Set<string>> {
  publishedSlugsPromise ??= getPublishedPosts().then(
    (posts) => new Set(posts.map(getPostSlug)),
  );
  return publishedSlugsPromise;
}

function jsonResponse(
  body: LikeState | { error: string; count?: number; liked?: boolean },
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/json; charset=utf-8",
      Vary: "Cookie",
    },
  });
}

async function getValidatedSlug(
  slugParameter: string | undefined,
): Promise<string | undefined> {
  if (!slugParameter || !isValidPostSlug(slugParameter)) {
    return undefined;
  }

  return (await getPublishedSlugs()).has(slugParameter)
    ? slugParameter
    : undefined;
}

function getOrCreateVisitor(
  cookies: AstroCookies,
  secret: string,
): { visitorId: string; token?: string } {
  const existingVisitorId = verifySignedVisitorToken(
    cookies.get(LIKE_COOKIE_NAME)?.value,
    secret,
  );
  if (existingVisitorId) {
    return { visitorId: existingVisitorId };
  }

  const { token, visitorId } = createSignedVisitorToken(secret);
  return { token, visitorId };
}

function setVisitorCookie(cookies: AstroCookies, token: string | undefined) {
  if (!token) {
    return;
  }

  cookies.set(LIKE_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: LIKE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });
}

function handleServerError(error: unknown): Response {
  console.error("Like API error", error);
  const status = error instanceof LikeConfigurationError ? 503 : 500;
  return jsonResponse({ error: "Likes are temporarily unavailable." }, status);
}

export const GET: APIRoute = async ({ cookies, params }) => {
  const slug = await getValidatedSlug(params.slug);
  if (!slug) {
    return jsonResponse({ error: "Post not found." }, 404);
  }

  try {
    const secret = getLikeCookieSecret();
    const { token, visitorId } = getOrCreateVisitor(cookies, secret);
    setVisitorCookie(cookies, token);

    return jsonResponse(
      await getLikeState(slug, createVisitorHash(visitorId, secret)),
    );
  } catch (error) {
    return handleServerError(error);
  }
};

export const POST: APIRoute = async ({
  clientAddress,
  cookies,
  params,
  request,
}) => {
  if (!isSameOriginRequest(request)) {
    return jsonResponse({ error: "Invalid request origin." }, 403);
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return jsonResponse({ error: "Expected a JSON request." }, 415);
  }

  const requestBody = await request.text();
  if (requestBody.length > 100) {
    return jsonResponse({ error: "Request body is too large." }, 413);
  }

  try {
    const parsedBody: unknown = requestBody ? JSON.parse(requestBody) : {};
    if (
      !parsedBody ||
      typeof parsedBody !== "object" ||
      Array.isArray(parsedBody)
    ) {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
  } catch {
    return jsonResponse({ error: "Invalid JSON." }, 400);
  }

  const slug = await getValidatedSlug(params.slug);
  if (!slug) {
    return jsonResponse({ error: "Post not found." }, 404);
  }

  try {
    const secret = getLikeCookieSecret();
    const { token, visitorId } = getOrCreateVisitor(cookies, secret);
    setVisitorCookie(cookies, token);

    const state = await recordLike(
      slug,
      createVisitorHash(visitorId, secret),
      createDailyNetworkHash(getClientAddress(request, clientAddress), secret),
    );
    return jsonResponse(state);
  } catch (error) {
    if (error instanceof LikeRateLimitError) {
      return jsonResponse(
        {
          count: error.count,
          error: error.message,
          liked: false,
        },
        429,
      );
    }
    return handleServerError(error);
  }
};
