from flask import Flask, render_template, jsonify, request, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3

app = Flask(__name__)
app.secret_key = "super_secret_key_change_this"

DATABASE = "pokemon.db"



# --- Helper function to connect to SQLite ---
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # allows dict-like access
    return conn

@app.route("/save_tierlist", methods=["POST"])
def save_tierlist():
    if "user_id" not in session:
        return jsonify({"error": "not logged in"}), 401

    data = request.json.get("tierlist")
    if not data:
        return jsonify({"error": "no data"}), 400

    conn = get_db_connection()

    conn.execute("""
        INSERT INTO tierlists (user_id, data)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET data = excluded.data
    """, (session["user_id"], data))

    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/get_tierlist")
def get_tierlist():
    if "user_id" not in session:
        return jsonify({"tierlist": None})

    conn = get_db_connection()
    row = conn.execute("SELECT data FROM tierlists WHERE user_id = ?",
                       (session["user_id"],)).fetchone()
    conn.close()

    return jsonify({"tierlist": row["data"] if row else None})


# --- Home page ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gen/<int:gen>')
def gen_page(gen):
    return render_template('gen.html', gen=gen)

# --- API endpoint: Get Pokémon by generation ---
@app.route('/api/pokemon')
def get_pokemon():
    gen = request.args.get('gen', default=None, type=int)
    conn = get_db_connection()
    
    query = """
        SELECT p.id, p.name, p.sprite_url,
               COALESCE(r.rank, 0) AS rank,
               COALESCE(r.position, 0) AS position
        FROM pokemon p
        LEFT JOIN rankings r
          ON p.id = r.pokemon_id AND r.list_id = 1
    """
    
    params = []
    if gen not in (None, 0):
        query += " WHERE p.generation = ?"
        params.append(gen)

    query += " ORDER BY p.id"

    pokemons = conn.execute(query, params).fetchall()
    conn.close()

    pokemon_list = [
        {
            "id": p["id"],
            "name": p["name"],
            "sprite_url": p["sprite_url"],  # just the URL
            "rank": p["rank"],
            "position": p["position"]
        }
        for p in pokemons
    ]

    return jsonify(pokemon_list)




if __name__ == '__main__':
    app.run(debug=True)
