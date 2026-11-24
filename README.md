# NUMERIQ — Phase 2 learning foundation
Local-only, synthetic data. Next typecheck/build passed in GitHub Actions. Four activity components and 12 draft modules are available at /demo/activities. Database and final browser results are tracked in docs/phase-2-status.md.

## Prerequisites
Node 24.11.1 / npm 11.6.4 detected. npm registry DNS failed (ENOTFOUND). Docker was not found on PATH or at the standard Docker Desktop CLI path.
Install/enable a Docker-compatible runtime and Supabase CLI on your development machine. No cloud account or live payment is required.
Dependency ranges are provisional because registry access failed; npm install must resolve and produce package-lock.json before compatibility can be confirmed.

## Setup (PowerShell)
1. npm.cmd install
2. supabase start
3. supabase db reset (ONLY the fresh numeriq-local development database; destroys its prior local demo data)
4. Copy .env.example to .env.local; use local API URL and anon key from supabase status.
5. Set SUPABASE_SERVICE_ROLE_KEY in the current shell to the LOCAL key from supabase status. Set NUMERIQ_DEMO_PASSWORD to a password of at least 12 characters. Never put the service key in public/client env.
6. node scripts/seed-users.mjs (run once after fresh reset; fails on existing users to avoid silently replacing them).
7. npm.cmd run dev
8. Open http://127.0.0.1:3000

Accounts: admin@numeriq.test, guru@numeriq.test, wali@numeriq.test, guru-b@numeriq.test. All use the password you chose in step 5. Names and records are synthetic.
Seed script prints a synthetic single-use invitation for Bima; intended only for the seeded guardian. Nara is already linked but has no consent.
No refresh token is retained: after one hour adults sign in again. Child sessions expire after 15 minutes, are bound to the adult and recheck consent/access on every read. Phase 1 uses a single institution per adult profile; multi-membership from the PRD remains a documented gap.

## Verification
npm.cmd test — pure authorization domain tests, runs without dependencies.
npm.cmd run typecheck — requires installed dependencies.
npm.cmd run build — requires installed dependencies.
Integration/RLS/browser checks must be performed after local setup. Passing domain tests is NOT proof of SQL policies or runtime UI.
No real assessment scoring, BKT, billing, or clinical claims are implemented. Phase 2 fixtures are synthetic and NEEDS_REVIEW; they do not store learner responses.

## Demo flow
Parent sign-in -> inspect Nara -> grant draft demo consent -> open child session -> child shell -> return to adult.
Use printed invite -> verify Bima -> grant consent. Withdraw consent -> future child session reads denied.
Teacher -> only assigned school-A children. Teacher-B -> school-B only.
Admin -> aggregate school data, no response-level learner access.
Try another role URL -> forbidden. Without login -> login. Without backend config -> login disabled with explanation.

## Current verification and remaining gates
Phase 2 was authorized by PM. Child-mode return now requires adult password; child-mode cookies also block adult routes and actions. Typecheck/build passed on GitHub Actions; local dependency installation is still blocked by terminal DNS.
Verified on 23 November 2026: 27 domain tests, 9 Chromium tests, typecheck, build, both database migrations and 12 real Supabase RPC/RLS checks pass in CI run 45117329074. Local terminal DNS/runtime limitations remain.
Remaining: full authenticated browser flow, visual/screen-reader review, adult registration/recovery, robust application rate limits, production cookie policy and multi-membership. Draft consent requires review before real use. Generated package-lock.json is available in the CI artifact but not yet committed.
See docs/phase-2-status.md for current status; docs/phase-1-status.md is the earlier checkpoint. No pilot readiness claim.

## Repository
https://github.com/ahmadrofiussuud/numeriq — work branch codex/phase-2-learning, draft PR #1. No deployment configured.
Terminal Git DNS fails in the current sandbox, so source was synchronized through the connected GitHub API. Local origin is configured, but remote history has not been fetched. Once Git connectivity works, clone the work branch into a new directory to obtain the canonical commit history; do not force-push an unrelated local history.


## Phase 3 — asesmen sintetis

Branch `codex/phase-3-assessments` menambahkan penugasan guru, sesi anak, jawaban immutable dengan versi soal, penilaian server, petunjuk, resume dan laporan respons. Draft PR #2 bertumpu pada Phase 2 (#1). Tidak ada deployment atau BKT.

