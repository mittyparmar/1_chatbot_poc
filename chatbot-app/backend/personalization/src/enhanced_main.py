from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import logging
import os
from datetime import datetime
from dotenv import load_dotenv

# Import enhanced services
from services.enhanced_user_profile import EnhancedUserProfileService
from services.behavior_analysis import BehaviorAnalysisService
from services.segmentation_engine import SegmentationEngine
from services.realtime_personalization import RealtimePersonalization
from services.ab_testing import ABTestingService
from services.performance_monitor import PerformanceMonitor
from services.data_export import DataExportService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize enhanced services
enhanced_user_profile = EnhancedUserProfileService()
behavior_analysis = BehaviorAnalysisService()
segmentation_engine = SegmentationEngine()
realtime_personalization = RealtimePersonalization()
ab_testing = ABTestingService()
performance_monitor = PerformanceMonitor()
data_export = DataExportService()

# FastAPI app
app = FastAPI(
    title="Enhanced Personalization Service",
    description="Advanced personalization service with behavior analysis, segmentation, and real-time features",
    version="2.0.0"
)

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

# Enhanced Pydantic models
class EnhancedUserProfile(BaseModel):
    user_id: str
    browsing_history: List[dict]
    location_data: dict
    conversation_preferences: dict
    behavioral_traits: dict
    engagement_metrics: dict
    last_updated: str

class ContextData(BaseModel):
    user_id: str
    conversation_id: str
    message_content: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = {}

class BehaviorEvent(BaseModel):
    user_id: str
    event_type: str
    event_data: Dict[str, Any]
    timestamp: str
    session_id: Optional[str] = None

class SegmentationRequest(BaseModel):
    algorithm: str
    parameters: Dict[str, Any]
    user_ids: Optional[List[str]] = None

class RealtimeRecommendationRequest(BaseModel):
    user_id: str
    context: Dict[str, Any]
    conversation_id: str
    limit: int = 5

class ABTestRequest(BaseModel):
    test_name: str
    description: str
    variants: List[Dict[str, Any]]
    target_audience: Dict[str, Any]
    metrics: List[str]
    duration_days: int

class ExportRequest(BaseModel):
    format: str
    data_type: str
    filters: Dict[str, Any]
    include_metadata: bool = True

class UserSegment(BaseModel):
    segment_id: str
    name: str
    description: str
    user_count: int
    criteria: Dict[str, Any]
    created_at: str

class BehaviorInsight(BaseModel):
    user_id: str
    insight_type: str
    insight_data: Dict[str, Any]
    confidence_score: float
    generated_at: str

# Health check endpoint
@app.get("/health")
async def health_check():
    """Enhanced health check endpoint"""
    return {
        "status": "healthy",
        "service": "enhanced-personalization",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "user_profile": "active",
            "behavior_analysis": "active",
            "segmentation": "active",
            "realtime": "active",
            "ab_testing": "active",
            "performance_monitor": "active",
            "data_export": "active"
        }
    }

# Enhanced user profile endpoints
@app.post("/user-profile")
async def create_enhanced_user_profile(profile: EnhancedUserProfile):
    """Create enhanced user profile with behavioral traits"""
    try:
        result = await enhanced_user_profile.create_enhanced_profile(profile.dict())
        return result
    except Exception as e:
        logger.error(f"Error creating enhanced user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/{user_id}")
async def get_enhanced_user_profile(user_id: str):
    """Get enhanced user profile with behavioral analysis"""
    try:
        profile = await enhanced_user_profile.get_enhanced_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        return profile
    except Exception as e:
        logger.error(f"Error getting enhanced user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/user-profile/{user_id}")
async def update_enhanced_user_profile(user_id: str, profile: EnhancedUserProfile):
    """Update enhanced user profile"""
    try:
        result = await enhanced_user_profile.update_enhanced_profile(user_id, profile.dict())
        return result
    except Exception as e:
        logger.error(f"Error updating enhanced user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/{user_id}/behavioral-traits")
