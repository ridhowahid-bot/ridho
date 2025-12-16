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
1. **Tujuan & Identifikasi:** 
   * Gunakan *Dimensi Profil Lulusan* yang dipilih user. 
   * Jika user mengisi *Tujuan Pembelajaran*, gunakan teks tersebut (rapikan formatnya menjadi poin-poin). 
   * Jika TP kosong, rumuskan TP berdasarkan *Capaian Pembelajaran* dan *Topik* menggunakan KKO yang terukur (Taksonomi SOLO/Bloom).
2. **Desain Aktivitas (TABEL):**
   * Gunakan sintaks *${data.pedagogicalPractice}*.
   * Pastikan siklus Deep Learning (Memahami -> Mengaplikasi -> Merefleksi) terdistribusi.
   * **PENTING:** Pada kolom "Langkah-langkah Pembelajaran", pisahkan setiap langkah dengan \`<br><br>\` agar terlihat rapi seperti paragraf terpisah.

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
| Capaian Pembelajaran | ${formatForTable(data.learningOutcomes)} |
| Kompetensi Awal | ${formatForTable(data.priorKnowledge)} |
| Profil Lulusan | ${data.graduateProfileDimensions.join(", ") || "Disesuaikan"} |
| Praktik Pedagogis | ${data.pedagogicalPractice} |
| Sarana Digital | ${formatForTable(data.digitalUtilization)} |

## B. Tujuan Pembelajaran
*(Jika user mengisi TP, tampilkan di sini. Jika tidak, hasilkan TP yang relevan)*
1. ...
2. ...

## C. Rincian Kegiatan Pembelajaran

*(Ulangi tabel di bawah ini untuk setiap Pertemuan 1 s.d. ${data.meetings})*

### Pertemuan [X]

| Pengalaman Belajar | Langkah-langkah Pembelajaran | Waktu |
| --- | --- | --- |
| **Pendahuluan** | **Kegiatan Awal**<br>1. Guru menyapa dan memeriksa kehadiran.<br>2. Apersepsi: Mengaitkan materi dengan *${formatForTable(data.priorKnowledge)}*.<br>3. Pertanyaan pemantik untuk menggugah nalar kritis. | 15 menit |
| **Inti**<br>*(Memahami / Mengaplikasi / Merefleksi)* | **Sintaks ${data.pedagogicalPractice}:**<br><br>1. [Langkah 1 Model Belajar].<br>   *Deskripsi aktivitas siswa yang mendalam.*<br><br>2. [Langkah 2 Model Belajar].<br>   *Deskripsi aktivitas kolaborasi/eksplorasi.*<br><br>3. [Langkah 3 Model Belajar].<br>   *Deskripsi penyelesaian masalah/proyek.* | ... menit |
| **Penutup** | **Kegiatan Penutup**<br>1. Refleksi bersama siswa.<br>2. Penyimpulan materi.<br>3. Doa penutup. | 15 menit |

## D. Asesmen

| Jenis | Metode | Instrumen |
| --- | --- | --- |
| Diagnostik | [Metode] | [Instrumen] |
| Formatif | [Metode] | [Instrumen] |
| Sumatif | [Metode] | [Instrumen] |

## E. Lampiran
* Lembar Kerja Peserta Didik (LKPD)
* Bahan Bacaan Guru & Peserta Didik

<br>

| Mengetahui,<br>Kepala Sekolah | Guru Mata Pelajaran |
| :--- | :--- |
| <br><br><br><br> **${data.principalName}** | <br><br><br><br> **${data.teacherName}** |
| NIP. ${data.principalNip} | NIP. ${data.teacherNip} |
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
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