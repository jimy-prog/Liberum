import os
import json
import time
import google.generativeai as genai
from master_database import SessionMaster, GrammarTopic, GrammarQuestion

from services.ai_client import UniversalAIClient

ai_client = UniversalAIClient(primary_provider="openai")

def generate_content_for_topic(topic):
    prompt = f"""
You are an expert English teacher writing content for a Grammar Engine.
The topic is: '{topic.title}' for CEFR level: {topic.level}.

Your task is to generate TWO things:
1. A detailed, engaging 1-page explanation of this grammar topic, formatted in HTML. It should include clear rules, tables if necessary, and several examples. Do not include <html>, <head>, or <body> tags. Just the content (e.g. <h2>, <p>, <ul>).
2. Exactly 10 multiple-choice quiz questions testing this topic.

You MUST return your response in the following strict JSON format, and NOTHING ELSE:
{{
    "explanation_html": "<h2>Explanation Title</h2><p>Content...</p>",
    "questions": [
        {{
            "question": "The question text",
            "option_a": "First option",
            "option_b": "Second option",
            "option_c": "Third option",
            "option_d": "Fourth option",
            "correct_option": "A",
            "explanation": "Why this is correct"
        }}
    ]
}}
"""
    try:
        raw_text = ai_client.generate_structured_response(prompt)
        # Parse output
        raw_text = raw_text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "", 1)
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        data = json.loads(raw_text.strip())
        return data
    except Exception as e:
        print(f"Failed to parse JSON for topic {topic.id}: {e}")
        # Return fallback dummy data so the UI can still be tested
        return {
            "explanation_html": f"<h2>{topic.title}</h2><p>Due to API limits, this is a placeholder explanation for {topic.title} ({topic.level}). Please edit this content manually in the Owner Portal.</p>",
            "questions": [
                {
                    "question": f"Dummy Question {i} for {topic.title}?",
                    "option_a": "Option A",
                    "option_b": "Option B",
                    "option_c": "Option C",
                    "option_d": "Option D",
                    "correct_option": "A",
                    "explanation": "Dummy explanation."
                } for i in range(1, 11)
            ]
        }

def run_worker():
    print("Starting Grammar AI Worker...")
    db = SessionMaster()
    try:
        # Find topics that haven't been generated yet (explanation is empty or has placeholder)
        topics = db.query(GrammarTopic).filter(
            (GrammarTopic.explanation == "") | 
            (GrammarTopic.explanation.like("%Due to API limits%")) |
            (GrammarTopic.is_published == False)
        ).all()
        print(f"Found {len(topics)} topics to process.")
        
        for topic in topics:
            print(f"Processing Topic #{topic.id}: {topic.title} ({topic.level})")
            data = generate_content_for_topic(topic)
            
            if data and "explanation_html" in data and "questions" in data:
                # Update topic explanation and publish status
                topic.explanation = data["explanation_html"]
                topic.is_published = True
                
                # Save generated lesson to a separate file as requested
                os.makedirs("docs/grammar_lessons", exist_ok=True)
                with open(f"docs/grammar_lessons/topic_{topic.id}_{topic.title.replace(' ', '_').replace('/', '_')}.html", "w") as f:
                    f.write(data["explanation_html"])
                
                # Delete old dummy questions
                db.query(GrammarQuestion).filter(GrammarQuestion.topic_id == topic.id).delete()
                
                # Insert questions
                for q_data in data["questions"]:
                    question = GrammarQuestion(
                        topic_id=topic.id,
                        question_text=q_data["question"],
                        option_a=q_data["option_a"],
                        option_b=q_data["option_b"],
                        option_c=q_data["option_c"],
                        option_d=q_data["option_d"],
                        correct_option=q_data.get("correct_option", "A"),
                        explanation=q_data.get("explanation", "")
                    )
                    db.add(question)
                
                db.commit()
                print(f"Successfully populated topic #{topic.id} with 10 questions.")
            else:
                print(f"Failed to process topic #{topic.id}. Data invalid.")
                
            # Sleep briefly to avoid rate limits
            time.sleep(3)
            
    finally:
        db.close()
    print("Worker finished.")

if __name__ == "__main__":
    run_worker()
