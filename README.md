# AI Reverse Tutor

## Overview

AI Reverse Tutor is an AI-powered learning assessment platform that evaluates a student's understanding by asking adaptive questions instead of simply providing answers.

Unlike traditional AI tutors, AI Reverse Tutor follows the Feynman learning principle: if a student can explain a concept clearly, they truly understand it. The system conducts intelligent interviews, identifies knowledge gaps, generates skill assessments, and creates personalized learning roadmaps.

The application supports multiple AI providers, multilingual learning experiences, and both local and cloud-based AI inference.

---

## Problem Statement

Most AI learning tools focus on answering student questions.

This often creates an illusion of learning without verifying whether the student actually understands the concept.

AI Reverse Tutor solves this problem by:

* Asking adaptive questions
* Evaluating responses
* Identifying misconceptions
* Detecting knowledge gaps
* Creating personalized learning plans

---

## Key Features

### Adaptive Reverse Tutoring

The AI acts as an interviewer and asks topic-specific questions.

Example:

Topic: REST APIs

Question 1:
What is an API?

Question 2:
Can you explain the difference between GET and POST?

Question 3:
How does authentication work in REST APIs?

The difficulty adjusts dynamically based on student responses.

---

### Knowledge Gap Detection

The platform identifies:

* Strong concepts
* Weak concepts
* Missing knowledge areas
* Misconceptions

---

### Skill X-Ray Dashboard

Provides detailed skill assessment.

Example:

Python:

* Basics: 90%
* Functions: 85%
* OOP: 60%
* Decorators: 25%
* Async Programming: 10%

---

### Personalized Learning Roadmaps

Generates customized learning plans based on detected weaknesses.

Example:

Week 1:

* Python Functions
* Error Handling

Week 2:

* Object-Oriented Programming

Week 3:

* Decorators and Generators

Week 4:

* Async Programming

---

### Multi-Language Support

Supports:

* English
* Telugu
* Hindi

Implemented using internationalization (i18n) and localization (l10n) principles.

---

### Multiple AI Providers

#### Local AI

* Ollama
* Llama 3
* Gemma
* Mistral

#### BYOK (Bring Your Own Key)

Users can provide their own:

* Gemini API Key
* Groq API Key

---

### Assessment History

Stores previous assessments and allows users to track progress over time.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* FastAPI
* Python

### AI Providers

* Ollama
* Google Gemini
* Groq

### Database

* SQLite

### Internationalization

* react-i18next

### Charts and Visualization

* Recharts

---

## Project Architecture

Frontend (React)
|
|-- Topic Selection
|-- Interview Interface
|-- Skill Dashboard
|-- Learning Roadmap
|-- Assessment History
|
Backend (FastAPI)
|
|-- AI Provider Layer
|-- Adaptive Question Engine
|-- Answer Evaluation Engine
|-- Knowledge Gap Detector
|-- Roadmap Generator
|-- SQLite Database

---

## Team Responsibilities

### Frontend Developer

Responsible for:

* React UI
* Dashboard
* Routing
* Language Switching
* Charts and Visualizations
* API Integration

### Backend Developer

Responsible for:

* FastAPI APIs
* AI Integrations
* Question Generation
* Answer Evaluation
* Knowledge Gap Analysis
* Roadmap Generation
* Database Management

---

## Folder Structure

project-root/

frontend/

* src/
* components/
* pages/
* services/
* hooks/
* i18n/
* assets/

backend/

* app/
* api/
* services/
* database/
* models/
* schemas/
* utils/

docs/

README.md

---

## Future Enhancements

* Voice-based interviews
* Speech-to-text assessments
* Real-time mentoring
* Subject-specific tutors
* Competitive programming assessment mode
* Placement preparation mode
* Interview simulation mode

---

## Hackathon Requirements Coverage

| Requirement         | Status       |
| ------------------- | ------------ |
| AI Powered          | Yes          |
| Local AI Inference  | Yes (Ollama) |
| BYOK Support        | Yes          |
| English Support     | Yes          |
| Telugu Support      | Yes          |
| Hindi Support       | Yes          |
| Team Collaboration  | Yes          |
| Learning Assessment | Yes          |

---

## Vision

AI Reverse Tutor aims to transform learning from passive consumption into active understanding by making students explain, defend, and apply their knowledge while receiving personalized guidance from AI.
