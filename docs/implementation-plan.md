# NUMERIQ — Phase 0
Tanggal audit: 22 November 2026. Status: perencanaan selesai; implementasi belum dimulai.

## Bukti audit
Direktori C:/laragon/www/numeriq kosong pada pemeriksaan awal. Tidak ada package.json, lockfile, framework, schema, env example, test, README, aset desain maupun AGENTS.md lokal. Instruksi proyek dari percakapan tetap berlaku.
git status --short --branch: fatal: not a git repository. Branch dan riwayat belum tersedia.
Node, npm dan Git ditemukan di PATH; Docker tidak ditemukan di PATH (bukan bukti tidak terpasang). Tidak ada dependensi proyek yang dapat diverifikasi. Tidak ada aplikasi atau akun demo yang bisa dijalankan.

## Temuan PRD
- Empat role produk; operator internal terbatas. Seluruh fitur masih belum tersedia.
- 12 modul memakai empat player. Target awal 8–15 item per DOMAIN, bukan per modul.
- Error taxonomy dan BKT merupakan dua fungsi berbeda; review guru merupakan anotasi.
- Blueprint komponen PRD mencantumkan scoring_rule/error_mapping. Kontrak client harus menghilangkan kunci jawaban dan mapping internal; server memuat konfigurasi lengkap.
- Phase 3 membutuhkan entitlement sementara billing baru Phase 6: bangun resolver dan seed entitlement sintetis pada fondasi, tanpa pembayaran.
- School Admin hanya agregat secara default, bukan seluruh jawaban anak.
- Draft konten dapat digunakan hanya pada mode demo sintetis; rekomendasi pilot harus dari konten approved.
- B2C tidak memiliki validasi guru individual; copy harus berbeda dari sekolah.

## Fase dan estimasi
Estimasi engineering awal, bukan penawaran vendor. Satu person-day = 8 jam fokus; rentang mencakup implementasi dan pengujian normal, belum termasuk tunggu ahli dan legal.

| Fase | Scope / epic | Acceptance | Person-day |
|---|---|---|---|
| 0 | Audit E01, rencana, traceability | Empat dokumen tersedia, semua ID terpetakan | 2–3 |
| 1 | E01/E03: tokens, shells, auth, tenant, consent, resolver entitlement | Forbidden routes dan dua tenant diuji; OD-01 diselesaikan sebelum child auth | 12–18 |
| 2 | E02/E05: schema dan empat player | 12 draft IDs; keyboard/touch; content versioning | 10–15 |
| 3 | E06: assignment/session/response | Submit/resume/duplicate aman; consent dan entitlement dicek server | 10–15 |
| 4 | E07/E08: taxonomy, BKT, review | Reference math, replay, insufficient evidence, immutable raw data | 12–18 |
| 5 | E08/E09/E10: integrasi empat role | Alur sekolah dan rumah end-to-end; histori dan seat management | 12–18 |
| 6 | E04: billing sandbox/internal ops | Signature, replay, quota concurrency, no double billing | 10–15 |
| 7 | E11: pilot hardening | AT-01..18, expert review dan gate pilot terpenuhi | 12–20 |
| 8 | Handoff | Setup baru, operasi, demo dan backlog terdokumentasi | 3–5 |

Total 83–127 person-day; dengan buffer 20% sekitar 100–153 hari atau 800–1.224 jam. Pada kapasitas efektif 20 hari/bulan sekitar 5–7,7 person-month. Paralelisasi tidak menghilangkan dependensi review.
RAB engineering Rp30 juta berarti kapasitas anggaran implisit sekitar Rp24.500–37.500/jam untuk rentang tersebut; ini hitungan aritmetis, bukan tarif pasar. PM perlu memastikan kapasitas tim dan ruang lingkup sebelum komitmen. Jangan mengurangi kontrol izin agar cocok anggaran.

## Backlog yang dapat dieksekusi
| Tiket | Scope | Requirement utama | Dependensi / verifikasi |
|---|---|---|---|
| F1-01 | Scaffold, tokens, empat shells | NFR-06/07/15 | Pilihan stack; visual 390/1366 |
| F1-02 | Membership dan authorization | PL-01/02, BR-16/17 | DB; denial lintas tenant |
| F1-03 | Link wali dan consent ledger | PR-02/03, PL-03 | OD-01; AT-03/04/18 |
| F1-04 | Resolver entitlement + seed | PL-04, BR-05/06 | Test tanpa pembayaran |
| F2-01 | Versioned schema + 12 draft fixtures | ENG-01, ST-05 | OD-02/09; validasi schema |
| F2-02 | Empat player reusable | ST-08, NFR-06 | Keyboard/touch, public DTO |
| F3-01 | Assign, submit, resume | TC-03/04, ST-03/04, ENG-02 | AT-06/10/16 |
| F4-01 | Taxonomy dan probe | ENG-03/04 | OD-02; AT-07 |
| F4-02 | BKT dan replay | ENG-05/06/09 | OD-03; AT-08 |
| F4-03 | Review + remediasi | TC-07/08, ENG-07/08 | AT-09 |
| F5-01 | Admin people dan quota | SA-01..06 | Concurrent seat test |
| F5-02 | Teacher/parent/student progress | TC-01/02/09, PR-04/05, ST-07 | AT-02/11 |
| F6-01 | School manual activation | SA-07, PL-05/10 | Operator audit, AT-15 |
| F6-02 | Home sandbox lifecycle | PR-06..08, PL-06 | OD-06; AT-12/13/14 |
| F7-01 | Data requests, recovery, QA | PL-08, NFR-01..16 | AT-01..18; approvals |
| F8-01 | Setup dan operasi | NFR-15 | Clean setup rehearsal |

Estimasi per requirement di traceability menunjuk fase; jangan menjumlahkan estimasi yang berulang.

## Menjalankan lokal
Saat ini tidak ada perintah menjalankan aplikasi. Tidak ada package manifest, env sample, migration, seed atau test runner.
Rencana setelah scaffold Phase 1: npm ci; npx supabase start; npx supabase db reset; npm run dev; npm run test; npm run test:e2e. Ini kontrak script yang akan dibuat, BELUM executable/terverifikasi.
Supabase lokal memerlukan runtime container yang berfungsi; verifikasi Docker dan kompatibilitas Node/dependensi pada Phase 1. Jangan beralih ke backend cloud secara diam-diam.
Env yang direncanakan: public Supabase URL/key lokal; secret server hanya jika operasi privileged memerlukan; DEMO_MODE; payment adapter mock. Tidak ada nilai rahasia dibuat.

## Verifikasi aktual
Audit filesystem: PASS. Deteksi Git: NOT AVAILABLE (belum repository). Test aplikasi: NOT RUN (belum ada kode/tests). Demo visual: NOT AVAILABLE.
Phase 0 menghasilkan dokumentasi saja. Fitur produk: 0 implemented. Status pilot: BLOCKED.
Sesuai master prompt, berhenti setelah Phase 0 dan tunggu LANJUT PHASE 1.

