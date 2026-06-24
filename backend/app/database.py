import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Any
from .config import DB_PATH

def get_db():
    """Get database connection."""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Initialize database schema."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            created_at TEXT,
            raw_input TEXT,
            user_notes TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS translations (
            id TEXT PRIMARY KEY,
            question_id TEXT,
            translated_text TEXT,
            operations_applied TEXT,
            confidence INTEGER,
            user_action TEXT,
            analysis_json TEXT,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS routings (
            id TEXT PRIMARY KEY,
            translation_id TEXT,
            routed_model TEXT,
            dimensions_json TEXT,
            confidence INTEGER,
            override_model TEXT,
            FOREIGN KEY (translation_id) REFERENCES translations(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS compositions (
            id TEXT PRIMARY KEY,
            routing_id TEXT,
            techniques_json TEXT,
            final_prompt TEXT,
            token_estimate INTEGER,
            confidence INTEGER,
            FOREIGN KEY (routing_id) REFERENCES routings(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id TEXT PRIMARY KEY,
            composition_id TEXT,
            model_response TEXT,
            tokens_used INTEGER,
            generated_at TEXT,
            FOREIGN KEY (composition_id) REFERENCES compositions(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id TEXT PRIMARY KEY,
            answer_id TEXT,
            rating TEXT,
            notes TEXT,
            created_at TEXT,
            FOREIGN KEY (answer_id) REFERENCES answers(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    db.commit()
    db.close()

# Helper functions to store/retrieve from DB
def save_question(question_id: str, raw_input: str) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO questions (id, created_at, raw_input) VALUES (?, ?, ?)",
        (question_id, datetime.utcnow().isoformat(), raw_input)
    )
    db.commit()
    db.close()

def save_translation(translation_id: str, question_id: str, translated_text: str,
                    operations: List[str], confidence: int, analysis: Dict) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO translations
           (id, question_id, translated_text, operations_applied, confidence, analysis_json)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (translation_id, question_id, translated_text, json.dumps(operations),
         confidence, json.dumps(analysis))
    )
    db.commit()
    db.close()

def save_routing(routing_id: str, translation_id: str, routed_model: str,
                dimensions: Dict, confidence: int) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO routings
           (id, translation_id, routed_model, dimensions_json, confidence)
           VALUES (?, ?, ?, ?, ?)""",
        (routing_id, translation_id, routed_model, json.dumps(dimensions), confidence)
    )
    db.commit()
    db.close()

def save_composition(composition_id: str, routing_id: str, techniques: List[Dict],
                   final_prompt: str, token_estimate: int, confidence: int) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO compositions
           (id, routing_id, techniques_json, final_prompt, token_estimate, confidence)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (composition_id, routing_id, json.dumps(techniques), final_prompt,
         token_estimate, confidence)
    )
    db.commit()
    db.close()

def save_answer(answer_id: str, composition_id: str, model_response: str,
               tokens_used: int) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO answers
           (id, composition_id, model_response, tokens_used, generated_at)
           VALUES (?, ?, ?, ?, ?)""",
        (answer_id, composition_id, model_response, tokens_used,
         datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

def save_feedback(feedback_id: str, answer_id: str, rating: str, notes: Optional[str]) -> None:
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        """INSERT OR REPLACE INTO feedback
           (id, answer_id, rating, notes, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (feedback_id, answer_id, rating, notes, datetime.utcnow().isoformat())
    )
    db.commit()
    db.close()

def get_feedback_patterns() -> Dict[str, Any]:
    """Analyze feedback patterns after 50+ questions."""
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT f.rating, r.routed_model, COUNT(*) as count
        FROM feedback f
        JOIN answers a ON f.answer_id = a.id
        JOIN compositions c ON a.composition_id = c.id
        JOIN routings r ON c.routing_id = r.id
        GROUP BY f.rating, r.routed_model
    """)

    result = cursor.fetchall()
    db.close()

    patterns = {}
    for row in result:
        key = f"{row['routed_model']}"
        if key not in patterns:
            patterns[key] = {"good": 0, "bad": 0, "partial": 0}
        patterns[key][row['rating']] = row['count']

    return patterns
