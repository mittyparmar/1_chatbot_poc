from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
from datetime import datetime
import logging

from services.ab_testing_service import ABTestingService, ExperimentStatus, MetricType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ab-testing", tags=["ab-testing"])

# Initialize A/B testing service
ab_testing_service = ABTestingService()

class ExperimentCreateRequest(BaseModel):
    name: str
    description: str = ""
    variants: List[Dict[str, Any]]
    metrics: List[Dict[str, Any]]
    start_date: str
    end_date: Optional[str] = None
    created_by: str = "system"
    config: Dict[str, Any] = {}

class ExperimentResponse(BaseModel):
    experiment_id: str
    status: str
    message: str

class UserAssignmentRequest(BaseModel):
    experiment_id: str
    user_id: str

class EventTrackingRequest(BaseModel):
    experiment_id: str
    user_id: str
    variant_name: str
    event_name: str
    event_value: float = 1.0
    event_data: Dict[str, Any] = {}

class ExperimentResultsResponse(BaseModel):
    experiment_id: str
    experiment_name: str
    status: str
    results: Dict[str, Any]
    summary: Dict[str, Any]
    conclusions: List[str]

@router.on_event("startup")
async def startup_event():
    """Initialize A/B testing service on startup"""
    try:
        await ab_testing_service.initialize()
        logger.info("A/B Testing service initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing A/B Testing service: {e}")
        raise

@router.on_event("shutdown")
async def shutdown_event():
    """Cleanup A/B testing service on shutdown"""
    try:
        await ab_testing_service.cleanup()
        logger.info("A/B Testing service cleanup complete")
    except Exception as e:
        logger.error(f"Error during A/B Testing service cleanup: {e}")

@router.get("/health")
async def get_ab_testing_health():
    """Get A/B testing service health status"""
    try:
        health = await ab_testing_service.get_experiment_health()
        return health
    except Exception as e:
        logger.error(f"Error getting A/B testing health: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments", response_model=ExperimentResponse)
