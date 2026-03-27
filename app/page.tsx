"use client";

import { useEffect, useState, useCallback } from "react";
import CodeInput from "@/components/CodeInput";
import ModelSelector from "@/components/ModelSelector";
import ModeToggle from "@/components/ModeToggle";
import ReviewResult from "@/components/ReviewResult";
import LoadingState from "@/components/LoadingState";
import {
  fetchModels,
  fetchHealth,
  submitReview,
  ModelInfo,
  ReviewResponse,
  ApiError,
} from "@/lib/api";
import { ShieldCheck, AlertCircle, TerminalSquare, RefreshCw } from "lucide-react";

type AppState = "idle" | "loading" | "result" | "error";

const DEFAULT_MODELS: ModelInfo[] = [
  { name: "qwen2.5-coder:7b", available: false, estimated_time: "~25s" },
  { name: "mistral:7b", available: false, estimated_time: "~30s" },
  { name: "llama3.2:3b", available: false, estimated_time: "~15s" },
];

export default function Home() {
  // Form state
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("unknown");
  const [model, setModel] = useState("qwen2.5-coder:7b");
  const [mode, setMode] = useState<"strict" | "suggest">("suggest");

  // App state
  const [appState, setAppState] = useState<AppState>("idle");
  const [models, setModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);

  const loadModels = useCallback(async () => {
    try {
      const [healthData, modelsData] = await Promise.all([fetchHealth(), fetchModels()]);
      setOllamaOk(healthData.ollama_connected);
      setModels(modelsData.models);
      // Auto-select first available model
      const firstAvailable = modelsData.models.find((m) => m.available);
      if (firstAvailable) setModel(firstAvailable.name);
    } catch {
      setOllamaOk(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setAppState("loading");
    setError(null);
    setRawError(null);

    try {
      const result = await submitReview({ code, language, model, mode });
      setReview(result);
      setAppState("result");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      setRawError(typeof err === "string" ? err : JSON.stringify(err, null, 2));
      setAppState("error");
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setCode("");
    setLanguage("unknown");
    setReview(null);
    setError(null);
    setRawError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#1c1c28] bg-[#0a0a0f]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck size={14} className="text-purple-400" />
            </div>
            <span className="font-mono font-semibold text-gray-100 tracking-tight">
              ZeroPing
            </span>
            <span className="hidden sm:block text-xs text-gray-600 font-mono mt-px">
              Local LLM Code Review
            </span>
          </div>

          {/* Ollama status */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadModels}
              className="p-1.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
              title="Refresh connection"
            >
              <RefreshCw size={13} />
            </button>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaOk === null
                    ? "bg-gray-600"
                    : ollamaOk
                    ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
                    : "bg-red-500"
                }`}
              />
              <span className={ollamaOk ? "text-gray-400" : "text-red-400"}>
                {ollamaOk === null ? "Checking..." : ollamaOk ? "Ollama connected" : "Ollama offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Ollama not running banner */}
      {ollamaOk === false && appState === "idle" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm text-red-300 font-medium">Ollama is not running</p>
              <p className="text-xs text-gray-500 mt-1">
                Start it with:&nbsp;
                <code className="font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">
                  ollama serve
                </code>
                &nbsp; then pull a model:&nbsp;
                <code className="font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">
                  ollama pull qwen2.5-coder:7b
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left panel - config */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
            {/* Panel header */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-100 tracking-tight">
                Code Review
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                Powered by local LLM · zero telemetry
              </p>
            </div>

            {/* Controls card */}
            <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-4 space-y-5">
              <ModelSelector
                models={models}
                selected={model}
                onSelect={setModel}
                loading={appState === "loading"}
              />
              <ModeToggle mode={mode} onChange={setMode} />
            </div>

            {/* Privacy callout */}
            <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] px-4 py-3">
              <div className="flex items-start gap-2.5">
                <TerminalSquare size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                  No API keys. No internet required. Your code never leaves your machine.
                </p>
              </div>
            </div>
          </aside>

          {/* Right panel - code + results */}
          <div className="flex-1 min-w-0 space-y-4">
            {appState === "result" && review ? (
              <ReviewResult review={review} language={language} onReset={handleReset} />
            ) : appState === "loading" ? (
              <div className="rounded-xl border border-[#2a2a3a] bg-[#111118]">
                <LoadingState model={model} />
              </div>
            ) : appState === "error" ? (
              <div className="rounded-xl border border-red-500/30 bg-[#111118] p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-red-300 font-medium">Review Failed</p>
                    <p className="text-sm text-gray-400">{error?.message || rawError}</p>
                  </div>
                </div>

                {error?.fix && (
                  <div className="rounded-lg bg-[#16161f] border border-[#2a2a3a] px-4 py-3">
                    <p className="text-xs text-gray-500 font-mono mb-1">Run this command:</p>
                    <code className="text-sm font-mono text-purple-300">{error.fix}</code>
                  </div>
                )}

                {error?.setup && (
                  <div className="rounded-lg bg-[#16161f] border border-[#2a2a3a] px-4 py-3 space-y-1">
                    <p className="text-xs text-gray-500 font-mono mb-2">Setup steps:</p>
                    {error.setup.map((step, i) => (
                      <p key={i} className="text-sm font-mono text-gray-400">
                        {step}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setAppState("idle")}
                    className="flex-1 px-4 py-2 rounded-lg border border-[#2a2a3a] text-sm text-gray-400 hover:bg-[#1c1c28] transition-colors"
                  >
                    ← Back to editor
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm hover:bg-purple-500/20 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              /* Idle: code input + submit */
              <div className="space-y-4">
                <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-4">
                  <CodeInput
                    code={code}
                    language={language}
                    onCodeChange={setCode}
                    onLanguageChange={setLanguage}
                    disabled={appState === "loading"}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!code.trim() || appState === "loading"}
                  className="w-full py-3 rounded-xl font-medium text-sm transition-all
                    bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white
                    disabled:opacity-40 disabled:cursor-not-allowed
                    shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
                >
                  Run Code Review
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

