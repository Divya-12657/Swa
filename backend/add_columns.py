# """Add description and created_at columns to activity table if they don't exist"""
# import os
# from dotenv import load_dotenv
# from sqlalchemy import text, inspect
# from sqlmodel import create_engine

# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")
# if not DATABASE_URL:
#     raise RuntimeError("DATABASE_URL is required")

# engine = create_engine(DATABASE_URL, echo=False)

# def add_missing_columns():
#     """Add missing columns to activity table"""
#     with engine.connect() as conn:
#         inspector = inspect(engine)
#         cols = [c["name"] for c in inspector.get_columns("activity")]
        
#         if "description" not in cols:
#             print("Adding 'description' column...")
#             conn.execute(text("ALTER TABLE activity ADD COLUMN description TEXT"))
#             conn.commit()
#             print("✅ Added description column")
#         else:
#             print("✅ description column already exists")
        
#         if "created_at" not in cols:
#             print("Adding 'created_at' column...")
#             conn.execute(text("ALTER TABLE activity ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
#             conn.commit()
#             print("✅ Added created_at column")
#         else:
#             print("✅ created_at column already exists")

# if __name__ == '__main__':
#     add_missing_columns()
#     print("\n✅ Database migration complete!")


from db import engine
from sqlmodel import Session, select
from models import Activity

with Session(engine) as session:
    activities = session.exec(select(Activity)).all()
    
    print("Activities with issues:")
    print("-" * 60)
    for a in activities:
        if not a.image_url:
            print(f"❌ NO IMAGE: {a.title[:40]}")
        elif a.image_url.startswith('https://uploads-ssl.webflow.com'):
            print(f"⚠️  WEBFLOW: {a.title[:40]}")
        elif a.image_url.startswith('https://swabhimaan.s3'):
            print(f"✅ S3: {a.title[:40]}")
        else:
            print(f"❓ OTHER: {a.title[:40]} - {a.image_url[:50]}")
