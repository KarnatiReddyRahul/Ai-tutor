import json
import re
from typing import Dict, List
from app.schemas.schemas import EvaluationResult
from app.services.ai.base import BaseLLMProvider

class EvaluationEngine:
    @staticmethod
    async def evaluate_answer(
        provider: BaseLLMProvider,
        topic: str,
        language: str,
        question: str,
        answer: str
    ) -> EvaluationResult:
        """
        Evaluates a student's answer using the selected LLM and parses the result
        into an EvaluationResult object.
        """
        lang_map = {
            "en": "English",
            "hi": "Hindi (हिंदी)",
            "te": "Telugu (తెలుగు)"
        }
        target_lang = lang_map.get(language.lower(), language)

        system_prompt = (
            "You are an expert tutor evaluating a student's answer during a viva exam. "
            "Evaluate the student's answer against the question asked, focusing on their depth of understanding. "
            "Use the Feynman Principle to measure if they can explain it clearly.\n\n"
            f"Topic of Assessment: {topic}\n"
            f"Question Asked: {question}\n"
            f"Student Answer: {answer}\n\n"
            f"Language: You MUST write the content for all text fields (correctness, completeness, depth, missing_concepts, misconceptions) ONLY in {target_lang}. "
            f"If {target_lang} is Hindi or Telugu, write the string values using native scripts (Devanagari or Telugu script).\n\n"
            "You MUST respond with a valid JSON object matching the following structure exactly:\n"
            "{\n"
            "  \"score\": 85, // integer 0 to 100\n"
            "  \"correctness\": \"Explanation of what the student got right.\", // string\n"
            "  \"completeness\": \"Explanation of what parts of the question were answered or left out.\", // string\n"
            "  \"depth\": \"Analysis of whether they understand the concept deeply or just superficially.\", // string\n"
            "  \"missing_concepts\": [\"concept1\", \"concept2\"], // list of strings representing key sub-concepts they should have mentioned\n"
            "  \"misconceptions\": [\"misconception1\"] // list of strings representing incorrect statements they made (empty if none)\n"
            "}\n\n"
            "Do not output any introductory or conversational text, only the raw JSON object. Do not wrap it in markdown code blocks."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Evaluate this student answer:\n{answer}"}
        ]

        raw_response = await provider.generate_response(messages=messages, json_mode=True)
        
        # Parse and sanitize response
        try:
            parsed_data = EvaluationEngine._parse_json(raw_response)
            
            # Map values and format
            return EvaluationResult(
                score=int(parsed_data.get("score", 0)),
                correctness=str(parsed_data.get("correctness", "")),
                completeness=str(parsed_data.get("completeness", "")),
                depth=str(parsed_data.get("depth", "")),
                missing_concepts=list(parsed_data.get("missing_concepts", [])),
                misconceptions=list(parsed_data.get("misconceptions", []))
            )
        except Exception as exc:
            # Fallback if LLM output fails JSON parsing or validation
            # Create a simple default evaluation so the app doesn't crash
            return EvaluationResult(
                score=40,
                correctness="[Error parsing AI evaluation response. Reviewing manual feedback.]",
                completeness="[Error parsing AI evaluation response.]",
                depth="[Error parsing AI evaluation response.]",
                missing_concepts=["Unable to extract specific concepts due to JSON parsing failure."],
                misconceptions=[]
            )

    @staticmethod
    def _parse_json(content: str) -> Dict:
        content = content.strip()
        
        # Try basic json load first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # If it's wrapped in markdown code blocks (e.g. ```json ... ```)
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
