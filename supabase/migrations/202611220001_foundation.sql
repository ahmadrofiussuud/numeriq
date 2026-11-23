-- Phase 1, local synthetic development only.
create extension if not exists pgcrypto with schema extensions;
create table public.institutions(id uuid primary key default gen_random_uuid(),name text not null,capacity integer not null check(capacity>=0));
create table public.profiles(id uuid primary key references auth.users(id),display_name text not null,role text not null check(role in('school','teacher','parent')),institution_id uuid references public.institutions(id),active boolean not null default true,check(role='parent' or institution_id is not null));
create table public.students(id uuid primary key default gen_random_uuid(),display_name text not null,institution_id uuid references public.institutions(id));
create table public.teacher_students(teacher_id uuid references public.profiles(id),student_id uuid references public.students(id),primary key(teacher_id,student_id));
create table public.guardian_students(guardian_id uuid references public.profiles(id),student_id uuid references public.students(id),verified boolean not null default false,active boolean not null default true,primary key(guardian_id,student_id));
create table public.guardian_invites(id uuid primary key default gen_random_uuid(),student_id uuid references public.students(id) not null,recipient_id uuid references public.profiles(id) not null,token_hash text unique not null,expires_at timestamptz not null,used_at timestamptz);
create table public.consents(id bigint generated always as identity primary key,guardian_id uuid references public.profiles(id) not null,student_id uuid references public.students(id) not null,version text not null,status text not null check(status in('granted','withdrawn')),recorded_at timestamptz not null default now());
create table public.entitlements(id uuid primary key default gen_random_uuid(),student_id uuid references public.students(id) not null,source text not null check(source in('school','home')),starts_at timestamptz not null,ends_at timestamptz not null,active boolean not null default true,check(ends_at>starts_at));
create table public.child_sessions(id uuid primary key default gen_random_uuid(),adult_id uuid references public.profiles(id) not null,student_id uuid references public.students(id) not null,token_hash text unique not null,expires_at timestamptz not null,revoked_at timestamptz);
create table public.audit_events(id bigint generated always as identity primary key,actor uuid references public.profiles(id),action text not null,target uuid,created_at timestamptz not null default now());
create index on public.students(institution_id);
create index on public.consents(student_id,version,id desc);
create index on public.entitlements(student_id,ends_at);
create index on public.guardian_students(student_id);
create index on public.child_sessions(adult_id,student_id);

-- Explicit search paths and no anonymous execute on privileged helpers.
create function public.can_read_child(p_student uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from profiles p join students s on s.id=p_student where p.id=auth.uid() and p.active and (
 (p.role='teacher' and p.institution_id=s.institution_id and exists(select 1 from teacher_students t where t.teacher_id=p.id and t.student_id=s.id))
 or (p.role='parent' and exists(select 1 from guardian_students g where g.guardian_id=p.id and g.student_id=s.id and g.verified and g.active))));
$$;
create function public.valid_consent(p_student uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce((select c.status='granted' from consents c join guardian_students g on g.guardian_id=c.guardian_id and g.student_id=c.student_id join profiles p on p.id=g.guardian_id and p.active where c.student_id=p_student and c.version='demo-v1' and g.verified and g.active order by c.id desc limit 1),false);
$$;
create function public.access_source(p_student uuid) returns text language sql stable security definer set search_path=public,pg_temp as $$
 select e.source from entitlements e where e.student_id=p_student and e.active and e.starts_at<=now() and e.ends_at>now() order by case when e.source='school' then 0 else 1 end limit 1;
$$;
create function public.list_my_children() returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'display_name',s.display_name,'consent',valid_consent(s.id),'access',access_source(s.id)) order by s.display_name),'[]'::jsonb) from students s where can_read_child(s.id);
$$;
create function public.school_summary() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare tenant uuid; cap integer;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null then raise exception 'Forbidden'; end if;
 select capacity into cap from institutions where id=tenant;
 return jsonb_build_object('capacity',cap,'teachers',(select count(*) from profiles where institution_id=tenant and role='teacher' and active),'students',(select count(*) from students where institution_id=tenant),'active_seats',(select count(*) from students s where s.institution_id=tenant and access_source(s.id)='school'));
