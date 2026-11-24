# Phase 6 - kontrak dan billing sandbox

Status: implementasi sintetis lokal. Tidak ada deployment, kredensial payment live, atau uang nyata.

## Selesai

- Plan sekolah versioned: Starter 20, Growth 35, Institution 60. Harga dan kapasitas ditandai hipotesis.
- Request kapasitas tetap pending sampai operator internal melakukan verifikasi manual; perubahan diaudit.
- Home Monthly/Annual memakai harga server-side dan checkout idempotent.
- Adapter webhook lokal memakai HMAC SHA-256, validasi amount/currency/order, dan event unik `(provider,event_id)`.
- Checkout tidak mengaktifkan akses. Hanya webhook terverifikasi yang dapat membuat Home entitlement.
- Payment gagal tidak membuat entitlement; event duplikat tidak menggandakan entitlement.
- Pembatalan mematikan auto-renew tanpa memotong periode aktif. Expiry menonaktifkan akses tanpa menghapus histori.
- Lisensi sekolah diprioritaskan dan checkout Home diblokir saat school entitlement aktif.
- School entitlement yang datang ketika payment Home berjalan membuat reconciliation case, mematikan auto-renew, dan tidak membuat entitlement Home kedua.
- Tabel billing deny-by-default; mutasi webhook hanya untuk service role lokal setelah verifikasi signature.

## Keputusan yang tetap terbuka

- OD-04 add-on/prorata: approval request tidak menetapkan harga add-on.
- OD-05 refund overlap: tidak ada auto-refund.
- OD-06 provider/metode/fee: `numeriq_sandbox` bukan gateway produksi.
- Semua harga adalah hipotesis PRD dan semua data pengujian bersifat sintetis.

## Verifikasi

- Unit suite: signature valid/invalid dan parsing event.
- Integration suite: isolasi tenant, approval operator, quota, school-funded checkout, failed/paid payment, cancellation, duplicate webhook, overlap reconciliation, dan direct-table denial.
- Typecheck/build/reset Supabase menjadi gate CI karena dependency lokal Windows terkunci saat instalasi.
