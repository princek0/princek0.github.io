import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT_DIRECTORY = path.resolve(import.meta.dirname, "..");
const CONTENT_DIRECTORY = path.join(ROOT_DIRECTORY, "src", "content", "blog");

const EXPECTED_SLUGS = [
  "3-takeaways-from-3-months-at-ef-as-a-talent-investor",
  "7-steps-to-build-a-horse-classifier-with-fastai",
  "applying-stochastic-gradient-descent",
  "checking-out-models-fine-tuning-to-suggest-chessgpts-understanding",
  "dropping-out-of-oxford",
  "reflections-on-an-ai-security-hackathon-we-ran",
  "takeaways-from-how-to-be-a-founder",
  "the-potential-for-mirror-bacteria-to-cause-unprecedented-and-irreversible-harm",
  "thoughts-on-being-pro-defence-and-national-security-pilled",
].sort();

function readPost(slug: string): string {
  return readFileSync(path.join(CONTENT_DIRECTORY, `${slug}.md`), "utf8");
}

describe("Bear content migration", () => {
  it("contains exactly the nine expected local posts", () => {
    const slugs = readdirSync(CONTENT_DIRECTORY)
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => fileName.replace(/\.md$/, ""))
      .sort();

    expect(slugs).toEqual(EXPECTED_SLUGS);
  });

  it("keeps required metadata and removes Bear platform chrome", () => {
    for (const slug of EXPECTED_SLUGS) {
      const content = readPost(slug);
      expect(content).toMatch(/^---\ntitle: ".+"/);
      expect(content).toMatch(/\npublishedAt: "\d{4}-\d{2}-\d{2}T/);
      expect(content).toContain(
        `legacyBearUrl: "https://thisisprince.bearblog.dev/${slug}/"`,
      );
      expect(content).not.toMatch(
        /<script|<form|upvote-button|Powered by Bear/i,
      );
    }
  });

  it("preserves specialized math, code, and image content", () => {
    expect(
      readPost("applying-stochastic-gradient-descent").match(/<math\b/g),
    ).toHaveLength(23);
    expect(
      readPost("7-steps-to-build-a-horse-classifier-with-fastai").match(
        /```python/g,
      ),
    ).toHaveLength(6);

    const imagePost = readPost(
      "thoughts-on-being-pro-defence-and-national-security-pilled",
    );
    expect(imagePost.match(/!\[[^\]]+\]\(\/media\/blog\//g)).toHaveLength(2);
    expect(
      existsSync(
        path.join(
          ROOT_DIRECTORY,
          "public",
          "media",
          "blog",
          "thoughts-on-being-pro-defence-and-national-security-pilled",
          "image-1.png",
        ),
      ),
    ).toBe(true);
  });
});

describe("legacy like snapshot", () => {
  it("seeds one count for every migrated post", () => {
    const seedSql = readFileSync(
      path.join(ROOT_DIRECTORY, "supabase", "seed.sql"),
      "utf8",
    );
    const capturedRows = [...seedSql.matchAll(/\('([^']+)',\s*(\d+)\)/g)].map(
      (match) => [match[1], Number(match[2])] as const,
    );

    expect(capturedRows.map(([slug]) => slug).sort()).toEqual(EXPECTED_SLUGS);
    expect(capturedRows.reduce((total, [, count]) => total + count, 0)).toBe(
      197,
    );
  });
});
