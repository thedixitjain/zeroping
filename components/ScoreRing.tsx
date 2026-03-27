"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 75) return "#22c55e"; // green-500
    if (score >= 50) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const getGlow = () => {
    if (score >= 75) return "0 0 20px rgba(34,197,94,0.4)";
    if (score >= 50) return "0 0 20px rgba(245,158,11,0.4)";
    return "0 0 20px rgba(239,68,68,0.4)";
  };

  const color = getColor();

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#1c1c28"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(${getGlow()})`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: size * 0.26, color }}
        >
          {score}
        </span>
        <span
          className="font-mono text-gray-500 leading-none mt-0.5"
          style={{ fontSize: size * 0.1 }}
        >
          /100
        </span>
      </div>
    </div>
  );
}
