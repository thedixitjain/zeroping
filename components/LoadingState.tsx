"use client";

interface LoadingStateProps {
  model: string;
}

export default function LoadingState({ model }: LoadingStateProps) {
  const modelLabel = model.split(":")[0];

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Animated ring */}
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#1c1c28"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="#7c6cfc"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="40 123"
            strokeDashoffset="0"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p className="text-gray-200 font-medium">
          Reviewing with{" "}
          <span className="font-mono text-purple-400">{modelLabel}</span>
        </p>
        <p className="text-gray-500 text-sm">
          Running locally, no data leaves your machine
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-700"
            style={{
              animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { background-color: #374151; transform: scale(1); }
          40% { background-color: #7c6cfc; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
