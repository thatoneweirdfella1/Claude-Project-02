"""Database service for SQLite operations and interaction logging."""

import sqlite3
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)


class DatabaseService:
    """Handle all SQLite database operations."""

    def __init__(self):
        """Initialize database connection and create tables if needed."""
        self.db_path = settings.DATABASE_PATH
        self.init_db()

    def init_db(self):
        """Create database tables if they don't exist."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Interactions table - main log of all pipeline executions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT NOT NULL,

                    -- Stage 1: Translation
                    raw_input TEXT NOT NULL,
                    translated_questions TEXT NOT NULL,
                    translation_confidence REAL,
                    gap_category TEXT,
                    translation_operations TEXT,

                    -- Stage 2: Routing
                    routed_model TEXT,
                    routing_confidence REAL,
                    routing_dimensions TEXT,
                    consequence_score INTEGER,
                    user_override INTEGER,

                    -- Stage 3: Technique Selection
                    selected_techniques TEXT,
                    technique_scores TEXT,

                    -- Stage 4: Composition
                    final_prompt TEXT,
                    prompt_tokens INTEGER,

                    -- Stage 5: Execution
                    model_response TEXT,
                    model_stop_reason TEXT,
                    total_input_tokens INTEGER,
                    total_output_tokens INTEGER,
                    total_tokens INTEGER,

                    -- Feedback
                    user_rating INTEGER,
                    user_comment TEXT,
                    behavioral_signal TEXT,

                    -- Learning
                    was_helpful INTEGER,
                    pattern_tags TEXT
                )
            """)

            # Patterns table - discovered patterns from learning system
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS patterns (
                    id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT NOT NULL,
                    interaction_count INTEGER,
                    pattern_type TEXT,
                    dimension TEXT,
                    finding TEXT,
                    confidence REAL,
                    source_interactions TEXT
                )
            """)

            # Refined rules table - rules modified by learning system
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS refined_rules (
                    id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT NOT NULL,
                    rule_type TEXT,
                    original_rule TEXT,
                    refined_rule TEXT,
                    applied INTEGER,
                    improvement_estimate REAL
                )
            """)

            # Accounts table - for Phase 11 multi-AI mode
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    account_name TEXT,
                    provider TEXT,
                    api_key_encrypted TEXT,
                    model_available TEXT,
                    tokens_remaining INTEGER,
                    last_reset TIMESTAMP,
                    status TEXT
                )
            """)

            # Dialogues table - Phase 11 multi-AI dialogue records
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dialogues (
                    id TEXT PRIMARY KEY,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id TEXT NOT NULL,
                    dialogue_mode TEXT,
                    question_id TEXT,
                    responses TEXT,
                    final_synthesis TEXT,
                    user_rating INTEGER,
                    FOREIGN KEY(question_id) REFERENCES interactions(id)
                )
            """)

            conn.commit()
            logger.info("Database initialized successfully")

    def log_interaction(self, data: Dict[str, Any]) -> str:
        """Log a complete interaction through all stages."""
        interaction_id = str(uuid.uuid4())
        user_id = data.get("user_id", "default")

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO interactions (
                    id, user_id,
                    raw_input, translated_questions, translation_confidence, gap_category, translation_operations,
                    routed_model, routing_confidence, routing_dimensions, consequence_score, user_override,
                    selected_techniques, technique_scores,
                    final_prompt, prompt_tokens,
                    model_response, model_stop_reason, total_input_tokens, total_output_tokens, total_tokens
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    interaction_id,
                    user_id,
                    data.get("raw_input"),
                    json.dumps(data.get("translated_questions", [])),
                    data.get("translation_confidence"),
                    data.get("gap_category"),
                    json.dumps(data.get("translation_operations", [])),
                    data.get("routed_model"),
                    data.get("routing_confidence"),
                    json.dumps(data.get("routing_dimensions", {})),
                    data.get("consequence_score"),
                    data.get("user_override"),
                    json.dumps(data.get("selected_techniques", [])),
                    json.dumps(data.get("technique_scores", {})),
                    data.get("final_prompt"),
                    data.get("prompt_tokens"),
                    data.get("model_response"),
                    data.get("model_stop_reason"),
                    data.get("total_input_tokens"),
                    data.get("total_output_tokens"),
                    data.get("total_tokens"),
                ),
            )
            conn.commit()

        logger.info(f"Logged interaction {interaction_id}")
        return interaction_id

    def log_feedback(self, interaction_id: str, feedback_data: Dict[str, Any]):
        """Log user feedback for an interaction."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE interactions
                SET user_rating = ?, user_comment = ?, behavioral_signal = ?
                WHERE id = ?
                """,
                (
                    feedback_data.get("user_rating"),
                    feedback_data.get("user_comment"),
                    feedback_data.get("behavioral_signal"),
                    interaction_id,
                ),
            )
            conn.commit()

        logger.info(f"Logged feedback for interaction {interaction_id}")

    def get_recent_interactions(
        self, user_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get recent interactions for a user."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM interactions
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ?
                """,
                (user_id, limit),
            )
            return [dict(row) for row in cursor.fetchall()]

    def save_pattern(self, pattern_data: Dict[str, Any]) -> str:
        """Save a discovered pattern."""
        pattern_id = str(uuid.uuid4())
        user_id = pattern_data.get("user_id", "default")

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO patterns (
                    id, user_id, interaction_count, pattern_type, dimension, finding, confidence, source_interactions
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    pattern_id,
                    user_id,
                    pattern_data.get("interaction_count"),
                    pattern_data.get("pattern_type"),
                    pattern_data.get("dimension"),
                    pattern_data.get("finding"),
                    pattern_data.get("confidence"),
                    json.dumps(pattern_data.get("source_interactions", [])),
                ),
            )
            conn.commit()

        logger.info(f"Saved pattern {pattern_id}")
        return pattern_id

    def save_refined_rule(self, rule_data: Dict[str, Any]) -> str:
        """Save a refined rule from the learning system."""
        rule_id = str(uuid.uuid4())
        user_id = rule_data.get("user_id", "default")

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO refined_rules (
                    id, user_id, rule_type, original_rule, refined_rule, applied, improvement_estimate
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rule_id,
                    user_id,
                    rule_data.get("rule_type"),
                    rule_data.get("original_rule"),
                    rule_data.get("refined_rule"),
                    rule_data.get("applied", 0),
                    rule_data.get("improvement_estimate"),
                ),
            )
            conn.commit()

        logger.info(f"Saved refined rule {rule_id}")
        return rule_id


# Global database service instance
db_service = DatabaseService()
