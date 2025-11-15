import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from collections import defaultdict, Counter
import statistics
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import asyncio
import redis
from concurrent.futures import ThreadPoolExecutor
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

logger = logging.getLogger(__name__)

class AnalyticsService:
    def __init__(self):
        self.connection = self._get_connection()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.engine = self._create_sqlalchemy_engine()
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    def _create_sqlalchemy_engine(self):
        """Create SQLAlchemy engine for advanced analytics"""
        return create_engine(
            'postgresql://postgres:password@localhost:5432/chatbot',
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True
        )
    
    async def initialize(self):
        """Initialize analytics service"""
        try:
            # Create necessary tables if they don't exist
            await self._ensure_tables_exist()
            # Create materialized views for performance
            await self._create_materialized_views()
            logger.info("Analytics Service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Analytics Service: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            self.executor.shutdown(wait=True)
            logger.info("Analytics Service cleanup complete")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def _ensure_tables_exist(self):
        """Ensure necessary tables exist"""
        try:
            with self.connection.cursor() as cursor:
                # Create analytics events table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS analytics_events (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    event_type VARCHAR(100) NOT NULL,
                    user_id VARCHAR(255),
                    session_id VARCHAR(255),
                    data JSONB,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create user analytics table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_analytics (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id VARCHAR(255) NOT NULL,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value FLOAT NOT NULL,
                    period_type VARCHAR(20) NOT NULL,
                    period_start DATE NOT NULL,
                    period_end DATE NOT NULL,
                    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create conversation analytics table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversation_analytics (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    conversation_id VARCHAR(255) NOT NULL,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value FLOAT NOT NULL,
                    period_type VARCHAR(20) NOT NULL,
                    period_start DATE NOT NULL,
                    period_end DATE NOT NULL,
                    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create system metrics table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value FLOAT NOT NULL,
                    metric_unit VARCHAR(20),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    service VARCHAR(50),
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create custom reports table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS custom_reports (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    report_name VARCHAR(255) NOT NULL,
                    report_type VARCHAR(50) NOT NULL,
                    description TEXT,
                    query_template TEXT,
                    parameters JSONB DEFAULT '{}',
                    schedule JSONB DEFAULT '{}',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_by VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_run TIMESTAMP,
                    next_run TIMESTAMP
                )
                """)
                
                # Create report results table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS report_results (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    report_id UUID REFERENCES custom_reports(id),
                    result_data JSONB NOT NULL,
                    result_format VARCHAR(20) NOT NULL,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    file_path VARCHAR(500),
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                self.connection.commit()
                logger.info("Analytics tables created/verified")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error ensuring tables exist: {e}")
            raise
    
    async def _create_materialized_views(self):
        """Create materialized views for performance optimization"""
        try:
            with self.connection.cursor() as cursor:
                # Daily user activity view
                cursor.execute("""
                CREATE MATERIALIZED VIEW IF NOT EXISTS daily_user_activity AS
                SELECT 
                    DATE_TRUNC('day', timestamp) as activity_date,
                    user_id,
                    COUNT(*) as event_count,
                    COUNT(DISTINCT session_id) as session_count,
                    MAX(timestamp) as last_activity
                FROM analytics_events 
                WHERE user_id IS NOT NULL
                GROUP BY activity_date, user_id
                WITH DATA
                """)
                
                # Daily conversation metrics view
                cursor.execute("""
                CREATE MATERIALIZED VIEW IF NOT EXISTS daily_conversation_metrics AS
                SELECT 
                    DATE_TRUNC('day', c.started_at) as conversation_date,
                    COUNT(*) as total_conversations,
                    COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_conversations,
                    COUNT(CASE WHEN c.status = 'ended' THEN 1 END) as ended_conversations,
                    AVG(EXTRACT(EPOCH FROM (c.ended_at - c.started_at))) as avg_duration_seconds,
                    COUNT(DISTINCT c.user_id) as unique_users
                FROM conversations c
                GROUP BY conversation_date
                WITH DATA
                """)
                
                # User engagement metrics view
                cursor.execute("""
                CREATE MATERIALIZED VIEW IF NOT EXISTS user_engagement_metrics AS
                SELECT 
                    u.id as user_id,
                    u.email,
                    COUNT(DISTINCT c.id) as total_conversations,
                    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_conversations,
                    COUNT(m.id) as total_messages,
                    MAX(c.started_at) as last_conversation_date,
                    EXTRACT(EPOCH FROM (MAX(c.started_at) - MIN(c.started_at))) / 86400 as days_active
                FROM users u
                LEFT JOIN conversations c ON u.id = c.user_id
                LEFT JOIN messages m ON c.id = m.conversation_id
                GROUP BY u.id, u.email
                WITH DATA
                """)
                
                self.connection.commit()
                logger.info("Materialized views created/verified")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error creating materialized views: {e}")
            raise
    
    async def track_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track analytics event"""
        try:
            event_id = str(uuid.uuid4())
            event_type = event_data.get('event_type')
            user_id = event_data.get('user_id')
            session_id = event_data.get('session_id')
            data = event_data.get('data', {})
            metadata = event_data.get('metadata', {})
            
            # Store event in database
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO analytics_events (id, event_type, user_id, session_id, data, metadata)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                cursor.execute(query, (event_id, event_type, user_id, session_id, json.dumps(data), json.dumps(metadata)))
                self.connection.commit()
            
            # Cache event in Redis for real-time processing
            cache_key = f"event:{event_id}"
            self.redis_client.setex(cache_key, 3600, json.dumps({
                'id': event_id,
                'event_type': event_type,
                'user_id': user_id,
                'session_id': session_id,
                'data': data,
                'metadata': metadata,
                'timestamp': datetime.now().isoformat()
            }))
            
            # Trigger real-time analytics processing
            asyncio.create_task(self._process_real_time_event(event_data))
            
            return {
                'event_id': event_id,
                'status': 'tracked',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error tracking event: {e}")
            raise Exception(f"Failed to track event: {str(e)}")
    
    async def _process_real_time_event(self, event_data: Dict[str, Any]):
        """Process event in real-time for immediate analytics"""
        try:
            event_type = event_data.get('event_type')
            user_id = event_data.get('user_id')
            
            # Update real-time counters
            if event_type == 'user_login':
                await self._update_user_login_metrics(user_id)
            elif event_type == 'message_sent':
                await self._update_message_metrics(event_data)
            elif event_type == 'conversation_started':
                await self._update_conversation_metrics(event_data)
            
        except Exception as e:
            logger.error(f"Error processing real-time event: {e}")
    
    async def _update_user_login_metrics(self, user_id: str):
        """Update user login metrics"""
        try:
            # Update daily login count
            today = datetime.now().date()
            cache_key = f"user_login:{user_id}:{today}"
            
            # Check if user already logged in today
            if not self.redis_client.exists(cache_key):
                self.redis_client.incr(f"daily_logins:{today}")
                self.redis_client.setex(cache_key, 86400, "1")  # 24 hours
            
        except Exception as e:
            logger.error(f"Error updating user login metrics: {e}")
    
    async def _update_message_metrics(self, event_data: Dict[str, Any]):
        """Update message metrics"""
        try:
            conversation_id = event_data.get('data', {}).get('conversation_id')
            
            # Update conversation message count
            cache_key = f"conversation_messages:{conversation_id}"
            self.redis_client.incr(cache_key)
            
            # Update daily message count
            today = datetime.now().date()
            self.redis_client.incr(f"daily_messages:{today}")
            
        except Exception as e:
            logger.error(f"Error updating message metrics: {e}")
    
    async def _update_conversation_metrics(self, event_data: Dict[str, Any]):
        """Update conversation metrics"""
        try:
            conversation_id = event_data.get('data', {}).get('conversation_id')
            user_id = event_data.get('user_id')
            
            # Update user conversation count
            cache_key = f"user_conversations:{user_id}"
            self.redis_client.incr(cache_key)
            
            # Update daily conversation count
            today = datetime.now().date()
            self.redis_client.incr(f"daily_conversations:{today}")
            
        except Exception as e:
            logger.error(f"Error updating conversation metrics: {e}")
    
    async def get_user_analytics(self, user_id: str, period: str = '7d') -> Dict[str, Any]:
        """Get user analytics for a specific period"""
        try:
            end_date = datetime.now()
            if period == '7d':
                start_date = end_date - timedelta(days=7)
            elif period == '30d':
                start_date = end_date - timedelta(days=30)
            elif period == '90d':
                start_date = end_date - timedelta(days=90)
            else:
                start_date = end_date - timedelta(days=7)
            
            # Get user activity data
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT 
                    DATE_TRUNC('day', timestamp) as date,
                    COUNT(*) as event_count,
                    COUNT(DISTINCT session_id) as session_count,
                    COUNT(CASE WHEN event_type = 'message_sent' THEN 1 END) as messages_sent,
                    COUNT(CASE WHEN event_type = 'conversation_started' THEN 1 END) as conversations_started
                FROM analytics_events 
                WHERE user_id = %s AND timestamp >= %s AND timestamp <= %s
                GROUP BY DATE_TRUNC('day', timestamp)
                ORDER BY date
                """
                cursor.execute(query, (user_id, start_date, end_date))
                activity_data = cursor.fetchall()
                
                # Get conversation metrics
                query = """
                SELECT 
                    c.id,
                    c.title,
                    c.status,
                    c.started_at,
                    c.ended_at,
                    COUNT(m.id) as message_count,
                    EXTRACT(EPOCH FROM (c.ended_at - c.started_at)) as duration_seconds
                FROM conversations c
                LEFT JOIN messages m ON c.id = m.conversation_id
                WHERE c.user_id = %s AND c.started_at >= %s AND c.started_at <= %s
                GROUP BY c.id, c.title, c.status, c.started_at, c.ended_at
                ORDER BY c.started_at DESC
                """
                cursor.execute(query, (user_id, start_date, end_date))
                conversation_data = cursor.fetchall()
            
            # Calculate summary statistics
            total_events = sum(row['event_count'] for row in activity_data)
            total_messages = sum(row['messages_sent'] for row in activity_data)
            total_conversations = len(conversation_data)
            
            avg_session_duration = 0
            if conversation_data:
                durations = [row['duration_seconds'] for row in conversation_data if row['duration_seconds']]
                avg_session_duration = statistics.mean(durations) if durations else 0
            
            return {
                'user_id': user_id,
                'period': period,
                'summary': {
                    'total_events': total_events,
                    'total_messages': total_messages,
                    'total_conversations': total_conversations,
                    'avg_session_duration': avg_session_duration,
                    'active_days': len(activity_data)
                },
                'activity_data': [dict(row) for row in activity_data],
                'conversation_data': [dict(row) for row in conversation_data],
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            raise Exception(f"Failed to get user analytics: {str(e)}")
    
    async def get_conversation_analytics(self, conversation_id: str) -> Dict[str, Any]:
        """Get analytics for a specific conversation"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get conversation basic info
                query = """
                SELECT 
                    c.*,
                    u.name as user_name,
                    u.email as user_email
                FROM conversations c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = %s
                """
                cursor.execute(query, (conversation_id,))
                conversation = cursor.fetchone()
                
                if not conversation:
                    raise ValueError(f"Conversation {conversation_id} not found")
                
                # Get message analytics
                query = """
                SELECT 
                    DATE_TRUNC('minute', created_at) as minute,
                    COUNT(*) as message_count,
                    AVG(LENGTH(content)) as avg_message_length
                FROM messages
                WHERE conversation_id = %s
                GROUP BY DATE_TRUNC('minute', created_at)
                ORDER BY minute
                """
                cursor.execute(query, (conversation_id,))
                message_timeline = cursor.fetchall()
                
                # Get message type distribution
                query = """
                SELECT 
                    message_type,
                    COUNT(*) as count
                FROM messages
                WHERE conversation_id = %s
                GROUP BY message_type
                """
                cursor.execute(query, (conversation_id,))
                message_types = cursor.fetchall()
                
                # Get response time analytics
                query = """
                WITH message_times AS (
                    SELECT 
                        created_at,
                        LEAD(created_at) OVER (ORDER BY created_at) as next_created_at,
                        sender_id
                    FROM messages
                    WHERE conversation_id = %s
                )
                SELECT 
                    AVG(EXTRACT(EPOCH FROM (next_created_at - created_at))) as avg_response_time,
                    COUNT(*) as response_count
                FROM message_times
                WHERE next_created_at IS NOT NULL
                AND sender_id != (SELECT sender_id FROM messages WHERE id = (
                    SELECT id FROM messages WHERE conversation_id = %s ORDER BY created_at LIMIT 1
                ))
                """
                cursor.execute(query, (conversation_id, conversation_id))
                response_times = cursor.fetchone()
            
            return {
                'conversation_id': conversation_id,
                'conversation_info': dict(conversation),
                'message_timeline': [dict(row) for row in message_timeline],
                'message_types': [dict(row) for row in message_types],
                'response_times': dict(response_times) if response_times else {},
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting conversation analytics: {e}")
            raise Exception(f"Failed to get conversation analytics: {str(e)}")
    
    async def get_system_analytics(self, period: str = '24h') -> Dict[str, Any]:
        """Get system-wide analytics"""
        try:
            end_time = datetime.now()
            if period == '24h':
                start_time = end_time - timedelta(hours=24)
            elif period == '7d':
                start_time = end_time - timedelta(days=7)
            elif period == '30d':
                start_time = end_time - timedelta(days=30)
            else:
                start_time = end_time - timedelta(hours=24)
            
            # Get system metrics from database
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get user activity metrics
                query = """
                SELECT 
                    DATE_TRUNC('hour', timestamp) as hour,
                    COUNT(*) as event_count,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT session_id) as unique_sessions
                FROM analytics_events 
                WHERE timestamp >= %s AND timestamp <= %s
                GROUP BY DATE_TRUNC('hour', timestamp)
                ORDER BY hour
                """
                cursor.execute(query, (start_time, end_time))
                hourly_activity = cursor.fetchall()
                
                # Get conversation metrics
                query = """
                SELECT 
                    DATE_TRUNC('day', started_at) as day,
                    COUNT(*) as total_conversations,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_conversations,
                    COUNT(CASE WHEN status = 'ended' THEN 1 END) as ended_conversations,
                    AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
                FROM conversations
                WHERE started_at >= %s AND started_at <= %s
                GROUP BY DATE_TRUNC('day', started_at)
                ORDER BY day
                """
                cursor.execute(query, (start_time, end_time))
                daily_conversations = cursor.fetchall()
                
                # Get message metrics
                query = """
                SELECT 
                    DATE_TRUNC('day', created_at) as day,
                    COUNT(*) as total_messages,
                    COUNT(DISTINCT conversation_id) as conversations_with_messages
                FROM messages
                WHERE created_at >= %s AND created_at <= %s
                GROUP BY DATE_TRUNC('day', created_at)
                ORDER BY day
                """
                cursor.execute(query, (start_time, end_time))
                daily_messages = cursor.fetchall()
            
            # Get real-time metrics from Redis
            real_time_metrics = await self._get_real_time_metrics()
            
            return {
                'period': period,
                'time_range': {
                    'start': start_time.isoformat(),
                    'end': end_time.isoformat()
                },
                'hourly_activity': [dict(row) for row in hourly_activity],
                'daily_conversations': [dict(row) for row in daily_conversations],
                'daily_messages': [dict(row) for row in daily_messages],
                'real_time_metrics': real_time_metrics,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system analytics: {e}")
            raise Exception(f"Failed to get system analytics: {str(e)}")
    
    async def _get_real_time_metrics(self) -> Dict[str, Any]:
        """Get real-time metrics from Redis"""
        try:
            metrics = {}
            
            # Get current day keys
            today = datetime.now().date()
            
            # Get daily metrics
            metrics['daily_logins'] = int(self.redis_client.get(f"daily_logins:{today}") or 0)
            metrics['daily_messages'] = int(self.redis_client.get(f"daily_messages:{today}") or 0)
            metrics['daily_conversations'] = int(self.redis_client.get(f"daily_conversations:{today}") or 0)
            
            # Get active users (users who logged in today)
            active_users = []
            for key in self.redis_client.scan_iter(f"user_login:*:{today}"):
                user_id = key.decode().split(':')[1]
                active_users.append(user_id)
            metrics['active_users_today'] = len(active_users)
            
            # Get system health metrics (if available)
            try:
                metrics['system_health'] = {
                    'memory_usage': float(self.redis_client.get('system:memory_usage') or 0),
                    'cpu_usage': float(self.redis_client.get('system:cpu_usage') or 0),
                    'response_time': float(self.redis_client.get('system:response_time') or 0)
                }
            except:
                metrics['system_health'] = {}
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting real-time metrics: {e}")
            return {}
    
    async def generate_custom_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate custom analytics report"""
        try:
            report_id = str(uuid.uuid4())
            report_name = report_config.get('name')
            report_type = report_config.get('type')
            filters = report_config.get('filters', {})
            metrics = report_config.get('metrics', [])
            
            # Build dynamic query based on configuration
            query = self._build_report_query(report_type, filters, metrics)
            
            # Execute query
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                results = cursor.fetchall()
            
            # Transform results based on report type
            formatted_results = self._format_report_results(results, report_type)
            
            # Store report result
            await self._store_report_result(report_id, report_config, formatted_results)
            
            return {
                'report_id': report_id,
                'report_name': report_name,
                'report_type': report_type,
                'results': formatted_results,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating custom report: {e}")
            raise Exception(f"Failed to generate custom report: {str(e)}")
    
    def _build_report_query(self, report_type: str, filters: Dict[str, Any], metrics: List[str]) -> str:
        """Build dynamic SQL query for custom report"""
        base_query = ""
        
        if report_type == 'user_analytics':
            base_query = """
            SELECT 
                u.id,
                u.email,
                u.name,
                u.created_at,
                COUNT(DISTINCT c.id) as total_conversations,
                COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_conversations,
                COUNT(m.id) as total_messages,
                MAX(c.started_at) as last_activity
            FROM users u
            LEFT JOIN conversations c ON u.id = c.user_id
            LEFT JOIN messages m ON c.id = m.conversation_id
            """
        elif report_type == 'conversation_analytics':
            base_query = """
            SELECT 
                c.id,
                c.title,
                c.status,
                c.started_at,
                c.ended_at,
                u.name as user_name,
                u.email as user_email,
                COUNT(m.id) as message_count,
                EXTRACT(EPOCH FROM (c.ended_at - c.started_at)) as duration_seconds
            FROM conversations c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN messages m ON c.id = m.conversation_id
            """
        elif report_type == 'performance_analytics':
            base_query = """
            SELECT 
                DATE_TRUNC('hour', timestamp) as time_period,
                event_type,
                COUNT(*) as event_count,
                COUNT(DISTINCT user_id) as unique_users,
                AVG(EXTRACT(EPOCH FROM (LEAD(timestamp) OVER (ORDER BY timestamp) - timestamp))) as avg_interval
            FROM analytics_events
            """
        
        # Add WHERE clauses for filters
        where_clauses = []
        params = []
        
        if 'date_range' in filters:
            start_date = filters['date_range'].get('start')
            end_date = filters['date_range'].get('end')
            if start_date and end_date:
                where_clauses.append("timestamp >= %s AND timestamp <= %s")
                params.extend([start_date, end_date])
        
        if 'user_id' in filters:
            where_clauses.append("user_id = %s")
            params.append(filters['user_id'])
        
        if 'status' in filters:
            where_clauses.append("status = %s")
            params.append(filters['status'])
        
        if 'event_type' in filters:
            where_clauses.append("event_type = %s")
            params.append(filters['event_type'])
        
        # Build final query
        if where_clauses:
            base_query += " WHERE " + " AND ".join(where_clauses)
        
        # Add GROUP BY for metrics
        if metrics:
            group_columns = []
            for metric in metrics:
                if metric == 'user':
                    group_columns.append("user_id")
                elif metric == 'date':
                    group_columns.append("DATE_TRUNC('day', timestamp)")
                elif metric == 'hour':
                    group_columns.append("DATE_TRUNC('hour', timestamp)")
                elif metric == 'event_type':
                    group_columns.append("event_type")
            
            if group_columns:
                base_query += " GROUP BY " + ", ".join(group_columns)
        
        # Add ORDER BY
        base_query += " ORDER BY timestamp DESC"
        
        return base_query
    
    def _format_report_results(self, results: List[Dict], report_type: str) -> Dict[str, Any]:
        """Format report results based on type"""
        formatted = {
            'type': report_type,
            'data': [dict(row) for row in results],
            'summary': {},
            'charts': {}
        }
        
        # Calculate summary statistics
        if results:
            numeric_columns = [key for key in results[0].keys() if isinstance(results[0][key], (int, float))]
            
            for col in numeric_columns:
                values = [row[col] for row in results if row[col] is not None]
                if values:
                    formatted['summary'][f'{col}_avg'] = statistics.mean(values)
                    formatted['summary'][f'{col}_total'] = sum(values)
                    formatted['summary'][f'{col}_max'] = max(values)
                    formatted['summary'][f'{col}_min'] = min(values)
        
        # Generate chart data
        formatted['charts'] = self._generate_chart_data(results, report_type)
        
        return formatted
    
    def _generate_chart_data(self, results: List[Dict], report_type: str) -> Dict[str, Any]:
        """Generate chart data for visualization"""
        charts = {}
        
        if not results:
            return charts
        
        # Time series chart
        if 'time_period' in results[0]:
            charts['time_series'] = {
                'type': 'line',
                'data': {
                    'labels': [row['time_period'].strftime('%Y-%m-%d %H:%M') for row in results],
                    'datasets': [{
                        'label': 'Event Count',
                        'data': [row['event_count'] for row in results],
                        'borderColor': 'rgb(75, 192, 192)',
                        'fill': False
                    }]
                }
            }
        
        # Bar chart for categorical data
        if 'event_type' in results[0]:
            event_counts = Counter(row['event_type'] for row in results)
            charts['event_distribution'] = {
                'type': 'bar',
                'data': {
                    'labels': list(event_counts.keys()),
                    'datasets': [{
                        'label': 'Count',
                        'data': list(event_counts.values()),
                        'backgroundColor': 'rgba(54, 162, 235, 0.5)'
                    }]
                }
            }
        
        # Pie chart for proportions
        if 'status' in results[0]:
            status_counts = Counter(row['status'] for row in results)
            charts['status_distribution'] = {
                'type': 'pie',
                'data': {
                    'labels': list(status_counts.keys()),
                    'datasets': [{
                        'data': list(status_counts.values()),
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 205, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)'
                        ]
                    }]
                }
            }
        
        return charts
    
    async def _store_report_result(self, report_id: str, config: Dict[str, Any], results: Dict[str, Any]):
        """Store report result in database"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO report_results (report_id, result_data, result_format)
                VALUES (%s, %s, %s)
                """
                cursor.execute(query, (
                    report_id,
                    json.dumps(results),
                    'json'
                ))
                self.connection.commit()
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error storing report result: {e}")
    
    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get key metrics for dashboard"""
        try:
            # Get current metrics
            now = datetime.now()
            today = now.date()
            this_month = now.replace(day=1)
            
            metrics = {}
            
            # Get real-time metrics
            real_time_metrics = await self._get_real_time_metrics()
            metrics.update(real_time_metrics)
            
            # Get user metrics
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Total users
                cursor.execute("SELECT COUNT(*) as total FROM users")
                metrics['total_users'] = cursor.fetchone()['total']
                
                # Active users today
                cursor.execute("""
                SELECT COUNT(DISTINCT user_id) as count
                FROM analytics_events 
                WHERE DATE(timestamp) = %s
                """, (today,))
                metrics['active_users_today'] = cursor.fetchone()['count']
                
                # New users this month
                cursor.execute("""
                SELECT COUNT(*) as count
                FROM users 
                WHERE created_at >= %s
                """, (this_month,))
                metrics['new_users_this_month'] = cursor.fetchone()['count']
            
            # Get conversation metrics
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Total conversations
                cursor.execute("SELECT COUNT(*) as total FROM conversations")
                metrics['total_conversations'] = cursor.fetchone()['total']
                
                # Active conversations
                cursor.execute("SELECT COUNT(*) as total FROM conversations WHERE status = 'active'")
                metrics['active_conversations'] = cursor.fetchone()['total']
                
                # Conversations today
                cursor.execute("""
                SELECT COUNT(*) as total
                FROM conversations 
                WHERE DATE(started_at) = %s
                """, (today,))
                metrics['conversations_today'] = cursor.fetchone()['total']
            
            # Get message metrics
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Total messages
                cursor.execute("SELECT COUNT(*) as total FROM messages")
                metrics['total_messages'] = cursor.fetchone()['total']
                
                # Messages today
                cursor.execute("""
                SELECT COUNT(*) as total
                FROM messages 
                WHERE DATE(created_at) = %s
                """, (today,))
                metrics['messages_today'] = cursor.fetchone()['total']
            
            # Get performance metrics
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Average response time
                cursor.execute("""
                SELECT AVG(EXTRACT(EPOCH FROM (
                    LEAD(created_at) OVER (ORDER BY created_at) - created_at
                ))) as avg_response_time
                FROM messages
                WHERE conversation_id IN (
                    SELECT id FROM conversations LIMIT 1000
                )
                """)
                response_time = cursor.fetchone()
                metrics['avg_response_time'] = response_time['avg_response_time'] or 0
            
            return {
                'metrics': metrics,
                'timestamp': now.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard metrics: {e}")
            raise Exception(f"Failed to get dashboard metrics: {str(e)}")
    
    async def export_analytics_data(self, export_config: Dict[str, Any]) -> Dict[str, Any]:
        """Export analytics data in various formats"""
        try:
            export_id = str(uuid.uuid4())
            data_type = export_config.get('data_type')
            format_type = export_config.get('format', 'json')
            filters = export_config.get('filters', {})
            
            # Get data based on type
            if data_type == 'user_analytics':
                data = await self.get_user_analytics(filters.get('user_id'), filters.get('period', '30d'))
            elif data_type == 'system_analytics':
                data = await self.get_system_analytics(filters.get('period', '30d'))
            elif data_type == 'conversation_analytics':
                data = await self.get_conversation_analytics(filters.get('conversation_id'))
            else:
                raise ValueError(f"Unsupported data type: {data_type}")
            
            # Format data based on requested format
            if format_type == 'json':
                export_data = json.dumps(data, indent=2, default=str)
                content_type = 'application/json'
                file_extension = 'json'
            elif format_type == 'csv':
                export_data = self._convert_to_csv(data)
                content_type = 'text/csv'
                file_extension = 'csv'
            elif format_type == 'excel':
                export_data = await self._convert_to_excel(data)
                content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                file_extension = 'xlsx'
            else:
                raise ValueError(f"Unsupported format: {format_type}")
            
            # Store export record
            await self._store_export_record(export_id, export_config, export_data)
            
            return {
                'export_id': export_id,
                'data_type': data_type,
                'format': format_type,
                'content_type': content_type,
                'data': export_data,
                'file_extension': file_extension,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error exporting analytics data: {e}")
            raise Exception(f"Failed to export analytics data: {str(e)}")
    
    def _convert_to_csv(self, data: Dict[str, Any]) -> str:
        """Convert analytics data to CSV format"""
        try:
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(['Metric', 'Value'])
            
            # Write summary data
            if 'summary' in data:
                for key, value in data['summary'].items():
                    writer.writerow([key, value])
            
            # Write detailed data
            if 'activity_data' in data:
                writer.writerow([])
                writer.writerow(['Date', 'Event Count', 'Session Count'])
                for row in data['activity_data']:
                    writer.writerow([
                        row.get('date', ''),
                        row.get('event_count', 0),
                        row.get('session_count', 0)
                    ])
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error converting to CSV: {e}")
            raise
    
    async def _convert_to_excel(self, data: Dict[str, Any]) -> bytes:
        """Convert analytics data to Excel format"""
        try:
            import pandas as pd
            from io import BytesIO
            
            # Create Excel workbook
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                # Write summary sheet
                if 'summary' in data:
                    summary_df = pd.DataFrame(list(data['summary'].items()), columns=['Metric', 'Value'])
                    summary_df.to_excel(writer, sheet_name='Summary', index=False)
                
                # Write activity data sheet
                if 'activity_data' in data:
                    activity_df = pd.DataFrame(data['activity_data'])
                    activity_df.to_excel(writer, sheet_name='Activity Data', index=False)
                
                # Write conversation data sheet
                if 'conversation_data' in data:
                    conversation_df = pd.DataFrame(data['conversation_data'])
                    conversation_df.to_excel(writer, sheet_name='Conversation Data', index=False)
            
            output.seek(0)
            return output.read()
            
        except Exception as e:
            logger.error(f"Error converting to Excel: {e}")
            raise
    
    async def _store_export_record(self, export_id: str, config: Dict[str, Any], data: str):
        """Store export record in database"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO analytics_exports (export_id, data_type, format, config, data)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    export_id,
                    config.get('data_type'),
                    config.get('format'),
                    json.dumps(config),
                    data
                ))
                self.connection.commit()
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error storing export record: {e}")
    
    async def refresh_materialized_views(self):
        """Refresh all materialized views"""
        try:
            with self.connection.cursor() as cursor:
                views = [
                    'daily_user_activity',
                    'daily_conversation_metrics',
                    'user_engagement_metrics'
                ]
                
                for view in views:
                    cursor.execute(f"REFRESH MATERIALIZED VIEW {view}")
                
                self.connection.commit()
                logger.info("Materialized views refreshed successfully")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error refreshing materialized views: {e}")
            raise
    
    async def get_analytics_health(self) -> Dict[str, Any]:
        """Get analytics service health status"""
        try:
            health = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'checks': {}
            }
            
            # Check database connection
            try:
                with self.connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    health['checks']['database_connection'] = 'ok'
            except Exception as e:
                health['checks']['database_connection'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check Redis connection
            try:
                self.redis_client.ping()
                health['checks']['redis_connection'] = 'ok'
            except Exception as e:
                health['checks']['redis_connection'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check materialized views
            try:
                with self.connection.cursor() as cursor:
                    cursor.execute("""
                    SELECT COUNT(*) 
                    FROM information_schema.tables 
                    WHERE table_type = 'MATERIALIZED VIEW'
                    AND table_schema = 'public'
                    """)
                    view_count = cursor.fetchone()[0]
                    health['checks']['materialized_views'] = f'{view_count} views'
            except Exception as e:
                health['checks']['materialized_views'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check recent data freshness
            try:
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                    SELECT MAX(timestamp) as last_event
                    FROM analytics_events
                    """)
                    last_event = cursor.fetchone()
                    
                    if last_event and last_event['last_event']:
                        time_diff = datetime.now() - last_event['last_event']
                        if time_diff.total_seconds() > 3600:  # 1 hour
                            health['checks']['data_freshness'] = f'warning: last event {time_diff} ago'
                        else:
                            health['checks']['data_freshness'] = 'ok'
                    else:
                        health['checks']['data_freshness'] = 'no data'
                        health['status'] = 'degraded'
            except Exception as e:
                health['checks']['data_freshness'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            return health
            
        except Exception as e:
            logger.error(f"Error getting analytics health: {e}")
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
>>>>>>> REPLACE