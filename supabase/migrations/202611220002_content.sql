-- Versioned content metadata; no student responses in Phase 2.
create table public.module_versions (
 module_id text not null check(module_id ~ '^(NS|PV|AR)-0[1-4]$'),
 version integer not null check(version>0),
 domain text not null check(domain in('Number Sense','Place Value','Arithmetic')),
 title text not null,
 status text not null default 'draft' check(status in('draft','reviewed','published')),
 review_status text not null default 'NEEDS_REVIEW' check(review_status in('NEEDS_REVIEW','APPROVED')),
 public_content jsonb not null,
 reviewer_id uuid references public.profiles(id),
 reviewed_at timestamptz,
 primary key(module_id,version),
 check(status='draft' or (review_status='APPROVED' and reviewer_id is not null and reviewed_at is not null))
);
create table public.item_scoring_versions (
 module_id text not null,
 module_version integer not null,
 item_id text not null,
 scoring_rule jsonb not null,
 error_mapping jsonb not null,
 primary key(module_id,module_version,item_id),
 foreign key(module_id,module_version) references public.module_versions(module_id,version)
);
create function public.protect_content_version() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if old.status='published' then raise exception 'Published content is immutable; create a new version';end if;
 if old.status='reviewed' then
  if tg_op='DELETE' then raise exception 'Reviewed content is immutable';end if;
  if new.status<>'published' or (to_jsonb(new)-'status') is distinct from (to_jsonb(old)-'status') then raise exception 'Only publication of unchanged reviewed content is allowed';end if;
 end if;
 if tg_op='UPDATE' and (new.module_id<>old.module_id or new.version<>old.version) then raise exception 'Create a new row for a new version';end if;
 if tg_op='DELETE' then return old;end if;
 return new;
end; $$;
create trigger content_immutable before update or delete on public.module_versions for each row execute function public.protect_content_version();
alter table public.module_versions enable row level security;
alter table public.item_scoring_versions enable row level security;
revoke all on public.module_versions,public.item_scoring_versions from anon,authenticated;
-- No direct content client SELECT: server authorizes access and uses an explicit DTO.
-- Authoring remains internal; no fake reviewer or automatic publication.
