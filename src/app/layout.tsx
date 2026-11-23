import type { Metadata } from "next";
import "./globals.css";
import "./activities.css";
export const metadata:Metadata={title:"Numeriq — Ruang tumbuh numerasi",description:"Pendamping pembelajaran numerasi untuk sekolah dan keluarga."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><a className="skip" href="#main">Lewati navigasi</a>{children}</body></html>}

