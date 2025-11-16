<<<<<<< HEAD
from typing import Optional, List, Dict, Any, Union
import openai
from dataclasses import dataclass
from enum import Enum

class TeachingStyle(Enum):
    VISUAL = "visual"  # Heavy on diagrams and animations
    PRACTICAL = "practical"  # Focus on real-world examples
    SYSTEMATIC = "systematic"  # Step by step explanations
    INTERACTIVE = "interactive"  # Lots of questions and engagement
    ANALYTICAL = "analytical"  # Deep dive with detailed analysis

@dataclass
class QuizQuestion:
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str
    topic_area: str

class QuizGenerator:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key

    async def generate_quiz(self, content: str, num_questions: int = 5) -> List[QuizQuestion]:
        """Generate interactive quiz questions based on content"""
        prompt = f"""Generate {num_questions} multiple-choice questions about this content:
{content}

For each question include:
1. The question
2. Four possible answers
3. The index of the correct answer (0-3)
4. A brief explanation
5. Difficulty level (easy/medium/hard)
6. Topic area

Format as JSON."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert quiz creator."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            quiz_data = response.choices[0].message.content
            # Parse JSON and convert to QuizQuestion objects
            quiz_json = json.loads(quiz_data)
            
            questions = []
            for q in quiz_json["questions"]:
                questions.append(QuizQuestion(
                    question=q["question"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    explanation=q["explanation"],
                    difficulty=q["difficulty"],
                    topic_area=q["topic_area"]
                ))
            
            return questions
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []

class LearningPathGenerator:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key

    async def generate_learning_path(
        self,
        content: str,
        style: TeachingStyle,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Generate a personalized learning path for the content"""
        prompt = f"""Create a learning path for this content:
{content}

Teaching Style: {style.value}
Difficulty: {difficulty}

Include:
1. Learning objectives
2. Key concepts in order
3. Practice exercises
4. Real-world applications
5. Review points
6. Estimated time per section

Format as JSON."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educational content designer."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error generating learning path: {e}")
            return {}
=======
from typing import Optional, List, Dict, Any, Union
import openai
from dataclasses import dataclass
from enum import Enum

class TeachingStyle(Enum):
    VISUAL = "visual"  # Heavy on diagrams and animations
    PRACTICAL = "practical"  # Focus on real-world examples
    SYSTEMATIC = "systematic"  # Step by step explanations
    INTERACTIVE = "interactive"  # Lots of questions and engagement
    ANALYTICAL = "analytical"  # Deep dive with detailed analysis

@dataclass
class QuizQuestion:
    question: str
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str
    topic_area: str

class QuizGenerator:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key

    async def generate_quiz(self, content: str, num_questions: int = 5) -> List[QuizQuestion]:
        """Generate interactive quiz questions based on content"""
        prompt = f"""Generate {num_questions} multiple-choice questions about this content:
{content}

For each question include:
1. The question
2. Four possible answers
3. The index of the correct answer (0-3)
4. A brief explanation
5. Difficulty level (easy/medium/hard)
6. Topic area

Format as JSON."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert quiz creator."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            quiz_data = response.choices[0].message.content
            # Parse JSON and convert to QuizQuestion objects
            quiz_json = json.loads(quiz_data)
            
            questions = []
            for q in quiz_json["questions"]:
                questions.append(QuizQuestion(
                    question=q["question"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    explanation=q["explanation"],
                    difficulty=q["difficulty"],
                    topic_area=q["topic_area"]
                ))
            
            return questions
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []

class LearningPathGenerator:
    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            openai.api_key = api_key

    async def generate_learning_path(
        self,
        content: str,
        style: TeachingStyle,
        difficulty: str = "medium"
    ) -> Dict[str, Any]:
        """Generate a personalized learning path for the content"""
        prompt = f"""Create a learning path for this content:
{content}

Teaching Style: {style.value}
Difficulty: {difficulty}

Include:
1. Learning objectives
2. Key concepts in order
3. Practice exercises
4. Real-world applications
5. Review points
6. Estimated time per section

Format as JSON."""

        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert educational content designer."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error generating learning path: {e}")
            return {}
>>>>>>> fc8ed2a6ee76667dd0759a129f0149acc56be76e
