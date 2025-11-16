import os
from openai import OpenAI
from config import settings

# Initialize OpenAI client with API key from config or environment
api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY must be set in environment variables or config")

client = OpenAI(api_key=api_key)

def generate_fused_notes(module_code, chapters, lecture_transcript, textbook_content, detail_level):
    prompt = f"""
You are an expert academic assistant. I'm giving you two inputs: a lecture transcript and textbook excerpts. Merge them into a coherent set of study notes for {module_code}.

Requirements:
- Use only these textbook chapters: {chapters}.
- Structure notes with clear section headings, bullet points, important formulas (in LaTeX or clear math), and illustrative examples.
- Highlight key definitions.
- Provide a brief summary at the end of each section.
- Tag the source of each bullet as [Lecture] or [Book] if both contributed.
- After notes, generate 3 practice questions with answers for each major section.
- Estimate approximate study time assuming 200 words/min reading speed.

Lecture Transcript:
{lecture_transcript}

Textbook Content:
{textbook_content}
"""
    # Use model from config if available, otherwise default to gpt-4
    model = settings.AI_MODEL or "gpt-4"
    temperature = settings.AI_TEMPERATURE if settings.AI_TEMPERATURE is not None else 0.3
    max_tokens = settings.MAX_TOKENS or 2000
    
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content
