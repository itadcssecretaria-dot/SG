import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Importar as blueprints
from src.routes.user import user_bp
from src.routes.client import client_bp
from src.routes.category_service import category_bp

# Configurar a Supabase
from supabase import create_client, Client

# Inicializar o Flask
def create_app():
    app = Flask(__name__, static_folder='src/static')
    app.config.from_object('src.config.Config')

    # Configurar CORS
    CORS(app)

    # Inicializar o cliente Supabase
    supabase: Client = create_client(
        os.environ.get("SUPABASE_URL"), 
        os.environ.get("SUPABASE_KEY")
    )
    app.config["SUPABASE_CLIENT"] = supabase

    # Registrar blueprints
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(client_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api')

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + "/" + path):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
