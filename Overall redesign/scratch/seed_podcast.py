import sys, os
sys.path.append(os.path.abspath('.'))

from master_database import SessionMaster, LibraryBook

db = SessionMaster()
existing = db.query(LibraryBook).filter_by(title="Margaret Thatcher - Iron Lady").first()

if not existing:
    ab = LibraryBook(
        title="Margaret Thatcher - Iron Lady",
        author="Liberum Original Podcasts",
        level="B2",
        book_type="podcast",
        cover_url="https://upload.wikimedia.org/wikipedia/commons/3/3f/Margaret_Thatcher_portrait.jpg",
        description="Episode 12. A deep dive into the life and legacy of the Iron Lady.",
        file_url=""
    )
    db.add(ab)
    db.commit()
    print("Added podcast.")
