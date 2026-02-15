
import React, { useState, useEffect, useRef } from 'react';
import { Question, InterviewTone } from '../types';

interface InterviewSessionProps {
  currentQuestion: Question;
  onAnswer: (answer: string) => void;
  isEvaluating: boolean;
  progress: number;
  tone: InterviewTone;
  history: any[];
  onFinish: () => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ 
  currentQuestion, 
  onAnswer, 
  isEvaluating, 
  progress, 
  tone,
  history,
  onFinish
}) => {
  const [answer, setAnswer] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the textarea on new question
  useEffect(() => {
    if (!isEvaluating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentQuestion, isEvaluating]);

  const handleSubmit = () => {
    if (!answer.trim() || isEvaluating) return;
    onAnswer(answer);
    setAnswer('');
  };

  const currentEvaluation = history.length > 0 ? history[history.length - 1].evaluation : null;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
              Live Session
            </span>
            <span className="text-sm font-semibold text-slate-400">Persona: {tone}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {currentQuestion?.type === 'Technical' ? 'Technical Challenge' : 
             currentQuestion?.type === 'HR' ? 'Behavioral / HR' : 'Deep Dive Follow-up'}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">Session Progress</div>
          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${Math.min(progress, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Question Display */}
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16C10.9124 16 10.017 16.8954 10.017 18L10.017 21H14.017ZM12.017 0C13.1216 0 14.017 0.895431 14.017 2V5C14.017 6.10457 13.1216 7 12.017 7C10.9124 7 10.017 6.10457 10.017 5V2C10.017 0.895431 10.9124 0 12.017 0ZM12.017 9C15.3307 9 18.017 11.6863 18.017 15C18.017 18.3137 15.3307 21 12.017 21C8.70329 21 6.017 18.3137 6.017 15C6.017 11.6863 8.70329 9 12.017 9Z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4">Interviewer:</p>
            <h3 className="text-2xl font-bold text-slate-800 leading-relaxed mb-8">
              {isEvaluating ? 'Interviewer is thinking...' : currentQuestion?.text}
            </h3>
            
            <div className="relative">
              <textarea 
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
                disabled={isEvaluating}
                placeholder="Type your answer here... (Cmd+Enter to submit)"
                className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none text-lg text-slate-700"
              />
              {isEvaluating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-slate-100">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce" />
                    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce delay-100" />
                    <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce delay-200" />
                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest ml-2">Evaluating...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <p className="text-xs text-slate-400 font-medium">Be specific, use the STAR method where possible.</p>
              <div className="flex gap-4">
                <button 
                  onClick={onFinish}
                  className="px-6 py-3 text-slate-400 font-bold hover:text-red-500 transition-colors"
                >
                  End Session Early
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isEvaluating}
                  className={`px-10 py-4 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 ${
                    answer.trim() && !isEvaluating 
                      ? 'bg-slate-900 text-white hover:bg-black shadow-xl' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Submit Answer 
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Feedback Display of Previous Answer */}
          {currentEvaluation && !isEvaluating && (
            <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100">
                    {currentEvaluation.score}%
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Interviewer Reaction</h4>
                    <p className="text-sm text-slate-500">How your last answer was perceived</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                  currentEvaluation.score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {currentEvaluation.score > 80 ? 'Exceptional' : 'Solid Effort'}
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed italic mb-6">
                "{currentEvaluation.feedback}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Keep Doing</p>
                  <p className="text-sm text-slate-600">The interviewer appreciated your specific mention of technologies and metrics.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Improve On</p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {currentEvaluation.improvementTips.slice(0, 2).map((tip: string, i: number) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
