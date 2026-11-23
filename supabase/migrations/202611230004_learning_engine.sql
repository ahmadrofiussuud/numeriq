-- Phase 4: synthetic expert priors and deterministic evidence, never diagnostic labels.
create table public.model_parameters(
 kc_id text not null,version integer not null check(version>0),
 p_init double precision not null check(p_init between 0 and 1),
 p_learn double precision not null check(p_learn between 0 and 1),
 p_guess double precision not null check(p_guess between 0 and 1),
 p_slip double precision not null check(p_slip between 0 and 1),
 review_status text not null check(review_status in('NEEDS_REVIEW','APPROVED')),
 primary key(kc_id,version));
create table public.item_error_mappings(
 set_id text not null,set_version integer not null,item_id text not null,item_version integer not null,
 option_id text not null,error_code text not null,rule_version integer not null check(rule_version>0),
 review_status text not null check(review_status in('NEEDS_REVIEW','APPROVED')),
 primary key(set_id,set_version,item_id,item_version,option_id),
 foreign key(set_id,set_version,item_id,item_version) references public.assessment_items(set_id,set_version,item_id,item_version));
create table public.remediation_mappings(
 kc_id text not null,error_code text not null,module_id text not null,module_version integer not null,
 review_status text not null check(review_status in('NEEDS_REVIEW','APPROVED')),
 primary key(kc_id,error_code,module_id,module_version),
 foreign key(module_id,module_version) references public.module_versions(module_id,version));
alter table public.assessment_sessions add column model_version integer not null default 1 check(model_version>0);
-- To activate revised expert priors, insert a new version and explicitly change this default for future sessions.
create table public.learning_observations(
 response_id uuid primary key references public.assessment_responses(id),
 student_id uuid not null references public.students(id),
 kc_id text not null,
 item_id text not null,
 error_code text,
 rule_version integer,
 model_version integer not null,
 included boolean not null,
 prior double precision,
 posterior double precision,
 next_mastery double precision,
 observed_at timestamptz not null,
 check((included and prior is not null and posterior is not null and next_mastery is not null) or (not included and prior is null and posterior is null and next_mastery is null)));
create index on public.learning_observations(student_id,kc_id,observed_at,response_id);
create table public.teacher_reviews(
 id uuid primary key default gen_random_uuid(),review_key uuid not null unique,
 student_id uuid not null references public.students(id),kc_id text not null,error_code text not null,rule_version integer not null,
 reviewer uuid not null references public.profiles(id),decision text not null check(decision in('reviewed','rejected','corrected')),
 corrected_code text,reason text not null check(char_length(reason) between 10 and 500),
 evidence_count integer not null check(evidence_count>=2),created_at timestamptz not null default now(),
 check((decision='corrected' and corrected_code is not null and char_length(corrected_code) between 2 and 80 and corrected_code<>error_code) or (decision<>'corrected' and corrected_code is null)));
create index on public.teacher_reviews(student_id,kc_id,error_code,rule_version,created_at desc,id desc);
create trigger param_immutable before update or delete on public.model_parameters for each row execute function public.reject_assessment_change();
create trigger mapping_immutable before update or delete on public.item_error_mappings for each row execute function public.reject_assessment_change();
create trigger remediation_immutable before update or delete on public.remediation_mappings for each row execute function public.reject_assessment_change();
create trigger observation_immutable before update or delete on public.learning_observations for each row execute function public.reject_assessment_change();
create trigger review_immutable before update or delete on public.teacher_reviews for each row execute function public.reject_assessment_change();

create function public.bkt_step(p_prior double precision,p_learn double precision,p_guess double precision,p_slip double precision,p_correct boolean)
 returns jsonb language plpgsql immutable set search_path=public,pg_temp as $$
