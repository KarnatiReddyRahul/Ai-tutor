from typing import List
from app.db.models import SessionTurn
from app.services.ai.base import BaseLLMProvider

class QuestionEngine:
    @staticmethod
    async def generate_next_question(
        provider: BaseLLMProvider,
        topic: str,
        language: str,
        turns: List[SessionTurn]
    ) -> str:
        """
        Generates the next adaptive question based on the topic, selected language,
        and past conversation history.
        """
        # Map language codes to readable names for LLM prompt
        lang_map = {
            "en": "English",
            "hi": "Hindi (हिंदी)",
            "te": "Telugu (తెలుగు)"
        }
        target_lang = lang_map.get(language.lower(), language)

        # Build System Prompt
        system_prompt = (
            "You are a rigorous, encouraging, and adaptive viva examiner and teacher. "
            "Your goal is to evaluate the student's depth of understanding of a topic using the Feynman Technique. "
            "The Feynman Technique states: 'If you cannot explain something simply, you do not understand it deeply.'\n\n"
            f"Topic: {topic}\n"
            f"Language: You MUST generate your question ONLY in {target_lang}. If {target_lang} is Hindi or Telugu, use native script (Devanagari or Telugu script).\n\n"
            "Rules for adaptive questioning:\n"
            "1. If this is the start of the interview, ask a broad introductory question about the topic.\n"
            "2. If prior history is provided, analyze the student's latest response and its score:\n"
            "   - If the student scored HIGH (>75), increase the difficulty. Ask them to explain a deeper concept, write a syntax sample (if coding), or explain a corner case.\n"
            "   - If the student scored LOW (<50), decrease the difficulty. Ask a simpler question, ask for a real-world analogy, or ask them to define a core term.\n"
            "   - If the student scored in the middle (50-75), ask a clarifying question about the parts they missed or got wrong.\n"
            "3. Ask exactly ONE clear, concise question at a time. Do not ask multiple questions at once.\n"
            "4. Do not prefix your response with conversational remarks like 'Here is your next question:' or 'Excellent job!'. "
            "Output ONLY the question text directly. Do not include metadata, explanation, or introductions."
        )

        # Build conversation history
        messages = [
            {"role": "system", "content": system_prompt}
        ]

        if not turns:
            # First question
            messages.append({
                "role": "user", 
                "content": f"Please generate the initial question to test my knowledge on: '{topic}'."
            })
        else:
            # Format conversation history
            history_text = "Here is the conversation history so far:\n\n"
            for turn in turns:
                history_text += f"Turn {turn.turn_number}:\n"
                history_text += f"Examiner Question: {turn.question_text}\n"
                if turn.answer_text:
                    history_text += f"Student Answer: {turn.answer_text}\n"
                    history_text += f"Evaluation Score: {turn.score or 0}/100\n"
                    history_text += f"Evaluation Feedback: {turn.correctness or ''} | Gaps: {', '.join(turn.missing_concepts or [])}\n"
                history_text += "---\n"
            
            history_text += "\nGenerate the next adaptive question now."
            
            messages.append({
                "role": "user",
                "content": history_text
            })

        response = await provider.generate_response(messages=messages, json_mode=False)
        return response.strip()
