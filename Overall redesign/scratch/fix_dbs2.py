import sqlite3
import glob
import os
import sys

sys.path.append(os.path.abspath('.'))
from database import Base

dbs = glob.glob('*.db') + glob.glob('database_tenants/*.db')
for db in dbs:
    print(f"Fixing {db}")
    conn = sqlite3.connect(db)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE weekly_performance ADD COLUMN homework INTEGER")
        print("  Added homework to weekly_performance")
    except sqlite3.OperationalError as e:
        print(f"  weekly_performance alt: {e}")
    
    try:
        from sqlalchemy import create_engine
        engine = create_engine(f"sqlite:///{db}")
        Base.metadata.create_all(bind=engine)
        print("  Created missing tables via SQLAlchemy")
    except Exception as e:
        print(f"  SQLAlchemy create_all: {e}")
        
    conn.commit()
    conn.close()

