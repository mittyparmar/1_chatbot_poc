import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

class UserProfileService:
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
    
    async def create_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user profile"""
        try:
            profile_id = str(uuid.uuid4())
            user_id = profile_data['user_id']
            browsing_history = profile_data.get('browsing_history', [])
            location_data = profile_data.get('location_data', {})
            conversation_preferences = profile_data.get('conversation_preferences', {})
            last_updated = datetime.now().isoformat()
            
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO user_profiles 
                (id, user_id, browsing_history, location_data, conversation_preferences, last_updated)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING *
                """
                cursor.execute(query, (
                    profile_id,
                    user_id,
                    json.dumps(browsing_history),
                    json.dumps(location_data),
                    json.dumps(conversation_preferences),
                    last_updated
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                return {
                    'id': result[0],
                    'user_id': result[1],
                    'browsing_history': json.loads(result[2]),
                    'location_data': json.loads(result[3]),
                    'conversation_preferences': json.loads(result[4]),
                    'last_updated': result[5]
                }
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to create user profile: {str(e)}")
    
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by user ID"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = "SELECT * FROM user_profiles WHERE user_id = %s"
                cursor.execute(query, (user_id,))
                result = cursor.fetchone()
                
                if result:
                    return {
                        'id': result['id'],
                        'user_id': result['user_id'],
                        'browsing_history': json.loads(result['browsing_history']),
                        'location_data': json.loads(result['location_data']),
                        'conversation_preferences': json.loads(result['conversation_preferences']),
                        'last_updated': result['last_updated']
                    }
                return None
                
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")
    
    async def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            browsing_history = profile_data.get('browsing_history', [])
            location_data = profile_data.get('location_data', {})
            conversation_preferences = profile_data.get('conversation_preferences', {})
            last_updated = datetime.now().isoformat()
            
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                query = """
                UPDATE user_profiles 
                SET browsing_history = %s, 
                    location_data = %s, 
                    conversation_preferences = %s,
                    last_updated = %s
                WHERE user_id = %s
                RETURNING *
                """
                cursor.execute(query, (
                    json.dumps(browsing_history),
                    json.dumps(location_data),
                    json.dumps(conversation_preferences),
                    last_updated,
                    user_id
                ))
                
                result = cursor.fetchone()
                self.connection.commit()
                
                if not result:
                    raise Exception("User profile not found")
                
                return {
                    'id': result['id'],
                    'user_id': result['user_id'],
                    'browsing_history': json.loads(result['browsing_history']),
                    'location_data': json.loads(result['location_data']),
                    'conversation_preferences': json.loads(result['conversation_preferences']),
                    'last_updated': result['last_updated']
                }
                
        except Exception as e:
            self.connection.rollback()
            raise Exception(f"Failed to update user profile: {str(e)}")
    
    async def add_browsing_history(self, user_id: str, page_data: Dict[str, Any]) -> bool:
        """Add page visit to browsing history"""
        try:
            profile = await self.get_profile(user_id)
            if not profile:
                profile = await self.create_profile({
                    'user_id': user_id,
                    'browsing_history': [],
                    'location_data': {},
                    'conversation_preferences': {}
                })
            
            browsing_history = profile['browsing_history']
            browsing_history.append({
                'timestamp': datetime.now().isoformat(),
                'page_url': page_data.get('url', ''),
                'page_title': page_data.get('title', ''),
                'referral': page_data.get('referral', ''),
                'device_info': page_data.get('device', {})
            })
            
            # Keep only last 100 entries
            if len(browsing_history) > 100:
                browsing_history = browsing_history[-100:]
            
            await self.update_profile(user_id, {'browsing_history': browsing_history})
            return True
            
        except Exception as e:
            raise Exception(f"Failed to add browsing history: {str(e)}")
    
    async def update_conversation_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update conversation preferences"""
        try:
            profile = await self.get_profile(user_id)
            if not profile:
                raise Exception("User profile not found")
            
            current_preferences = profile['conversation_preferences']
            current_preferences.update(preferences)
            
            await self.update_profile(user_id, {'conversation_preferences': current_preferences})
            return True
            
        except Exception as e:
            raise Exception(f"Failed to update conversation preferences: {str(e)}")