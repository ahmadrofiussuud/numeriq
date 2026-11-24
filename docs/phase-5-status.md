# NUMERIQ — Phase 5 status

Status 24 November 2026: implementasi empat role tersedia pada draft PR #4. Semua data, konten, dan akun pengujian bersifat sintetis. Tidak ada deployment atau pembayaran nyata.

## Scope terintegrasi

- **School Admin:** ringkasan tenant, kursi aktif/sisa, aktivasi dan nonaktivasi kursi dengan lock kapasitas, assignment guru-siswa, serta request perubahan kapasitas yang tetap `pending`.
- **Teacher/GPK:** overview siswa/asesmen/progres, assignment asesmen, evidence dan review Phase 4, serta assignment salah satu dari 12 modul draft.
- **Student:** sesi yang dibuka guru/wali, daftar 12 modul, asesmen, penyimpanan penyelesaian modul yang versioned dan idempotent, serta status progres.
- **Parent:** progress per anak, consent, dan akses belajar di rumah melalui school entitlement tanpa checkout baru.

## Kontrol backend

- Seluruh mutasi kursi, assignment, progres, dan request kapasitas dilakukan melalui RPC server-side dengan pemeriksaan role, tenant, relasi, consent, dan entitlement.
- Perubahan kursi mengunci institution row sebelum menghitung kuota; event idempotent mencegah penerapan ulang.
- Progress completion immutable dan terikat student, context institution, module version, serta sumber akses.
- Tabel assignment/progress tidak dapat dibaca atau ditulis langsung oleh role terautentikasi.
- Withdrawal consent langsung memblokir child learning dan mencabut sesi aktif.

## Verifikasi

GitHub Actions run 45316332893:

- 39 unit/reference tests, typecheck, production build, dan 9 browser activity tests dijalankan pada job `verify`.
- Database migration/reset berhasil.
- 66 integration/RLS checks berhasil, termasuk quota, idempotency, cross-tenant denial, school-funded home access, 12 modules, progress, dan consent withdrawal.
- 3 authenticated browser journeys berhasil: assessment, learning evidence/review, dan School Admin → Parent → Student module completion.

## Batas Phase 5

- Dua belas modul tetap `draft` dan `NEEDS_REVIEW`; penyelesaian demo bukan bukti efektivitas pembelajaran.
- Request kapasitas tidak menambah entitlement sampai alur verifikasi Phase 6 tersedia.
- Billing, invoice, Home checkout, webhook, cancellation, expiration, dan reconciliation belum diimplementasikan.
- Belum ada klaim pilot atau production readiness. Expert, legal/privacy, accessibility, dan security review tetap menjadi gate Phase 7.
