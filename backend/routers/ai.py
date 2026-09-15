from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from models.user import User
from services.auth_service import get_current_user
from services.ai_service import (
    analyze_honey_quality,
    diagnose_bee_disease,
    predict_yield,
    chat,
    get_market_insights,
)

router = APIRouter(prefix="/api/ai", tags=["AI Insights"])


# --- Schemas ---
class QualityAnalysisRequest(BaseModel):
    moisture_pct: Optional[float] = None
    hmf_level: Optional[float] = None
    diastase_number: Optional[float] = None
    sugar_content: Optional[float] = None
    color: Optional[str] = None
    ph_level: Optional[float] = None
    ash_content: Optional[float] = None
    variety: Optional[str] = None
    additional_notes: Optional[str] = None


class DiseaseRequest(BaseModel):
    symptoms: str
    bee_species: Optional[str] = None
    location: Optional[str] = None
    colony_strength: Optional[int] = None
    season: Optional[str] = None


class YieldRequest(BaseModel):
    hive_count: Optional[int] = None
    bee_species: Optional[str] = None
    flora_source: Optional[str] = None
    location: Optional[str] = None
    season: Optional[str] = None
    last_harvest_kg: Optional[float] = None
    colony_strength: Optional[int] = None
    rainfall_mm: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class MarketRequest(BaseModel):
    variety: str
    region: str = "India"


class AIResponse(BaseModel):
    response: str
    model: str = "gemini-2.0-flash"


# --- Endpoints ---
@router.post("/quality", response_model=AIResponse)
async def quality_analysis(
    req: QualityAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze honey quality using AI."""
    params = req.model_dump(exclude_unset=True, exclude_none=True)
    result = await analyze_honey_quality(params)
    return AIResponse(response=result)


@router.post("/disease", response_model=AIResponse)
async def disease_diagnosis(
    req: DiseaseRequest,
    current_user: User = Depends(get_current_user),
):
    """Get AI-powered bee disease diagnosis."""
    hive_info = {
        "bee_species": req.bee_species,
        "location": req.location,
        "colony_strength": req.colony_strength,
    }
    result = await diagnose_bee_disease(req.symptoms, hive_info)
    return AIResponse(response=result)


@router.post("/yield", response_model=AIResponse)
async def yield_prediction(
    req: YieldRequest,
    current_user: User = Depends(get_current_user),
):
    """Get AI-powered yield prediction."""
    hive_data = req.model_dump(exclude_unset=True, exclude_none=True)
    result = await predict_yield(hive_data)
    return AIResponse(response=result)


@router.post("/chat", response_model=AIResponse)
async def ai_chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Chat with HoneyChain AI assistant."""
    result = await chat(req.message, req.context or "")
    return AIResponse(response=result)


@router.post("/market", response_model=AIResponse)
async def market_insights(
    req: MarketRequest,
    current_user: User = Depends(get_current_user),
):
    """Get AI-powered market insights for honey."""
    result = await get_market_insights(req.variety, req.region)
    return AIResponse(response=result)
