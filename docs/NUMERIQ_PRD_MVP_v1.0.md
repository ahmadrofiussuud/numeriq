---
title: "NUMERIQ | Product Requirements Document — MVP v1.0"
subtitle: "Pemetaan Miskonsepsi Numerasi, Remediasi Adaptif, dan Pemantauan Pembelajaran"
author: "NUMERIQ Product Team"
date: "22 November 2026"
lang: id-ID
---

# NUMERIQ — Product Requirements Document (PRD)

**Versi:** 1.0 — Draft baseline untuk review lintas fungsi  
**Tanggal:** 22 November 2026  
**Status:** *Proposed for product/engineering/pedagogy review*; belum disetujui ahli, belum lulus security/legal review  
**Pemilik keputusan:** Product Manager NUMERIQ  
**Pengguna dokumen:** Product, UI/UX, Frontend, Backend, AI/ML, Education Specialist, reviewer ahli, QA  
**Target produk:** MVP web responsif; pilot sebelum peluncuran B2B dan B2C di bulan ke-7.

> **Keputusan final vs asumsi.** Paket bisnis, empat role, 12 micro-module dengan reusable components, BKT + Error Pattern Taxonomy, akses rumah dari lisensi sekolah, dan target rilis bulan ke-7 merupakan keputusan arah produk. Stack teknis, batas angka evaluasi, detail taxonomy, aturan penagihan seat tambahan, kebijakan refund, serta parameter BKT masih rancangan yang harus diuji/ditetapkan. Dokumen ini **bukan** klaim validasi klinis atau kepatuhan hukum yang telah diaudit.

## 1. Executive Summary

NUMERIQ adalah platform EdTech yang membantu guru dan orang tua memahami **di konsep mana** seorang siswa mengalami kesulitan numerasi dan **bukti respons apa** yang mendukung dugaan tersebut. NUMERIQ menggabungkan: (1) asesmen numerasi dengan distraktor terkode; (2) *Expert Error Pattern Taxonomy* dan soal probe; (3) *Bayesian Knowledge Tracing (BKT)* untuk estimasi penguasaan konsep dari waktu ke waktu; (4) rekomendasi remediasi dari library pedagogis yang dikurasi; dan (5) dashboard tindakan guru serta ringkasan orang tua.

NUMERIQ **bukan instrumen diagnosis diskalkulia**. Klaim produk dibatasi pada pemetaan pola respons dan dukungan pembelajaran. BKT mengestimasi penguasaan *knowledge component* (KC), bukan prevalensi kondisi klinis. Guru tetap dapat menerima, menolak, dan mengoreksi dugaan pola kesalahan. Pada Home Plan, rekomendasi belum tervalidasi individual oleh guru dan disajikan sebagai **aktivitas latihan yang disarankan**, bukan kesimpulan diagnostik.

| Dimensi | Keputusan dasar |
|---|---|
| Target pembeli B2B | SD swasta inklusif Jabodetabek, dengan guru/GPK sebagai pengguna utama |
| Target B2C | Orang tua/wali yang membutuhkan pembelajaran numerasi di rumah |
| Role | School Admin, Teacher/GPK, Student, Parent/Guardian |
| Paket B2B | Starter 20 siswa Rp6 juta/tahun; Growth 35 siswa Rp9 juta/tahun; Institution 60 siswa Rp13,5 juta/tahun |
| Onboarding | Rp1,5 juta sekali untuk sekolah baru; ketentuan finansial detail perlu validasi |
| Home Plan | Rp69.000/bulan atau Rp690.000/tahun, per anak; masih harga uji |
| Akses rumah | Siswa berlisensi sekolah dapat belajar di rumah tanpa membayar lagi |
| Pembelajaran MVP | 3 domain, 12 micro-module; 4 komponen interaktif reusable |
| Algoritma | Rule-based error taxonomy + BKT awal berbasis parameter telaah ahli + pedagogical mapping |
| Delivery | Satu web app responsif; internal operator console minimal; bulan 1–6 build/pilot, bulan 7 rencana commercial launch |
| Ekonomi awal | Anggaran RAB MVP Rp63.343.500, termasuk engineering Rp30 juta; **bukan estimasi effort yang sudah tervalidasi** |

## 2. Problem, Value, dan Product Goals

### 2.1 Problem statements

- Guru mengetahui siswa salah menjawab, tetapi belum tentu mengetahui konsep atau strategi berpikir apa yang menyebabkan kesalahan.
- Remediasi sering cenderung mengulang soal, bukan memilih representasi yang cocok untuk jenis kesulitan konsep.
- Orang tua sulit memperoleh penjelasan perkembangan numerasi yang mudah ditindaklanjuti di rumah.
- Sekolah membutuhkan pengelolaan lisensi, penugasan guru, dan ringkasan penggunaan yang tidak mencampurkan data lintas institusi.

### 2.2 Jobs to be Done

- **Guru/GPK:** “Saat siswa berulang kali salah dalam konsep numerasi, bantu saya menemukan bukti dan memilih tindak lanjut yang dapat saya tinjau.”
- **Siswa:** “Saya ingin belajar dengan aktivitas konkret dan respons yang membantu tanpa rasa dihakimi.”
- **Orang tua:** “Tolong jelaskan perkembangan anak dengan bahasa yang saya pahami serta berikan aktivitas pendampingan yang aman.”
- **Admin sekolah:** “Saya perlu mengelola guru, kursi siswa, pembayaran, dan pelaporan agregat tanpa mengakses data yang tidak perlu.”

### 2.3 Tujuan MVP (berbasis hipotesis)

1. Demonstrasikan alur end-to-end **assessment → evidence → mastery estimate → recommended activity → progress**.
2. Sediakan 12 micro-module yang ditelaah ahli dan menggunakan interaksi reusable.
3. Berikan guru kemampuan memeriksa, memperbaiki, dan menolak dugaan pola kesalahan.
4. Jalankan kedua sumber lisensi B2B/B2C tanpa menagih dua kali untuk hak akses dasar yang sama.
5. Jaga keamanan dan privasi anak sejak desain, termasuk persetujuan wali, minimisasi data, isolasi sekolah, dan jejak audit.

