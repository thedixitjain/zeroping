# ZeroPing - Local LLM Code Review Assistant

ZeroPing is a web application that reviews your code entirely locally using Ollama. Zero data leaves your machine, no API keys are required, and no internet connection is needed after setup.

---

## Prerequisites

- [Ollama](https://ollama.com) installed and running
- Node.js 18+
- Python 3.10+

---

## Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourname/ZeroPing.git
cd ZeroPing
```

**2. Pull a model into Ollama**
```bash
ollama pull qwen2.5-coder:7b
```
Other supported models:
```bash
ollama pull mistral:7b
ollama pull llama3.2:3b
```

**3. Start the backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**4. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

**5. Open in your browser**
```
http://localhost:3000
```

---

## Features

- **Paste or upload code** - supports `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.go`, `.java`
- **Language auto-detection** from file extension
- **Model selector** - switch between Qwen2.5-Coder, Mistral, Llama 3.2 with live availability indicators
- **Review modes** - Strict (security audit) or Suggest (friendly review)
- **Structured output** - score ring, verdict badge, issues grouped by severity, positives, optional refactored snippet
- **Copy report** - export the full review as Markdown
- **Load Sample** - instant demo with a buggy Python snippet

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Check API + Ollama status |
| GET | `/models` | List available models |
| POST | `/review` | Submit code for review |

---

## Project Structure

```
ZeroPing/
├── backend/
│   ├── main.py          # FastAPI app, endpoints
│   ├── reviewer.py      # Ollama call logic, JSON parser + retry
│   ├── models.py        # Pydantic v2 request/response models
│   ├── prompts.py       # System prompt templates
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx     # Main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── CodeInput.tsx
│   │   ├── ModelSelector.tsx
│   │   ├── ModeToggle.tsx
│   │   ├── ReviewResult.tsx
│   │   ├── ScoreRing.tsx
│   │   ├── IssueCard.tsx
│   │   └── LoadingState.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

> **No API keys. No internet required. Your code never leaves your machine.**

---

## Screenshots

<!-- Add screenshots here after running the app -->

![ZeroPing UI Placeholder](https://via.placeholder.com/1200x700/0a0a0f/7c6cfc?text=ZeroPing+Screenshot)

