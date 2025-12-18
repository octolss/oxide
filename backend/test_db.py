from sqlalchemy import create_engine, text
from app.config import get_settings

settings = get_settings()

print("Testing database connection...")
print(f"URL: {settings.database_url[:50]}...")

try:
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print("SUCCESS: Connection established!")
        print(f"PostgreSQL version: {version}")
        
        # Check tables
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result]
        print(f"\nTables in database: {', '.join(tables)}")
        
except Exception as e:
    print(f"ERROR: Connection failed: {e}")
    import traceback
    traceback.print_exc()

