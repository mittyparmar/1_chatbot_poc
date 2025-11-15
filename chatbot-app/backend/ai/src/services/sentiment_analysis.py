import re
import logging
from typing import Dict, Any, Optional, List
from collections import defaultdict
import numpy as np
from textblob import TextBlob
import vaderSentiment
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import json
import os

class SentimentAnalysis:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.sentiment_lexicon = self._load_sentiment_lexicon()
        self.emotion_lexicon = self._load_emotion_lexicon()
    
    def _load_sentiment_lexicon(self) -> Dict[str, float]:
        """Load sentiment lexicon"""
        lexicon = {
            # Positive words
            "excellent": 1.0, "amazing": 1.0, "wonderful": 1.0, "fantastic": 1.0,
            "great": 0.9, "good": 0.7, "nice": 0.6, "happy": 0.8, "pleased": 0.7,
            "satisfied": 0.7, "love": 0.9, "like": 0.6, "enjoy": 0.7, "perfect": 0.9,
            "awesome": 0.9, "brilliant": 0.9, "outstanding": 0.9, "superb": 0.9,
            "magnificent": 0.9, "terrific": 0.8, "delighted": 0.8, "thrilled": 0.8,
            "ecstatic": 0.9, "elated": 0.8, "jubilant": 0.9, "overjoyed": 0.9,
            "grateful": 0.8, "thankful": 0.8, "appreciative": 0.7, "pleased": 0.7,
            "content": 0.6, "cheerful": 0.7, "merry": 0.7, "jovial": 0.7,
            "vivacious": 0.7, "buoyant": 0.7, "radiant": 0.8, "beaming": 0.8,
            "smiling": 0.6, "laughing": 0.7, "giggling": 0.7, "chuckling": 0.6,
            "positive": 0.7, "optimistic": 0.7, "hopeful": 0.6, "confident": 0.6,
            "proud": 0.7, "accomplished": 0.8, "successful": 0.8, "victorious": 0.8,
            "triumphant": 0.8, "winning": 0.7, "champion": 0.8, "best": 0.7,
            "better": 0.6, "improved": 0.6, "enhanced": 0.6, "upgraded": 0.6,
            "premium": 0.5, "high-quality": 0.6, "superior": 0.7, "exceptional": 0.8,
            "extraordinary": 0.8, "remarkable": 0.8, "notable": 0.6, "noteworthy": 0.6,
            "impressive": 0.7, "striking": 0.6, "stunning": 0.8, "breathtaking": 0.8,
            "beautiful": 0.7, "gorgeous": 0.8, "lovely": 0.7, "pretty": 0.6,
            "attractive": 0.6, "charming": 0.7, "elegant": 0.7, "graceful": 0.7,
            "refined": 0.6, "sophisticated": 0.6, "classy": 0.6, "stylish": 0.6,
            "trendy": 0.5, "modern": 0.5, "contemporary": 0.5, "current": 0.4,
            "fresh": 0.6, "new": 0.4, "innovative": 0.7, "creative": 0.7,
            "original": 0.6, "unique": 0.6, "special": 0.6, "rare": 0.5,
            "valuable": 0.7, "precious": 0.7, "treasured": 0.8, "cherished": 0.8,
            "dear": 0.6, "beloved": 0.8, "adored": 0.8, "worshipped": 0.8,
            "idolized": 0.7, "revered": 0.7, "respected": 0.6, "admired": 0.7,
            "esteemed": 0.7, "honored": 0.7, "distinguished": 0.7, "renowned": 0.7,
            "famous": 0.6, "celebrated": 0.7, "acclaimed": 0.7, "praised": 0.7,
            "commended": 0.6, "applauded": 0.7, "cheered": 0.7, "hailed": 0.7,
            "glorified": 0.7, "exalted": 0.7, "praised": 0.7, "extolled": 0.7,
            "lauded": 0.7, "commended": 0.6, "complimented": 0.6, "flattered": 0.5,
            
            # Negative words
            "terrible": -1.0, "awful": -1.0, "horrible": -1.0, "disgusting": -1.0,
            "bad": -0.7, "poor": -0.7, "unhappy": -0.8, "angry": -0.8, "upset": -0.7,
            "disappointed": -0.8, "frustrated": -0.8, "annoyed": -0.7, "irritated": -0.7,
            "mad": -0.7, "furious": -0.9, "enraged": -0.9, "livid": -0.9,
            "irate": -0.8, "incensed": -0.8, "infuriated": -0.9, "outraged": -0.8,
            "furious": -0.9, "irate": -0.8, "incensed": -0.8, "infuriated": -0.9,
            "outraged": -0.8, "resentful": -0.7, "bitter": -0.7, "hostile": -0.7,
            "aggressive": -0.7, "violent": -0.8, "fierce": -0.6, "savage": -0.7,
            "vicious": -0.8, "malicious": -0.8, "spiteful": -0.8, "vindictive": -0.8,
            "cruel": -0.9, "mean": -0.7, "nasty": -0.7, "evil": -0.9, "wicked": -0.8,
            "sinister": -0.8, "devilish": -0.8, "demonic": -0.9, "diabolical": -0.9,
            "hateful": -0.8, "detestable": -0.9, "abominable": -0.9, "repugnant": -0.9,
            "repulsive": -0.9, "offensive": -0.7, "disgusting": -1.0, "nauseating": -0.9,
            "sickening": -0.9, "revolting": -0.9, "appalling": -0.9, "shocking": -0.7,
            "outrageous": -0.7, "scandalous": -0.7, "shameful": -0.8, "dishonest": -0.7,
            "unethical": -0.7, "immoral": -0.8, "corrupt": -0.8, "crooked": -0.7,
            "fraudulent": -0.8, "deceptive": -0.7, "lying": -0.7, "dishonest": -0.7,
            "untrustworthy": -0.7, "unreliable": -0.6, "inconsistent": -0.6, "unstable": -0.7,
            "unpredictable": -0.6, "erratic": -0.7, "wild": -0.6, "crazy": -0.6,
            "insane": -0.7, "mad": -0.7, "lunatic": -0.8, "deranged": -0.8,
            "insane": -0.7, "crazy": -0.6, "mad": -0.7, "lunatic": -0.8,
            "deranged": -0.8, "disturbed": -0.7, "troubled": -0.6, "confused": -0.5,
            "disoriented": -0.6, "lost": -0.5, "helpless": -0.7, "powerless": -0.7,
            "hopeless": -0.8, "desperate": -0.8, "despairing": -0.8, "suicidal": -0.9,
            "depressed": -0.8, "gloomy": -0.7, "melancholy": -0.7, "sad": -0.7,
            "miserable": -0.8, "heartbroken": -0.9, "devastated": -0.9, "crushed": -0.8,
            "broken": -0.8, "shattered": -0.9, "destroyed": -0.8, "ruined": -0.8,
            "wrecked": -0.7, "damaged": -0.6, "harmed": -0.7, "injured": -0.7,
            "hurt": -0.7, "painful": -0.7, "ache": -0.6, "suffering": -0.8,
            "agony": -0.9, "torment": -0.9, "torture": -0.9, "misery": -0.8,
            "anguish": -0.8, "grief": -0.8, "sorrow": -0.8, "bereavement": -0.8,
            "mourning": -0.7, "lamenting": -0.7, "weeping": -0.7, "crying": -0.6,
            "sobbing": -0.7, "bawling": -0.7, "blubbering": -0.7, "wailing": -0.7,
            "whimpering": -0.6, "sniveling": -0.6, "snuffling": -0.5, "sniffling": -0.5,
            "negative": -0.7, "pessimistic": -0.7, "hopeless": -0.8, "discouraged": -0.7,
            "discouraging": -0.7, "discourtesy": -0.6, "discourteous": -0.6, "rude": -0.6,
            "impolite": -0.6, "inconsiderate": -0.7, "thoughtless": -0.6, "selfish": -0.7,
            "greedy": -0.7, "stingy": -0.6, "miserly": -0.7, "cheap": -0.5,
            "frugal": -0.3, "thrifty": -0.3, "economical": -0.3, "careful": -0.2,
            "cautious": -0.2, "prudent": -0.2, "wise": -0.1, "smart": -0.1,
            "intelligent": -0.1, "clever": -0.1, "bright": -0.1, "brilliant": -0.1,
            "genius": -0.1, "talented": -0.1, "skilled": -0.1, "expert": -0.1,
            "master": -0.1, "professional": -0.1, "specialist": -0.1, "authority": -0.1,
            "specialist": -0.1, "authority": -0.1, "expert": -0.1, "professional": -0.1,
            "master": -0.1, "skilled": -0.1, "talented": -0.1, "genius": -0.1,
            "brilliant": -0.1, "bright": -0.1, "clever": -0.1, "intelligent": -0.1,
            "smart": -0.1, "wise": -0.1, "prudent": -0.2, "cautious": -0.2,
            "careful": -0.2, "economical": -0.3, "thrifty": -0.3, "frugal": -0.3,
            "cheap": -0.5, "miserly": -0.7, "stingy": -0.6, "greedy": -0.7,
            "selfish": -0.7, "thoughtless": -0.6, "inconsiderate": -0.7, "rude": -0.6,
            "impolite": -0.6, "discourteous": -0.6, "discourtesy": -0.6, "discouraging": -0.7,
            "discouraged": -0.7, "hopeless": -0.8, "pessimistic": -0.7, "negative": -0.7
        }
        return lexicon
    
    def _load_emotion_lexicon(self) -> Dict[str, List[str]]:
        """Load emotion lexicon"""
        return {
            "joy": ["happy", "joy", "delight", "cheer", "glee", "elation", "excitement", "euphoria"],
            "sadness": ["sad", "sorrow", "grief", "melancholy", "depression", "despair", "misery"],
            "anger": ["angry", "rage", "fury", "irritation", "annoyance", "resentment", "hostility"],
            "fear": ["afraid", "scared", "terrified", "anxious", "worried", "nervous", "panic"],
            "surprise": ["surprised", "amazed", "astonished", "shocked", "stunned", "bewildered"],
            "disgust": ["disgusted", "revolted", "repulsed", "sickened", "nauseated", "appalled"],
            "trust": ["trust", "faith", "confidence", "reliance", "belief", "assurance"],
            "anticipation": ["anticipate", "expect", "predict", "foresee", "await", "look forward"],
            "love": ["love", "affection", "adoration", "devotion", "passion", "romance"],
            "guilt": ["guilty", "remorse", "regret", "shame", "contrition", "penitence"],
            "shame": ["ashamed", "embarrassed", "humiliated", "mortified", "chagrined"],
            "pride": ["proud", "dignified", "honored", "esteemed", "respected", "admired"]
        }
    
    async def analyze(self, message: str, user_id: Optional[str] = None, 
                     conversation_id: Optional[str] = None, 
                     context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze sentiment of message"""
        try:
            # Clean message
            cleaned_message = self._clean_message(message)
            
            # Perform sentiment analysis using multiple methods
            vader_result = self._analyze_with_vader(cleaned_message)
            textblob_result = self._analyze_with_textblob(cleaned_message)
            lexicon_result = self._analyze_with_lexicon(cleaned_message)
            emotion_result = self._analyze_emotions(cleaned_message)
            
            # Combine results
            combined_result = self._combine_sentiment_results(
                vader_result, textblob_result, lexicon_result
            )
            
            # Add emotion analysis
            combined_result["emotions"] = emotion_result
            
            # Enhance with context
            enhanced_result = self._enhance_with_context(combined_result, context)
            
            # Log the result
            self.logger.info(f"Analyzed sentiment '{enhanced_result['sentiment']}' for user {user_id}")
            
            return enhanced_result
            
        except Exception as e:
            self.logger.error(f"Error analyzing sentiment: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "emotions": {},
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
    
    def _analyze_with_vader(self, message: str) -> Dict[str, Any]:
        """Analyze sentiment using VADER"""
        try:
            scores = self.vader_analyzer.polarity_scores(message)
            
            # Determine sentiment based on compound score
            compound = scores['compound']
            if compound >= 0.05:
                sentiment = 'positive'
            elif compound <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                "sentiment": sentiment,
                "confidence": abs(compound),
                "scores": {
                    "positive": scores['pos'],
                    "negative": scores['neg'],
                    "neutral": scores['neu'],
                    "compound": compound
                },
                "method": "vader"
            }
            
        except Exception as e:
            self.logger.error(f"VADER analysis failed: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "method": "vader"
            }
    
    def _analyze_with_textblob(self, message: str) -> Dict[str, Any]:
        """Analyze sentiment using TextBlob"""
        try:
            blob = TextBlob(message)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            
            # Determine sentiment based on polarity
            if polarity > 0.1:
                sentiment = 'positive'
            elif polarity < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                "sentiment": sentiment,
                "confidence": abs(polarity),
                "scores": {
                    "positive": max(0, polarity),
                    "negative": max(0, -polarity),
                    "neutral": 1 - abs(polarity),
                    "polarity": polarity,
                    "subjectivity": subjectivity
                },
                "method": "textblob"
            }
            
        except Exception as e:
            self.logger.error(f"TextBlob analysis failed: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "method": "textblob"
            }
    
    def _analyze_with_lexicon(self, message: str) -> Dict[str, Any]:
        """Analyze sentiment using custom lexicon"""
        try:
            words = message.split()
            sentiment_score = 0.0
            word_count = 0
            
            for word in words:
                if word in self.sentiment_lexicon:
                    sentiment_score += self.sentiment_lexicon[word]
                    word_count += 1
            
            if word_count == 0:
                return {
                    "sentiment": "neutral",
                    "confidence": 0.0,
                    "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                    "method": "lexicon"
                }
            
            # Normalize score
            normalized_score = sentiment_score / word_count
            
            # Determine sentiment
            if normalized_score > 0.1:
                sentiment = 'positive'
            elif normalized_score < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            return {
                "sentiment": sentiment,
                "confidence": abs(normalized_score),
                "scores": {
                    "positive": max(0, normalized_score),
                    "negative": max(0, -normalized_score),
                    "neutral": 1 - abs(normalized_score),
                    "raw_score": sentiment_score,
                    "word_count": word_count
                },
                "method": "lexicon"
            }
            
        except Exception as e:
            self.logger.error(f"Lexicon analysis failed: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "method": "lexicon"
            }
    
    def _analyze_emotions(self, message: str) -> Dict[str, Any]:
        """Analyze emotions in message"""
        try:
            emotions = {}
            words = message.split()
            
            for emotion, keywords in self.emotion_lexicon.items():
                emotion_score = 0
                for keyword in keywords:
                    if keyword in message:
                        emotion_score += 1
                
                if emotion_score > 0:
                    emotions[emotion] = {
                        "score": emotion_score,
                        "keywords": [kw for kw in keywords if kw in message]
                    }
            
            # Normalize scores
            if emotions:
                max_score = max(emotions.values(), key=lambda x: x['score'])['score']
                for emotion in emotions:
                    emotions[emotion]['normalized_score'] = emotions[emotion]['score'] / max_score
                    emotions[emotion]['confidence'] = emotions[emotion]['normalized_score']
            else:
                emotions = {"neutral": {"score": 1, "keywords": [], "normalized_score": 1.0, "confidence": 1.0}}
            
            return emotions
            
        except Exception as e:
            self.logger.error(f"Emotion analysis failed: {e}")
            return {"neutral": {"score": 1, "keywords": [], "normalized_score": 1.0, "confidence": 1.0}}
    
    def _combine_sentiment_results(self, vader_result: Dict[str, Any], 
                                 textblob_result: Dict[str, Any], 
                                 lexicon_result: Dict[str, Any]) -> Dict[str, Any]:
        """Combine sentiment analysis results from multiple methods"""
        try:
            # Count votes for each sentiment
            votes = {"positive": 0, "negative": 0, "neutral": 0}
            
            for result in [vader_result, textblob_result, lexicon_result]:
                votes[result["sentiment"]] += 1
            
            # Determine final sentiment (majority vote)
            final_sentiment = max(votes, key=votes.get)
            
            # Calculate combined confidence
            confidences = []
            for result in [vader_result, textblob_result, lexicon_result]:
                if result["sentiment"] == final_sentiment:
                    confidences.append(result["confidence"])
            
            combined_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            # Combine scores
            combined_scores = {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
            for result in [vader_result, textblob_result, lexicon_result]:
                for sentiment in combined_scores:
                    combined_scores[sentiment] += result["scores"].get(sentiment, 0.0)
            
            # Normalize combined scores
            total_score = sum(combined_scores.values())
            if total_score > 0:
                for sentiment in combined_scores:
                    combined_scores[sentiment] /= total_score
            
            return {
                "sentiment": final_sentiment,
                "confidence": combined_confidence,
                "scores": combined_scores,
                "methods": {
                    "vader": vader_result,
                    "textblob": textblob_result,
                    "lexicon": lexicon_result
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error combining sentiment results: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "scores": {"positive": 0.0, "negative": 0.0, "neutral": 1.0},
                "methods": {}
            }
    
    def _enhance_with_context(self, sentiment_result: Dict[str, Any], 
                            context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Enhance sentiment analysis with context"""
        enhanced = sentiment_result.copy()
        
        if not context:
            return enhanced
        
        # Adjust confidence based on context
        if "previous_sentiments" in context:
            previous_sentiments = context["previous_sentiments"]
            if enhanced["sentiment"] in previous_sentiments:
                # Slightly boost confidence for repeated sentiments
                enhanced["confidence"] = min(enhanced["confidence"] * 1.1, 1.0)
        
        if "conversation_topic" in context:
            topic = context["conversation_topic"]
            # If sentiment matches conversation topic expectations, boost confidence
            if enhanced["sentiment"] in topic.get("expected_sentiments", []):
                enhanced["confidence"] = min(enhanced["confidence"] * 1.05, 1.0)
        
        # Add context information to metadata
        enhanced["metadata"] = enhanced.get("metadata", {})
        enhanced["metadata"]["context_used"] = True
        enhanced["metadata"]["context_info"] = {
            "previous_sentiments": context.get("previous_sentiments", []),
            "conversation_topic": context.get("conversation_topic", {}),
            "user_preferences": context.get("user_preferences", {})
        }
        
        return enhanced
    
    async def get_sentiment_examples(self, sentiment: str) -> List[str]:
        """Get example phrases for a specific sentiment"""
        examples = {
            "positive": [
                "I love this product!",
                "This is amazing!",
                "Excellent service!",
                "I'm very happy with this.",
                "Great job everyone!",
                "This exceeded my expectations.",
                "I'm delighted with the results.",
                "Fantastic work!",
                "I'm really pleased.",
                "This is wonderful!"
            ],
            "negative": [
                "I hate this product.",
                "This is terrible.",
                "Awful experience.",
                "I'm very disappointed.",
                "Poor quality service.",
                "This is not what I expected.",
                "I'm frustrated with this.",
                "Horrible customer service.",
                "This is unacceptable.",
                "I'm really upset."
            ],
            "neutral": [
                "I need help with this.",
                "Can you assist me?",
                "I have a question.",
                "Tell me more about this.",
                "How does this work?",
                "I'm looking for information.",
                "Can you explain this?",
                "I need some clarification.",
                "What are the options?",
                "I'm considering this."
            ]
        }
        
        return examples.get(sentiment, [])
    
    async def get_emotion_examples(self, emotion: str) -> List[str]:
        """Get example phrases for a specific emotion"""
        examples = {
            "joy": ["I'm so happy!", "This brings me joy!", "I'm delighted!"],
            "sadness": ["I'm feeling sad.", "This makes me unhappy.", "I'm disappointed."],
            "anger": ["I'm angry about this.", "This makes me furious.", "I'm outraged!"],
            "fear": ["I'm scared.", "This makes me anxious.", "I'm worried about this."],
            "surprise": ["Wow! I'm surprised!", "That's amazing!", "I can't believe it!"],
            "disgust": ["This is disgusting.", "I'm revolted by this.", "That's awful!"],
            "trust": ["I trust you completely.", "You can rely on me.", "I have faith in this."],
            "anticipation": ["I'm looking forward to this.", "I can't wait!", "This will be great!"],
            "love": ["I love this!", "You're the best!", "I adore this product."],
            "guilt": ["I feel guilty about this.", "I'm sorry for what I did.", "I regret this."],
            "shame": ["I'm so ashamed.", "This is embarrassing.", "I feel humiliated."],
            "pride": ["I'm so proud!", "This is my best work.", "I achieved this!"]
        }
        
        return examples.get(emotion, [])