-- Phase 5: four-role synthetic end-to-end flows. No billing or real learner data.
create table public.seat_events(
 event_key uuid primary key, institution_id uuid not null references public.institutions(id),
 student_id uuid not null references public.students(id), actor uuid not null references public.profiles(id),
 action text not null check(action in('activate','deactivate')), created_at timestamptz not null default now());
create table public.seat_change_requests(
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id),
 requested_by uuid not null references public.profiles(id), requested_capacity integer not null check(requested_capacity>0),
 reason text not null check(char_length(reason) between 10 and 500), status text not null default 'pending' check(status in('pending','approved','rejected')),
 created_at timestamptz not null default now());
create table public.activity_assignments(
 id uuid primary key default gen_random_uuid(), assignment_key uuid not null unique,
 student_id uuid not null references public.students(id), institution_id uuid references public.institutions(id),
 module_id text not null, module_version integer not null, assigned_by uuid not null references public.profiles(id),
 synthetic boolean not null default true, created_at timestamptz not null default now(),
 foreign key(module_id,module_version) references public.module_versions(module_id,version));
create table public.module_progress(
 id uuid primary key default gen_random_uuid(), completion_key uuid not null unique,
 student_id uuid not null references public.students(id), institution_id uuid references public.institutions(id),
 module_id text not null, module_version integer not null, source text not null check(source in('school','home')),
 completed_at timestamptz not null default now(),
 foreign key(module_id,module_version) references public.module_versions(module_id,version));
create index on public.activity_assignments(student_id,created_at desc);
create index on public.module_progress(student_id,completed_at desc);
create trigger seat_event_immutable before update or delete on public.seat_events for each row execute function public.reject_assessment_change();
create trigger progress_immutable before update or delete on public.module_progress for each row execute function public.reject_assessment_change();

create function public.school_people() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare tenant uuid; cap integer;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null then raise exception 'Forbidden';end if;
 select capacity into cap from institutions where id=tenant;
 return jsonb_build_object('capacity',cap,
  'teachers',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'active',p.active) order by p.display_name) from profiles p where p.institution_id=tenant and p.role='teacher'),'[]'::jsonb),
  'students',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.display_name,'seat_active',access_source(s.id)='school','teacher_ids',coalesce((select jsonb_agg(t.teacher_id) from teacher_students t where t.student_id=s.id),'[]'::jsonb)) order by s.display_name) from students s where s.institution_id=tenant),'[]'::jsonb));