declare likelihood_master double precision; likelihood_unmastered double precision; divisor double precision; posterior double precision;
begin
 if p_prior is null or p_learn is null or p_guess is null or p_slip is null
    or p_prior<0 or p_prior>1 or p_learn<0 or p_learn>1 or p_guess<0 or p_guess>1 or p_slip<0 or p_slip>1 or p_correct is null
 then raise exception 'Invalid BKT input';end if;
 likelihood_master=case when p_correct then 1-p_slip else p_slip end;
 likelihood_unmastered=case when p_correct then p_guess else 1-p_guess end;
 divisor=p_prior*likelihood_master+(1-p_prior)*likelihood_unmastered;
 -- Impossible observations carry forward the prior instead of dividing by zero.
 posterior=case when divisor=0 then p_prior else p_prior*likelihood_master/divisor end;
 posterior=least(1,greatest(0,posterior));
 return jsonb_build_object('posterior',posterior,'next_mastery',least(1,greatest(0,posterior+(1-posterior)*p_learn)));
end;$$;
create function public.record_learning_observation() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare sess assessment_sessions; slot assessment_session_items; item assessment_items; params model_parameters;
        prior_value double precision; result jsonb; code text; rule integer;
begin
 select * into sess from assessment_sessions where id=new.session_id;
 select * into slot from assessment_session_items where session_id=new.session_id and item_id=new.item_id;
 select * into item from assessment_items where set_id=slot.set_id and set_version=slot.set_version and item_id=slot.item_id and item_version=slot.item_version;
 select * into params from model_parameters where kc_id=item.kc_id and version=sess.model_version;
 if params.kc_id is null then raise exception 'Missing versioned BKT parameters';end if;
 if not new.correct then
   select m.error_code,m.rule_version into code,rule from item_error_mappings m
   where m.set_id=slot.set_id and m.set_version=slot.set_version and m.item_id=slot.item_id and m.item_version=slot.item_version and m.option_id=new.answer;
 end if;
 if new.hint_used then
  insert into learning_observations(response_id,student_id,kc_id,item_id,error_code,rule_version,model_version,included,observed_at)
  values(new.id,sess.student_id,item.kc_id,item.item_id,code,rule,sess.model_version,false,new.created_at);
 else
  select o.next_mastery into prior_value from learning_observations o
  where o.student_id=sess.student_id and o.kc_id=item.kc_id and o.included
  order by o.observed_at desc,o.response_id desc limit 1;
  prior_value=coalesce(prior_value,params.p_init);
  result=bkt_step(prior_value,params.p_learn,params.p_guess,params.p_slip,new.correct);
  insert into learning_observations(response_id,student_id,kc_id,item_id,error_code,rule_version,model_version,included,prior,posterior,next_mastery,observed_at)
  values(new.id,sess.student_id,item.kc_id,item.item_id,code,rule,sess.model_version,true,prior_value,(result->>'posterior')::double precision,(result->>'next_mastery')::double precision,new.created_at);
 end if;
 return new;
end;$$;
create trigger response_observation after insert on public.assessment_responses for each row execute function public.record_learning_observation();

create function public.learning_insights(p_student uuid) returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare tenant uuid;
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='teacher' and active) or not can_read_child(p_student)
    or not valid_consent(p_student) or access_source(p_student) is null then raise exception 'Forbidden';end if;
 select institution_id into tenant from students where id=p_student;
 return jsonb_build_object(
 'timeline',coalesce((select jsonb_agg(jsonb_build_object('response_id',o.response_id,'kc_id',o.kc_id,'item_id',o.item_id,'error_code',o.error_code,'rule_version',o.rule_version,'model_version',o.model_version,'included',o.included,'prior',o.prior,'posterior',o.posterior,'mastery',o.next_mastery,'observed_at',o.observed_at,'parameter_review',p.review_status) order by o.observed_at,o.response_id)
 from learning_observations o join assessment_responses r on r.id=o.response_id join assessment_sessions s on s.id=r.session_id
 join model_parameters p on p.kc_id=o.kc_id and p.version=o.model_version
 where o.student_id=p_student and s.institution_id is not distinct from tenant),'[]'::jsonb),
 'patterns',coalesce((select jsonb_agg(jsonb_build_object('kc_id',e.kc_id,'error_code',e.error_code,'rule_version',e.rule_version,'distinct_items',e.distinct_items,'response_ids',e.response_ids,'state',
 case when e.distinct_items<2 then 'insufficient_evidence'
      when review.evidence_count=e.distinct_items then review.decision
      else 'needs_review' end,
 'corrected_code',case when review.evidence_count=e.distinct_items then review.corrected_code else null end,
 'review_reason',case when review.evidence_count=e.distinct_items then review.reason else null end,
 'rule_review',e.rule_review,
 'activity',coalesce((select jsonb_build_object('id',m.module_id,'version',m.module_version,'title',v.title) from remediation_mappings m
 join module_versions v on v.module_id=m.module_id and v.version=m.module_version
 where m.kc_id=e.kc_id and m.error_code=e.error_code and m.review_status='APPROVED' and v.review_status='APPROVED' and v.status='published'
 order by m.module_id,m.module_version desc limit 1),null)) order by e.kc_id,e.error_code)
 from (select o.kc_id,o.error_code,o.rule_version,count(distinct o.item_id)::integer distinct_items,
 array_agg(o.response_id order by o.observed_at,o.response_id) response_ids,
 min(m.review_status) rule_review
 from learning_observations o join assessment_responses r on r.id=o.response_id
 join assessment_sessions s on s.id=r.session_id
 join item_error_mappings m on m.set_id=s.set_id and m.set_version=s.set_version and m.item_id=o.item_id and m.item_version=r.item_version and m.option_id=r.answer
 where o.student_id=p_student and o.error_code is not null and o.included and s.institution_id is not distinct from tenant
 group by o.kc_id,o.error_code,o.rule_version) e
 left join lateral (select t.* from teacher_reviews t where t.student_id=p_student and t.kc_id=e.kc_id and t.error_code=e.error_code and t.rule_version=e.rule_version order by t.created_at desc,t.id desc limit 1) review on true),'[]'::jsonb));
