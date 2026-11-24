-- Phase 6: synthetic contracts and sandbox billing. No live provider credentials.
alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles drop constraint profiles_check;
alter table public.profiles add constraint profiles_role_check check(role in('school','teacher','parent','operator'));
alter table public.profiles add constraint profiles_tenant_check check(role in('parent','operator') or institution_id is not null);

create table public.plan_versions(
 code text not null, version integer not null, audience text not null check(audience in('school','home')),
 cadence text not null check(cadence in('monthly','annual')), capacity integer,
 price_idr integer not null check(price_idr>=0), hypothesis boolean not null default true,
 active boolean not null default true, primary key(code,version));
create table public.school_contracts(
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id),
 plan_code text not null, plan_version integer not null, status text not null check(status in('pending_verification','active','rejected','expired')),
 verified_by uuid references public.profiles(id), starts_at timestamptz, ends_at timestamptz,
 created_at timestamptz not null default now(), foreign key(plan_code,plan_version) references public.plan_versions(code,version));
create table public.home_orders(
 id uuid primary key, guardian_id uuid not null references public.profiles(id), student_id uuid not null references public.students(id),
 plan_code text not null, plan_version integer not null, amount_idr integer not null, currency text not null default 'IDR',
 status text not null check(status in('pending','failed','paid','paid_reconciliation','cancelled','expired')),
 provider text not null default 'numeriq_sandbox', auto_renew boolean not null default true,
 paid_at timestamptz, created_at timestamptz not null default now(),
 foreign key(plan_code,plan_version) references public.plan_versions(code,version));
create table public.payment_events(
 provider text not null, event_id text not null, order_id uuid not null references public.home_orders(id),
 payload_hash text not null, event_status text not null, received_at timestamptz not null default now(),
 primary key(provider,event_id));
create table public.reconciliation_cases(
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id),
 order_id uuid references public.home_orders(id), reason text not null, status text not null default 'pending' check(status in('pending','resolved')),
 created_at timestamptz not null default now());
create unique index one_current_school_contract on public.school_contracts(institution_id) where status in('pending_verification','active');
create index on public.home_orders(guardian_id,student_id,created_at desc);
create index on public.reconciliation_cases(student_id,status);

insert into public.plan_versions(code,version,audience,cadence,capacity,price_idr,hypothesis) values
 ('school_starter',1,'school','annual',20,6000000,true),('school_growth',1,'school','annual',35,9000000,true),
 ('school_institution',1,'school','annual',60,13500000,true),('home_monthly',1,'home','monthly',null,69000,true),
 ('home_annual',1,'home','annual',null,690000,true);
insert into public.school_contracts(institution_id,plan_code,plan_version,status,starts_at,ends_at)
 select id,'school_starter',1,'active',now(),now()+interval '1 year' from public.institutions;

create function public.is_operator() returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from profiles where id=auth.uid() and role='operator' and active);
$$;
create function public.school_billing_summary() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare tenant uuid;
begin
 select institution_id into tenant from profiles where id=auth.uid() and role='school' and active;
 if tenant is null then raise exception 'Forbidden';end if;
 return jsonb_build_object('contract',(select jsonb_build_object('plan',c.plan_code,'status',c.status,'ends_at',c.ends_at,'hypothesis',p.hypothesis) from school_contracts c join plan_versions p on p.code=c.plan_code and p.version=c.plan_version where c.institution_id=tenant order by c.created_at desc limit 1),'requests',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'capacity',r.requested_capacity,'status',r.status,'created_at',r.created_at) order by r.created_at desc) from seat_change_requests r where r.institution_id=tenant),'[]'::jsonb));
end;$$;
create function public.operator_review_seat_request(p_request uuid,p_approve boolean) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare req seat_change_requests;
begin
 if not is_operator() then raise exception 'Forbidden';end if;
 select * into req from seat_change_requests where id=p_request for update;
 if req.id is null or req.status<>'pending' then raise exception 'Request unavailable';end if;
 update seat_change_requests set status=case when p_approve then 'approved' else 'rejected' end where id=req.id;
 if p_approve then update institutions set capacity=req.requested_capacity where id=req.institution_id;end if;
 insert into audit_events(actor,action,target) values(auth.uid(),case when p_approve then 'seat_change_approved' else 'seat_change_rejected' end,req.id);
