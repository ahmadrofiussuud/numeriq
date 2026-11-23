-- All fixtures are fabricated and must remain NEEDS_REVIEW until expert sign-off.
insert into public.model_parameters(kc_id,version,p_init,p_learn,p_guess,p_slip,review_status) values
('quantity_symbol',1,0.2,0.1,0.2,0.1,'NEEDS_REVIEW'),
('tens_ones',1,0.2,0.1,0.2,0.1,'NEEDS_REVIEW'),
('addition',1,0.2,0.1,0.2,0.1,'NEEDS_REVIEW'),
('tens_ones_probe',1,0.2,0.1,0.2,0.1,'NEEDS_REVIEW');
insert into public.item_error_mappings(set_id,set_version,item_id,item_version,option_id,error_code,rule_version,review_status) values
('numeracy-demo',1,'DEMO-02',1,'five','PLACE_VALUE_CONCAT',1,'NEEDS_REVIEW'),
('numeracy-demo',1,'DEMO-02',1,'thirtytwo','PLACE_VALUE_REVERSED',1,'NEEDS_REVIEW');
insert into public.assessment_sets(id,version,title,review_status,synthetic) values
('pattern-demo',1,'Latihan pola nilai tempat (demo)','NEEDS_REVIEW',true);
insert into public.assessment_items(set_id,set_version,item_id,item_version,position,kc_id,prompt,options,correct_option,hint) values
('pattern-demo',1,'PATTERN-01',1,1,'tens_ones_probe','Dua puluhan dan tiga satuan menjadi ...','[{"id":"five","label":"5"},{"id":"twentythree","label":"23"},{"id":"thirtytwo","label":"32"}]','twentythree','Hitung nilai dua puluhan.'),
('pattern-demo',1,'PATTERN-02',1,2,'tens_ones_probe','Empat puluhan dan dua satuan menjadi ...','[{"id":"six","label":"6"},{"id":"fortytwo","label":"42"},{"id":"twentyfour","label":"24"}]','fortytwo','Empat puluhan bernilai empat puluh.');
insert into public.item_error_mappings(set_id,set_version,item_id,item_version,option_id,error_code,rule_version,review_status) values
('pattern-demo',1,'PATTERN-01',1,'five','PLACE_VALUE_COMPOSE',1,'NEEDS_REVIEW'),
('pattern-demo',1,'PATTERN-02',1,'six','PLACE_VALUE_COMPOSE',1,'NEEDS_REVIEW');
-- No remediation_mapping is automatically approved or published by a developer.
