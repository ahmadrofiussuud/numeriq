# Keputusan terbuka NUMERIQ
Status 22 November 2026. Tidak ada keputusan produk baru yang dianggap disetujui.

| ID | Keputusan / owner | Batas waktu | Perlakuan sementara |
|---|---|---|---|
| OD-01 | Metode login anak — PM + Security | Dipilih PM pada Phase 1 | Sesi anak dibuka guru/wali; token sesi singkat, relasi/consent/entitlement dicek server. Implementasi belum lolos uji integrasi. |
| OD-02 | KC/item/error/remediation + rubrik — ahli | Engine/review konten | Engine dan fixtures sintetis tersedia; seluruh mapping/rubrik tetap NEEDS_REVIEW hingga disahkan ahli |
| OD-03 | Priors BKT dan hint — AI/ML + ahli | Engine release | Config v1 sintetis dan reference tests tersedia; hint sementara dikecualikan; priors/aturan tetap perlu pengesahan ahli |
| OD-04 | Add-on/prorata — PM + Finance | Live billing | Request manual, tidak menetapkan Rp200 ribu sebagai harga final |
| OD-05 | Overlap Home/School — PM + Finance/legal | Live billing | Reconciliation case; tidak auto refund atau charge ganda |
| OD-06 | Gateway/metode/fees — PM + Engineering | Integrasi Phase 6 | Adapter mock lokal |
| OD-07 | Consent, retensi, verifikasi wali — legal/privacy | Pilot nyata | Draft NEEDS_REVIEW, data sintetis saja |
| OD-08 | Stack/layout — Engineering | Scaffold | Proposal pada architecture.md; versi diperiksa saat instalasi |
| OD-09 | Grade, KC/item count, aksesibilitas — ahli | Approval konten | 12 IDs, 8–15 item/domain hanya target awal |
| OD-10 | Kapasitas/anggaran — PM + Engineering | Komitmen sprint | 83–127 person-day + buffer; perlu validasi tim |

## Klarifikasi tambahan hasil audit
- Riwayat ketika pindah sekolah: siapa berhak melihat histori lama dan apakah mastery dibawa? Usulan default isolasi context, tidak menghalangi schema awal.
- Response order dan evidence window: simpan urutan server; rentang bukti lintas sesi dan perubahan versi taxonomy harus ditetapkan sebelum engine release.
- Consent withdrawal saat transaksi berjalan: lock/check status di transaksi, bukan hanya awal request; kebijakan retensi tetap OD-07.
- Draft vs published: demo sintetis dapat membuka draft berlabel; pilot memerlukan approved/published. Konten tidak otomatis disahkan oleh developer.
- Docker tidak ditemukan di PATH. Runtime container perlu diverifikasi sebelum Supabase lokal dijalankan.
- Referensi hukum dalam PRD belum diverifikasi ulang pada audit engineering ini; bukan sign-off legal.

## Risiko utama
Isolasi tenant dan relasi anak (kritis); konten belum disetujui; interpretasi mastery; concurrency billing dan scoring; anggaran/jadwal; ketersediaan runtime lokal.
Phase 0 tidak terblokir. OD-01 merupakan keputusan nyata sebelum child auth, bukan alasan menghentikan pekerjaan dokumen atau adult auth.

