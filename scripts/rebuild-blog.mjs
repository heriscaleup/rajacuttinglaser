import { mkdir, readdir, rm, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { specs, images } from './blog-specs.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = join(root, 'src/content/blog');
const publicDir = join(root, 'public');
const UPDATED_DATE = '2026-07-15T09:00:00.000+07:00';

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
const list = (items) => items.map((item) => `- ${item}`).join('\n');

function shorten(value, max = 155) {
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  return `${sliced.slice(0, sliced.lastIndexOf(' ')).replace(/[,:;.-]+$/, '')}.`;
}

function publicationDate(slug, index) {
  const exactDate = slug.match(/^(\d{4}-\d{2}-\d{2})/);
  if (exactDate) return `${exactDate[1]}T07:00:00.000+07:00`;
  const monthHint = slug.match(/2026-(05|06|07)/);
  if (monthHint) {
    const day = String((index % 14) + 1).padStart(2, '0');
    return `2026-${monthHint[1]}-${day}T07:00:00.000+07:00`;
  }
  const fallback = new Date(Date.UTC(2025, 8, 1 + index));
  return `${fallback.toISOString().slice(0, 10)}T07:00:00.000+07:00`;
}

function criteriaTable(spec) {
  const rows = spec.criteria.map((item, index) => `| ${item} | ${spec.evidence[index]} |`).join('\n');
  return `| Hal yang diperiksa | Bukti yang perlu diminta |\n|---|---|\n${rows}`;
}

function contextSection(spec, index) {
  const actions = [
    'dikunci sebagai keputusan desain',
    'diterjemahkan menjadi bukti yang dapat diperiksa',
    'dibahas bersama pihak produksi dan penerima hasil',
    'dimasukkan ke catatan persetujuan proyek'
  ];
  return `## Penerapan khusus: ${spec.title}

### ${spec.criteria[0]}

${capitalize(spec.criteria[0])} perlu ${actions[index % actions.length]}. Hubungkan keputusan ini dengan kondisi utama proyek: ${spec.focus}. Bukti awal yang layak dipakai adalah ${spec.evidence[0].toLowerCase()}. Jika informasinya belum tersedia, tandai sebagai asumsi dan jangan membiarkannya berubah diam-diam saat produksi berjalan.

### ${spec.criteria[1]}

Untuk ${spec.criteria[1].toLowerCase()}, mintalah pembanding yang benar-benar mewakili material, ukuran, atau situasi pemakaian. ${capitalize(spec.evidence[1])}. Catat siapa yang menilai hasil dan bagian mana yang disetujui; foto saja belum selalu cukup untuk menilai warna, tepi, fit-up, atau kualitas permukaan.

### ${spec.criteria[2]}

Jadikan ${spec.criteria[2].toLowerCase()} bagian dari kriteria penerimaan, bukan catatan tambahan setelah harga disepakati. ${capitalize(spec.evidence[2])}. Keputusan ini membantu tim membedakan cacat, variasi yang masih diterima, dan perubahan desain yang membutuhkan persetujuan baru.

## Rekam keputusan sebelum file dilepas

Gunakan catatan satu halaman yang setidaknya memuat:

- **Input:** ${spec.brief[0]}
- **Kondisi produksi:** ${spec.brief[1]}
- **Bukti penerimaan:** ${spec.brief[2]}
- **Risiko pertama yang dikendalikan:** ${spec.risks[0]}

Lanjutkan dengan meninjau ${spec.risks[1].toLowerCase()} dan ${spec.risks[2].toLowerCase()}. Jika salah satunya berdampak pada fungsi, keselamatan, tampilan utama, atau jadwal, tetapkan tindakan pencegahan serta pihak yang berwenang menyetujuinya. Rekaman singkat seperti ini membuat pembahasan tetap konsisten ketika proyek berpindah dari desain ke estimasi, produksi, dan serah terima.`;
}

function opening(spec, index) {
  const variants = [
    `${capitalize(spec.focus)}. Untuk ${spec.audience}, keputusan ini sebaiknya dibuat dari kebutuhan fungsi dan bukti produksi, bukan hanya contoh visual.`,
    `${capitalize(spec.focus)}. Topik ini penting bagi ${spec.audience} karena keputusan awal akan memengaruhi file, material, biaya, dan pekerjaan lanjutan.`,
    `${capitalize(spec.focus)}. Dalam proyek ${spec.keyword}, kesalahan paling mahal biasanya terjadi sebelum mesin mulai memotong: brief belum lengkap atau kriteria penerimaan belum disepakati.`,
    `${capitalize(spec.focus)}. Panduan ini ditujukan bagi ${spec.audience} yang membutuhkan dasar keputusan praktis, tanpa asumsi kapasitas mesin atau angka toleransi yang belum diverifikasi.`
  ];
  return `${variants[index % variants.length]}

Istilah “presisi” tidak otomatis berarti hasil akan sesuai kebutuhan. Material, geometri, orientasi permukaan, kuantitas, dan proses setelah cutting perlu dibaca sebagai satu rangkaian. Karena itu, artikel ini membahas apa yang harus diputuskan, bukti apa yang layak diminta, dan risiko apa yang perlu dikendalikan sebelum menyetujui produksi.`;
}

function decisionArticle(spec, index) {
  return `${opening(spec, index)}

## Bedakan kebutuhan sebelum membandingkan pilihan

Mulailah dengan hasil akhir yang ingin dicapai. Komponen yang hanya perlu dipotong memiliki kebutuhan berbeda dari produk yang masih akan dibending, dilas, dicat, atau dirakit. Tulis ukuran kritis, sisi yang terlihat, lingkungan pemakaian, jumlah, dan tanggal dibutuhkan. Informasi tersebut membuat diskusi tentang **${spec.keyword}** jauh lebih terarah.

Tiga pembeda utama untuk topik ini adalah:

${list(spec.criteria)}

Jangan memilih proses hanya karena namanya terdengar lebih canggih. Pilihan yang tepat adalah yang sanggup menghasilkan fungsi, kualitas tepi, dan alur kerja yang diperlukan dengan risiko paling masuk akal.

## Matriks keputusan yang bisa dipakai saat meminta penawaran

${criteriaTable(spec)}

Sampaikan matriks ini bersama file atau sketsa. Penyedia jasa kemudian dapat menandai bagian yang sudah jelas, bagian yang perlu sampel, serta bagian yang masih bergantung pada material aktual. Jawaban yang menyebut kondisi dan keterbatasan biasanya lebih berguna daripada janji umum seperti “pasti rapi”.

## Biaya tidak berdiri sendiri

Harga perlu dibaca bersama pemakaian material, waktu persiapan, jumlah titik mulai potong, panjang lintasan, potensi pengerjaan ulang, dan proses lanjutan. Opsi dengan tarif potong lebih rendah belum tentu menghasilkan biaya total terendah jika banyak bagian harus diperbaiki setelah keluar dari mesin.

Untuk perbandingan yang adil, minta setiap penawaran memakai revisi file, spesifikasi material, jumlah, dan lingkup finishing yang sama. Bila salah satu vendor memasukkan material sementara yang lain hanya menghitung jasa, angka akhirnya tidak dapat dibandingkan langsung.

## Risiko yang sering luput

${list(spec.risks)}

Risiko tersebut dapat dikurangi dengan sampel pada material aktual, persetujuan gambar produksi, dan pencatatan perubahan. Untuk pesanan berulang, simpan kode revisi file serta contoh hasil yang sudah disetujui. Cara ini lebih kuat daripada mengandalkan percakapan yang tersebar di beberapa kanal.

## Brief minimum sebelum produksi

${list(spec.brief)}

Tambahkan foto referensi hanya sebagai penjelas, bukan sebagai pengganti ukuran. Jika ada bagian yang harus bertemu dengan komponen lain, tandai dimensi antarmuka dan metode pemeriksaannya. Dengan brief tersebut, keputusan **${spec.keyword}** menjadi bisa diuji, dikutip, dan dipertanggungjawabkan.

## Kesimpulan

Pilih berdasarkan fungsi, bukti, serta biaya total proses. Jika dua opsi masih terlihat setara, lakukan sampel kecil pada material dan geometri yang paling mewakili risiko proyek. Keputusan dari sampel aktual biasanya lebih dapat diandalkan daripada kesimpulan dari katalog mesin.`;
}

function materialArticle(spec, index) {
  return `${opening(spec, index)}

## Mulai dari fungsi material

Nama material saja belum cukup. Dua lembar dengan sebutan dagang yang sama dapat berbeda pada komposisi, lapisan pelindung, kerataan, kelembapan, arah serat, atau kondisi permukaan. Dalam pembahasan **${spec.keyword}**, fungsi produk dan lingkungan pemakaian harus menjadi titik awal.

Gunakan tiga pertanyaan berikut untuk menyaring pilihan:

${list(spec.criteria)}

Jika pemasok tidak dapat menjelaskan identitas bahan, jangan langsung memproses produksi penuh. Potongan uji kecil membantu melihat reaksi panas, warna tepi, residu, dan konsistensi hasil tanpa mempertaruhkan seluruh lembar.

## Pemeriksaan material dan bukti yang relevan

${criteriaTable(spec)}

Untuk bahan yang identitasnya belum jelas, utamakan keterlacakan dan kecocokan proses. Jangan menyimpulkan grade atau komposisi hanya dari warna dan tekstur. Minta lembar data, label pemasok, atau konfirmasi jenis bahan; material maupun lapisan yang membawa risiko keselamatan, kualitas, atau korosi perlu ditinjau sebelum diproses.

## Sampel harus mewakili produksi

Sampel yang baik memakai material, ketebalan, detail terkecil, dan orientasi permukaan yang sama dengan rencana produksi. Potong setidaknya bagian yang memiliki sudut rapat, lubang kecil, atau jarak antargaris paling kritis. Setelah itu, nilai tepi, deformasi, bau/residu, dan kecocokan dengan proses finishing.

Jangan menilai hanya dari foto. Warna, goresan, transparansi, dan kualitas permukaan sering berubah karena cahaya. Bila estetika penting, tinjau sampel fisik atau setujui batas penerimaan secara tertulis.

## Risiko yang harus dikendalikan

${list(spec.risks)}

Sebagian risiko dapat diselesaikan lewat perubahan desain, orientasi penempatan, pelindung permukaan, atau proses alternatif. Jika perubahan tersebut memengaruhi tampilan, kuat sambungan, atau biaya, mintalah persetujuan sebelum produksi berjalan.

## Data yang perlu dikirim ke penyedia jasa

${list(spec.brief)}

Sertakan jumlah cadangan jika hasil akan dirakit di lokasi. Untuk kebutuhan berulang, catat pemasok dan kode material supaya batch berikutnya tidak bergantung pada istilah umum. Dokumentasi sederhana ini menjaga konsistensi **${spec.keyword}** dari satu pemesanan ke pemesanan berikutnya.

## Kesimpulan

Material yang tepat adalah bahan yang aman diproses, memenuhi fungsi, dan menghasilkan kualitas yang dapat diterima setelah seluruh tahap selesai. Validasi identitas bahan dan sampel aktual lebih penting daripada memilih berdasarkan nama populer atau foto referensi saja.`;
}

function processArticle(spec, index) {
  return `${opening(spec, index)}

## Alur kerja yang mengurangi revisi terlambat

Proyek **${spec.keyword}** sebaiknya memiliki gerbang persetujuan yang jelas. Alur sederhana berikut cukup untuk sebagian besar pekerjaan: brief, pemeriksaan file, konfirmasi material, sampel bila diperlukan, persetujuan produksi, pemeriksaan hasil, lalu serah terima.

Pada setiap tahap, tentukan siapa yang menyetujui dan bukti apa yang disimpan. Ini mencegah file lama masuk ke mesin atau perubahan desain hanya tercatat di chat pribadi.

## Tiga titik kontrol utama

${list(spec.criteria)}

${criteriaTable(spec)}

Jika satu titik kontrol belum selesai, jangan memaksakan jadwal ke tahap berikutnya. Waktu yang “dihemat” dengan melewati pemeriksaan sering kembali sebagai rework, material terbuang, atau perakitan yang tertunda.

## Pisahkan estimasi, persetujuan, dan produksi

File untuk estimasi boleh belum sempurna, tetapi file produksi harus memiliki satu versi final. Cantumkan satuan, skala, jumlah, material, ketebalan, dan sisi muka. Jika penyedia jasa melakukan perbaikan file, minta pratinjau revisi sebelum pemotongan.

Persetujuan sampel juga perlu menyebut apa yang dinilai. Sampel bentuk tidak selalu mewakili warna finishing; sampel tepi belum tentu membuktikan kecocokan sambungan. Nyatakan tujuan sampel agar kedua pihak menilai hal yang sama.

## Risiko operasional yang perlu dicatat

${list(spec.risks)}

Buat daftar perubahan singkat: tanggal, revisi, alasan, dan pihak yang menyetujui. Untuk pekerjaan yang akan diteruskan ke bending, welding, coating, atau instalasi, sertakan referensi komponen agar identitas tidak hilang setelah part terpisah.

## Paket brief yang siap ditindaklanjuti

${list(spec.brief)}

Penyedia jasa yang baik seharusnya dapat mengubah paket tersebut menjadi pertanyaan spesifik, bukan mengulang permintaan informasi dasar. Jika asumsi masih diperlukan, minta asumsi itu ditulis di penawaran.

## Kesimpulan

Profesionalisme pada **${spec.keyword}** terlihat dari alur persetujuan dan keterlacakan file, bukan hanya dari kecepatan mesin. Gerbang kerja yang jelas membuat jadwal lebih realistis, perubahan lebih terkendali, dan hasil lebih mudah diperiksa saat diterima.`;
}

function designArticle(spec, index) {
  return `${opening(spec, index)}

## File yang terlihat benar belum tentu siap dipotong

Layar dapat menyembunyikan garis ganda, objek terbuka, ukuran yang berubah, atau font yang belum dikonversi. Pada **${spec.keyword}**, masalah kecil seperti itu dapat menjadi lintasan potong tambahan atau bentuk yang tidak tersambung.

Sebelum ekspor, periksa tiga hal berikut:

${list(spec.criteria)}

Gunakan satuan yang disepakati dan sertakan satu ukuran acuan pada pesan pengiriman. Cara ini membantu mendeteksi perubahan skala saat file berpindah aplikasi.

## Pemeriksaan pra-produksi

${criteriaTable(spec)}

Perbesar tampilan pada sudut tajam, lubang kecil, dan pertemuan garis. Hapus objek tersembunyi serta layer referensi yang tidak perlu dipotong. Pisahkan garis cutting, engraving, dan anotasi memakai layer atau warna yang dijelaskan dalam legenda.

## Desain untuk proses setelah cutting

Part jarang berhenti pada tahap potong. Bila akan dirakit, pertimbangkan arah pemasangan, akses alat, toleransi pasangan, dan urutan kerja. Untuk bending, sisakan keputusan allowance kepada data proses aktual dan gambar produksi; jangan mengunci angka umum tanpa material serta tooling yang jelas.

Jika tampilan permukaan penting, tandai sisi muka dan arah serat atau hairline. Penempatan yang salah dapat membuat panel tetap benar secara ukuran tetapi gagal secara visual.

## Kesalahan yang paling sering menambah biaya

${list(spec.risks)}

Gunakan nama file yang memuat kode part dan revisi. Hindari akhiran seperti “final-baru-fix-2” karena mudah tertukar. Satu daftar part yang menghubungkan nama file, jumlah, dan material lebih aman untuk produksi batch.

## Isi paket file yang rapi

${list(spec.brief)}

Setelah penyedia jasa melakukan preflight, mintalah konfirmasi jika ada geometri yang diperbaiki. Revisi teknis tetap dapat mengubah fungsi, sehingga persetujuan pemilik desain dibutuhkan sebelum produksi.

## Kesimpulan

File siap potong adalah file yang dapat dibaca tanpa menebak. Struktur layer, ukuran acuan, revisi, dan catatan proses membuat **${spec.keyword}** lebih cepat dihitung sekaligus lebih aman diproduksi. Pemeriksaan beberapa menit di awal biasanya jauh lebih murah daripada mengganti satu batch.`;
}

function costArticle(spec, index) {
  return `${opening(spec, index)}

## Mengapa satu angka per milimeter tidak cukup

Pada **${spec.keyword}**, panjang lintasan memang dapat menjadi salah satu komponen perhitungan. Namun biaya akhir juga dipengaruhi material, ketebalan, jumlah titik mulai, kerumitan penataan, waktu setup, kuantitas, inspeksi, finishing, dan logistik. Karena itu, harga dari dua file berbeda tidak bisa dibandingkan hanya dengan luas luarnya.

Tiga penggerak biaya utama untuk kasus ini adalah:

${list(spec.criteria)}

## Cara meminta penawaran yang bisa dibandingkan

${criteriaTable(spec)}

Kirim paket yang sama ke setiap calon penyedia. Pastikan penawaran memisahkan material, jasa potong, bantuan file, finishing, packing, pajak bila ada, dan pengiriman. Tanyakan juga masa berlaku harga karena nilai material dapat berubah.

## Hitung biaya total, bukan hanya tarif awal

Desain yang sangat rapat mungkin menghemat lembar, tetapi dapat menambah risiko panas, handling, atau cacat. Sebaliknya, jarak yang terlalu longgar dapat meningkatkan sisa material. Nesting perlu mempertimbangkan kualitas dan identifikasi part, tidak sekadar mengejar persentase pemakaian lembar.

Untuk produksi berulang, masukkan biaya inspeksi, penyimpanan, dan potensi stok mati. Batch besar tidak selalu lebih ekonomis bila revisi desain masih mungkin terjadi atau kebutuhan bulanan belum stabil.

## Risiko yang membuat estimasi meleset

${list(spec.risks)}

Mintalah vendor menuliskan asumsi. Jika harga bergantung pada material yang disediakan pelanggan, jelaskan ukuran lembar, kondisi permukaan, dan jumlah cadangan. Jika desain belum final, tandai penawaran sebagai estimasi, bukan harga produksi yang mengikat.

## Data minimum untuk kalkulasi

${list(spec.brief)}

Untuk menekan biaya, perbaiki sumber pemborosan yang nyata: geometri tidak valid, terlalu banyak revisi, variasi material yang tidak perlu, atau jadwal yang memaksa layanan ekspres. Memotong spesifikasi penting demi harga awal justru dapat memindahkan biaya ke tahap berikutnya.

## Kesimpulan

Estimasi **${spec.keyword}** yang profesional menjelaskan lingkup, asumsi, dan faktor perubahan. Bandingkan total pekerjaan dengan spesifikasi yang sama. Angka terendah baru menarik jika material, kualitas, waktu, dan tanggung jawab setelah produksi juga setara.`;
}

function productArticle(spec, index) {
  return `${opening(spec, index)}

## Terjemahkan referensi visual menjadi spesifikasi

Foto inspirasi membantu menjelaskan arah, tetapi tidak memberikan ukuran, material, metode sambungan, atau kondisi pemakaian. Untuk **${spec.keyword}**, ubah referensi menjadi brief yang menyebut fungsi, dimensi, sisi yang terlihat, lingkungan, jumlah, serta target pemasangan.

Tiga keputusan yang paling memengaruhi hasil adalah:

${list(spec.criteria)}

## Cocokkan desain dengan produksi dan penggunaan

${criteriaTable(spec)}

Detail yang bagus pada layar dapat menjadi terlalu rapuh, sulit dibersihkan, atau tidak terbaca dari jarak pandang sebenarnya. Evaluasi pola pada skala akhir. Jika produk akan disentuh atau berada di area publik, perhatikan sudut, tepi, kestabilan, dan cara pemasangannya.

## Buat prototipe pada bagian berisiko

Prototipe tidak selalu harus satu produk penuh. Potongan sudut, modul sambungan, contoh huruf, atau sebagian pola sering sudah cukup untuk menilai proporsi, kualitas tepi, dan finishing. Gunakan material serta ketebalan yang sama agar hasilnya relevan.

Catat bagian yang disetujui dan bagian yang masih perlu perubahan. Persetujuan visual sebaiknya dilakukan di bawah pencahayaan yang mendekati kondisi pemasangan, terutama untuk acrylic, stainless hairline, atau permukaan berlapis.

## Risiko yang sering baru terlihat saat instalasi

${list(spec.risks)}

Koordinasikan ukuran akhir dengan rangka, dinding, perangkat listrik, atau produk lain yang menjadi pasangan. Sediakan ruang untuk toleransi lapangan dan akses perawatan. Produk yang sulit dipasang atau dibersihkan akan mengurangi manfaat desain yang sebenarnya sudah baik.

## Brief yang perlu dibawa saat konsultasi

${list(spec.brief)}

Dengan data tersebut, penyedia jasa dapat mengusulkan material, proses, sampel, dan urutan kerja yang lebih realistis. Minta setiap perubahan desain yang memengaruhi fungsi atau tampilan dikonfirmasi sebelum produksi.

## Kesimpulan

Hasil **${spec.keyword}** yang profesional lahir dari keputusan lintas desain, material, finishing, dan pemasangan. Jadikan referensi sebagai awal percakapan, lalu kunci detail melalui gambar, sampel, dan kriteria penerimaan yang jelas.`;
}

function qualityArticle(spec, index) {
  return `${opening(spec, index)}

## Definisikan “rapi” dengan cara yang bisa diperiksa

Kata rapi dan presisi bersifat terlalu luas jika tidak dihubungkan dengan fungsi. Pada **${spec.keyword}**, tentukan dimensi kritis, kondisi tepi, orientasi permukaan, jumlah cacat yang dapat diterima, dan cara pengukuran. Toleransi perlu disepakati berdasarkan material, mesin, geometri, serta proses lanjutan—bukan disalin dari angka umum.

Fokus pemeriksaan untuk topik ini:

${list(spec.criteria)}

## Rencana inspeksi sederhana

${criteriaTable(spec)}

Untuk batch, pemeriksaan dapat dibagi menjadi first article, pemeriksaan selama proses, dan pemeriksaan akhir. First article memastikan file, material, dan orientasi sudah benar sebelum seluruh jumlah diproduksi. Frekuensi sampling berikutnya disesuaikan dengan risiko serta konsistensi proses.

## Alat ukur harus sesuai karakteristik

Panjang luar, diameter lubang, kerataan, dan tampilan permukaan membutuhkan cara pemeriksaan berbeda. Pastikan titik referensi dan kondisi pengukuran disepakati. Part tipis yang fleksibel, misalnya, dapat memberikan hasil berbeda bila ditekan saat diukur.

Simpan foto dan catatan hasil pada part yang mewakili. Untuk produk berulang, contoh master yang disetujui dapat membantu penilaian visual, tetapi tetap perlu dilengkapi ukuran atau kriteria tertulis.

## Sumber variasi yang perlu diwaspadai

${list(spec.risks)}

Jika hasil menyimpang, pisahkan masalah file, material, proses potong, handling, dan finishing. Memperbaiki gejala tanpa menemukan sumbernya membuat cacat yang sama mudah muncul pada batch berikutnya.

## Informasi yang wajib ada pada acceptance criteria

${list(spec.brief)}

Acceptance criteria perlu disetujui sebelum produksi, bukan dibuat setelah barang datang. Bila ada karakteristik yang hanya dapat diverifikasi saat dirakit, sepakati sampel pasangan atau fixture pemeriksaan.

## Kesimpulan

Kontrol mutu **${spec.keyword}** tidak harus rumit, tetapi harus spesifik. Tentukan apa yang kritis, bagaimana memeriksanya, kapan sampling dilakukan, dan siapa yang menyetujui. Bukti sederhana yang konsisten lebih berguna daripada klaim kualitas tanpa metode.`;
}

function strategyArticle(spec, index) {
  return `${opening(spec, index)}

## Mulai dari masalah bisnis yang nyata

Teknologi baru tidak otomatis memberi pengembalian. Untuk **${spec.keyword}**, tentukan lebih dulu apakah masalah utamanya waktu tunggu, variasi kualitas, pemborosan lembar, jumlah vendor, stok komponen, atau sulitnya membuat batch kecil. Tanpa baseline, manfaat hanya menjadi kesan.

Tiga indikator yang relevan untuk dibaca:

${list(spec.criteria)}

## Bukti yang perlu dikumpulkan

${criteriaTable(spec)}

Bandingkan kondisi sebelum dan sesudah dengan periode serta jenis pekerjaan yang setara. Catat total biaya, bukan hanya tarif potong: desain, setup, material, rework, inspeksi, packing, transportasi, dan waktu koordinasi internal ikut memengaruhi keputusan.

## Uji melalui proyek yang terkendali

Pilih satu keluarga part yang cukup mewakili, tetapi tidak menanggung risiko tertinggi. Kunci revisi file, material, jumlah, dan kriteria penerimaan. Setelah batch selesai, evaluasi data dan hambatan operasional sebelum memperluas pemakaian.

Pendekatan bertahap juga membantu membedakan masalah teknologi dari masalah brief atau alur persetujuan. Jika file terus berubah, mesin yang lebih cepat tidak akan menyelesaikan keterlambatan secara keseluruhan.

## Risiko keputusan yang terlalu cepat

${list(spec.risks)}

Untuk keputusan outsource versus investasi mesin, sertakan utilisasi realistis, tenaga kerja, perawatan, consumable, ruang, listrik, keselamatan, dan waktu belajar. Volume tinggi di satu bulan tidak selalu mewakili kebutuhan tahunan.

## Data untuk rapat evaluasi

${list(spec.brief)}

Gunakan data tersebut untuk menetapkan langkah berikut: mempertahankan proses, mengubah desain, mengonsolidasikan vendor, atau menjalankan percobaan tambahan. Dokumentasikan alasan agar keputusan dapat ditinjau ketika permintaan berubah.

## Kesimpulan

Nilai **${spec.keyword}** terlihat pada aliran kerja dan hasil bisnis yang terukur. Tetapkan baseline, uji pada ruang lingkup terkendali, lalu perluas hanya ketika kualitas, biaya total, dan waktu proses menunjukkan perbaikan yang konsisten.`;
}

function faqArticle(spec, index) {
  return `${opening(spec, index)}

## Jawaban singkat sebelum menghubungi vendor

Untuk **${spec.keyword}**, siapkan fungsi part, ukuran, material bila sudah dipilih, jumlah, dan tanggal dibutuhkan. Jika file belum ada, kirim sketsa berukuran atau referensi dengan penjelasan bagian mana yang harus diikuti. Informasi ini cukup untuk membuka percakapan yang produktif, meski belum cukup untuk harga final.

Tiga hal yang paling sering perlu diklarifikasi:

${list(spec.criteria)}

## Dokumen apa yang membuat respons lebih cepat?

${criteriaTable(spec)}

File vektor atau gambar teknik membantu kalkulasi, tetapi vendor tetap perlu membaca apakah ukuran sudah final, garis mana yang dipotong, dan proses apa yang mengikuti. Beri nama revisi yang jelas dan jangan mengirim beberapa file “final” tanpa penjelasan.

## Kapan sampel diperlukan?

Sampel layak dibuat ketika material belum pernah diuji, detail sangat kecil, tampilan tepi penting, atau part harus bertemu dengan komponen lain. Sepakati tujuan sampel; contoh untuk mengecek bentuk belum tentu cukup untuk menyetujui warna finishing.

Harga sampel juga perlu dibaca sebagai biaya pengendalian risiko. Pada batch besar atau produk yang terlihat langsung oleh pelanggan, menemukan masalah lebih awal biasanya lebih efisien daripada memperbaiki hasil produksi penuh.

## Apa yang sering menyebabkan proses tertunda?

${list(spec.risks)}

Keterlambatan tidak selalu terjadi di mesin. Persetujuan yang berpindah-pindah, material yang belum tersedia, dan revisi tanpa penanggung jawab sering menjadi sumber antrean. Tetapkan satu kontak pengambil keputusan dan satu versi file aktif.

## Checklist sebelum meminta jadwal dan harga

${list(spec.brief)}

Minta penawaran menuliskan apa yang termasuk, asumsi material, waktu mulai setelah persetujuan, serta cara menangani perubahan. Untuk jadwal mendesak, tanyakan bagian mana yang realistis dipercepat tanpa melewati pemeriksaan penting.

## Kesimpulan

Pertanyaan terbaik tentang **${spec.keyword}** selalu disertai konteks. Semakin jelas fungsi, file, material, jumlah, dan kriteria penerimaan, semakin akurat respons vendor. Jangan ragu meminta batasan proses ditulis; transparansi tersebut membantu kedua pihak menghindari ekspektasi yang keliru.`;
}

const renderers = {
  decision: decisionArticle,
  material: materialArticle,
  process: processArticle,
  design: designArticle,
  cost: costArticle,
  product: productArticle,
  quality: qualityArticle,
  strategy: strategyArticle,
  faq: faqArticle
};

function serviceLink(spec) {
  const text = `${spec.title} — layanan terkait`;
  if (/pagar/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/produk/pagar-laser-cutting/' };
  if (/railing|balkon/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/produk/railing-balkon-laser-cutting/' };
  if (/partisi/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/produk/partisi-ruangan-laser-cutting/' };
  if (/kayu|plywood|mdf|router|mihrab|plafon/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/jasa-cnc-router/' };
  if (/acrylic|akrilik|co2|signage|huruf/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/jasa-laser-co2/' };
  if (/file|desain|coreldraw|illustrator|dxf/i.test(`${spec.title} ${spec.keyword}`)) return { title: text, href: '/contact/' };
  return { title: text, href: '/jasa-laser-fiber/' };
}

function imageAlt(path, spec) {
  if (path.includes('pagar-laser-cutting')) return `Pagar dan panel metal untuk ${spec.keyword}`;
  if (path.includes('railing-balkon')) return `Railing balkon metal untuk ${spec.keyword}`;
  if (path.includes('partisi-ruangan')) return `Partisi ruangan custom untuk ${spec.keyword}`;
  if (path.includes('mihrab-laser-cutting')) return `Panel mihrab custom untuk ${spec.keyword}`;
  if (path.includes('powder-coating')) return `Pemeriksaan finishing powder coating untuk ${spec.keyword}`;
  if (path.includes('file-preflight')) return `Pemeriksaan file vektor untuk ${spec.keyword}`;
  if (path.includes('acrylic-signage-workshop')) return `Pengerjaan signage acrylic untuk ${spec.keyword}`;
  if (path.includes('co2-acrylic-workshop')) return `Proses laser CO2 pada lembar acrylic untuk ${spec.keyword}`;
  if (path.includes('cnc-plywood-workshop')) return `Operator mengerjakan panel plywood untuk ${spec.keyword}`;
  if (/plywood|mdf/i.test(path)) return `Contoh material kayu dan panel untuk ${spec.keyword}`;
  if (/akrilik|acrylic|display|signage/i.test(path)) return `Contoh acrylic dan signage untuk ${spec.keyword}`;
  if (/stainless|metal|fabrikasi/i.test(path)) return `Contoh material dan pengerjaan logam untuk ${spec.keyword}`;
  if (/co2|laserfiber|engraving|galvo|otomasi|inovasi|teknologi/i.test(path)) return `Peralatan produksi yang mendukung ${spec.keyword}`;
  return `Contoh hasil dan proses produksi untuk ${spec.keyword}`;
}

function faqItems(spec) {
  return [
    {
      question: `Apa yang harus disiapkan untuk membahas ${spec.keyword}?`,
      answer: `Siapkan ${spec.brief[0].toLowerCase()}, ${spec.brief[1].toLowerCase()}, serta ${spec.brief[2].toLowerCase()}. Vendor dapat memakai data itu untuk memeriksa kelayakan dan menuliskan asumsi penawaran.`
    },
    {
      question: `Apakah ${spec.keyword} perlu sampel lebih dulu?`,
      answer: `Sampel disarankan bila material, detail, finishing, atau sambungan belum pernah divalidasi. Gunakan bahan dan geometri yang mewakili risiko produksi, lalu setujui kriteria yang memang ingin diuji.`
    },
    {
      question: `Bagaimana membandingkan penawaran untuk ${spec.keyword}?`,
      answer: `Bandingkan revisi file, spesifikasi material, jumlah, lingkup finishing, jadwal, dan metode pemeriksaan yang sama. Harga tidak sebanding jika asumsi atau tanggung jawab setiap vendor berbeda.`
    }
  ];
}

if (specs.length !== 68) throw new Error(`Expected 68 article specs, received ${specs.length}`);
if (images.length !== 68) throw new Error(`Expected 68 hero images, received ${images.length}`);
if (new Set(specs.map((item) => item.slug)).size !== specs.length) throw new Error('Article slugs must be unique');
if (new Set(specs.map((item) => item.keyword)).size !== specs.length) throw new Error('Primary keywords must be unique');
if (new Set(images).size !== images.length) throw new Error('Hero image references must be unique');

for (const image of images) await access(join(publicDir, image.slice(1)));

await mkdir(outputDir, { recursive: true });
for (const entry of await readdir(outputDir)) {
  if (entry.endsWith('.md') || entry.endsWith('.mdx')) await rm(join(outputDir, entry));
}

for (const [index, spec] of specs.entries()) {
  const renderer = renderers[spec.mode];
  if (!renderer) throw new Error(`Unknown renderer ${spec.mode} for ${spec.slug}`);
  const baseBody = renderer(spec, index).trim();
  const body = baseBody.replace('\n## Kesimpulan', `\n${contextSection(spec, index)}\n\n## Kesimpulan`);
  const wordCount = body.split(/\s+/).length;
  const readTime = `${Math.max(4, Math.ceil(wordCount / 190))} menit baca`;
  const description = shorten(`${capitalize(spec.focus)}.`);
  const relatedLinks = [
    serviceLink(spec),
    { title: specs[(index + 1) % specs.length].title, href: `/blog/${specs[(index + 1) % specs.length].slug}/` },
    { title: specs[(index + 7) % specs.length].title, href: `/blog/${specs[(index + 7) % specs.length].slug}/` }
  ];
  const takeaways = [
    capitalize(spec.focus),
    spec.criteria[0],
    `Kendalikan risiko utama: ${spec.risks[0].toLowerCase()}`
  ];
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(spec.title)}`,
    `description: ${JSON.stringify(description)}`,
    `pubDate: ${publicationDate(spec.slug, index)}`,
    `updatedDate: ${UPDATED_DATE}`,
    `category: ${JSON.stringify(spec.category)}`,
    `tags: ${JSON.stringify([spec.category.toLowerCase(), `laser cutting ${spec.mode}`, 'jasa laser cutting'])}`,
    `image: ${JSON.stringify(images[index])}`,
    `imageAlt: ${JSON.stringify(imageAlt(images[index], spec))}`,
    `readTime: ${JSON.stringify(readTime)}`,
    'author: "Tim Raja Cutting Laser"',
    `primaryKeyword: ${JSON.stringify(spec.keyword)}`,
    `keyTakeaways: ${JSON.stringify(takeaways)}`,
    `faq: ${JSON.stringify(faqItems(spec))}`,
    `relatedLinks: ${JSON.stringify(relatedLinks)}`,
    'draft: false',
    '---',
    ''
  ].join('\n');
  await writeFile(join(outputDir, `${spec.slug}.md`), `${frontmatter}${body}\n`, 'utf8');
}

console.log(`Generated ${specs.length} unique, live blog articles in ${outputDir}`);
