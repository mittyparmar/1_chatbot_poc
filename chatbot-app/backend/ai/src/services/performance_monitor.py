import time
import psutil
import logging
import json
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict, deque
import threading
from dataclasses import dataclass
from enum import Enum

class MetricType(Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

@dataclass
class Metric:
    name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str]
    metric_type: MetricType

class PerformanceMonitor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.metrics_history = defaultdict(lambda: deque(maxlen=1000))
        self.alerts = []
        self.thresholds = {
            "cpu_usage": 80.0,
            "memory_usage": 85.0,
            "disk_usage": 90.0,
            "response_time": 1000.0,  # ms
            "error_rate": 5.0,  # percentage
            "throughput": 1000  # requests per minute
        }
        self.is_monitoring = False
        self.monitoring_thread = None
        self.system_metrics = {}
        self.service_metrics = {}
        self.ai_metrics = {}
        
    async def start_monitoring(self, interval: int = 60):
        """Start performance monitoring"""
        try:
            self.is_monitoring = True
            self.monitoring_thread = threading.Thread(
                target=self._monitoring_loop,
                args=(interval,),
                daemon=True
            )
            self.monitoring_thread.start()
            self.logger.info(f"Started performance monitoring with {interval}s interval")
            
        except Exception as e:
            self.logger.error(f"Error starting performance monitoring: {e}")
    
    async def stop_monitoring(self):
        """Stop performance monitoring"""
        try:
            self.is_monitoring = False
            if self.monitoring_thread:
                self.monitoring_thread.join(timeout=5)
            self.logger.info("Stopped performance monitoring")
            
        except Exception as e:
            self.logger.error(f"Error stopping performance monitoring: {e}")
    
    def _monitoring_loop(self, interval: int):
        """Main monitoring loop"""
        while self.is_monitoring:
            try:
                # Collect system metrics
                self._collect_system_metrics()
                
                # Collect service metrics
                self._collect_service_metrics()
                
                # Collect AI-specific metrics
                self._collect_ai_metrics()
                
                # Check thresholds
                self._check_thresholds()
                
                # Sleep for interval
                time.sleep(interval)
                
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                time.sleep(interval)
    
    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            cpu_freq = psutil.cpu_freq()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # Disk metrics
            disk_usage = psutil.disk_usage('/')
            disk_io = psutil.disk_io_counters()
            
            # Network metrics
            network_io = psutil.net_io_counters()
            
            # Process metrics
            process = psutil.Process()
            process_memory = process.memory_info()
            process_cpu = process.cpu_percent()
            
            # Store metrics
            timestamp = datetime.utcnow()
            
            system_metrics = {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": cpu_count,
                    "frequency_mhz": cpu_freq.current if cpu_freq else 0
                },
                "memory": {
                    "total_bytes": memory.total,
                    "available_bytes": memory.available,
                    "used_bytes": memory.used,
                    "percent": memory.percent,
                    "swap_total_bytes": swap.total,
                    "swap_used_bytes": swap.used,
                    "swap_percent": swap.percent
                },
                "disk": {
                    "total_bytes": disk_usage.total,
                    "used_bytes": disk_usage.used,
                    "free_bytes": disk_usage.free,
                    "percent": disk_usage.percent,
                    "read_bytes": disk_io.read_bytes if disk_io else 0,
                    "write_bytes": disk_io.write_bytes if disk_io else 0
                },
                "network": {
                    "bytes_sent": network_io.bytes_sent,
                    "bytes_recv": network_io.bytes_recv,
                    "packets_sent": network_io.packets_sent,
                    "packets_recv": network_io.packets_recv
                },
                "process": {
                    "memory_rss_bytes": process_memory.rss,
                    "memory_vms_bytes": process_memory.vms,
                    "cpu_percent": process_cpu
                }
            }
            
            self.system_metrics = system_metrics
            
            # Record metrics
            self._record_metric("system.cpu_usage", cpu_percent, timestamp, {"type": "system"})
            self._record_metric("system.memory_usage", memory.percent, timestamp, {"type": "system"})
            self._record_metric("system.disk_usage", disk_usage.percent, timestamp, {"type": "system"})
            self._record_metric("system.process_memory", process_memory.rss / 1024 / 1024, timestamp, {"type": "system", "unit": "MB"})
            
        except Exception as e:
            self.logger.error(f"Error collecting system metrics: {e}")
    
    def _collect_service_metrics(self):
        """Collect service performance metrics"""
        try:
            timestamp = datetime.utcnow()
            
            # Mock service metrics (in real implementation, these would come from actual services)
            service_metrics = {
                "gateway": {
                    "requests_per_second": 150,
                    "average_response_time": 45.2,
                    "error_rate": 0.5,
                    "active_connections": 45
                },
                "auth": {
                    "requests_per_second": 25,
                    "average_response_time": 12.3,
                    "error_rate": 0.2,
                    "active_sessions": 120
                },
                "chat": {
                    "messages_per_second": 8.5,
                    "average_response_time": 23.1,
                    "error_rate": 0.1,
                    "active_connections": 85
                },
                "admin": {
                    "requests_per_second": 12,
                    "average_response_time": 67.8,
                    "error_rate": 0.3,
                    "active_users": 15
                }
            }
            
            self.service_metrics = service_metrics
            
            # Record metrics
            for service, metrics in service_metrics.items():
                self._record_metric(f"service.{service}.requests_per_second", 
                                  metrics["requests_per_second"], timestamp, {"service": service})
                self._record_metric(f"service.{service}.average_response_time", 
                                  metrics["average_response_time"], timestamp, {"service": service, "unit": "ms"})
                self._record_metric(f"service.{service}.error_rate", 
                                  metrics["error_rate"], timestamp, {"service": service, "unit": "percent"})
                
        except Exception as e:
            self.logger.error(f"Error collecting service metrics: {e}")
    
    def _collect_ai_metrics(self):
        """Collect AI-specific performance metrics"""
        try:
            timestamp = datetime.utcnow()
            
            # Mock AI metrics (in real implementation, these would come from AI services)
            ai_metrics = {
                "nlp_processing": {
                    "requests_per_second": 45,
                    "average_processing_time": 156.7,
                    "accuracy": 0.94,
                    "error_rate": 0.8
                },
                "intent_recognition": {
                    "requests_per_second": 42,
                    "average_processing_time": 23.4,
                    "accuracy": 0.96,
                    "error_rate": 0.6
                },
                "sentiment_analysis": {
                    "requests_per_second": 38,
                    "average_processing_time": 18.9,
                    "accuracy": 0.92,
                    "error_rate": 0.7
                },
                "response_generation": {
                    "requests_per_second": 40,
                    "average_processing_time": 89.2,
                    "quality_score": 0.88,
                    "error_rate": 0.5
                }
            }
            
            self.ai_metrics = ai_metrics
            
            # Record metrics
            for component, metrics in ai_metrics.items():
                self._record_metric(f"ai.{component}.requests_per_second", 
                                  metrics["requests_per_second"], timestamp, {"component": component})
                self._record_metric(f"ai.{component}.average_processing_time", 
                                  metrics["average_processing_time"], timestamp, {"component": component, "unit": "ms"})
                
                if "accuracy" in metrics:
                    self._record_metric(f"ai.{component}.accuracy", 
                                      metrics["accuracy"], timestamp, {"component": component})
                if "quality_score" in metrics:
                    self._record_metric(f"ai.{component}.quality_score", 
                                      metrics["quality_score"], timestamp, {"component": component})
                if "error_rate" in metrics:
                    self._record_metric(f"ai.{component}.error_rate", 
                                      metrics["error_rate"], timestamp, {"component": component, "unit": "percent"})
                
        except Exception as e:
            self.logger.error(f"Error collecting AI metrics: {e}")
    
    def _check_thresholds(self):
        """Check if metrics exceed thresholds"""
        try:
            timestamp = datetime.utcnow()
            
            # Check system thresholds
            if self.system_metrics:
                if self.system_metrics["cpu"]["usage_percent"] > self.thresholds["cpu_usage"]:
                    self._create_alert("HIGH_CPU_USAGE", 
                                     f"CPU usage is {self.system_metrics['cpu']['usage_percent']}%", 
                                     timestamp, {"type": "system", "metric": "cpu_usage"})
                
                if self.system_metrics["memory"]["percent"] > self.thresholds["memory_usage"]:
                    self._create_alert("HIGH_MEMORY_USAGE", 
                                     f"Memory usage is {self.system_metrics['memory']['percent']}%", 
                                     timestamp, {"type": "system", "metric": "memory_usage"})
                
                if self.system_metrics["disk"]["percent"] > self.thresholds["disk_usage"]:
                    self._create_alert("HIGH_DISK_USAGE", 
                                     f"Disk usage is {self.system_metrics['disk']['percent']}%", 
                                     timestamp, {"type": "system", "metric": "disk_usage"})
            
            # Check service thresholds
            if self.service_metrics:
                for service, metrics in self.service_metrics.items():
                    if metrics["error_rate"] > self.thresholds["error_rate"]:
                        self._create_alert("HIGH_ERROR_RATE", 
                                         f"{service} service error rate is {metrics['error_rate']}%", 
                                         timestamp, {"type": "service", "service": service, "metric": "error_rate"})
                    
                    if metrics["average_response_time"] > self.thresholds["response_time"]:
                        self._create_alert("HIGH_RESPONSE_TIME", 
                                         f"{service} service response time is {metrics['average_response_time']}ms", 
                                         timestamp, {"type": "service", "service": service, "metric": "response_time"})
            
            # Check AI thresholds
            if self.ai_metrics:
                for component, metrics in self.ai_metrics.items():
                    if metrics["error_rate"] > self.thresholds["error_rate"]:
                        self._create_alert("HIGH_AI_ERROR_RATE", 
                                         f"AI {component} error rate is {metrics['error_rate']}%", 
                                         timestamp, {"type": "ai", "component": component, "metric": "error_rate"})
                    
                    if metrics.get("average_processing_time", 0) > self.thresholds["response_time"] * 2:
                        self._create_alert("HIGH_AI_PROCESSING_TIME", 
                                         f"AI {component} processing time is {metrics['average_processing_time']}ms", 
                                         timestamp, {"type": "ai", "component": component, "metric": "processing_time"})
            
        except Exception as e:
            self.logger.error(f"Error checking thresholds: {e}")
    
    def _create_alert(self, alert_type: str, message: str, timestamp: datetime, tags: Dict[str, str]):
        """Create and store alert"""
        try:
            alert = {
                "id": f"{alert_type}_{int(timestamp.timestamp())}",
                "type": alert_type,
                "message": message,
                "timestamp": timestamp.isoformat(),
                "tags": tags,
                "severity": self._determine_alert_severity(alert_type),
                "resolved": False
            }
            
            self.alerts.append(alert)
            self.logger.warning(f"Alert created: {alert_type} - {message}")
            
            # Keep only last 100 alerts
            if len(self.alerts) > 100:
                self.alerts = self.alerts[-100:]
            
        except Exception as e:
            self.logger.error(f"Error creating alert: {e}")
    
    def _determine_alert_severity(self, alert_type: str) -> str:
        """Determine alert severity"""
        severity_map = {
            "HIGH_CPU_USAGE": "warning",
            "HIGH_MEMORY_USAGE": "warning",
            "HIGH_DISK_USAGE": "critical",
            "HIGH_ERROR_RATE": "critical",
            "HIGH_RESPONSE_TIME": "warning",
            "HIGH_AI_ERROR_RATE": "warning",
            "HIGH_AI_PROCESSING_TIME": "warning"
        }
        
        return severity_map.get(alert_type, "info")
    
    def _record_metric(self, name: str, value: float, timestamp: datetime, tags: Dict[str, str]):
        """Record a metric"""
        try:
            metric = Metric(
                name=name,
                value=value,
                timestamp=timestamp,
                tags=tags,
                metric_type=MetricType.GAUGE
            )
            
            self.metrics_history[name].append(metric)
            
        except Exception as e:
            self.logger.error(f"Error recording metric {name}: {e}")
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system metrics"""
        try:
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "metrics": self.system_metrics,
                "service_metrics": self.service_metrics,
                "ai_metrics": self.ai_metrics
            }
            
        except Exception as e:
            self.logger.error(f"Error getting system metrics: {e}")
            return {"error": str(e)}
    
    async def get_metrics_history(self, metric_name: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Get metrics history for a specific metric"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            history = []
            for metric in self.metrics_history.get(metric_name, []):
                if metric.timestamp >= cutoff_time:
                    history.append({
                        "name": metric.name,
                        "value": metric.value,
                        "timestamp": metric.timestamp.isoformat(),
                        "tags": metric.tags
                    })
            
            return sorted(history, key=lambda x: x["timestamp"])
            
        except Exception as e:
            self.logger.error(f"Error getting metrics history for {metric_name}: {e}")
            return []
    
    async def get_alerts(self, severity: Optional[str] = None, resolved: Optional[bool] = None) -> List[Dict[str, Any]]:
        """Get alerts with optional filtering"""
        try:
            alerts = self.alerts.copy()
            
            if severity:
                alerts = [alert for alert in alerts if alert["severity"] == severity]
            
            if resolved is not None:
                alerts = [alert for alert in alerts if alert["resolved"] == resolved]
            
            return sorted(alerts, key=lambda x: x["timestamp"], reverse=True)
            
        except Exception as e:
            self.logger.error(f"Error getting alerts: {e}")
            return []
    
    async def resolve_alert(self, alert_id: str) -> Dict[str, Any]:
        """Resolve an alert"""
        try:
            for alert in self.alerts:
                if alert["id"] == alert_id:
                    alert["resolved"] = True
                    alert["resolved_at"] = datetime.utcnow().isoformat()
                    self.logger.info(f"Resolved alert: {alert_id}")
                    return {"success": True, "message": f"Alert {alert_id} resolved"}
            
            return {"success": False, "message": f"Alert {alert_id} not found"}
            
        except Exception as e:
            self.logger.error(f"Error resolving alert {alert_id}: {e}")
            return {"success": False, "message": str(e)}
    
    async def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            summary = {
                "period": f"Last {hours} hours",
                "timestamp": datetime.utcnow().isoformat(),
                "system": {},
                "services": {},
                "ai_components": {},
                "alerts": {
                    "total": len(self.alerts),
                    "resolved": len([a for a in self.alerts if a["resolved"]]),
                    "unresolved": len([a for a in self.alerts if not a["resolved"]]),
                    "by_severity": {}
                }
            }
            
            # Calculate system summary
            if self.system_metrics:
                summary["system"] = {
                    "cpu_usage": self.system_metrics["cpu"]["usage_percent"],
                    "memory_usage": self.system_metrics["memory"]["percent"],
                    "disk_usage": self.system_metrics["disk"]["percent"],
                    "status": self._get_system_status()
                }
            
            # Calculate service summary
            if self.service_metrics:
                summary["services"] = {}
                for service, metrics in self.service_metrics.items():
                    summary["services"][service] = {
                        "requests_per_second": metrics["requests_per_second"],
                        "average_response_time": metrics["average_response_time"],
                        "error_rate": metrics["error_rate"],
                        "status": self._get_service_status(service, metrics)
                    }
            
            # Calculate AI component summary
            if self.ai_metrics:
                summary["ai_components"] = {}
                for component, metrics in self.ai_metrics.items():
                    summary["ai_components"][component] = {
                        "requests_per_second": metrics["requests_per_second"],
                        "average_processing_time": metrics["average_processing_time"],
                        "accuracy": metrics.get("accuracy", 0),
                        "error_rate": metrics["error_rate"],
                        "status": self._get_ai_status(component, metrics)
                    }
            
            # Calculate alert summary
            for alert in self.alerts:
                severity = alert["severity"]
                if severity not in summary["alerts"]["by_severity"]:
                    summary["alerts"]["by_severity"][severity] = 0
                summary["alerts"]["by_severity"][severity] += 1
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Error getting performance summary: {e}")
            return {"error": str(e)}
    
    def _get_system_status(self) -> str:
        """Get overall system status"""
        try:
            if not self.system_metrics:
                return "unknown"
            
            issues = []
            if self.system_metrics["cpu"]["usage_percent"] > self.thresholds["cpu_usage"]:
                issues.append("high_cpu")
            
            if self.system_metrics["memory"]["percent"] > self.thresholds["memory_usage"]:
                issues.append("high_memory")
            
            if self.system_metrics["disk"]["percent"] > self.thresholds["disk_usage"]:
                issues.append("high_disk")
            
            if issues:
                return "degraded"
            else:
                return "healthy"
                
        except Exception as e:
            self.logger.error(f"Error getting system status: {e}")
            return "unknown"
    
    def _get_service_status(self, service: str, metrics: Dict[str, Any]) -> str:
        """Get service status"""
        try:
            issues = []
            
            if metrics["error_rate"] > self.thresholds["error_rate"]:
                issues.append("high_error_rate")
            
            if metrics["average_response_time"] > self.thresholds["response_time"]:
                issues.append("high_response_time")
            
            if issues:
                return "degraded"
            else:
                return "healthy"
                
        except Exception as e:
            self.logger.error(f"Error getting service status for {service}: {e}")
            return "unknown"
    
    def _get_ai_status(self, component: str, metrics: Dict[str, Any]) -> str:
        """Get AI component status"""
        try:
            issues = []
            
            if metrics["error_rate"] > self.thresholds["error_rate"]:
                issues.append("high_error_rate")
            
            if metrics.get("average_processing_time", 0) > self.thresholds["response_time"] * 2:
                issues.append("high_processing_time")
            
            if issues:
                return "degraded"
            else:
                return "healthy"
                
        except Exception as e:
            self.logger.error(f"Error getting AI status for {component}: {e}")
            return "unknown"
    
    async def update_thresholds(self, new_thresholds: Dict[str, float]) -> Dict[str, Any]:
        """Update monitoring thresholds"""
        try:
            self.thresholds.update(new_thresholds)
            self.logger.info(f"Updated thresholds: {new_thresholds}")
            return {"success": True, "message": "Thresholds updated successfully"}
            
        except Exception as e:
            self.logger.error(f"Error updating thresholds: {e}")
            return {"success": False, "message": str(e)}
    
    async def export_metrics(self, format: str = "json", hours: int = 24) -> Dict[str, Any]:
        """Export metrics in specified format"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            export_data = {
                "export_timestamp": datetime.utcnow().isoformat(),
                "period": f"Last {hours} hours",
                "metrics": {},
                "alerts": self.alerts.copy()
            }
            
            # Collect all metrics for the period
            for metric_name, metrics in self.metrics_history.items():
                period_metrics = []
                for metric in metrics:
                    if metric.timestamp >= cutoff_time:
                        period_metrics.append({
                            "name": metric.name,
                            "value": metric.value,
                            "timestamp": metric.timestamp.isoformat(),
                            "tags": metric.tags
                        })
                
                if period_metrics:
                    export_data["metrics"][metric_name] = period_metrics
            
            if format.lower() == "json":
                return export_data
            else:
                # For other formats, return the data structure that can be converted
                return {"data": export_data, "format": format}
                
        except Exception as e:
            self.logger.error(f"Error exporting metrics: {e}")
            return {"error": str(e)}