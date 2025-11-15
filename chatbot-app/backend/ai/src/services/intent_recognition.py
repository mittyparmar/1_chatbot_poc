import re
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from collections import defaultdict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
import os

class IntentRecognition:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.intent_classifier = None
        self.vectorizer = None
        self.intent_patterns = {}
        self._load_intent_patterns()
        self._load_or_train_classifier()
    
    def _load_intent_patterns(self):
        """Load intent patterns from configuration"""
        # Define common intent patterns
        self.intent_patterns = {
            "greeting": [
                r"hello", r"hi", r"hey", r"good morning", r"good afternoon", r"good evening",
                r"how are you", r"what's up", r"yo", r"hi there", r"hey there"
            ],
            "goodbye": [
                r"bye", r"goodbye", r"see you", r"later", r"take care", r"farewell",
                r"have a good day", r"see you later", r"bye bye", r"catch you later"
            ],
            "thanks": [
                r"thank", r"thanks", r"thank you", r"appreciate", r"grateful", r"thx",
                r"ty", r"thank you very much", r"thanks a lot", r"much appreciated"
            ],
            "help": [
                r"help", r"assist", r"support", r"what can you do", r"how do i",
                r"i need help", r"can you help", r"what should i do", r"how to"
            ],
            "information": [
                r"what is", r"what are", r"who is", r"who are", r"when is", r"when are",
                r"where is", r"where are", r"why is", r"why are", r"how does", r"how do",
                r"tell me about", r"explain", r"describe", r"information about"
            ],
            "booking": [
                r"book", r"reserve", r"schedule", r"appointment", r"meeting", r"order",
                r"make a", r"create a", r"set up", r"arrange", r"plan"
            ],
            "complaint": [
                r"complaint", r"problem", r"issue", r"broken", r"not working", r"error",
                r"bug", r"faulty", r"defective", r"wrong", r"incorrect", r"mistake"
            ],
            "feedback": [
                r"feedback", r"review", r"rate", r"comment", r"opinion", r"suggestion",
                r"what do you think", r"how was", r"experience", r"thoughts"
            ],
            "pricing": [
                r"price", r"cost", r"how much", r"how many", r"expensive", r"cheap",
                r"affordable", r"budget", r"free", r"discount", r"offer", r"deal"
            ],
            "availability": [
                r"available", r"in stock", r"when", r"what time", r"which day", r"open",
                r"closed", r"schedule", r"hours", r"working hours", r"business hours"
            ],
            "location": [
                r"where", r"address", r"location", r"directions", r"how to get", r"near",
                r"closest", r"find", r"locate", r"place", r"store", r"office"
            ],
            "contact": [
                r"contact", r"phone", r"email", r"call", r"reach", r"get in touch",
                r"support", r"customer service", r"help desk", r"hotline"
            ],
            "account": [
                r"account", r"login", r"register", r"sign in", r"sign up", r"password",
                r"forgot", r"reset", r"profile", r"settings", r"dashboard"
            ],
            "payment": [
                r"payment", r"pay", r"credit card", r"debit card", r"paypal", r"cash",
                r"bill", r"invoice", r"receipt", r"transaction", r"checkout"
            ],
            "shipping": [
                r"shipping", r"delivery", r"ship", r"send", r"tracking", r"order status",
                r"when will", r"how long", r"arrive", r"package", r"courier"
            ],
            "return": [
                r"return", r"refund", r"exchange", r"cancel", r"withdraw", r"money back",
                r"send back", r"get a refund", r"money back guarantee"
            ],
            "warranty": [
                r"warranty", r"guarantee", r"repair", r"service", r"maintenance", r"support",
                r"coverage", r"terms", r"conditions", r"policy"
            ],
            "technical": [
                r"technical", r"technical support", r"it", r"computer", r"software",
                r"hardware", r"installation", r"setup", r"configuration", r"troubleshoot"
            ],
            "general": [
                r"chat", r"talk", r"discuss", r"conversation", r"message", r"hi",
                r"hello", r"hey", r"yo", r"sup", r"what's up"
            ]
        }
    
    def _load_or_train_classifier(self):
        """Load existing classifier or train a new one"""
        model_path = "intent_classifier.pkl"
        
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    self.intent_classifier = pickle.load(f)
                self.logger.info("Loaded existing intent classifier")
            except Exception as e:
                self.logger.warning(f"Failed to load classifier: {e}. Training new one.")
                self._train_classifier()
        else:
            self.logger.info("No existing classifier found. Training new one.")
            self._train_classifier()
    
    def _train_classifier(self):
        """Train intent classifier with sample data"""
        try:
            # Sample training data
            training_data = [
                ("hello", "greeting"),
                ("hi there", "greeting"),
                ("good morning", "greeting"),
                ("how are you", "greeting"),
                ("bye", "goodbye"),
                ("see you later", "goodbye"),
                ("goodbye", "goodbye"),
                ("thank you", "thanks"),
                ("thanks a lot", "thanks"),
                ("appreciate it", "thanks"),
                ("help me", "help"),
                ("i need assistance", "help"),
                ("what can you do", "help"),
                ("what is your name", "information"),
                ("tell me about your services", "information"),
                ("how do i book", "booking"),
                ("i want to make an appointment", "booking"),
                ("schedule a meeting", "booking"),
                ("there's a problem", "complaint"),
                ("this is broken", "complaint"),
                ("i have an issue", "complaint"),
                ("give me feedback", "feedback"),
                ("how was my experience", "feedback"),
                ("rate this service", "feedback"),
                ("how much does it cost", "pricing"),
                ("what are the prices", "pricing"),
                ("is it expensive", "pricing"),
                ("when are you open", "availability"),
                ("what are your hours", "availability"),
                ("is it available", "availability"),
                ("where are you located", "location"),
                ("what's your address", "location"),
                ("how do i get there", "location"),
                ("contact me", "contact"),
                ("i need to call you", "contact"),
                ("what's your phone number", "contact"),
                ("i need to login", "account"),
                ("reset my password", "account"),
                ("update my profile", "account"),
                ("how do i pay", "payment"),
                ("what payment methods do you accept", "payment"),
                ("i want to pay", "payment"),
                ("when will it ship", "shipping"),
                ("track my order", "shipping"),
                ("what's the delivery time", "shipping"),
                ("i want to return this", "return"),
                ("get a refund", "return"),
                ("cancel my order", "return"),
                ("what's the warranty", "warranty"),
                ("does this have warranty", "warranty"),
                ("repair service", "warranty"),
                ("technical support", "technical"),
                ("i have a technical issue", "technical"),
                ("help with installation", "technical"),
                ("let's chat", "general"),
                ("talk to me", "general"),
                ("hi", "general"),
                ("hey", "general")
            ]
            
            texts, labels = zip(*training_data)
            
            # Create and train pipeline
            self.intent_classifier = Pipeline([
                ('tfidf', TfidfVectorizer(max_features=1000, ngram_range=(1, 2))),
                ('clf', MultinomialNB())
            ])
            
            self.intent_classifier.fit(texts, labels)
            
            # Save classifier
            with open("intent_classifier.pkl", 'wb') as f:
                pickle.dump(self.intent_classifier, f)
            
            self.logger.info("Intent classifier trained and saved successfully")
            
        except Exception as e:
            self.logger.error(f"Error training classifier: {e}")
            # Fallback to pattern matching if ML fails
            self.intent_classifier = None
    
    async def recognize(self, message: str, user_id: Optional[str] = None, 
                       conversation_id: Optional[str] = None, 
                       context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Recognize intent from message"""
        try:
            # Clean message
            cleaned_message = self._clean_message(message)
            
            # Use ML classifier if available
            if self.intent_classifier:
                intent_result = self._classify_with_ml(cleaned_message)
            else:
                # Fallback to pattern matching
                intent_result = self._classify_with_patterns(cleaned_message)
            
            # Enhance with context
            enhanced_result = self._enhance_with_context(intent_result, context)
            
            # Log the result
            self.logger.info(f"Recognized intent '{enhanced_result['intent']}' for user {user_id}")
            
            return enhanced_result
            
        except Exception as e:
            self.logger.error(f"Error recognizing intent: {e}")
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "entities": [],
                "metadata": {
                    "error": str(e),
                    "message": message,
                    "user_id": user_id,
                    "conversation_id": conversation_id
                }
            }
    
    def _clean_message(self, message: str) -> str:
        """Clean message for processing"""
        # Convert to lowercase
        message = message.lower()
        
        # Remove extra whitespace
        message = re.sub(r'\s+', ' ', message).strip()
        
        # Remove special characters but keep basic punctuation
        message = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\'\"]', '', message)
        
        return message
    
    def _classify_with_ml(self, message: str) -> Dict[str, Any]:
        """Classify intent using ML model"""
        try:
            # Predict intent
            intent = self.intent_classifier.predict([message])[0]
            confidence = max(self.intent_classifier.predict_proba([message])[0])
            
            # Get entities (simple extraction)
            entities = self._extract_entities(message)
            
            return {
                "intent": intent,
                "confidence": float(confidence),
                "entities": entities,
                "metadata": {
                    "method": "ml",
                    "model_type": "naive_bayes"
                }
            }
            
        except Exception as e:
            self.logger.error(f"ML classification failed: {e}")
            # Fallback to pattern matching
            return self._classify_with_patterns(message)
    
    def _classify_with_patterns(self, message: str) -> Dict[str, Any]:
        """Classify intent using pattern matching"""
        try:
            intent_scores = defaultdict(float)
            
            # Score each intent based on pattern matches
            for intent, patterns in self.intent_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, message):
                        intent_scores[intent] += 1.0
            
            if not intent_scores:
                return {
                    "intent": "unknown",
                    "confidence": 0.0,
                    "entities": [],
                    "metadata": {
                        "method": "pattern",
                        "matches": []
                    }
                }
            
            # Get best intent
            best_intent = max(intent_scores, key=intent_scores.get)
            confidence = intent_scores[best_intent] / len(message.split())  # Normalize by message length
            
            # Get entities
            entities = self._extract_entities(message)
            
            return {
                "intent": best_intent,
                "confidence": min(confidence, 1.0),  # Cap at 1.0
                "entities": entities,
                "metadata": {
                    "method": "pattern",
                    "matches": list(intent_scores.items())
                }
            }
            
        except Exception as e:
            self.logger.error(f"Pattern classification failed: {e}")
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "entities": [],
                "metadata": {
                    "error": str(e),
                    "method": "pattern"
                }
            }
    
    def _extract_entities(self, message: str) -> List[Dict[str, Any]]:
        """Extract entities from message"""
        entities = []
        
        # Extract dates
        date_pattern = r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b'
        dates = re.findall(date_pattern, message)
        for date in dates:
            entities.append({
                "type": "date",
                "value": date,
                "text": date
            })
        
        # Extract times
        time_pattern = r'\b\d{1,2}:\d{2}\s*(?:am|pm)?\b|\b\d{1,2}\s*(?:am|pm)\b'
        times = re.findall(time_pattern, message, re.IGNORECASE)
        for time in times:
            entities.append({
                "type": "time",
                "value": time,
                "text": time
            })
        
        # Extract numbers
        number_pattern = r'\b\d+(?:\.\d+)?\b'
        numbers = re.findall(number_pattern, message)
        for number in numbers:
            entities.append({
                "type": "number",
                "value": float(number) if '.' in number else int(number),
                "text": number
            })
        
        # Extract email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, message)
        for email in emails:
            entities.append({
                "type": "email",
                "value": email,
                "text": email
            })
        
        # Extract phone numbers
        phone_pattern = r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b'
        phones = re.findall(phone_pattern, message)
        for phone in phones:
            entities.append({
                "type": "phone",
                "value": phone,
                "text": phone
            })
        
        return entities
    
    def _enhance_with_context(self, intent_result: Dict[str, Any], 
                            context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Enhance intent recognition with context"""
        enhanced = intent_result.copy()
        
        if not context:
            return enhanced
        
        # Adjust confidence based on context
        if "previous_intents" in context:
            previous_intents = context["previous_intents"]
            if enhanced["intent"] in previous_intents:
                # Slightly boost confidence for repeated intents
                enhanced["confidence"] = min(enhanced["confidence"] * 1.1, 1.0)
        
        if "conversation_topic" in context:
            topic = context["conversation_topic"]
            # If intent matches conversation topic, boost confidence
            if enhanced["intent"] in topic:
                enhanced["confidence"] = min(enhanced["confidence"] * 1.05, 1.0)
        
        # Add context information to metadata
        enhanced["metadata"]["context_used"] = True
        enhanced["metadata"]["context_info"] = {
            "previous_intents": context.get("previous_intents", []),
            "conversation_topic": context.get("conversation_topic", ""),
            "user_preferences": context.get("user_preferences", {})
        }
        
        return enhanced
    
    async def get_intent_examples(self, intent: str) -> List[str]:
        """Get example phrases for a specific intent"""
        examples = []
        
        # Get examples from patterns
        if intent in self.intent_patterns:
            examples.extend(self.intent_patterns[intent][:3])  # Return first 3 patterns
        
        # Add some common variations
        variations = {
            "greeting": ["hello there", "hey", "hiya", "good day"],
            "goodbye": ["see ya", "bye bye", "take care", "later"],
            "thanks": ["thanks", "thx", "much appreciated", "grateful"],
            "help": ["i need help", "can you assist", "help me please"],
            "information": ["tell me about", "explain", "what is"],
            "booking": ["i want to book", "make a reservation", "schedule"],
            "complaint": ["there's an issue", "this doesn't work", "problem with"],
            "feedback": ["my opinion", "how was", "rate this"],
            "pricing": ["cost", "price", "how much", "expensive"],
            "availability": ["when is it available", "is it open", "hours"],
            "location": ["where is", "address", "how to get there"],
            "contact": ["get in touch", "phone number", "email"],
            "account": ["login", "sign in", "my account"],
            "payment": ["how to pay", "payment methods", "checkout"],
            "shipping": ["delivery time", "tracking", "when will it arrive"],
            "return": ["return policy", "refund", "exchange"],
            "warranty": ["warranty info", "repair service", "coverage"],
            "technical": ["technical issue", "help with", "support"],
            "general": ["chat", "talk", "discuss"]
        }
        
        if intent in variations:
            examples.extend(variations[intent])
        
        return list(set(examples))  # Remove duplicates
    
    async def get_all_intents(self) -> List[str]:
        """Get all available intents"""
        return list(self.intent_patterns.keys())