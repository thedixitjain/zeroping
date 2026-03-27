REVIEW_SCHEMA = """{
  "summary": "One sentence overall assessment",
  "score": 72,
  "verdict": "Needs Work",
  "issues": [
    {
      "type": "security | performance | readability | correctness | style",
      "severity": "critical | high | medium | low",
      "line": 14,
      "description": "What the issue is",
      "suggestion": "How to fix it specifically"
    }
  ],
  "positives": [
    "What the code does well"
  ],
  "refactored_snippet": "Optional improved version of the most critical section only"
}"""


def build_system_prompt(mode: str, language: str) -> str:
    return f"""You are a senior software engineer conducting a code review.
Your job is to analyze the provided code and return a review in valid JSON format only.
Do not include any text before or after the JSON.
Do not wrap the JSON in markdown code fences.
Do not explain your reasoning outside the JSON structure.

Review mode: {mode} (strict = flag everything aggressively, suggest = balanced and constructive)
Language: {language}

Return ONLY this JSON structure and nothing else:
{REVIEW_SCHEMA}

Rules:
- Score is 0-100. Start at 100. Deduct points per issue based on severity: critical -20, high -10, medium -5, low -2
- Verdict: 85+ is Approved, 60-84 is Needs Work, below 60 is Critical Issues
- Line numbers must reference actual line numbers in the input
- If no issues found, return empty issues array and score 100
- refactored_snippet is optional, include only if there is a clearly better way to write the worst section
- type must be one of: security, performance, readability, correctness, style
- severity must be one of: critical, high, medium, low
- verdict must be exactly one of: Approved, Needs Work, Critical Issues"""


def build_strict_retry_prompt(mode: str, language: str) -> str:
    return f"""CRITICAL INSTRUCTION: You must return ONLY a raw JSON object. Nothing else.
No explanation. No markdown. No code fences. No preamble. No postamble.
The very first character of your response must be {{ and the last must be }}.

You are a senior software engineer conducting a code review.
Review mode: {mode}
Language: {language}

Return ONLY this exact JSON structure:
{REVIEW_SCHEMA}

Rules:
- Score is 0-100. Deduct: critical -20, high -10, medium -5, low -2
- Verdict: 85+ = Approved, 60-84 = Needs Work, below 60 = Critical Issues
- type: security | performance | readability | correctness | style
- severity: critical | high | medium | low
- verdict: Approved | Needs Work | Critical Issues
- Start your response with {{ immediately"""
