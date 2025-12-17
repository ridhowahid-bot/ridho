import { GoogleGenAI } from "@google/genai";
import { ModuleInputData } from "../types";

// Initialize the Gemini API client
// Note: In a real production environment, ensure process.env.API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to sanitize text for Markdown tables (replace newlines with <br>)
const formatForTable = (text: string) => {
  if (!text) return "-";
  return text.replace(/\n/g, '<br>');
};

export const generateTeachingModule = async (data: ModuleInputData): Promise<string> => {
  const prompt = `
**ROLE & PERSONA**
Anda adalah "Deep Learning Module Engine", sebuah AI ahli kurikulum yang berspesialisasi dalam "Pembelajaran Mendalam" (Deep Learning).

**ATURAN OUTPUT MUTLAK**
1. **JANGAN** memberikan kata pengantar, kalimat pembuka, atau basa-basi AI.
2. **LANGSUNG** mulai output dengan Judul Modul (Heading 1).
3. Bagian "Informasi Umum", "Langkah Pembelajaran", dan "Asesmen" **WAJIB** dalam bentuk **TABEL**.
4. **FORMAT BARIS DALAM TABEL:** Gunakan tag \`<br>\` untuk memisahkan poin-poin agar teks tersusun **VERTIKAL (KE BAWAH)**, bukan menyamping. Jangan gunakan numbering markdown (1. 2.) biasa di dalam tabel karena akan error, gunakan manual: "1. Teks<br>2. Teks".
5. Bagian "Tanda Tangan" **WAJIB** dua kolom.

**INPUT DATA**
* Sekolah: ${data.schoolName}
* Guru: ${data.teacherName} (NIP: ${data.teacherNip})
* Kepala Sekolah: ${data.principalName} (NIP: ${data.principalNip})
* Mapel/Fase: ${data.subject} - ${data.phaseClass}
* Topik: ${data.topic}
* Pertemuan: ${data.meetings} x ${data.duration} JP
* Siswa: ${data.studentCharacteristics || "Umum"}
* **Dimensi Profil Lulusan:** ${data.graduateProfileDimensions.length > 0 ? data.graduateProfileDimensions.join(", ") : "Dipilih oleh AI"}
* **Capaian Pembelajaran (CP):** ${formatForTable(data.learningOutcomes)}
* **Tujuan Pembelajaran (TP):** ${formatForTable(data.learningObjectives)}
* **Pengetahuan Awal:** ${formatForTable(data.priorKnowledge)}
* **Praktik Pedagogis:** ${data.pedagogicalPractice}
* **Digital:** ${formatForTable(data.digitalUtilization)}
* **Kemitraan:** ${formatForTable(data.learningPartnership)}
* **Lingkungan:** ${formatForTable(data.learningEnvironment)}
* **Catatan Guru:** ${formatForTable(data.teacherNotes)}

**INSTRUKSI DESAIN**
1. **Perlakuan Input (PENTING):** 
   * **Capaian Pembelajaran (CP):** Tampilkan CP sesuai input user di tabel Informasi Umum.
   * **Tujuan Pembelajaran (TP):** Jika user mengisi input TP, **GUNAKAN INPUT TERSEBUT PERSIS** (hanya rapikan format menjadi poin-poin). JANGAN mengarang TP baru jika user sudah menyediakannya. Jika kosong, baru rumuskan TP menggunakan KKO yang terukur (Taksonomi SOLO/Bloom).
   
2. **Desain Aktivitas (TABEL):**
   * Gunakan sintaks *${data.pedagogicalPractice}*.
   * Pastikan siklus Deep Learning (Memahami -> Mengaplikasi -> Merefleksi) terdistribusi.
   * **Rutinitas Awal:** Setiap pertemuan WAJIB diawali dengan: Menyapa, Mengabsen, dan Berdoa.
   * **Pertemuan 1:** WAJIB ada **Pertanyaan Pemantik** dan **Pernyataan Bermakna** (manfaat kehidupan nyata).
   * **Visualisasi:** Gunakan placeholder *[GAMBAR: Deskripsi]* jika perlu.

3. **Desain Asesmen (INTEGRASI PROFIL):**
   * Asesmen WAJIB mengukur pemahaman materi DAN **Dimensi Profil Lulusan** yang dipilih: **${data.graduateProfileDimensions.join(", ") || "Umum"}**.
   * **LOGIKA ASESMEN:**
     - Jika dimensi *Bernalar Kritis* dipilih, soal/instrumen harus menuntut analisis (HOTS), bukan sekadar hafalan.
     - Jika dimensi *Kreativitas* dipilih, instrumen harus menilai orisinalitas ide/produk.
     - Jika dimensi *Gotong Royong* dipilih, wajib ada rubrik penilaian kolaborasi.
     - Jika dimensi *Beriman/Bertakwa* dipilih, kaitkan materi dengan refleksi nilai spiritual/moral.

**FORMAT OUTPUT (MARKDOWN)**

# Modul Ajar: ${data.topic}

## A. Informasi Umum

| Komponen | Deskripsi |
| --- | --- |
| Sekolah | ${data.schoolName} |
| Guru Penyusun | ${data.teacherName} |
| Mapel/Fase | ${data.subject} / ${data.phaseClass} |
| Topik | ${data.topic} |
| Alokasi Waktu | ${data.meetings} Pertemuan x ${data.duration} JP |
| **Capaian Pembelajaran** | ${formatForTable(data.learningOutcomes)} |
| Kompetensi Awal | ${formatForTable(data.priorKnowledge)} |
| Profil Lulusan | ${data.graduateProfileDimensions.join(", ") || "Disesuaikan"} |
| Praktik Pedagogis | ${data.pedagogicalPractice} |
| Sarana Digital | ${formatForTable(data.digitalUtilization)} |

## B. Tujuan Pembelajaran
*(Gunakan TP dari input user di atas. Jika kosong, gunakan TP hasil rumusan AI)*
1. ...
2. ...

## C. Rincian Kegiatan Pembelajaran

*(Ulangi tabel di bawah ini untuk setiap Pertemuan 1 s.d. ${data.meetings}. Pastikan Pertemuan 1 memiliki Pertanyaan Pemantik & Pernyataan Bermakna)*

### Pertemuan [X]

| Pengalaman Belajar | Langkah-langkah Pembelajaran | Waktu |
| --- | --- | --- |
| **Pendahuluan** | **Rutinitas Awal:**<br>1. Guru menyapa siswa dengan ramah.<br>2. Guru memeriksa kehadiran peserta didik.<br>3. Guru memimpin doa sebelum belajar.<br><br>**Apersepsi & Motivasi:**<br>*(Khusus Pertemuan 1: Masukkan Pertanyaan Pemantik & Pernyataan Bermakna di sini)*<br>*(Pertemuan selanjutnya: Review materi sebelumnya)*<br>4. Menyampaikan tujuan pembelajaran. | 15 menit |
| **Inti**<br>*(Memahami / Mengaplikasi / Merefleksi)* | **Sintaks ${data.pedagogicalPractice}:**<br><br>1. [Langkah 1 Model Belajar].<br>   *Deskripsi aktivitas siswa yang mendalam.*<br>   *[GAMBAR: Jika perlu, deskripsikan ilustrasi pendukung di sini]*<br><br>2. [Langkah 2 Model Belajar].<br>   *Deskripsi aktivitas kolaborasi/eksplorasi.*<br><br>3. [Langkah 3 Model Belajar].<br>   *Deskripsi penyelesaian masalah/proyek.* | ... menit |
| **Penutup** | **Kegiatan Penutup**<br>1. Refleksi bersama siswa.<br>2. Penyimpulan materi.<br>3. Doa penutup. | 15 menit |

## D. Asesmen

| Jenis | Metode | Instrumen |
| --- | --- | --- |
| Diagnostik | [Metode] | [Instrumen] |
| Formatif | [Metode] | [Instrumen] |
| Sumatif | [Metode] | [Instrumen] |

<br>

| Mengetahui,<br>Kepala Sekolah | Guru Mata Pelajaran |
| :--- | :--- |
| <br><br><br><br> **${data.principalName}** | <br><br><br><br> **${data.teacherName}** |
| NIP. ${data.principalNip} | NIP. ${data.teacherNip} |

---

## E. Lampiran Lengkap

### 1. Instrumen Asesmen
*(Buatkan **detail** instrumen asesmen. **PENTING:** Pastikan butir soal atau kriteria rubrik secara eksplisit menguji/menilai Dimensi Profil Lulusan yang dipilih (${data.graduateProfileDimensions.join(", ")}). Contoh: "Soal nomor 3 menguji Bernalar Kritis karena meminta siswa menganalisis penyebab...")*

### 2. Lembar Kerja Peserta Didik (LKPD)
*(Buatkan **contoh nyata** LKPD yang bisa langsung difotokopi. Berisi: Judul Aktivitas, Petunjuk Pengerjaan, Soal/Tabel Pengamatan, dan sertakan tag [GAMBAR: ...] untuk menunjukkan posisi ilustrasi)*

### 3. Poin Penting Presentasi Guru
*(Buatkan ringkasan poin-poin materi (slide) yang harus dipresentasikan guru di depan kelas. Sertakan ide visualisasi/gambar untuk setiap poin penting)*

### 4. Bahan Bacaan Guru & Peserta Didik
*(Berikan ringkasan materi esensial sekitar 2-3 paragraf untuk penguatan pemahaman topik ${data.topic})*
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
      }
    });

    return response.text || "Maaf, terjadi kesalahan dalam menghasilkan konten.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gagal menghubungi layanan AI. Pastikan API KEY valid.");
  }
};

export const generateFieldSuggestion = async (fieldName: string, data: ModuleInputData): Promise<string> => {
  if (!data.topic) return "Mohon isi topik pembelajaran terlebih dahulu.";

  let specificInstruction = "";
  
  switch(fieldName) {
    case 'teacherNotes':
      specificInstruction = "Berikan 2-3 ide aktivitas kreatif/ice breaking/pemicu diskusi yang menarik untuk topik ini.";
      break;
    case 'digitalUtilization':
      specificInstruction = "Sebutkan 2-3 aplikasi, website, atau alat digital spesifik yang sangat cocok untuk mengajarkan topik ini (contoh: Quizizz, PhET, Canva, Google Earth, dll) beserta cara singkat penggunaannya.";
      break;
    case 'learningPartnership':
      specificInstruction = "Sebutkan 2-3 ide kemitraan (narasumber tamu, kunjungan industri, atau kolaborasi komunitas) yang relevan dan bisa memperkaya topik ini.";
      break;
    case 'learningEnvironment':
      specificInstruction = "Berikan 2-3 ide pengaturan ruang kelas atau suasana belajar (seperti layout tempat duduk, penggunaan area luar kelas) yang mendukung model pembelajaran ini.";
      break;
    case 'learningObjectives':
      specificInstruction = "Rumuskan 2-3 Tujuan Pembelajaran (TP) yang spesifik, terukur, dan relevan dengan Topik ini. Gunakan Kata Kerja Operasional (KKO) yang bervariasi (misal: menganalisis, menciptakan, mengevaluasi).";
      break;
    default:
      specificInstruction = "Berikan ide singkat yang relevan.";
  }

  const prompt = `
    Bertindaklah sebagai konsultan pendidikan kreatif.
    Mapel: ${data.subject}
    Topik: ${data.topic}
    Model Belajar: ${data.pedagogicalPractice}
    
    Tugas: ${specificInstruction}
    
    Jawab dengan poin-poin singkat, padat, dan langsung dapat diterapkan. Jangan gunakan basa-basi.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Tidak ada saran.";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "Gagal memuat saran.";
  }
};