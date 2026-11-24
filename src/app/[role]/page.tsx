import { notFound } from "next/navigation";
import { requireRole, rpc } from "../../server/supabase";
import { Shell } from "../../components/shell";
import { recordConsent, claimInvite, startChild, createHomeCheckout, cancelHomeSubscription, requestChildDataAction } from "../actions";
type ChildView = {
  id: string;
  display_name: string;
  consent: boolean;
  access: string | null;
};
export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { role } = await params;
  if (!["school", "teacher", "parent"].includes(role)) notFound();
  const user = await requireRole(role);
  const query = await searchParams;
  const children: ChildView[] =
    role === "school" ? [] : await rpc("list_my_children", user.token);
  const summary =
    role === "school" ? await rpc("school_summary", user.token) : null;
  const progress: Record<
    string,
    { completed: number; total: number; access_source: string }
  > = {};
  if (role === "parent" || role === "teacher")
    for (const child of children) {
      try {
        progress[child.id] = await rpc("child_progress", user.token, {
          p_student: child.id,
        });
      } catch {}
    }
  const teacherOverview =
    role === "teacher" ? await rpc("teacher_overview", user.token) : null;
  const billing = role === "parent" ? await rpc("home_billing_summary",user.token) : role === "school" ? await rpc("school_billing_summary",user.token) : null;
  const privacyRequests = role === "parent" ? await rpc("list_my_data_requests",user.token) : [];
  return (
    <Shell role={role} name={user.display_name}>
      <section className="page-heading">
        <div>
          <span className="eyebrow">RUANG PENDAMPINGAN</span>
          <h1>
            Selamat datang, {user.display_name.split(" ")[0]}
            <span className="heading-dot">.</span>
          </h1>
          <p>Siapkan langkah belajar yang nyaman, bersama.</p>
        </div>
        <span className="round-sun" aria-hidden="true">
          ✳
        </span>
      </section>
      <section className="welcome-card">
        <div>
          <span className="eyebrow">SATU LANGKAH HARI INI</span>
          <h2>
            {role === "school"
              ? "Ruang belajar dimulai dari koneksi yang baik."
              : "Pendampingan yang baik dimulai dari kesiapan."}
          </h2>
          <p>
            {role === "school"
              ? "Pantau kesiapan akun dan kapasitas sekolah dari satu tempat."
              : "Periksa akses dan persetujuan sebelum membuka ruang anak."}
          </p>
          <a className="button light" href="#children">
            Lihat kesiapan <span>↗</span>
          </a>
        </div>
        <div className="abstract-blocks" aria-hidden="true">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <small>setiap anak, ritmenya sendiri</small>
        </div>
      </section>
      {query.blocked && (
        <div role="alert" className="notice danger">
          Sesi belum dapat dibuka. Pastikan hubungan, persetujuan, dan lisensi
          masih berlaku.
        </div>
      )}
      {query.updated && (
        <div role="status" className="notice">
          Perubahan berhasil disimpan.
        </div>
      )}
      {query.invite_error && (
        <div role="alert" className="notice danger">
          Undangan tidak valid, telah digunakan, atau sudah kedaluwarsa.
        </div>
      )}
      {query.school_included&&<div role="status" className="notice">Akses anak sudah termasuk lisensi sekolah. Tidak ada pembayaran baru.</div>}
      {query.checkout_pending&&<div role="status" className="notice">Checkout sandbox dibuat. Akses belum aktif sampai webhook terverifikasi.</div>}
      {query.billing_error&&<div role="alert" className="notice danger">Permintaan billing ditolak atau checkout aktif sudah tersedia.</div>}
      {query.billing_cancelled&&<div role="status" className="notice">Perpanjangan dibatalkan. Akses berbayar tetap berlaku sampai akhir periode.</div>}
      {query.privacy_requested&&<div role="status" className="notice">Permintaan privasi tercatat dan menunggu penanganan manual.</div>}
      {query.privacy_error&&<div role="alert" className="notice danger">Permintaan privasi ditolak atau permintaan serupa masih terbuka.</div>}
      {(role==="teacher"||role==="parent")&&<div className="notice"><strong>NUMERIQ bukan alat diagnosis.</strong><p>Estimasi penguasaan dan pola respons membantu menentukan langkah belajar; keputusan pendampingan tetap ditinjau orang dewasa.</p></div>}
      {teacherOverview && (
        <div className="stats">
          <article>
            <small>Siswa diampu</small>
            <strong>{teacherOverview.students}</strong>
          </article>
          <article>
            <small>Asesmen terbuka</small>
            <strong>{teacherOverview.open_assessments}</strong>
          </article>
          <article>
            <small>Modul selesai</small>
            <strong>{teacherOverview.completed_modules}</strong>
          </article>
        </div>
      )}
      <section id="children">
        <div className="section-heading">
          <h2>
            {role === "school" ? "Kesiapan sekolah" : "Anak yang didampingi"}
          </h2>
          <span className="pill">
            {role === "school" ? "Ringkasan" : children.length + " anak"}
          </span>
        </div>
        {role === "school" ? (
          <div className="stats">
            <article>
              <small>Guru aktif</small>
              <strong>{summary.teachers}</strong>
              <p>Terhubung di sekolah ini</p>
            </article>
            <article>
              <small>Siswa terdaftar</small>
              <strong>{summary.students}</strong>
              <p>Data agregat sekolah</p>
            </article>
            <article>
              <small>Kursi berlisensi</small>
              <strong>
                {summary.active_seats} / {summary.capacity}
              </strong>
              <p>
                <a href="/school/people">Kelola kursi →</a>
              </p>
            </article>
          </div>
        ) : children.length === 0 ? (
          <div className="empty">
            <span>◌</span>
            <h3>Belum ada anak terhubung</h3>
            <p>
              {role === "parent"
                ? "Gunakan undangan sekolah untuk menautkan profil anak."
                : "Penugasan siswa dari sekolah akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="child-grid">
            {children.map((child) => (
              <article className="child-card" key={child.id}>
                <div className="child-title">
                  <span className="avatar large">
                    {child.display_name.slice(0, 1)}
                  </span>
                  <div>
                    <h3>{child.display_name}</h3>
                    <small>Profil demo sintetis</small>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Persetujuan wali</dt>
                    <dd className={child.consent ? "good" : "pending"}>
                      {child.consent ? "Tersedia" : "Belum tersedia"}
                    </dd>
                  </div>
                  <div>
                    <dt>Akses belajar</dt>
                    <dd>
                      {child.access === "school"
                        ? "Termasuk lisensi sekolah"
                        : child.access === "home"
                          ? "Home Plan"
                          : "Belum aktif"}
                    </dd>
                  </div>
                  <div>
                    <dt>Progres modul</dt>
                    <dd>
                      {progress[child.id]
                        ? progress[child.id].completed +
                          " / " +
                          progress[child.id].total
                        : "Belum tersedia"}
                    </dd>
                  </div>
                </dl>
                {progress[child.id] && (
                  <p>
                    <strong>
                      {progress[child.id].completed} / {progress[child.id].total}
                    </strong>{" "}
                    modul selesai
                  </p>
                )}
                <form action={startChild}>
                  <input type="hidden" name="student" value={child.id} />
                  <button disabled={!child.consent || !child.access}>
                    Buka ruang anak <span>↗</span>
                  </button>
                </form>
                {role === "parent" && (
                  <form className="consent-form" action={recordConsent}>
                    <input type="hidden" name="student" value={child.id} />
                    <input
                      type="hidden"
                      name="consent"
                      value={child.consent ? "withdrawn" : "granted"}
                    />
                    {!child.consent && (
                      <label className="check">
                        <input type="checkbox" required /> Saya menyetujui
                        pemrosesan data sintetis untuk demo lokal (demo-v1).
                      </label>
                    )}
                    <button className="quiet">
                      {child.consent
                        ? "Tarik persetujuan demo"
                        : "Simpan persetujuan demo"}
                    </button>
                  </form>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <section id="access" className="bottom-grid">
        <article className="panel">
          <span className="eyebrow">AKSES YANG TERHUBUNG</span>
          <h3>Sekolah dan rumah, satu perjalanan.</h3>
          <p>
            Lisensi sekolah mencakup akses anak di rumah. Wali yang
            terverifikasi dapat mendampingi tanpa membeli paket tambahan.
          </p>
        </article>
        <article className="panel">
          {role === "parent" ? (
            <>
              <h3>Tautkan profil anak</h3>
              <p>Gunakan kode undangan sekali pakai dari sekolah.</p>
              <form action={claimInvite}>
                <label htmlFor="code">Kode undangan</label>
                <input id="code" name="code" required minLength={16} />
                <button className="secondary">Verifikasi undangan</button>
              </form>
            </>
          ) : (
            <>
              <h3>Fondasi sedang disiapkan</h3>
              <p>
                Aktivitas demo tersedia untuk eksplorasi. Guru dapat menugaskan
                asesmen sintetis melalui menu Asesmen; analisis pola belajar
                tersedia pada fase selanjutnya.
              </p>
            </>
          )}
        </article>
      </section>
      {role==="school"&&<section><div className="section-heading"><h2>Plan sekolah</h2><span className="pill">Verifikasi manual</span></div><article className="panel"><h3>{billing.contract?.plan?.replaceAll("_"," ")||"Belum ada kontrak"}</h3><p>Status: <strong>{billing.contract?.status||"belum aktif"}</strong>. Harga dan kapasitas demo adalah hipotesis, bukan penawaran final.</p><p>{billing.requests.length} permintaan perubahan kapasitas tercatat; aktivasi hanya oleh operator internal dan diaudit.</p></article></section>}
      {role==="parent"&&<section><div className="section-heading"><h2>Home Plan sandbox</h2><span className="pill">Tanpa uang nyata</span></div><div className="child-grid">{children.map(child=><article className="panel" key={"billing-"+child.id}><h3>{child.display_name}</h3>{child.access==="school"?<p>Sudah termasuk lisensi sekolah. Checkout tambahan diblokir.</p>:<><p>Harga hipotesis Rp69.000/bulan atau Rp690.000/tahun. Provider lokal tidak memproses uang nyata.</p><form action={createHomeCheckout}><input type="hidden" name="student" value={child.id}/><input type="hidden" name="orderKey" value={crypto.randomUUID()}/><label htmlFor={"plan-"+child.id}>Periode</label><select id={"plan-"+child.id} name="plan"><option value="home_monthly">Bulanan</option><option value="home_annual">Tahunan</option></select><button disabled={!child.consent}>Buat checkout sandbox</button></form></>}{billing.filter((o:{student_id:string})=>o.student_id===child.id).map((o:{id:string;status:string;plan:string;auto_renew:boolean})=><div key={o.id}><p>{o.plan.replaceAll("_"," ")} · {o.status}</p>{o.auto_renew&&["pending","paid"].includes(o.status)&&<form action={cancelHomeSubscription}><input type="hidden" name="order" value={o.id}/><button className="quiet">Batalkan perpanjangan</button></form>}</div>)}</article>)}</div></section>}
      {role==="parent"&&<section id="privacy"><div className="section-heading"><h2>Privasi dan data anak</h2><span className="pill">Ditangani manual</span></div><div className="child-grid">{children.map(child=><article className="panel" key={"privacy-"+child.id}><h3>{child.display_name}</h3><p>Ajukan salinan atau penghapusan data. Penghapusan tidak otomatis agar kewajiban retensi dan audit ditinjau petugas.</p><form action={requestChildDataAction}><input type="hidden" name="student" value={child.id}/><label htmlFor={"privacy-type-"+child.id}>Jenis permintaan</label><select id={"privacy-type-"+child.id} name="type"><option value="export">Ekspor data</option><option value="delete">Penghapusan data</option></select><label htmlFor={"privacy-note-"+child.id}>Catatan opsional</label><textarea id={"privacy-note-"+child.id} name="note" maxLength={500}/><button>Catat permintaan</button></form>{privacyRequests.filter((r:{student_id:string})=>r.student_id===child.id).map((r:{id:string;type:string;status:string})=><p key={r.id}>{r.type} · <strong>{r.status}</strong></p>)}</article>)}</div></section>}
    </Shell>
  );
}
