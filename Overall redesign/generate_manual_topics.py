import sqlite3
import json
import os

topics_data = [
    {
        "id": 20,
        "title": "Present Perfect (with ever, never, just, already, yet)",
        "explanation": """<h2>Present Perfect: ever, never, just, already, yet</h2>
<p>Hello, English learner! Today we'll talk about the <strong>Present Perfect</strong> tense, specifically focusing on five very important adverbs: <em>ever, never, just, already, and yet</em>.</p>

<h3>What is the Present Perfect?</h3>
<p>We form the Present Perfect with <strong>have/has + past participle (verb 3)</strong>. We use it to connect the past and the present. When we use <em>ever, never, just, already,</em> and <em>yet</em>, we are usually talking about life experiences up to now, or recent actions.</p>

<h3>1. Ever and Never (Life Experiences)</h3>
<p>We use <strong>ever</strong> and <strong>never</strong> to talk about our experiences from birth until right now. We don't say <em>when</em> it happened.</p>
<ul>
    <li><strong>Ever</strong> means 'at any time in your life'. We mostly use it in questions. It goes <em>before</em> the past participle.
        <ul><li><em>Example:</em> Have you <strong>ever</strong> eaten sushi?</li></ul>
    </li>
    <li><strong>Never</strong> means 'at no time in your life'. We use it in positive sentences (but it gives a negative meaning). It goes <em>before</em> the past participle.
        <ul><li><em>Example:</em> I have <strong>never</strong> been to Paris.</li></ul>
    </li>
</ul>

<h3>2. Just (Very Recent Actions)</h3>
<p>We use <strong>just</strong> to describe an action that happened a very short time ago (a few minutes or moments ago). It goes <em>between</em> have/has and the past participle.</p>
<ul>
    <li><em>Example:</em> We have <strong>just</strong> finished dinner. (We finished maybe 5 minutes ago)</li>
    <li><em>Example:</em> He has <strong>just</strong> left the building.</li>
</ul>

<h3>3. Already (Sooner Than Expected)</h3>
<p>We use <strong>already</strong> to say that something happened sooner than we thought it would. We usually use it in positive sentences. It goes <em>between</em> have/has and the past participle (or sometimes at the end of the sentence).</p>
<ul>
    <li><em>Example:</em> "Don't forget to pay the bill." -> "I have <strong>already</strong> paid it."</li>
    <li><em>Example:</em> She is only 15, but she has <strong>already</strong> written a book!</li>
</ul>

<h3>4. Yet (Waiting for Something)</h3>
<p>We use <strong>yet</strong> to show that we are expecting something to happen. It means 'until now'. We use it in <strong>negative sentences</strong> and <strong>questions</strong>. It almost always goes at the <strong>end</strong> of the sentence.</p>
<ul>
    <li><em>Negative:</em> I haven't finished my homework <strong>yet</strong>. (But I will finish it soon)</li>
    <li><em>Question:</em> Has the train arrived <strong>yet</strong>?</li>
</ul>

<h3>Quick Summary</h3>
<table border="1" cellpadding="5" cellspacing="0">
    <thead>
        <tr>
            <th>Word</th>
            <th>When to use</th>
            <th>Position</th>
            <th>Example</th>
        </tr>
    </thead>
    <tbody>
        <tr><td><strong>Ever</strong></td><td>Questions (life experience)</td><td>Before past participle</td><td>Have you <strong>ever</strong> flown?</td></tr>
        <tr><td><strong>Never</strong></td><td>Negative meaning (0 times)</td><td>Before past participle</td><td>I have <strong>never</strong> flown.</td></tr>
        <tr><td><strong>Just</strong></td><td>Very short time ago</td><td>Between have/has and verb 3</td><td>She has <strong>just</strong> arrived.</td></tr>
        <tr><td><strong>Already</strong></td><td>Sooner than expected</td><td>Between have/has and verb 3</td><td>I have <strong>already</strong> done it.</td></tr>
        <tr><td><strong>Yet</strong></td><td>Questions & Negatives (expecting)</td><td>End of the sentence</td><td>Are you ready <strong>yet</strong>?</td></tr>
    </tbody>
</table>
<p>Practice using these words to sound more natural when speaking about your past experiences and recent actions!</p>
""",
        "questions": [
            {
                "question": "Have you ______ been to London?",
                "option_a": "never",
                "option_b": "ever",
                "option_c": "just",
                "option_d": "yet",
                "correct_option": "B",
                "explanation": "'Ever' is used in questions to ask about life experiences."
            },
            {
                "question": "I don't want to see that movie. I have ______ seen it three times.",
                "option_a": "yet",
                "option_b": "just",
                "option_c": "already",
                "option_d": "ever",
                "correct_option": "C",
                "explanation": "'Already' is used because the action happened sooner or more times than expected."
            },
            {
                "question": "She can't come to the phone. She has ______ gone out.",
                "option_a": "just",
                "option_b": "yet",
                "option_c": "ever",
                "option_d": "already",
                "correct_option": "A",
                "explanation": "'Just' implies she left a very short time ago."
            },
            {
                "question": "I am so hungry. I haven't eaten anything ______.",
                "option_a": "already",
                "option_b": "just",
                "option_c": "never",
                "option_d": "yet",
                "correct_option": "D",
                "explanation": "'Yet' is used at the end of negative sentences for expected actions."
            },
            {
                "question": "My brother has ______ eaten octopus. He refuses to try it.",
                "option_a": "ever",
                "option_b": "never",
                "option_c": "already",
                "option_d": "yet",
                "correct_option": "B",
                "explanation": "'Never' gives a negative meaning, meaning zero times in his life."
            },
            {
                "question": "Has the postman delivered the letters ______?",
                "option_a": "just",
                "option_b": "already",
                "option_c": "yet",
                "option_d": "never",
                "correct_option": "C",
                "explanation": "In questions asking if an expected event has happened until now, we use 'yet' at the end."
            },
            {
                "question": "You don't need to wash the dishes. I have ______ washed them.",
                "option_a": "yet",
                "option_b": "ever",
                "option_c": "just",
                "option_d": "already",
                "correct_option": "D",
                "explanation": "'Already' shows the action is complete."
            },
            {
                "question": "He has ______ passed his driving test! He told me 5 minutes ago.",
                "option_a": "just",
                "option_b": "yet",
                "option_c": "ever",
                "option_d": "never",
                "correct_option": "A",
                "explanation": "Because it happened 5 minutes ago, 'just' is the best choice."
            },
            {
                "question": "Have you ______ met a famous person in your life?",
                "option_a": "yet",
                "option_b": "already",
                "option_c": "just",
                "option_d": "ever",
                "correct_option": "D",
                "explanation": "'Ever' asks about experience 'at any time in your life'."
            },
            {
                "question": "They haven't finished building the new house ______.",
                "option_a": "already",
                "option_b": "yet",
                "option_c": "just",
                "option_d": "never",
                "correct_option": "B",
                "explanation": "'Yet' is at the end of negative sentences indicating an uncompleted but expected action."
            }
        ]
    }
]

def update_db():
    conn = sqlite3.connect('master.db')
    cursor = conn.cursor()
    
    for topic in topics_data:
        topic_id = topic["id"]
        
        # Save HTML file
        with open(f"docs/topic_{topic_id}_lesson.html", "w") as f:
            f.write(topic["explanation"])
            
        # Update topic explanation and publish status
        cursor.execute("UPDATE grammar_topics SET explanation = ?, is_published = 1 WHERE id = ?", (topic["explanation"], topic_id))
        
        # Delete old dummy questions
        cursor.execute("DELETE FROM grammar_questions WHERE topic_id = ?", (topic_id,))
        
        # Insert new questions
        for q in topic["questions"]:
            cursor.execute(
                "INSERT INTO grammar_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (topic_id, q["question"], q["option_a"], q["option_b"], q["option_c"], q["option_d"], q["correct_option"], q["explanation"])
            )
            
    conn.commit()
    conn.close()
    print("Database updated successfully.")

if __name__ == "__main__":
    update_db()
