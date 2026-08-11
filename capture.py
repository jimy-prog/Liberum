import asyncio
import os
from playwright.async_api import async_playwright

from master_database import SessionMaster, User
from auth import create_session

OUT_DIR = "/Users/jamshidmahkamov/.gemini/antigravity/brain/f3ca55a5-e241-4769-a985-3345585f8615"

def get_session_token(username):
    db = SessionMaster()
    user = db.query(User).filter_by(username=username).first()
    if not user:
        return None
    token = create_session(user.id)
    db.close()
    return token

async def capture():
    teacher_token = get_session_token("teacher_demo1")
    student_token = get_session_token("student_demo1")
    
    if not teacher_token or not student_token:
        print("Could not generate tokens")
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # --- TEACHER ---
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        await context.add_cookies([{
            'name': 'liberum_session',
            'value': teacher_token,
            'domain': 'localhost',
            'path': '/'
        }])
        page = await context.new_page()
        
        await page.goto("http://localhost:8000/dashboard")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUT_DIR, "teacher_dashboard.png"))
        
        await page.goto("http://localhost:8000/classes")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUT_DIR, "teacher_classes.png"))
        
        await context.close()
        
        # --- STUDENT ---
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        await context.add_cookies([{
            'name': 'liberum_session',
            'value': student_token,
            'domain': 'localhost',
            'path': '/'
        }])
        page = await context.new_page()
        
        await page.goto("http://localhost:8000/dashboard")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUT_DIR, "student_dashboard.png"))
        
        await page.goto("http://localhost:8000/timetable")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUT_DIR, "student_timetable.png"))
        
        await page.goto("http://localhost:8000/mock/history")
        await asyncio.sleep(2)
        await page.screenshot(path=os.path.join(OUT_DIR, "student_mocks.png"))
        
        await context.close()
        await browser.close()
        print("Screenshots captured successfully!")

if __name__ == "__main__":
    asyncio.run(capture())
