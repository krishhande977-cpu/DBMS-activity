import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:@localhost:3306/medicare_hospital"
)

# Standardize database protocol for SQLAlchemy PyMySQL dialect
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

connect_args = {}

# Enable SSL for cloud MySQL providers (TiDB Cloud, Aiven, Railway, etc.)
use_ssl = (
    "tidbcloud" in DATABASE_URL
    or "aivencloud" in DATABASE_URL
    or "ssl=true" in DATABASE_URL.lower()
    or os.getenv("DB_SSL", "").lower() in ("true", "1", "yes")
)

if use_ssl:
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ctx

# Enable pre-ping and pool recycle to prevent dropped idle connections on cloud hosts
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
