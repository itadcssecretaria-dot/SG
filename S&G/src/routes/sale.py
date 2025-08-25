from flask import Blueprint, request, jsonify, current_app

sale_bp = Blueprint("sale_bp", __name__)

def get_supabase_client():
    return current_app.config["SUPABASE_CLIENT"]

@sale_bp.route("/sales", methods=["GET"])
def get_sales():
    try:
        supabase = get_supabase_client()
        response = supabase.table("sales").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sale_bp.route("/sales/<sale_id>", methods=["GET"])
def get_sale(sale_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table("sales").select("*").eq("id", sale_id).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sale_bp.route("/sales", methods=["POST"])
def create_sale():
    data = request.get_json()
    try:
        supabase = get_supabase_client()
        response = supabase.table("sales").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sale_bp.route("/sales/<sale_id>", methods=["PUT"])
def update_sale(sale_id):
    data = request.get_json()
    try:
        supabase = get_supabase_client()
        response = supabase.table("sales").update(data).eq("id", sale_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sale_bp.route("/sales/<sale_id>", methods=["DELETE"])
def delete_sale(sale_id):
    try:
        supabase = get_supabase_client()
        supabase.table("sales").delete().eq("id", sale_id).execute()
        return jsonify({"message": "Sale deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

