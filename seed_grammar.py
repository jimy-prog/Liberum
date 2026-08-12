import sqlite3
import os
from master_database import SessionMaster, GrammarTopic

def alter_table():
    conn = sqlite3.connect('master.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE grammar_topics ADD COLUMN is_published BOOLEAN DEFAULT FALSE")
        conn.commit()
    except Exception as e:
        pass # Probably already exists
    finally:
        conn.close()

topics = [
    # A1 Beginner
    ("A1", "Verb \"To Be\" (am, is, are)"),
    ("A1", "Present Simple (positive, negative, questions)"),
    ("A1", "Present Continuous (positive, negative, questions)"),
    ("A1", "Past Simple (regular and irregular verbs)"),
    ("A1", "Countable and Uncountable Nouns (some/any, much/many)"),
    ("A1", "Possessive Adjectives (my, your, his, etc.)"),
    ("A1", "Articles (a, an, the)"),
    ("A1", "Prepositions of Place (in, on, at)"),
    ("A1", "There is / There are"),
    ("A1", "Adjectives (comparative, superlative)"),
    ("A1", "Future Simple (will, going to)"),
    ("A1", "Modals (can, can't for ability, permission)"),
    ("A1", "Question Words (who, what, where, when, why, how)"),
    ("A1", "Present Perfect (basic introduction)"),
    ("A1", "Pronouns (subject, object, possessive)"),
    
    # A2 Elementary
    ("A2", "Review of Verb \"To Be\" (questions, short answers)"),
    ("A2", "Past Simple (irregular verbs, negative, questions)"),
    ("A2", "Past Continuous (positive, negative, questions)"),
    ("A2", "Future Simple (will/going to for plans, predictions)"),
    ("A2", "Present Perfect (with ever, never, just, already, yet)"),
    ("A2", "Adverbs of Frequency (always, usually, sometimes, never)"),
    ("A2", "Prepositions of Time (in, on, at)"),
    ("A2", "Can/Can't (ability, permission)"),
    ("A2", "Have to/Don't Have to (obligation, no obligation)"),
    ("A2", "Some/Any (positive, negative, questions)"),
    ("A2", "Like/Want + Verb (e.g., I like to swim or I want to eat—verb patterns)"),
    ("A2", "Quantifiers (some, any, much, many, a lot of, a few)"),
    ("A2", "Comparatives and Superlatives"),
    ("A2", "Wh- Questions (who, what, when, where, why, how)"),
    ("A2", "Possessive 's (e.g., John's book)"),
    
    # B1 Pre-Intermediate
    ("B1", "Present Perfect vs. Past Simple (with for and since)"),
    ("B1", "Present Perfect Continuous (emphasis on duration)"),
    ("B1", "Past Perfect (introduction for actions before another past action)"),
    ("B1", "Used to/Would (for past habits)"),
    ("B1", "First Conditional (if + present, will)"),
    ("B1", "Second Conditional (if + past simple, would)"),
    ("B1", "Gerunds and Infinitives (verbs followed by -ing or to + verb)"),
    ("B1", "Modals of Obligation (must, have to, should)"),
    ("B1", "Modals of Possibility (might, may, could)"),
    ("B1", "Future Continuous (I will be doing)"),
    ("B1", "Relative Clauses (who, which, that)"),
    ("B1", "Articles (zero article, a/an, the)"),
    ("B1", "Too/Enough"),
    ("B1", "Reported Speech (statements, questions)"),
    ("B1", "Tag Questions (You’re coming, aren’t you?)"),
    
    # B2 Intermediate
    ("B2", "Past Perfect Continuous (focus on longer actions in the past before another event)"),
    ("B2", "Third Conditional (if + past perfect, would have + past participle)"),
    ("B2", "Mixed Conditionals (combining different conditionals, e.g., If I had studied, I would be rich now)"),
    ("B2", "Passive Voice (all tenses)"),
    ("B2", "Causatives (have/get something done)"),
    ("B2", "Wish/If Only (expressing regret or wishes for present/past)"),
    ("B2", "Future Perfect (I will have done)"),
    ("B2", "Future Perfect Continuous (I will have been doing)"),
    ("B2", "Modals of Deduction (must, might, could, can’t)"),
    ("B2", "Gerunds and Infinitives (advanced usage, e.g., stop to do vs stop doing)"),
    ("B2", "Relative Clauses (defining vs. non-defining)"),
    ("B2", "Conditionals in the past"),
    ("B2", "Indirect Questions (e.g., Can you tell me where she is?)"),
    ("B2", "Inversion in Conditionals (Had I known...)"),
    ("B2", "Adverb Clauses (time, contrast, condition)"),
    
    # C1 Upper-Intermediate
    ("C1", "Advanced Modal Verbs (speculating about the past, e.g., must have, can’t have)"),
    ("C1", "Advanced Conditionals (different types combined)"),
    ("C1", "Inversion with Negative Adverbials (e.g., Never have I seen such a thing!)"),
    ("C1", "Emphatic Structures (It was John who..., What I need is...)"),
    ("C1", "Past Modals (must have, should have, could have, etc.)"),
    ("C1", "Phrasal Verbs (separable and inseparable, context-specific usage)"),
    ("C1", "Collocations (with verbs, nouns, adjectives)"),
    ("C1", "Complex Passive Forms (e.g., He was believed to have left)."),
    ("C1", "Reported Speech (advanced, reporting questions and modals)"),
    ("C1", "Ellipsis and Substitution (e.g., I hope so, If not)"),
    ("C1", "Linking Words and Conjunctions (although, however, despite, etc.)"),
    ("C1", "Noun Clauses (e.g., What he said was interesting)"),
    
    # C2 Advanced
    ("C2", "Advanced Phrasal Verbs (non-literal meanings)"),
    ("C2", "Subjunctive Mood (It is vital that he be present.)"),
    ("C2", "Complex Inversions (Not only... but also, etc.)"),
    ("C2", "Future in the Past (was going to, would)"),
    ("C2", "Advanced Conditionals (all mixed forms)"),
    ("C2", "Nominalization (Turning verbs and adjectives into nouns)"),
    ("C2", "Advanced Passive Structures (e.g., It is thought to have been...)"),
    ("C2", "Advanced Tenses (e.g., By the time she arrives, we will have been waiting for an hour)"),
    ("C2", "Relative Pronouns Omission (The book [which] I read...)"),
    ("C2", "Discourse Markers (advanced transition words and phrases)"),
    ("C2", "Cleft Sentences (It was... who/that; What I don’t like is...)"),
    ("C2", "Hedging (softening statements, e.g., It seems that, I would argue that)"),
    ("C2", "Concessive Clauses (Even though, despite the fact that)"),
    ("C2", "Metaphorical Language (e.g., idiomatic expressions)"),
    ("C2", "Conditionals with \"Were to\" (If he were to ask...)")
]

def seed_db():
    alter_table()
    db = SessionMaster()
    try:
        # Check if already seeded
        existing = db.query(GrammarTopic).count()
        if existing > 0:
            print(f"Database already has {existing} topics.")
            # Clear them for testing
            db.query(GrammarTopic).delete()
            db.commit()
            print("Cleared existing topics.")
            
        for level, title in topics:
            topic = GrammarTopic(
                title=title,
                level=level,
                explanation="",
                is_published=False
            )
            db.add(topic)
            
        db.commit()
        print(f"Successfully seeded {len(topics)} grammar topics!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
