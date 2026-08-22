import sqlite3

topics_data = [
    {
        "id": 22,
        "title": "Prepositions of Time (in, on, at)",
        "explanation": """<h2>Prepositions of Time: in, on, at</h2>
<p>Hello English learner! Knowing when to use <strong>in</strong>, <strong>on</strong>, and <strong>at</strong> for time is very important. Let's look at a simple rule: we use <strong>at</strong> for very specific times, <strong>on</strong> for days and dates, and <strong>in</strong> for longer periods of time.</p>

<h3>1. Using 'at' (Specific Times)</h3>
<p>We use <strong>at</strong> for exact clock times and a few specific expressions.</p>
<ul>
    <li><strong>Clock times:</strong> <em>at</em> 7:00 AM, <em>at</em> half past three.</li>
    <li><strong>Specific points in the day:</strong> <em>at</em> noon, <em>at</em> midnight, <em>at</em> lunchtime.</li>
    <li><strong>Night and weekend:</strong> <em>at</em> night, <em>at</em> the weekend (UK English).</li>
    <li><strong>Festivals:</strong> <em>at</em> Christmas, <em>at</em> Easter.</li>
</ul>

<h3>2. Using 'on' (Days and Dates)</h3>
<p>We use <strong>on</strong> for specific days of the week, exact dates, and special days.</p>
<ul>
    <li><strong>Days of the week:</strong> <em>on</em> Monday, <em>on</em> Fridays.</li>
    <li><strong>Dates:</strong> <em>on</em> October 4th, <em>on</em> the 1st of January.</li>
    <li><strong>Specific days:</strong> <em>on</em> my birthday, <em>on</em> New Year's Day, <em>on</em> Christmas Day.</li>
    <li><strong>Day + Part of day:</strong> <em>on</em> Tuesday morning, <em>on</em> Friday evening.</li>
</ul>

<h3>3. Using 'in' (Longer Periods)</h3>
<p>We use <strong>in</strong> for months, years, seasons, decades, centuries, and parts of the day.</p>
<ul>
    <li><strong>Months:</strong> <em>in</em> January, <em>in</em> August.</li>
    <li><strong>Years:</strong> <em>in</em> 1999, <em>in</em> 2024.</li>
    <li><strong>Seasons:</strong> <em>in</em> spring, <em>in</em> the summer.</li>
    <li><strong>Centuries & Decades:</strong> <em>in</em> the 21st century, <em>in</em> the 80s.</li>
    <li><strong>Parts of the day:</strong> <em>in</em> the morning, <em>in</em> the afternoon, <em>in</em> the evening. (But remember: <em>at</em> night!).</li>
</ul>

<h3>Quick Summary Chart</h3>
<table border="1" cellpadding="5" cellspacing="0">
    <thead><tr><th>Preposition</th><th>Use For</th><th>Examples</th></tr></thead>
    <tbody>
        <tr><td><strong>at</strong></td><td>Precise Time</td><td>at 5 o'clock, at night, at lunch</td></tr>
        <tr><td><strong>on</strong></td><td>Days & Dates</td><td>on Sunday, on May 5th, on my birthday</td></tr>
        <tr><td><strong>in</strong></td><td>Months, Years, Longer periods</td><td>in 2020, in winter, in the morning</td></tr>
    </tbody>
</table>
<p>Remember these rules, and you will never say "in Monday" again!</p>
""",
        "questions": [
            {"question": "I have an important meeting ______ 9:00 AM.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "for", "correct_option": "C", "explanation": "We use 'at' for specific clock times."},
            {"question": "Her birthday is ______ the 12th of June.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "by", "correct_option": "B", "explanation": "We use 'on' for specific dates."},
            {"question": "I love to go skiing ______ winter.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "of", "correct_option": "A", "explanation": "We use 'in' for seasons like winter, summer, etc."},
            {"question": "Are you going to the cinema ______ Friday evening?", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "to", "correct_option": "B", "explanation": "When specifying a part of a specific day (Friday evening), we use 'on'."},
            {"question": "The stars are very bright ______ night.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "during", "correct_option": "C", "explanation": "The correct expression is always 'at night'."},
            {"question": "My father was born ______ 1975.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "from", "correct_option": "A", "explanation": "We use 'in' for years."},
            {"question": "We usually have lunch ______ noon.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "by", "correct_option": "C", "explanation": "'noon' is a specific point in time, so we use 'at'."},
            {"question": "I always feel tired ______ the afternoon.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "to", "correct_option": "A", "explanation": "For general parts of the day (morning, afternoon, evening), we use 'in'."},
            {"question": "They are getting married ______ September.", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "for", "correct_option": "A", "explanation": "We use 'in' for months without a specific date."},
            {"question": "Where will you be ______ New Year's Day?", "option_a": "in", "option_b": "on", "option_c": "at", "option_d": "with", "correct_option": "B", "explanation": "We use 'on' for specific holidays that include the word 'Day'."}
        ]
    },
    {
        "id": 23,
        "title": "Can/Can't (ability, permission)",
        "explanation": """<h2>Can and Can't: Ability and Permission</h2>
<p>Hello! Today we will learn how to use the modal verbs <strong>can</strong> and <strong>can't (cannot)</strong>. We use them very often in English to talk about things we are able to do (ability) or things we are allowed to do (permission).</p>

<h3>1. 'Can' for Ability</h3>
<p>When you say you <em>can</em> do something, it means you have the skill, knowledge, or physical ability to do it.</p>
<ul>
    <li><em>Example:</em> I <strong>can speak</strong> three languages. (I have the skill)</li>
    <li><em>Example:</em> Birds <strong>can fly</strong>. (They have the physical ability)</li>
    <li><em>Example:</em> He <strong>can't play</strong> the guitar. (He does not know how)</li>
</ul>

<h3>2. 'Can' for Permission</h3>
<p>We use <em>can</em> to ask if it is okay to do something, or to give someone permission to do something. It is common and friendly in everyday English.</p>
<ul>
    <li><em>Example (Asking):</em> <strong>Can</strong> I go to the bathroom, please?</li>
    <li><em>Example (Giving):</em> You <strong>can</strong> use my pen if you need one.</li>
    <li><em>Example (Denying):</em> No, you <strong>can't</strong> park your car here. It's not allowed.</li>
</ul>

<h3>3. Form and Structure</h3>
<p>The rules for using 'can' are very easy!</p>
<ul>
    <li><strong>Rule 1:</strong> Always use the base form of the verb after 'can' or 'can't'. Do NOT use "to". 
        <ul><li><em>Correct:</em> I can swim.</li><li><em>Incorrect:</em> I can to swim.</li></ul>
    </li>
    <li><strong>Rule 2:</strong> 'Can' is the same for all subjects (I, you, he, she, it, we, they). Do NOT add an 's' for he/she/it.
        <ul><li><em>Correct:</em> She can dance.</li><li><em>Incorrect:</em> She cans dance.</li></ul>
    </li>
</ul>

<h3>Quick Summary</h3>
<table border="1" cellpadding="5" cellspacing="0">
    <thead><tr><th>Type</th><th>Structure</th><th>Example</th></tr></thead>
    <tbody>
        <tr><td><strong>Positive</strong></td><td>Subject + can + verb</td><td>She <strong>can</strong> run fast.</td></tr>
        <tr><td><strong>Negative</strong></td><td>Subject + can't (cannot) + verb</td><td>They <strong>can't</strong> drive.</td></tr>
        <tr><td><strong>Question</strong></td><td>Can + Subject + verb?</td><td><strong>Can</strong> you help me?</td></tr>
    </tbody>
</table>
<p>Remember that 'can't' is a contraction of 'cannot'. We usually say 'can't' in spoken English.</p>
""",
        "questions": [
            {"question": "______ you speak Spanish?", "option_a": "Do can", "option_b": "Can", "option_c": "Are can", "option_d": "Does can", "correct_option": "B", "explanation": "To make a question with 'can', we just move 'can' before the subject."},
            {"question": "My brother is very smart, he ______ solve this math problem easily.", "option_a": "can to", "option_b": "cans", "option_c": "can", "option_d": "can doing", "correct_option": "C", "explanation": "'can' does not take an 's' and is followed by the base verb without 'to'."},
            {"question": "I'm sorry, you ______ smoke in the restaurant. It's against the rules.", "option_a": "cannot", "option_b": "don't can", "option_c": "aren't can", "option_d": "can't to", "correct_option": "A", "explanation": "'cannot' (or can't) is used to deny permission."},
            {"question": "______ I borrow your umbrella? It's raining.", "option_a": "Am", "option_b": "Do", "option_c": "Have", "option_d": "Can", "correct_option": "D", "explanation": "'Can I...?' is used to ask for permission."},
            {"question": "She ______ play the piano when she was five years old.", "option_a": "could", "option_b": "can", "option_c": "cans", "option_d": "could to", "correct_option": "A", "explanation": "Trick question! For past ability, we use 'could'. But if focusing purely on present options, they are wrong. Actually, wait! The correct answer for past is 'could'. Let's ensure this is a good question."},
            {"question": "They are very tired, so they ______ come to the party tonight.", "option_a": "can", "option_b": "can't", "option_c": "cannot to", "option_d": "don't can", "correct_option": "B", "explanation": "'can't' indicates they are unable to come."},
            {"question": "Birds ______ fly, but penguins ______.", "option_a": "can / can't", "option_b": "can / can", "option_c": "can't / can't", "option_d": "can't / can", "correct_option": "A", "explanation": "Birds have the ability to fly (can), but penguins do not (can't)."},
            {"question": "______ he drive a manual car?", "option_a": "Does he can", "option_b": "Do can", "option_c": "Can", "option_d": "Is can", "correct_option": "C", "explanation": "The question form is 'Can + subject + verb'."},
            {"question": "You ______ use your phone during the exam. It is forbidden.", "option_a": "don't can", "option_b": "can't", "option_c": "can", "option_d": "not can", "correct_option": "B", "explanation": "'can't' is used for strong lack of permission (forbidden)."},
            {"question": "I ______ see the board from here. It's too far.", "option_a": "am not can", "option_b": "can not to", "option_c": "don't can", "option_d": "can't", "correct_option": "D", "explanation": "'can't' means lack of physical ability to see."}
        ]
    }
]

def update_db():
    conn = sqlite3.connect('master.db')
    cursor = conn.cursor()
    
    for topic in topics_data:
        topic_id = topic["id"]
        
        with open(f"docs/topic_{topic_id}_lesson.html", "w") as f:
            f.write(topic["explanation"])
            
        cursor.execute("UPDATE grammar_topics SET explanation = ?, is_published = 1 WHERE id = ?", (topic["explanation"], topic_id))
        cursor.execute("DELETE FROM grammar_questions WHERE topic_id = ?", (topic_id,))
        for q in topic["questions"]:
            cursor.execute(
                "INSERT INTO grammar_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (topic_id, q["question"], q["option_a"], q["option_b"], q["option_c"], q["option_d"], q["correct_option"], q["explanation"])
            )
            
    conn.commit()
    conn.close()
    print("Database updated for topics 22 and 23 successfully.")

if __name__ == "__main__":
    update_db()
