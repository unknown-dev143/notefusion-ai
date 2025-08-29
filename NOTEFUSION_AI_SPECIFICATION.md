# NoteFusion AI - Complete Feature Specification

## 🎯 Full Feature Summary for Rebuild (Exhaustive)

### 1. **Inputs & Capture**

* Multi-file upload: PDFs, lecture slides/text, audio/video.
* Live in-class **voice recorder** (MediaRecorder) that sends chunked audio to backend.
* **Automatic transcription** of audio/video via Whisper (live chunks + batch).
* **Editable transcript** UI with timestamps (ability to correct).
* (Optional) **Speaker diarization** to label different voices.
* Textbook excerpt input (manual paste or file) for fusion.

### 2. **Fusion & Note Generation**

* Merge lecture transcript + textbook excerpts into coherent notes.
* Source tagging per bullet: `[Lecture]` / `[Book]`.
* Structured notes: clear headings, bullet points, important formulas (LaTeX/plain), illustrative examples.
* Highlight key definitions.
* Section summaries / "key takeaways."
* **Practice question generation** (e.g., 3 questions per major section with answers).
* **Estimated study time** per section (based on word count / reading speed).
* Detail-level control (Concise / Standard / In-depth).
* Timed or on-demand regeneration (e.g., every N minutes or manual).
* Module code & chapter selector (e.g., ENGG1103, specified chapters).

### 3. **Annotation & Visualization**

* Integrated **drawing/annotation canvas** (freehand sketches, diagrams) alongside notes.
* Save/load sketches, attach to sessions.
* Ability to embed diagrams with notes on export (PDF/Markdown).

### 4. **Enhancements & Productivity**

* **Auto-summary intervals** (live summary of recent content).
* **Revision scheduling** / simple spaced repetition hints (optional).
* **Semantic/full-text search** across transcripts and generated notes.
* **Flashcard export** (Anki-style Q&A from generated questions).
* **Version history** for notes (diffs between edits).
* Export formats: Markdown, PDF (with diagrams), plain text, structured JSON.
* Clean, user-friendly UI with live status (next auto-update countdown, last transcription time).
* Auto-generation toggle with interval control.
* Ability to combine multiple lectures/textbook sources in one session.
* Session management (transcript + textbook + diagrams per session).

### 5. **Backend Core**

* FastAPI (or Flask) service.
* Whisper for transcription.
* PyMuPDF for PDF extraction.
* OpenAI GPT-4 fusion engine with prompt template.
* Prompt includes: module code, chapters, lecture + textbook content, requirements (tagging, summaries, questions, study-time).
* Markdown-to-PDF conversion (WeasyPrint or fallback).
* Caching transcripts to avoid redundant reprocessing.

### 6. **Frontend Core**

* React + Tailwind (or equivalent) layout.
* File uploader component.
* VoiceRecorder component.
* DiagramCanvas component (e.g., react-canvas-draw or Konva).
* Controls: module/chapter input, detail-level slider, generate-now button, auto interval toggle.
* Notes display panel with source labels and editing.
* Export buttons for PDF/MD.
* Live updating from timed triggers.

### 7. **Optional Stretch / Future**

* Collaboration (shareable notes, live share).
* Adaptive learning feedback (highlight weak areas based on missed practice questions).
* Confidence or overlap indicators if content appears in both lecture/book.

---

## ✅ Summary: What's New vs Original Summary

The earlier summary had the big picture (fusion, transcription, live recording, drawing canvas, exports, clean UI), but this expanded version adds/clarifies:

* Editable transcript
* Speaker diarization (optional)
* Flashcard export
* Revision scheduling / spaced repetition hints
* Semantic search
* Version history
* Practice question generation explicitly per section with answers
* Detail-level slider
* Live status indicators and auto-generation countdown

---

## 🚀 Usage Instructions

To rebuild NoteFusion AI from this specification:

1. **Copy this entire specification** into a new ChatGPT conversation
2. **Say**: "Rebuild NoteFusion AI from full spec" 
3. **Include this specification** in your message
4. The AI will use this comprehensive feature list to build the complete application

## 📁 Project Structure (Expected)

```
notefusion-ai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── models/
│   │   ├── services/
│   │   └── api/
│   └── venv/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── .vscode/
    └── tasks.json
```

## 🔧 Key Technologies

- **Backend**: FastAPI, Whisper, PyMuPDF, OpenAI GPT-4
- **Frontend**: React, Tailwind CSS, MediaRecorder API
- **Database**: SQLite (for sessions, transcripts, notes)
- **File Processing**: PDF extraction, audio transcription
- **AI**: OpenAI API for note fusion and question generation
- **Export**: Markdown, PDF, JSON formats

---

*This specification contains all features discussed and should be used as the complete reference for rebuilding NoteFusion AI.* 