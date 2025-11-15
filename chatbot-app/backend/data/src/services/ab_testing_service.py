import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import asyncio
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
import random
import math
from collections import defaultdict, Counter
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class ExperimentStatus(Enum):
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MetricType(Enum):
    NUMERICAL = "numerical"
    CATEGORICAL = "categorical"
    BINARY = "binary"
    RATE = "rate"

@dataclass
class ExperimentVariant:
    name: str
    weight: float
    description: str = ""
    config: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.config is None:
            self.config = {}

@dataclass
class ExperimentMetric:
    name: str
    type: MetricType
    description: str = ""
    aggregation: str = "mean"  # mean, sum, count, etc.
    is_primary: bool = False

@dataclass
class Experiment:
    id: str
    name: str
    description: str
    status: ExperimentStatus
    variants: List[ExperimentVariant]
    metrics: List[ExperimentMetric]
    start_date: datetime
    end_date: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime
    config: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.config is None:
            self.config = {}

class ABTestingService:
    def __init__(self):
        self.connection = self._get_connection()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.engine = self._create_sqlalchemy_engine()
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    def _get_connection(self):
        """Get database connection"""
        return psycopg2.connect(
            host='localhost',
            database='chatbot',
            user='postgres',
            password='password'
        )
    
    def _create_sqlalchemy_engine(self):
        """Create SQLAlchemy engine for advanced analytics"""
        return create_engine(
            'postgresql://postgres:password@localhost:5432/chatbot',
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True
        )
    
    async def initialize(self):
        """Initialize A/B testing service"""
        try:
            # Create necessary tables if they don't exist
            await self._ensure_tables_exist()
            logger.info("A/B Testing Service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing A/B Testing Service: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            self.executor.shutdown(wait=True)
            logger.info("A/B Testing Service cleanup complete")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def _ensure_tables_exist(self):
        """Ensure necessary tables exist"""
        try:
            with self.connection.cursor() as cursor:
                # Create experiments table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_experiments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) NOT NULL DEFAULT 'draft',
                    variants JSONB NOT NULL,
                    metrics JSONB NOT NULL,
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    created_by VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    config JSONB DEFAULT '{}'
                )
                """)
                
                # Create experiment assignments table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_assignments (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    experiment_id UUID REFERENCES ab_experiments(id),
                    user_id VARCHAR(255) NOT NULL,
                    variant_name VARCHAR(100) NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create experiment events table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_events (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    experiment_id UUID REFERENCES ab_experiments(id),
                    user_id VARCHAR(255) NOT NULL,
                    variant_name VARCHAR(100) NOT NULL,
                    event_name VARCHAR(100) NOT NULL,
                    event_data JSONB,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create experiment results table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_results (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    experiment_id UUID REFERENCES ab_experiments(id),
                    variant_name VARCHAR(100) NOT NULL,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value FLOAT NOT NULL,
                    sample_size INTEGER NOT NULL,
                    confidence_interval_lower FLOAT,
                    confidence_interval_upper FLOAT,
                    p_value FLOAT,
                    statistical_significance BOOLEAN DEFAULT FALSE,
                    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata JSONB DEFAULT '{}'
                )
                """)
                
                # Create experiment schedules table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_schedules (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    experiment_id UUID REFERENCES ab_experiments(id),
                    schedule_type VARCHAR(50) NOT NULL,
                    cron_expression VARCHAR(100),
                    target_percentage FLOAT DEFAULT 100.0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """)
                
                self.connection.commit()
                logger.info("A/B Testing tables created/verified")
                
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error ensuring tables exist: {e}")
            raise
    
    async def create_experiment(self, experiment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new A/B test experiment"""
        try:
            # Validate experiment data
            if not self._validate_experiment_data(experiment_data):
                raise ValueError("Invalid experiment data")
            
            # Create experiment object
            experiment = Experiment(
                id=str(uuid.uuid4()),
                name=experiment_data['name'],
                description=experiment_data.get('description', ''),
                status=ExperimentStatus.DRAFT,
                variants=[ExperimentVariant(**v) for v in experiment_data['variants']],
                metrics=[ExperimentMetric(**m) for m in experiment_data['metrics']],
                start_date=datetime.fromisoformat(experiment_data['start_date']),
                end_date=datetime.fromisoformat(experiment_data['end_date']) if experiment_data.get('end_date') else None,
                created_by=experiment_data.get('created_by', 'system'),
                created_at=datetime.now(),
                updated_at=datetime.now(),
                config=experiment_data.get('config', {})
            )
            
            # Store experiment in database
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO ab_experiments (id, name, description, status, variants, metrics, start_date, end_date, created_by, config)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """
                cursor.execute(query, (
                    experiment.id,
                    experiment.name,
                    experiment.description,
                    experiment.status.value,
                    json.dumps([asdict(v) for v in experiment.variants]),
                    json.dumps([asdict(m) for m in experiment.metrics]),
                    experiment.start_date,
                    experiment.end_date,
                    experiment.created_by,
                    json.dumps(experiment.config)
                ))
                self.connection.commit()
            
            # Initialize experiment data structures
            await self._initialize_experiment_data(experiment.id)
            
            return {
                'experiment_id': experiment.id,
                'status': 'created',
                'message': 'Experiment created successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error creating experiment: {e}")
            raise Exception(f"Failed to create experiment: {str(e)}")
    
    def _validate_experiment_data(self, data: Dict[str, Any]) -> bool:
        """Validate experiment configuration"""
        required_fields = ['name', 'variants', 'metrics', 'start_date']
        
        for field in required_fields:
            if field not in data:
                return False
        
        # Validate variants
        variants = data['variants']
        if not isinstance(variants, list) or len(variants) < 2:
            return False
        
        total_weight = sum(variant.get('weight', 1) for variant in variants)
        if abs(total_weight - 1.0) > 0.01:
            return False
        
        # Validate metrics
        metrics = data['metrics']
        if not isinstance(metrics, list) or len(metrics) == 0:
            return False
        
        return True
    
    async def _initialize_experiment_data(self, experiment_id: str):
        """Initialize experiment data structures"""
        try:
            # Initialize Redis keys for tracking
            experiment_key = f"experiment:{experiment_id}"
            
            # Initialize stats for each variant
            stats = {}
            for variant in await self._get_experiment_variants(experiment_id):
                stats[f"assignments:{variant['name']}"] = 0
                stats[f"completions:{variant['name']}"] = 0
            
            self.redis_client.hmset(
                f"experiment:{experiment_id}:stats",
                stats
            )
            
            # Initialize metrics tracking
            metrics = await self._get_experiment_metrics(experiment_id)
            for metric in metrics:
                for variant in await self._get_experiment_variants(experiment_id):
                    self.redis_client.hset(
                        f"experiment:{experiment_id}:metrics:{variant['name']}:{metric['name']}",
                        mapping={k: 0 for k in ['sum', 'count', 'squared_sum']}
                    )
            
        except Exception as e:
            logger.error(f"Error initializing experiment data: {e}")
            raise
    
    async def _get_experiment_variants(self, experiment_id: str) -> List[Dict[str, Any]]:
        """Get experiment variants from database"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT variants FROM ab_experiments WHERE id = %s", (experiment_id,))
            result = cursor.fetchone()
            return json.loads(result['variants']) if result else []
    
    async def _get_experiment_metrics(self, experiment_id: str) -> List[Dict[str, Any]]:
        """Get experiment metrics from database"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT metrics FROM ab_experiments WHERE id = %s", (experiment_id,))
            result = cursor.fetchone()
            return json.loads(result['metrics']) if result else []
    
    async def start_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Start an A/B test experiment"""
        try:
            # Validate experiment can be started
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            if experiment['status'] != ExperimentStatus.DRAFT.value:
                raise ValueError("Experiment is not in draft state")
            
            # Update experiment status
            with self.connection.cursor() as cursor:
                query = """
                UPDATE ab_experiments 
                SET status = %s, updated_at = %s 
                WHERE id = %s
                """
                cursor.execute(query, (ExperimentStatus.RUNNING.value, datetime.now(), experiment_id))
                self.connection.commit()
            
            # Start experiment scheduler
            asyncio.create_task(self._start_experiment_scheduler(experiment_id))
            
            return {
                'experiment_id': experiment_id,
                'status': 'started',
                'message': 'Experiment started successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error starting experiment: {e}")
            raise Exception(f"Failed to start experiment: {str(e)}")
    
    async def _get_experiment(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """Get experiment from database"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM ab_experiments WHERE id = %s", (experiment_id,))
            result = cursor.fetchone()
            if result:
                return dict(result)
            return None
    
    async def _start_experiment_scheduler(self, experiment_id: str):
        """Start experiment scheduler for real-time processing"""
        try:
            while True:
                # Check if experiment is still running
                experiment = await self._get_experiment(experiment_id)
                if not experiment or experiment['status'] != ExperimentStatus.RUNNING.value:
                    break
                
                # Process experiment data
                await self._process_experiment_data(experiment_id)
                
                # Check if experiment should end
                if experiment.get('end_date') and datetime.now() >= datetime.fromisoformat(experiment['end_date']):
                    await self._complete_experiment(experiment_id)
                    break
                
                # Wait for next interval
                await asyncio.sleep(60)  # Process every minute
                
        except Exception as e:
            logger.error(f"Error in experiment scheduler: {e}")
    
    async def _process_experiment_data(self, experiment_id: str):
        """Process experiment data and calculate results"""
        try:
            # Get experiment variants and metrics
            variants = await self._get_experiment_variants(experiment_id)
            metrics = await self._get_experiment_metrics(experiment_id)
            
            # Process each metric
            for metric in metrics:
                await self._process_metric(experiment_id, metric['name'], variants)
            
            # Check statistical significance
            await self._check_statistical_significance(experiment_id)
            
        except Exception as e:
            logger.error(f"Error processing experiment data: {e}")
    
    async def _process_metric(self, experiment_id: str, metric_name: str, variants: List[Dict[str, Any]]):
        """Process a specific metric for all variants"""
        try:
            for variant in variants:
                variant_name = variant['name']
                
                # Get metric data from Redis
                metric_key = f"experiment:{experiment_id}:metrics:{variant_name}:{metric_name}"
                metric_data = self.redis_client.hgetall(metric_key)
                
                if not metric_data:
                    continue
                
                # Calculate metric value based on type
                metric_type = await self._get_metric_type(experiment_id, metric_name)
                metric_value = self._calculate_metric_value(metric_data, metric_type)
                
                # Store result in database
                with self.connection.cursor() as cursor:
                    query = """
                    INSERT INTO ab_results (experiment_id, variant_name, metric_name, metric_value, sample_size, calculated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (experiment_id, variant_name, metric_name) 
                    DO UPDATE SET 
                        metric_value = EXCLUDED.metric_value,
                        sample_size = EXCLUDED.sample_size,
                        calculated_at = EXCLUDED.calculated_at
                    """
                    cursor.execute(query, (
                        experiment_id,
                        variant_name,
                        metric_name,
                        metric_value,
                        int(metric_data.get(b'count', 0)),
                        datetime.now()
                    ))
                    self.connection.commit()
                
        except Exception as e:
            logger.error(f"Error processing metric {metric_name}: {e}")
    
    async def _get_metric_type(self, experiment_id: str, metric_name: str) -> str:
        """Get metric type from database"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT metrics FROM ab_experiments WHERE id = %s", (experiment_id,))
            result = cursor.fetchone()
            if result:
                metrics = json.loads(result['metrics'])
                for metric in metrics:
                    if metric['name'] == metric_name:
                        return metric['type']
            return 'numerical'
    
    def _calculate_metric_value(self, metric_data: Dict[bytes, bytes], metric_type: str) -> float:
        """Calculate metric value based on type"""
        try:
            count = int(metric_data.get(b'count', 0))
            if count == 0:
                return 0.0
            
            if metric_type == 'numerical':
                sum_val = float(metric_data.get(b'sum', 0))
                return sum_val / count
            elif metric_type == 'binary':
                sum_val = float(metric_data.get(b'sum', 0))
                return sum_val / count
            elif metric_type == 'rate':
                sum_val = float(metric_data.get(b'sum', 0))
                return sum_val / count
            else:
                return float(count)
                
        except Exception as e:
            logger.error(f"Error calculating metric value: {e}")
            return 0.0
    
    async def _check_statistical_significance(self, experiment_id: str):
        """Check statistical significance between variants"""
        try:
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                return
            
            variants = await self._get_experiment_variants(experiment_id)
            metrics = await self._get_experiment_metrics(experiment_id)
            
            # Check each metric
            for metric in metrics:
                if metric.get('is_primary', False):
                    await self._check_metric_significance(experiment_id, metric['name'], variants)
            
        except Exception as e:
            logger.error(f"Error checking statistical significance: {e}")
    
    async def _check_metric_significance(self, experiment_id: str, metric_name: str, variants: List[Dict[str, Any]]):
        """Check statistical significance for a specific metric"""
        try:
            # Get metric data for all variants
            variant_data = {}
            for variant in variants:
                variant_name = variant['name']
                
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                    SELECT metric_value, sample_size 
                    FROM ab_results 
                    WHERE experiment_id = %s AND variant_name = %s AND metric_name = %s
                    ORDER BY calculated_at DESC LIMIT 1
                    """, (experiment_id, variant_name, metric_name))
                    
                    result = cursor.fetchone()
                    if result:
                        variant_data[variant_name] = {
                            'value': result['metric_value'],
                            'sample_size': result['sample_size']
                        }
            
            # Perform statistical test
            if len(variant_data) >= 2:
                results = await self._perform_statistical_test(metric_name, variant_data)
                
                # Update results with significance information
                with self.connection.cursor() as cursor:
                    for variant_name, data in results.items():
                        query = """
                        UPDATE ab_results 
                        SET p_value = %s, statistical_significance = %s
                        WHERE experiment_id = %s AND variant_name = %s AND metric_name = %s
                        ORDER BY calculated_at DESC LIMIT 1
                        """
                        cursor.execute(query, (
                            data.get('p_value', 0.0),
                            data.get('significant', False),
                            experiment_id,
                            variant_name,
                            metric_name
                        ))
                    self.connection.commit()
            
        except Exception as e:
            logger.error(f"Error checking metric significance: {e}")
    
    async def _perform_statistical_test(self, metric_name: str, variant_data: Dict[str, Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        """Perform statistical test between variants"""
        results = {}
        
        try:
            # Simple t-test for two variants
            if len(variant_data) == 2:
                variant_names = list(variant_data.keys())
                variant_a = variant_data[variant_names[0]]
                variant_b = variant_data[variant_names[1]]
                
                # Calculate t-test
                t_stat, p_value = await self._calculate_t_test(
                    variant_a['value'], variant_a['sample_size'],
                    variant_b['value'], variant_b['sample_size']
                )
                
                # Update results
                for variant_name in variant_names:
                    results[variant_name] = {
                        'p_value': p_value,
                        'significant': p_value < 0.05,
                        't_statistic': t_stat
                    }
            
            # ANOVA for multiple variants
            elif len(variant_data) > 2:
                f_stat, p_value = await self._calculate_anova(variant_data)
                
                for variant_name in variant_data.keys():
                    results[variant_name] = {
                        'p_value': p_value,
                        'significant': p_value < 0.05,
                        'f_statistic': f_stat
                    }
            
        except Exception as e:
            logger.error(f"Error performing statistical test: {e}")
            # Set default values
            for variant_name in variant_data.keys():
                results[variant_name] = {
                    'p_value': 1.0,
                    'significant': False,
                    't_statistic': 0.0
                }
        
        return results
    
    async def _calculate_t_test(self, mean1: float, n1: int, mean2: float, n2: int) -> Tuple[float, float]:
        """Calculate t-test between two samples"""
        try:
            # Pooled standard deviation
            pooled_std = math.sqrt(((n1 - 1) * 0 + (n2 - 1) * 0) / (n1 + n2 - 2))
            
            # Standard error
            se = pooled_std * math.sqrt(1/n1 + 1/n2)
            
            # t-statistic
            t_stat = (mean1 - mean2) / se if se > 0 else 0
            
            # p-value (simplified)
            p_value = 2 * (1 - self._t_cdf(abs(t_stat), n1 + n2 - 2))
            
            return t_stat, p_value
            
        except Exception as e:
            logger.error(f"Error calculating t-test: {e}")
            return 0.0, 1.0
    
    async def _calculate_anova(self, variant_data: Dict[str, Dict[str, Any]]) -> Tuple[float, float]:
        """Calculate ANOVA between multiple variants"""
        try:
            # Calculate overall mean
            all_values = [data['value'] for data in variant_data.values()]
            overall_mean = statistics.mean(all_values)
            
            # Calculate between-group variance
            between_ss = 0
            for variant_name, data in variant_data.items():
                n = data['sample_size']
                mean = data['value']
                between_ss += n * (mean - overall_mean) ** 2
            
            # Calculate within-group variance
            within_ss = 0
            for variant_name, data in variant_data.values():
                n = data['sample_size']
                mean = data['value']
                within_ss += (n - 1) * 0  # Assuming variance is 0 for simplicity
            
            # Calculate F-statistic
            k = len(variant_data)
            n_total = sum(data['sample_size'] for data in variant_data.values())
            
            df_between = k - 1
            df_within = n_total - k
            
            ms_between = between_ss / df_between if df_between > 0 else 0
            ms_within = within_ss / df_within if df_within > 0 else 0
            
            f_stat = ms_between / ms_within if ms_within > 0 else 0
            
            # p-value (simplified)
            p_value = 1 - self._f_cdf(f_stat, df_between, df_within)
            
            return f_stat, p_value
            
        except Exception as e:
            logger.error(f"Error calculating ANOVA: {e}")
            return 0.0, 1.0
    
    def _t_cdf(self, x: float, df: int) -> float:
        """Cumulative distribution function for t-distribution (simplified)"""
        # This is a simplified version - in production, use scipy.stats
        return 0.5 + 0.5 * math.tanh(x / math.sqrt(df + 3))
    
    def _f_cdf(self, x: float, df1: int, df2: int) -> float:
        """Cumulative distribution function for F-distribution (simplified)"""
        # This is a simplified version - in production, use scipy.stats
        return 1 - math.exp(-x / (df1 + df2))
    
    async def assign_user_to_variant(self, experiment_id: str, user_id: str) -> Dict[str, Any]:
        """Assign user to experiment variant"""
        try:
            # Get experiment
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            if experiment['status'] != ExperimentStatus.RUNNING.value:
                raise ValueError("Experiment is not running")
            
            # Check if user is already assigned
            existing_assignment = await self._get_user_assignment(experiment_id, user_id)
            if existing_assignment:
                return {
                    'experiment_id': experiment_id,
                    'user_id': user_id,
                    'variant': existing_assignment['variant_name'],
                    'status': 'already_assigned'
                }
            
            # Get variants and their weights
            variants = await self._get_experiment_variants(experiment_id)
            
            # Select variant based on weights
            variant_name = self._select_variant_by_weight(variants)
            
            # Record assignment
            await self._record_assignment(experiment_id, user_id, variant_name)
            
            # Cache assignment in Redis
            cache_key = f"assignment:{experiment_id}:{user_id}"
            self.redis_client.setex(cache_key, 86400, variant_name)  # 24 hours
            
            return {
                'experiment_id': experiment_id,
                'user_id': user_id,
                'variant': variant_name,
                'status': 'assigned'
            }
            
        except Exception as e:
            logger.error(f"Error assigning user to variant: {e}")
            raise Exception(f"Failed to assign user to variant: {str(e)}")
    
    async def _get_user_assignment(self, experiment_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's current assignment"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
            SELECT variant_name FROM ab_assignments 
            WHERE experiment_id = %s AND user_id = %s AND completed_at IS NULL
            """, (experiment_id, user_id))
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def _select_variant_by_weight(self, variants: List[Dict[str, Any]]) -> str:
        """Select variant based on weight using weighted random selection"""
        try:
            # Calculate cumulative weights
            weights = [variant['weight'] for variant in variants]
            cumulative_weights = []
            current_sum = 0
            
            for weight in weights:
                current_sum += weight
                cumulative_weights.append(current_sum)
            
            # Generate random number
            random_value = random.random() * current_sum
            
            # Find selected variant
            for i, cumulative_weight in enumerate(cumulative_weights):
                if random_value <= cumulative_weight:
                    return variants[i]['name']
            
            return variants[-1]['name']  # Fallback
            
        except Exception as e:
            logger.error(f"Error selecting variant by weight: {e}")
            return variants[0]['name']  # Fallback
    
    async def _record_assignment(self, experiment_id: str, user_id: str, variant_name: str):
        """Record user assignment to variant"""
        with self.connection.cursor() as cursor:
            query = """
            INSERT INTO ab_assignments (experiment_id, user_id, variant_name)
            VALUES (%s, %s, %s)
            """
            cursor.execute(query, (experiment_id, user_id, variant_name))
            self.connection.commit()
    
    async def track_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track experiment event"""
        try:
            experiment_id = event_data['experiment_id']
            user_id = event_data['user_id']
            variant_name = event_data['variant_name']
            event_name = event_data['event_name']
            event_value = event_data.get('event_value', 1.0)
            event_data = event_data.get('event_data', {})
            
            # Get experiment metrics
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            metrics = json.loads(experiment['metrics'])
            
            # Update Redis metrics
            for metric in metrics:
                metric_name = metric['name']
                metric_type = metric['type']
                
                # Update Redis counters
                metric_key = f"experiment:{experiment_id}:metrics:{variant_name}:{metric_name}"
                
                if metric_type in ['numerical', 'rate']:
                    # Update sum and count
                    current_sum = float(self.redis_client.hget(metric_key, 'sum') or 0)
                    current_count = int(self.redis_client.hget(metric_key, 'count') or 0)
                    
                    self.redis_client.hset(metric_key, 'sum', current_sum + event_value)
                    self.redis_client.hset(metric_key, 'count', current_count + 1)
                    
                    # Update squared sum for variance calculation
                    current_squared_sum = float(self.redis_client.hget(metric_key, 'squared_sum') or 0)
                    self.redis_client.hset(metric_key, 'squared_sum', current_squared_sum + event_value ** 2)
                
                elif metric_type == 'binary':
                    # Update sum and count (1 for success, 0 for failure)
                    current_sum = float(self.redis_client.hget(metric_key, 'sum') or 0)
                    current_count = int(self.redis_client.hget(metric_key, 'count') or 0)
                    
                    self.redis_client.hset(metric_key, 'sum', current_sum + event_value)
                    self.redis_client.hset(metric_key, 'count', current_count + 1)
                
                elif metric_type == 'categorical':
                    # Track categorical events
                    category_key = f"experiment:{experiment_id}:metrics:{variant_name}:{metric_name}:categories"
                    self.redis_client.hincrby(category_key, str(event_value), 1)
            
            # Record event in database
            with self.connection.cursor() as cursor:
                query = """
                INSERT INTO ab_events (experiment_id, user_id, variant_name, event_name, event_data)
                VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (
                    experiment_id,
                    user_id,
                    variant_name,
                    event_name,
                    json.dumps(event_data)
                ))
                self.connection.commit()
            
            # Update assignment completion if this is a completion event
            if event_name == 'experiment_completed':
                await self._mark_assignment_completed(experiment_id, user_id)
            
            return {
                'event_id': str(uuid.uuid4()),
                'status': 'tracked',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error tracking event: {e}")
            raise Exception(f"Failed to track event: {str(e)}")
    
    async def _mark_assignment_completed(self, experiment_id: str, user_id: str):
        """Mark user assignment as completed"""
        with self.connection.cursor() as cursor:
            query = """
            UPDATE ab_assignments 
            SET completed_at = %s 
            WHERE experiment_id = %s AND user_id = %s AND completed_at IS NULL
            """
            cursor.execute(query, (datetime.now(), experiment_id, user_id))
            self.connection.commit()
    
    async def get_experiment_results(self, experiment_id: str) -> Dict[str, Any]:
        """Get experiment results"""
        try:
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            # Get results from database
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                SELECT variant_name, metric_name, metric_value, sample_size, 
                       confidence_interval_lower, confidence_interval_upper,
                       p_value, statistical_significance, calculated_at
                FROM ab_results 
                WHERE experiment_id = %s
                ORDER BY variant_name, metric_name, calculated_at DESC
                """, (experiment_id,))
                
                results = cursor.fetchall()
            
            # Format results
            formatted_results = {
                'experiment_id': experiment_id,
                'experiment_name': experiment['name'],
                'status': experiment['status'],
                'results': {},
                'summary': {},
                'conclusions': {}
            }
            
            # Group results by variant
            for result in results:
                variant_name = result['variant_name']
                metric_name = result['metric_name']
                
                if variant_name not in formatted_results['results']:
                    formatted_results['results'][variant_name] = {}
                
                formatted_results['results'][variant_name][metric_name] = {
                    'value': result['metric_value'],
                    'sample_size': result['sample_size'],
                    'confidence_interval': {
                        'lower': result['confidence_interval_lower'],
                        'upper': result['confidence_interval_upper']
                    },
                    'p_value': result['p_value'],
                    'statistical_significance': result['statistical_significance'],
                    'calculated_at': result['calculated_at'].isoformat()
                }
            
            # Generate summary
            await self._generate_experiment_summary(formatted_results)
            
            # Generate conclusions
            await self._generate_experiment_conclusions(formatted_results)
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error getting experiment results: {e}")
            raise Exception(f"Failed to get experiment results: {str(e)}")
    
    async def _generate_experiment_summary(self, results: Dict[str, Any]):
        """Generate experiment summary"""
        try:
            results['summary'] = {
                'total_variants': len(results['results']),
                'total_metrics': len(set(metric for variant in results['results'].values() for metric in variant.keys())),
                'primary_metrics': [],
                'significant_findings': []
            }
            
            # Find primary metrics
            for variant_name, metrics in results['results'].items():
                for metric_name, metric_data in metrics.items():
                    if metric_data.get('statistical_significance', False):
                        results['summary']['significant_findings'].append({
                            'metric': metric_name,
                            'variant': variant_name,
                            'improvement': self._calculate_improvement(metrics)
                        })
            
        except Exception as e:
            logger.error(f"Error generating experiment summary: {e}")
    
    def _calculate_improvement(self, metrics: Dict[str, Any]) -> float:
        """Calculate improvement percentage"""
        try:
            # Find control variant (first variant)
            control_variant = list(metrics.keys())[0]
            control_value = metrics[control_variant]['value']
            
            # Find best performing variant
            best_variant = max(metrics.keys(), key=lambda k: metrics[k]['value'])
            best_value = metrics[best_variant]['value']
            
            if control_value == 0:
                return 0.0
            
            return ((best_value - control_value) / control_value) * 100
            
        except Exception as e:
            logger.error(f"Error calculating improvement: {e}")
            return 0.0
    
    async def _generate_experiment_conclusions(self, results: Dict[str, Any]):
        """Generate experiment conclusions"""
        try:
            conclusions = []
            
            # Check for significant findings
            if results['summary']['significant_findings']:
                for finding in results['summary']['significant_findings']:
                    conclusions.append(
                        f"Variant {finding['variant']} shows significant improvement "
                        f"({finding['improvement']:.1f}%) in {finding['metric']}"
                    )
            else:
                conclusions.append("No statistically significant differences found between variants")
            
            # Check for sample size
            total_sample_size = sum(
                metric['sample_size'] 
                for variant in results['results'].values() 
                for metric in variant.values()
            )
            
            if total_sample_size < 1000:
                conclusions.append("Low sample size - results may not be statistically significant")
            
            results['conclusions'] = conclusions
            
        except Exception as e:
            logger.error(f"Error generating experiment conclusions: {e}")
            results['conclusions'] = ["Unable to generate conclusions due to error"]
    
    async def list_experiments(self, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """List all experiments"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                if status:
                    cursor.execute("""
                    SELECT * FROM ab_experiments 
                    WHERE status = %s 
                    ORDER BY created_at DESC 
                    LIMIT %s
                    """, (status, limit))
                else:
                    cursor.execute("""
                    SELECT * FROM ab_experiments 
                    ORDER BY created_at DESC 
                    LIMIT %s
                    """, (limit,))
                
                experiments = cursor.fetchall()
                
                # Format results
                formatted_experiments = []
                for exp in experiments:
                    formatted_exp = dict(exp)
                    formatted_exp['variants'] = json.loads(exp['variants'])
                    formatted_exp['metrics'] = json.loads(exp['metrics'])
                    formatted_exp['config'] = json.loads(exp['config'])
                    formatted_experiments.append(formatted_exp)
                
                return formatted_experiments
                
        except Exception as e:
            logger.error(f"Error listing experiments: {e}")
            raise Exception(f"Failed to list experiments: {str(e)}")
    
    async def pause_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Pause an experiment"""
        try:
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            if experiment['status'] != ExperimentStatus.RUNNING.value:
                raise ValueError("Experiment is not running")
            
            with self.connection.cursor() as cursor:
                query = """
                UPDATE ab_experiments 
                SET status = %s, updated_at = %s 
                WHERE id = %s
                """
                cursor.execute(query, (ExperimentStatus.PAUSED.value, datetime.now(), experiment_id))
                self.connection.commit()
            
            return {
                'experiment_id': experiment_id,
                'status': 'paused',
                'message': 'Experiment paused successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error pausing experiment: {e}")
            raise Exception(f"Failed to pause experiment: {str(e)}")
    
    async def resume_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Resume a paused experiment"""
        try:
            experiment = await self._get_experiment(experiment_id)
            if not experiment:
                raise ValueError("Experiment not found")
            
            if experiment['status'] != ExperimentStatus.PAUSED.value:
                raise ValueError("Experiment is not paused")
            
            with self.connection.cursor() as cursor:
                query = """
                UPDATE ab_experiments 
                SET status = %s, updated_at = %s 
                WHERE id = %s
                """
                cursor.execute(query, (ExperimentStatus.RUNNING.value, datetime.now(), experiment_id))
                self.connection.commit()
            
            # Resume experiment scheduler
            asyncio.create_task(self._start_experiment_scheduler(experiment_id))
            
            return {
                'experiment_id': experiment_id,
                'status': 'resumed',
                'message': 'Experiment resumed successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error resuming experiment: {e}")
            raise Exception(f"Failed to resume experiment: {str(e)}")
    
    async def complete_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Complete an experiment"""
        try:
            await self._complete_experiment(experiment_id)
            
            return {
                'experiment_id': experiment_id,
                'status': 'completed',
                'message': 'Experiment completed successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error completing experiment: {e}")
            raise Exception(f"Failed to complete experiment: {str(e)}")
    
    async def _complete_experiment(self, experiment_id: str):
        """Complete an experiment (internal method)"""
        with self.connection.cursor() as cursor:
            query = """
            UPDATE ab_experiments 
            SET status = %s, updated_at = %s 
            WHERE id = %s
            """
            cursor.execute(query, (ExperimentStatus.COMPLETED.value, datetime.now(), experiment_id))
            self.connection.commit()
    
    async def delete_experiment(self, experiment_id: str) -> Dict[str, Any]:
        """Delete an experiment"""
        try:
            with self.connection.cursor() as cursor:
                # Delete related data
                cursor.execute("DELETE FROM ab_results WHERE experiment_id = %s", (experiment_id,))
                cursor.execute("DELETE FROM ab_events WHERE experiment_id = %s", (experiment_id,))
                cursor.execute("DELETE FROM ab_assignments WHERE experiment_id = %s", (experiment_id,))
                cursor.execute("DELETE FROM ab_schedules WHERE experiment_id = %s", (experiment_id,))
                cursor.execute("DELETE FROM ab_experiments WHERE id = %s", (experiment_id))
                self.connection.commit()
            
            # Clear Redis data
            redis_keys = self.redis_client.keys(f"experiment:{experiment_id}:*")
            if redis_keys:
                self.redis_client.delete(*redis_keys)
            
            return {
                'experiment_id': experiment_id,
                'status': 'deleted',
                'message': 'Experiment deleted successfully'
            }
            
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Error deleting experiment: {e}")
            raise Exception(f"Failed to delete experiment: {str(e)}")
    
    async def get_experiment_health(self) -> Dict[str, Any]:
        """Get A/B testing service health"""
        try:
            health = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'checks': {}
            }
            
            # Check database connection
            try:
                with self.connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    health['checks']['database_connection'] = 'ok'
            except Exception as e:
                health['checks']['database_connection'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check Redis connection
            try:
                self.redis_client.ping()
                health['checks']['redis_connection'] = 'ok'
            except Exception as e:
                health['checks']['redis_connection'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check running experiments
            try:
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("SELECT COUNT(*) FROM ab_experiments WHERE status = 'running'")
                    running_count = cursor.fetchone()['count']
                    health['checks']['running_experiments'] = f'{running_count} running'
            except Exception as e:
                health['checks']['running_experiments'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            # Check recent assignments
            try:
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                    SELECT COUNT(*) 
                    FROM ab_assignments 
                    WHERE assigned_at > NOW() - INTERVAL '1 hour'
                    """)
                    recent_assignments = cursor.fetchone()['count']
                    health['checks']['recent_assignments'] = f'{recent_assignments} in last hour'
            except Exception as e:
                health['checks']['recent_assignments'] = f'error: {str(e)}'
                health['status'] = 'degraded'
            
            return health
            
        except Exception as e:
            logger.error(f"Error getting A/B testing health: {e}")
            return {
                'status': 'error',
                'timestamp': datetime.now().isoformat(),
                'error': str(e)
            }
>>>>>>> REPLACE