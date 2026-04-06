"use client";

import { useEffect, useState, useCallback } from "react";
import CodeInput from "@/components/CodeInput";
import ModelSelector from "@/components/ModelSelector";
import ModeToggle from "@/components/ModeToggle";
import ReviewResult from "@/components/ReviewResult";
import LoadingState from "@/components/LoadingState";
import Image from "next/image";
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
            <div className="w-8 h-8 flex items-center justify-center">
              <Image 
                src="/icon.svg" 
                alt="ZeroPing Logo" 
                width={32} 
                height={32} 
                className="brightness-110"
              />
            </div>
            <span className="font-mono font-bold text-gray-100 tracking-tight text-lg">
              ZeroPing
            </span>
            <span className="hidden sm:block text-[10px] text-gray-500 font-mono mt-0.5 border border-[#2a2a3a] px-1.5 py-0.5 rounded uppercase tracking-widest bg-[#111118]">
              v1.0
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
          <div className="rounded-xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 to-transparent p-4 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute inset-0 bg-rose-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 flex-shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <AlertCircle size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-rose-300 tracking-tight">Ollama Engine Offline</h3>
                <p className="text-xs text-rose-200/60 mt-0.5">Please ensure the local Ollama instance is running to use AI models.</p>
              </div>
            </div>
            <button 
              onClick={loadModels}
              className="relative z-10 px-4 py-2 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-200 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Retry Connection
            </button>
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
                <TerminalSquare size={14} className="text-[#00F0FF] flex-shrink-0 mt-0.5" />
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
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all
                    bg-[#00F0FF] hover:bg-[#00d8e6] active:scale-[0.98] text-black
                    disabled:opacity-20 disabled:cursor-not-allowed
                    shadow-lg shadow-cyan-900/20"
                >
                  RUN SYSTEM REVIEW
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