### 2.4 Non-goals MVP

Tidak mengklaim diagnosis klinis, tidak menjalankan automated mental/learning disorder screening, tidak memakai chatbot LLM untuk siswa, tidak memakai GenAI untuk mengeluarkan label miskonsepsi secara otonom, tidak menyediakan marketplace atau iklan, tidak menjual data anak, tidak membangun aplikasi native, tidak mengintegrasikan SIM sekolah eksternal, tidak menyediakan sistem multi-cabang enterprise, dan tidak membuat mini-game unik per modul.

### 2.5 Hipotesis terukur dan eksperimen

| Hipotesis | Cara memeriksa | Ambang keputusan awal (usulan, bukan bukti) |
|---|---|---|
| Guru memahami bukti miskonsepsi | Wawancara + tugas baca dashboard | ≥80% peserta uji dapat menjelaskan rekomendasi dan bukti |
| Alur assignment usable | Uji tugas guru | ≥80% penyelesaian tugas inti tanpa bantuan langsung |
| Modul sesuai kemampuan siswa | Observasi terstruktur, wawancara guru, uji keterpahaman | Tidak ada hambatan kritis yang menghalangi penyelesaian |
| BKT tidak menyesatkan pengguna | Test case numerik, review ahli | 100% test reference lulus; jelas sebagai estimasi, bukan diagnosis |
| School-to-home entitlement konsisten | Uji akun, status, batas kuota | 0 kasus penagihan ganda pada skenario QA |
| Pricing dan akuisisi layak | Demo, interview WTP, pilot 4–6 minggu | Ditetapkan setelah data lapangan tersedia |

## 3. Users, Roles, dan Hak Akses

| Role | Persona dan tujuan | Batas akses utama |
|---|---|---|
| School Admin | Admin/koordinator institusi mengelola langganan, guru, siswa, kuota | Lihat laporan agregat; detail individual hanya jika ditugaskan/berwenang |
| Teacher / GPK | Guru atau pendamping mengelola asesmen dan remediasi | Detail siswa yang ditugaskan dalam institusi bersangkutan |
| Student | Anak mengerjakan asesmen dan modul | Hanya aktivitas dan progres dirinya; tidak melihat label klinis atau data siswa lain |
| Parent / Guardian | Wali mengelola consent, akses, pembayaran, dan pemantauan | Hanya anak yang telah diverifikasi keterkaitannya |
| Internal Operator (bukan role produk kelima) | Staf NUMERIQ memverifikasi kontrak, invoice, seats, dan support | Panel internal minimal, privileged, diaudit; tidak punya akses bebas ke seluruh detail belajar |

**Prinsip identitas:** akun siswa tidak melakukan self-registration komersial. Akun siswa dibuat melalui sekolah atau wali dengan metode akses yang ramah usia dan aman. Relasi wali–anak diverifikasi; undangan kedaluwarsa dan hanya sekali pakai.

## 4. Information Architecture

### 4.1 Public / onboarding

Landing (value, How It Works, School Plans, Home Plan, Privacy) → Login/Register → pilih konteks Sekolah/Orang Tua → proses entitlement/consent → redirect berdasarkan role. Harga bersifat harga uji dan informasi layanan tidak boleh mengandung klaim diagnosis.

### 4.2 School Admin

- **Overview:** ringkasan guru, siswa berlisensi, kursi tersisa, status langganan.
- **People:** Teachers → Invite/Status; Students → Create/Import/Assign/Status.
- **Subscription:** Plan & Seats → Request Upgrade/Add-on; Billing → invoice/status kontrak.
- **School Reports:** agregat penggunaan, bukan daftar diagnosis.
- **Settings:** profil institusi dan pengaturan minimal.

### 4.3 Teacher/GPK

- **Dashboard:** assigned students, assessment pending, review needed, recent progress.
- **My Students:** daftar → Student Detail → evidence/progress/history.
- **Assessments:** create/assign → sessions → result details.
- **Misconception Map:** per KC, evidence count, status/teacher verification.
- **Remediation:** recommended activities → review/assign → follow up.
- **Progress Reports:** progress antarsesi, export ringkas (P1).

### 4.4 Student

- **My Learning:** tugas saat ini, lanjut sesi.
- **Assessment:** petunjuk → item → konfirmasi selesai.
- **Learning Activities:** reusable interactive player.
- **My Progress:** pencapaian aktivitas dengan bahasa suportif.
- **Profile:** preferensi aksesibilitas dasar.

### 4.5 Parent/Guardian

- **Home:** ringkasan anak, pengingat aktivitas, akses belajar.
- **My Children:** profil dan verifikasi hubungan.
- **Learning Progress:** penjelasan sederhana per konsep tanpa label klinis.
- **Learn at Home:** aktivitas rekomendasi atau tugas sekolah.
- **Subscription:** paket B2C jika tidak memiliki school entitlement; status dan pembatalan.
- **Settings & Consent:** kebijakan, persetujuan, permintaan data.

## 5. User Flows dan Alternative Flows

### UF-B2B-01: pembelian dan aktivasi sekolah

1. School Admin membuat permintaan institusi dengan paket 20/35/60.
2. Sistem mencatat status `requested`; internal operator meninjau kontrak/invoice.
3. Pembayaran terkonfirmasi (`active`) → entitlement kursi diterbitkan, effective/expiry date disimpan.
4. School Admin mengundang guru, membuat siswa, mengaitkan guru dan wali.
5. Sebelum asesmen, parent/guardian mengisi persetujuan sesuai kebijakan dan kewajiban hukum yang berlaku.
6. Teacher memberi assignment. Student mengerjakan. Hasilnya muncul di dashboard guru.
7. Guru meninjau evidence, mengonfirmasi/menolak dugaan, dan menugaskan aktivitas.
8. Anak mengerjakan di sekolah atau rumah tanpa biaya tambahan; progres dapat ditinjau oleh role berhak.

**Alternatif:** belum bayar → tidak ada entitlement; kursi penuh → akun tunggu; consent belum valid → tidak melakukan asesmen; siswa pindah institusi → akses direkonsiliasi tanpa membocorkan data; koneksi putus → penyimpanan progres aman dan no duplicate scoring.

