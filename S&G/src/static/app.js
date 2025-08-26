// A classe principal da aplicação, encapsulando toda a lógica e elementos
class SGApp {
    // Construtor que inicializa as variáveis de estado e os elementos do DOM
    constructor() {
        this.currentPage = "";
        this.user = null;
        this.token = null;
        this.cart = [];
        this.products = [];
        this.clients = [];
        this.receivables = [];
        this.users = [];
        this.categories = [];

        // Mapeia os elementos do DOM para acesso rápido
        this.elements = {
            loginPage: document.getElementById("login-page"),
            mainAppLayout: document.getElementById("main-app-layout"),
            loginForm: document.getElementById("login-form"),
            loginErrorMessage: document.getElementById("login-error-message"),
            navLinks: document.querySelectorAll(".nav-link"),
            currentPageTitle: document.getElementById("current-page-title"),
            userInfo: document.getElementById("user-info"),
            logoutButtonNavbar: document.getElementById("logout-button-navbar"),
            dashboardPage: document.getElementById("dashboard-page"),
            productsPage: document.getElementById("products-page"),
            clientsPage: document.getElementById("clients-page"),
            salesPage: document.getElementById("sales-page"),
            receivablesPage: document.getElementById("receivables-page"),
            reportsPage: document.getElementById("reports-page"),
            settingsPage: document.getElementById("settings-page"),
            addProductBtn: document.getElementById("add-product-btn"),
            productModal: document.getElementById("product-modal"),
            addClientBtn: document.getElementById("add-client-btn"),
            clientModal: document.getElementById("client-modal"),
            addSaleBtn: document.getElementById("add-sale-btn"),
            addReceivableBtn: document.getElementById("add-receivable-btn"),
            addUserBtn: document.getElementById("add-user-btn"),
            userModal: document.getElementById("user-modal"),
            closeModalBtns: document.querySelectorAll(".close-modal-btn"),
            productForm: document.getElementById("product-form"),
            clientForm: document.getElementById("client-form"),
            userForm: document.getElementById("user-form"),
            productsTableBody: document.querySelector("#products-table tbody"),
            clientsTableBody: document.querySelector("#clients-table tbody"),
            usersTableBody: document.querySelector("#users-table tbody")
        };

        this.initEventListeners();
    }

