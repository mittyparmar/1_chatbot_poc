from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from services.user_profile import UserProfileService
from services.context_engine import ContextEngine
from services.recommendation import RecommendationService
from services.enhanced_user_profile import EnhancedUserProfileService
from services.behavior_analysis import BehaviorAnalysisService
from services.segmentation_engine import SegmentationEngine

load_dotenv()

app = FastAPI(title="Personalization Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Services
user_profile_service = UserProfileService()
context_engine = ContextEngine()
recommendation_service = RecommendationService()
enhanced_user_profile_service = EnhancedUserProfileService()
behavior_analysis_service = BehaviorAnalysisService()
segmentation_engine = SegmentationEngine()

# Initialize services
@app.on_event("startup")
async def startup_event():
    await enhanced_user_profile_service.initialize()
    await behavior_analysis_service.initialize()
    await segmentation_engine.initialize()
    print("Personalization Service initialized with enhanced features")

@app.on_event("shutdown")
async def shutdown_event():
    await enhanced_user_profile_service.cleanup()
    await behavior_analysis_service.cleanup()
    await segmentation_engine.cleanup()
    print("Personalization Service cleanup complete")

# Pydantic models
class UserProfile(BaseModel):
    user_id: str
    browsing_history: List[dict]
    location_data: dict
    conversation_preferences: dict
    last_updated: str

class ContextData(BaseModel):
    user_id: str
    conversation_id: str
    message_content: str
    timestamp: str

class RecommendationRequest(BaseModel):
    user_id: str
    context: dict
    limit: int = 5

class BehaviorEvent(BaseModel):
    user_id: str
    event_type: str
    event_data: dict
    timestamp: str
    session_id: Optional[str] = None

class SegmentationRequest(BaseModel):
    algorithm: str = 'rule_based'
    parameters: dict
    user_ids: Optional[List[str]] = None

class SegmentUpdateRequest(BaseModel):
    criteria: dict
    auto_reassign: bool = False

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "personalization"}

@app.post("/user-profile")
async def create_user_profile(profile: UserProfile):
    try:
        result = await user_profile_service.create_profile(profile.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    try:
        profile = await user_profile_service.get_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/user-profile/{user_id}")
async def update_user_profile(user_id: str, profile: UserProfile):
    try:
        result = await user_profile_service.update_profile(user_id, profile.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/context")
async def add_context_data(context: ContextData):
    try:
        result = await context_engine.add_context(context.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/context/{user_id}")
async def get_user_context(user_id: str):
    try:
        context = await context_engine.get_context(user_id)
        return context
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = await recommendation_service.get_recommendations(
            request.user_id, request.context, request.limit
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Personalization Endpoints

@app.post("/enhanced-profile")
async def create_enhanced_profile(user_id: str):
    """Create enhanced user profile with AI-powered insights"""
    try:
        result = await enhanced_user_profile_service.create_enhanced_profile(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/enhanced-profile/{user_id}")
async def get_enhanced_profile(user_id: str):
    """Get enhanced user profile with behavioral insights"""
    try:
        profile = await enhanced_user_profile_service.get_enhanced_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Enhanced user profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/enhanced-profile/{user_id}")
async def update_enhanced_profile(user_id: str, profile_data: dict):
    """Update enhanced user profile"""
    try:
        result = await enhanced_user_profile_service.update_enhanced_profile(user_id, profile_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavior-event")
async def track_behavior_event(event: BehaviorEvent):
    """Track user behavior event for analysis"""
    try:
        result = await behavior_analysis_service.track_event(event.dict())
        return {"message": "Behavior event tracked successfully", "event_id": result.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/behavior-insights/{user_id}")
async def get_behavior_insights(user_id: str):
    """Get behavioral insights for a user"""
    try:
        insights = await behavior_analysis_service.get_user_insights(user_id)
        return {"user_id": user_id, "insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/segmentation")
async def create_segmentation(request: SegmentationRequest):
    """Create user segmentation"""
    try:
        result = await segmentation_engine.create_segmentation(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segmentation")
async def list_segments():
    """List all user segments"""
    try:
        segments = await segmentation_engine.list_segments()
        return {"segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segmentation/{segment_id}/users")
async def get_segment_users(segment_id: str, limit: int = 100):
    """Get users in a segment"""
    try:
        users = await segmentation_engine.get_segment_users(segment_id, limit)
        return {"segment_id": segment_id, "users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/segmentation/{segment_id}")
async def update_segment(segment_id: str, request: SegmentUpdateRequest):
    """Update segment criteria"""
    try:
        result = await segmentation_engine.update_segment(segment_id, request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/segmentation/{segment_id}")
async def delete_segment(segment_id: str):
    """Delete a segment"""
    try:
        result = await segmentation_engine.delete_segment(segment_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segmentation/{segment_id}/performance")
async def get_segment_performance(segment_id: str, days: int = 30):
    """Get segment performance metrics"""
    try:
        performance = await segmentation_engine.get_segment_performance(segment_id, days)
        return performance
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/personalize-content")
async def personalize_content(user_id: str, content_type: str, context: dict):
    """Personalize content based on user profile and context"""
    try:
        personalized = await enhanced_user_profile_service.personalize_content(user_id, content_type, context)
        return {"user_id": user_id, "content_type": content_type, "personalized_content": personalized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-segments/{user_id}")
async def get_user_segments(user_id: str):
    """Get all segments a user belongs to"""
    try:
        segments = await segmentation_engine.get_user_segments(user_id)
        return {"user_id": user_id, "segments": segments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3005)