### UF-B2C-01: pembelian orang tua dan belajar di rumah

1. Wali registrasi/verifikasi akun, membuat profil anak, memberi persetujuan.
2. Sistem memeriksa school entitlement anak menggunakan tautan wali yang terverifikasi.
3. Bila berlisensi sekolah → tampilkan *School Access Included*; **tidak boleh checkout Home Plan untuk hak dasar yang sama**.
4. Jika tidak → pilih Monthly/Annual; checkout melalui provider eksternal terintegrasi *sandbox* selama development.
5. Pembayaran tervalidasi server-side → entitlement Home aktif; anak dapat membuka assessment dan learning activities.
6. Wali melihat progres dan mengelola perpanjangan/pembatalan.

**Alternatif:** gagal bayar, webhook datang berulang/terlambat, refund, langganan habis, school entitlement aktif di tengah periode Home, wali menarik persetujuan, konflik pengaitan anak. Semua memiliki status dan pesan yang jelas; perubahan pembayaran harus idempotent.

### UF-LEARN-01: learning loop

`Assignment / suggested activity → readiness & instructions → assessment items → evidence extraction → probe if needed → KC mastery update → teacher review (school) / parent-friendly guidance (Home) → remediation → progress review.`

- Soal dengan hint tidak otomatis diperlakukan sebagai observasi independen untuk update BKT.
- Jawaban salah satu item tidak dapat langsung menjadi label miskonsepsi persisten.
- Anak tidak melihat “risiko diskalkulia”; guru melihat bahasa “dugaan pola kesalahan, perlu review”.
- Satu response event hanya boleh diterapkan sekali ke learner state.

## 6. Functional Requirements — Product Roles

Setiap FR di bawah menjadi *user story* dan harus dapat diuji. **P0** wajib untuk *minimum releasable product*, **P1** berguna bila waktu memungkinkan, **P2** setelah MVP.

### 6.1 School Admin

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| SA-01 | Overview institusi, aktif/sisa kursi | P0 | Angka hanya dari entitlements aktif dan selalu terikat institution_id |
| SA-02 | Invite, revoke, dan lihat guru | P0 | Undangan hanya sekali pakai/berumur terbatas; guru nonaktif tidak mendapat akses |
| SA-03 | Buat/impor siswa CSV tervalidasi | P0 | Baris salah ditolak dengan pesan; tidak ada duplikasi ID sekolah |
| SA-04 | Assign siswa ke guru | P0 | Guru lain tidak dapat membaca data siswa tanpa assignment |
| SA-05 | Kelola kuota paket | P0 | Starter=20, Growth=35, Institution=60; aktivasi seat ke-21 Starter ditolak |
| SA-06 | Request tambah kursi/upgrade | P0 | Request tercatat; kursi bertambah setelah persetujuan/entitlement valid |
| SA-07 | Lihat invoice/status kontrak | P0 | Status paid tidak dapat diubah hanya dari client |
| SA-08 | Laporan agregat sekolah | P1 | Metrik agregat tidak membocorkan identitas anak yang tidak relevan |
| SA-09 | Ekspor agregat | P1 | Ekspor dibatasi per tenant, diberi audit trail |

### 6.2 Teacher / GPK

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| TC-01 | Dashboard assignment dan review | P0 | Menampilkan hanya siswa yang diampu dan item perlu tindak lanjut |
| TC-02 | Student Detail dan longitudinal history | P0 | Data terikat siswa/tenant dan memiliki histori antarsesi |
| TC-03 | Buat assignment asesmen | P0 | Hanya pada siswa berlisensi, consent valid, dan item tersedia |
| TC-04 | Lihat respons dan hasil per item | P0 | Jawaban asli, KC, error code, timestamp, hint info tampil akurat |
| TC-05 | Lihat mastery KC | P0 | Label “estimasi”; tidak ditampilkan sebagai diagnosis |
| TC-06 | Lihat suspected error/evidence | P0 | Minimal menyebut evidence count, item, serta status insufficient/provisional/reviewed |
| TC-07 | Review/approve/reject/edit classification | P0 | Audit trail menyimpan previous value, decision, reviewer, reason, timestamp |
| TC-08 | Assign remediation | P0 | Aktivitas terhubung ke KC/error map yang disetujui ahli |
| TC-09 | Monitor remediation outcomes | P0 | Status completion dan mastery timeline per KC diperbarui |
| TC-10 | Ringkasan laporan wali | P1 | Bahasa nonklinis, tidak menyebut diagnostic risk score |
| TC-11 | Catatan observasi pedagogis | P1 | Ditulis guru; tidak diperlakukan sebagai label ML otomatis |

### 6.3 Student

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| ST-01 | Masuk melalui akses yang dikelola sekolah/wali | P0 | Tidak ada self-signup siswa/checkout; sesi terbatas dan aman |
| ST-02 | Lihat tugas sesuai entitlement | P0 | Anak tidak melihat konten berbayar yang tidak berhak |
| ST-03 | Kerjakan asesmen | P0 | Item tampil adaptif kebutuhan akses; respons server-side tercatat sekali |
| ST-04 | Simpan/resume sesi dengan aman | P0 | Refresh/koneksi putus tidak menggandakan hasil; state dipulihkan |
| ST-05 | Belajar melalui 12 micro-module | P0 | Konten dimuat dari schema, empat komponen dapat dipakai ulang |
| ST-06 | Umpan balik suportif | P0 | Tidak menggunakan label “gagal”, “diskalkulia”, perbandingan peringkat |
| ST-07 | Lihat progres aktivitas | P0 | Hanya progres sendiri dan teks sesuai usia |
| ST-08 | Aksesibilitas pembelajaran | P0 | Bisa keyboard/touch, target cukup besar, kontras/petunjuk jelas |
| ST-09 | Badge/koleksi reward | P2 | Tidak mengganggu tugas inti atau membuka data orang lain |

