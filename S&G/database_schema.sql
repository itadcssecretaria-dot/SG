-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de usuários (exemplo básico)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data." ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data." ON users
  FOR UPDATE USING (auth.uid() = id);

-- Tabela de Produtos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de produtos (exemplo básico)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by all authenticated users." ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage products." ON products
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Tabela de Categorias (para produtos)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de categorias (exemplo básico)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by all authenticated users." ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories." ON categories
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Tabela de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'debtor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de clientes (exemplo básico)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients are viewable by all authenticated users." ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage clients." ON clients
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Tabela de Vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0,
    discount_value NUMERIC(10, 2) DEFAULT 0,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- Opcional, se a venda for associada a um cliente
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Usuário que realizou a venda
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de vendas (exemplo básico)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales are viewable by all authenticated users." ON sales
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sales." ON sales
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Tabela de Itens de Venda (detalhes de cada produto em uma venda)
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_sale NUMERIC(10, 2) NOT NULL, -- Preço do produto no momento da venda
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de itens de venda (exemplo básico)
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sale items are viewable by all authenticated users." ON sale_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage sale items." ON sale_items
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Tabela de Contas a Receber
CREATE TABLE receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'paid', 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para a tabela de contas a receber (exemplo básico)
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Receivables are viewable by all authenticated users." ON receivables
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage receivables." ON receivables
  FOR ALL USING (auth.jwt() ->> 'is_admin')::boolean = TRUE WITH CHECK (auth.jwt() ->> 'is_admin')::boolean = TRUE;

-- Habilitar a extensão uuid-ossp para uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funções para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON receivables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

