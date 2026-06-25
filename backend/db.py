import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is required and should be a PostgreSQL URL, for example: "
        "postgresql+psycopg[binary]://user:password@host:5432/dbname"
    )

# echo=False for production; set True for debugging
engine = create_engine(DATABASE_URL, echo=False)


def get_session():
    with Session(engine) as session:
        yield session