### 6.4 Parent / Guardian

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| PR-01 | Register/sign in/secure recovery | P0 | Verifikasi akun dan sesi aman, rate limits |
| PR-02 | Create/link child profile | P0 | Wajib verification flow; tidak bisa memilih ID anak lain sembarang |
| PR-03 | Manage consent | P0 | Consent version + timestamp + signer disimpan; withdrawn menghentikan proses terkait |
| PR-04 | View per-child progress | P0 | Hanya anak yang terhubung; penjelasan parent-friendly |
| PR-05 | Access child learning at home | P0 | School-funded entitlement tidak memicu pembayaran baru |
| PR-06 | Purchase Monthly/Annual Home | P0 | Price server-side; sandbox checkout, verifikasi pembayaran backend |
| PR-07 | View subscription/payment status | P0 | Tanggal aktif/akhir konsisten, tidak bergantung state frontend |
| PR-08 | Cancel renewal / manage lifecycle | P0 | Pembatalan mengikuti ketentuan paket, perubahan tercatat |
| PR-09 | Parent guidance library | P1 | Seluruh anjuran berasal dari materi yang direview ahli |
| PR-10 | Export child summary | P1 | Hanya data yang berhak diakses, ekspor diaudit |

### 6.5 Shared platform / internal operations

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| PL-01 | Authentication and RBAC | P0 | Endpoint server mengotorisasi role + relation + tenant |
| PL-02 | Multi-tenant school isolation | P0 | Tenant A tidak dapat membaca/ubah data Tenant B, termasuk melalui ID tebak |
| PL-03 | Student–guardian link and consent | P0 | Ada verifikasi kepemilikan, bukti persetujuan, status dan pencabutan |
| PL-04 | Unified entitlement | P0 | Prioritaskan school entitlement; mencegah duplicate Home billing |
| PL-05 | School contract manual verification | P0 | Aktivasi hanya oleh internal privileged operator, audit log |
| PL-06 | B2C payment callbacks | P0 | Signature verified, server-only secrets, idempotent event handling |
| PL-07 | Audit log | P0 | Perubahan role, consent, pembayaran, teacher review tercatat tanpa PII berlebih |
| PL-08 | Account/export/deletion request | P0 | Permintaan terautentikasi, triage dan tindak lanjut dicatat; retensi dikonfigurasi |
| PL-09 | Feature flags/config | P1 | Dapat nonaktifkan checkout live dan modul yang belum diverifikasi |
| PL-10 | Internal support console minimal | P0 | Tindakan privileged terdokumentasi dan terikat hak akses |

## 7. Functional Requirements — Learning & Intelligence Engine

| ID | Requirement | P | Acceptance criteria |
|---|---|---|---|
| ENG-01 | Versioned item bank (KC, difficulty, distractor error code) | P0 | Setiap item mereferensi versi content dan reviewer |
| ENG-02 | Assessment/session state machine | P0 | Status created/in_progress/completed/expired, idempotent response |
| ENG-03 | Error classification by deterministic rule | P0 | Mapping test case berlabel konsisten; unknown tetap unknown |
| ENG-04 | Evidence counter and optional probe | P0 | Satu respons tidak memaksakan persistent error; distinct-item evidence |
| ENG-05 | BKT per knowledge component | P0 | Hitungan sesuai reference formula; no duplicate update |
| ENG-06 | Expert parameter configuration/versioning | P0 | Priors dan perubahan terlacak; tidak belajar otomatis dari data minim |
| ENG-07 | Expert-reviewed remediation map | P0 | Saran hanya menuju aktivitas approved; state fallback tersedia |
| ENG-08 | Teacher correction / reason | P0 | Human correction tersimpan tanpa menimpa respons mentah |
| ENG-09 | Longitudinal progress timeline | P0 | Tanggal, KC, mastery snapshot dan intervention event konsisten |
| ENG-10 | Nonclinical explanation policy | P0 | Output student/parent non-diagnostic; disclaimer guru konsisten |
| ENG-11 | Advanced calibration / auto-generation | P2 | Tidak aktif di MVP dan tidak memproses PII tanpa approval |

## 8. Domain, Micro-modules, dan Reusable Interactions

### 8.1 Dua belas modul tahap MVP

| Code | Domain | Micro-module | Utama diuji | Komponen reuse |
|---|---|---|---|---|
| NS-01 | Number Sense | Mengenali kuantitas | quantity–symbol mapping | Dot Pattern / Ten Frame |
| NS-02 | Number Sense | Simbol dan jumlah | symbolic-nonsymbolic match | Ten Frame + Choice |
| NS-03 | Number Sense | Membandingkan besaran | magnitude comparison | Choice + Number Line |
| NS-04 | Number Sense | Urutan bilangan | sequence/position error | Number Line |
| PV-01 | Place Value | Puluhan dan satuan | tens–ones distinction | Base-Ten Blocks |
| PV-02 | Place Value | Komposisi bilangan | compose tens + ones | Base-Ten + Choice |
| PV-03 | Place Value | Dekomposisi bilangan | part-whole of place value | Base-Ten + Choice |
| PV-04 | Place Value | Nilai digit | position-value reasoning | Base-Ten + Number Line |
| AR-01 | Arithmetic | Number bonds | missing part and number fact | Choice + Ten Frame |
| AR-02 | Arithmetic | Penjumlahan konseptual | addition strategy | Ten Frame + Choice |
| AR-03 | Arithmetic | Pengurangan konseptual | subtraction strategy | Number Line + Choice |
| AR-04 | Arithmetic | Regrouping | carry/borrow conceptual errors | Base-Ten Blocks |

**Semua judul, urutan tingkat kelas, error labels, indikator capaian, dan kesesuaian kurikulum masih harus disetujui Education Specialist serta reviewer ahli.** Tidak otomatis semua modul cocok bagi semua anak kelas II–V; aktivitas harus dipilih berdasarkan kebutuhan KC dan kemampuan aktual.

### 8.2 Empat komponen reusable

1. `TenFrameActivity`: dot pattern, jumlah objek, drag/select/tap; input jumlah item dari schema.
2. `NumberLineActivity`: memilih atau memindah posisi bilangan pada garis bilangan; parameter min/max/step.
3. `BaseTenBlocksActivity`: manipulasi puluhan/satuan dan regrouping; representasi visual standar.
4. `ResponseChoiceActivity`: single select/matching/pilihan terlabel; distractor error codes eksplisit.

