"use client";

import { useRef, useState } from "react";
import { Upload, X, FlaskConical } from "lucide-react";

const SAMPLE_CODE = `import hashlib
import sqlite3

def authenticate_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Build query directly from user input
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    if user:
        # Compare plain text passwords
        if user[2] == password:
            return True
        return False
    
    conn.close()

def store_user_data(data):
    # Write all user data to a temp file without validation
    with open('/tmp/user_data.txt', 'a') as f:
        f.write(str(data) + '\\n')
    print("Data stored: " + data)

def process_items(items):
    result = []
    for i in range(len(items)):
        for j in range(len(items)):
            result.append(items[i] + items[j])
    return result
`;

const LANGUAGE_MAP: Record<string, string> = {
  py: "python",
  js: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  go: "go",
  java: "java",
  rb: "ruby",
  rs: "rust",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  php: "php",
};

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return LANGUAGE_MAP[ext] || "unknown";
}

interface CodeInputProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
}

export default function CodeInput({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  disabled = false,
}: CodeInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const detected = detectLanguage(file.name);
    setFileName(file.name);
    onLanguageChange(detected);
    const reader = new FileReader();
    reader.onload = (e) => {
      onCodeChange(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setFileName(null);
    onCodeChange("");
    onLanguageChange("unknown");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          Code Input
        </label>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={disabled}
            className="text-xs font-mono bg-[#1c1c28] border border-[#2a2a3a] rounded px-2 py-1 text-gray-400 focus:outline-none focus:border-[#3a3a55] disabled:opacity-50"
          >
            <option value="unknown">Auto-detect</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
            <option value="ruby">Ruby</option>
            <option value="rust">Rust</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
          </select>

          {/* Load Sample button */}
          <button
            onClick={() => {
              onCodeChange(SAMPLE_CODE);
              onLanguageChange("python");
              setFileName(null);
            }}
            disabled={disabled}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded border border-[#2a2a3a] text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FlaskConical size={12} />
            Load Sample
          </button>
        </div>
      </div>

      {/* Textarea / drop zone */}
      <div
        className={`relative rounded-lg border transition-all ${
          dragOver
            ? "border-purple-500/60 bg-purple-500/5"
            : "border-[#2a2a3a] hover:border-[#3a3a55]"
        } ${disabled ? "opacity-50" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={code}
          onChange={(e) => {
            onCodeChange(e.target.value);
            setFileName(null);
          }}
          disabled={disabled}
          placeholder="Paste your code or a unified diff here...&#10;&#10;Or drag and drop a file (.py, .js, .ts, .jsx, .tsx, .go, .java)"
          className="code-area w-full min-h-[280px] bg-[#16161f] rounded-lg px-4 py-3 text-gray-200 placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-y disabled:cursor-not-allowed"
          spellCheck={false}
        />

        {/* Drag overlay hint */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-purple-900/20 border-2 border-dashed border-purple-500/60 pointer-events-none">
            <p className="text-purple-300 font-mono text-sm">Drop file here</p>
          </div>
        )}
      </div>

      {/* Bottom row: file name or upload button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {fileName ? (
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#1c1c28] border border-[#2a2a3a]">
              <span className="text-xs font-mono text-gray-400">{fileName}</span>
              <button onClick={clearFile} className="text-gray-600 hover:text-gray-400">
                <X size={12} />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-1.5 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload size={12} />
                Upload file
              </button>
              <span className="text-xs text-gray-700 font-mono">
                .py .js .ts .jsx .tsx .go .java
              </span>
            </>
          )}
        </div>

        <span className="text-xs font-mono text-gray-700">
          {code.split("\n").length} lines · {code.length} chars
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".py,.js,.ts,.jsx,.tsx,.go,.java,.rb,.rs,.cpp,.c,.cs,.php"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