    // Inicializa todos os listeners de eventos da aplicação
    initEventListeners() {
        // Manipulador para o formulário de login
        this.elements.loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = this.elements.loginForm.email.value;
            const password = this.elements.loginForm.password.value;
            await this.login(email, password);
        });

        // Manipulador para o logout
        this.elements.logoutButtonNavbar.addEventListener("click", () => this.logout());

        // Manipulador para os links de navegação
        this.elements.navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        // Manipuladores para botões de abrir modais
        this.elements.addProductBtn.addEventListener("click", () => this.openModal(this.elements.productModal));
        this.elements.addClientBtn.addEventListener("click", () => this.openModal(this.elements.clientModal));
        this.elements.addUserBtn.addEventListener("click", () => this.openModal(this.elements.userModal));

        // Manipuladores para botões de fechar modais
        this.elements.closeModalBtns.forEach(btn => {
            btn.addEventListener("click", (e) => this.closeModal(e.target.closest(".modal")));
        });

        // Manipuladores para os formulários dos modais
        this.elements.productForm.addEventListener("submit", (e) => this.handleProductFormSubmit(e));
        this.elements.clientForm.addEventListener("submit", (e) => this.handleClientFormSubmit(e));
        this.elements.userForm.addEventListener("submit", (e) => this.handleUserFormSubmit(e));
    }

    // Navega para uma página específica
    navigateTo(page) {
        this.currentPage = page;
        document.querySelectorAll(".page-content").forEach(p => p.classList.add("hidden"));
        document.getElementById(`${page}-page`).classList.remove("hidden");
        this.elements.currentPageTitle.textContent = this.getPageTitle(page);

        // Carrega dados específicos para cada página
        switch (page) {
            case 'products':
                this.loadProducts();
                break;
            case 'clients':
                this.loadClients();
                break;
            case 'settings':
                this.loadUsers();
                break;
            case 'sales':
                // Implementar carregamento de vendas
                break;
            case 'receivables':
                // Implementar carregamento de contas a receber
                break;
            case 'reports':
                // Implementar carregamento de relatórios
                break;
            default:
                break;
        }
    }

    // Retorna o título da página
    getPageTitle(page) {
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Gestão de Produtos',
            'clients': 'Gestão de Clientes',
            'sales': 'Registro de Vendas',
            'receivables': 'Contas a Receber',
            'reports': 'Relatórios',
            'settings': 'Configurações'
        };
        return titles[page] || '';
    }

    // Abre um modal
    openModal(modalElement, data = null) {
        const form = modalElement.querySelector("form");
        form.reset();
        modalElement.classList.remove("hidden");
        const titleElement = modalElement.querySelector("h3");
        
        // Define o título do modal e preenche o formulário se houver dados
        if (data) {
            titleElement.textContent = `Editar ${form.id.split('-')[0]}`;
            form.dataset.id = data.id;
            for (const key in data) {
                const input = form.querySelector(`#${form.id.split('-')[0]}-${key.replace(/_/g, '-')}`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = data[key];
                    } else {
                        input.value = data[key];
                    }
                }
            }
            // Lógica específica para o modal de usuário
            if (form.id === 'user-form') {
                document.getElementById('password-help-text').classList.remove('hidden');
                document.getElementById('user-password').removeAttribute('required');
            }
        } else {
            titleElement.textContent = `Adicionar ${form.id.split('-')[0]}`;
            form.dataset.id = '';
            // Lógica específica para o modal de usuário
            if (form.id === 'user-form') {
                document.getElementById('password-help-text').classList.add('hidden');
                document.getElementById('user-password').setAttribute('required', 'required');
            }
        }
    }

    // Fecha um modal
    closeModal(modalElement) {
        modalElement.classList.add("hidden");
    }

    // Fetch API genérico com tratamento de erros
    async fetchApi(url, method = "GET", body = null) {
        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            body: body ? JSON.stringify(body) : null,
        };
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Erro na requisição ${method} ${url}:`, errorData.error);
                throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
            }
            // Retorna a resposta completa para poder verificar o status
            return response;
        } catch (error) {
            console.error("Erro de conexão ou requisição:", error);
            // Lança o erro novamente para ser capturado pela função que chamou
            throw error;
        }
    }

    // Lida com o login do usuário
    async login(email, password) {
        try {
            const response = await this.fetchApi("/api/auth/signin", "POST", { email, password });
            const data = await response.json();
            this.token = data.access_token;
            this.user = data.user;
            this.elements.loginPage.classList.add("hidden");
            this.elements.mainAppLayout.classList.remove("hidden");
            this.elements.userInfo.textContent = `Bem-vindo, ${this.user.full_name || this.user.email}`;
            this.navigateTo("dashboard");
            this.loadCategories();
        } catch (error) {
            this.elements.loginErrorMessage.textContent = "Falha no login. Verifique seu email e senha.";
            this.elements.loginErrorMessage.classList.remove("hidden");
        }
    }

    // Lida com o logout do usuário
    async logout() {
        try {
            await this.fetchApi("/api/auth/signout", "POST");
        } catch (error) {
            console.error("Erro ao fazer logout, mas prosseguindo:", error);
        } finally {
            this.token = null;
            this.user = null;
            this.elements.mainAppLayout.classList.add("hidden");
            this.elements.loginPage.classList.remove("hidden");
        }
    }

    // Carrega a lista de produtos da API
    async loadProducts() {
        try {
            const response = await this.fetchApi("/api/products");
            const products = await response.json();
            this.products = products;
            this.renderProducts();
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            // Exibir mensagem de erro para o usuário (em um modal, por exemplo)
        }
    }

    // Carrega a lista de clientes da API
    async loadClients() {
        try {
            const response = await this.fetchApi("/api/clients");
            const clients = await response.json();
            this.clients = clients;
            this.renderClients();
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
            // Exibir mensagem de erro para o usuário (em um modal, por exemplo)
        }
    }

    // Carrega a lista de usuários da API
    async loadUsers() {
        try {
            const response = await this.fetchApi("/api/users");
            const users = await response.json();
            this.users = users;
            this.renderUsers();
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            // Exibir mensagem de erro para o usuário (em um modal, por exemplo)
        }
    }

    // Carrega a lista de categorias da API
    async loadCategories() {
        try {
            const response = await this.fetchApi("/api/categories");
            const categories = await response.json();
            this.categories = categories;
            // Popula o select do formulário de produto
            const categorySelect = document.getElementById("product-category");
            categorySelect.innerHTML = categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            // Exibir mensagem de erro para o usuário (em um modal, por exemplo)
        }
    }

    // Renderiza a tabela de produtos
    renderProducts() {
        this.elements.productsTableBody.innerHTML = '';
        this.products.forEach(product => {
            const category = this.categories.find(cat => cat.id === product.category_id) || { name: 'N/A' };
            const row = `
                <tr class="hover:bg-gray-100 transition-colors duration-100">
                    <td class="px-6 py-4 whitespace-nowrap">${product.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">R$ ${product.price.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${product.stock}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${category.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="app.openModal(app.elements.productModal, ${JSON.stringify(product).replace(/"/g, '&quot;')})" class="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                        <button onclick="app.deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
            this.elements.productsTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Renderiza a tabela de clientes
    renderClients() {
        this.elements.clientsTableBody.innerHTML = '';
        this.clients.forEach(client => {
            const row = `
                <tr class="hover:bg-gray-100 transition-colors duration-100">
                    <td class="px-6 py-4 whitespace-nowrap">${client.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${client.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${client.phone || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="app.openModal(app.elements.clientModal, ${JSON.stringify(client).replace(/"/g, '&quot;')})" class="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                        <button onclick="app.deleteClient('${client.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
            this.elements.clientsTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Renderiza a tabela de usuários
    renderUsers() {
        this.elements.usersTableBody.innerHTML = '';
        this.users.forEach(user => {
            const row = `
                <tr class="hover:bg-gray-100 transition-colors duration-100">
                    <td class="px-6 py-4 whitespace-nowrap">${user.full_name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.is_admin ? 'Sim' : 'Não'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="app.openModal(app.elements.userModal, ${JSON.stringify(user).replace(/"/g, '&quot;')})" class="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                        <button onclick="app.deleteUser('${user.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                </tr>
            `;
            this.elements.usersTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // Manipula o envio do formulário de produto
    async handleProductFormSubmit(event) {
        event.preventDefault();
        const productId = this.elements.productForm.dataset.id;
        const productName = document.getElementById("product-name").value;
        const productPrice = parseFloat(document.getElementById("product-price").value);
        const productStock = parseInt(document.getElementById("product-stock").value, 10);
        const productCategory = document.getElementById("product-category").value;

        const productData = {
            name: productName,
            price: productPrice,
            stock: productStock,
            category_id: productCategory
        };

        try {
            let response;
            if (productId) {
                response = await this.fetchApi(`/api/products/${productId}`, "PUT", productData);
            } else {
                response = await this.fetchApi("/api/products", "POST", productData);
            }
            
            if (response.ok) {
                this.closeModal(this.elements.productModal);
                this.loadProducts();
            } else {
                console.error("Erro ao salvar produto:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar produto:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

    // Lida com a exclusão de um produto
    async deleteProduct(productId) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            const response = await this.fetchApi(`/api/products/${productId}`, "DELETE");
            if (response.ok) {
                this.loadProducts();
            } else {
                console.error("Erro ao excluir produto:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir produto:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

    // Manipula o envio do formulário de cliente
    async handleClientFormSubmit(event) {
        event.preventDefault();
        const clientId = this.elements.clientForm.dataset.id;
        const clientData = {
            name: document.getElementById("client-name").value,
            email: document.getElementById("client-email").value,
            phone: document.getElementById("client-phone").value,
        };

        try {
            let response;
            if (clientId) {
                response = await this.fetchApi(`/api/clients/${clientId}`, "PUT", clientData);
            } else {
                response = await this.fetchApi("/api/clients", "POST", clientData);
            }

            if (response.ok) {
                this.closeModal(this.elements.clientModal);
                this.loadClients();
            } else {
                console.error("Erro ao salvar cliente:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar cliente:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

    // Lida com a exclusão de um cliente
    async deleteClient(clientId) {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
            const response = await this.fetchApi(`/api/clients/${clientId}`, "DELETE");
            if (response.ok) {
                this.loadClients();
            } else {
                console.error("Erro ao excluir cliente:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir cliente:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

    // Manipula o envio do formulário de usuário
    async handleUserFormSubmit(event) {
        event.preventDefault();
        const userId = this.elements.userForm.dataset.id;
        const userData = {
            full_name: document.getElementById("user-full_name").value,
            email: document.getElementById("user-email").value,
            is_admin: document.getElementById("user-is_admin").checked
        };
        const password = document.getElementById("user-password").value;
        
        // A senha só é enviada se o usuário a preencheu
        if (password) {
            userData.password = password;
        }

        try {
            let response;
            if (userId) {
                response = await this.fetchApi(`/api/users/${userId}`, "PUT", userData);
            } else {
                // Para novos usuários, usar o endpoint de cadastro
                response = await this.fetchApi("/api/auth/signup", "POST", { ...userData, password });
            }

            if (response.ok) {
                this.closeModal(this.elements.userModal);
                this.loadUsers();
            } else {
                console.error("Erro ao salvar usuário:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar usuário:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

    // Lida com a exclusão de um usuário
    async deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            const response = await this.fetchApi(`/api/users/${userId}`, "DELETE");
            if (response.ok) {
                this.loadUsers();
            } else {
                console.error("Erro ao excluir usuário:", await response.text());
                // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir usuário:", error);
            // TODO: Implementar um modal para exibir a mensagem de erro para o usuário
        }
    }

}

// Inicializa a aplicação quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    window.app = new SGApp();
});
