"use client";

import { ModelInfo } from "@/lib/api";
import { ChevronDown, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ModelSelectorProps {
  models: ModelInfo[];
  selected: string;
  onSelect: (model: string) => void;
  loading?: boolean;
}

export default function ModelSelector({
  models,
  selected,
  onSelect,
  loading = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedModel = models.find((m) => m.name === selected);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
        Model
      </label>

      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#2a2a3a] bg-[#16161f] hover:border-[#3a3a55] hover:bg-[#1c1c28] transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Availability indicator */}
          {selectedModel && (
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                selectedModel.available ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-gray-600"
              }`}
            />
          )}
          <span className="font-mono text-sm text-gray-200 truncate">{selected}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {selectedModel && (
            <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
              <Clock size={11} />
              {selectedModel.estimated_time}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-[#2a2a3a] bg-[#111118] shadow-xl shadow-black/50 overflow-hidden">
          {models.map((model) => (
            <button
              key={model.name}
              onClick={() => {
                onSelect(model.name);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1c1c28] transition-colors text-left ${
                model.name === selected ? "bg-[#1c1c28]" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    model.available
                      ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                      : "bg-gray-600"
                  }`}
                />
                <span className="font-mono text-sm text-gray-200">{model.name}</span>
                {!model.available && (
                  <span className="text-xs text-gray-600 font-mono">not pulled</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                <Clock size={11} />
                {model.estimated_time}
              </div>
            </button>
          ))}

          {/* Pull hint */}
          <div className="px-3 py-2 border-t border-[#1c1c28]">
            <p className="text-xs text-gray-600 font-mono">
              <span className="text-gray-500">●</span> green = pulled &nbsp;
              <span className="text-gray-600">●</span> grey = run{" "}
              <span className="text-purple-400">ollama pull &lt;model&gt;</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
