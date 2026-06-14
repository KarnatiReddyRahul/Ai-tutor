# AI Reverse Tutor

[![AGPLv3 License](https://img.shields.io/badge/License-AGPLv3-blue.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)

AI-powered learning assessment platform that evaluates understanding by asking adaptive questions — following the Feynman learning principle.

## Quick Start

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r ../requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and start an interview.

## Features

- **Adaptive Reverse Tutoring** — AI interviews you on any topic, adjusting difficulty in real time
- **Knowledge Gap Detection** — Identifies strong/weak areas and misconceptions
- **Skill X-Ray Dashboard** — Visual breakdown of skill levels
- **Personalized Learning Roadmaps** — Week-by-week study plans
- **Multi-Language** — English, Telugu, Hindi
- **Multiple AI Providers** — Ollama (local), Gemini, Groq (BYOK)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, Python, SQLite, SQLModel |
| AI | Ollama, Google Gemini, Groq |

## Project Structure

```
project-root/
├── backend/
│   └── app/          # FastAPI application
├── frontend/
│   └── src/          # React application
├── specs/            # Feature specs
├── .specify/         # Spec-Kit configuration
├── tests/            # Test suite
└── ...config files
```

## Development

```bash
# Install all dependencies
pip install -r requirements.txt   # Backend
cd frontend && npm install         # Frontend

# Run tests
pytest --cov=backend/app --cov-report=term-missing

# Lint & type check
ruff check .
mypy .

# Pre-commit
pre-commit install
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Documentation

- [User Manual](USER_MANUAL.md) — How to use the platform
- [Contributing](CONTRIBUTING.md) — Development guide
- [Security](SECURITY.md) — Reporting vulnerabilities
- [Code of Conduct](CODE_OF_CONDUCT.md) — Community standards
- [Changelog](CHANGELOG.md) — Release history
- [Agents](AGENTS.md) — AI provider documentation

## License

AGPLv3 — see [LICENSE](LICENSE).

## Vision

Transforming learning from passive consumption into active understanding.
