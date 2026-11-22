import Link from "next/link";
export default function Forbidden(){return <main id="main" className="center-message"><span className="eyebrow">AKSES TERBATAS</span><h1>Ruang ini belum tersedia untuk akunmu.</h1><p>Gunakan akun dengan izin yang sesuai.</p><Link className="button" href="/login">Kembali ke halaman masuk</Link></main>}

