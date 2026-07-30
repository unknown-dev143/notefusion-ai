import React, { useState } from 'react';
import { FileText, Calendar, BookOpen, Briefcase, GraduationCap, Heart, Lightbulb, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  content: string;
  tags: string[];
}

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates: Template[] = [
    // Academic Templates
    {
      id: 'lecture-notes',
      name: 'Lecture Notes',
      description: 'Structured template for class lectures',
      icon: <GraduationCap size={20}/>,
      category: 'academic',
      tags: ['lecture', 'class', 'study'],
      content: `# Lecture Notes - [Subject]

**Date**: ${new Date().toLocaleDateString()}
**Professor**: [Name]
**Topic**: [Main Topic]

## Key Concepts
- 
- 
- 

## Detailed Notes

### Section 1: [Title]


### Section 2: [Title]


## Questions
- 
- 

## Action Items
- [ ] Review slides
- [ ] Complete practice problems
- [ ] Read chapter [X]

## Summary
[Brief summary of main takeaways]

---
Tags: #lecture #[subject]`
    },
    {
      id: 'study-guide',
      name: 'Study Guide',
      description: 'Comprehensive exam preparation template',
      icon: <BookOpen size={20}/>,
      category: 'academic',
      tags: ['exam', 'study', 'review'],
      content: `# Study Guide - [Subject/Exam]

**Exam Date**: [Date]
**Coverage**: [Chapters/Topics]

## Topics to Master

### Topic 1: [Name]
**Importance**: ⭐⭐⭐⭐⭐
**Status**: 🔴 Not Started / 🟡 In Progress / 🟢 Mastered

**Key Points**:
- 
- 

**Practice Problems**:
- [ ] Problem set 1
- [ ] Problem set 2

---

### Topic 2: [Name]
**Importance**: ⭐⭐⭐⭐
**Status**: 🔴 Not Started

**Key Points**:
- 
- 

## Formulas & Definitions

| Term | Definition | Example |
|------|------------|---------|
|      |            |         |

## Practice Questions
1. 
2. 
3. 

## Study Schedule
- [ ] Day 1: [Topics]
- [ ] Day 2: [Topics]
- [ ] Day 3: Review

---
Tags: #study-guide #exam #[subject]`
    },
    {
      id: 'research-paper',
      name: 'Research Paper',
      description: 'Academic research paper outline',
      icon: <FileText size={20}/>,
      category: 'academic',
      tags: ['research', 'paper', 'writing'],
      content: `# Research Paper - [Title]

**Author**: [Your Name]
**Date**: ${new Date().toLocaleDateString()}
**Course**: [Course Name]

## Abstract
[150-250 word summary]

## 1. Introduction

### Background
[Context and background information]

### Research Question
[Main research question or thesis]

### Significance
[Why this research matters]

## 2. Literature Review

### Previous Research
- **Author (Year)**: [Summary]
- **Author (Year)**: [Summary]

### Research Gap
[What's missing in current research]

## 3. Methodology

### Approach
[Research methods used]

### Data Collection
[How data was gathered]

## 4. Results

### Finding 1
[Description and analysis]

### Finding 2
[Description and analysis]

## 5. Discussion

### Interpretation
[What the results mean]

### Limitations
[Study limitations]

## 6. Conclusion

### Summary
[Key takeaways]

### Future Research
[Suggestions for future work]

## References
1. 
2. 
3. 

---
Tags: #research #paper #academic`
    },
    // Productivity Templates
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Professional meeting documentation',
      icon: <Briefcase size={20}/>,
      category: 'productivity',
      tags: ['meeting', 'work', 'notes'],
      content: `# Meeting Notes

**Date**: ${new Date().toLocaleDateString()}
**Time**: [Start Time] - [End Time]
**Attendees**: [Names]
**Location**: [Room/Virtual]

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1: [Title]
**Discussed**:
- 
- 

**Decisions Made**:
- 
- 

### Topic 2: [Title]
**Discussed**:
- 
- 

## Action Items

| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
|      |       |          | ⬜     |
|      |       |          | ⬜     |

## Next Steps
- [ ] 
- [ ] 

## Next Meeting
**Date**: [Date]
**Topics**: [Preview]

---
Tags: #meeting #work`
    },
    {
      id: 'project-plan',
      name: 'Project Plan',
      description: 'Project planning and tracking',
      icon: <Calendar size={20}/>,
      category: 'productivity',
      tags: ['project', 'planning', 'management'],
      content: `# Project Plan - [Project Name]

**Start Date**: ${new Date().toLocaleDateString()}
**End Date**: [Target Date]
**Status**: 🔴 Planning / 🟡 In Progress / 🟢 Complete

## Project Overview

### Objective
[What you're trying to achieve]

### Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

### Success Criteria
- 
- 

## Timeline

### Phase 1: Planning (Week 1-2)
- [ ] Task 1
- [ ] Task 2

### Phase 2: Execution (Week 3-6)
- [ ] Task 1
- [ ] Task 2

### Phase 3: Review (Week 7)
- [ ] Task 1
- [ ] Task 2

## Resources Needed
- 
- 

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
|      | High   |            |

## Progress Log

**${new Date().toLocaleDateString()}**: Project initiated

---
Tags: #project #planning`
    },
    // Personal Templates
    {
      id: 'daily-journal',
      name: 'Daily Journal',
      description: 'Daily reflection and planning',
      icon: <Heart size={20}/>,
      category: 'personal',
      tags: ['journal', 'daily', 'reflection'],
      content: `# Daily Journal - ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Morning Reflection

### Gratitude
I'm grateful for:
1. 
2. 
3. 

### Today's Intention
[What I want to focus on today]

## Daily Log

### Accomplishments
- ✅ 
- ✅ 

### Challenges
- 
- 

### Learnings
- 💡 
- 💡 

## Evening Reflection

### What Went Well
- 
- 

### What Could Be Better
- 
- 

### Tomorrow's Priorities
1. [ ] 
2. [ ] 
3. [ ] 

## Mood & Energy
**Mood**: 😊 / 😐 / 😔
**Energy**: ⚡⚡⚡⚡⚡ (5/5)

---
Tags: #daily #journal #reflection`
    },
    {
      id: 'brainstorm',
      name: 'Brainstorm Session',
      description: 'Creative ideation and brainstorming',
      icon: <Lightbulb size={20}/>,
      category: 'personal',
      tags: ['brainstorm', 'ideas', 'creative'],
      content: `# Brainstorm - [Topic]

**Date**: ${new Date().toLocaleDateString()}
**Goal**: [What you're brainstorming]

## Initial Ideas

### Idea 1: [Title]
**Description**: 
**Pros**: 
**Cons**: 
**Rating**: ⭐⭐⭐⭐⭐

### Idea 2: [Title]
**Description**: 
**Pros**: 
**Cons**: 
**Rating**: ⭐⭐⭐⭐

### Idea 3: [Title]
**Description**: 
**Pros**: 
**Cons**: 
**Rating**: ⭐⭐⭐

## Wild Ideas
(No judgment zone!)
- 
- 
- 

## Combinations
What if we combined...
- 
- 

## Next Steps
- [ ] Research idea #[X]
- [ ] Prototype idea #[Y]
- [ ] Get feedback on idea #[Z]

## Resources Needed
- 
- 

---
Tags: #brainstorm #ideas #creative`
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'academic', name: 'Academic', count: templates.filter(t => t.category === 'academic').length },
    { id: 'productivity', name: 'Productivity', count: templates.filter(t => t.category === 'productivity').length },
    { id: 'personal', name: 'Personal', count: templates.filter(t => t.category === 'personal').length },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    toast.success(`Template "${template.name}" applied!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-[48px] p-12 max-w-6xl w-full shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Template Library</h2>
            <p className="text-sm text-slate-400 font-medium">Start with a pre-built template</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all group"
          >
            <X size={20} className="text-slate-400 group-hover:text-slate-600"/>
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name} <span className="opacity-60">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] hover:border-blue-500 hover:shadow-xl transition-all group text-left"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  {template.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{template.name}</h3>
                <p className="text-sm text-slate-600 font-medium mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-[32px]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <p className="text-sm font-black text-blue-900 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Templates are fully customizable! Edit the content to match your needs, and the AI can help you expand any section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
