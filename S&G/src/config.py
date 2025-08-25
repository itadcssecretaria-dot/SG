import os

class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "uma_chave_secreta_padrao_muito_segura")
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

