-- Synthetic data only. Run only through local Supabase db reset.
insert into public.institutions(id,name,capacity) values
('10000000-0000-4000-8000-000000000001','Sekolah Demo Tumbuh',20),
('10000000-0000-4000-8000-000000000002','Sekolah Demo Pelita',20);
-- Adults provisioned by scripts/seed-users.mjs after reset; no real children.
insert into public.students(id,display_name,institution_id) values
('20000000-0000-4000-8000-000000000001','Nara Demo','10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000002','Bima Demo','10000000-0000-4000-8000-000000000001'),
('20000000-0000-4000-8000-000000000003','Rani Demo','10000000-0000-4000-8000-000000000002');
insert into public.entitlements(student_id,source,starts_at,ends_at) select id,'school',now()-interval '1 day',now()+interval '30 days' from public.students;
insert into public.school_contracts(institution_id,plan_code,plan_version,status,starts_at,ends_at)
select id,'school_starter',1,'active',now()-interval '1 day',now()+interval '1 year' from public.institutions;

