<div align="center">
  <img src="./public/icon.svg" alt="ZeroPing Logo" width="120" />
</div>

<h1 align="center">ZeroPing</h1>

<p align="center">
  <strong>The Air-Gapped, Privacy-First Local Code Review Assistant.</strong><br/>
  Powered by Local LLMs (Ollama) so your code <b>never</b> leaves your machine.
</p>

<p align="center">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.100+-teal" />
  <img alt="Ollama" src="https://img.shields.io/badge/Ollama-Local_LLM-white" />
</p>

---

## 🛑 The Problem

Modern AI coding assistants are powerful, but they require a severe trade-off: **Privacy**. 
Every time you use cloud-based AI to review your code, you are sending your intellectual property, API keys embedded in code, and proprietary algorithms to external third-party servers. 
For enterprise developers, security researchers, and privacy-conscious users, exposing source code to cloud APIs is a critical policy violation.

## 🚀 The Impact & Solution

**ZeroPing** solves this by leveraging state-of-the-art local Large Language Models (LLMs) to perform high-quality, structured code reviews entirely on your machine.
- **Zero Telemetry.** Your code is never sent to the cloud.
- **Zero API Keys.** No subscriptions, no usage limits, no credit card required.
- **True Air-Gap Capability.** works completely offline once models are downloaded. 

By running an aggressive Next.js frontend and a lightweight Python/FastAPI interface pointing directly at your local Ollama daemon, you get a premium DevOps experience running locally.

---

## ✨ Key Features

- **Multi-Language Support & Auto-Detection:** `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.go`, `.java`
- **Dynamic Model Selector:** Hot-swap between `qwen2.5-coder:7b`, `mistral`, or `llama-3.2` based on local availability.
- **Dual Review Engines:** 
  - *Strict:* Security and correctness audits.
  - *Suggest:* Friendly, readable refactoring suggestions.
- **Actionable Structured Intelligence:** Outputs visually distinct Score Rings, Verdict Badges, and categorized issues (Performance, Security, Style).
- **One-Click Markdown Export:** Instantly copy the review report for Github/Gitlab PR descriptions.

---

## 🛠️ Architecture

ZeroPing is built using a modern, decoupled stack allowing extreme modularity:

1. **Frontend (`app/`, `components/`)**: Next.js 14 App Router, React, TailwindCSS, Lucide Icons.
2. **Backend (`backend/`)**: FastAPI, Pydantic (Strict Schema Enforcement).
3. **Inference Engine**: [Ollama](https://ollama.com) running deep-level quantized models.

The backend automatically enforces strict JSON output from local LLMs, employing automatic retry fallbacks with hardened prompts if models hallucinate formatting.

---

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (v18+)
- **Python** (v3.10+)
- **[Ollama](https://ollama.com/download)** (Required for local LLM inference)

### 1. Model Setup

Pull your preferred coding models into Ollama:
```bash
ollama pull qwen2.5-coder:7b
# Optional:
# ollama pull mistral:7b 
# ollama pull llama3.2:3b
```

### 2. Backend Initialization

Clone the repo and start the local Python API:
```bash
git clone https://github.com/thedixitjain/zeroping.git
cd zeroping/backend

# Initialize a Virtual Environment
python -m venv venv

# Activate Environment
# --> Windows: .\venv\Scripts\activate
# --> Mac/Linux: source venv/bin/activate

# Install dependencies and start server
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### 3. Frontend Initialization

In a **new terminal tab**, boot the primary dashboard:
```bash
cd zeroping
npm install
npm run dev
```

The application will be universally available at **`http://localhost:3000`** (or 3001 if occupied).

---

## 🤝 Contributing

We believe secure coding should be accessible to everyone. We welcome global contributions:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
