import httpx
from typing import Dict, List
from app.services.ai.base import BaseLLMProvider

class OllamaProvider(BaseLLMProvider):
    def __init__(self, model: str, base_url: str):
        self.model = model
        self.base_url = base_url.rstrip("/")

    async def generate_response(self, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7
            }
        }
        if json_mode:
            payload["format"] = "json"
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["message"]["content"]
            except httpx.HTTPError as exc:
                raise RuntimeError(f"Ollama API request failed: {exc}") from exc
            except (KeyError, ValueError) as exc:
                raise RuntimeError(f"Invalid response format from Ollama: {exc}") from exc
