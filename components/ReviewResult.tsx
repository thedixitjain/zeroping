"use client";

import { ReviewResponse, Issue } from "@/lib/api";
import ScoreRing from "./ScoreRing";
import IssueCard from "./IssueCard";
import { CheckCircle2, Copy, RotateCcw, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ReviewResultProps {
  review: ReviewResponse;
  language: string;
  onReset: () => void;
}

const VERDICT_CONFIG = {
  Approved: {
    icon: <CheckCircle2 size={16} />,
    className: "bg-green-500/15 text-green-400 border border-green-500/30",
  },
  "Needs Work": {
    icon: <AlertTriangle size={16} />,
    className: "bg-yellow-400/15 text-yellow-400 border border-yellow-400/30",
  },
  "Critical Issues": {
    icon: <XCircle size={16} />,
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
  },
};

const SEVERITY_ORDER: Issue["severity"][] = ["critical", "high", "medium", "low"];

function groupIssuesBySeverity(issues: Issue[]): Record<string, Issue[]> {
  const grouped: Record<string, Issue[]> = {};
  for (const sev of SEVERITY_ORDER) {
    const filtered = issues.filter((i) => i.severity === sev);
    if (filtered.length > 0) grouped[sev] = filtered;
  }
  return grouped;
}

function buildMarkdownReport(review: ReviewResponse): string {
  const lines: string[] = [
    `# ZeroPing Review Report`,
    ``,
    `**Score:** ${review.score}/100  `,
    `**Verdict:** ${review.verdict}  `,
    `**Summary:** ${review.summary}`,
    ``,
  ];

  if (review.issues.length > 0) {
    lines.push(`## Issues (${review.issues.length})`);
    lines.push(``);
    for (const issue of review.issues) {
      lines.push(
        `### [${issue.severity.toUpperCase()}] ${issue.type} ${issue.line ? `- Line ${issue.line}` : ""}`
      );
      lines.push(`**Issue:** ${issue.description}  `);
      lines.push(`**Fix:** ${issue.suggestion}`);
      lines.push(``);
    }
  }

  if (review.positives.length > 0) {
    lines.push(`## Positives`);
    for (const p of review.positives) {
      lines.push(`- ${p}`);
    }
    lines.push(``);
  }

  if (review.refactored_snippet) {
    lines.push(`## Refactored Snippet`);
    lines.push("```");
    lines.push(review.refactored_snippet);
    lines.push("```");
  }

  return lines.join("\n");
}

export default function ReviewResult({ review, language, onReset }: ReviewResultProps) {
  const [copied, setCopied] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(true);
  const grouped = groupIssuesBySeverity(review.issues);
  const verdictConfig = VERDICT_CONFIG[review.verdict];

  const handleCopy = async () => {
    const md = buildMarkdownReport(review);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Header: Score + Summary */}
      <div className="rounded-xl border border-[#2a2a3a] bg-[#111118] p-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Score ring */}
          <div className="flex-shrink-0">
            <ScoreRing score={review.score} size={110} />
          </div>

          {/* Summary block */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            {/* Verdict badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium font-mono ${verdictConfig.className}`}
              >
                {verdictConfig.icon}
                {review.verdict}
              </span>
            </div>

            <p className="text-gray-200 text-base leading-relaxed">{review.summary}</p>

            {/* Issue counts */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              {SEVERITY_ORDER.map((sev) => {
                const count = review.issues.filter((i) => i.severity === sev).length;
                if (count === 0) return null;
                const colors: Record<string, string> = {
                  critical: "text-red-400",
                  high: "text-orange-400",
                  medium: "text-yellow-400",
                  low: "text-blue-400",
                };
                return (
                  <span key={sev} className={`text-xs font-mono ${colors[sev]}`}>
                    {count} {sev}
                  </span>
                );
              })}
              {review.issues.length === 0 && (
                <span className="text-xs font-mono text-green-400">No issues found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Issues by severity */}
      {Object.entries(grouped).map(([severity, issues]) => {
        const colors: Record<string, string> = {
          critical: "text-red-400",
          high: "text-orange-400",
          medium: "text-yellow-400",
          low: "text-blue-400",
        };
        return (
          <div key={severity} className="animate-fade-in-up-delay-1">
            <h3 className={`text-xs font-mono uppercase tracking-wider mb-2 ${colors[severity]}`}>
              {severity} - {issues.length} {issues.length === 1 ? "issue" : "issues"}
            </h3>
            <div className="space-y-2">
              {issues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} index={idx} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Positives */}
      {review.positives.length > 0 && (
        <div className="animate-fade-in-up-delay-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-green-400 mb-2">
            Positives - {review.positives.length}
          </h3>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 space-y-2">
            {review.positives.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refactored snippet */}
      {review.refactored_snippet && (
        <div className="animate-fade-in-up-delay-3">
          <button
            onClick={() => setSnippetOpen(!snippetOpen)}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-purple-400 mb-2 hover:text-purple-300 transition-colors"
          >
            {snippetOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Refactored Snippet
          </button>
          {snippetOpen && (
            <div className="rounded-xl border border-purple-500/20 bg-[#111118] overflow-hidden">
              <SyntaxHighlighter
                language={language === "unknown" ? "text" : language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  background: "transparent",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                showLineNumbers
                lineNumberStyle={{ color: "#3a3a55", fontSize: "11px" }}
              >
                {review.refactored_snippet}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#2a2a3a] bg-[#16161f] hover:bg-[#1c1c28] hover:border-[#3a3a55] transition-all text-sm font-medium text-gray-300"
        >
          <Copy size={14} />
          {copied ? "Copied!" : "Copy Report as Markdown"}
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all text-sm font-medium text-purple-300"
        >
          <RotateCcw size={14} />
          Review Another
        </button>
      </div>
    </div>
  );
}