Setiap komponen memiliki props/schema konsisten (`activity_id`, `module_id`, `kc_id`, `item_version`, `prompt`, `ui_config`, `options`, `scoring_rule`, `error_mapping`, `hint_policy`, `locale`, `accessibility_text`). Semua respons disimpan melalui Assessment API, bukan menentukan correctness dari frontend saja.

### 8.3 Content authoring & validation workflow

Draft content → internal curriculum review → external subject matter expert review → QA UX/aksesibilitas → approved/published → immutable content version. Perubahan soal yang sudah digunakan tidak boleh mengubah bukti historis; buat revisi versi baru.

Untuk tiap micro-module minimal tersedia tujuan belajar, daftar KC, 8–15 butir diagnostik **per domain sebagai target awal**, distractor/error mapping, soal probe, aktivitas remediasi, mastery check, panduan guru, review status. Jangan menyamakan 8–15 soal per domain dengan 8–15 soal per modul.

## 9. BKT, Error Taxonomy, dan Teacher Oversight

### 9.1 Batas peran algoritma

- **Error taxonomy**: interpretasi terbatas pola respons dengan aturan yang disusun ahli, menggunakan `error_code` dan bukti berulang.
- **BKT**: posterior *mastery* satu KC berdasarkan urutan jawaban; tidak menentukan penyebab medis/klinis.
- **Pedagogical mapping**: memilih aktivitas tervalidasi dari pasangan KC/error, dibatasi oleh aturan tingkat kesulitan dan kebutuhan bantuan.
- **Teacher review**: keputusan profesional yang disimpan sebagai lapisan anotasi; tidak menulis ulang data respons mentah atau mengubah parameter model secara diam-diam.

### 9.2 BKT klasik untuk MVP

Parameter per KC: `p_init`, `p_learn`, `p_guess`, `p_slip`, di rentang [0,1]. Untuk respons **benar** dan prior `p`:

`posterior = (p × (1 − p_slip)) / (p × (1 − p_slip) + (1 − p) × p_guess)`.

Untuk respons **salah**:

`posterior = (p × p_slip) / (p × p_slip + (1 − p) × (1 − p_guess))`.

Transisi setelah kesempatan belajar: `next_mastery = posterior + (1 − posterior) × p_learn`.

Guardrails: hindari pembagi nol; clamping nilai terdefinisi; batch replay deterministik; update tepat sekali per response ID; pisahkan observasi dengan hint; simpan parameter version dan model version; jangan tampilkan presisi berlebihan. Forgetting tidak dimasukkan pada MVP kecuali review model membenarkannya. **Parameter awal adalah expert priors, belum tervalidasi dari dataset NUMERIQ.**

### 9.3 Evidence threshold dan label UI

Ambang *suspected pattern* awal: error_code relevan muncul pada **≥2 item berbeda** dalam KC terkait dan memiliki bukti yang cukup; angka ini merupakan **provisional review setting**, bukan ambang klinis. Bila belum memenuhi, state `insufficient_evidence`. Teacher UI menunjukkan `needs_review`, `reviewed`, atau `rejected` disertai detail evidence. Home UI hanya menampilkan “Konsep yang bisa dilatih” dan “Aktivitas yang disarankan”, bukan label miskonsepsi tervalidasi.

### 9.4 Contoh event teknis (semua data sintetis)

```json
{
  "response_id": "res_demo_001",
  "student_id": "stu_demo_001",
  "assessment_session_id": "sess_demo_001",
  "item_id": "PV01_Q03",
  "item_version": 1,
  "knowledge_component_id": "place_value_tens_ones",
  "is_correct": false,
  "selected_option_id": "opt_612",
  "error_code": "PLACE_VALUE_CONCAT",
  "attempt_number": 1,
  "hint_used": false,
  "response_time_ms": 12400
}
```

Server membuat `error_code` dari item version/selected option dan aturan validator; **jangan percaya error_code mentah dari client**. Response time bukan indikator tunggal masalah belajar; simpan hanya bila punya tujuan yang jelas dan persetujuan sesuai kebijakan.

## 10. Business Rules, Billing, dan Entitlement

| ID | Business rule |
|---|---|
| BR-01 | Paket School berkapasitas Starter 20, Growth 35, Institution 60 siswa berlisensi aktif. |
| BR-02 | Harga sekolah per tahun Rp6 juta / Rp9 juta / Rp13,5 juta; Home Rp69 ribu/bulan atau Rp690 ribu/tahun; semua harga masih hipotesis uji. |
| BR-03 | Biaya onboarding sekolah baru Rp1,5 juta sekali pada transaksi awal. |
| BR-04 | Seluruh paket sekolah mempunyai fitur inti sama; pembeda utama kapasitas siswa. |
| BR-05 | School entitlement memberi akses sekolah **dan rumah** untuk siswa terkait tanpa penagihan ulang. |
| BR-06 | Home Plan berlaku untuk anak yang belum dilindungi school entitlement setara. |
| BR-07 | Upgrade paket atau add-on seat diperbolehkan, tetapi penambahan kuota hanya setelah persetujuan/perubahan entitlement. |
| BR-08 | Harga add-on Rp200 ribu/seat/tahun prorata masih rancangan dan perlu kebijakan *anti-cannibalization*. Jangan hardcode sebagai final. |
| BR-09 | Anak tidak membeli langganan sendiri; parent/guardian yang menjadi pihak penagihan. |
| BR-10 | Billing status `pending`, `paid`, `failed`, `refunded`, `expired` dikelola server; tidak percaya callback dari browser. |
| BR-11 | Semua payment webhook di-signature verify, memiliki event id, diproses idempotent dan audit. |
| BR-12 | Parent–child relation harus diverifikasi sebelum data anak terlihat. |
| BR-13 | Parent consent tercatat per versi dokumen dengan waktu dan pemberi persetujuan. |
| BR-14 | Tanpa consent yang diperlukan, asesmen dan pemrosesan terkait tidak dapat dilakukan. |
| BR-15 | Penarikan persetujuan harus mempunyai alur penanganan data dan penghentian proses sesuai ketentuan. |
| BR-16 | Guru hanya mengakses siswa yang diampu pada sekolah yang sama. |
| BR-17 | School Admin mendapat data agregat; akses individual tambahan perlu dasar kewenangan. |
| BR-18 | Satu jawaban salah saja tidak berarti miskonsepsi persisten atau diagnosis diskalkulia. |
| BR-19 | Data respons asli immutable; teacher correction merupakan record baru dengan audit trail. |
| BR-20 | Perubahan item atau parameter BKT harus menghasilkan versi baru dan histori tetap dapat ditelusuri. |
| BR-21 | Expired subscription memblokir fitur berbayar sesuai ketentuan, bukan otomatis menghapus data. |
| BR-22 | Penghapusan, portabilitas, dan retensi data mengikuti proses permintaan resmi serta hasil legal review. |
| BR-23 | Jika B2C telah dibayar sebelum school entitlement aktif, tampilkan kasus penanganan/penyesuaian; aturan kredit/refund final adalah **open decision**. |
| BR-24 | Semua perintah mutasi entitlement, consent, akun, assessment, pembayaran, dan teacher review diperiksa backend. |

