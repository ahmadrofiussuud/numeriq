import {validateModule} from "../domain/content.ts";
import type {Module,ModuleId,Component} from "../domain/content.ts";
const rows:[ModuleId,string,string,Component,string,number,number][]=[
["NS-01","Mengenali kuantitas","quantity_symbol","ten-frame","Isi bingkai dengan tujuh titik.",0,10],
["NS-02","Simbol dan jumlah","symbol_quantity","ten-frame","Buat jumlah yang sesuai dengan angka lima.",0,10],
["NS-03","Membandingkan besaran","magnitude","choice","Pilih bilangan yang lebih besar.",0,10],
["NS-04","Urutan bilangan","sequence","number-line","Temukan posisi angka enam.",0,10],
["PV-01","Puluhan dan satuan","tens_ones","base-ten","Susun dua puluhan dan tiga satuan.",0,99],
["PV-02","Komposisi bilangan","compose","base-ten","Susun bilangan tiga puluh dua.",0,99],
["PV-03","Dekomposisi bilangan","decompose","base-ten","Uraikan empat puluh satu menjadi puluhan dan satuan.",41,99],
["PV-04","Nilai digit","position_value","number-line","Temukan tiga puluhan pada garis bilangan.",0,50],
["AR-01","Number bonds","number_bonds","ten-frame","Jelajahi pasangan pembentuk sepuluh.",4,10],
["AR-02","Penjumlahan konseptual","addition","ten-frame","Mulai dari tiga titik, lalu tambahkan dua titik.",3,10],
["AR-03","Pengurangan konseptual","subtraction","number-line","Mulai di delapan, lalu mundur tiga langkah.",8,10],
["AR-04","Regrouping","regrouping","base-ten","Tukar satu puluhan menjadi sepuluh satuan.",12,99]];
export const modules:Module[]=rows.map(([id,title,kc,component,prompt,initial,max])=>validateModule({id,title,domain:id.startsWith("NS")?"Number Sense":id.startsWith("PV")?"Place Value":"Arithmetic",version:1,status:"draft",reviewStatus:"NEEDS_REVIEW",objective:"Mengeksplorasi "+title.toLowerCase()+" dengan representasi konkret. Tujuan perlu review ahli.",activities:[{id:id+"-DEMO-01",moduleId:id,kcId:kc,version:1,component,prompt,instructions:component==="ten-frame"?"Tekan kotak untuk menambah atau menghapus titik.":component==="number-line"?"Gunakan tombol panah atau geser penanda.":component==="base-ten"?"Tambahkan blok atau tukarkan puluhan dan satuan.":"Pilih satu jawaban dengan tombol atau keyboard.",accessibilityText:component==="ten-frame"?"Bingkai sepuluh, dua baris dengan lima kotak.":component==="number-line"?"Garis bilangan dengan penanda yang dapat digeser.":component==="base-ten"?"Blok puluhan dan satuan.":"Kelompok pilihan jawaban.",config:{min:0,max,step:id==="PV-04"?10:1,initial,options:component==="choice"?[{id:"four",label:"4"},{id:"seven",label:"7"}]:undefined}}]}));

