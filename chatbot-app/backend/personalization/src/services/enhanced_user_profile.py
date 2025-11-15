import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from collections import defaultdict, Counter
import statistics
import numpy as np

logger = logging.getLogger(__name__)

class EnhancedUserProfileService:
    def __init__(self):
        self.connection = self._get_connection()
        self.cache = {}  # Simple in-memory cache for performance
        
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    async def create_enhanced_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create enhanced user profile with behavioral traits"""
        try:
            profile_id = str(uuid.uuid4())
            user_id = profile_data['user_id']
            browsing_history = profile_data.get('browsing_history', [])
            location_data = profile_data.get('location_data', {})
            conversation_preferences = profile_data.get('conversation_preferences', {})
            behavioral_traits = profile_data.get('behavioral_traits', {})
            engagement_metrics = profile_data.get('engagement_metrics', {})
            last_updated = datetime.now().isoformat()
            
            # Analyze behavioral traits from browsing history
            if browsing_history:
                analyzed_traits = self._analyze_behavioral_traits(browsing_history)
                behavioral_traits.update(analyzed_traits)
            
            # Calculate initial engagement metrics
            if engagement_metrics:
                calculated_metrics = self._calculate_engagement_metrics(browsing_history)
                engagement_metrics.update(calculated_metrics)
            
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO enhanced_user_profiles 
                (id, user_id, browsing_history, location_data, conversation_preferences, 
                 behavioral_traits, engagement_metrics, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """
                cursor.execute(query, (
                    profile_id,
                    user_id,
                    json.dumps(browsing_history),
                    json.dumps(location_data),
                    json.dumps(conversation_preferences),
                    json.dumps(behavioral_traits),
                    json.dumps(engagement_metrics),
                    last_updated
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                # Cache the profile
                self.cache[user_id] = {
                    'id': result[0],
                    'user_id': result[1],
                    'browsing_history': json.loads(result[2]),
                    'location_data': json.loads(result[3]),
                    'conversation_preferences': json.loads(result[4]),
                    'behavioral_traits': json.loads(result[5]),
                    'engagement_metrics': json.loads(result[6]),
                    'last_updated': result[7]
                }
                
                return self.cache[user_id]
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Failed to create enhanced user profile: {e}")
            raise Exception(f"Failed to create enhanced user profile: {str(e)}")
    
    async def get_enhanced_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get enhanced user profile with behavioral analysis"""
        try:
            # Check cache first
            if user_id in self.cache:
                return self.cache[user_id]
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = "SELECT * FROM enhanced_user_profiles WHERE user_id = %s"
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                if result:
                    profile = {
                        'id': result['id'],
                        'user_id': result['user_id'],
                        'browsing_history': json.loads(result['browsing_history']),
                        'location_data': json.loads(result['location_data']),
                        'conversation_preferences': json.loads(result['conversation_preferences']),
                        'behavioral_traits': json.loads(result['behavioral_traits']),
                        'engagement_metrics': json.loads(result['engagement_metrics']),
                        'last_updated': result['last_updated']
                    }
                    
                    # Cache the profile
                    self.cache[user_id] = profile
                    
                    return profile
                return None
                
        except Exception as e:
            logger.error(f"Failed to get enhanced user profile: {e}")
            raise Exception(f"Failed to get enhanced user profile: {str(e)}")
    
    async def update_enhanced_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update enhanced user profile"""
        try:
            # Get existing profile
            existing_profile = await self.get_enhanced_profile(user_id)
            if not existing_profile:
                raise Exception("User profile not found")
            
            # Merge new data with existing
            browsing_history = profile_data.get('browsing_history', existing_profile['browsing_history'])
            location_data = profile_data.get('location_data', existing_profile['location_data'])
            conversation_preferences = profile_data.get('conversation_preferences', existing_profile['conversation_preferences'])
            behavioral_traits = profile_data.get('behavioral_traits', existing_profile['behavioral_traits'])
            engagement_metrics = profile_data.get('engagement_metrics', existing_profile['engagement_metrics'])
            last_updated = datetime.now().isoformat()
            
            # Update behavioral traits with new data
            if browsing_history != existing_profile['browsing_history']:
                new_traits = self._analyze_behavioral_traits(browsing_history)
                behavioral_traits.update(new_traits)
            
            # Update engagement metrics
            if engagement_metrics:
                new_metrics = self._calculate_engagement_metrics(browsing_history)
                engagement_metrics.update(new_metrics)
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                UPDATE enhanced_user_profiles 
                SET browsing_history = %s, 
                    location_data = %s, 
                    conversation_preferences = %s,
                    behavioral_traits = %s,
                    engagement_metrics = %s,
                    last_updated = %s
                WHERE user_id = %s
                RETURNING *
                """
                cursor.execute(query, (
                    json.dumps(browsing_history),
                    json.dumps(location_data),
                    json.dumps(conversation_preferences),
                    json.dumps(behavioral_traits),
                    json.dumps(engagement_metrics),
                    last_updated,
                    user_id
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                if not result:
                    raise Exception("User profile not found")
                
                updated_profile = {
                    'id': result['id'],
                    'user_id': result['user_id'],
                    'browsing_history': json.loads(result['browsing_history']),
                    'location_data': json.loads(result['location_data']),
                    'conversation_preferences': json.loads(result['conversation_preferences']),
                    'behavioral_traits': json.loads(result['behavioral_traits']),
                    'engagement_metrics': json.loads(result['engagement_metrics']),
                    'last_updated': result['last_updated']
                }
                
                # Update cache
                self.cache[user_id] = updated_profile
                
                return updated_profile
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Failed to update enhanced user profile: {e}")
            raise Exception(f"Failed to update enhanced user profile: {str(e)}")
    
    async def get_behavioral_traits(self, user_id: str) -> Dict[str, Any]:
        """Get behavioral traits for a user"""
        try:
            profile = await self.get_enhanced_profile(user_id)
            if not profile:
                raise Exception("User profile not found")
            
            return profile['behavioral_traits']
            
        except Exception as e:
            logger.error(f"Failed to get behavioral traits: {e}")
            raise Exception(f"Failed to get behavioral traits: {str(e)}")
    
    async def get_engagement_metrics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get engagement metrics for a user"""
        try:
            profile = await self.get_enhanced_profile(user_id)
            if not profile:
                raise Exception("User profile not found")
            
            # Calculate metrics for the specified time period
            cutoff_date = datetime.now() - timedelta(days=days)
            recent_history = [
                item for item in profile['browsing_history']
                if datetime.fromisoformat(item['timestamp']) >= cutoff_date
            ]
            
            metrics = self._calculate_engagement_metrics(recent_history)
            metrics['time_period_days'] = days
            metrics['total_events'] = len(recent_history)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to get engagement metrics: {e}")
            raise Exception(f"Failed to get engagement metrics: {str(e)}")
    
    async def get_analytics_summary(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get analytics summary for a user"""
        try:
            profile = await self.get_enhanced_profile(user_id)
            if not profile:
                raise Exception("User profile not found")
            
            # Get engagement metrics
            engagement_metrics = await self.get_engagement_metrics(user_id, days)
            
            # Get behavioral traits
            behavioral_traits = profile['behavioral_traits']
            
            # Calculate activity patterns
            activity_patterns = self._calculate_activity_patterns(profile['browsing_history'], days)
            
            # Calculate interest evolution
            interest_evolution = self._calculate_interest_evolution(profile['browsing_history'], days)
            
            return {
                'user_id': user_id,
                'engagement_metrics': engagement_metrics,
                'behavioral_traits': behavioral_traits,
                'activity_patterns': activity_patterns,
                'interest_evolution': interest_evolution,
                'time_period_days': days,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get analytics summary: {e}")
            raise Exception(f"Failed to get analytics summary: {str(e)}")
    
    def _analyze_behavioral_traits(self, browsing_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze behavioral traits from browsing history"""
        traits = {
            'session_duration_avg': 0,
            'page_views_avg': 0,
            'bounce_rate': 0,
            'time_on_page_avg': 0,
            'returning_user': False,
            'loyalty_score': 0,
            'engagement_level': 'low',
            'preferred_categories': [],
            'browsing_patterns': {
                'peak_hours': [],
                'weekend_activity': 0,
                'weekday_activity': 0
            },
            'device_preferences': {
                'mobile': 0,
                'desktop': 0,
                'tablet': 0
            }
        }
        
        if not browsing_history:
            return traits
        
        # Calculate session metrics
        sessions = self._group_into_sessions(browsing_history)
        if sessions:
            session_durations = [session['duration'] for session in sessions]
            traits['session_duration_avg'] = statistics.mean(session_durations) if session_durations else 0
            traits['page_views_avg'] = statistics.mean([len(session['pages']) for session in sessions])
            traits['bounce_rate'] = len([s for s in sessions if len(s['pages']) == 1]) / len(sessions)
        
        # Calculate time on page
        time_on_pages = [page.get('time_on_page', 0) for page in browsing_history if page.get('time_on_page')]
        traits['time_on_page_avg'] = statistics.mean(time_on_pages) if time_on_pages else 0
        
        # Determine if returning user
        unique_days = len(set([page['timestamp'][:10] for page in browsing_history]))
        traits['returning_user'] = unique_days > 1
        
        # Calculate loyalty score
        traits['loyalty_score'] = self._calculate_loyalty_score(browsing_history)
        
        # Determine engagement level
        traits['engagement_level'] = self._determine_engagement_level(traits['loyalty_score'])
        
        # Extract preferred categories
        categories = [page.get('category', 'unknown') for page in browsing_history if page.get('category')]
        if categories:
            category_counts = Counter(categories)
            traits['preferred_categories'] = [cat for cat, count in category_counts.most_common(3)]
        
        # Analyze browsing patterns
        for page in browsing_history:
            timestamp = datetime.fromisoformat(page['timestamp'])
            hour = timestamp.hour
            
            # Peak hours analysis
            if 9 <= hour <= 17:  # Business hours
                if hour not in traits['browsing_patterns']['peak_hours']:
                    traits['browsing_patterns']['peak_hours'].append(hour)
            
            # Weekend vs weekday
            if timestamp.weekday() >= 5:  # Weekend
                traits['browsing_patterns']['weekend_activity'] += 1
            else:
                traits['browsing_patterns']['weekday_activity'] += 1
            
            # Device preferences
            device = page.get('device_type', 'unknown').lower()
            if device in traits['device_preferences']:
                traits['device_preferences'][device] += 1
        
        # Normalize device preferences
        total_devices = sum(traits['device_preferences'].values())
        if total_devices > 0:
            for device in traits['device_preferences']:
                traits['device_preferences'][device] = traits['device_preferences'][device] / total_devices
        
        return traits
    
    def _calculate_engagement_metrics(self, browsing_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate engagement metrics"""
        metrics = {
            'total_sessions': 0,
            'total_page_views': 0,
            'avg_session_duration': 0,
            'avg_pages_per_session': 0,
            'bounce_rate': 0,
            'conversion_rate': 0,
            'retention_rate': 0,
            'engagement_score': 0
        }
        
        if not browsing_history:
            return metrics
        
        # Group into sessions
        sessions = self._group_into_sessions(browsing_history)
        metrics['total_sessions'] = len(sessions)
        metrics['total_page_views'] = len(browsing_history)
        
        if sessions:
            # Calculate session metrics
            session_durations = [session['duration'] for session in sessions]
            session_page_counts = [len(session['pages']) for session in sessions]
            
            metrics['avg_session_duration'] = statistics.mean(session_durations) if session_durations else 0
            metrics['avg_pages_per_session'] = statistics.mean(session_page_counts) if session_page_counts else 0
            
            # Calculate bounce rate
            metrics['bounce_rate'] = len([s for s in sessions if len(s['pages']) == 1]) / len(sessions)
            
            # Calculate engagement score (0-100)
            metrics['engagement_score'] = self._calculate_engagement_score(sessions)
        
        return metrics
    
    def _group_into_sessions(self, browsing_history: List[Dict[str, Any]], session_timeout: int = 30) -> List[Dict[str, Any]]:
        """Group browsing history into sessions"""
        if not browsing_history:
            return []
        
        # Sort by timestamp
        sorted_history = sorted(browsing_history, key=lambda x: x['timestamp'])
        
        sessions = []
        current_session = {
            'start_time': sorted_history[0]['timestamp'],
            'pages': [sorted_history[0]],
            'duration': 0
        }
        
        for i in range(1, len(sorted_history)):
            current_time = datetime.fromisoformat(sorted_history[i]['timestamp'])
            last_time = datetime.fromisoformat(sorted_history[i-1]['timestamp'])
            
            time_diff = (current_time - last_time).total_seconds() / 60  # Convert to minutes
            
            if time_diff > session_timeout:
                # End current session
                current_session['duration'] = (
                    datetime.fromisoformat(current_session['start_time']) - 
                    datetime.fromisoformat(current_session['pages'][-1]['timestamp'])
                ).total_seconds() / 60
                sessions.append(current_session)
                
                # Start new session
                current_session = {
                    'start_time': sorted_history[i]['timestamp'],
                    'pages': [sorted_history[i]],
                    'duration': 0
                }
            else:
                current_session['pages'].append(sorted_history[i])
        
        # Add the last session
        current_session['duration'] = (
            datetime.fromisoformat(current_session['start_time']) - 
            datetime.fromisoformat(current_session['pages'][-1]['timestamp'])
        ).total_seconds() / 60
        sessions.append(current_session)
        
        return sessions
    
    def _calculate_loyalty_score(self, browsing_history: List[Dict[str, Any]]) -> float:
        """Calculate loyalty score (0-100)"""
        if not browsing_history:
            return 0
        
        # Factors for loyalty score
        unique_days = len(set([page['timestamp'][:10] for page in browsing_history]))
        total_days = (datetime.now() - datetime.fromisoformat(browsing_history[0]['timestamp'])).days + 1
        
        # Return rate (visits per day)
        return_rate = unique_days / max(total_days, 1)
        
        # Session frequency
        sessions = self._group_into_sessions(browsing_history)
        session_frequency = len(sessions) / max(total_days, 1)
        
        # Page depth
        avg_pages_per_session = statistics.mean([len(session['pages']) for session in sessions]) if sessions else 0
        
        # Combine factors (weights can be adjusted)
        loyalty_score = (
            return_rate * 0.4 +
            session_frequency * 0.3 +
            min(avg_pages_per_session / 10, 1) * 0.3
        ) * 100
        
        return min(loyalty_score, 100)
    
    def _determine_engagement_level(self, loyalty_score: float) -> str:
        """Determine engagement level based on loyalty score"""
        if loyalty_score >= 80:
            return 'high'
        elif loyalty_score >= 50:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_engagement_score(self, sessions: List[Dict[str, Any]]) -> float:
        """Calculate overall engagement score (0-100)"""
        if not sessions:
            return 0
        
        # Factors for engagement score
        avg_session_duration = statistics.mean([s['duration'] for s in sessions])
        avg_pages_per_session = statistics.mean([len(s['pages']) for s in sessions])
        bounce_rate = len([s for s in sessions if len(s['pages']) == 1]) / len(sessions)
        
        # Combine factors
        engagement_score = (
            min(avg_session_duration / 30, 1) * 0.4 +  # Max 30 minutes per session
            min(avg_pages_per_session / 10, 1) * 0.4 +  # Max 10 pages per session
            (1 - bounce_rate) * 0.2  # Lower bounce rate is better
        ) * 100
        
        return min(engagement_score, 100)
    
    def _calculate_activity_patterns(self, browsing_history: List[Dict[str, Any]], days: int) -> Dict[str, Any]:
        """Calculate activity patterns"""
        patterns = {
            'hourly_activity': defaultdict(int),
            'daily_activity': defaultdict(int),
            'monthly_activity': defaultdict(int),
            'peak_hours': [],
            'peak_days': [],
            'activity_trend': 'stable'
        }
        
        if not browsing_history:
            return patterns
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        for page in browsing_history:
            timestamp = datetime.fromisoformat(page['timestamp'])
            
            if timestamp >= cutoff_date:
                patterns['hourly_activity'][timestamp.hour] += 1
                patterns['daily_activity'][timestamp.weekday()] += 1
                patterns['monthly_activity'][timestamp.month] += 1
        
        # Find peak hours
        if patterns['hourly_activity']:
            peak_hour = max(patterns['hourly_activity'].items(), key=lambda x: x[1])
            patterns['peak_hours'] = [peak_hour[0]]
        
        # Find peak days
        if patterns['daily_activity']:
            peak_day = max(patterns['daily_activity'].items(), key=lambda x: x[1])
            patterns['peak_days'] = [peak_day[0]]
        
        # Determine activity trend
        if days >= 7:
            recent_activity = sum(1 for page in browsing_history[-7:] 
                                if datetime.fromisoformat(page['timestamp']) >= cutoff_date)
            older_activity = sum(1 for page in browsing_history[:-7] 
                               if datetime.fromisoformat(page['timestamp']) >= cutoff_date - timedelta(days=7))
            
            if recent_activity > older_activity * 1.2:
                patterns['activity_trend'] = 'increasing'
            elif recent_activity < older_activity * 0.8:
                patterns['activity_trend'] = 'decreasing'
            else:
                patterns['activity_trend'] = 'stable'
        
        return patterns
    
    def _calculate_interest_evolution(self, browsing_history: List[Dict[str, Any]], days: int) -> Dict[str, Any]:
        """Calculate interest evolution over time"""
        evolution = {
            'current_interests': [],
            'emerging_interests': [],
            'declining_interests': [],
            'interest_stability': 0,
            'top_interests_change': []
        }
        
        if not browsing_history:
            return evolution
        
        # Group interests by time periods
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_history = [page for page in browsing_history 
                         if datetime.fromisoformat(page['timestamp']) >= cutoff_date]
        
        if len(recent_history) < 2:
            return evolution
        
        # Split into two periods
        mid_point = len(recent_history) // 2
        early_period = recent_history[:mid_point]
        late_period = recent_history[mid_point:]
        
        # Extract interests from each period
        early_interests = [page.get('category', 'unknown') for page in early_period if page.get('category')]
        late_interests = [page.get('category', 'unknown') for page in late_period if page.get('category')]
        
        if early_interests and late_interests:
            # Count interests
            early_counts = Counter(early_interests)
            late_counts = Counter(late_interests)
            
            # Current interests (top 3 from late period)
            evolution['current_interests'] = [cat for cat, count in late_counts.most_common(3)]
            
            # Emerging interests (growing in late period)
            evolution['emerging_interests'] = [
                cat for cat in late_counts 
                if cat not in early_counts or late_counts[cat] > early_counts[cat] * 1.5
            ]
            
            # Declining interests (declining in late period)
            evolution['declining_interests'] = [
                cat for cat in early_counts 
                if cat not in late_counts or late_counts[cat] < early_counts[cat] * 0.5
            ]
            
            # Calculate interest stability
            common_interests = set(early_counts.keys()) & set(late_counts.keys())
            total_interests = len(set(early_counts.keys()) | set(late_counts.keys()))
            evolution['interest_stability'] = len(common_interests) / max(total_interests, 1)
            
            # Track top interests change
            early_top = set([cat for cat, count in early_counts.most_common(3)])
            late_top = set([cat for cat, count in late_counts.most_common(3)])
            evolution['top_interests_change'] = list(early_top.symmetric_difference(late_top))
        
        return evolution
    
    def clear_cache(self, user_id: Optional[str] = None):
        """Clear cache for specific user or all users"""
        if user_id:
            self.cache.pop(user_id, None)
        else:
            self.cache.clear()