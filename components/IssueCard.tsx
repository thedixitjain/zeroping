"use client";

import { Issue } from "@/lib/api";
import {
  ShieldAlert,
  Zap,
  BookOpen,
  Bug,
  Brush,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const TYPE_ICONS: Record<Issue["type"], React.ReactNode> = {
  security: <ShieldAlert size={14} />,
  performance: <Zap size={14} />,
  readability: <BookOpen size={14} />,
  correctness: <Bug size={14} />,
  style: <Brush size={14} />,
};

const TYPE_LABELS: Record<Issue["type"], string> = {
  security: "Security",
  performance: "Performance",
  readability: "Readability",
  correctness: "Correctness",
  style: "Style",
};

const SEVERITY_STYLES: Record<
  Issue["severity"],
  { border: string; badge: string; dot: string }
> = {
  critical: {
    border: "border-red-500/30",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    border: "border-orange-400/30",
    badge: "bg-orange-400/15 text-orange-400 border border-orange-400/30",
    dot: "bg-orange-400",
  },
  medium: {
    border: "border-yellow-400/30",
    badge: "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30",
    dot: "bg-yellow-400",
  },
  low: {
    border: "border-blue-400/30",
    badge: "bg-blue-400/15 text-blue-400 border border-blue-400/30",
    dot: "bg-blue-400",
  },
};

interface IssueCardProps {
  issue: Issue;
  index: number;
}

export default function IssueCard({ issue, index }: IssueCardProps) {
  const [expanded, setExpanded] = useState(true);
  const styles = SEVERITY_STYLES[issue.severity];

  return (
    <div
      className={`rounded-lg border bg-[#16161f] ${styles.border} overflow-hidden transition-all`}
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Severity dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />

          {/* Type icon + label */}
          <span className="flex items-center gap-1.5 text-gray-400 text-xs font-mono flex-shrink-0">
            {TYPE_ICONS[issue.type]}
            {TYPE_LABELS[issue.type]}
          </span>

          {/* Severity badge */}
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${styles.badge}`}>
            {issue.severity}
          </span>

          {/* Line number */}
          {issue.line !== null && (
            <span className="text-xs font-mono text-gray-500 flex-shrink-0">
              line {issue.line}
            </span>
          )}

          {/* Description preview */}
          <span className="text-sm text-gray-300 truncate">{issue.description}</span>
        </div>

        <span className="text-gray-600 flex-shrink-0 ml-2">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/5">
          <div className="mt-3">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
              Issue
            </p>
            <p className="text-sm text-gray-200 leading-relaxed">{issue.description}</p>
          </div>
          <div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
              Suggestion
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">{issue.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