end; $$;
create function public.claim_guardian_invite(p_token text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare invitation guardian_invites;
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) then raise exception 'Forbidden';end if;
 select * into invitation from guardian_invites where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and recipient_id=auth.uid() and used_at is null and expires_at>now() for update;
 if invitation.id is null then raise exception 'Invalid invite';end if;
 insert into guardian_students(guardian_id,student_id,verified,active) values(auth.uid(),invitation.student_id,true,true) on conflict(guardian_id,student_id) do update set verified=true,active=true;
 update guardian_invites set used_at=now() where id=invitation.id;
 insert into audit_events(actor,action,target) values(auth.uid(),'guardian_link_verified',invitation.student_id);
end; $$;
create function public.record_consent(p_student uuid,p_status text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_status not in('granted','withdrawn') then raise exception 'Invalid status';end if;
 if not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) or not can_read_child(p_student) then raise exception 'Forbidden';end if;
 perform 1 from students where id=p_student for update;
 insert into consents(guardian_id,student_id,version,status) values(auth.uid(),p_student,'demo-v1',p_status);
 if p_status='withdrawn' then update child_sessions set revoked_at=now() where student_id=p_student and revoked_at is null;end if;
 insert into audit_events(actor,action,target) values(auth.uid(),'consent_'||p_status,p_student);
end; $$;
create function public.start_child_session(p_student uuid) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare secret text;
begin
 perform 1 from students where id=p_student for update;
 if not can_read_child(p_student) or not valid_consent(p_student) or access_source(p_student) is null then raise exception 'Access blocked';end if;
 secret=encode(extensions.gen_random_bytes(32),'hex');
 update child_sessions set revoked_at=now() where adult_id=auth.uid() and revoked_at is null;
 insert into child_sessions(adult_id,student_id,token_hash,expires_at) values(auth.uid(),p_student,encode(extensions.digest(secret,'sha256'),'hex'),now()+interval '15 minutes');
 insert into audit_events(actor,action,target) values(auth.uid(),'child_session_started',p_student);
 return secret;
end; $$;
create function public.read_child_session(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare child uuid;
begin
 select student_id into child from child_sessions where adult_id=auth.uid() and token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and revoked_at is null and expires_at>now();
 if child is null or not can_read_child(child) or not valid_consent(child) or access_source(child) is null then raise exception 'Access blocked';end if;
 return (select jsonb_build_object('id',id,'display_name',display_name) from students where id=child);
end; $$;
create function public.end_child_session(p_token text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update child_sessions set revoked_at=now() where adult_id=auth.uid() and token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 insert into audit_events(actor,action) values(auth.uid(),'child_session_ended');
end; $$;

alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teacher_students enable row level security;
alter table public.guardian_students enable row level security;
alter table public.guardian_invites enable row level security;
alter table public.consents enable row level security;
alter table public.entitlements enable row level security;
alter table public.child_sessions enable row level security;
alter table public.audit_events enable row level security;
-- No direct writes from authenticated/anon. RPCs enforce actor and relationships.
revoke all on public.institutions,public.profiles,public.students,public.teacher_students,public.guardian_students,public.guardian_invites,public.consents,public.entitlements,public.child_sessions,public.audit_events from anon,authenticated;
grant select on public.profiles,public.students to authenticated;
create policy self_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy related_student on public.students for select to authenticated using(public.can_read_child(id));
revoke execute on function public.can_read_child(uuid),public.valid_consent(uuid),public.access_source(uuid),public.list_my_children(),public.school_summary(),public.claim_guardian_invite(text),public.record_consent(uuid,text),public.start_child_session(uuid),public.read_child_session(text),public.end_child_session(text) from public,anon;
grant execute on function public.can_read_child(uuid),public.list_my_children(),public.school_summary(),public.claim_guardian_invite(text),public.record_consent(uuid,text),public.start_child_session(uuid),public.read_child_session(text),public.end_child_session(text) to authenticated;