## 11. Data Model Konseptual

| Entity | Kolom kunci (ringkas) | Catatan |
|---|---|---|
| `users` | id, auth_uid, role profile, status | Hindari menyimpan atribut anak yang tidak diperlukan |
| `institutions` | id, name, subscription status | Tenant owner |
| `memberships` | user_id, institution_id, role, status | User dapat punya lebih dari satu membership sesuai izin |
| `students` | id, display_code, cohort, access_status | Pseudonym untuk konteks analitik |
| `teacher_students` | teacher_id, student_id, institution_id | Relationship-based permission |
| `guardian_students` | guardian_id, student_id, verification_status | Link harus diverifikasi |
| `consents` | guardian_id, student_id, version, purpose, status, timestamps | Jangan menyimpan hanya boolean |
| `subscriptions` | owner_type, owner_id, plan, status, dates | B2B dan B2C terkait owner berbeda |
| `entitlements` | student_id, source, access_scope, active_until, status | Satu resolusi akses, cegah double charge |
| `payments` | provider, external_ref, event_id, amount, state | Unik pada external event/ref, signature check |
| `modules` | id, domain, status, version | Konten harus approved sebelum publish |
| `knowledge_components` | id, name, domain | Unit BKT |
| `items` | id, module_id, kc_id, version, answer/scoring config | Kunci jawaban di server |
| `item_error_mappings` | item_version, option, error_code | Expert reviewed |
| `assessment_sessions` | id, student_id, status, assigned_by | Partial progress persisted |
| `responses` | id, session_id, item_id/version, option, hint, correctness | Immutable raw evidence |
| `mastery_snapshots` | student_id, kc_id, p_mastery, model_version | Replayable timeline |
| `misconception_evidence` | student_id, kc_id, code, count, status | Evidence link, bukan diagnosis |
| `teacher_reviews` | teacher_id, evidence_id, decision, reason | Immutable audit decisions |
| `activity_assignments` | student_id, activity_id, source, status | Teacher or Home rules |
| `activity_attempts` | student_id, activity_version, response, status | Progres pembelajaran |
| `audit_events` | actor, action, target, timestamp, safe metadata | Hindari raw sensitive payload/logs |

**Konsistensi database:** foreign keys, tenant IDs, unique constraints, idempotency keys, cascading action yang aman, audit history, indexes pada student/teacher/institution dan date-based queries. Konversi desain ini menjadi migration dan schema hanya setelah analisis repository dan pilihan backend.

## 12. Non-Functional Requirements (NFR)

| ID | Area | Kriteria minimum usulan |
|---|---|---|
| NFR-01 | Data protection | Persetujuan wali dan minimalisasi data sebelum pemrosesan anak |
| NFR-02 | Authorization | Backend-level RBAC + relationship policy + tenant isolation, diuji negatif |
| NFR-03 | Security | Tidak ada rahasia di client/git; rate limiting, CSRF/XSS protections, hashed credentials, secure cookies |
| NFR-04 | Payment | Sandbox saat development, signature verification, event idempotency, no duplicate charge |
| NFR-05 | Privacy | Proses ekspor/penghapusan/retensi, dokumentasi tujuan pemrosesan dan akses terbatas |
| NFR-06 | Accessibility | Desain menuju WCAG 2.2 AA pada tugas inti; touch targets memadai; keyboard dan teks bantu |
| NFR-07 | Responsiveness | Desktop 1366 px dan mobile sekitar 390 px; tablet dapat digunakan dengan baik |
| NFR-08 | Performance | Target p95 API CRUD <800 ms pada beban pilot setelah warm-up; indikator sementara |
| NFR-09 | Recovery | Backup + uji restore; kegagalan koneksi tidak menggandakan assessment event |
| NFR-10 | Observability | Error monitoring, server log minimal, request ID; tidak melog jawaban anak secara berlebihan |
| NFR-11 | Explainability | Mastery diberi label estimasi; error evidence dapat ditinjau guru |
| NFR-12 | Auditability | Konten, parameter, evidence, teacher review, dan billing memiliki version/event trace |
| NFR-13 | Reliability | Satu pembayaran/response unik tidak boleh membuat perubahan state ganda |
| NFR-14 | Testability | Unit, integration, E2E; seed data hanya sintetis untuk development |
| NFR-15 | Local readiness | `README`, env example, migration, seed, tests, scripts untuk developer baru |
| NFR-16 | Safety copy | Tidak menggunakan label diagnosis atau perbandingan kemampuan anak antarsiswa |

Target performa dan aksesibilitas adalah *engineering targets*, bukan angka hasil audit. Pengujian nyata harus menentukan kelayakan untuk lingkungan sekolah dengan perangkat beragam.

## 13. Test Matrix dan Definition of Done

