from flask import Flask


app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/uploads"


@app.route("/")
def index():
    return "Tarea 2 - Comunidad DCC"


if __name__ == "__main__":
    app.run(debug=True)

