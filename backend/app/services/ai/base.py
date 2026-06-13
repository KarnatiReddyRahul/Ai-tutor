from abc import ABC, abstractmethod
from typing import Dict, List

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, messages: List[Dict[str, str]], json_mode: bool = False) -> str:
        """
        Sends a conversation history (list of messages with role and content) to the LLM
        and returns the string response.
        If json_mode is True, requests that the output be a valid JSON object.
        """
        pass