| Test ID | Skenario wajib | Expected |
|---|---|---|
| AT-01 | Starter memiliki 20 siswa aktif lalu aktivasi siswa ke-21 | Ditolak dengan penjelasan upgrade/add-seat |
| AT-02 | Siswa school-licensed belajar di rumah | Bisa akses tanpa charge Home |
| AT-03 | Anak belum memiliki consent berlaku | Assessment dan pemrosesan terkunci |
| AT-04 | Orang tua berupaya menautkan anak bukan miliknya | Gagal karena link belum diverifikasi |
| AT-05 | Guru sekolah A mencoba buka siswa sekolah B | Backend 403/404 aman, tidak ada data leak |
| AT-06 | Response POST dikirim dua kali | Record hasil/model updated sekali |
| AT-07 | Satu jawaban salah dengan distractor berlabel | Tidak langsung mengklaim miskonsepsi persisten |
| AT-08 | BKT diberi rangkaian jawaban referensi | Posterior benar dan reproducible |
| AT-09 | Guru menolak classification | Tercatat dengan alasan, raw response immutable |
| AT-10 | Item direvisi setelah siswa menjawab | Histori menunjuk versi item saat respons |
| AT-11 | Child menyelesaikan salah satu 12 modul | Progress tersimpan dan dapat dipantau |
| AT-12 | Payment webhook sama diputar ulang | Tidak ada entitlement/charge duplikat |
| AT-13 | Pembayaran Home gagal | Tidak ada aktivasi paid access |
| AT-14 | Expired school license tanpa Home | Fitur premium ditutup sesuai kebijakan |
| AT-15 | Admin sekolah mengubah user lain yang tidak berwenang | Ditolak, audit bila relevan |
| AT-16 | Sesi asesmen terputus dan dilanjutkan | Tidak ada item/score ganda |
| AT-17 | Uji keyboard, touch, screen-reader pada tugas utama | Bisa menyelesaikan tugas kritis |
| AT-18 | Parent menarik consent | State dan permintaan penanganan data tercatat, pemrosesan terkait dihentikan |

**Release gate:** seluruh P0 selesai dan lulus test; 12 modul *expert-reviewed*; zero known critical/high security defects; payment sandbox + webhook tests lulus; review data protection/legal terselesaikan; teacher dan parent usability diuji; dokumentasi operasional tersedia. Tidak boleh klaim “siap produksi” hanya dari UI prototype.

## 14. Roadmap dan Backlog Implementasi

### 14.1 Prioritas epic

| No. | Epic | Deliverable | Dependensi | Prioritas |
|---|---|---|---|---|
| E01 | Product & design foundations | PRD/IA/flows/wireframe/UI system | — | P0 |
| E02 | Curriculum & expert taxonomy | 12-module matrix, approved item metadata | Review ahli | P0 |
| E03 | Identity, consent & tenancy | Auth, roles, child links, tenant isolation | E01 | P0 |
| E04 | Billing & entitlement | School plans, Home sandbox, verified access | E03 | P0 |
| E05 | Reusable learning player | 4 components + schema | E01/E02 | P0 |
| E06 | Assessment & persistence | Sessions, items, responses, resume | E02/E03/E05 | P0 |
| E07 | Rules, BKT & evidence | Deterministic taxonomy, probe, BKT | E02/E06 | P0 |
| E08 | Teacher workflow | Review evidence, assign remediation, dashboard | E03/E07 | P0 |
| E09 | Parent/student & progress | Home, activity player, guardians | E03/E04/E05 | P0 |
| E10 | Content QA & 12 modules | Versioned published modules | E02/E05/E07 | P0 |
| E11 | Security/pilot/hardening | Tests, observability, privacy, release gates | Semua P0 | P0 |
| E12 | GenAI, gamification, enterprise | Riset pasca-MVP | Evidensi pilot | P2 |

### 14.2 Fase kalender kerja

- **B1 — Product foundation:** kebutuhan, wawancara pengguna, taxonomy awal, data/role model, UX flow, empat template activity.
- **B2 — Platform foundation:** auth, parent/child link, consent, school tenancy, seat entitlement, reusable component skeleton.
- **B3 — Learning engine:** item bank, assessment event, error mapping, BKT, evidence viewer, teacher review, progress.
- **B4 — Integrasi:** School Admin, Student, Parent, billing sandbox, 12 modul (draft review), pilot versi terbatas.
- **B5 — Pilot & validation:** review ahli, usability anak/guru/orang tua, uji WTP, revisi pedagogis, keamanan dan QA.
- **B6 — Stabilization:** migration/backup, payment readiness, retensi/consent, regression, delivery handoff, go/no-go.
- **B7 — Planned commercial launch:** B2B dan B2C **hanya jika** release gates terpenuhi.

**Catatan effort dan RAB:** timeline sangat ambisius bila 1 developer merangkap front/backend; RAB engineering Rp30 juta belum terverifikasi estimasi jam kerja. Developer harus membuat estimasi effort per epic dan mengeskalasi gap anggaran, bukan diam-diam mengurangi kontrol keamanan atau kualitas konten.

### 14.3 Definition of Ready untuk sprint

Setiap story memiliki owner, intent, UI state, role/permission, model data, acceptance criteria, test plan, dan dependensi. Bila menyentuh data anak, wajib ada privacy/security checklist. Bila menyentuh learning engine, wajib ada contoh input–output yang disetujui Education Specialist.

### 14.4 Definition of Done untuk story

Code review, test pass, akses backend benar, empty/loading/error state, error copy aman, mobile responsif, audit bila perlu, docs/env diperbarui, tidak ada hardcoded secrets, demo pada seeded synthetic data, dan owner menerima hasil.

## 15. KPIs, Event Instrumentation, dan Evaluasi

