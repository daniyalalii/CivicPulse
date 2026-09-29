"""
clear_db.py — Utility to clear all complaint rows from civicpulse_dev.db without deleting the database file.
Usage:
    python scripts/clear_db.py
"""
import sqlite3
import os

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "civicpulse_dev.db"))

def clear_data():
    if not os.path.exists(DB_PATH):
        print(f"[!] Database file not found at: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM complaints")
        conn.commit()
        print(f"[OK] Cleared all complaints data from {DB_PATH}. Table schema is intact.")
    except Exception as e:
        print(f"[ERROR] Failed to clear data: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    clear_data()
