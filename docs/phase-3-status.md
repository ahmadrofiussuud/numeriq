# Phase 3 — assessment and response engine
Status: Phase 3 implemented and CI verified on 23 November 2026 (draft PR #2). Synthetic fixtures only, NEEDS_REVIEW. Changes: transactional assignment, immutable question versions, created/in_progress/completed/expired sessions, server-side scoring, hint tracking, idempotent responses, safe resume, teacher evidence view.
Authorization: relation + tenant snapshot + consent + entitlement + adult-bound child session rechecked server-side. Student DTO excludes scoring keys and correctness; teacher report explicitly authorized.
Source paths: migration 202611230003_assessments.sql; assessment-seed.sql; src/domain/assessment.ts; API routes; assessment-runner.tsx; teacher and student assessment pages; scripts/test-assessments.mjs; tests/auth/assessment.spec.ts.
PRD: TC-03/04, ST-03/04, ENG-01/02, BR-14/19/20/24, NFR-02/09/12/13/14; AT-03/05/06/10/16/18.
Version semantics: session pins set/item versions. Original responses are immutable even to direct privileged UPDATE; new content creates new versions.
Retry semantics: same response UUID and payload returns existing result; changed payload conflicts. New UUID for same item cannot add another score. A session lock serializes parallel submissions.
Hint usage is recorded by separate server mutation and copied into response; client cannot submit a hint flag or correctness.
One answer per item per assessment; subsequent learning attempts require another assignment. No BKT or misconception classification before Phase 4.
Local workstation disconnected during implementation. GitHub branch is authoritative for continued changes; latest remote work is not guaranteed in the Windows folder.

## Bukti verifikasi aktual
- GitHub Actions run #45176321161, commit ce2b52df: verify dan database sukses.
- 34 unit test lulus, 9 tes browser aktivitas lulus, TypeScript dan production build lulus.
- Supabase lokal: reset/migration/seed berhasil; 37 pemeriksaan integrasi lulus termasuk tenant, izin wali, lisensi, idempotensi bersamaan, perubahan versi item, dan hak akses laporan.
- Satu tes browser terautentikasi lulus: guru membuat tugas, anak menyelesaikan tiga item, respons pertama diterima server tetapi balasan browser terputus, kirim ulang tidak menggandakan jawaban, refresh memulihkan progres, lalu guru melihat bukti respons.
- Kegagalan awal terselesaikan: halaman anak sempat disiapkan statis saat build tanpa env; actor() kini membaca cookies sebelum memeriksa konfigurasi sehingga halaman tersebut dinamis.

## Batas Phase 3
- Laporan guru menunjukkan respons, KC, versi, benar/salah, waktu dan petunjuk. Error code dan interpretasi miskonsepsi masuk Phase 4; TC-04 baru terpenuhi sebagian.
- Konten sintetis masih NEEDS_REVIEW. Migrasi mematikan akses draft secara default; seed lokal mengaktifkannya khusus untuk pengujian. Tidak ada klaim pilot atau produksi.
- PR #2 bertumpu pada Phase 2 (#1) dan masih draft. Branch GitHub adalah sumber terbaru; folder Windows saat ini belum tersinkron karena operasi git ke GitHub gagal pada jaringan komputer tersebut.
