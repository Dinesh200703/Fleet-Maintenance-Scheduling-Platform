import os
from dotenv import load_dotenv

import pymysql
pymysql.install_as_MySQLdb()

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 🔥 FORCE correct .env path
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

DATABASE_URL=os.getenv("DATABASE_URL")

print("FINAL DB URL:",DATABASE_URL)

engine=create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal=sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()