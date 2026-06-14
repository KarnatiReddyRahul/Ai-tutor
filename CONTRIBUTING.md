# Contributing to AI Reverse Tutor

## Getting Started

1. Clone the repo
2. Backend: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r ../requirements.txt`
3. Frontend: `cd frontend && npm install`
4. Copy `.env.example` to `.env` and fill in values

## Code Style

- Backend: Follow Ruff (PEP 8), run `ruff check .` before committing
- Frontend: ESLint + Prettier via Vite

## Pull Request Process

1. Ensure all tests pass: `pytest`
2. Run type checks: `mypy`
3. Update documentation if adding features
4. Add tests for new functionality
5. Keep coverage above 90%

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
