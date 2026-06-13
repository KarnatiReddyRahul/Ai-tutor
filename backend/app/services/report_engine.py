import json
import re
from typing import Any, Dict, List
from app.db.models import SessionTurn
from app.schemas.schemas import ReportResponse, RoadmapWeek
from app.services.ai.base import BaseLLMProvider

class ReportEngine:
    @staticmethod
    async def generate_report(
        provider: BaseLLMProvider,
        topic: str,
        language: str,
        turns: List[SessionTurn]
    ) -> Dict[str, Any]:
        """
        Analyzes the complete session history and returns a dictionary matching
        the structured Report data model, translated into the target language.
        """
        lang_map = {
            "en": "English",
            "hi": "Hindi (हिंदी)",
            "te": "Telugu (తెలుగు)"
        }
        target_lang = lang_map.get(language.lower(), language)

        # Build conversation transcript to show the AI
        transcript = ""
        for turn in turns:
            transcript += f"Turn {turn.turn_number}:\n"
            transcript += f"Question Asked: {turn.question_text}\n"
            transcript += f"Student Answer: {turn.answer_text or ''}\n"
            transcript += f"Score: {turn.score or 0}/100\n"
            transcript += f"Correctness Details: {turn.correctness or ''}\n"
            transcript += f"Completeness Details: {turn.completeness or ''}\n"
            transcript += f"Missing Concepts: {', '.join(turn.missing_concepts or [])}\n"
            transcript += f"Misconceptions: {', '.join(turn.misconceptions or [])}\n"
            transcript += "---\n"

        system_prompt = (
            "You are a senior educational architect and student diagnostic expert. "
            "Based on the transcript of the student's answers, write a comprehensive diagnostic assessment report.\n\n"
            f"Topic Analyzed: {topic}\n"
            f"Language: You MUST write the text values of all fields (summary, keys of skill_xray, strengths, weak_areas, title/description in roadmap) ONLY in {target_lang}. "
            f"If {target_lang} is Hindi or Telugu, use native script (Devanagari or Telugu script).\n\n"
            "You MUST return a valid JSON object matching the following structure exactly:\n"
            "{\n"
            "  \"summary\": \"A high-level paragraph assessing the student's overall understanding, strengths, and areas needing development.\",\n"
            "  \"skill_xray\": {\n"
            "     \"Subconcept Name\": 85.0, // key: sub-concept name, value: float percentage (0 to 100)\n"
            "     \"Another Subconcept\": 40.0\n"
            "  },\n"
            "  \"strengths\": [\"Strength description 1\", \"Strength description 2\"],\n"
            "  \"weak_areas\": [\"Weak area description 1\", \"Weak area description 2\"],\n"
            "  \"roadmap\": [\n"
            "     {\n"
            "       \"week\": 1,\n"
            "       \"title\": \"Week 1 Study Topic\",\n"
            "       \"description\": \"Step-by-step actions and resources the student should study to bridge their gaps.\"\n"
            "     }\n"
            "  ] // create a 3 to 4 week customized study roadmap\n"
            "}\n\n"
            "Do not output any introductory or conversational text, only the raw JSON object. Do not wrap it in markdown code blocks."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Here is the student's session transcript:\n{transcript}\n\nGenerate the diagnostic report in JSON."}
        ]

        raw_response = await provider.generate_response(messages=messages, json_mode=True)

        try:
            parsed_data = ReportEngine._parse_json(raw_response)
            
            # Basic sanitization and structural checks
            return {
                "summary": str(parsed_data.get("summary", "")),
                "skill_xray": {str(k): float(v) for k, v in parsed_data.get("skill_xray", {}).items()},
                "strengths": list(parsed_data.get("strengths", [])),
                "weak_areas": list(parsed_data.get("weak_areas", [])),
                "roadmap": [
                    {
                        "week": int(w.get("week", i + 1)),
                        "title": str(w.get("title", "")),
                        "description": str(w.get("description", ""))
                    }
                    for i, w in enumerate(parsed_data.get("roadmap", []))
                ]
            }
        except Exception as exc:
            # Fallback report if parsing fails
            return {
                "summary": f"[JSON Parsing Error] The session was completed successfully, but the LLM report structure could not be parsed automatically. Topic: {topic}",
                "skill_xray": {
                    "Core Concepts": 50.0
                },
                "strengths": ["Completed the assessment session"],
                "weak_areas": ["Manual review required due to system formatting error"],
                "roadmap": [
                    {
                        "week": 1,
                        "title": "Review Session Questions",
                        "description": "Look back at the questions asked during the session to identify areas of difficulty."
                    }
                ]
            }

    @staticmethod
    def _parse_json(content: str) -> Dict:
        content = content.strip()
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # If wrapped in markdown code blocks
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Attempt to find the first '{' and last '}'
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(content[start:end+1])
            except json.JSONDecodeError:
                pass

        raise ValueError("Could not parse JSON from model response")
