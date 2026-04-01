import uuid
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

url = os.getenv("DATABASE_URL")
conn = psycopg2.connect(url)
cur = conn.cursor()

categories = [
    ("Electronics", "Phones, laptops, gadgets and accessories"),
    ("Fashion", "Clothing, shoes, bags and accessories"),
    ("Home & Garden", "Furniture, decor, kitchen and garden"),
    ("Vehicles", "Cars, motorcycles, trucks and parts"),
    ("Health & Beauty", "Skincare, makeup, wellness products"),
    ("Sports & Outdoors", "Fitness, camping, sports equipment"),
    ("Books & Media", "Books, movies, music and games"),
    ("Food & Groceries", "Fresh produce, packaged foods, beverages"),
    ("Services", "Professional and personal services"),
    ("Others", "Everything else"),
]

for name, desc in categories:
    cur.execute(
        "INSERT INTO categories (id, name, description) VALUES (%s, %s, %s) ON CONFLICT DO NOTHING",
        (str(uuid.uuid4()), name, desc),
    )

conn.commit()

cur.execute("SELECT name FROM categories ORDER BY name")
rows = cur.fetchall()
print(f"Seeded {len(rows)} categories:")
for r in rows:
    print(f"  - {r[0]}")

cur.close()
conn.close()
