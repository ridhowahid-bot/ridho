import React, { useState, useEffect, useRef } from 'react';
import { ModuleInputData } from '../types';
import { generateFieldSuggestion } from '../services/geminiService';
import { BookOpen, User, School, Clock, Users, FileText, Lightbulb, PenTool, Save, RotateCcw, Trash2, AlertCircle, Handshake, Layout, Monitor, CheckSquare, Brain, Sparkles, Loader2, Target, ScrollText } from 'lucide-react';

interface ModuleFormProps {
  onSubmit: (data: ModuleInputData) => void;
  isLoading: boolean;
}

const PEDAGOGICAL_PRACTICES = [
  "Problem-Based Learning (PBL)",
  "Project-Based Learning (PjBL)",
  "Inquiry-Based Learning (Pembelajaran Inkuiri)",
  "Collaborative Inquiry (Inkuiri Kolaboratif)",
  "Discovery Learning",
  "Teaching Factory (TeFa) - Model 6 Langkah (TF-6M)",
  "Teaching Factory (TeFa) - Umum",
  "Contextual Teaching and Learning (CTL)",
  "Experiential Learning (Pembelajaran Berbasis Pengalaman)",
  "Cooperative Learning (Pembelajaran Kooperatif)",
  "Differentiated Instruction (Pembelajaran Berdiferensiasi)",
  "Flipped Classroom",
  "Design Thinking",
  "Gamification",
  "Constructivism Approach",
  "STEAM (Science, Technology, Engineering, Arts, Math)"
];

const GRADUATE_PROFILE_DIMENSIONS = [
  "Keimanan, Ketakwaan, & Akhlak Mulia",
  "Kewargaan & Kebinekaan Global",
  "Penalaran Kritis",
  "Kreativitas",
  "Gotong Royong / Kolaborasi",
  "Kemandirian",
  "Kesehatan Fisik & Mental",
  "Komunikasi"
];

const DRAFT_KEY = 'deep_learning_module_draft';

