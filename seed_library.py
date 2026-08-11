import os
from master_database import SessionMaster, LibraryBook, GrammarTopic, GrammarQuestion

def seed_library():
    db = SessionMaster()
    try:
        # 1. Seed Books
        books = [
            {"title": "Atomic Habits", "author": "James Clear", "type": "ebook", "level": "B2", "cover": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
            {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "type": "ebook", "level": "C1", "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
            {"title": "English Pronunciation in Use", "author": "Mark Hancock", "type": "audiobook", "level": "B1", "cover": "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
            {"title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki", "type": "ebook", "level": "B1", "cover": "https://images.unsplash.com/photo-1554415707-6e8cfc938c22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
            {"title": "To Kill a Mockingbird", "author": "Harper Lee", "type": "audiobook", "level": "C1", "cover": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
            {"title": "The Little Prince", "author": "Antoine de Saint-Exupéry", "type": "ebook", "level": "A2", "cover": "https://images.unsplash.com/photo-1542315926-407b7194f1db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
        ]
        
        print("Seeding books...")
        for b in books:
            book = db.query(LibraryBook).filter_by(title=b["title"]).first()
            if not book:
                db.add(LibraryBook(title=b["title"], author=b["author"], book_type=b["type"], level=b["level"], cover_url=b["cover"]))
            else:
                book.cover_url = b["cover"]
                
        # 2. Seed Grammar Topics and Questions
        grammar_data = [
            {
                "title": "To Be: Present (am, is, are)",
                "level": "A1",
                "explanation": "<h3>The Verb 'To Be'</h3><p>The verb <i>to be</i> is the most important verb in the English language. It is used to describe states, characteristics, and locations.</p><h4>Affirmative (Positive)</h4><ul><li>I <b>am</b> (I'm)</li><li>He / She / It <b>is</b> (He's, She's, It's)</li><li>You / We / They <b>are</b> (You're, We're, They're)</li></ul><h4>Negative</h4><ul><li>I am not (I'm not)</li><li>He is not (He isn't)</li><li>They are not (They aren't)</li></ul><p>Example: <i>I am a student. She is from London. We are happy.</i></p>",
                "questions": [
                    {
                        "q": "She _____ a doctor.",
                        "a": "am", "b": "is", "c": "are", "d": "be", "correct": "B"
                    },
                    {
                        "q": "They _____ from Spain.",
                        "a": "am", "b": "is", "c": "are", "d": "be", "correct": "C"
                    }
                ]
            },
            {
                "title": "Present Simple vs Present Continuous",
                "level": "A2",
                "explanation": "<h3>Present Simple</h3><p>We use the present simple for habits, routines, and general truths. It describes things that happen regularly.</p><p><b>Structure:</b> Subject + Verb (s/es for he/she/it)</p><p>Example: <i>She works in a bank. Water boils at 100 degrees.</i></p><hr/><h3>Present Continuous</h3><p>We use the present continuous for actions happening right now, at the moment of speaking, or temporary situations.</p><p><b>Structure:</b> Subject + am/is/are + Verb-ing</p><p>Example: <i>She is working right now. I am reading a good book this week.</i></p>",
                "questions": [
                    {
                        "q": "I _____ to work every day.",
                        "a": "go", "b": "am going", "c": "goes", "d": "have gone", "correct": "A"
                    },
                    {
                        "q": "Look! It _____ outside.",
                        "a": "rains", "b": "is raining", "c": "rain", "d": "rained", "correct": "B"
                    }
                ]
            }
        ]
        
        print("Seeding grammar topics...")
        for topic_data in grammar_data:
            topic = db.query(GrammarTopic).filter_by(title=topic_data["title"]).first()
            if not topic:
                topic = GrammarTopic(
                    title=topic_data["title"],
                    level=topic_data["level"],
                    explanation=topic_data["explanation"]
                )
                db.add(topic)
                db.flush() # get ID
                
                for q in topic_data["questions"]:
                    db.add(GrammarQuestion(
                        topic_id=topic.id,
                        question_text=q["q"],
                        option_a=q["a"],
                        option_b=q["b"],
                        option_c=q["c"],
                        option_d=q["d"],
                        correct_option=q["correct"]
                    ))
            else:
                topic.explanation = topic_data["explanation"]
                topic.level = topic_data["level"]
                    
        db.commit()
        print("Library data seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_library()
