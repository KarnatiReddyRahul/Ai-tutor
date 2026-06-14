# AI Agents

## Supported AI Providers

### Local Inference (Ollama)
- Llama 3
- Gemma
- Mistral

### Cloud (BYOK)
- Google Gemini
- Groq

## Agent Roles

- **Interviewer Agent**: Generates adaptive questions based on topic and student skill level
- **Evaluator Agent**: Assesses answer quality, detects misconceptions
- **Gap Analyzer Agent**: Identifies knowledge gaps from response patterns
- **Roadmap Agent**: Generates personalized week-by-week learning plans
- **Translator Agent**: Supports multilingual interviews (English, Telugu, Hindi)

## Provider Switching

Agents automatically fall back between cloud and local providers. Configure via environment variables in `.env`.
