-- Phase 3: immutable item versions, transactional sessions and server scoring.
create table public.assessment_config(id boolean primary key default true check(id),allow_synthetic boolean not null default false);
insert into public.assessment_config values(true,false);
create table public.assessment_sets(id text not null,version integer not null check(version>0),title text not null,review_status text not null check(review_status in('NEEDS_REVIEW','APPROVED')),synthetic boolean not null default false,primary key(id,version));
create table public.assessment_items(set_id text not null,set_version integer not null,item_id text not null,item_version integer not null check(item_version>0),position integer not null check(position>0),kc_id text not null,prompt text not null,options jsonb not null check(jsonb_typeof(options)='array'),correct_option text not null,hint text,primary key(set_id,set_version,item_id,item_version),unique(set_id,set_version,position),foreign key(set_id,set_version) references public.assessment_sets(id,version));
create table public.assessment_sessions(id uuid primary key default gen_random_uuid(),assignment_key uuid unique not null,student_id uuid not null references public.students(id),institution_id uuid references public.institutions(id),assigned_by uuid not null references public.profiles(id),set_id text not null,set_version integer not null,status text not null default 'created' check(status in('created','in_progress','completed','expired')),created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '7 days',completed_at timestamptz,foreign key(set_id,set_version) references public.assessment_sets(id,version));
create table public.assessment_session_items(session_id uuid references public.assessment_sessions(id) not null,set_id text not null,set_version integer not null,item_id text not null,item_version integer not null,position integer not null,hint_used boolean not null default false,primary key(session_id,item_id),unique(session_id,position),foreign key(set_id,set_version,item_id,item_version) references public.assessment_items(set_id,set_version,item_id,item_version));
create table public.assessment_responses(id uuid primary key,session_id uuid not null,item_id text not null,item_version integer not null,answer text not null,correct boolean not null,hint_used boolean not null,sequence integer not null,created_at timestamptz not null default now(),unique(session_id,item_id),unique(session_id,sequence),foreign key(session_id,item_id) references public.assessment_session_items(session_id,item_id));
create index on public.assessment_sessions(student_id,created_at desc);
create index on public.assessment_responses(session_id,sequence);
create function public.reject_assessment_change() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin raise exception 'Immutable evidence/content: create a new version instead';end;$$;
create trigger response_immutable before update or delete on public.assessment_responses for each row execute function public.reject_assessment_change();
create trigger item_immutable before update or delete on public.assessment_items for each row execute function public.reject_assessment_change();
create trigger set_immutable before update or delete on public.assessment_sets for each row execute function public.reject_assessment_change();

create function public.assign_assessment(p_student uuid,p_set text,p_version integer,p_key uuid) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare learner students; actor_role text; existing assessment_sessions; content assessment_sets; result uuid;
begin
 select * into learner from students where id=p_student for update;
 select role into actor_role from profiles where id=auth.uid() and active;
 if learner.id is null or not can_read_child(p_student) or not valid_consent(p_student) or access_source(p_student) is null then raise exception 'Assignment blocked';end if;
 if actor_role<>'teacher' and not(actor_role='parent' and access_source(p_student)='home') then raise exception 'Teacher or Home guardian required';end if;
 select * into existing from assessment_sessions where assignment_key=p_key;
 if existing.id is not null then
  if existing.student_id<>p_student or existing.assigned_by<>auth.uid() or existing.set_id<>p_set or existing.set_version<>p_version then raise exception 'Idempotency conflict';end if;
  return existing.id;
 end if;
 select * into content from assessment_sets where id=p_set and version=p_version;
 if content.id is null or not exists(select 1 from assessment_items where set_id=p_set and set_version=p_version) then raise exception 'Content unavailable';end if;
 if content.review_status<>'APPROVED' and not(content.synthetic and (select allow_synthetic from assessment_config where id)) then raise exception 'Content needs review';end if;
 insert into assessment_sessions(assignment_key,student_id,institution_id,assigned_by,set_id,set_version) values(p_key,p_student,learner.institution_id,auth.uid(),p_set,p_version) returning id into result;
 insert into assessment_session_items(session_id,set_id,set_version,item_id,item_version,position) select result,set_id,set_version,item_id,item_version,position from assessment_items where set_id=p_set and set_version=p_version;
 insert into audit_events(actor,action,target) values(auth.uid(),'assessment_assigned',result);
 return result;
