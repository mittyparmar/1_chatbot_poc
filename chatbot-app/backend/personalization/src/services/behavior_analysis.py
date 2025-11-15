import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from collections import defaultdict, Counter
import statistics
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import re

logger = logging.getLogger(__name__)

class BehaviorAnalysisService:
    def __init__(self):
        self.connection = self._get_connection()
        self.event_cache = {}  # Cache for recent events
        self.insight_cache = {}  # Cache for generated insights
        
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    async def initialize(self):
        """Initialize behavior analysis service"""
        try:
            # Create necessary tables if they don't exist
            await self._ensure_tables_exist()
            logger.info("Behavior Analysis Service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Behavior Analysis Service: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            # Clear caches
            self.event_cache.clear()
            self.insight_cache.clear()
            logger.info("Behavior Analysis Service cleanup complete")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def _ensure_tables_exist(self):
        """Ensure necessary tables exist"""
        try:
            with self.connection.cursor() as cursor:
                # Create behavior events table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS behavior_events (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id VARCHAR(255) NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    event_data JSONB NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    session_id VARCHAR(255),
                    ip_address INET,
                    user_agent TEXT
                )
                """)
                
                # Create behavior insights table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS behavior_insights (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id VARCHAR(255) NOT NULL,
                    insight_type VARCHAR(100) NOT NULL,
                    insight_data JSONB NOT NULL,
                    confidence_score FLOAT NOT NULL,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_processed BOOLEAN DEFAULT FALSE
                )
                """)
                
                # Create user behavior patterns table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_behavior_patterns (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id VARCHAR(255) NOT NULL,
                    pattern_type VARCHAR(100) NOT NULL,
                    pattern_data JSONB NOT NULL,
                    confidence_score FLOAT NOT NULL,
                    identified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                
                self.connection.commit()
                logger.info("Behavior analysis tables created/verified")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error ensuring tables exist: {e}")
            raise
    
    async def track_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track user behavior event"""
        try:
            event_id = str(uuid.uuid4())
            user_id = event_data['user_id']
            event_type = event_data['event_type']
            event_data_json = event_data['event_data']
            timestamp = event_data.get('timestamp', datetime.now().isoformat())
            session_id = event_data.get('session_id')
            
            # Validate event data
            if not self._validate_event(event_data):
                raise ValueError("Invalid event data")
            
            # Store event in database
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO behavior_events 
                (id, user_id, event_type, event_data, timestamp, session_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """
                cursor.execute(query, (
                    event_id,
                    user_id,
                    event_type,
                    json.dumps(event_data_json),
                    timestamp,
                    session_id
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                # Cache the event
                if user_id not in self.event_cache:
                    self.event_cache[user_id] = []
                self.event_cache[user_id].append({
                    'id': result[0],
                    'user_id': result[1],
                    'event_type': result[2],
                    'event_data': json.loads(result[3]),
                    'timestamp': result[4],
                    'session_id': result[5]
                })
                
                # Trigger insight generation if needed
                await self._trigger_insight_generation(user_id)
                
                return {
                    'event_id': event_id,
                    'user_id': user_id,
                    'event_type': event_type,
                    'timestamp': timestamp,
                    'status': 'tracked'
                }
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error tracking behavior event: {e}")
            raise Exception(f"Failed to track behavior event: {str(e)}")
    
    async def get_user_events(self, user_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get behavior events for a user"""
        try:
            # Check cache first
            if user_id in self.event_cache and len(self.event_cache[user_id]) >= limit:
                return self.event_cache[user_id][:limit]
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT * FROM behavior_events 
                WHERE user_id = %s 
                ORDER BY timestamp DESC 
                LIMIT %s
                """
                cursor.execute(query, (user_id, limit))
                results = cursor.fetchall()
                
                events = []
                for result in results:
                    events.append({
                        'id': result['id'],
                        'user_id': result['user_id'],
                        'event_type': result['event_type'],
                        'event_data': json.loads(result['event_data']),
                        'timestamp': result['timestamp'],
                        'session_id': result['session_id']
                    })
                
                # Update cache
                if user_id not in self.event_cache:
                    self.event_cache[user_id] = []
                self.event_cache[user_id].extend(events)
                
                # Keep cache size manageable
                if len(self.event_cache[user_id]) > 1000:
                    self.event_cache[user_id] = self.event_cache[user_id][-1000:]
                
                return events
                
        except Exception as e:
            logger.error(f"Error getting user events: {e}")
            raise Exception(f"Failed to get user events: {str(e)}")
    
    async def get_insights(self, user_id: str) -> List[Dict[str, Any]]:
        """Get behavior insights for a user"""
        try:
            # Check cache first
            if user_id in self.insight_cache:
                return self.insight_cache[user_id]
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT * FROM behavior_insights 
                WHERE user_id = %s AND expires_at > NOW()
                ORDER BY generated_at DESC
                """
                cursor.execute(query, (user_id,))
                results = cursor.fetchall()
                
                insights = []
                for result in results:
                    insights.append({
                        'id': result['id'],
                        'user_id': result['user_id'],
                        'insight_type': result['insight_type'],
                        'insight_data': json.loads(result['insight_data']),
                        'confidence_score': result['confidence_score'],
                        'generated_at': result['generated_at']
                    })
                
                # Cache insights
                self.insight_cache[user_id] = insights
                
                return insights
                
        except Exception as e:
            logger.error(f"Error getting behavior insights: {e}")
            raise Exception(f"Failed to get behavior insights: {str(e)}")
    
    async def generate_insights(self, user_id: str):
        """Generate behavior insights for a user"""
        try:
            # Get user events
            events = await self.get_user_events(user_id, limit=1000)
            
            if not events:
                return
            
            # Generate different types of insights
            insights = []
            
            # Activity pattern insights
            activity_insights = await self._analyze_activity_patterns(user_id, events)
            insights.extend(activity_insights)
            
            # Interest insights
            interest_insights = await self._analyze_interests(user_id, events)
            insights.extend(interest_insights)
            
            # Engagement insights
            engagement_insights = await self._analyze_engagement(user_id, events)
            insights.extend(engagement_insights)
            
            # Behavioral change insights
            change_insights = await self._analyze_behavioral_changes(user_id, events)
            insights.extend(change_insights)
            
            # Store insights in database
            for insight in insights:
                await self._store_insight(insight)
            
            # Update cache
            self.insight_cache[user_id] = insights
            
            logger.info(f"Generated {len(insights)} insights for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error generating insights for user {user_id}: {e}")
    
    async def _trigger_insight_generation(self, user_id: str):
        """Trigger insight generation based on event patterns"""
        try:
            # Get recent events for the user
            recent_events = await self.get_user_events(user_id, limit=50)
            
            if len(recent_events) >= 10:  # Trigger after 10 events
                # Check if we need to generate insights
                last_insight_time = await self._get_last_insight_time(user_id)
                
                if not last_insight_time or (datetime.now() - last_insight_time).total_seconds() > 3600:  # 1 hour
                    await self.generate_insights(user_id)
                    
        except Exception as e:
            logger.error(f"Error triggering insight generation: {e}")
    
    async def _analyze_activity_patterns(self, user_id: str, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze user activity patterns"""
        insights = []
        
        try:
            # Group events by hour of day
            hourly_activity = defaultdict(int)
            daily_activity = defaultdict(int)
            
            for event in events:
                timestamp = datetime.fromisoformat(event['timestamp'])
                hourly_activity[timestamp.hour] += 1
                daily_activity[timestamp.weekday()] += 1
            
            # Find peak activity hours
            if hourly_activity:
                peak_hour = max(hourly_activity.items(), key=lambda x: x[1])
                if peak_hour[1] > len(events) * 0.3:  # More than 30% of activity
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'activity_pattern',
                        'insight_data': {
                            'pattern': 'peak_hour',
                            'hour': peak_hour[0],
                            'activity_percentage': round((peak_hour[1] / len(events)) * 100, 2)
                        },
                        'confidence_score': 0.8
                    })
            
            # Find weekend vs weekday activity
            if daily_activity:
                weekend_activity = sum(daily_activity[i] for i in [5, 6])
                weekday_activity = sum(daily_activity[i] for i in range(5))
                
                if weekend_activity > weekday_activity * 1.5:
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'activity_pattern',
                        'insight_data': {
                            'pattern': 'weekend_dominant',
                            'weekend_ratio': round(weekend_activity / weekday_activity, 2)
                        },
                        'confidence_score': 0.7
                    })
                elif weekday_activity > weekend_activity * 2:
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'activity_pattern',
                        'insight_data': {
                            'pattern': 'weekday_dominant',
                            'weekday_ratio': round(weekday_activity / weekend_activity, 2)
                        },
                        'confidence_score': 0.7
                    })
            
        except Exception as e:
            logger.error(f"Error analyzing activity patterns: {e}")
        
        return insights
    
    async def _analyze_interests(self, user_id: str, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze user interests"""
        insights = []
        
        try:
            # Extract interests from events
            interests = []
            for event in events:
                event_data = event['event_data']
                if 'category' in event_data:
                    interests.append(event_data['category'])
                elif 'page_url' in event_data:
                    # Extract category from URL
                    category = self._extract_category_from_url(event_data['page_url'])
                    if category:
                        interests.append(category)
            
            if interests:
                interest_counts = Counter(interests)
                top_interest = interest_counts.most_common(1)[0]
                
                if top_interest[1] > len(interests) * 0.4:  # More than 40% of interests
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'interest',
                        'insight_data': {
                            'primary_interest': top_interest[0],
                            'interest_percentage': round((top_interest[1] / len(interests)) * 100, 2)
                        },
                        'confidence_score': 0.9
                    })
                
                # Find emerging interests
                recent_interests = interests[-len(interests)//2:] if len(interests) > 10 else interests
                recent_counts = Counter(recent_interests)
                
                for interest, count in recent_counts.most_common(3):
                    if count > len(recent_interests) * 0.2:  # More than 20% of recent activity
                        insights.append({
                            'user_id': user_id,
                            'insight_type': 'emerging_interest',
                            'insight_data': {
                                'interest': interest,
                                'recent_percentage': round((count / len(recent_interests)) * 100, 2)
                            },
                            'confidence_score': 0.6
                        })
            
        except Exception as e:
            logger.error(f"Error analyzing interests: {e}")
        
        return insights
    
    async def _analyze_engagement(self, user_id: str, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze user engagement patterns"""
        insights = []
        
        try:
            # Calculate session-based metrics
            sessions = self._group_events_into_sessions(events)
            
            if sessions:
                # Average session duration
                session_durations = []
                for session in sessions:
                    if len(session['events']) > 1:
                        start_time = datetime.fromisoformat(session['events'][0]['timestamp'])
                        end_time = datetime.fromisoformat(session['events'][-1]['timestamp'])
                        duration = (end_time - start_time).total_seconds() / 60  # minutes
                        session_durations.append(duration)
                
                if session_durations:
                    avg_duration = statistics.mean(session_durations)
                    
                    if avg_duration > 30:  # Long sessions
                        insights.append({
                            'user_id': user_id,
                            'insight_type': 'engagement',
                            'insight_data': {
                                'pattern': 'long_sessions',
                                'avg_duration_minutes': round(avg_duration, 2)
                            },
                            'confidence_score': 0.8
                        })
                    
                    # High engagement sessions
                    long_sessions = [d for d in session_durations if d > 15]
                    if len(long_sessions) > len(session_durations) * 0.5:
                        insights.append({
                            'user_id': user_id,
                            'insight_type': 'engagement',
                            'insight_data': {
                                'pattern': 'high_engagement',
                                'long_session_percentage': round((len(long_sessions) / len(session_durations)) * 100, 2)
                            },
                            'confidence_score': 0.7
                        })
                
                # Page depth analysis
                page_depths = [len(session['events']) for session in sessions]
                if page_depths:
                    avg_depth = statistics.mean(page_depths)
                    
                    if avg_depth > 5:
                        insights.append({
                            'user_id': user_id,
                            'insight_type': 'engagement',
                            'insight_data': {
                                'pattern': 'deep_navigation',
                                'avg_pages_per_session': round(avg_depth, 2)
                            },
                            'confidence_score': 0.8
                        })
            
        except Exception as e:
            logger.error(f"Error analyzing engagement: {e}")
        
        return insights
    
    async def _analyze_behavioral_changes(self, user_id: str, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze behavioral changes over time"""
        insights = []
        
        try:
            if len(events) < 20:  # Need sufficient data
                return insights
            
            # Split events into two periods
            mid_point = len(events) // 2
            early_period = events[:mid_point]
            late_period = events[mid_point:]
            
            # Compare activity levels
            early_activity = len(early_period)
            late_activity = len(late_period)
            
            if late_activity > early_activity * 1.5:
                insights.append({
                    'user_id': user_id,
                    'insight_type': 'behavioral_change',
                    'insight_data': {
                        'change': 'increasing_activity',
                        'growth_rate': round((late_activity / early_activity - 1) * 100, 2)
                    },
                    'confidence_score': 0.7
                })
            elif late_activity < early_activity * 0.5:
                insights.append({
                    'user_id': user_id,
                    'insight_type': 'behavioral_change',
                    'insight_data': {
                        'change': 'decreasing_activity',
                        'decline_rate': round((1 - late_activity / early_activity) * 100, 2)
                    },
                    'confidence_score': 0.7
                })
            
            # Compare interest diversity
            early_interests = set()
            late_interests = set()
            
            for event in early_period:
                event_data = event['event_data']
                if 'category' in event_data:
                    early_interests.add(event_data['category'])
            
            for event in late_period:
                event_data = event['event_data']
                if 'category' in event_data:
                    late_interests.add(event_data['category'])
            
            if early_interests and late_interests:
                diversity_change = len(late_interests) - len(early_interests)
                if diversity_change > 2:
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'behavioral_change',
                        'insight_data': {
                            'change': 'increasing_interest_diversity',
                            'new_interests_count': diversity_change
                        },
                        'confidence_score': 0.6
                    })
                elif diversity_change < -2:
                    insights.append({
                        'user_id': user_id,
                        'insight_type': 'behavioral_change',
                        'insight_data': {
                            'change': 'decreasing_interest_diversity',
                            'lost_interests_count': abs(diversity_change)
                        },
                        'confidence_score': 0.6
                    })
            
        except Exception as e:
            logger.error(f"Error analyzing behavioral changes: {e}")
        
        return insights
    
    def _group_events_into_sessions(self, events: List[Dict[str, Any]], timeout_minutes: int = 30) -> List[Dict[str, Any]]:
        """Group events into sessions based on time proximity"""
        if not events:
            return []
        
        # Sort events by timestamp
        sorted_events = sorted(events, key=lambda x: x['timestamp'])
        
        sessions = []
        current_session = {
            'session_id': sorted_events[0].get('session_id', 'unknown'),
            'events': [sorted_events[0]],
            'start_time': sorted_events[0]['timestamp']
        }
        
        for i in range(1, len(sorted_events)):
            current_time = datetime.fromisoformat(sorted_events[i]['timestamp'])
            last_time = datetime.fromisoformat(sorted_events[i-1]['timestamp'])
            
            time_diff = (current_time - last_time).total_seconds() / 60
            
            if time_diff > timeout_minutes:
                # End current session
                sessions.append(current_session)
                
                # Start new session
                current_session = {
                    'session_id': sorted_events[i].get('session_id', 'unknown'),
                    'events': [sorted_events[i]],
                    'start_time': sorted_events[i]['timestamp']
                }
            else:
                current_session['events'].append(sorted_events[i])
        
        # Add the last session
        sessions.append(current_session)
        
        return sessions
    
    def _extract_category_from_url(self, url: str) -> Optional[str]:
        """Extract category from URL"""
        try:
            # Simple category extraction based on URL patterns
            url_lower = url.lower()
            
            if any(keyword in url_lower for keyword in ['tech', 'software', 'programming']):
                return 'technology'
            elif any(keyword in url_lower for keyword in ['business', 'finance', 'money']):
                return 'business'
            elif any(keyword in url_lower for keyword in ['design', 'art', 'creative']):
                return 'design'
            elif any(keyword in url_lower for keyword in ['marketing', 'sales', 'ad']):
                return 'marketing'
            elif any(keyword in url_lower for keyword in ['health', 'fitness', 'medical']):
                return 'health'
            elif any(keyword in url_lower for keyword in ['education', 'learn', 'course']):
                return 'education'
            
            return None
            
        except Exception:
            return None
    
    def _validate_event(self, event_data: Dict[str, Any]) -> bool:
        """Validate event data"""
        required_fields = ['user_id', 'event_type', 'event_data']
        
        for field in required_fields:
            if field not in event_data:
                return False
        
        # Validate event type
        valid_types = ['page_view', 'click', 'search', 'purchase', 'login', 'logout', 'chat_message']
        if event_data['event_type'] not in valid_types:
            return False
        
        return True
    
    async def _store_insight(self, insight: Dict[str, Any]):
        """Store insight in database"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO behavior_insights 
                (user_id, insight_type, insight_data, confidence_score, expires_at)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    insight['user_id'],
                    insight['insight_type'],
                    json.dumps(insight['insight_data']),
                    insight['confidence_score'],
                    datetime.now() + timedelta(days=30)  # Expire after 30 days
                ))
                
                self.connection.commit()
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error storing insight: {e}")
    
    async def _get_last_insight_time(self, user_id: str) -> Optional[datetime]:
        """Get the last insight generation time for a user"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT MAX(generated_at) as last_time FROM behavior_insights 
                WHERE user_id = %s
                """
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                return result['last_time'] if result and result['last_time'] else None
                
        except Exception as e:
            logger.error(f"Error getting last insight time: {e}")
            return None