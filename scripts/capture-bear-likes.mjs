import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const SEED_FILE = path.join(ROOT_DIRECTORY, "supabase", "seed.sql");

const BEAR_POSTS = [
  ["dropping-out-of-oxford", "miEcJtqJTLhbQajwVMui"],
  [
    "thoughts-on-being-pro-defence-and-national-security-pilled",
    "ocsyqmgBzLNGiJUfVALV",
  ],
  [
    "checking-out-models-fine-tuning-to-suggest-chessgpts-understanding",
    "xiWeiUDKXKkESWTeYdUS",
  ],
  [
    "the-potential-for-mirror-bacteria-to-cause-unprecedented-and-irreversible-harm",
    "hVrIXqZMfnJdbtLwJwNh",
  ],
  [
    "3-takeaways-from-3-months-at-ef-as-a-talent-investor",
    "yqKUDRmdttNvzwFoUcRe",
  ],
  ["reflections-on-an-ai-security-hackathon-we-ran", "ZHKrCDgJAGIhiwNkyKvq"],
  ["takeaways-from-how-to-be-a-founder", "XyJVPcwMiEHatNssXGUx"],
  ["applying-stochastic-gradient-descent", "BkdwfsijfkQwvSXUYjyj"],
  ["7-steps-to-build-a-horse-classifier-with-fastai", "RwFssxuMAuBMxKbhZHVp"],
];

async function getLikeCount(uid) {
  const response = await fetch(
    `https://thisisprince.bearblog.dev/upvote-info/${uid}/`,
    {
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve Bear count ${uid}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  if (!Number.isSafeInteger(payload.upvote_count) || payload.upvote_count < 0) {
    throw new Error(`Bear returned an invalid count for ${uid}.`);
  }
  return payload.upvote_count;
}

const capturedAt = new Date();
const counts = [];
for (const [slug, uid] of BEAR_POSTS) {
  counts.push([slug, await getLikeCount(uid)]);
}

const values = counts
  .map(([slug, count]) => `  ('${slug}', ${count})`)
  .join(",\n");

const sql = `-- One-time Bear Blog aggregate snapshot.
-- Captured at ${capturedAt.toISOString()}.
-- Safe to rerun only before this site accepts its first native like. Rows with
-- native likes are deliberately left unchanged.

begin;

insert into public.post_like_counts (post_slug, like_count)
values
${values}
on conflict (post_slug) do update
set
  like_count = excluded.like_count,
  updated_at = now()
where not exists (
  select 1
  from public.post_likes
  where post_likes.post_slug = excluded.post_slug
);

commit;
`;

await writeFile(SEED_FILE, sql, "utf8");

console.log(
  JSON.stringify(
    {
      capturedAt: capturedAt.toISOString(),
      counts: Object.fromEntries(counts),
      total: counts.reduce((total, [, count]) => total + count, 0),
    },
    null,
    2,
  ),
);
