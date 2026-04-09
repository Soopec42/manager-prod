from collections.abc import Generator
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from sqlalchemy import create_engine
from typing import Annotated
from app.core.config import setting
from fastapi import Depends

class Base(DeclarativeBase):
    pass

engine = create_engine(
    setting.DATABASE_URL,
    echo=False
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False
)

def create_db_and_tables() -> None:
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DBSession = Annotated[Session, Depends(get_db)]
