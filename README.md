<h1 align="center">
  <br />
  🔒 ZeroPing
  <br />
</h1>

<h4 align="center">Local LLM Code Review — Zero latency. Zero leaks. Zero API keys.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Ollama-local%20LLM-white?style=flat-square" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-prerequisites">Prerequisites</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api">API</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

**ZeroPing** is a privacy-first, offline code review tool powered by local LLMs via [Ollama](https://ollama.com). Paste your code, choose a model, and get a structured, AI-driven review — entirely on your own machine. No cloud. No telemetry. No API keys.

> Your code never leaves your machine. Ever.

---

## ✨ Features

- 🧠 **Local LLM Review** — Uses Ollama models: `qwen2.5-coder:7b`, `mistral:7b`, `llama3.2:3b`
- 🔍 **Two Review Modes** — *Strict* (security audit) or *Suggest* (friendly guidance)
- 📊 **Structured Output** — Score ring (0–100), verdict badge, issues by severity, positives, optional refactored snippet
- 🌐 **Language Auto-Detection** — Supports `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.go`, `.java`
- 📋 **Export as Markdown** — Copy the full review report to clipboard
- ⚡ **Live Model Availability** — See which models are pulled and their estimated review times
- 🟢 **Ollama Health Check** — Real-time connection status in the navbar
- 🎯 **Load Sample** — Instant demo with a pre-loaded buggy Python snippet

---

## 🛠 Prerequisites

- [Ollama](https://ollama.com) installed and running locally
- [Node.js](https://nodejs.org) 18+
- [Python](https://python.org) 3.10+ (3.12 recommended)

---

## 🚀 Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/thedixitjain/zeroping.git
cd zeroping
```

**2. Pull a model into Ollama**
```bash
ollama serve          # Start the Ollama daemon (keep this running)
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
python -m venv venv
source venv/bin/activate    # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**4. Start the frontend** (in a new terminal)
```bash
# From the project root
npm install
npm run dev
```

**5. Open in your browser**
```
http://localhost:3000
```

The backend runs on `http://localhost:8000`. Check `/health` to confirm Ollama is connected.

---

## 🔌 API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Check API + Ollama connection status |
| `GET` | `/models` | List supported models with availability |
| `POST` | `/review` | Submit code for review |

### Review request body
```json
{
  "code": "def foo(): pass",
  "language": "python",
  "model": "qwen2.5-coder:7b",
  "mode": "suggest"
}
```

---

## 📁 Project Structure

```
zeroping/
├── backend/
│   ├── main.py          # FastAPI app — routes & middleware
│   ├── reviewer.py      # Ollama call logic, JSON parser + retry
│   ├── models.py        # Pydantic v2 request/response schemas
│   ├── prompts.py       # System prompt templates (strict & suggest)
│   └── requirements.txt
├── app/
│   ├── page.tsx         # Main page — core application shell
│   ├── layout.tsx       # Root layout + metadata
│   └── globals.css      # Global styles (dark theme)
├── components/
│   ├── CodeInput.tsx    # Code editor with file upload + language detection
│   ├── ModelSelector.tsx
│   ├── ModeToggle.tsx
│   ├── ReviewResult.tsx # Full review display with export
│   ├── ScoreRing.tsx    # Animated SVG score ring
│   ├── IssueCard.tsx    # Individual issue renderer
│   └── LoadingState.tsx
├── lib/
│   └── api.ts           # Typed API client
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📜 License

MIT © [Dixit Jain](https://github.com/thedixitjain)

---

<p align="center">
  <strong>No API keys. No internet required. Your code never leaves your machine.</strong>
</p>
