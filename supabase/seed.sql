-- One-time Bear Blog aggregate snapshot.
-- Captured at 2026-08-01T10:54:41.931Z.
-- Safe to rerun only before this site accepts its first native like. Rows with
-- native likes are deliberately left unchanged.

begin;

insert into public.post_like_counts (post_slug, like_count)
values
  ('dropping-out-of-oxford', 81),
  ('thoughts-on-being-pro-defence-and-national-security-pilled', 17),
  ('checking-out-models-fine-tuning-to-suggest-chessgpts-understanding', 21),
  ('the-potential-for-mirror-bacteria-to-cause-unprecedented-and-irreversible-harm', 25),
  ('3-takeaways-from-3-months-at-ef-as-a-talent-investor', 31),
  ('reflections-on-an-ai-security-hackathon-we-ran', 8),
  ('takeaways-from-how-to-be-a-founder', 9),
  ('applying-stochastic-gradient-descent', 3),
  ('7-steps-to-build-a-horse-classifier-with-fastai', 2)
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
