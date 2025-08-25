import os
from supabase import create_client, Client

class SupabaseService:
    def __init__(self):
        self.url: str = os.environ.get("SUPABASE_URL")
        self.key: str = os.environ.get("SUPABASE_KEY")
        self.supabase: Client = create_client(self.url, self.key)

    def get_client(self) -> Client:
        return self.supabase

    def get_table(self, table_name: str):
        return self.supabase.table(table_name)

    def get_auth(self):
        return self.supabase.auth

    def get_storage(self):
        return self.supabase.storage

    def get_realtime(self):
        return self.supabase.realtime

    def get_functions(self):
        return self.supabase.functions

