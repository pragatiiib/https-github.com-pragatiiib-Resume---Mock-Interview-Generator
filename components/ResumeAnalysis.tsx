
import React from 'react';
import { RedFlag } from '../types';

interface ResumeAnalysisProps {
  redFlags: RedFlag[];
  isLoading: boolean;
  onStartInterview: () => void;
}

const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({ redFlags, isLoading, onStartInterview }) => {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-8 animate-pulse">
        <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto flex items-center justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg animate-spin" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-800">Analyzing Resume Architecture...</h2>
          <p className="text-slate-500">Extracting skills, detecting gaps, and generating specialized questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Pre-Interview Intelligence</h2>
          <p className="text-slate-500">We found {redFlags.length} points to watch out for in your resume.</p>
        </div>
        <button 
          onClick={onStartInterview}
          className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          Enter Interview Room →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="text-red-500">🚩</span> Red Flag Detector
          </h3>
          
          <div className="space-y-6">
            {redFlags.map((flag, i) => (
              <div key={i} className="group relative bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-red-200 transition-all">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-red-700 transition-colors">{flag.issue}</h4>
                    <p className="text-sm text-slate-500">{flag.reason}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    flag.severity === 'high' ? 'bg-red-100 text-red-600' : 
                    flag.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {flag.severity}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Pro Tip / Fix</p>
                  <p className="text-slate-700 leading-relaxed">{flag.howToFix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysis;
