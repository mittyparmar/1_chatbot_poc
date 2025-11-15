import re
import spacy
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

class NLPProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.nlp = None
        self._load_spacy_model()
    
    def _load_spacy_model(self):
        """Load spaCy model for NLP processing"""
        try:
            self.nlp = spacy.load("en_core_web_sm")
            self.logger.info("spaCy model loaded successfully")
        except OSError:
            self.logger.warning("spaCy model not found. Installing...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
            self.logger.info("spaCy model downloaded and loaded successfully")
    
    async def process_text(self, text: str, user_id: Optional[str] = None, 
                          conversation_id: Optional[str] = None, 
                          context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process text using NLP techniques"""
        try:
            # Clean and preprocess text
            cleaned_text = self._clean_text(text)
            
            # Process with spaCy
            doc = self.nlp(cleaned_text)
            
            # Extract various NLP features
            tokens = self._extract_tokens(doc)
            entities = self._extract_entities(doc)
            pos_tags = self._extract_pos_tags(doc)
            dependencies = self._extract_dependencies(doc)
            lemmas = self._extract_lemmas(doc)
            
            # Calculate text statistics
            text_stats = self._calculate_text_stats(text)
            
            # Process context if provided
            processed_context = self._process_context(context) if context else {}
            
            result = {
                "processed_text": cleaned_text,
                "tokens": tokens,
                "entities": entities,
                "pos_tags": pos_tags,
                "dependencies": dependencies,
                "lemmas": lemmas,
                "text_stats": text_stats,
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "conversation_id": conversation_id,
                "context": processed_context
            }
            
            self.logger.info(f"Processed text for user {user_id}: {cleaned_text[:50]}...")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing text: {str(e)}")
            raise
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\'\"]', '', text)
        
        # Convert to lowercase
        text = text.lower()
        
        return text
    
    def _extract_tokens(self, doc) -> List[Dict[str, Any]]:
        """Extract tokens with features"""
        tokens = []
        for token in doc:
            token_info = {
                "text": token.text,
                "lemma": token.lemma_,
                "pos": token.pos_,
                "tag": token.tag_,
                "dep": token.dep_,
                "shape": token.shape_,
                "is_alpha": token.is_alpha,
                "is_stop": token.is_stop,
                "is_punct": token.is_punct,
                "like_num": token.like_num,
                "like_email": token.like_email,
                "like_url": token.like_url,
                "start": token.idx,
                "end": token.idx + len(token.text)
            }
            tokens.append(token_info)
        
        return tokens
    
    def _extract_entities(self, doc) -> List[Dict[str, Any]]:
        """Extract named entities"""
        entities = []
        for ent in doc.ents:
            entity_info = {
                "text": ent.text,
                "label": ent.label_,
                "start": ent.start_char,
                "end": ent.end_char,
                "description": spacy.explain(ent.label_)
            }
            entities.append(entity_info)
        
        return entities
    
    def _extract_pos_tags(self, doc) -> Dict[str, int]:
        """Extract part-of-speech tag counts"""
        pos_counts = {}
        for token in doc:
            pos = token.pos_
            pos_counts[pos] = pos_counts.get(pos, 0) + 1
        
        return pos_counts
    
    def _extract_dependencies(self, doc) -> Dict[str, int]:
        """Extract dependency relation counts"""
        dep_counts = {}
        for token in doc:
            dep = token.dep_
            dep_counts[dep] = dep_counts.get(dep, 0) + 1
        
        return dep_counts
    
    def _extract_lemmas(self, doc) -> List[str]:
        """Extract lemmas"""
        return [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]
    
    def _calculate_text_stats(self, text: str) -> Dict[str, Any]:
        """Calculate text statistics"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        return {
            "char_count": len(text),
            "word_count": len(words),
            "sentence_count": len([s for s in sentences if s.strip()]),
            "avg_word_length": sum(len(word) for word in words) / len(words) if words else 0,
            "avg_sentence_length": len(words) / len([s for s in sentences if s.strip()]) if sentences else 0,
            "reading_time": len(words) / 200  # Average reading speed: 200 words per minute
        }
    
    def _process_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process and enhance context"""
        processed = {}
        
        # Add timestamp
        processed["timestamp"] = datetime.utcnow().isoformat()
        
        # Extract relevant context information
        if "previous_messages" in context:
            processed["previous_messages_count"] = len(context["previous_messages"])
            processed["previous_messages_text"] = " ".join(
                msg.get("content", "") for msg in context["previous_messages"][-5:]
            )
        
        if "user_preferences" in context:
            processed["user_preferences"] = context["user_preferences"]
        
        if "conversation_topic" in context:
            processed["conversation_topic"] = context["conversation_topic"]
        
        if "user_location" in context:
            processed["user_location"] = context["user_location"]
        
        return processed
    
    async def extract_keywords(self, text: str, max_keywords: int = 10) -> List[Dict[str, Any]]:
        """Extract keywords from text"""
        try:
            doc = self.nlp(text)
            
            # Extract noun chunks and named entities as potential keywords
            keywords = []
            
            # Add noun chunks
            for chunk in doc.noun_chunks:
                keywords.append({
                    "text": chunk.text,
                    "type": "noun_chunk",
                    "score": len(chunk.text.split())
                })
            
            # Add named entities
            for ent in doc.ents:
                keywords.append({
                    "text": ent.text,
                    "type": ent.label_,
                    "score": 1.0
                })
            
            # Add important words (nouns, verbs, adjectives)
            for token in doc:
                if (token.pos_ in ["NOUN", "VERB", "ADJ"] and 
                    not token.is_stop and 
                    not token.is_punct and 
                    len(token.text) > 2):
                    keywords.append({
                        "text": token.text,
                        "type": "important_word",
                        "score": 1.0
                    })
            
            # Remove duplicates and sort by score
            unique_keywords = {}
            for kw in keywords:
                if kw["text"] not in unique_keywords:
                    unique_keywords[kw["text"]] = kw
                else:
                    unique_keywords[kw["text"]]["score"] += kw["score"]
            
            # Sort by score and return top keywords
            sorted_keywords = sorted(unique_keywords.values(), 
                                   key=lambda x: x["score"], 
                                   reverse=True)
            
            return sorted_keywords[:max_keywords]
            
        except Exception as e:
            self.logger.error(f"Error extracting keywords: {str(e)}")
            return []
    
    async def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect language of text"""
        try:
            # Simple language detection based on common words
            common_words = {
                "en": ["the", "and", "is", "in", "to", "of", "a", "that", "it", "with"],
                "es": ["el", "la", "de", "que", "y", "a", "en", "un", "es", "se"],
                "fr": ["le", "de", "et", "à", "un", "il", "être", "et", "en", "avoir"],
                "de": ["der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich"],
                "it": ["il", "e", "di", "che", "a", "del", "la", "in", "per", "con"]
            }
            
            text_lower = text.lower()
            scores = {}
            
            for lang, words in common_words.items():
                score = sum(1 for word in words if word in text_lower)
                scores[lang] = score
            
            detected_lang = max(scores, key=scores.get) if scores else "unknown"
            confidence = scores[detected_lang] / len(text.split()) if scores else 0
            
            return {
                "language": detected_lang,
                "confidence": confidence,
                "scores": scores
            }
            
        except Exception as e:
            self.logger.error(f"Error detecting language: {str(e)}")
            return {"language": "unknown", "confidence": 0, "scores": {}}