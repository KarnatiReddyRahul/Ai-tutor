import httpx
from typing import Dict, List
from app.services.ai.base import BaseLLMProvider

class GroqProvider(BaseLLMProvider):
    def __init__(self, model: str, api_key: str):
        self.model = model
        self.api_key = api_key

    async def generate_response(self, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        # Fixed URL: was /openapi/ (404), now correct /openai/
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "temperature": 0.7
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except httpx.HTTPError as exc:
                error_detail = ""
                try:
                    error_detail = f" - {exc.response.json()}"
                except Exception:
                    pass
                raise RuntimeError(f"Groq API request failed: {exc}{error_detail}") from exc
            except (KeyError, IndexError, ValueError) as exc:
                raise RuntimeError(f"Invalid response format from Groq: {exc}") from exc