end;$$;
create function public.school_set_seat(p_student uuid,p_active boolean,p_key uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare tenant uuid; student_tenant uuid; cap integer; used integer; prior seat_events;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null or p_key is null then raise exception 'Forbidden';end if;
 perform 1 from institutions where id=tenant for update;
 select institution_id into student_tenant from students where id=p_student;
 if student_tenant is distinct from tenant then raise exception 'Forbidden';end if;
 select * into prior from seat_events where event_key=p_key;
 if prior.event_key is not null then
  if prior.institution_id<>tenant or prior.student_id<>p_student or prior.actor<>auth.uid() or prior.action<>case when p_active then 'activate' else 'deactivate' end then raise exception 'Idempotency conflict';end if;
  return;
 end if;
 if p_active and access_source(p_student) is distinct from 'school' then
  select capacity into cap from institutions where id=tenant;
  select count(*) into used from students s where s.institution_id=tenant and access_source(s.id)='school';
  if used>=cap then raise exception 'Seat quota reached';end if;
  insert into entitlements(student_id,source,starts_at,ends_at,active) values(p_student,'school',now(),now()+interval '30 days',true);
 elsif not p_active then
  update entitlements set active=false where student_id=p_student and source='school' and active;
 end if;
 insert into seat_events(event_key,institution_id,student_id,actor,action) values(p_key,tenant,p_student,auth.uid(),case when p_active then 'activate' else 'deactivate' end);
 insert into audit_events(actor,action,target) values(auth.uid(),case when p_active then 'school_seat_activated' else 'school_seat_deactivated' end,p_student);
end;$$;
create function public.school_assign_teacher(p_student uuid,p_teacher uuid,p_assigned boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare tenant uuid;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null or not exists(select 1 from students where id=p_student and institution_id=tenant)
    or not exists(select 1 from profiles where id=p_teacher and institution_id=tenant and role='teacher' and active) then raise exception 'Forbidden';end if;
 if p_assigned then insert into teacher_students values(p_teacher,p_student) on conflict do nothing;
 else delete from teacher_students where teacher_id=p_teacher and student_id=p_student;end if;
 insert into audit_events(actor,action,target) values(auth.uid(),case when p_assigned then 'teacher_student_assigned' else 'teacher_student_unassigned' end,p_student);
end;$$;
create function public.request_seat_change(p_capacity integer,p_reason text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare tenant uuid; result uuid;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null or p_reason is null or char_length(trim(p_reason))<10 or p_capacity<1 then raise exception 'Invalid request';end if;
 insert into seat_change_requests(institution_id,requested_by,requested_capacity,reason) values(tenant,auth.uid(),p_capacity,trim(p_reason)) returning id into result;
 insert into audit_events(actor,action,target) values(auth.uid(),'seat_change_requested',result);return result;
end;$$;

create function public.assign_activity(p_student uuid,p_module text,p_version integer,p_key uuid) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare learner students; existing activity_assignments; result uuid; draft boolean;
begin
 select * into learner from students where id=p_student;
 if not exists(select 1 from profiles where id=auth.uid() and role='teacher' and active) or not can_read_child(p_student)
    or not valid_consent(p_student) or access_source(p_student) is null then raise exception 'Forbidden';end if;
 select * into existing from activity_assignments where assignment_key=p_key;
 if existing.id is not null then
  if existing.student_id<>p_student or existing.module_id<>p_module or existing.module_version<>p_version or existing.assigned_by<>auth.uid() then raise exception 'Idempotency conflict';end if;return existing.id;
 end if;
 select review_status<>'APPROVED' or status<>'published' into draft from module_versions where module_id=p_module and version=p_version;
 if draft is null then raise exception 'Module unavailable';end if;
 insert into activity_assignments(assignment_key,student_id,institution_id,module_id,module_version,assigned_by,synthetic)
 values(p_key,p_student,learner.institution_id,p_module,p_version,auth.uid(),draft) returning id into result;
 insert into audit_events(actor,action,target) values(auth.uid(),'learning_activity_assigned',result);return result;
end;$$;
create function public.list_child_learning(p_token text) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare child uuid;
begin
 child=(read_child_session(p_token)->>'id')::uuid;
 return jsonb_build_object('access_source',access_source(child),'modules',coalesce((select jsonb_agg(jsonb_build_object(
  'id',m.module_id,'version',m.version,'title',m.title,'domain',m.domain,'review_status',m.review_status,
  'assigned',exists(select 1 from activity_assignments a where a.student_id=child and a.module_id=m.module_id and a.module_version=m.version),
  'completed_at',(select max(p.completed_at) from module_progress p where p.student_id=child and p.module_id=m.module_id and p.module_version=m.version)) order by m.module_id)
  from module_versions m where m.version=(select max(x.version) from module_versions x where x.module_id=m.module_id)),'[]'::jsonb));
end;$$;
create function public.complete_module(p_token text,p_module text,p_version integer,p_key uuid) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare child uuid; learner students; existing module_progress; result uuid; source text;
begin
 child=(read_child_session(p_token)->>'id')::uuid;source=access_source(child);
 select * into learner from students where id=child;
 if source is null or not exists(select 1 from module_versions where module_id=p_module and version=p_version) then raise exception 'Access blocked';end if;
 select * into existing from module_progress where completion_key=p_key;
 if existing.id is not null then
  if existing.student_id<>child or existing.module_id<>p_module or existing.module_version<>p_version then raise exception 'Idempotency conflict';end if;return existing.id;
 end if;
 insert into module_progress(completion_key,student_id,institution_id,module_id,module_version,source) values(p_key,child,learner.institution_id,p_module,p_version,source) returning id into result;
 insert into audit_events(actor,action,target) values(auth.uid(),'learning_module_completed',result);return result;
end;$$;
create function public.child_progress(p_student uuid) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare role_name text; total integer;
begin
 select role into role_name from profiles where id=auth.uid() and active;
 if role_name not in('parent','teacher') or not can_read_child(p_student) then raise exception 'Forbidden';end if;
 select count(*) into total from module_versions m where m.version=(select max(x.version) from module_versions x where x.module_id=m.module_id);
 return jsonb_build_object('access_source',access_source(p_student),'completed',(select count(distinct module_id) from module_progress where student_id=p_student),'total',total,
  'recent',coalesce((select jsonb_agg(x order by x.completed_at desc) from (select p.module_id,m.title,max(p.completed_at) completed_at from module_progress p join module_versions m on m.module_id=p.module_id and m.version=p.module_version where p.student_id=p_student group by p.module_id,m.title order by max(p.completed_at) desc limit 5)x),'[]'::jsonb));
end;$$;
create function public.teacher_overview() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='teacher' and active) then raise exception 'Forbidden';end if;
 return jsonb_build_object('students',(select count(*) from teacher_students where teacher_id=auth.uid()),
  'open_assessments',(select count(*) from assessment_sessions s join teacher_students t on t.student_id=s.student_id and t.teacher_id=auth.uid() where s.status in('created','in_progress')),
  'completed_modules',(select count(*) from module_progress p join teacher_students t on t.student_id=p.student_id and t.teacher_id=auth.uid()));
end;$$;

alter table public.seat_events enable row level security;
alter table public.seat_change_requests enable row level security;
alter table public.activity_assignments enable row level security;
alter table public.module_progress enable row level security;
revoke all on public.seat_events,public.seat_change_requests,public.activity_assignments,public.module_progress from anon,authenticated;
revoke execute on function public.school_people(),public.school_set_seat(uuid,boolean,uuid),public.school_assign_teacher(uuid,uuid,boolean),public.request_seat_change(integer,text),public.assign_activity(uuid,text,integer,uuid),public.list_child_learning(text),public.complete_module(text,text,integer,uuid),public.child_progress(uuid),public.teacher_overview() from public,anon;
grant execute on function public.school_people(),public.school_set_seat(uuid,boolean,uuid),public.school_assign_teacher(uuid,uuid,boolean),public.request_seat_change(integer,text),public.assign_activity(uuid,text,integer,uuid),public.list_child_learning(text),public.complete_module(text,text,integer,uuid),public.child_progress(uuid),public.teacher_overview() to authenticated;
