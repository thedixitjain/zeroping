import httpx
import json
import re
import logging
from models import ReviewRequest, ReviewResponse, Issue, ModelInfo
from prompts import build_system_prompt, build_strict_retry_prompt

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
SUPPORTED_MODELS = [
    {"name": "qwen2.5-coder:7b", "estimated_time": "~25s"},
    {"name": "mistral:7b", "estimated_time": "~30s"},
    {"name": "llama3.2:3b", "estimated_time": "~15s"},
]


async def get_available_models() -> list[ModelInfo]:
    """Fetch which models are currently pulled in Ollama."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            response.raise_for_status()
            data = response.json()
            pulled_names = {m["name"] for m in data.get("models", [])}

            result = []
            for model_def in SUPPORTED_MODELS:
                name = model_def["name"]
                # Check exact match or prefix match (e.g. "mistral:7b" vs "mistral:latest")
                available = name in pulled_names or any(
                    p.startswith(name.split(":")[0]) for p in pulled_names
                )
                result.append(
                    ModelInfo(
                        name=name,
                        available=available,
                        estimated_time=model_def["estimated_time"],
                    )
                )
            return result
    except Exception as e:
        logger.warning(f"Could not fetch Ollama models: {e}")
        return [
            ModelInfo(name=m["name"], available=False, estimated_time=m["estimated_time"])
            for m in SUPPORTED_MODELS
        ]


async def check_ollama_health() -> bool:
    """Check if Ollama is running and reachable."""
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return response.status_code == 200
    except Exception:
        return False


def strip_json_fences(text: str) -> str:
    """Strip markdown code fences and any leading/trailing non-JSON text."""
    # Remove ```json ... ``` or ``` ... ``` fences
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    text = text.strip()

    # Find the first { and last } to extract just the JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]

    return text.strip()


def parse_review_json(raw: str) -> ReviewResponse:
    """Parse and validate the LLM response into a ReviewResponse."""
    cleaned = strip_json_fences(raw)
    data = json.loads(cleaned)

    # Normalize verdict casing
    verdict_map = {
        "approved": "Approved",
        "needs work": "Needs Work",
        "needswork": "Needs Work",
        "critical issues": "Critical Issues",
        "criticalissues": "Critical Issues",
        "critical": "Critical Issues",
    }
    raw_verdict = str(data.get("verdict", "Needs Work"))
    data["verdict"] = verdict_map.get(raw_verdict.lower(), raw_verdict)

    # Clamp score
    score = int(data.get("score", 50))
    data["score"] = max(0, min(100, score))

    # Normalize issues
    normalized_issues = []
    for issue in data.get("issues", []):
        # Normalize type
        issue_type = str(issue.get("type", "readability")).lower()
        valid_types = {"security", "performance", "readability", "correctness", "style"}
        if issue_type not in valid_types:
            issue_type = "readability"
        issue["type"] = issue_type

        # Normalize severity
        severity = str(issue.get("severity", "medium")).lower()
        valid_severities = {"critical", "high", "medium", "low"}
        if severity not in valid_severities:
            severity = "medium"
        issue["severity"] = severity

        # Ensure line is int or None
        line = issue.get("line")
        if line is not None:
            try:
                issue["line"] = int(line)
            except (ValueError, TypeError):
                issue["line"] = None

        normalized_issues.append(issue)

    data["issues"] = normalized_issues

    return ReviewResponse(**data)


async def call_ollama(
    model: str,
    system_prompt: str,
    user_prompt: str,
    timeout: float = 120.0,
) -> str:
    """Make a raw call to the Ollama generate API."""
    payload = {
        "model": model,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "top_p": 0.9,
        },
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")


async def review_code(request: ReviewRequest) -> ReviewResponse:
    """
    Main review function. Calls Ollama with the structured prompt,
    parses the JSON, retries once with a stricter prompt on failure.
    """
    system_prompt = build_system_prompt(request.mode.value, request.language)
    user_prompt = f"Review the following {request.language} code:\n\n{request.code}"

    # First attempt
    try:
        raw_response = await call_ollama(
            model=request.model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        logger.info(f"Raw LLM response (attempt 1): {raw_response[:200]}...")
        return parse_review_json(raw_response)

    except (json.JSONDecodeError, KeyError, ValueError) as e:
        logger.warning(f"First parse attempt failed: {e}. Retrying with stricter prompt.")

    # Second attempt with stricter prompt
    try:
        strict_system = build_strict_retry_prompt(request.mode.value, request.language)
        raw_response = await call_ollama(
            model=request.model,
            system_prompt=strict_system,
            user_prompt=f"Return a JSON code review for this {request.language} code. ONLY JSON, nothing else:\n\n{request.code}",
        )
        logger.info(f"Raw LLM response (attempt 2): {raw_response[:200]}...")
        return parse_review_json(raw_response)

    except Exception as e:
        logger.error(f"Both parse attempts failed: {e}")
        # Return a fallback response indicating the parse failure
        raise ValueError(
            f"The model returned malformed JSON after two attempts. "
            f"Raw response excerpt: {raw_response[:500] if 'raw_response' in dir() else 'No response'}"
        )
