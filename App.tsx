import React, { useState } from 'react';
import { ModuleInputData, AppState } from './types';
import { generateTeachingModule } from './services/geminiService';
import ModuleForm from './components/ModuleForm';
import ModuleOutput from './components/ModuleOutput';
import { BrainCircuit, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFormSubmit = async (data: ModuleInputData) => {
    setAppState(AppState.LOADING);
    setErrorMsg('');
    try {
      const content = await generateTeachingModule(data);
      setGeneratedContent(content);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Terjadi kesalahan yang tidak diketahui.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGeneratedContent('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg text-white">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Skada Deep Learning Engine</h1>
              <p className="text-xs text-gray-500">AI Curriculum Assistant</p>
            </div>
          </div>
           <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Intro & Form */}
          <div className={`lg:col-span-5 ${appState === AppState.SUCCESS ? 'hidden lg:block' : ''}`}>
             <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Rancang Pembelajaran Bermakna</h2>
                <p className="text-lg text-gray-600">
                  Buat modul ajar berbasis <strong>Deep Learning</strong> yang Berkesadaran, Bermakna, dan Menggembirakan dalam hitungan detik.
                </p>
             </div>
            
            <ModuleForm onSubmit={handleFormSubmit} isLoading={appState === AppState.LOADING} />

             {appState === AppState.ERROR && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Terjadi Kesalahan</h3>
                  <p className="text-sm">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className={`lg:col-span-7 ${appState !== AppState.SUCCESS ? 'hidden lg:block' : ''}`}>
             {appState === AppState.IDLE && (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50">
                 <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                   <BrainCircuit className="w-12 h-12 text-blue-200" />
                 </div>
                 <h3 className="text-xl font-semibold text-gray-400 mb-2">Modul Ajar akan muncul di sini</h3>
                 <p className="text-gray-400 max-w-sm">
                   Isi formulir di sebelah kiri untuk mulai merancang pengalaman belajar yang mendalam bagi siswa Anda.
                 </p>
               </div>
             )}

             {appState === AppState.LOADING && (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-lg">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Sedang Berpikir...</h3>
                  <p className="text-gray-500 animate-pulse text-center">
                    Menganalisis profil siswa, merumuskan tujuan SOLO Taxonomy,<br/>dan merancang aktivitas 3 Pilar.
                  </p>
                </div>
             )}

             {appState === AppState.SUCCESS && (
                <ModuleOutput content={generatedContent} onReset={handleReset} />
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;