from flask import Flask, request, render_template, redirect, session
import sqlite3
import secrets

db = sqlite3.connect("data.db", check_same_thread=False)
app = Flask(__name__)
app.secret_key = secrets.token_bytes(32)
userSession = None
def getScore (score):
    points = score.split(':')
    points = int(points[0]) * 3600 + int(points[1]) * 60 + int(points[2])
    return points
    
@app.route("/tetris", methods=["GET", "POST"])
def tetris():
    print(f"The session is {session['user_id']}")
    if request.method == "GET":
        cur = db.execute("SELECT * FROM scores")
        return render_template("v2.html", scores=cur.fetchall())
    else:
        data = request.get_json()
        if 'score' in data:      
            score = data["score"]  
            score = score['_hours'] + ":" + score['_minutes'] + ":" + score['_seconds']
            points = getScore(score)
            if type(db.execute("SELECT score FROM scores WHERE player_id = ? ", (session['user_id'], )).fetchone()):
                myCur = db.execute("SELECT score FROM scores WHERE player_id = ?", (session['user_id'], ))
                highScore = myCur.fetchone()[0]
                bestScore = getScore(highScore)
                print(points, bestScore)
                if points > bestScore:
                    db.execute("UPDATE scores SET score = ? WHERE player_id = ?", (score, session['user_id']))
                    db.commit()
                    print("WE UPDATED!")
                    return 'nice!'
                else:
                    print("NOTHING HAPPENED!")
                    return 'nice!'
            else:
                db.execute("INSERT INTO scores(player_id, score) VALUES (?, ?)", (session['user_id'], score))
                db.commit()
                print("WE GOT A NEW GUY OVER HERE!")
                return render_template("v2.html")   
        else:
            return 'no score!'

        
    
@app.route("/", methods=["GET", "POST"])
def login():
    print(f" the request method is: {request.method}!")
    if request.method == "GET":
        session.clear()
        print("the session was cleared!")
        return render_template("login.html")
    elif request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if not username or username == 'nerd':
            myCur = db.execute("SELECT id FROM users WHERE username = 'nerd'")
            session['user_id'] = myCur.fetchone()[0]
            return redirect("/tetris")
        elif username and not password:
            return "give password nerd"
        elif username and password:
            for user in db.execute("SELECT username, password FROM users"):
                if username == user[0]:
                    if password == user[1]:
                        myCur = db.execute("SELECT id FROM users WHERE username = ?", (username,))
                        session['user_id'] = myCur.fetchone()[0]
                        return redirect("/tetris")
                    else:
                        return 'wrong password nerd'
            db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password) )
            db.commit()
            myCur = db.execute("SELECT id FROM users WHERE username = ?", (username,))
            session['user_id'] = myCur.fetchone()[0]
            db.execute("INSERT INTO scores (player_id) VALUES (?)", (session['user_id'], ))
            db.commit()
            
            return redirect("/tetris")
    
if __name__ == "__main__":
    app.run(debug=True)
    