end;$$;
create function public.create_home_checkout(p_student uuid,p_plan text,p_order uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare price plan_versions; prior home_orders;
begin
 if p_order is null or p_plan not in('home_monthly','home_annual') or not can_read_child(p_student) or not valid_consent(p_student) then raise exception 'Forbidden';end if;
 perform 1 from students where id=p_student for update;
 if access_source(p_student)='school' then return jsonb_build_object('status','school_included','charged',false);end if;
 select * into prior from home_orders where id=p_order;
 if prior.id is not null then
  if prior.guardian_id<>auth.uid() or prior.student_id<>p_student or prior.plan_code<>p_plan then raise exception 'Idempotency conflict';end if;
  return jsonb_build_object('status',prior.status,'order_id',prior.id,'amount_idr',prior.amount_idr,'charged',false);
 end if;
 if exists(select 1 from home_orders where guardian_id=auth.uid() and student_id=p_student and status in('pending','paid') and auto_renew) then raise exception 'Existing checkout or subscription';end if;
 select * into price from plan_versions where code=p_plan and version=1 and audience='home' and active;
 insert into home_orders(id,guardian_id,student_id,plan_code,plan_version,amount_idr,status) values(p_order,auth.uid(),p_student,price.code,price.version,price.price_idr,'pending');
 insert into audit_events(actor,action,target) values(auth.uid(),'home_checkout_created',p_order);
 return jsonb_build_object('status','pending','order_id',p_order,'amount_idr',price.price_idr,'currency','IDR','provider','numeriq_sandbox','charged',false,'hypothesis',price.hypothesis);
end;$$;
create function public.home_billing_summary() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if not exists(select 1 from profiles where id=auth.uid() and role='parent' and active) then raise exception 'Forbidden';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',o.id,'student_id',o.student_id,'plan',o.plan_code,'status',o.status,'amount_idr',o.amount_idr,'auto_renew',o.auto_renew,'created_at',o.created_at) order by o.created_at desc) from home_orders o where o.guardian_id=auth.uid()),'[]'::jsonb);
end;$$;
create function public.cancel_home_subscription(p_order uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update home_orders set auto_renew=false,status=case when status='pending' then 'cancelled' else status end where id=p_order and guardian_id=auth.uid() and status in('pending','paid');
 if not found then raise exception 'Order unavailable';end if;
 insert into audit_events(actor,action,target) values(auth.uid(),'home_renewal_cancelled',p_order);
end;$$;
-- Called only by the local sandbox webhook adapter using service_role after HMAC verification.
create function public.apply_sandbox_payment_event(p_event_id text,p_order uuid,p_status text,p_amount integer,p_currency text,p_payload_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare ord home_orders; existing payment_events; duration interval;
begin
 if auth.role()<>'service_role' or p_status not in('paid','failed') then raise exception 'Forbidden';end if;
 select * into existing from payment_events where provider='numeriq_sandbox' and event_id=p_event_id;
 if existing.event_id is not null then
  if existing.order_id<>p_order or existing.payload_hash<>p_payload_hash then raise exception 'Idempotency conflict';end if;
  return jsonb_build_object('status','duplicate','order_status',(select status from home_orders where id=p_order));
 end if;
 select * into ord from home_orders where id=p_order for update;
 if ord.id is null or ord.status not in('pending','failed') or ord.amount_idr<>p_amount or p_currency<>'IDR' then raise exception 'Payment mismatch';end if;
 insert into payment_events values('numeriq_sandbox',p_event_id,p_order,p_payload_hash,p_status,now());
 if p_status='failed' then update home_orders set status='failed' where id=p_order;return jsonb_build_object('status','failed');end if;
 if access_source(ord.student_id)='school' then
  update home_orders set status='paid_reconciliation',paid_at=now(),auto_renew=false where id=p_order;
  insert into reconciliation_cases(student_id,order_id,reason) values(ord.student_id,p_order,'school_entitlement_arrived_during_home_payment');
  return jsonb_build_object('status','reconciliation','entitlement_created',false);
 end if;
 duration=case when ord.plan_code='home_annual' then interval '1 year' else interval '1 month' end;
 update home_orders set status='paid',paid_at=now() where id=p_order;
 insert into entitlements(student_id,source,starts_at,ends_at,active) values(ord.student_id,'home',now(),now()+duration,true);
 insert into audit_events(actor,action,target) values(null,'sandbox_home_payment_applied',p_order);
 return jsonb_build_object('status','paid','entitlement_created',true);
end;$$;
create function public.expire_home_access() returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer;
begin
 if auth.role()<>'service_role' and not is_operator() then raise exception 'Forbidden';end if;
 update entitlements set active=false where source='home' and active and ends_at<=now();get diagnostics changed=row_count;
 update home_orders o set status='expired',auto_renew=false where status='paid' and not exists(select 1 from entitlements e where e.student_id=o.student_id and e.source='home' and e.active and e.ends_at>now());
 return changed;
end;$$;

alter table public.plan_versions enable row level security;alter table public.school_contracts enable row level security;
alter table public.home_orders enable row level security;alter table public.payment_events enable row level security;alter table public.reconciliation_cases enable row level security;
revoke all on public.plan_versions,public.school_contracts,public.home_orders,public.payment_events,public.reconciliation_cases from anon,authenticated;
revoke execute on function public.is_operator(),public.school_billing_summary(),public.operator_review_seat_request(uuid,boolean),public.create_home_checkout(uuid,text,uuid),public.home_billing_summary(),public.cancel_home_subscription(uuid),public.apply_sandbox_payment_event(text,uuid,text,integer,text,text),public.expire_home_access() from public,anon,authenticated;
grant execute on function public.school_billing_summary() to authenticated;
grant execute on function public.operator_review_seat_request(uuid,boolean) to authenticated;
grant execute on function public.create_home_checkout(uuid,text,uuid),public.home_billing_summary(),public.cancel_home_subscription(uuid) to authenticated;
grant execute on function public.apply_sandbox_payment_event(text,uuid,text,integer,text,text),public.expire_home_access() to service_role;
