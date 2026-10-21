import os
import logging
from sqlalchemy import text
from app.database.connection import engine, Base, SessionLocal
from app.models.models import User, Department

logger = logging.getLogger("medicare.init_db")


def find_sql_file(filename: str) -> str:
    """Find SQL file in various possible locations."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(current_dir, "sql", filename),
        os.path.join(current_dir, "..", "..", "..", "database", filename),
        os.path.join(os.getcwd(), "database", filename),
        os.path.join(os.getcwd(), "medi-care-hospital-management", "database", filename),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    raise FileNotFoundError(f"Could not find {filename} in any search path: {candidates}")


def execute_sql_file(session, file_path: str):
    """Execute raw SQL file statements line-by-line while ignoring comments and database switches."""
    logger.info(f"Executing SQL file: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    cleaned_lines = []
    for line in content.splitlines():
        trimmed = line.strip()
        if trimmed.startswith("--") or trimmed.startswith("/*"):
            continue
        # Strip USE or CREATE DATABASE commands since cloud DB name is assigned
        if trimmed.upper().startswith("USE ") or trimmed.upper().startswith("CREATE DATABASE"):
            continue
        cleaned_lines.append(line)

    full_sql = "\n".join(cleaned_lines)
    statements = [stmt.strip() for stmt in full_sql.split(";") if stmt.strip()]

    for stmt in statements:
        if not stmt:
            continue
        try:
            session.execute(text(stmt))
        except Exception as e:
            logger.warning(f"Statement notice ({stmt[:60]}...): {e}")
    session.commit()


def initialize_database():
    """
    Ensure all tables, views, and initial seed data exist in the database.
    Safe to run repeatedly (idempotent).
    """
    logger.info("Checking database tables...")
    # 1. Create all ORM tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # 2. Check if database has users/data
    with SessionLocal() as session:
        try:
            user_count = session.query(User).count()
        except Exception:
            user_count = 0

        if user_count == 0:
            logger.info("Database is empty. Seeding initial hospital data...")
            try:
                seed_file = find_sql_file("seed.sql")
                execute_sql_file(session, seed_file)
                logger.info("Seed data loaded successfully!")
            except Exception as e:
                logger.error(f"Error seeding data: {e}", exc_info=True)

        # 3. Always ensure Views are created/updated
        logger.info("Creating / updating MySQL views...")
        try:
            views_file = find_sql_file("views.sql")
            execute_sql_file(session, views_file)
            logger.info("Database views ensured successfully!")
        except Exception as e:
            logger.warning(f"Error updating views: {e}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_database()
    print("Database initialization complete!")
