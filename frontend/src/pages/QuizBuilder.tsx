import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', answer: '' }]);

  const addQuestion = () => setQuestions([...questions, { question: '', answer: '' }]);
  const removeQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSave = () => {
    toast.success('Quiz saved (Simulation)');
    navigate('/testing-hub');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-black text-slate-900">Quiz <span className="text-blue-600">Architect</span></h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="mb-8">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quiz Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Advanced Neuroscience - Final"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-3xl relative group">
              <div className="grid gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Question {idx + 1}</label>
                  <input 
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[idx].question = e.target.value;
                      setQuestions(newQ);
                    }}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Correct Answer</label>
                  <input 
                    type="text"
                    value={q.answer}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[idx].answer = e.target.value;
                      setQuestions(newQ);
                    }}
                    className="w-full bg-white border-none rounded-xl py-3 px-4 font-bold text-slate-700"
                  />
                </div>
              </div>
              {questions.length > 1 && (
                <button 
                  onClick={() => removeQuestion(idx)}
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            onClick={addQuestion}
            className="flex-1 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Question
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Save size={20} /> Save Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
