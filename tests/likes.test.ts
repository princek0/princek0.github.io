import { describe, expect, it, vi } from "vitest";

import {
  createDailyNetworkHash,
  createSignedVisitorToken,
  createVisitorHash,
  getClientAddress,
  getLikeStateWithRpc,
  isSameOriginRequest,
  isValidPostSlug,
  LikeRateLimitError,
  recordLikeWithRpc,
  verifySignedVisitorToken,
  type LikeRpc,
} from "../src/lib/likes";

const SECRET = "a-secret-value-that-is-longer-than-thirty-two-characters";

describe("post slug validation", () => {
  it("accepts the published slug format", () => {
    expect(isValidPostSlug("dropping-out-of-oxford")).toBe(true);
    expect(isValidPostSlug("3-takeaways-from-ef")).toBe(true);
  });

  it("rejects path traversal and malformed slugs", () => {
    expect(isValidPostSlug("../admin")).toBe(false);
    expect(isValidPostSlug("Uppercase")).toBe(false);
    expect(isValidPostSlug("double--hyphen")).toBe(false);
    expect(isValidPostSlug("trailing-")).toBe(false);
  });
});

describe("same-origin validation", () => {
  it("accepts an exact origin match", () => {
    const request = new Request("https://thisisprince.com/api/likes/example", {
      headers: { Origin: "https://thisisprince.com" },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it("rejects missing or foreign origins", () => {
    expect(
      isSameOriginRequest(
        new Request("https://thisisprince.com/api/likes/example"),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        new Request("https://thisisprince.com/api/likes/example", {
          headers: { Origin: "https://attacker.example" },
        }),
      ),
    ).toBe(false);
  });
});

describe("visitor identity", () => {
  it("round-trips a signed token", () => {
    const { token, visitorId } = createSignedVisitorToken(SECRET);
    expect(verifySignedVisitorToken(token, SECRET)).toBe(visitorId);
  });

  it("rejects tampered and differently signed tokens", () => {
    const { token } = createSignedVisitorToken(SECRET);
    const tamperedToken = `${token.slice(0, -1)}${
      token.endsWith("0") ? "1" : "0"
    }`;

    expect(verifySignedVisitorToken(tamperedToken, SECRET)).toBeUndefined();
    expect(
      verifySignedVisitorToken(token, `${SECRET}-different`),
    ).toBeUndefined();
  });

  it("creates stable, non-reversible visitor hashes", () => {
    const visitorId = createSignedVisitorToken(SECRET).visitorId;
    const firstHash = createVisitorHash(visitorId, SECRET);
    const secondHash = createVisitorHash(visitorId, SECRET);

    expect(firstHash).toBe(secondHash);
    expect(firstHash).toMatch(/^[a-f0-9]{64}$/);
    expect(firstHash).not.toContain(visitorId);
  });
});

describe("network throttling identity", () => {
  it("rotates the pseudonymous network hash each day", () => {
    const firstDay = createDailyNetworkHash(
      "203.0.113.1",
      SECRET,
      new Date("2026-08-01T23:59:00Z"),
    );
    const nextDay = createDailyNetworkHash(
      "203.0.113.1",
      SECRET,
      new Date("2026-08-02T00:01:00Z"),
    );

    expect(firstDay).toMatch(/^[a-f0-9]{64}$/);
    expect(firstDay).not.toBe(nextDay);
  });

  it("prefers the platform-provided client address", () => {
    const request = new Request("https://thisisprince.com", {
      headers: {
        "x-forwarded-for": "198.51.100.3, 198.51.100.4",
        "x-nf-client-connection-ip": "198.51.100.2",
      },
    });

    expect(getClientAddress(request, "198.51.100.1")).toBe("198.51.100.1");
    expect(getClientAddress(request)).toBe("198.51.100.2");
  });
});

describe("Supabase RPC response handling", () => {
  it("maps the stored count and current visitor state", async () => {
    const rpc = vi.fn<LikeRpc>().mockResolvedValue({
      data: [{ like_count: 81, liked: true }],
      error: null,
    });

    await expect(
      getLikeStateWithRpc("dropping-out-of-oxford", "visitor-hash", rpc),
    ).resolves.toEqual({ count: 81, liked: true });
    expect(rpc).toHaveBeenCalledWith("get_post_like_state", {
      p_post_slug: "dropping-out-of-oxford",
      p_visitor_hash: "visitor-hash",
    });
  });

  it("returns the authoritative count after a successful insert", async () => {
    const rpc = vi.fn<LikeRpc>().mockResolvedValue({
      data: [{ inserted: true, like_count: 82, rate_limited: false }],
      error: null,
    });

    await expect(
      recordLikeWithRpc(
        "dropping-out-of-oxford",
        "visitor-hash",
        "network-hash",
        rpc,
      ),
    ).resolves.toEqual({ count: 82, liked: true });
  });

  it("surfaces the database rate limit without losing the count", async () => {
    const rpc = vi.fn<LikeRpc>().mockResolvedValue({
      data: [{ inserted: false, like_count: 82, rate_limited: true }],
      error: null,
    });

    const request = recordLikeWithRpc(
      "dropping-out-of-oxford",
      "visitor-hash",
      "network-hash",
      rpc,
    );
    await expect(request).rejects.toBeInstanceOf(LikeRateLimitError);
    await expect(request).rejects.toMatchObject({ count: 82 });
  });

  it("rejects malformed database counts", async () => {
    const rpc = vi.fn<LikeRpc>().mockResolvedValue({
      data: [{ like_count: -1, liked: false }],
      error: null,
    });

    await expect(
      getLikeStateWithRpc("dropping-out-of-oxford", undefined, rpc),
    ).rejects.toThrow("invalid count");
  });
});
