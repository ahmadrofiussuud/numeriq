-- Phase 7: privacy request ledger. Requests do not directly delete learner history.
create table public.data_requests(id uuid primary key default gen_random_uuid(),guardian_id uuid not null references public.profiles(id),student_id uuid not null references public.students(id),request_type text not null check(request_type in('export','delete','restrict')),status text not null default 'pending' check(status in('pending','in_progress','completed','rejected')),note text not null default '',created_at timestamptz not null default now(),resolved_at timestamptz);
create index on public.data_requests(guardian_id,created_at desc);
create function public.request_child_data_action(p_student uuid,p_type text,p_note text default '') returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare result uuid;begin
 if p_type not in('export','delete') or not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) or not can_read_child(p_student) or char_length(coalesce(p_note,''))>500 then raise exception 'Forbidden';end if;
 if exists(select 1 from data_requests where guardian_id=auth.uid() and student_id=p_student and request_type=p_type and status in('pending','in_progress')) then raise exception 'Request already open';end if;
 insert into data_requests(guardian_id,student_id,request_type,note) values(auth.uid(),p_student,p_type,trim(coalesce(p_note,''))) returning id into result;
 insert into audit_events(actor,action,target) values(auth.uid(),'child_data_'||p_type||'_requested',result);return result;end;$$;
create function public.list_my_data_requests() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin if not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) then raise exception 'Forbidden';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'student_id',r.student_id,'type',r.request_type,'status',r.status,'created_at',r.created_at) order by r.created_at desc) from data_requests r where r.guardian_id=auth.uid()),'[]'::jsonb);end;$$;
create or replace function public.record_consent(p_student uuid,p_status text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_status not in('granted','withdrawn') then raise exception 'Invalid status';end if;
 if not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) or not can_read_child(p_student) then raise exception 'Forbidden';end if;
 perform 1 from students where id=p_student for update;insert into consents(guardian_id,student_id,version,status) values(auth.uid(),p_student,'demo-v1',p_status);
 if p_status='withdrawn' then update child_sessions set revoked_at=now() where student_id=p_student and revoked_at is null;insert into data_requests(guardian_id,student_id,request_type,note) values(auth.uid(),p_student,'restrict','Automatically opened after consent withdrawal');end if;
 insert into audit_events(actor,action,target) values(auth.uid(),'consent_'||p_status,p_student);end;$$;
alter table public.data_requests enable row level security;revoke all on public.data_requests from anon,authenticated;
revoke execute on function public.request_child_data_action(uuid,text,text),public.list_my_data_requests() from public,anon;
grant execute on function public.request_child_data_action(uuid,text,text),public.list_my_data_requests() to authenticated;