Setelah setup Supabase lokal dan seed akun sesuai instruksi di atas: wali login dan memberikan persetujuan demo untuk Nara; guru membuka **Asesmen**, menugaskan paket demo, lalu membuka ruang anak dari dashboard. Pilih tugas, jawab tiga soal, dan kembali ke pendamping dengan verifikasi kata sandi untuk melihat laporan.

`npx supabase db reset` menghapus data lokal dan memuat seed sintetis, termasuk konfigurasi khusus yang mengizinkan konten NEEDS_REVIEW. Jangan gunakan seed ini untuk siswa nyata. Migration sendiri menonaktifkan konten sintetis secara default.

Verifikasi tambahan: `node scripts/test-integration.mjs` pada Supabase lokal bersih; `RUN_AUTH_BROWSER=1 node scripts/test-integration.mjs` menjalankan perjalanan browser terautentikasi setelah build dan pemasangan Chromium. Skrip menyiapkan akun sintetis dan mengubah data lokal; gunakan instance uji. Hasil aktual dicatat pada [docs/phase-3-status.md](docs/phase-3-status.md).


## Phase 4 — learning evidence sintetis

Branch `codex/phase-4-learning-engine` menambahkan taxonomy kesalahan berversi, snapshot BKT per respons, state bukti, timeline mastery, dan review guru yang append-only. Draft PR #3 bertumpu pada Phase 3 (#2). Tidak ada deployment dan tidak ada klaim diagnosis.

Paket `pattern-demo` menyediakan bukti sintetis untuk menguji ambang minimal dua item berbeda. Satu jawaban salah tetap berstatus `insufficient_evidence`; pola baru dapat diajukan untuk review setelah muncul pada dua item berbeda. Respons yang memakai hint dicatat tetapi sementara dikecualikan dari evidence dan pembaruan BKT. Semua mapping, parameter, dan rubrik demo tetap `NEEDS_REVIEW` sampai disahkan ahli.

Verifikasi aktual pada 23 November 2026: 39 unit/reference-math tests, 9 browser activity tests, typecheck, production build, 52 integration/RLS checks, dan 2 authenticated browser journeys lulus pada [GitHub Actions run 45185668733](https://github.com/ahmadrofiussuud/numeriq/actions/runs/45185668733). Detail sumber, batas keamanan, dan hasil pengujian tersedia di [docs/phase-4-status.md](docs/phase-4-status.md).

Phase 4 berhenti pada engine dan alur review sintetis. Sebelum pilot nyata, ahli perlu mengesahkan taxonomy/remediation, priors BKT, aturan hint, serta kebijakan evidence window; legal/privacy juga perlu menyetujui consent dan retensi.

## Phase 5 — empat role end-to-end

Branch `codex/phase-5-four-role-flows` dan draft PR #4 menghubungkan School Admin, Teacher, Student, dan Parent ke backend yang sama. Admin dapat mengelola kursi dan assignment guru dalam tenant; guru dapat menugaskan asesmen/modul dan memantau progres; anak dapat menyelesaikan salah satu dari 12 modul; wali dapat melihat progres dan membuka akses rumah dari lisensi sekolah tanpa checkout baru.

Semua konten masih sintetis/`NEEDS_REVIEW`. Request kapasitas hanya dicatat sebagai `pending`; billing, invoice, pembayaran, dan approval operasional baru masuk Phase 6. Hasil dan batas pengujian dicatat di [docs/phase-5-status.md](docs/phase-5-status.md).

## Phase 6 - billing sandbox

Branch `codex/phase-6-sandbox-billing` menambahkan plan sekolah dengan verifikasi manual, checkout Home bulanan/tahunan, webhook HMAC lokal, idempotensi pembayaran, cancellation/expiry, dan reconciliation tanpa double entitlement. Tidak ada payment live atau deployment. Detail tersedia di [docs/phase-6-status.md](docs/phase-6-status.md).

## Phase 7 - pilot hardening

Phase 7 menambah privacy-request ledger, child-safety copy, request ID webhook, accessibility smoke checks, performance smoke, backup/restore draft, content approval checklist, dan audit AT-01..AT-18. Status tetap **BLOCKED**, bukan `READY_FOR_PILOT`, karena approval ahli/legal/security dan usability nyata belum tersedia. Lihat [docs/phase-7-pilot-readiness.md](docs/phase-7-pilot-readiness.md).
