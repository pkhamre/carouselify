import sqlite3
import sys

DB_PATH = "/app/data/carouselify.db"

def run_migration():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("PRAGMA table_info(carousel)")
    columns = [row[1] for row in cursor.fetchall()]

    if "showcased" not in columns:
        cursor.execute("ALTER TABLE carousel ADD COLUMN showcased BOOLEAN NOT NULL DEFAULT 0")
        print("+ showcased")
    else:
        print("  showcased (already exists)")

    if "showcase_author" not in columns:
        cursor.execute("ALTER TABLE carousel ADD COLUMN showcase_author VARCHAR(100)")
        print("+ showcase_author")
    else:
        print("  showcase_author (already exists)")

    if "showcase_submitted" not in columns:
        cursor.execute("ALTER TABLE carousel ADD COLUMN showcase_submitted DATETIME")
        print("+ showcase_submitted")
    else:
        print("  showcase_submitted (already exists)")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    run_migration()