end;$$;
create function public.submit_teacher_review(p_student uuid,p_kc text,p_code text,p_rule integer,p_decision text,p_reason text,p_corrected text,p_key uuid)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare existing teacher_reviews; n integer; result uuid;
begin
 perform 1 from students where id=p_student for update;
 if not exists(select 1 from profiles where id=auth.uid() and role='teacher' and active) or not can_read_child(p_student)
    or not valid_consent(p_student) or access_source(p_student) is null then raise exception 'Forbidden';end if;
 if p_key is null then raise exception 'Key required';end if;
 select * into existing from teacher_reviews where review_key=p_key;
 if existing.id is not null then
  if existing.student_id<>p_student or existing.kc_id<>p_kc or existing.error_code<>p_code or existing.rule_version<>p_rule
     or existing.reviewer<>auth.uid() or existing.decision<>p_decision or existing.reason<>p_reason
     or existing.corrected_code is distinct from p_corrected then raise exception 'Idempotency conflict';end if;
  return existing.id;
 end if;
 select count(distinct o.item_id) into n from learning_observations o
 join assessment_responses r on r.id=o.response_id join assessment_sessions s on s.id=r.session_id
 where o.student_id=p_student and o.kc_id=p_kc and o.error_code=p_code and o.rule_version=p_rule and o.included
   and s.institution_id is not distinct from (select institution_id from students where id=p_student);
 if n<2 then raise exception 'Insufficient distinct item evidence';end if;
 insert into teacher_reviews(review_key,student_id,kc_id,error_code,rule_version,reviewer,decision,corrected_code,reason,evidence_count)
 values(p_key,p_student,p_kc,p_code,p_rule,auth.uid(),p_decision,p_corrected,p_reason,n) returning id into result;
 insert into audit_events(actor,action,target) values(auth.uid(),'teacher_evidence_reviewed',result);
 return result;
end;$$;
alter table public.model_parameters enable row level security;
alter table public.item_error_mappings enable row level security;
alter table public.remediation_mappings enable row level security;
alter table public.learning_observations enable row level security;
alter table public.teacher_reviews enable row level security;
revoke all on public.model_parameters,public.item_error_mappings,public.remediation_mappings,public.learning_observations,public.teacher_reviews from anon,authenticated;
revoke execute on function public.bkt_step(double precision,double precision,double precision,double precision,boolean),public.record_learning_observation(),public.learning_insights(uuid),public.submit_teacher_review(uuid,text,text,integer,text,text,text,uuid) from public,anon;
revoke execute on function public.record_learning_observation() from authenticated;
grant execute on function public.learning_insights(uuid),public.submit_teacher_review(uuid,text,text,integer,text,text,text,uuid) to authenticated;
