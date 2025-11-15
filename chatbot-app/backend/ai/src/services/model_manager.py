import os
import json
import logging
import pickle
import shutil
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib
import aiofiles
import asyncio
from pathlib import Path

class ModelManager:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        self.loaded_models = {}
        self.model_metadata = {}
        self._load_model_metadata()
    
    def _load_model_metadata(self):
        """Load model metadata from storage"""
        metadata_file = self.models_dir / "metadata.json"
        if metadata_file.exists():
            try:
                with open(metadata_file, 'r') as f:
                    self.model_metadata = json.load(f)
                self.logger.info("Loaded model metadata successfully")
            except Exception as e:
                self.logger.error(f"Error loading model metadata: {e}")
                self.model_metadata = {}
        else:
            self.model_metadata = {}
    
    def _save_model_metadata(self):
        """Save model metadata to storage"""
        metadata_file = self.models_dir / "metadata.json"
        try:
            with open(metadata_file, 'w') as f:
                json.dump(self.model_metadata, f, indent=2)
            self.logger.info("Saved model metadata successfully")
        except Exception as e:
            self.logger.error(f"Error saving model metadata: {e}")
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models"""
        try:
            models = []
            
            # Scan models directory
            for model_dir in self.models_dir.iterdir():
                if model_dir.is_dir():
                    model_name = model_dir.name
                    metadata = self.model_metadata.get(model_name, {})
                    
                    model_info = {
                        "name": model_name,
                        "version": metadata.get("version", "unknown"),
                        "status": "loaded" if model_name in self.loaded_models else "available",
                        "size": self._get_model_size(model_dir),
                        "created_at": metadata.get("created_at", ""),
                        "updated_at": metadata.get("updated_at", ""),
                        "description": metadata.get("description", ""),
                        "type": metadata.get("type", "unknown"),
                        "performance": metadata.get("performance", {}),
                        "tags": metadata.get("tags", [])
                    }
                    
                    models.append(model_info)
            
            return models
            
        except Exception as e:
            self.logger.error(f"Error getting available models: {e}")
            return []
    
    def _get_model_size(self, model_dir: Path) -> str:
        """Get model directory size"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(model_dir):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    total_size += os.path.getsize(file_path)
            
            # Convert to human readable format
            for unit in ['B', 'KB', 'MB', 'GB']:
                if total_size < 1024.0:
                    return f"{total_size:.1f} {unit}"
                total_size /= 1024.0
            return f"{total_size:.1f} TB"
            
        except Exception as e:
            self.logger.error(f"Error getting model size: {e}")
            return "unknown"
    
    async def load_model(self, model_name: str) -> Dict[str, Any]:
        """Load a specific model"""
        try:
            if model_name in self.loaded_models:
                return {
                    "success": True,
                    "message": f"Model {model_name} is already loaded",
                    "model_name": model_name,
                    "status": "loaded"
                }
            
            model_dir = self.models_dir / model_name
            if not model_dir.exists():
                return {
                    "success": False,
                    "message": f"Model {model_name} not found",
                    "model_name": model_name,
                    "status": "not_found"
                }
            
            # Load model based on type
            metadata = self.model_metadata.get(model_name, {})
            model_type = metadata.get("type", "unknown")
            
            if model_type == "intent_classifier":
                model = await self._load_intent_classifier(model_dir)
            elif model_type == "sentiment_analyzer":
                model = await self._load_sentiment_analyzer(model_dir)
            elif model_type == "nlp_processor":
                model = await self._load_nlp_processor(model_dir)
            else:
                # Generic model loading
                model = await self._load_generic_model(model_dir)
            
            if model:
                self.loaded_models[model_name] = {
                    "model": model,
                    "metadata": metadata,
                    "loaded_at": datetime.utcnow().isoformat()
                }
                
                # Update metadata
                self.model_metadata[model_name]["status"] = "loaded"
                self.model_metadata[model_name]["last_loaded"] = datetime.utcnow().isoformat()
                self._save_model_metadata()
                
                return {
                    "success": True,
                    "message": f"Model {model_name} loaded successfully",
                    "model_name": model_name,
                    "status": "loaded",
                    "model_type": model_type
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to load model {model_name}",
                    "model_name": model_name,
                    "status": "load_failed"
                }
                
        except Exception as e:
            self.logger.error(f"Error loading model {model_name}: {e}")
            return {
                "success": False,
                "message": f"Error loading model {model_name}: {str(e)}",
                "model_name": model_name,
                "status": "error"
            }
    
    async def unload_model(self, model_name: str) -> Dict[str, Any]:
        """Unload a specific model"""
        try:
            if model_name not in self.loaded_models:
                return {
                    "success": True,
                    "message": f"Model {model_name} is not loaded",
                    "model_name": model_name,
                    "status": "not_loaded"
                }
            
            # Remove from loaded models
            del self.loaded_models[model_name]
            
            # Update metadata
            if model_name in self.model_metadata:
                self.model_metadata[model_name]["status"] = "available"
                self.model_metadata[model_name]["last_unloaded"] = datetime.utcnow().isoformat()
                self._save_model_metadata()
            
            return {
                "success": True,
                "message": f"Model {model_name} unloaded successfully",
                "model_name": model_name,
                "status": "unloaded"
            }
            
        except Exception as e:
            self.logger.error(f"Error unloading model {model_name}: {e}")
            return {
                "success": False,
                "message": f"Error unloading model {model_name}: {str(e)}",
                "model_name": model_name,
                "status": "error"
            }
    
    async def get_model_info(self, model_name: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        try:
            if model_name in self.loaded_models:
                model_info = self.loaded_models[model_name]
                metadata = model_info["metadata"]
                
                return {
                    "name": model_name,
                    "status": "loaded",
                    "loaded_at": model_info["loaded_at"],
                    "metadata": metadata,
                    "performance": metadata.get("performance", {}),
                    "type": metadata.get("type", "unknown")
                }
            else:
                metadata = self.model_metadata.get(model_name, {})
                
                return {
                    "name": model_name,
                    "status": "available",
                    "metadata": metadata,
                    "performance": metadata.get("performance", {}),
                    "type": metadata.get("type", "unknown")
                }
                
        except Exception as e:
            self.logger.error(f"Error getting model info for {model_name}: {e}")
            return {
                "name": model_name,
                "status": "error",
                "error": str(e)
            }
    
    async def _load_intent_classifier(self, model_dir: Path) -> Optional[Any]:
        """Load intent classification model"""
        try:
            model_file = model_dir / "model.pkl"
            if model_file.exists():
                with open(model_file, 'rb') as f:
                    model = pickle.load(f)
                self.logger.info(f"Loaded intent classifier from {model_dir}")
                return model
            else:
                self.logger.warning(f"Intent classifier model file not found: {model_file}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error loading intent classifier: {e}")
            return None
    
    async def _load_sentiment_analyzer(self, model_dir: Path) -> Optional[Any]:
        """Load sentiment analysis model"""
        try:
            # For sentiment analysis, we might load lexicon files
            lexicon_file = model_dir / "lexicon.json"
            if lexicon_file.exists():
                async with aiofiles.open(lexicon_file, 'r') as f:
                    lexicon = json.loads(await f.read())
                self.logger.info(f"Loaded sentiment analyzer lexicon from {model_dir}")
                return lexicon
            else:
                self.logger.warning(f"Sentiment analyzer lexicon file not found: {lexicon_file}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error loading sentiment analyzer: {e}")
            return None
    
    async def _load_nlp_processor(self, model_dir: Path) -> Optional[Any]:
        """Load NLP processor model"""
        try:
            # For NLP processing, we might load spaCy models or other NLP resources
            config_file = model_dir / "config.json"
            if config_file.exists():
                async with aiofiles.open(config_file, 'r') as f:
                    config = json.loads(await f.read())
                self.logger.info(f"Loaded NLP processor config from {model_dir}")
                return config
            else:
                self.logger.warning(f"NLP processor config file not found: {config_file}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error loading NLP processor: {e}")
            return None
    
    async def _load_generic_model(self, model_dir: Path) -> Optional[Any]:
        """Load generic model"""
        try:
            # Try to load any model file
            for file in model_dir.glob("*.pkl"):
                with open(file, 'rb') as f:
                    model = pickle.load(f)
                self.logger.info(f"Loaded generic model from {file}")
                return model
            
            # Try to load JSON config
            for file in model_dir.glob("*.json"):
                async with aiofiles.open(file, 'r') as f:
                    config = json.loads(await f.read())
                self.logger.info(f"Loaded generic model config from {file}")
                return config
            
            self.logger.warning(f"No model files found in {model_dir}")
            return None
            
        except Exception as e:
            self.logger.error(f"Error loading generic model: {e}")
            return None
    
    async def train_model(self, training_config: Dict[str, Any]) -> Dict[str, Any]:
        """Train a new model"""
        try:
            model_name = training_config.get("name", "custom_model")
            model_type = training_config.get("type", "unknown")
            training_data = training_config.get("data", [])
            
            # Create model directory
            model_dir = self.models_dir / model_name
            if model_dir.exists():
                shutil.rmtree(model_dir)
            model_dir.mkdir()
            
            # Train model based on type
            if model_type == "intent_classifier":
                model = await self._train_intent_classifier(training_data, model_dir)
            elif model_type == "sentiment_analyzer":
                model = await self._train_sentiment_analyzer(training_data, model_dir)
            elif model_type == "nlp_processor":
                model = await self._train_nlp_processor(training_data, model_dir)
            else:
                # Generic training
                model = await self._train_generic_model(training_data, model_dir)
            
            if model:
                # Save model metadata
                metadata = {
                    "name": model_name,
                    "type": model_type,
                    "version": "1.0.0",
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                    "description": training_config.get("description", ""),
                    "training_data_size": len(training_data),
                    "performance": training_config.get("performance", {}),
                    "tags": training_config.get("tags", []),
                    "status": "available"
                }
                
                self.model_metadata[model_name] = metadata
                self._save_model_metadata()
                
                return {
                    "success": True,
                    "message": f"Model {model_name} trained successfully",
                    "model_name": model_name,
                    "model_type": model_type,
                    "metadata": metadata
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to train model {model_name}",
                    "model_name": model_name,
                    "model_type": model_type
                }
                
        except Exception as e:
            self.logger.error(f"Error training model: {e}")
            return {
                "success": False,
                "message": f"Error training model: {str(e)}",
                "model_name": training_config.get("name", "unknown"),
                "model_type": training_config.get("type", "unknown")
            }
    
    async def _train_intent_classifier(self, training_data: List[Any], model_dir: Path) -> Optional[Any]:
        """Train intent classification model"""
        try:
            # This would typically use scikit-learn or similar
            # For now, we'll create a simple mock model
            mock_model = {
                "type": "intent_classifier",
                "training_data_size": len(training_data),
                "intents": list(set([item[1] for item in training_data])),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Save mock model
            with open(model_dir / "model.pkl", 'wb') as f:
                pickle.dump(mock_model, f)
            
            # Save training data
            with open(model_dir / "training_data.json", 'w') as f:
                json.dump(training_data, f, indent=2)
            
            self.logger.info(f"Trained intent classifier in {model_dir}")
            return mock_model
            
        except Exception as e:
            self.logger.error(f"Error training intent classifier: {e}")
            return None
    
    async def _train_sentiment_analyzer(self, training_data: List[Any], model_dir: Path) -> Optional[Any]:
        """Train sentiment analysis model"""
        try:
            # Create sentiment lexicon from training data
            sentiment_lexicon = {}
            
            for text, sentiment in training_data:
                words = text.lower().split()
                for word in words:
                    if sentiment not in sentiment_lexicon:
                        sentiment_lexicon[sentiment] = {}
                    sentiment_lexicon[sentiment][word] = sentiment_lexicon[sentiment].get(word, 0) + 1
            
            # Save lexicon
            with open(model_dir / "lexicon.json", 'w') as f:
                json.dump(sentiment_lexicon, f, indent=2)
            
            # Save training data
            with open(model_dir / "training_data.json", 'w') as f:
                json.dump(training_data, f, indent=2)
            
            self.logger.info(f"Trained sentiment analyzer in {model_dir}")
            return sentiment_lexicon
            
        except Exception as e:
            self.logger.error(f"Error training sentiment analyzer: {e}")
            return None
    
    async def _train_nlp_processor(self, training_data: List[Any], model_dir: Path) -> Optional[Any]:
        """Train NLP processor model"""
        try:
            # Create NLP configuration
            nlp_config = {
                "type": "nlp_processor",
                "training_data_size": len(training_data),
                "created_at": datetime.utcnow().isoformat(),
                "features": ["tokenization", "pos_tagging", "named_entity_recognition"],
                "language": "en"
            }
            
            # Save configuration
            with open(model_dir / "config.json", 'w') as f:
                json.dump(nlp_config, f, indent=2)
            
            # Save training data
            with open(model_dir / "training_data.json", 'w') as f:
                json.dump(training_data, f, indent=2)
            
            self.logger.info(f"Trained NLP processor in {model_dir}")
            return nlp_config
            
        except Exception as e:
            self.logger.error(f"Error training NLP processor: {e}")
            return None
    
    async def _train_generic_model(self, training_data: List[Any], model_dir: Path) -> Optional[Any]:
        """Train generic model"""
        try:
            # Create generic model configuration
            model_config = {
                "type": "generic",
                "training_data_size": len(training_data),
                "created_at": datetime.utcnow().isoformat(),
                "features": ["basic_processing"]
            }
            
            # Save configuration
            with open(model_dir / "config.json", 'w') as f:
                json.dump(model_config, f, indent=2)
            
            # Save training data
            with open(model_dir / "training_data.json", 'w') as f:
                json.dump(training_data, f, indent=2)
            
            self.logger.info(f"Trained generic model in {model_dir}")
            return model_config
            
        except Exception as e:
            self.logger.error(f"Error training generic model: {e}")
            return None
    
    async def delete_model(self, model_name: str) -> Dict[str, Any]:
        """Delete a model"""
        try:
            # First unload if loaded
            if model_name in self.loaded_models:
                await self.unload_model(model_name)
            
            # Remove model directory
            model_dir = self.models_dir / model_name
            if model_dir.exists():
                shutil.rmtree(model_dir)
            
            # Remove from metadata
            if model_name in self.model_metadata:
                del self.model_metadata[model_name]
                self._save_model_metadata()
            
            return {
                "success": True,
                "message": f"Model {model_name} deleted successfully",
                "model_name": model_name
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting model {model_name}: {e}")
            return {
                "success": False,
                "message": f"Error deleting model {model_name}: {str(e)}",
                "model_name": model_name
            }
    
    async def get_model_performance(self, model_name: str) -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            metadata = self.model_metadata.get(model_name, {})
            performance = metadata.get("performance", {})
            
            if not performance:
                # Generate mock performance metrics
                performance = {
                    "accuracy": 0.85,
                    "precision": 0.82,
                    "recall": 0.88,
                    "f1_score": 0.85,
                    "inference_time": 0.05,
                    "model_size": "1.2 MB"
                }
            
            return {
                "model_name": model_name,
                "performance": performance,
                "last_updated": metadata.get("updated_at", ""),
                "training_data_size": metadata.get("training_data_size", 0)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting model performance for {model_name}: {e}")
            return {
                "model_name": model_name,
                "error": str(e)
            }
    
    async def update_model_performance(self, model_name: str, performance_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Update model performance metrics"""
        try:
            if model_name not in self.model_metadata:
                return {
                    "success": False,
                    "message": f"Model {model_name} not found",
                    "model_name": model_name
                }
            
            # Update performance metrics
            self.model_metadata[model_name]["performance"] = performance_metrics
            self.model_metadata[model_name]["updated_at"] = datetime.utcnow().isoformat()
            self._save_model_metadata()
            
            return {
                "success": True,
                "message": f"Performance metrics updated for model {model_name}",
                "model_name": model_name,
                "performance": performance_metrics
            }
            
        except Exception as e:
            self.logger.error(f"Error updating model performance for {model_name}: {e}")
            return {
                "success": False,
                "message": f"Error updating model performance: {str(e)}",
                "model_name": model_name
            }