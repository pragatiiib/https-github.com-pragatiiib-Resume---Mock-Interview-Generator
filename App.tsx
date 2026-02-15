
import React, { useState, useCallback } from 'react';
import { 
  InterviewTone, 
  InterviewState, 
  Question, 
  RedFlag, 
  Evaluation 
} from './types';
import { 
  analyzeResume, 
  generateInitialQuestions, 
  evaluateAnswer 
} from './services/geminiService';
import Landing from './components/Landing';
import ResumeAnalysis from './components/ResumeAnalysis';
import InterviewSession from './components/InterviewSession';
import Header from './components/Header';

const App: React.FC = () => {
  const [state, setState] = useState<InterviewState>({
    resumeContent: '',
    tone: InterviewTone.FRIENDLY,
    redFlags: [],
    questions: [],
    currentQuestionIndex: -1,
    history: [],
    isAnalyzing: false,
    isEvaluating: false,
  });

  const [step, setStep] = useState<'landing' | 'analysis' | 'interview' | 'results'>('landing');

  const handleStartAnalysis = async (content: string, tone: InterviewTone) => {
    setState(prev => ({ ...prev, isAnalyzing: true, resumeContent: content, tone }));
    setStep('analysis');
    
    try {
      const flags = await analyzeResume(content);
      const initialQs = await generateInitialQuestions(content, tone);
      setState(prev => ({ 
        ...prev, 
        redFlags: flags, 
        questions: initialQs, 
        isAnalyzing: false 
      }));
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis.");
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const startInterview = () => {
    setState(prev => ({ ...prev, currentQuestionIndex: 0 }));
    setStep('interview');
  };

  const submitAnswer = async (answer: string) => {
    if (state.currentQuestionIndex === -1) return;
    
    setState(prev => ({ ...prev, isEvaluating: true }));
    const currentQ = state.questions[state.currentQuestionIndex];

    try {
      const evaluation = await evaluateAnswer(
        state.resumeContent,
        currentQ.text,
        answer,
        state.tone
      );

      const newHistoryItem = {
        question: currentQ,
        answer,
        evaluation
      };

      // Add follow-ups to the question queue if we want more depth
      const followUps: Question[] = evaluation.followUpQuestions.map((text, i) => ({
        id: `followup-${state.currentQuestionIndex}-${i}`,
        text,
        type: 'FollowUp'
      }));

      setState(prev => ({
        ...prev,
        isEvaluating: false,
        history: [...prev.history, newHistoryItem],
        // Insert follow-ups immediately after the current question
        questions: [
          ...prev.questions.slice(0, prev.currentQuestionIndex + 1),
          ...followUps,
          ...prev.questions.slice(prev.currentQuestionIndex + 1)
        ],
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));

      // Check if we've completed a reasonable number of questions (e.g. 10 total)
      if (state.history.length > 8) {
        setStep('results');
      }
    } catch (error) {
      console.error(error);
      alert("Error evaluating answer.");
      setState(prev => ({ ...prev, isEvaluating: false }));
    }
  };

  const reset = () => {
    setState({
      resumeContent: '',
      tone: InterviewTone.FRIENDLY,
      redFlags: [],
      questions: [],
      currentQuestionIndex: -1,
      history: [],
      isAnalyzing: false,
      isEvaluating: false,
    });
    setStep('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onReset={reset} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {step === 'landing' && (
          <Landing onStart={handleStartAnalysis} />
        )}

        {step === 'analysis' && (
          <ResumeAnalysis 
            redFlags={state.redFlags} 
            isLoading={state.isAnalyzing} 
            onStartInterview={startInterview}
          />
        )}

        {step === 'interview' && (
          <InterviewSession 
            currentQuestion={state.questions[state.currentQuestionIndex]}
            onAnswer={submitAnswer}
            isEvaluating={state.isEvaluating}
            progress={(state.currentQuestionIndex / 10) * 100}
            tone={state.tone}
            history={state.history}
            onFinish={() => setStep('results')}
          />
        )}

        {step === 'results' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Interview Performance Summary</h2>
              <p className="text-slate-500">Comprehensive breakdown of your session with the {state.tone} interviewer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Average Score</span>
                <div className="text-5xl font-black text-indigo-600">
                  {Math.round(state.history.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / (state.history.length || 1))}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
                <h3 className="font-semibold text-slate-800 mb-4">Key Improvement Areas</h3>
                <ul className="space-y-2">
                  {Array.from(new Set(state.history.flatMap(h => h.evaluation?.improvementTips || []))).slice(0, 5).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">Transcript & Deep Dive</h3>
              {state.history.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      (item.evaluation?.score || 0) > 80 ? 'bg-green-100 text-green-700' : 
                      (item.evaluation?.score || 0) > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      Score: {item.evaluation?.score}%
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-indigo-600 mb-1">Interviewer:</p>
                      <p className="text-slate-800 font-medium">{item.question.text}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500 mb-1">Your Answer:</p>
                      <p className="text-slate-700 italic">"{item.answer}"</p>
                    </div>
                    {item.evaluation && (
                      <div className="bg-indigo-50/50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-700 mb-1">AI Evaluation ({state.tone}):</p>
                        <p className="text-slate-700 text-sm mb-3">{item.evaluation.feedback}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.evaluation.improvementTips.map((tip, tIdx) => (
                            <span key={tIdx} className="bg-white border border-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs">
                              {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={reset}
                className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Start New Practice Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
