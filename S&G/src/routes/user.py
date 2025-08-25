from flask import Blueprint, request, jsonify, current_app
from supabase import Client
from supabase.lib.client_options import ClientOptions

user_bp = Blueprint("user_bp", __name__)

def get_supabase_client() -> Client:
    return current_app.config["SUPABASE_CLIENT"]

@user_bp.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_up({"email": email, "password": password})

        if auth_response.user:
            # Inserir informações adicionais do usuário na tabela 'users'
            user_data = {
                "id": auth_response.user.id,
                "email": email,
                "full_name": full_name,
                "is_admin": False # Default para novos usuários
            }
            supabase.table("users").insert(user_data).execute()

            return jsonify({"message": "User created successfully!", "user": auth_response.user.dict()}), 201
        else:
            return jsonify({"error": "Failed to create user", "details": auth_response.json()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_in_with_password({"email": email, "password": password})

        if auth_response.user:
            # Opcional: buscar dados adicionais do usuário da sua tabela 'users'
            user_profile = supabase.table("users").select("*").eq("id", auth_response.user.id).single().execute()
            user_data = user_profile.data if user_profile.data else {}

            return jsonify({
                "message": "Login successful!",
                "user": auth_response.user.dict(),
                "profile": user_data,
                "access_token": auth_response.session.access_token
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/auth/logout", methods=["POST"])
def logout():
    try:
        supabase = get_supabase_client()
        supabase.auth.sign_out()
        return jsonify({"message": "Logout successful!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/users", methods=["GET"])
def get_users():
    try:
        supabase = get_supabase_client()
        response = supabase.table("users").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table("users").select("*").eq("id", user_id).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    try:
        supabase = get_supabase_client()
        response = supabase.table("users").update(data).eq("id", user_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        supabase = get_supabase_client()
        supabase.table("users").delete().eq("id", user_id).execute()
        return jsonify({"message": "User deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

