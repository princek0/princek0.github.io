begin;

create table if not exists public.post_like_counts (
  post_slug text primary key
    check (post_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  like_count bigint not null default 0
    check (like_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_slug text not null
    references public.post_like_counts (post_slug)
    on delete cascade,
  visitor_hash text not null
    check (visitor_hash ~ '^[a-f0-9]{64}$'),
  network_hash text not null
    check (network_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  primary key (post_slug, visitor_hash)
);

create index if not exists post_likes_network_created_at_idx
  on public.post_likes (network_hash, created_at desc);

alter table public.post_like_counts enable row level security;
alter table public.post_likes enable row level security;

revoke all on public.post_like_counts from anon, authenticated;
revoke all on public.post_likes from anon, authenticated;
grant select, insert, update on public.post_like_counts to service_role;
grant select, insert on public.post_likes to service_role;

create or replace function public.get_post_like_state(
  p_post_slug text,
  p_visitor_hash text default null
)
returns table (
  like_count bigint,
  liked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      (
        select counts.like_count
        from public.post_like_counts as counts
        where counts.post_slug = p_post_slug
      ),
      0
    ) as like_count,
    case
      when p_visitor_hash is null then false
      else exists (
        select 1
        from public.post_likes as likes
        where likes.post_slug = p_post_slug
          and likes.visitor_hash = p_visitor_hash
      )
    end as liked;
$$;

create or replace function public.record_post_like(
  p_post_slug text,
  p_visitor_hash text,
  p_network_hash text
)
returns table (
  like_count bigint,
  inserted boolean,
  rate_limited boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_rows integer := 0;
  recent_network_likes integer := 0;
begin
  if p_post_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_visitor_hash !~ '^[a-f0-9]{64}$'
    or p_network_hash !~ '^[a-f0-9]{64}$'
  then
    raise exception 'Invalid like parameters'
      using errcode = '22023';
  end if;

  insert into public.post_like_counts (post_slug, like_count)
  values (p_post_slug, 0)
  on conflict (post_slug) do nothing;

  if exists (
    select 1
    from public.post_likes
    where post_slug = p_post_slug
      and visitor_hash = p_visitor_hash
  ) then
    return query
      select counts.like_count, false, false
      from public.post_like_counts as counts
      where counts.post_slug = p_post_slug;
    return;
  end if;

  -- Serialize requests sharing a daily network hash so the rate-limit check
  -- remains correct even when many requests arrive concurrently.
  perform pg_advisory_xact_lock(hashtextextended(p_network_hash, 0));

  select count(*)::integer
  into recent_network_likes
  from public.post_likes
  where network_hash = p_network_hash
    and created_at >= now() - interval '1 hour';

  if recent_network_likes >= 20 then
    return query
      select counts.like_count, false, true
      from public.post_like_counts as counts
      where counts.post_slug = p_post_slug;
    return;
  end if;

  insert into public.post_likes (post_slug, visitor_hash, network_hash)
  values (p_post_slug, p_visitor_hash, p_network_hash)
  on conflict (post_slug, visitor_hash) do nothing;

  get diagnostics inserted_rows = row_count;

  if inserted_rows = 1 then
    return query
      update public.post_like_counts as counts
      set
        like_count = counts.like_count + 1,
        updated_at = now()
      where counts.post_slug = p_post_slug
      returning counts.like_count, true, false;
  else
    return query
      select counts.like_count, false, false
      from public.post_like_counts as counts
      where counts.post_slug = p_post_slug;
  end if;
end;
$$;

revoke all on function public.get_post_like_state(text, text)
  from public, anon, authenticated;
revoke all on function public.record_post_like(text, text, text)
  from public, anon, authenticated;
grant execute on function public.get_post_like_state(text, text)
  to service_role;
grant execute on function public.record_post_like(text, text, text)
  to service_role;

commit;
