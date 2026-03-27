from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class ReviewMode(str, Enum):
    strict = "strict"
    suggest = "suggest"


class ReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, description="Code to review")
    language: str = Field(default="unknown", description="Programming language")
    model: str = Field(default="qwen2.5-coder:7b", description="Ollama model to use")
    mode: ReviewMode = Field(default=ReviewMode.suggest, description="Review mode")


class Issue(BaseModel):
    type: Literal["security", "performance", "readability", "correctness", "style"]
    severity: Literal["critical", "high", "medium", "low"]
    line: Optional[int] = None
    description: str
    suggestion: str


class ReviewResponse(BaseModel):
    summary: str
    score: int = Field(..., ge=0, le=100)
    verdict: Literal["Approved", "Needs Work", "Critical Issues"]
    issues: list[Issue] = []
    positives: list[str] = []
    refactored_snippet: Optional[str] = None


class ModelInfo(BaseModel):
    name: str
    available: bool
    estimated_time: str


class ModelsResponse(BaseModel):
    models: list[ModelInfo]


class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