async def create_experiment(
    experiment_request: ExperimentCreateRequest,
    background_tasks: BackgroundTasks
):
    """Create a new A/B test experiment"""
    try:
        experiment_data = experiment_request.dict()
        
        # Validate experiment data
        if not ab_testing_service._validate_experiment_data(experiment_data):
            raise HTTPException(status_code=400, detail="Invalid experiment data")
        
        # Create experiment
        result = await ab_testing_service.create_experiment(experiment_data)
        
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments")
async def list_experiments(
    status: Optional[str] = None,
    limit: int = 50
):
    """List all experiments"""
    try:
        experiments = await ab_testing_service.list_experiments(status=status, limit=limit)
        return {
            "experiments": experiments,
            "total": len(experiments)
        }
    except Exception as e:
        logger.error(f"Error listing experiments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """Get experiment details"""
    try:
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Format experiment data
        formatted_experiment = {
            "id": experiment['id'],
            "name": experiment['name'],
            "description": experiment['description'],
            "status": experiment['status'],
            "variants": json.loads(experiment['variants']),
            "metrics": json.loads(experiment['metrics']),
            "start_date": experiment['start_date'].isoformat() if experiment['start_date'] else None,
            "end_date": experiment['end_date'].isoformat() if experiment['end_date'] else None,
            "created_by": experiment['created_by'],
            "created_at": experiment['created_at'].isoformat(),
            "updated_at": experiment['updated_at'].isoformat(),
            "config": json.loads(experiment['config'])
        }
        
        return formatted_experiment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/start", response_model=ExperimentResponse)
async def start_experiment(experiment_id: str):
    """Start an A/B test experiment"""
    try:
        result = await ab_testing_service.start_experiment(experiment_id)
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/pause", response_model=ExperimentResponse)
async def pause_experiment(experiment_id: str):
    """Pause an experiment"""
    try:
        result = await ab_testing_service.pause_experiment(experiment_id)
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error pausing experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/resume", response_model=ExperimentResponse)
async def resume_experiment(experiment_id: str):
    """Resume a paused experiment"""
    try:
        result = await ab_testing_service.resume_experiment(experiment_id)
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resuming experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/complete", response_model=ExperimentResponse)
async def complete_experiment(experiment_id: str):
    """Complete an experiment"""
    try:
        result = await ab_testing_service.complete_experiment(experiment_id)
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error completing experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/experiments/{experiment_id}", response_model=ExperimentResponse)
async def delete_experiment(experiment_id: str):
    """Delete an experiment"""
    try:
        result = await ab_testing_service.delete_experiment(experiment_id)
        return ExperimentResponse(
            experiment_id=result['experiment_id'],
            status=result['status'],
            message=result['message']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/assign", response_model=Dict[str, Any])
async def assign_user_to_variant(
    experiment_id: str,
    assignment_request: UserAssignmentRequest
):
    """Assign user to experiment variant"""
    try:
        result = await ab_testing_service.assign_user_to_variant(
            experiment_id, 
            assignment_request.user_id
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning user to variant: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/track", response_model=Dict[str, Any])
async def track_event(
    experiment_id: str,
    event_request: EventTrackingRequest
):
    """Track experiment event"""
    try:
        event_data = event_request.dict()
        event_data['experiment_id'] = experiment_id
        
        result = await ab_testing_service.track_event(event_data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/results", response_model=ExperimentResultsResponse)
async def get_experiment_results(experiment_id: str):
    """Get experiment results"""
    try:
        results = await ab_testing_service.get_experiment_results(experiment_id)
        return ExperimentResultsResponse(
            experiment_id=results['experiment_id'],
            experiment_name=results['experiment_name'],
            status=results['status'],
            results=results['results'],
            summary=results['summary'],
            conclusions=results['conclusions']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/metrics")
async def get_experiment_metrics(experiment_id: str):
    """Get experiment metrics data"""
    try:
        # Get experiment details
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Get metrics from database
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT variant_name, metric_name, metric_value, sample_size, 
                   confidence_interval_lower, confidence_interval_upper,
                   p_value, statistical_significance, calculated_at
            FROM ab_results 
            WHERE experiment_id = %s
            ORDER BY variant_name, metric_name, calculated_at DESC
            """, (experiment_id,))
            
            metrics_data = cursor.fetchall()
        
        # Format metrics data
        formatted_metrics = {}
        for metric in metrics_data:
            variant_name = metric['variant_name']
            metric_name = metric['metric_name']
            
            if variant_name not in formatted_metrics:
                formatted_metrics[variant_name] = {}
            
            formatted_metrics[variant_name][metric_name] = {
                "value": float(metric['metric_value']),
                "sample_size": int(metric['sample_size']),
                "confidence_interval": {
                    "lower": float(metric['confidence_interval_lower']) if metric['confidence_interval_lower'] else None,
                    "upper": float(metric['confidence_interval_upper']) if metric['confidence_interval_upper'] else None
                },
                "p_value": float(metric['p_value']) if metric['p_value'] else None,
                "statistical_significance": bool(metric['statistical_significance']),
                "calculated_at": metric['calculated_at'].isoformat() if metric['calculated_at'] else None
            }
        
        return {
            "experiment_id": experiment_id,
            "experiment_name": experiment['name'],
            "status": experiment['status'],
            "metrics": formatted_metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/assignments")
async def get_experiment_assignments(experiment_id: str):
    """Get experiment assignments"""
    try:
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT variant_name, COUNT(*) as count, 
                   COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed,
                   COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as active
            FROM ab_assignments 
            WHERE experiment_id = %s
            GROUP BY variant_name
            """, (experiment_id,))
            
            assignments_data = cursor.fetchall()
        
        # Format assignments data
        formatted_assignments = {}
        for assignment in assignments_data:
            variant_name = assignment['variant_name']
            formatted_assignments[variant_name] = {
                "total_assignments": int(assignment['count']),
                "completed_assignments": int(assignment['completed']),
                "active_assignments": int(assignment['active'])
            }
        
        return {
            "experiment_id": experiment_id,
            "assignments": formatted_assignments
        }
        
    except Exception as e:
        logger.error(f"Error getting experiment assignments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/events")
async def get_experiment_events(
    experiment_id: str,
    variant_name: Optional[str] = None,
    event_name: Optional[str] = None,
    limit: int = 100
):
    """Get experiment events"""
    try:
        query = """
        SELECT user_id, variant_name, event_name, event_data, timestamp
        FROM ab_events 
        WHERE experiment_id = %s
        """
        params = [experiment_id]
        
        if variant_name:
            query += " AND variant_name = %s"
            params.append(variant_name)
        
        if event_name:
            query += " AND event_name = %s"
            params.append(event_name)
        
        query += " ORDER BY timestamp DESC LIMIT %s"
        params.append(limit)
        
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute(query, params)
            
            events_data = cursor.fetchall()
        
        # Format events data
        formatted_events = []
        for event in events_data:
            formatted_events.append({
                "user_id": event['user_id'],
                "variant_name": event['variant_name'],
                "event_name": event['event_name'],
                "event_data": json.loads(event['event_data']) if event['event_data'] else {},
                "timestamp": event['timestamp'].isoformat()
            })
        
        return {
            "experiment_id": experiment_id,
            "events": formatted_events,
            "total": len(formatted_events)
        }
        
    except Exception as e:
        logger.error(f"Error getting experiment events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/summary")
async def get_experiment_summary(experiment_id: str):
    """Get experiment summary"""
    try:
        # Get experiment results
        results = await ab_testing_service.get_experiment_results(experiment_id)
        
        # Generate summary
        summary = {
            "experiment_id": experiment_id,
            "experiment_name": results['experiment_name'],
            "status": results['status'],
            "total_variants": results['summary']['total_variants'],
            "total_metrics": results['summary']['total_metrics'],
            "significant_findings": results['summary']['significant_findings'],
            "conclusions": results['conclusions'],
            "generated_at": datetime.now().isoformat()
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error getting experiment summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/export")
async def export_experiment_data(experiment_id: str, format: str = "json"):
    """Export experiment data"""
    try:
        # Get experiment data
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Get results
        results = await ab_testing_service.get_experiment_results(experiment_id)
        
        # Get assignments
        assignments = await get_experiment_assignments(experiment_id)
        
        # Get events
        events = await get_experiment_events(experiment_id, limit=1000)
        
        # Prepare export data
        export_data = {
            "experiment": {
                "id": experiment_id,
                "name": experiment['name'],
                "description": experiment['description'],
                "status": experiment['status'],
                "variants": json.loads(experiment['variants']),
                "metrics": json.loads(experiment['metrics']),
                "start_date": experiment['start_date'].isoformat() if experiment['start_date'] else None,
                "end_date": experiment['end_date'].isoformat() if experiment['end_date'] else None,
                "created_by": experiment['created_by'],
                "created_at": experiment['created_at'].isoformat(),
                "updated_at": experiment['updated_at'].isoformat()
            },
            "results": results['results'],
            "summary": results['summary'],
            "conclusions": results['conclusions'],
            "assignments": assignments['assignments'],
            "events": events['events'],
            "exported_at": datetime.now().isoformat()
        }
        
        # Format based on requested format
        if format.lower() == "json":
            return export_data
        elif format.lower() == "csv":
            # Convert to CSV format
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(["Experiment ID", "Experiment Name", "Status", "Variant", "Metric", "Value", "Sample Size", "P Value", "Significant"])
            
            # Write results
            for variant_name, metrics in results['results'].items():
                for metric_name, metric_data in metrics.items():
                    writer.writerow([
                        experiment_id,
                        experiment['name'],
                        experiment['status'],
                        variant_name,
                        metric_name,
                        metric_data['value'],
                        metric_data['sample_size'],
                        metric_data['p_value'],
                        metric_data['statistical_significance']
                    ])
            
            # Write assignments
            writer.writerow([])  # Empty row
            writer.writerow(["Variant", "Total Assignments", "Completed", "Active"])
            for variant_name, assignment_data in assignments['assignments'].items():
                writer.writerow([
                    variant_name,
                    assignment_data['total_assignments'],
                    assignment_data['completed_assignments'],
                    assignment_data['active_assignments']
                ])
            
            # Return CSV response
            from fastapi.responses import Response
            return Response(
                content=output.getvalue(),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=experiment_{experiment_id}.csv"}
            )
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported export format")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting experiment data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/variants/{variant_name}/metrics")
async def get_variant_metrics(experiment_id: str, variant_name: str):
    """Get metrics for a specific variant"""
    try:
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT metric_name, metric_value, sample_size, 
                   confidence_interval_lower, confidence_interval_upper,
                   p_value, statistical_significance, calculated_at
            FROM ab_results 
            WHERE experiment_id = %s AND variant_name = %s
            ORDER BY metric_name, calculated_at DESC
            """, (experiment_id, variant_name))
            
            metrics_data = cursor.fetchall()
        
        # Format metrics data
        formatted_metrics = {}
        for metric in metrics_data:
            metric_name = metric['metric_name']
            formatted_metrics[metric_name] = {
                "value": float(metric['metric_value']),
                "sample_size": int(metric['sample_size']),
                "confidence_interval": {
                    "lower": float(metric['confidence_interval_lower']) if metric['confidence_interval_lower'] else None,
                    "upper": float(metric['confidence_interval_upper']) if metric['confidence_interval_upper'] else None
                },
                "p_value": float(metric['p_value']) if metric['p_value'] else None,
                "statistical_significance": bool(metric['statistical_significance']),
                "calculated_at": metric['calculated_at'].isoformat() if metric['calculated_at'] else None
            }
        
        return {
            "experiment_id": experiment_id,
            "variant_name": variant_name,
            "metrics": formatted_metrics
        }
        
    except Exception as e:
        logger.error(f"Error getting variant metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/variants/{variant_name}/events")
