"use client";

import { ShieldAlert, MessageSquare } from "lucide-react";

interface ModeToggleProps {
  mode: "strict" | "suggest";
  onChange: (mode: "strict" | "suggest") => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div>
      <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
        Review Mode
      </label>
      <div className="flex rounded-lg border border-[#2a2a3a] bg-[#16161f] p-1 gap-1">
        <button
          onClick={() => onChange("suggest")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            mode === "suggest"
              ? "bg-[#1c1c28] border border-[#3a3a55] text-green-400 shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <MessageSquare size={14} />
          Suggest
        </button>
        <button
          onClick={() => onChange("strict")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            mode === "strict"
              ? "bg-[#1c1c28] border border-[#3a3a55] text-red-400 shadow-sm"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <ShieldAlert size={14} />
          Strict
        </button>
      </div>
      <p className="mt-1.5 text-xs text-gray-600 font-mono">
        {mode === "strict"
          ? "Flags everything · security audit mode"
          : "Balanced · helpful colleague review"}
      </p>
    </div>
  );
}