async def get_behavioral_traits(user_id: str):
    """Get behavioral traits for a user"""
    try:
        traits = await enhanced_user_profile.get_behavioral_traits(user_id)
        return {"user_id": user_id, "behavioral_traits": traits}
    except Exception as e:
        logger.error(f"Error getting behavioral traits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-profile/{user_id}/engagement-metrics")
async def get_engagement_metrics(user_id: str, days: int = 30):
    """Get engagement metrics for a user"""
    try:
        metrics = await enhanced_user_profile.get_engagement_metrics(user_id, days)
        return {"user_id": user_id, "engagement_metrics": metrics, "days": days}
    except Exception as e:
        logger.error(f"Error getting engagement metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Behavior analysis endpoints
@app.post("/behavior/events")
async def track_behavior_event(event: BehaviorEvent):
    """Track user behavior events"""
    try:
        result = await behavior_analysis.track_event(event.dict())
        return result
    except Exception as e:
        logger.error(f"Error tracking behavior event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/behavior/events/{user_id}")
async def get_user_behavior_events(user_id: str, limit: int = 100):
    """Get behavior events for a user"""
    try:
        events = await behavior_analysis.get_user_events(user_id, limit)
        return {"user_id": user_id, "events": events, "total": len(events)}
    except Exception as e:
        logger.error(f"Error getting behavior events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/behavior/insights/{user_id}")
async def get_behavior_insights(user_id: str):
    """Get behavior insights for a user"""
    try:
        insights = await behavior_analysis.get_insights(user_id)
        return {"user_id": user_id, "insights": insights}
    except Exception as e:
        logger.error(f"Error getting behavior insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/behavior/insights/{user_id}/generate")
async def generate_behavior_insights(user_id: str, background_tasks: BackgroundTasks):
    """Generate behavior insights for a user"""
    try:
        background_tasks.add_task(behavior_analysis.generate_insights, user_id)
        return {"message": "Insight generation started", "user_id": user_id}
    except Exception as e:
        logger.error(f"Error generating behavior insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Segmentation endpoints
@app.post("/segmentation/create")
async def create_user_segmentation(request: SegmentationRequest):
    """Create user segmentation"""
    try:
        result = await segmentation_engine.create_segmentation(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error creating segmentation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segmentation/list")
async def list_segments():
    """List all user segments"""
    try:
        segments = await segmentation_engine.list_segments()
        return {"segments": segments}
    except Exception as e:
        logger.error(f"Error listing segments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segmentation/{segment_id}/users")
async def get_segment_users(segment_id: str, limit: int = 100):
    """Get users in a segment"""
    try:
        users = await segmentation_engine.get_segment_users(segment_id, limit)
        return {"segment_id": segment_id, "users": users, "total": len(users)}
    except Exception as e:
        logger.error(f"Error getting segment users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/segmentation/{segment_id}")
async def update_segment(segment_id: str, criteria: Dict[str, Any]):
    """Update segment criteria"""
    try:
        result = await segmentation_engine.update_segment(segment_id, criteria)
        return result
    except Exception as e:
        logger.error(f"Error updating segment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/segmentation/{segment_id}")
async def delete_segment(segment_id: str):
    """Delete a segment"""
    try:
        result = await segmentation_engine.delete_segment(segment_id)
        return result
    except Exception as e:
        logger.error(f"Error deleting segment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Real-time personalization endpoints
@app.post("/realtime/recommendations")
async def get_realtime_recommendations(request: RealtimeRecommendationRequest):
    """Get real-time personalized recommendations"""
    try:
        recommendations = await realtime_personalization.get_recommendations(
            request.user_id, request.context, request.conversation_id, request.limit
        )
        return {"recommendations": recommendations}
    except Exception as e:
        logger.error(f"Error getting realtime recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/realtime/personalize")
async def personalize_content(request: Dict[str, Any]):
    """Personalize content in real-time"""
    try:
        result = await realtime_personalization.personalize_content(request)
        return result
    except Exception as e:
        logger.error(f"Error personalizing content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/realtime/{user_id}/preferences")
async def get_realtime_preferences(user_id: str):
    """Get real-time user preferences"""
    try:
        preferences = await realtime_personalization.get_preferences(user_id)
        return {"user_id": user_id, "preferences": preferences}
    except Exception as e:
        logger.error(f"Error getting realtime preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# A/B testing endpoints
@app.post("/ab-testing/create")
async def create_ab_test(request: ABTestRequest):
    """Create A/B test"""
    try:
        result = await ab_testing.create_test(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error creating A/B test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ab-testing/list")
async def list_ab_tests():
    """List all A/B tests"""
    try:
        tests = await ab_testing.list_tests()
        return {"tests": tests}
    except Exception as e:
        logger.error(f"Error listing A/B tests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ab-testing/{test_id}/status")
async def get_ab_test_status(test_id: str):
    """Get A/B test status"""
    try:
        status = await ab_testing.get_test_status(test_id)
        return {"test_id": test_id, "status": status}
    except Exception as e:
        logger.error(f"Error getting A/B test status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ab-testing/{test_id}/assign")
async def assign_user_to_ab_test(test_id: str, user_id: str):
    """Assign user to A/B test"""
    try:
        result = await ab_testing.assign_user(test_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Error assigning user to A/B test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ab-testing/{test_id}/results")
async def get_ab_test_results(test_id: str):
    """Get A/B test results"""
    try:
        results = await ab_testing.get_test_results(test_id)
        return {"test_id": test_id, "results": results}
    except Exception as e:
        logger.error(f"Error getting A/B test results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Data export endpoints
@app.post("/export")
async def export_personalization_data(request: ExportRequest):
    """Export personalization data"""
    try:
        result = await data_export.export_data(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export/formats")
async def get_export_formats():
    """Get available export formats"""
    try:
        formats = await data_export.get_available_formats()
        return {"formats": formats}
    except Exception as e:
        logger.error(f"Error getting export formats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/export/templates/{format}")
async def get_export_template(format: str):
    """Get export template for a format"""
    try:
        template = await data_export.get_export_template(format)
        return {"format": format, "template": template}
    except Exception as e:
        logger.error(f"Error getting export template: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/analytics/user/{user_id}/summary")
async def get_user_analytics_summary(user_id: str, days: int = 30):
    """Get user analytics summary"""
    try:
        summary = await enhanced_user_profile.get_analytics_summary(user_id, days)
        return {"user_id": user_id, "summary": summary, "days": days}
    except Exception as e:
        logger.error(f"Error getting user analytics summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/segment/{segment_id}/performance")
async def get_segment_performance(segment_id: str, days: int = 30):
    """Get segment performance metrics"""
    try:
        performance = await segmentation_engine.get_segment_performance(segment_id, days)
        return {"segment_id": segment_id, "performance": performance, "days": days}
    except Exception as e:
        logger.error(f"Error getting segment performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/system/health")
async def get_system_health():
    """Get system health metrics"""
    try:
        health = await performance_monitor.get_system_health()
        return health
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background tasks
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        logger.info("Starting Enhanced Personalization Service...")
        
        # Start performance monitoring
        await performance_monitor.start_monitoring(interval=60)
        
        # Initialize behavior analysis
        await behavior_analysis.initialize()
        
        # Initialize segmentation engine
        await segmentation_engine.initialize()
        
        # Initialize real-time personalization
        await realtime_personalization.initialize()
        
        # Initialize A/B testing
        await ab_testing.initialize()
        
        logger.info("Enhanced Personalization Service started successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        logger.info("Shutting down Enhanced Personalization Service...")
        
        # Stop performance monitoring
        await performance_monitor.stop_monitoring()
        
        # Cleanup behavior analysis
        await behavior_analysis.cleanup()
        
        # Cleanup segmentation engine
        await segmentation_engine.cleanup()
        
        # Cleanup real-time personalization
        await realtime_personalization.cleanup()
        
        # Cleanup A/B testing
        await ab_testing.cleanup()
        
        logger.info("Enhanced Personalization Service shutdown complete")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

if __name__ == "__main__":
    uvicorn.run(
        "enhanced_main:app",
        host="0.0.0.0",
        port=3005,
        reload=True,
        log_level="info"
    )