from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from models import ReviewRequest, ReviewResponse, ModelsResponse, HealthResponse
from reviewer import review_code, get_available_models, check_ollama_health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ZeroPing API",
    description="Local LLM Code Review Assistant powered by Ollama",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check if the API and Ollama are running."""
    ollama_connected = await check_ollama_health()
    return HealthResponse(status="ok", ollama_connected=ollama_connected)


@app.get("/models", response_model=ModelsResponse)
async def list_models():
    """Return all supported models with their availability status in Ollama."""
    models = await get_available_models()
    return ModelsResponse(models=models)


@app.post("/review", response_model=ReviewResponse)
async def create_review(request: ReviewRequest):
    """
    Submit code for review. Returns a structured JSON review object.
    Uses the specified Ollama model to perform the review locally.
    """
    ollama_up = await check_ollama_health()
    if not ollama_up:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ollama_not_running",
                "message": "Ollama is not running. Start it with: ollama serve",
                "setup": [
                    "1. Install Ollama from https://ollama.com",
                    "2. Run: ollama serve",
                    f"3. Pull your model: ollama pull {request.model}",
                ],
            },
        )

    try:
        result = await review_code(request)
        return result
    except ValueError as e:
        error_msg = str(e)
        if "malformed JSON" in error_msg:
            raise HTTPException(
                status_code=422,
                detail={
                    "error": "parse_failure",
                    "message": error_msg,
                },
            )
        raise HTTPException(status_code=400, detail={"error": "review_failed", "message": error_msg})
    except Exception as e:
        error_msg = str(e)
        # Check for model not found
        if "model" in error_msg.lower() and ("not found" in error_msg.lower() or "pull" in error_msg.lower()):
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "model_not_pulled",
                    "message": f"Model '{request.model}' is not pulled in Ollama.",
                    "fix": f"ollama pull {request.model}",
                },
            )
        logger.exception(f"Unexpected error during review: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": "internal_error", "message": error_msg},
        )

