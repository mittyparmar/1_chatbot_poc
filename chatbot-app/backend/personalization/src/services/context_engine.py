import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

class ContextEngine:
    def __init__(self):
        self.connection = self._get_connection()
    
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    async def add_context(self, context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add context data for a user"""
        try:
            context_id = str(uuid.uuid4())
            user_id = context_data['user_id']
            conversation_id = context_data['conversation_id']
            message_content = context_data['message_content']
            timestamp = context_data.get('timestamp', datetime.now().isoformat())
            
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO personalization_data 
                (id, user_id, conversation_id, message_content, context_type, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """
                cursor.execute(query, (
                    context_id,
                    user_id,
                    conversation_id,
                    message_content,
                    'conversation',
                    timestamp
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                return {
                    'id': result[0],
                    'user_id': result[1],
                    'conversation_id': result[2],
                    'message_content': result[3],
                    'context_type': result[4],
                    'created_at': result[5]
                }
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to add context data: {str(e)}")
    
    async def get_context(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get user context data"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT * FROM personalization_data 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT %s
                """
                cursor.execute(query, (user_id, limit))
                results = cursor.fetchall()
                
                context_data = []
                for result in results:
                    context_data.append({
                        'id': result['id'],
                        'user_id': result['user_id'],
                        'conversation_id': result['conversation_id'],
                        'message_content': result['message_content'],
                        'context_type': result['context_type'],
                        'created_at': result['created_at']
                    })
                
                return {
                    'user_id': user_id,
                    'context_data': context_data,
                    'total_entries': len(context_data)
                }
                
        except Exception as e:
            raise Exception(f"Failed to get user context: {str(e)}")
    
    async def get_user_behavior_patterns(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Analyze user behavior patterns"""
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get conversation patterns
                query = """
                SELECT 
                    DATE_TRUNC('hour', created_at) as hour,
                    COUNT(*) as message_count,
                    AVG(LENGTH(message_content)) as avg_message_length
                FROM personalization_data 
                WHERE user_id = %s AND created_at >= %s
                GROUP BY DATE_TRUNC('hour', created_at)
                ORDER BY hour
                """
                cursor.execute(query, (user_id, cutoff_date))
                hourly_patterns = cursor.fetchall()
                
                # Get conversation topics (simple keyword analysis)
                query = """
                SELECT message_content FROM personalization_data 
                WHERE user_id = %s AND created_at >= %s
                """
                cursor.execute(query, (user_id, cutoff_date))
                messages = cursor.fetchall()
                
                # Simple topic extraction (in real implementation, use NLP)
                topics = self._extract_topics([msg['message_content'] for msg in messages])
                
                return {
                    'user_id': user_id,
                    'time_period_days': days,
                    'hourly_activity': [
                        {
                            'hour': pattern['hour'].isoformat(),
                            'message_count': pattern['message_count'],
                            'avg_message_length': float(pattern['avg_message_length']) if pattern['avg_message_length'] else 0
                        }
                        for pattern in hourly_patterns
                    ],
                    'conversation_topics': topics,
                    'total_messages': len(messages)
                }
                
        except Exception as e:
            raise Exception(f"Failed to analyze user behavior: {str(e)}")
    
    async def get_similar_users(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Find users with similar behavior patterns"""
        try:
            # Get current user's behavior
            user_behavior = await self.get_user_behavior_patterns(user_id, 30)
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Get all other users with recent activity
                query = """
                SELECT DISTINCT user_id FROM personalization_data 
                WHERE user_id != %s AND created_at >= NOW() - INTERVAL '30 days'
                """
                cursor.execute(query, (user_id,))
                other_users = cursor.fetchall()
                
                similar_users = []
                for other_user in other_users[:limit]:  # Limit to avoid too many calculations
                    other_behavior = await self.get_user_behavior_patterns(other_user['user_id'], 30)
                    similarity_score = self._calculate_similarity(user_behavior, other_behavior)
                    
                    if similarity_score > 0.5:  # Threshold for similarity
                        similar_users.append({
                            'user_id': other_user['user_id'],
                            'similarity_score': similarity_score,
                            'activity_level': other_behavior['total_messages']
                        })
                
                # Sort by similarity score
                similar_users.sort(key=lambda x: x['similarity_score'], reverse=True)
                
                return similar_users[:limit]
                
        except Exception as e:
            raise Exception(f"Failed to find similar users: {str(e)}")
    
    def _extract_topics(self, messages: List[str]) -> List[Dict[str, Any]]:
        """Simple topic extraction from messages"""
        # This is a simplified version - in production, use proper NLP
        topic_keywords = {
            'technical': ['code', 'bug', 'error', 'fix', 'technical', 'development'],
            'sales': ['price', 'cost', 'buy', 'purchase', 'sale', 'discount'],
            'support': ['help', 'support', 'issue', 'problem', 'broken'],
            'general': ['hello', 'hi', 'thanks', 'thank you', 'good']
        }
        
        topic_counts = {topic: 0 for topic in topic_keywords.keys()}
        
        for message in messages:
            message_lower = message.lower()
            for topic, keywords in topic_keywords.items():
                for keyword in keywords:
                    if keyword in message_lower:
                        topic_counts[topic] += 1
                        break
        
        # Convert to percentage
        total_messages = len(messages)
        topic_percentages = [
            {
                'topic': topic,
                'percentage': round((count / total_messages) * 100, 2) if total_messages > 0 else 0
            }
            for topic, count in topic_counts.items()
            if count > 0
        ]
        
        return topic_percentages
    
    def _calculate_similarity(self, behavior1: Dict[str, Any], behavior2: Dict[str, Any]) -> float:
        """Calculate similarity between two behavior patterns"""
        # Simple similarity based on activity level and topic overlap
        activity_similarity = 1 - abs(behavior1['total_messages'] - behavior2['total_messages']) / max(behavior1['total_messages'], behavior2['total_messages'], 1)
        
        # Topic similarity (simplified)
        topics1 = {t['topic'] for t in behavior1.get('conversation_topics', [])}
        topics2 = {t['topic'] for t in behavior2.get('conversation_topics', [])}
        
        if topics1 or topics2:
            topic_overlap = len(topics1.intersection(topics2)) / len(topics1.union(topics2))
        else:
            topic_overlap = 1.0
        
        return (activity_similarity + topic_overlap) / 2