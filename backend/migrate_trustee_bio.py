"""Add bio column to trusteeprofile table"""
import os
from dotenv import load_dotenv
from sqlalchemy import text, inspect
from sqlmodel import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required")

engine = create_engine(DATABASE_URL, echo=False)

with engine.connect() as conn:
    inspector = inspect(engine)
    cols = [c["name"] for c in inspector.get_columns("trusteeprofile")]
    if "bio" not in cols:
        conn.execute(text("ALTER TABLE trusteeprofile ADD COLUMN bio TEXT"))
        conn.commit()
        print("Added bio column")
    else:
        print("bio column already exists")