async def get_variant_events(
    experiment_id: str,
    variant_name: str,
    event_name: Optional[str] = None,
    limit: int = 100
):
    """Get events for a specific variant"""
    try:
        query = """
        SELECT user_id, event_name, event_data, timestamp
        FROM ab_events 
        WHERE experiment_id = %s AND variant_name = %s
        """
        params = [experiment_id, variant_name]
        
        if event_name:
            query += " AND event_name = %s"
            params.append(event_name)
        
        query += " ORDER BY timestamp DESC LIMIT %s"
        params.append(limit)
        
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute(query, params)
            
            events_data = cursor.fetchall()
        
        # Format events data
        formatted_events = []
        for event in events_data:
            formatted_events.append({
                "user_id": event['user_id'],
                "event_name": event['event_name'],
                "event_data": json.loads(event['event_data']) if event['event_data'] else {},
                "timestamp": event['timestamp'].isoformat()
            })
        
        return {
            "experiment_id": experiment_id,
            "variant_name": variant_name,
            "events": formatted_events,
            "total": len(formatted_events)
        }
        
    except Exception as e:
        logger.error(f"Error getting variant events: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/variants/{variant_name}/assignments")
async def get_variant_assignments(experiment_id: str, variant_name: str):
    """Get assignments for a specific variant"""
    try:
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed,
                   COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as active,
                   MIN(assigned_at) as first_assignment,
                   MAX(assigned_at) as last_assignment
            FROM ab_assignments 
            WHERE experiment_id = %s AND variant_name = %s
            """, (experiment_id, variant_name))
            
            assignment_data = cursor.fetchone()
        
        if not assignment_data:
            raise HTTPException(status_code=404, detail="No assignments found for this variant")
        
        # Format assignment data
        formatted_assignment = {
            "variant_name": variant_name,
            "total_assignments": int(assignment_data['total']),
            "completed_assignments": int(assignment_data['completed']),
            "active_assignments": int(assignment_data['active']),
            "first_assignment": assignment_data['first_assignment'].isoformat() if assignment_data['first_assignment'] else None,
            "last_assignment": assignment_data['last_assignment'].isoformat() if assignment_data['last_assignment'] else None
        }
        
        return {
            "experiment_id": experiment_id,
            "variant_name": variant_name,
            "assignments": formatted_assignment
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting variant assignments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/variants")
async def get_experiment_variants(experiment_id: str):
    """Get experiment variants"""
    try:
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        variants = json.loads(experiment['variants'])
        
        # Get assignment counts for each variant
        variant_assignments = {}
        for variant in variants:
            variant_name = variant['name']
            
            with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
                cursor.execute("""
                SELECT COUNT(*) as count
                FROM ab_assignments 
                WHERE experiment_id = %s AND variant_name = %s
                """, (experiment_id, variant_name))
                
                assignment_count = cursor.fetchone()['count']
                variant_assignments[variant_name] = assignment_count
        
        # Format variants with assignment counts
        formatted_variants = []
        for variant in variants:
            formatted_variant = {
                "name": variant['name'],
                "weight": variant['weight'],
                "description": variant.get('description', ''),
                "config": variant.get('config', {}),
                "assignment_count": variant_assignments.get(variant['name'], 0)
            }
            formatted_variants.append(formatted_variant)
        
        return {
            "experiment_id": experiment_id,
            "variants": formatted_variants
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment variants: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/metrics/{metric_name}")
async def get_experiment_metric(experiment_id: str, metric_name: str):
    """Get specific metric data for an experiment"""
    try:
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT variant_name, metric_value, sample_size, 
                   confidence_interval_lower, confidence_interval_upper,
                   p_value, statistical_significance, calculated_at
            FROM ab_results 
            WHERE experiment_id = %s AND metric_name = %s
            ORDER BY variant_name, calculated_at DESC
            """, (experiment_id, metric_name))
            
            metric_data = cursor.fetchall()
        
        if not metric_data:
            raise HTTPException(status_code=404, detail="Metric not found")
        
        # Format metric data
        formatted_metric = {}
        for data in metric_data:
            variant_name = data['variant_name']
            formatted_metric[variant_name] = {
                "value": float(data['metric_value']),
                "sample_size": int(data['sample_size']),
                "confidence_interval": {
                    "lower": float(data['confidence_interval_lower']) if data['confidence_interval_lower'] else None,
                    "upper": float(data['confidence_interval_upper']) if data['confidence_interval_upper'] else None
                },
                "p_value": float(data['p_value']) if data['p_value'] else None,
                "statistical_significance": bool(data['statistical_significance']),
                "calculated_at": data['calculated_at'].isoformat() if data['calculated_at'] else None
            }
        
        return {
            "experiment_id": experiment_id,
            "metric_name": metric_name,
            "variants": formatted_metric
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment metric: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/stats")
async def get_experiment_stats(experiment_id: str):
    """Get experiment statistics"""
    try:
        # Get experiment details
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Get basic statistics
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            # Total assignments
            cursor.execute("""
            SELECT COUNT(*) as total_assignments
            FROM ab_assignments 
            WHERE experiment_id = %s
            """, (experiment_id,))
            total_assignments = cursor.fetchone()['total_assignments']
            
            # Completed assignments
            cursor.execute("""
            SELECT COUNT(*) as completed_assignments
            FROM ab_assignments 
            WHERE experiment_id = %s AND completed_at IS NOT NULL
            """, (experiment_id,))
            completed_assignments = cursor.fetchone()['completed_assignments']
            
            # Total events
            cursor.execute("""
            SELECT COUNT(*) as total_events
            FROM ab_events 
            WHERE experiment_id = %s
            """, (experiment_id,))
            total_events = cursor.fetchone()['total_events']
            
            # Events by type
            cursor.execute("""
            SELECT event_name, COUNT(*) as count
            FROM ab_events 
            WHERE experiment_id = %s
            GROUP BY event_name
            ORDER BY count DESC
            """, (experiment_id,))
            events_by_type = cursor.fetchall()
        
        # Get variant distribution
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT variant_name, COUNT(*) as count
            FROM ab_assignments 
            WHERE experiment_id = %s
            GROUP BY variant_name
            """, (experiment_id,))
            variant_distribution = cursor.fetchall()
        
        # Format statistics
        stats = {
            "experiment_id": experiment_id,
            "experiment_name": experiment['name'],
            "status": experiment['status'],
            "basic_stats": {
                "total_assignments": total_assignments,
                "completed_assignments": completed_assignments,
                "active_assignments": total_assignments - completed_assignments,
                "completion_rate": (completed_assignments / total_assignments * 100) if total_assignments > 0 else 0,
                "total_events": total_events
            },
            "events_by_type": [
                {"event_name": event['event_name'], "count": event['count']}
                for event in events_by_type
            ],
            "variant_distribution": [
                {"variant_name": variant['variant_name'], "count": variant['count']}
                for variant in variant_distribution
            ],
            "generated_at": datetime.now().isoformat()
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/timeline")
async def get_experiment_timeline(experiment_id: str):
    """Get experiment timeline"""
    try:
        # Get experiment details
        experiment = await ab_testing_service._get_experiment(experiment_id)
        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")
        
        # Get timeline events
        timeline_events = []
        
        # Experiment creation
        timeline_events.append({
            "type": "created",
            "timestamp": experiment['created_at'].isoformat(),
            "description": f"Experiment '{experiment['name']}' created"
        })
        
        # Experiment start
        if experiment['start_date']:
            timeline_events.append({
                "type": "started",
                "timestamp": experiment['start_date'].isoformat(),
                "description": f"Experiment started"
            })
        
        # Experiment end
        if experiment['end_date']:
            timeline_events.append({
                "type": "ended",
                "timestamp": experiment['end_date'].isoformat(),
                "description": f"Experiment ended"
            })
        
        # Status changes
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT status, updated_at
            FROM ab_experiments 
            WHERE id = %s
            ORDER BY updated_at DESC
            """, (experiment_id,))
            
            status_changes = cursor.fetchall()
            
            for status_change in status_changes:
                timeline_events.append({
                    "type": "status_change",
                    "timestamp": status_change['updated_at'].isoformat(),
                    "description": f"Status changed to {status_change['status']}"
                })
        
        # Sort by timestamp
        timeline_events.sort(key=lambda x: x['timestamp'])
        
        return {
            "experiment_id": experiment_id,
            "experiment_name": experiment['name'],
            "timeline": timeline_events
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting experiment timeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/{experiment_id}/recommendations")
async def get_experiment_recommendations(experiment_id: str):
    """Get experiment recommendations"""
    try:
        # Get experiment results
        results = await ab_testing_service.get_experiment_results(experiment_id)
        
        # Generate recommendations
        recommendations = []
        
        # Check for significant findings
        if results['summary']['significant_findings']:
            for finding in results['summary']['significant_findings']:
                recommendations.append({
                    "type": "significant_improvement",
                    "priority": "high",
                    "variant": finding['variant'],
                    "metric": finding['metric'],
                    "improvement": finding['improvement'],
                    "recommendation": f"Consider implementing variant {finding['variant']} as it shows significant improvement in {finding['metric']}"
                })
        
        # Check for low sample size
        total_sample_size = sum(
            metric['sample_size'] 
            for variant in results['results'].values() 
            for metric in variant.values()
        )
        
        if total_sample_size < 1000:
            recommendations.append({
                "type": "sample_size_warning",
                "priority": "medium",
                "recommendation": "Sample size is low - consider running the experiment longer or increasing traffic"
            })
        
        # Check for completion rate
        with ab_testing_service.connection.cursor(cursor_factory=ab_testing_service.connection.cursor_factory) as cursor:
            cursor.execute("""
            SELECT COUNT(*) as total, COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed
            FROM ab_assignments 
            WHERE experiment_id = %s
            """, (experiment_id,))
            
            assignment_data = cursor.fetchone()
            completion_rate = (assignment_data['completed'] / assignment_data['total'] * 100) if assignment_data['total'] > 0 else 0
        
        if completion_rate < 50:
            recommendations.append({
                "type": "completion_rate_warning",
                "priority": "medium",
                "completion_rate": completion_rate,
                "recommendation": f"Completion rate is low ({completion_rate:.1f}%) - consider improving user engagement"
            })
        
        # Check for metric consistency
        metric_consistency = {}
        for variant_name, metrics in results['results'].items():
            for metric_name, metric_data in metrics.items():
                if metric_name not in metric_consistency:
                    metric_consistency[metric_name] = []
                metric_consistency[metric_name].append(metric_data['value'])
        
        inconsistent_metrics = []
        for metric_name, values in metric_consistency.items():
            if len(values) > 1:
                coefficient_of_variation = (np.std(values) / np.mean(values)) if np.mean(values) != 0 else 0
                if coefficient_of_variation > 0.5:  # High variation
                    inconsistent_metrics.append({
                        "metric": metric_name,
                        "coefficient_of_variation": coefficient_of_variation,
                        "values": values
                    })
        
        if inconsistent_metrics:
            recommendations.append({
                "type": "metric_inconsistency",
                "priority": "low",
                "inconsistent_metrics": inconsistent_metrics,
                "recommendation": "Some metrics show high variation between variants - investigate potential confounding factors"
            })
        
        return {
            "experiment_id": experiment_id,
            "experiment_name": results['experiment_name'],
            "status": results['status'],
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting experiment recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))