| Indikator | Definisi | Kegunaan |
|---|---|---|
| `assessment_completion_rate` | Completed / started eligible sessions | Keberhasilan asesmen |
| `teacher_review_rate` | Reviewed evidence / review-needed evidence | Adopsi guru |
| `time_to_action` | Dari assessment completed ke intervention assigned | Efisiensi workflow |
| `remediation_completion_rate` | Completed / assigned activities | Keterlibatan siswa |
| `user_task_success` | Keberhasilan skenario usability tanpa bantuan | Kegunaan UI |
| `parent_home_access_rate` | Anak berlisensi sekolah yang menggunakan akses rumah | Nilai school-to-home |
| `double_billing_incidents` | Kasus hak school + charge Home bertumpuk | Harus 0 pada QA dan dipantau |
| `evidence_teacher_agreement` | Kesepakatan reviewer atas dugaan bertaksonomi | Kualitas error taxonomy |
| `kc_mastery_trajectory` | Trend estimasi KC, disertai keterbatasan model | Insight pembelajaran, bukan klaim efektivitas |

Event analytics harus minim data pribadi dan tidak digunakan untuk publikasi/penelitian tanpa dasar hukum, persetujuan, dan protokol yang sesuai. Hasil pilot harus dilaporkan sebagai data pilot, bukan generalisasi ke seluruh siswa berisiko diskalkulia.

## 16. Risks, Assumptions, Dependencies, Open Decisions

### 16.1 Risiko prioritas

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Salah interpretasi BKT/miskonsepsi sebagai diagnosis | Tinggi | Nonclinical copy, human review, expert sign-off |
| Bukti item tidak cukup / taxonomy bias | Tinggi | Probe, expert validation, insufficient evidence state |
| Kebocoran data anak / akses antarsekolah | Kritis | RLS/authorization tests, consent, minimization, audit |
| Billing ganda School–Home | Tinggi | Unified entitlement resolution, state reconciliation tests |
| Scope engineering melebihi RAB | Tinggi | Reusable activity, phased delivery, cost/effort check |
| Konten 12 modul belum tervalidasi | Tinggi | Approvals, versioning, pilot gate |
| CAC dan willingness-to-pay tak sesuai forecast | Tinggi | Go-to-market experiment; revisi financial model |
| Keterbatasan perangkat/aksesibilitas anak | Sedang–tinggi | Uji perangkat nyata, keyboard/touch, UX simplification |

### 16.2 Open Decisions (jangan diisi diam-diam oleh developer)

| ID | Keputusan terbuka | Pemilik/trigger |
|---|---|---|
| OD-01 | Akun akses anak: supervised login, credential, atau parent delegated session | PM + Security, sebelum auth implementasi |
| OD-02 | Penetapan pasangan `KC → item → error_code → remediation`, bersama rubrik validasi | Education Specialist + ahli, sebelum engine |
| OD-03 | Initial BKT parameter per KC dan aturan hinted responses | AI/ML + ahli, sebelum engine release |
| OD-04 | Harga add-on/upgrade, prorata dan anti-cannibalization | PM + Finance, sebelum live billing |
| OD-05 | School/Home overlapping subscriptions: refund/credit/no renewal logic | PM + Finance + legal, sebelum live billing |
| OD-06 | Payment gateway dan metode pembayaran + fees | PM + Engineering, sebelum checkout integration |
| OD-07 | Ketentuan pemrosesan anak, retention period, klasifikasi risiko PSE, dokumentasi privacy | Legal/privacy, sebelum pilot nyata |
| OD-08 | Primary tech stack/repository layout | Engineering lead, setelah audit repo |
| OD-09 | Target item count per grade/domain, kurikulum, penyesuaian kebutuhan akses | Education expert, sebelum content approval |
| OD-10 | Perhitungan kapasitas/effort dan gap RAB engineering | PM + Engineering, sebelum sprint commitment |

### 16.3 Kepatuhan dan referensi hukum (perlu review profesional)

UU No. 27 Tahun 2022 Pasal 25 mengatur perlindungan data pribadi anak serta persetujuan orang tua/wali untuk pemrosesan data anak. PP No. 17 Tahun 2025 dan Permenkomdigi No. 9 Tahun 2026 memberi konteks tambahan kewajiban penyelenggaraan sistem elektronik dalam pelindungan anak. **Kewajiban spesifik yang berlaku pada NUMERIQ, mekanisme verifikasi umur/wali, consent, retensi, respons insiden, dan klasifikasi platform harus dinilai oleh penanggung jawab legal/privacy sebelum pilot/produksi.** Ini arahan desain, bukan opini hukum final.

## 17. References dan Traceability

**Sumber riset awal:** dokumen yang disediakan tim, *Deep Research NUMERIQ: Business Model Canvas Berbasis Pemetaan Miskonsepsi untuk Siswa dengan Risiko*, khususnya bagian rekomendasi arsitektur, core MVP, example learner flow, privacy-by-design, dan hipotesis validasi. Dokumen ini mengandung contoh simulasi dan **bukan bukti validasi produk aktual**.

**Sumber keputusan bisnis:** diskusi produk/keuangan/marketing NUMERIQ, November 2026. Harga paket, payroll dan target BEP adalah hipotesis komersial yang direkam di dua workbook:

- Financial Projection: https://docs.google.com/spreadsheets/d/1EX2GN4I1W9882aXMtkHkC7QRwNDzTsCvqLCoiRWWOx0/edit
- Marketing Strategy: https://docs.google.com/spreadsheets/d/1EADJ43f_YKjZUIPDMxBw1YIZBuDofhzLuUUu-32OApA/edit

**Sumber regulasi resmi:**

- UU No. 27 Tahun 2022: https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022
- PP No. 17 Tahun 2025: https://peraturan.bpk.go.id/Details/316698/pp-no-17-tahun-2025
- Permenkomdigi No. 9 Tahun 2026: https://jdih.komdigi.go.id/produk_hukum/view/id/1007/t/peraturan-menteri-komunikasi-dan-digital-nomor-9-tahun-2026

**Traceability rule:** setiap tiket development harus mengacu minimal satu `FR`, `ENG`, `BR`, `NFR`, atau `AT` ID. Ubah kode-kode itu melalui keputusan PM, jangan diam-diam menghapus persyaratan keamanan atau legal untuk memenuhi tenggat.

---

**Status dokumen:** *PRD draft v1.0 cukup lengkap untuk estimasi, desain, dan implementasi bertahap berbasis data sintetis; belum ada validasi ahli, penetapan kebijakan legal final, ataupun rilis produksi.*
