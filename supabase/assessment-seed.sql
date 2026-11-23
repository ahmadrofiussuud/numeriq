-- Synthetic-only fixture: local seed explicitly opts into draft content.
update public.assessment_config set allow_synthetic=true where id=true;
insert into public.assessment_sets(id,version,title,review_status,synthetic) values('numeracy-demo',1,'Eksplorasi numerasi awal (demo)','NEEDS_REVIEW',true);
insert into public.assessment_items(set_id,set_version,item_id,item_version,position,kc_id,prompt,options,correct_option,hint) values
('numeracy-demo',1,'DEMO-01',1,1,'quantity_symbol','Berapa jumlah tiga titik ini: ● ● ●?','[{"id":"two","label":"2"},{"id":"three","label":"3"},{"id":"four","label":"4"}]','three','Hitung setiap titik satu per satu.'),
('numeracy-demo',1,'DEMO-02',1,2,'tens_ones','Dua puluhan dan tiga satuan membentuk bilangan ...','[{"id":"five","label":"5"},{"id":"twentythree","label":"23"},{"id":"thirtytwo","label":"32"}]','twentythree','Satu puluhan sama dengan sepuluh.'),
('numeracy-demo',1,'DEMO-03',1,3,'addition','Tiga benda ditambah dua benda menjadi ...','[{"id":"one","label":"1"},{"id":"five","label":"5"},{"id":"six","label":"6"}]','five',null);