end;$$;

-- All session mutations lock student then session, matching consent withdrawal order.
create function public.guard_assessment(p_session uuid,p_token text) returns public.assessment_sessions language plpgsql security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; child uuid; current_tenant uuid;
begin
 select student_id into child from assessment_sessions where id=p_session;
 if child is null then raise exception 'Session unavailable';end if;
 select institution_id into current_tenant from students where id=child for update;
 select * into sess from assessment_sessions where id=p_session for update;
 if (read_child_session(p_token)->>'id')::uuid<>child or sess.institution_id is distinct from current_tenant then raise exception 'Session unavailable';end if;
 if sess.expires_at<=now() and sess.status<>'completed' then
  update assessment_sessions set status='expired' where id=p_session;
  sess.status='expired';
 end if;
 return sess;
end;$$;
create function public.list_assessments(p_student uuid,p_token text default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare tenant uuid;
begin
 if p_token is not null then
  if (read_child_session(p_token)->>'id')::uuid<>p_student then raise exception 'Forbidden';end if;
 elsif not can_read_child(p_student) then raise exception 'Forbidden';end if;
 select institution_id into tenant from students where id=p_student;
 return coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'title',a.title,'status',case when s.expires_at<=now() and s.status<>'completed' then 'expired' else s.status end,'answered',(select count(*) from assessment_responses r where r.session_id=s.id),'total',(select count(*) from assessment_session_items i where i.session_id=s.id),'synthetic',a.synthetic,'created_at',s.created_at) order by s.created_at desc) from assessment_sessions s join assessment_sets a on a.id=s.set_id and a.version=s.set_version where s.student_id=p_student and s.institution_id is not distinct from tenant),'[]'::jsonb);
