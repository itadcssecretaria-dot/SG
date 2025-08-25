from flask import Blueprint, request, jsonify, current_app

product_bp = Blueprint("product_bp", __name__)

def get_supabase_client():
    return current_app.config["SUPABASE_CLIENT"]

@product_bp.route("/products", methods=["GET"])
def get_products():
    try:
        supabase = get_supabase_client()
        response = supabase.table("products").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    try:
        supabase = get_supabase_client()
        response = supabase.table("products").select("*").eq("id", product_id).single().execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    try:
        supabase = get_supabase_client()
        response = supabase.table("products").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route("/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    try:
        supabase = get_supabase_client()
        response = supabase.table("products").update(data).eq("id", product_id).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@product_bp.route("/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        supabase = get_supabase_client()
        supabase.table("products").delete().eq("id", product_id).execute()
        return jsonify({"message": "Product deleted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

