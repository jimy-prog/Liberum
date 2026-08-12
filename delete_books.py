from master_database import SessionMaster, LibraryBook

def delete_all_books():
    db = SessionMaster()
    try:
        deleted = db.query(LibraryBook).delete()
        db.commit()
        print(f"Deleted {deleted} books.")
    finally:
        db.close()

if __name__ == "__main__":
    delete_all_books()