end;$$;
create function public.read_assessment(p_session uuid,p_token text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; question jsonb; answered integer; total integer;
begin
 sess=guard_assessment(p_session,p_token);
 select count(*) into answered from assessment_responses where session_id=p_session;
 select count(*) into total from assessment_session_items where session_id=p_session;
 if sess.status in('created','in_progress') then
  select jsonb_build_object('id',i.item_id,'version',i.item_version,'prompt',i.prompt,'options',i.options,'hint_available',i.hint is not null,'hint_used',si.hint_used,'hint',case when si.hint_used then i.hint else null end)
  into question from assessment_session_items si join assessment_items i using(set_id,set_version,item_id,item_version)
  where si.session_id=p_session and not exists(select 1 from assessment_responses r where r.session_id=p_session and r.item_id=si.item_id) order by si.position limit 1;
 end if;
 return jsonb_build_object('id',sess.id,'status',sess.status,'answered',answered,'total',total,'item',question,'title',(select title from assessment_sets where id=sess.set_id and version=sess.set_version),'synthetic',(select synthetic from assessment_sets where id=sess.set_id and version=sess.set_version));
end;$$;
create function public.assessment_hint(p_session uuid,p_token text,p_item text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; pending text; result text;
begin
 sess=guard_assessment(p_session,p_token);
 if sess.status not in('created','in_progress') then raise exception 'Session closed';end if;
 select si.item_id into pending from assessment_session_items si where si.session_id=p_session and not exists(select 1 from assessment_responses r where r.session_id=p_session and r.item_id=si.item_id) order by si.position limit 1;
 if pending is distinct from p_item then raise exception 'Item not current';end if;
 select i.hint into result from assessment_session_items si join assessment_items i using(set_id,set_version,item_id,item_version) where si.session_id=p_session and si.item_id=p_item;
 if result is null then raise exception 'No hint';end if;
 update assessment_session_items set hint_used=true where session_id=p_session and item_id=p_item;
 insert into audit_events(actor,action,target) values(auth.uid(),'assessment_hint',p_session);
 return result;
end;$$;
create function public.submit_assessment_response(p_session uuid,p_token text,p_response uuid,p_item text,p_version integer,p_answer text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; prior assessment_responses; slot assessment_session_items; item assessment_items; pending text; n integer; total integer;
begin
 sess=guard_assessment(p_session,p_token);
 if sess.status='expired' then return jsonb_build_object('status','expired','accepted',false);end if;
 select * into prior from assessment_responses where id=p_response;
 if prior.id is not null then
  if prior.session_id<>p_session or prior.item_id<>p_item or prior.item_version<>p_version or prior.answer<>p_answer then raise exception 'Idempotency conflict';end if;
  return jsonb_build_object('accepted',true,'response_id',prior.id,'duplicate',true);
 end if;
 select * into prior from assessment_responses where session_id=p_session and item_id=p_item;
 if prior.id is not null then
  if prior.answer<>p_answer or prior.item_version<>p_version then raise exception 'Response immutable';end if;
  return jsonb_build_object('accepted',true,'response_id',prior.id,'duplicate',true);
 end if;
 if sess.status not in('created','in_progress') then raise exception 'Session closed';end if;
 select si.item_id into pending from assessment_session_items si where si.session_id=p_session and not exists(select 1 from assessment_responses r where r.session_id=p_session and r.item_id=si.item_id) order by si.position limit 1;
 if pending is distinct from p_item then raise exception 'Item not current';end if;
 select * into slot from assessment_session_items where session_id=p_session and item_id=p_item;
 if slot.item_version<>p_version then raise exception 'Version mismatch';end if;
 select * into item from assessment_items where set_id=slot.set_id and set_version=slot.set_version and item_id=slot.item_id and item_version=slot.item_version;
 if p_answer is null or not exists(select 1 from jsonb_array_elements(item.options) opt where opt->>'id'=p_answer) then raise exception 'Invalid option';end if;
 select count(*)+1 into n from assessment_responses where session_id=p_session;
 select count(*) into total from assessment_session_items where session_id=p_session;
 insert into assessment_responses(id,session_id,item_id,item_version,answer,correct,hint_used,sequence) values(p_response,p_session,p_item,p_version,p_answer,p_answer=item.correct_option,slot.hint_used,n);
 update assessment_sessions set status=case when n=total then 'completed' else 'in_progress' end,completed_at=case when n=total then now() else null end where id=p_session;
 insert into audit_events(actor,action,target) values(auth.uid(),'assessment_response_saved',p_session);
 return jsonb_build_object('accepted',true,'response_id',p_response,'duplicate',false);
end;$$;
create function public.assessment_report(p_session uuid) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; tenant uuid;
begin
 select * into sess from assessment_sessions where id=p_session;
 select institution_id into tenant from students where id=sess.student_id;
 if sess.id is null or not can_read_child(sess.student_id) or sess.institution_id is distinct from tenant or not exists(select 1 from profiles where id=auth.uid() and role='teacher' and active) then raise exception 'Forbidden';end if;
 return jsonb_build_object('id',sess.id,'status',sess.status,'set_version',sess.set_version,'responses',coalesce((select jsonb_agg(jsonb_build_object('response_id',r.id,'item_id',r.item_id,'item_version',r.item_version,'kc_id',i.kc_id,'prompt',i.prompt,'answer',r.answer,'correct',r.correct,'hint_used',r.hint_used,'sequence',r.sequence,'created_at',r.created_at) order by r.sequence) from assessment_responses r join assessment_session_items si on si.session_id=r.session_id and si.item_id=r.item_id join assessment_items i on i.set_id=si.set_id and i.set_version=si.set_version and i.item_id=si.item_id and i.item_version=si.item_version where r.session_id=p_session),'[]'::jsonb));
end;$$;

alter table public.assessment_config enable row level security;
alter table public.assessment_sets enable row level security;
alter table public.assessment_items enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_session_items enable row level security;
alter table public.assessment_responses enable row level security;
revoke all on public.assessment_config,public.assessment_sets,public.assessment_items,public.assessment_sessions,public.assessment_session_items,public.assessment_responses from anon,authenticated;
revoke execute on function public.assign_assessment(uuid,text,integer,uuid),public.guard_assessment(uuid,text),public.list_assessments(uuid,text),public.read_assessment(uuid,text),public.assessment_hint(uuid,text,text),public.submit_assessment_response(uuid,text,uuid,text,integer,text),public.assessment_report(uuid) from public,anon;
grant execute on function public.assign_assessment(uuid,text,integer,uuid),public.list_assessments(uuid,text),public.read_assessment(uuid,text),public.assessment_hint(uuid,text,text),public.submit_assessment_response(uuid,text,uuid,text,integer,text),public.assessment_report(uuid) to authenticated;
