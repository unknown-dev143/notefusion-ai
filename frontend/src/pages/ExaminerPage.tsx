import React from 'react';
import Examiner from '../components/Examiner';

const ExaminerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">The Examiner</h1>
          <p className="text-slate-500 font-medium">Take mock exams and test your knowledge</p>
        </div>
        <Examiner />
      </div>
    </div>
  );
};

export default ExaminerPage;
