from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# -----------------------------------
# DATABASE SETUP (runs when app starts)
# -----------------------------------
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

# initialize database
init_db()


# -----------------------------------
# HOME ROUTE
# -----------------------------------
@app.route("/")
def home():
    return "Portfolio Backend Running ✅"


# -----------------------------------
# CONTACT FORM API
# -----------------------------------
@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data received"}), 400

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email:
        return jsonify({"message": "Name and Email required"}), 400

    # Save to database
    conn = sqlite3.connect("messages.db")
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
        (name, email, message)
    )

    conn.commit()
    conn.close()

    print("\n📩 New Message Saved:")
    print(name, email, message)

    return jsonify({
        "status": "success",
        "message": f"Thanks {name}! Message received ✅"
    })


# -----------------------------------
# RUN SERVER
# -----------------------------------
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)