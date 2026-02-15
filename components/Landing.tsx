
import React, { useState, useCallback } from 'react';
import { InterviewTone } from '../types';

interface LandingProps {
  onStart: (resumeContent: string, tone: InterviewTone) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const [resumeText, setResumeText] = useState('');
  const [tone, setTone] = useState<InterviewTone>(InterviewTone.FRIENDLY);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const tones = [
    { id: InterviewTone.FRIENDLY, label: 'Friendly', desc: 'Encouraging & conversational.', icon: '😊' },
    { id: InterviewTone.STRICT, label: 'Strict', desc: 'Skeptical & detail-oriented.', icon: '🧐' },
    { id: InterviewTone.STARTUP, label: 'Startup', desc: 'Fast, bold & culture-focused.', icon: '🚀' },
    { id: InterviewTone.MNC, label: 'MNC', desc: 'Structured & behavioral.', icon: '🏢' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Master the Interview with <br />
          <span className="gradient-text">Adaptive AI Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, pick an interviewer persona, and get grilled with real-world technical and HR questions tailored to your profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
              Interviewer Tone Mode
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-4 rounded-2xl text-left transition-all border-2 ${
                    tone === t.id 
                      ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50' 
                      : 'border-slate-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className={`font-bold ${tone === t.id ? 'text-indigo-700' : 'text-slate-800'}`}>{t.label}</div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm">2</span>
              Resume Content
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center w-full">
                <label 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-inner' 
                      : 'border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className={`w-8 h-8 mb-4 transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className={`mb-2 text-sm font-semibold tracking-tight transition-colors ${isDragging ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {isDragging ? 'Drop your resume here!' : 'Drop resume or click to upload'}
                    </p>
                    <p className="text-xs text-slate-400">Supports .txt, .md</p>
                  </div>
                  <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileChange} />
                </label>
              </div>
              <div className="relative">
                <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <button
            disabled={!resumeText.trim()}
            onClick={() => onStart(resumeText, tone)}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
              resumeText.trim() 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Start AI Interview Generator
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
