from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE ----------------
def init_db():
    conn = sqlite3.connect("messages.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Portfolio Backend Running ✅"


# ---------------- CONTACT ROUTE ----------------
@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    conn = sqlite3.connect("messages.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
        (name, email, message)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Message saved successfully ✅"})


# ---------------- VIEW MESSAGES ROUTE (NEW) ----------------
@app.route("/messages")
def view_messages():
    conn = sqlite3.connect("messages.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM contact_messages")
    rows = cursor.fetchall()

    conn.close()

    return jsonify(rows)


# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)