import json
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

class RecommendationService:
    def __init__(self):
        self.connection = self._get_connection()
        self.recommendation_strategies = {
            'content_based': self._content_based_recommendation,
            'collaborative_filtering': self._collaborative_filtering_recommendation,
            'trending': self._trending_recommendation,
            'context_aware': self._context_aware_recommendation
        }
    
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    async def get_recommendations(self, user_id: str, context: Dict[str, Any], limit: int = 5) -> List[Dict[str, Any]]:
        """Get personalized recommendations for a user"""
        try:
            # Get user profile and context
            user_profile = await self._get_user_profile(user_id)
            user_context = await self._get_user_context(user_id)
            
            # Determine recommendation strategy based on context
            strategy = self._select_recommendation_strategy(context, user_profile)
            
            # Generate recommendations
            recommendations = await self.recommendation_strategies[strategy](user_id, user_profile, user_context, context, limit)
            
            # Score and rank recommendations
            scored_recommendations = self._score_recommendations(recommendations, user_profile, context)
            
            # Return top N recommendations
            return scored_recommendations[:limit]
            
        except Exception as e:
            raise Exception(f"Failed to generate recommendations: {str(e)}")
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = "SELECT * FROM user_profiles WHERE user_id = %s"
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        'user_id': result['user_id'],
                        'browsing_history': json.loads(result['browsing_history']),
                        'location_data': json.loads(result['location_data']),
                        'conversation_preferences': json.loads(result['conversation_preferences'])
                    }
                return {
                    'user_id': user_id,
                    'browsing_history': [],
                    'location_data': {},
                    'conversation_preferences': {}
                }
                
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")
    
    async def _get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get user context"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                SELECT * FROM personalization_data 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT 20
                """
                cursor.execute(query, (user_id,))
                results = cursor.fetchall()
                
                return {
                    'recent_messages': [msg['message_content'] for msg in results],
                    'recent_conversations': list(set([msg['conversation_id'] for msg in results])),
                    'activity_count': len(results)
                }
                
        except Exception as e:
            raise Exception(f"Failed to get user context: {str(e)}")
    
    def _select_recommendation_strategy(self, context: Dict[str, Any], user_profile: Dict[str, Any]) -> str:
        """Select the best recommendation strategy based on context and user profile"""
        # New user - use trending recommendations
        if not user_profile['browsing_history'] and not user_profile['conversation_preferences']:
            return 'trending'
        
        # User in conversation - use context-aware recommendations
        if context.get('conversation_id'):
            return 'context_aware'
        
        # User has browsing history - use content-based recommendations
        if user_profile['browsing_history']:
            return 'content_based'
        
        # Use collaborative filtering for returning users
        return 'collaborative_filtering'
    
    async def _content_based_recommendation(self, user_id: str, user_profile: Dict[str, Any], user_context: Dict[str, Any], context: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Generate recommendations based on user's browsing history and preferences"""
        try:
            recommendations = []
            
            # Analyze browsing history for patterns
            browsing_history = user_profile['browsing_history']
            if browsing_history:
                # Extract interests from browsing history
                interests = self._extract_interests(browsing_history)
                
                # Find content matching interests (mock implementation)
                for interest in interests[:3]:  # Top 3 interests
                    content = self._find_content_by_interest(interest)
                    if content:
                        recommendations.append({
                            'id': f"content_{interest}",
                            'type': 'content',
                            'title': f"Related to {interest}",
                            'description': f"Content about {interest} based on your browsing history",
                            'relevance_score': 0.9,
                            'reason': 'Based on your browsing history'
                        })
            
            # Add conversation-based recommendations
            if user_context['recent_messages']:
                recent_topics = self._extract_topics(user_context['recent_messages'])
                for topic in recent_topics[:2]:
                    content = self._find_content_by_topic(topic)
                    if content:
                        recommendations.append({
                            'id': f"topic_{topic}",
                            'type': 'topic',
                            'title': f"Learn more about {topic}",
                            'description': f"Content related to your recent conversation about {topic}",
                            'relevance_score': 0.8,
                            'reason': 'Based on your recent conversations'
                        })
            
            return recommendations
            
        except Exception as e:
            raise Exception(f"Failed to generate content-based recommendations: {str(e)}")
    
    async def _collaborative_filtering_recommendation(self, user_id: str, user_profile: Dict[str, Any], user_context: Dict[str, Any], context: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Generate recommendations based on similar users' behavior"""
        try:
            recommendations = []
            
            # Find similar users (simplified implementation)
            similar_users = await self._find_similar_users(user_id)
            
            if similar_users:
                # Get content liked by similar users
                liked_content = self._get_content_liked_by_users(similar_users)
                
                # Recommend content that similar users liked but current user hasn't seen
                for content in liked_content[:limit]:
                    recommendations.append({
                        'id': f"similar_{content['id']}",
                        'type': 'content',
                        'title': f"Popular with users like you",
                        'description': content['description'],
                        'relevance_score': 0.7,
                        'reason': 'Users with similar interests liked this'
                    })
            
            return recommendations
            
        except Exception as e:
            raise Exception(f"Failed to generate collaborative filtering recommendations: {str(e)}")
    
    async def _trending_recommendation(self, user_id: str, user_profile: Dict[str, Any], user_context: Dict[str, Any], context: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Generate trending recommendations"""
        try:
            recommendations = []
            
            # Get trending content (mock implementation)
            trending_content = self._get_trending_content()
            
            for content in trending_content[:limit]:
                recommendations.append({
                    'id': f"trending_{content['id']}",
                    'type': 'content',
                    'title': content['title'],
                    'description': content['description'],
                    'relevance_score': 0.6,
                    'reason': 'Currently trending'
                })
            
            return recommendations
            
        except Exception as e:
            raise Exception(f"Failed to generate trending recommendations: {str(e)}")
    
    async def _context_aware_recommendation(self, user_id: str, user_profile: Dict[str, Any], user_context: Dict[str, Any], context: Dict[str, Any], limit: int) -> List[Dict[str, Any]]:
        """Generate recommendations based on current conversation context"""
        try:
                recommendations = []
                
                # Analyze current conversation
                current_message = context.get('message_content', '')
                conversation_topics = self._extract_topics([current_message])
                
                # Recommend content related to current conversation
                for topic in conversation_topics[:2]:
                    content = self._find_content_by_topic(topic)
                    if content:
                        recommendations.append({
                            'id': f"context_{topic}",
                            'type': 'content',
                            'title': f"Learn more about {topic}",
                            'description': f"Content related to your current conversation about {topic}",
                            'relevance_score': 0.95,
                            'reason': 'Based on your current conversation'
                        })
                
                # Add quick replies based on conversation context
                quick_replies = self._generate_quick_replies(current_message)
                for reply in quick_replies[:2]:
                    recommendations.append({
                        'id': f"quick_{reply['id']}",
                        'type': 'quick_reply',
                        'title': reply['text'],
                        'description': reply['description'],
                        'relevance_score': 0.8,
                        'reason': 'Quick reply suggestion'
                    })
                
                return recommendations
                
        except Exception as e:
            raise Exception(f"Failed to generate context-aware recommendations: {str(e)}")
    
    def _score_recommendations(self, recommendations: List[Dict[str, Any]], user_profile: Dict[str, Any], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Score and rank recommendations"""
        for rec in recommendations:
            # Base score from relevance
            score = rec['relevance_score']
            
            # Boost based on user preferences
            if user_profile['conversation_preferences']:
                pref_boost = self._calculate_preference_boost(rec, user_profile['conversation_preferences'])
                score += pref_boost
            
            # Boost based on time of day
            time_boost = self._calculate_time_boost(context)
            score += time_boost
            
            # Add some randomness to avoid always showing the same recommendations
            score += random.uniform(-0.1, 0.1)
            
            rec['final_score'] = max(0, min(1, score))
        
        # Sort by final score
        return sorted(recommendations, key=lambda x: x['final_score'], reverse=True)
    
    def _extract_interests(self, browsing_history: List[Dict[str, Any]]) -> List[str]:
        """Extract interests from browsing history"""
        interests = []
        for page in browsing_history:
            # Simple interest extraction (in production, use proper NLP)
            url = page.get('page_url', '').lower()
            if 'tech' in url:
                interests.append('technology')
            elif 'business' in url:
                interests.append('business')
            elif 'design' in url:
                interests.append('design')
            elif 'marketing' in url:
                interests.append('marketing')
        
        return list(set(interests))  # Remove duplicates
    
    def _extract_topics(self, messages: List[str]) -> List[str]:
        """Extract topics from messages"""
        topics = []
        topic_keywords = {
            'technical': ['code', 'bug', 'error', 'fix', 'technical', 'development'],
            'sales': ['price', 'cost', 'buy', 'purchase', 'sale', 'discount'],
            'support': ['help', 'support', 'issue', 'problem', 'broken'],
            'general': ['hello', 'hi', 'thanks', 'thank you', 'good']
        }
        
        for message in messages:
            message_lower = message.lower()
            for topic, keywords in topic_keywords.items():
                if any(keyword in message_lower for keyword in keywords):
                    topics.append(topic)
                    break
        
        return list(set(topics))
    
    def _find_content_by_interest(self, interest: str) -> Optional[Dict[str, Any]]:
        """Find content related to an interest (mock implementation)"""
        content_database = {
            'technology': {
                'id': 'tech_001',
                'title': 'Latest Technology Trends',
                'description': 'Stay updated with the latest technology trends and innovations'
            },
            'business': {
                'id': 'business_001',
                'title': 'Business Strategy Guide',
                'description': 'Learn effective business strategies and management techniques'
            },
            'design': {
                'id': 'design_001',
                'title': 'Design Principles',
                'description': 'Master the fundamentals of good design and user experience'
            },
            'marketing': {
                'id': 'marketing_001',
                'title': 'Digital Marketing Tips',
                'description': 'Essential tips for successful digital marketing campaigns'
            }
        }
        
        return content_database.get(interest)
    
    def _find_content_by_topic(self, topic: str) -> Optional[Dict[str, Any]]:
        """Find content related to a topic (mock implementation)"""
        return self._find_content_by_interest(topic)
    
    async def _find_similar_users(self, user_id: str) -> List[str]:
        """Find users with similar behavior (mock implementation)"""
        # In production, this would use sophisticated similarity algorithms
        return ['user_123', 'user_456', 'user_789']
    
    def _get_content_liked_by_users(self, user_ids: List[str]) -> List[Dict[str, Any]]:
        """Get content liked by similar users (mock implementation)"""
        return [
            {'id': 'content_001', 'description': 'Popular content item 1'},
            {'id': 'content_002', 'description': 'Popular content item 2'}
        ]
    
    def _get_trending_content(self) -> List[Dict[str, Any]]:
        """Get trending content (mock implementation)"""
        return [
            {'id': 'trend_001', 'title': 'Trending Topic 1', 'description': 'Currently popular topic 1'},
            {'id': 'trend_002', 'title': 'Trending Topic 2', 'description': 'Currently popular topic 2'}
        ]
    
    def _generate_quick_replies(self, message: str) -> List[Dict[str, Any]]:
        """Generate quick replies based on message context (mock implementation)"""
        return [
            {'id': 'qr_001', 'text': 'Can you help me with this?', 'description': 'Request assistance'},
            {'id': 'qr_002', 'text': 'Tell me more about this', 'description': 'Request more information'}
        ]
    
    def _calculate_preference_boost(self, recommendation: Dict[str, Any], preferences: Dict[str, Any]) -> float:
        """Calculate boost based on user preferences"""
        # Simple implementation - in production, use more sophisticated preference matching
        return 0.1  # Small boost for all recommendations
    
    def _calculate_time_boost(self, context: Dict[str, Any]) -> float:
        """Calculate boost based on time of day"""
        # Simple implementation - boost certain content at certain times
        return 0.05  # Small time-based boost