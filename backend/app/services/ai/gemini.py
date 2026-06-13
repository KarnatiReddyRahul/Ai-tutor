import httpx
from typing import Dict, List
from app.services.ai.base import BaseLLMProvider

class GeminiProvider(BaseLLMProvider):
    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key

    async def generate_response(self, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        # Normalize model name if needed
        model_name = self.model
        if not model_name.startswith("gemini-"):
            model_name = "gemini-1.5-flash"  # default fallback
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
        
        contents = []
        system_instruction = None
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                system_instruction = {
                    "parts": [{"text": content}]
                }
            elif role in ("user", "student"):
                contents.append({
                    "role": "user",
                    "parts": [{"text": content}]
                })
            else:  # assistant, model, or examiner
                contents.append({
                    "role": "model",
                    "parts": [{"text": content}]
                })
                
        payload = {
            "contents": contents
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction
            
        generation_config = {
            "temperature": 0.7
        }
        if json_mode:
            generation_config["responseMimeType"] = "application/json"
            
        payload["generationConfig"] = generation_config
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except httpx.HTTPError as exc:
                error_detail = ""
                try:
                    error_detail = f" - {exc.response.json()}"
                except Exception:
                    pass
                raise RuntimeError(f"Gemini API request failed: {exc}{error_detail}") from exc
            except (KeyError, IndexError, ValueError) as exc:
                raise RuntimeError(f"Invalid response format from Gemini: {exc}") from exc