const ModuleForm: React.FC<ModuleFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ModuleInputData>({
    schoolName: '',
    teacherName: '',
    teacherNip: '',
    principalName: '',
    principalNip: '',
    subject: '',
    phaseClass: '',
    topic: '',
    meetings: 2,
    duration: 40,
    studentCharacteristics: '',
    graduateProfileDimensions: [],
    priorKnowledge: 'Murid diharapkan memahami dasar-dasar materi, wujud zat (padat, cair, gas), dan perbedaan perubahan fisika/kimia (dari jenjang SMP).',
    learningOutcomes: '',
    learningObjectives: '',
    pedagogicalPractice: PEDAGOGICAL_PRACTICES[0],
    teacherNotes: '',
    learningPartnership: '',
    learningEnvironment: '',
    digitalUtilization: ''
  });

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  // Common input classes for consistency
  const inputClass = "w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  // Helper to check if current state is different from empty default
  const isDirty = (data: ModuleInputData) => {
    return (
      data.schoolName !== '' ||
      data.teacherName !== '' ||
      data.topic !== '' ||
      data.subject !== '' ||
      data.teacherNotes !== '' ||
      data.learningPartnership !== '' ||
      data.learningEnvironment !== '' ||
      data.digitalUtilization !== '' ||
      data.learningOutcomes !== '' ||
      data.learningObjectives !== '' ||
      data.graduateProfileDimensions.length > 0
    );
  };

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      setHasDraft(true);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Only save if the form has data
    if (isDirty(formData)) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setHasDraft(true);
      }, 800); // Debounce save

      return () => clearTimeout(timeoutId);
    }
  }, [formData]);

  const handleLoadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        
        // Handle migration from old 'learningModel' to 'pedagogicalPractice' if needed
        const practice = parsed.pedagogicalPractice || parsed.learningModel || PEDAGOGICAL_PRACTICES[0];
        
        setFormData(prev => ({ 
          ...prev, 
          ...parsed,
          graduateProfileDimensions: parsed.graduateProfileDimensions || [],
          priorKnowledge: parsed.priorKnowledge || prev.priorKnowledge,
          learningOutcomes: parsed.learningOutcomes || prev.learningOutcomes,
          learningObjectives: parsed.learningObjectives || prev.learningObjectives,
          pedagogicalPractice: PEDAGOGICAL_PRACTICES.includes(practice) ? practice : PEDAGOGICAL_PRACTICES[0]
        }));
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setLastSaved(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'meetings' || name === 'duration' ? Number(value) : value
    }));
  };

  const handleDimensionChange = (dimension: string) => {
    setFormData(prev => {
      const current = prev.graduateProfileDimensions;
      if (current.includes(dimension)) {
        return { ...prev, graduateProfileDimensions: current.filter(d => d !== dimension) };
      } else {
        return { ...prev, graduateProfileDimensions: [...current, dimension] };
      }
    });
  };

  const handleGenerateSuggestion = async (field: keyof ModuleInputData) => {
    if (!formData.topic) {
      alert("Mohon isi 'Topik / Materi Utama' terlebih dahulu agar AI dapat memberikan saran yang relevan.");
      return;
    }

    setLoadingField(field);
    try {
      const suggestion = await generateFieldSuggestion(field, formData);
      setFormData(prev => {
        const currentVal = prev[field] as string;
        // Append if not empty, otherwise set
        const newVal = currentVal ? `${currentVal}\n\n[Saran AI]:\n${suggestion}` : suggestion;
        return { ...prev, [field]: newVal };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderAiButton = (field: keyof ModuleInputData) => (
    <button
      type="button"
      onClick={() => handleGenerateSuggestion(field)}
      disabled={loadingField === field}
      className="ml-auto text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1.5"
      title="Dapatkan inspirasi dari AI berdasarkan Topik Anda"
    >
      {loadingField === field ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {loadingField === field ? '...' : 'Bantu Ide'}
    </button>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Input Data Modul
        </h2>
        <p className="text-blue-100 mt-2 text-sm">Lengkapi data berikut untuk men-generate modul ajar Deep Learning.</p>
      </div>

      {/* Draft Notification Bar */}
      {hasDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              {lastSaved 
                ? `Disimpan otomatis pukul ${lastSaved}` 
                : "Ditemukan draf tersimpan dari sesi sebelumnya."}
            </span>
          </div>
          <div className="flex gap-2">
            {!lastSaved && (
              <button
                type="button"
                onClick={handleLoadDraft}
                className="text-xs font-medium bg-amber-100 text-amber-900 px-3 py-1.5 rounded-md hover:bg-amber-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Muat Draf
              </button>
            )}
             <button
              type="button"
              onClick={handleClearDraft}
              className="text-xs font-medium bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Identitas Sekolah */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <School className="w-4 h-4" /> Identitas Sekolah
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nama Sekolah</label>
              <input
                type="text"
                name="schoolName"
                required
                className={inputClass}
                placeholder="Contoh: SMK Negeri 2 Palopo"
                value={formData.schoolName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass}>Nama Guru & NIP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="teacherName"
                  required
                  className={`w-2/3 ${inputClass}`}
                  placeholder="Nama Guru"
                  value={formData.teacherName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="teacherNip"
                  className={`w-1/3 ${inputClass}`}
                  placeholder="NIP"
                  value={formData.teacherNip}
                  onChange={handleChange}
                />
              </div>
            </div>
             <div>
              <label className={labelClass}>Nama Kepala Sekolah & NIP</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="principalName"
                  required
                  className={`w-2/3 ${inputClass}`}
                  placeholder="Nama Kepala Sekolah"
                  value={formData.principalName}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="principalNip"
                  className={`w-1/3 ${inputClass}`}
                  placeholder="NIP"
                  value={formData.principalNip}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Pembelajaran */}
        <div className="space-y-4 pt-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Informasi Pembelajaran
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Mata Pelajaran</label>
              <input
                type="text"
                name="subject"
                required
                className={inputClass}
                placeholder="Contoh: Biologi"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass}>Fase / Kelas</label>
              <input
                type="text"
                name="phaseClass"
                required
                className={inputClass}
                placeholder="Contoh: Fase E / Kelas 10"
                value={formData.phaseClass}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Topik / Materi Utama</label>
              <input
                type="text"
                name="topic"
                required
                className={inputClass}
                placeholder="Contoh: Perubahan Lingkungan & Pemanasan Global"
                value={formData.topic}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Kompetensi & Profil (New Section with CP & TP) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Kompetensi, CP & TP
          </h3>
          
          {/* Dimensi Profil Lulusan - Updated to Cards for better visibility */}
          <div className="space-y-3">
            <label className={`${labelClass} mb-3`}>
              <span className="flex items-center gap-1">
                Dimensi Profil Lulusan <CheckSquare className="w-4 h-4 text-gray-400" />
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {GRADUATE_PROFILE_DIMENSIONS.map((dim) => (
                <label key={dim} className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg border transition-all ${
                  formData.graduateProfileDimensions.includes(dim) 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.graduateProfileDimensions.includes(dim)}
                    onChange={() => handleDimensionChange(dim)}
                    className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                  />
                  <span className={`text-sm ${formData.graduateProfileDimensions.includes(dim) ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                    {dim}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Pengetahuan Awal */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                Pengetahuan Awal Murid
              </span>
            </label>
            <textarea
              name="priorKnowledge"
              className={`${inputClass} min-h-[80px]`}
              placeholder="Apa yang seharusnya sudah dipahami murid sebelum materi ini?"
              value={formData.priorKnowledge}
              onChange={handleChange}
            />
          </div>

          {/* Capaian Pembelajaran (CP) */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                Capaian Pembelajaran (CP) <ScrollText className="w-3 h-3 text-gray-400" />
              </span>
            </label>
            <textarea
              name="learningOutcomes"
              className={`${inputClass} min-h-[80px]`}
              placeholder="Salin Capaian Pembelajaran (CP) dari dokumen regulasi di sini..."
              value={formData.learningOutcomes}
              onChange={handleChange}
            />
          </div>

          {/* Tujuan Pembelajaran (TP) */}
          <div>
            <label className={`flex items-center justify-between ${labelClass}`}>
              <span className="flex items-center gap-1">
                Tujuan Pembelajaran (TP) <Target className="w-3 h-3 text-gray-400" />
              </span>
              {renderAiButton('learningObjectives')}
            </label>
            <textarea
              name="learningObjectives"
              className={`${inputClass} min-h-[80px]`}
              placeholder="Tuliskan TP di sini, atau biarkan kosong agar AI merumuskannya untuk Anda."
              value={formData.learningObjectives}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Model & Catatan Tambahan (Moved Up) */}
        <div className="space-y-4 pt-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Praktik Pedagogis & Catatan
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelClass}>Praktik Pedagogis (Model/Strategi/Metode)</label>
              <select
                name="pedagogicalPractice"
                className={`${inputClass} appearance-none bg-no-repeat bg-[right_1rem_center]`}
                value={formData.pedagogicalPractice}
                onChange={handleChange}
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
              >
                {PEDAGOGICAL_PRACTICES.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`flex items-center justify-between ${labelClass}`}>
                <span className="flex items-center gap-1">
                  Catatan Tambahan Guru <PenTool className="w-3 h-3 text-gray-400" />
                </span>
                {renderAiButton('teacherNotes')}
              </label>
              <textarea
                name="teacherNotes"
                className={`${inputClass} min-h-[80px]`}
                placeholder="Tuliskan aktivitas spesifik yang ingin Anda lakukan, contoh: 'Ajak siswa observasi taman sekolah' atau 'Gunakan game Kahoot di awal'"
                value={formData.teacherNotes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Lingkungan, Kemitraan & Digital (Moved Down) */}
        <div className="space-y-4 pt-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <Handshake className="w-4 h-4" /> Ekosistem Pembelajaran
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={`flex items-center justify-between ${labelClass}`}>
                <span className="flex items-center gap-1">
                  Pemanfaatan Digital <Monitor className="w-3 h-3 text-gray-400" /> <span className="text-gray-400 font-normal">(Opsional)</span>
                </span>
                {renderAiButton('digitalUtilization')}
              </label>
              <textarea
                name="digitalUtilization"
                className={`${inputClass} min-h-[60px]`}
                placeholder="Contoh: Video pembelajaran interaktif, Quizizz, Google Classroom, atau perpustakaan digital."
                value={formData.digitalUtilization}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={`flex items-center justify-between ${labelClass}`}>
                <span className="flex items-center gap-1">
                  Kemitraan Pembelajaran <span className="text-gray-400 font-normal">(Opsional)</span>
                </span>
                {renderAiButton('learningPartnership')}
              </label>
              <textarea
                name="learningPartnership"
                className={`${inputClass} min-h-[60px]`}
                placeholder="Contoh: Kerjasama dengan Puskesmas untuk narasumber, kolaborasi dengan guru Bahasa Inggris, atau kunjungan ke industri."
                value={formData.learningPartnership}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={`flex items-center justify-between ${labelClass}`}>
                <span className="flex items-center gap-1">
                  Lingkungan Pembelajaran
                </span>
                {renderAiButton('learningEnvironment')}
              </label>
              <textarea
                name="learningEnvironment"
                className={`${inputClass} min-h-[60px]`}
                placeholder="Contoh: Ruang kelas fleksibel, budaya saling menghargai pendapat, forum diskusi daring, atau suasana yang inklusif."
                value={formData.learningEnvironment}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Waktu & Karakteristik */}
        <div className="space-y-4 pt-2">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Waktu & Peserta Didik
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Jumlah Pertemuan</label>
              <input
                type="number"
                name="meetings"
                min="1"
                required
                className={inputClass}
                value={formData.meetings}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClass}>Durasi per Pertemuan (JP)</label>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  min="1"
                  required
                  className={`${inputClass} pr-10`}
                  value={formData.duration}
                  onChange={handleChange}
                />
                <span className="absolute right-3 top-[2.4rem] text-gray-500 text-sm font-medium">JP</span>
              </div>
            </div>
             <div className="md:col-span-1">
              <label className={labelClass}>
                <span className="flex items-center gap-1">
                  Karakteristik Siswa <Users className="w-3 h-3 text-gray-400" />
                </span>
              </label>
              <input
                type="text"
                name="studentCharacteristics"
                className={inputClass}
                placeholder="Opsional (cth: Gaya belajar kinestetik)"
                value={formData.studentCharacteristics}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sedang Merancang Modul...
              </span>
            ) : (
              'Generate Modul Ajar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModuleForm;