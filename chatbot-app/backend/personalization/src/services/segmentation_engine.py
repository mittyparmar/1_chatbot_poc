
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
from sklearn.decomposition import PCA
import asyncio

logger = logging.getLogger(__name__)

class SegmentationEngine:
    def __init__(self):
        self.connection = self._get_connection()
        self.segment_cache = {}  # Cache for segments
        self.user_segments = {}  # Cache for user-segment mappings
        
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    async def initialize(self):
        """Initialize segmentation engine"""
        try:
            # Create necessary tables if they don't exist
            await self._ensure_tables_exist()
            logger.info("Segmentation Engine initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Segmentation Engine: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            # Clear caches
            self.segment_cache.clear()
            self.user_segments.clear()
            logger.info("Segmentation Engine cleanup complete")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def _ensure_tables_exist(self):
        """Ensure necessary tables exist"""
        try:
            with self.connection.cursor() as cursor:
                # Create user segments table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_segments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    segment_id VARCHAR(255) NOT NULL,
                    user_id VARCHAR(255) NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    score FLOAT DEFAULT 1.0,
                    UNIQUE(segment_id, user_id)
                )
                """)
                
                # Create segment definitions table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS segment_definitions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    segment_id VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    criteria JSONB NOT NULL,
                    algorithm VARCHAR(100) DEFAULT 'rule_based',
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                
                # Create segment performance table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS segment_performance (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    segment_id VARCHAR(255) NOT NULL,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value FLOAT NOT NULL,
                    period_days INTEGER NOT NULL,
                    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                
                self.connection.commit()
                logger.info("Segmentation tables created/verified")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error ensuring tables exist: {e}")
            raise
    
    async def create_segmentation(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user segmentation"""
        try:
            algorithm = request_data.get('algorithm', 'rule_based')
            parameters = request_data.get('parameters', {})
            user_ids = request_data.get('user_ids')
            
            # Generate segment ID
            segment_id = str(uuid.uuid4())
            name = parameters.get('name', f'Segment_{segment_id[:8]}')
            description = parameters.get('description', 'Auto-generated segment')
            criteria = parameters.get('criteria', {})
            
            # Store segment definition
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO segment_definitions 
                (segment_id, name, description, criteria, algorithm)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING *
                """
                cursor.execute(query, (
                    segment_id,
                    name,
                    description,
                    json.dumps(criteria),
                    algorithm
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
            
            # Assign users to segment based on algorithm
            if algorithm == 'rule_based':
                assigned_users = await self._rule_based_segmentation(segment_id, criteria, user_ids)
            elif algorithm == 'clustering':
                assigned_users = await self._clustering_segmentation(segment_id, parameters, user_ids)
            elif algorithm == 'behavioral':
                assigned_users = await self._behavioral_segmentation(segment_id, parameters, user_ids)
            else:
                raise ValueError(f"Unsupported segmentation algorithm: {algorithm}")
            
            # Cache the segment
            self.segment_cache[segment_id] = {
                'id': result[0],
                'segment_id': result[1],
                'name': result[2],
                'description': result[3],
                'criteria': json.loads(result[4]),
                'algorithm': result[5],
                'created_at': result[6]
            }
            
            return {
                'segment_id': segment_id,
                'name': name,
                'description': description,
                'algorithm': algorithm,
                'assigned_users': len(assigned_users),
                'user_ids': assigned_users
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error creating segmentation: {e}")
            raise Exception(f"Failed to create segmentation: {str(e)}")
    
    async def list_segments(self) -> List[Dict[str, Any]]:
        """List all user segments"""
        try:
            # Check cache first
            if self.segment_cache:
                return list(self.segment_cache.values())
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT * FROM segment_definitions 
                WHERE is_active = TRUE 
                ORDER BY created_at DESC
                """
                cursor.execute(query)
                results = cursor.fetchall()
                
                segments = []
                for result in results:
                    segment = {
                        'id': result['id'],
                        'segment_id': result['segment_id'],
                        'name': result['name'],
                        'description': result['description'],
                        'criteria': json.loads(result['criteria']),
                        'algorithm': result['algorithm'],
                        'created_at': result['created_at']
                    }
                    segments.append(segment)
                    self.segment_cache[result['segment_id']] = segment
                
                return segments
                
        except Exception as e:
            logger.error(f"Error listing segments: {e}")
            raise Exception(f"Failed to list segments: {str(e)}")
    
    async def get_segment_users(self, segment_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get users in a segment"""
        try:
            # Check cache first
            if segment_id in self.user_segments:
                return self.user_segments[segment_id][:limit]
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT us.*, u.name, u.email 
                FROM user_segments us
                JOIN users u ON us.user_id = u.id
                WHERE us.segment_id = %s
                ORDER BY us.assigned_at DESC
                LIMIT %s
                """
                cursor.execute(query, (segment_id, limit))
                results = cursor.fetchall()
                
                users = []
                for result in results:
                    users.append({
                        'user_id': result['user_id'],
                        'name': result['name'],
                        'email': result['email'],
                        'assigned_at': result['assigned_at'],
                        'score': result['score']
                    })
                
                # Cache the users
                if segment_id not in self.user_segments:
                    self.user_segments[segment_id] = []
                self.user_segments[segment_id].extend(users)
                
                # Keep cache size manageable
                if len(self.user_segments[segment_id]) > 1000:
                    self.user_segments[segment_id] = self.user_segments[segment_id][-1000:]
                
                return users
                
        except Exception as e:
            logger.error(f"Error getting segment users: {e}")
            raise Exception(f"Failed to get segment users: {str(e)}")
    
    async def update_segment(self, segment_id: str, criteria: Dict[str, Any]) -> Dict[str, Any]:
        """Update segment criteria"""
        try:
            # Get current segment
            current_segment = await self._get_segment_definition(segment_id)
            if not current_segment:
                raise ValueError(f"Segment {segment_id} not found")
            
            # Update criteria
            updated_criteria = {**current_segment['criteria'], **criteria}
            
            with self.connection.cursor() as cursor:
                query = """
                UPDATE segment_definitions
                SET criteria = %s, updated_at = CURRENT_TIMESTAMP
                WHERE segment_id = %s
                RETURNING *
                """
                cursor.execute(query, (json.dumps(updated_criteria), segment_id))
                
                result = cursor.fetchone()
                self.connection.commit()
            
            # Update cache
            self.segment_cache[segment_id] = {
                'id': result[0],
                'segment_id': result[1],
                'name': result[2],
                'description': result[3],
                'criteria': json.loads(result[4]),
                'algorithm': result[5],
                'created_at': result[6]
            }
            
            # Re-segment users if needed
            if criteria.get('auto_reassign', False):
                await self._reassign_segment_users(segment_id, updated_criteria)
            
            return {
                'segment_id': segment_id,
                'name': result[2],
                'description': result[3],
                'criteria': updated_criteria,
                'updated_at': result[6]
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error updating segment: {e}")
            raise Exception(f"Failed to update segment: {str(e)}")
    
    async def delete_segment(self, segment_id: str) -> Dict[str, Any]:
        """Delete a segment"""
        try:
            # Get segment info before deletion
            segment = await self._get_segment_definition(segment_id)
            if not segment:
                raise ValueError(f"Segment {segment_id} not found")
            
            with self.connection.cursor() as cursor:
                # Delete user segment assignments
                cursor.execute("DELETE FROM user_segments WHERE segment_id = %s", (segment_id,))
                
                # Delete segment definition
                cursor.execute("DELETE FROM segment_definitions WHERE segment_id = %s", (segment_id,))
                
                self.connection.commit()
            
            # Clear cache
            self.segment_cache.pop(segment_id, None)
            self.user_segments.pop(segment_id, None)
            
            return {
                'segment_id': segment_id,
                'name': segment['name'],
                'deleted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error deleting segment: {e}")
            raise Exception(f"Failed to delete segment: {str(e)}")
    
    async def get_segment_performance(self, segment_id: str, days: int = 30) -> Dict[str, Any]:
        """Get segment performance metrics"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT metric_name, metric_value, period_days, calculated_at
                FROM segment_performance
                WHERE segment_id = %s AND period_days = %s
                ORDER BY calculated_at DESC
                """
                cursor.execute(query, (segment_id, days))
                results = cursor.fetchall()
                
                performance = {
                    'segment_id': segment_id,
                    'period_days': days,
                    'metrics': {},
                    'calculated_at': datetime.now().isoformat()
                }
                
                for result in results:
                    performance['metrics'][result['metric_name']] = result['metric_value']
                
                return performance
                
        except Exception as e:
            logger.error(f"Error getting segment performance: {e}")
            raise Exception(f"Failed to get segment performance: {str(e)}")
    
    async def _get_segment_definition(self, segment_id: str) -> Optional[Dict[str, Any]]:
        """Get segment definition"""
        try:
            # Check cache first
            if segment_id in self.segment_cache:
                return self.segment_cache[segment_id]
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = "SELECT * FROM segment_definitions WHERE segment_id = %s"
                cursor.execute(query, (segment_id,))
                result = cursor.fetchone()
                
                if result:
                    segment = {
                        'id': result['id'],
                        'segment_id': result['segment_id'],
                        'name': result['name'],
                        'description': result['description'],
                        'criteria': json.loads(result['criteria']),
                        'algorithm': result['algorithm'],
                        'created_at': result['created_at']
                    }
                    self.segment_cache[segment_id] = segment
                    return segment
                
                return None
                
        except Exception as e:
            logger.error(f"Error getting segment definition: {e}")
            return None
    
    async def _rule_based_segmentation(self, segment_id: str, criteria: Dict[str, Any], user_ids: Optional[List[str]] = None) -> List[str]:
        """Rule-based segmentation"""
        try:
            assigned_users = []
            
            # Build query based on criteria
            query_parts = []
            params = []
            
            if 'engagement_level' in criteria:
                query_parts.append("engagement_level = %s")
                params.append(criteria['engagement_level'])
            
            if 'loyalty_score_min' in criteria:
                query_parts.append("loyalty_score >= %s")
                params.append(criteria['loyalty_score_min'])
            
            if 'last_active_days' in criteria:
                cutoff_date = datetime.now() - timedelta(days=criteria['last_active_days'])
                query_parts.append("last_login >= %s")
                params.append(cutoff_date)
            
            if 'interests' in criteria:
                interests = criteria['interests']
                if isinstance(interests, list):
                    placeholders = ', '.join(['%s'] * len(interests))
                    query_parts.append(f"interests && ARRAY[{placeholders}]")
                    params.extend(interests)
            
            # Build final query
            base_query = "SELECT id FROM enhanced_user_profiles WHERE"
            where_clause = " AND ".join(query_parts) if query_parts else "1=1"
            
            if user_ids:
                placeholders = ', '.join(['%s'] * len(user_ids))
                user_clause = f" AND id IN ({placeholders})"
                params.extend(user_ids)
            else:
                user_clause = ""
            
            final_query = f"{base_query} {where_clause} {user_clause}"
            
            with self.connection.cursor() as cursor:
                cursor.execute(final_query, params)
                user_results = cursor.fetchall()
                
                for result in user_results:
                    user_id = result[0]
                    assigned_users.append(user_id)
                    
                    # Assign user to segment
                    await self._assign_user_to_segment(segment_id, user_id)
            
            return assigned_users
            
        except Exception as e:
            logger.error(f"Error in rule-based segmentation: {e}")
            return []
    
    async def _clustering_segmentation(self, segment_id: str, parameters: Dict[str, Any], user_ids: Optional[List[str]] = None) -> List[str]:
        """Clustering-based segmentation"""
        try:
            # Get user features for clustering
            user_features = await self._get_user_features_for_clustering(user_ids)
            
            if not user_features:
                return []
            
            # Prepare data for clustering
            feature_matrix = np.array([user['features'] for user in user_features])
            user_ids_list = [user['user_id'] for user in user_features]
            
            # Standardize features
            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(feature_matrix)
            
            # Apply PCA for dimensionality reduction if needed
            if parameters.get('use_pca', False):
                pca = PCA(n_components=min(3, scaled_features.shape[1]))
                scaled_features = pca.fit_transform(scaled_features)
            
            # Perform clustering
            n_clusters = parameters.get('n_clusters', 3)
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(scaled_features)
            
            # Assign users to segments based on cluster
            target_cluster = parameters.get('target_cluster', 0)
            assigned_users = []
            
            for i, user_id in enumerate(user_ids_list):
                if cluster_labels[i] == target_cluster:
                    assigned_users.append(user_id)
                    await self._assign_user_to_segment(segment_id, user_id)
            
            return assigned_users
            
        except Exception as e:
            logger.error(f"Error in clustering segmentation: {e}")
            return []
    
    async def _behavioral_segmentation(self, segment_id: str, parameters: Dict[str, Any], user_ids: Optional[List[str]] = None) -> List[str]:
        """Behavioral segmentation"""
        try:
            assigned_users = []
            
            # Get behavioral metrics for users
            behavioral_metrics = await self._get_behavioral_metrics(user_ids)
            
            # Apply behavioral filters
            for user_id, metrics in behavioral_metrics.items():
                matches_criteria = True
                
                # Check session frequency
                if 'min_sessions_per_week' in parameters:
                    min_sessions = parameters['min_sessions_per_week']
                    if metrics.get('sessions_per_week', 0) < min_sessions:
                        matches_criteria = False
                
                # Check average session duration
                if 'min_session_duration' in parameters:
                    min_duration = parameters['min_session_duration']
                    if metrics.get('avg_session_duration', 0) < min_duration:
                        matches_criteria = False
                
                # Check bounce rate
                if 'max_bounce_rate' in parameters:
                    max_bounce = parameters['max_bounce_rate']
                    if metrics.get('bounce_rate', 1.0) > max_bounce:
                        matches_criteria = False
                
                # Check page depth
                if 'min_page_depth' in parameters:
                    min_depth = parameters['min_page_depth']
                    if metrics.get('avg_pages_per_session', 0) < min_depth:
                        matches_criteria = False
                
                if matches_criteria:
                    assigned_users.append(user_id)
                    await self._assign_user_to_segment(segment_id, user_id)
            
            return assigned_users
            
        except Exception as e:
            logger.error(f"Error in behavioral segmentation: {e}")
            return []
    
    async def _get_user_features_for_clustering(self, user_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Get user features for clustering"""
        try:
            features = []
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT
                    user_id,
                    COALESCE(engagement_metrics->>'total_sessions', 0)::int as total_sessions,
                    COALESCE(engagement_metrics->>'avg_session_duration', 0)::float as avg_session_duration,
                    COALESCE(engagement_metrics->>'avg_pages_per_session', 0)::float as avg_pages_per_session,
                    COALESCE(behavioral_traits->>'loyalty_score', 0)::float as loyalty_score,
                    COALESCE(behavioral_traits->>'engagement_level', 'low') as engagement_level
                FROM enhanced_user_profiles
                """
                
                if user_ids:
                    placeholders = ', '.join(['%s'] * len(user_ids))
                    query += f" WHERE user_id IN ({placeholders})"
                    cursor.execute(query, user_ids)
                else:
                    cursor.execute(query)
                
                results = cursor.fetchall()
                
                for result in results:
                    # Convert categorical features to numerical
                    engagement_level_map = {'low': 0, 'medium': 1, 'high': 2}
                    engagement_level = engagement_level_map.get(result['engagement_level'], 0)
                    
                    feature_vector = [
                        result['total_sessions'],
                        result['avg_session_duration'],
                        result['avg_pages_per_session'],
                        result['loyalty_score'],
                        engagement_level
                    ]
                    
                    features.append({
                        'user_id': result['user_id'],
                        'features': feature_vector
                    })
            
            return features
            
        except Exception as e:
            logger.error(f"Error getting user features for clustering: {e}")
            return []
    
    async def _get_behavioral_metrics(self, user_ids: Optional[List[str]] = None) -> Dict[str, Dict[str, Any]]:
        """Get behavioral metrics for users"""
        try:
            metrics = {}
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT
                    user_id,
                    engagement_metrics,
                    behavioral_traits
                FROM enhanced_user_profiles
                """
                
                if user_ids:
                    placeholders = ', '.join(['%s'] * len(user_ids))
                    query += f" WHERE user_id IN ({placeholders})"
                    cursor.execute(query, user_ids)
                else:
                    cursor.execute(query)
                
                results = cursor.fetchall()
                
                for result in results:
                    engagement_metrics = json.loads(result['engagement_metrics']) if result['engagement_metrics'] else {}
                    behavioral_traits = json.loads(result['behavioral_traits']) if result['behavioral_traits'] else {}
                    
                    user_metrics = {
                        'sessions_per_week': engagement_metrics.get('total_sessions', 0) / 4,  # Assuming 4 weeks
                        'avg_session_duration': engagement_metrics.get('avg_session_duration', 0),
                        'avg_pages_per_session': engagement_metrics.get('avg_pages_per_session', 0),
                        'bounce_rate': engagement_metrics.get('bounce_rate', 0),
                        'loyalty_score': behavioral_traits.get('loyalty_score', 0)
                    }
                    
                    metrics[result['user_id']] = user_metrics
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting behavioral metrics: {e}")
            return {}
    
    async def _assign_user_to_segment(self, segment_id: str, user_id: str, score: float = 1.0):
        """Assign user to segment"""
        try:
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO user_segments (segment_id, user_id, score)
                VALUES (%s, %s, %s)
                ON CONFLICT (segment_id, user_id) DO UPDATE
                SET score = %s, assigned_at = CURRENT_TIMESTAMP
                """
                cursor.execute(query, (segment_id, user_id, score, score))
                self.connection.commit()
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error assigning user to segment: {e}")
    
    async def _reassign_segment_users(self, segment_id: str, criteria: Dict[str, Any]):
        """Reassign users to segment based on new criteria"""
        try:
            # Remove existing assignments
            with self.connection.cursor() as cursor:
                cursor.execute("DELETE FROM user_segments WHERE segment_id = %s", (segment_id,))
                self.connection.commit()
            
            # Reassign using the same algorithm
            algorithm = criteria.get('algorithm', 'rule_based')
            if algorithm == 'rule_based':
                await self._rule_based_segmentation(segment_id, criteria)
            elif algorithm == 'clustering':
                await self._clustering_segmentation(segment_id, criteria)
            elif algorithm == 'behavioral':
                await self._behavioral_segmentation(segment_id, criteria)
            
        except Exception as e:
            logger.error(f"Error reassigning segment users: {e}")
            raise