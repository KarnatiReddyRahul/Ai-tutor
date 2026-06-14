import json
import re
from typing import Any, Dict, List, Optional, Tuple
from app.db.models import LearningRoadmap, LearningModule, Report, SessionTurn, SessionModel
from app.schemas.schemas import ReportResponse, RoadmapWeek
from app.services.ai.base import BaseLLMProvider


class LearningEngine:
    @staticmethod
    async def generate_roadmap(
        provider: BaseLLMProvider,
        report: Report,
        session: SessionModel,
        turns: List[SessionTurn]
    ) -> Dict[str, Any]:
        lang_map = {"en": "English", "hi": "Hindi", "te": "Telugu"}
        target_lang = lang_map.get(session.language.lower(), "English")

        transcript = ""
        for turn in turns:
            transcript += f"Turn {turn.turn_number}: Q: {turn.question_text} A: {turn.answer_text or ''} Score: {turn.score or 0}\n"

        system_prompt = (
            "You are an expert curriculum designer creating a personalized learning roadmap. "
            f"Student overall score: {session.overall_score:.0f}%\n"
            f"Strengths: {', '.join(report.strengths)}\n"
            f"Weak areas: {', '.join(report.weak_areas)}\n"
            f"Skill X-Ray: {json.dumps(report.skill_xray)}\n\n"
            f"Create a detailed 4-week study roadmap in {target_lang}. "
            "Each week should focus on the weak areas and build toward mastery. "
            "Return valid JSON:\n"
            "{\n"
            '  "modules": [\n'
            "    {\n"
            '      "week_number": 1,\n'
            '      "title": "Week title",\n'
            '      "description": "What to study this week",\n'
            '      "focus_area": "Specific weak concept to cover",\n'
            '      "difficulty": "beginner|intermediate|advanced"\n'
            "    }\n"
            "  ]\n"
            "}\n"
            "Output ONLY the JSON. No markdown."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate a personalized roadmap for {session.topic} based on this assessment."}
        ]

        raw = await provider.generate_response(messages=messages, json_mode=True)
        parsed = LearningEngine._parse_json(raw)
        return parsed

    @staticmethod
    async def generate_module_content(
        provider: BaseLLMProvider,
        module: LearningModule,
        topic: str,
        language: str
    ) -> Dict[str, str]:
        lang_map = {"en": "English", "hi": "Hindi (हिंदी)", "te": "Telugu (తెలుగు)"}
        target_lang = lang_map.get(language.lower(), "English")

        system_prompt = (
            "You are an expert tutor creating learning content. "
            f"Topic: {topic}\n"
            f"Module: {module.title}\n"
            f"Focus: {module.focus_area}\n"
            f"Difficulty: {module.difficulty}\n"
            f"Language: {target_lang}\n\n"
            "Generate complete learning content as JSON with these fields:\n"
            "{\n"
            '  "concept_explanation": "Clear explanation of the concept with simple language",\n'
            '  "examples": "3-4 practical examples with code or real-world scenarios",\n'
            '  "practice_exercises": "3-4 practice exercises with hints",\n'
            '  "quiz_questions": "5 multiple-choice quiz questions in format: Q: ... A) ... B) ... C) ... D: ... | Correct: A",\n'
            '  "revision_notes": "Key points summary for quick revision"\n'
            "}\n"
            "Output ONLY valid JSON. No markdown."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate learning content for {module.title} at {module.difficulty} level."}
        ]

        raw = await provider.generate_response(messages=messages, json_mode=True)
        parsed = LearningEngine._parse_json(raw)
        return {
            "concept_explanation": parsed.get("concept_explanation", ""),
            "examples": parsed.get("examples", ""),
            "practice_exercises": parsed.get("practice_exercises", ""),
            "quiz_questions": parsed.get("quiz_questions", ""),
            "revision_notes": parsed.get("revision_notes", "")
        }

    @staticmethod
    async def generate_revision_content(
        provider: BaseLLMProvider,
        module: LearningModule,
        topic: str,
        language: str
    ) -> Dict[str, str]:
        lang_map = {"en": "English", "hi": "Hindi (हिंदी)", "te": "Telugu (తెలుగు)"}
        target_lang = lang_map.get(language.lower(), "English")

        system_prompt = (
            "You are a tutor helping a student revise a topic they scored poorly on. "
            f"Topic: {topic}\n"
            f"Module: {module.title}\n"
            f"Focus: {module.focus_area}\n"
            f"Language: {target_lang}\n\n"
            "Create simplified revision content as JSON:\n"
            "{\n"
            '  "concept_explanation": "Simplified explanation focusing on the basics",\n'
            '  "examples": "Simple step-by-step examples",\n'
            '  "practice_exercises": "3 basic practice exercises with step-by-step solutions",\n'
            '  "quiz_questions": "3 simple quiz questions with answers",\n'
            '  "revision_notes": "Bullet-point summary of key concepts"\n'
            "}\n"
            "Output ONLY valid JSON. No markdown."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate revision content for {module.title} (student needs improvement)."}
        ]

        raw = await provider.generate_response(messages=messages, json_mode=True)
        parsed = LearningEngine._parse_json(raw)
        return {
            "concept_explanation": parsed.get("concept_explanation", ""),
            "examples": parsed.get("examples", ""),
            "practice_exercises": parsed.get("practice_exercises", ""),
            "quiz_questions": parsed.get("quiz_questions", ""),
            "revision_notes": parsed.get("revision_notes", "")
        }

    @staticmethod
    async def search_concept(
        provider: BaseLLMProvider,
        query: str,
        topic: str,
        difficulty: str,
        language: str
    ) -> Dict[str, str]:
        lang_map = {"en": "English", "hi": "Hindi (हिंदी)", "te": "Telugu (తెలుగు)"}
        target_lang = lang_map.get(language.lower(), "English")

        system_prompt = (
            "You are a knowledgeable tutor. Explain the concept clearly at the student's level. "
            f"Difficulty: {difficulty}\n"
            f"Topic context: {topic}\n"
            f"Language: {target_lang}\n\n"
            "Return JSON:\n"
            "{\n"
            '  "explanation": "Clear explanation suitable for the difficulty level",\n'
            '  "examples": "Relevant examples if applicable"\n'
            "}\n"
            "Output ONLY valid JSON. No markdown."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Explain: {query}"}
        ]

        raw = await provider.generate_response(messages=messages, json_mode=True)
        parsed = LearningEngine._parse_json(raw)
        return {
            "explanation": parsed.get("explanation", ""),
            "examples": parsed.get("examples", "")
        }

    @staticmethod
    async def chat_with_context(
        provider: BaseLLMProvider,
        question: str,
        history: List[Dict[str, str]],
        topic: str,
        focus_area: str,
        module_title: str,
        weak_areas: List[str],
        strengths: List[str],
        overall_score: float,
        language: str
    ) -> str:
        lang_map = {"en": "English", "hi": "Hindi (हिंदी)", "te": "Telugu (తెలుగు)"}
        target_lang = lang_map.get(language.lower(), "English")

        system_prompt = (
            "You are a personalized AI tutor with full context of the student's learning journey. "
            f"Topic: {topic}\n"
            f"Current module: {module_title}\n"
            f"Focus area: {focus_area}\n"
            f"Student overall score: {overall_score:.0f}%\n"
            f"Strengths: {', '.join(strengths)}\n"
            f"Weak areas: {'; '.join(weak_areas)}\n"
            f"Language: {target_lang}\n\n"
            "Rules:\n"
            "1. Be aware of the student's weak areas and tailor explanations to strengthen them.\n"
            "2. Use simple language and real-world examples.\n"
            "3. If the student asks about something outside the current module, answer based on their level.\n"
            "4. Be encouraging and supportive.\n"
            "5. Answer ONLY in the specified language.\n"
            "6. Keep responses conversational and clear."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        messages.append({"role": "user", "content": question})

        response = await provider.generate_response(messages=messages, json_mode=False)
        return response.strip()

    @staticmethod
    def _parse_json(content: str) -> Dict:
        content = content.strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(content[start:end+1])
            except json.JSONDecodeError:
                pass
        raise ValueError("Could not parse JSON from model response")
