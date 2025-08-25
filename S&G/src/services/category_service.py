from src.services.supabase_service import SupabaseService

class CategoryService:
    def __init__(self):
        self.supabase_service = SupabaseService()
        self.categories_table = self.supabase_service.get_table("categories")

    def get_all_categories(self):
        response = self.categories_table.select("*").execute()
        return response.data

    def get_category_by_id(self, category_id: int):
        response = self.categories_table.select("*").eq("id", category_id).execute()
        return response.data[0] if response.data else None

    def create_category(self, name: str):
        response = self.categories_table.insert({"name": name}).execute()
        return response.data[0] if response.data else None

    def update_category(self, category_id: int, name: str):
        response = self.categories_table.update({"name": name}).eq("id", category_id).execute()
        return response.data[0] if response.data else None

    def delete_category(self, category_id: int):
        response = self.categories_table.delete().eq("id", category_id).execute()
        return response.data[0] if response.data else None

