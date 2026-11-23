# Phase 1 — source foundation, BLOCKED verification

Tanggal: 22 November 2026. PM memilih supervised child session yang dibuka guru/wali.

## Ditulis
- Landing, login, empat role shells, loading/error/empty/forbidden dan layout responsif: src/app, src/components. NFR-06/07 masih menunggu visual/a11y QA.
- Adult password sign-in melalui Supabase Auth REST, HTTP-only cookie, role check server: src/server/supabase.ts dan src/app/actions.ts. PL-01 sebagian; registration/recovery/rate limiting belum lengkap.
- SQL RLS deny-default, relasi guru/wali, verified invite bound ke recipient, consent ledger, entitlement resolver, child sessions, audit: supabase/migrations/202611220001_foundation.sql. PL-02/03/04/07, PR-02/03/05, ST-01: source tersedia, belum integration PASS.
- Data sintetis dua sekolah; provisioning empat akun dewasa; undangan sekali pakai: supabase/seed.sql dan scripts/seed-users.mjs.
- Sesi anak 15 menit, terikat adult, pengecekan relasi/consent/entitlement setiap read, withdrawal merevoke sesi. Login adult satu jam tanpa silent refresh.
- Aturan domain dan 13 test negatif/positif: src/domain/access.ts, tests/access.test.ts. Kode domain murni menguji spesifikasi izin; runtime memakai SQL dan harus diuji tersendiri.

## Hasil aktual
| Pemeriksaan | Hasil |
|---|---|
| npm test | PASS — 13/13 domain tests |
| npm registry lookup | FAIL — ENOTFOUND registry.npmjs.org |
| Docker CLI detection | Tidak ditemukan PATH maupun path default yang diperiksa |
| Dependency install/lockfile | BLOCKED; tidak ada lockfile |
| Typecheck/build | NOT RUN; dependency belum tersedia |
| Supabase migration/RLS/API | NOT RUN; container/runtime belum tersedia |
| Browser, screen-reader, 390/1366 screenshot | NOT RUN; aplikasi belum dapat dijalankan |

## Keterbatasan wajib dituntaskan
1. Restore registry connectivity, resolve dependency versions, create lockfile, typecheck/build.
2. Jalankan Supabase lokal, migration dan seed; periksa API contract terhadap versi nyata.
3. Integrasi SQL: AT-03/04/05/15/18; duplicate invite, wrong recipient, expired token, revoked relation, stale consent, school/Home overlap.
4. Cocokkan domain tests dengan SQL enforcement; tes browser role redirects dan seluruh action.
5. Adult re-entry ketika selesai child mode saat ini diasumsikan perangkat diawasi; perlu reauthentication gate untuk perangkat bersama sebelum pilot.
6. Multi-membership belum tersedia: satu institution per adult. Registration, email verification/recovery dan application rate limits belum selesai.
7. Consent demo-v1 hanya untuk data sintetis; bukan dokumen consent siap pilot. UI tokens/custom CSS ada; Tailwind dan library accessible belum diintegrasikan.

Tidak ada hasil belajar, asesmen, payment atau BKT. Tidak ada deployment. Phase 1 BELUM selesai; Phase 2 tidak dimulai.

## Langkah berikutnya
Aktifkan akses npm dan runtime container lokal, lalu lanjutkan verifikasi dan penutupan gap Phase 1. Perintah setup terdapat di README.md; jangan menganggap UI source sebagai bukti backend berjalan.
