class SGApp {
    constructor() {
        this.currentPage = "dashboard";
        this.user = null;
        this.token = null;
        this.cart = [];
        this.products = [];
        this.clients = [];
        this.receivables = [];
        this.users = [];
        this.categories = [];

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
            productForm: document.getElementById("product-form"),
            clientModal: document.getElementById("client-modal"),
            clientForm: document.getElementById("client-form"),
            userModal: document.getElementById("user-modal"),
            userForm: document.getElementById("user-form"),
            addUserBtn: document.getElementById("add-user-btn"),
            categoriesList: document.getElementById("categories-list"),
            addCategoryBtn: document.getElementById("add-category-btn"),
            categoryModal: document.getElementById("category-modal"),
            categoryForm: document.getElementById("category-form"),
            settingsUserList: document.getElementById("settings-user-list"),
        };

        this.initEvents();
        this.checkAuth();
    }

    // Initialize all event listeners for the application
    initEvents() {
        // Handle login form submission
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
        }

        // Handle navigation clicks
        this.elements.navLinks.forEach(link => {
            link.addEventListener("click", (e) => this.navigate(e));
        });

        // Handle logout
        if (this.elements.logoutButtonNavbar) {
            this.elements.logoutButtonNavbar.addEventListener("click", () => this.logout());
        }

        // Handle opening modals
        if (this.elements.addProductBtn) {
            this.elements.addProductBtn.addEventListener("click", () => this.openModal(this.elements.productModal));
        }
        if (this.elements.addClientBtn) {
            this.elements.addClientBtn.addEventListener("click", () => this.openModal(this.elements.clientModal));
        }
        if (this.elements.addUserBtn) {
            this.elements.addUserBtn.addEventListener("click", () => this.openModal(this.elements.userModal));
        }
        if (this.elements.addCategoryBtn) {
            this.elements.addCategoryBtn.addEventListener("click", () => this.openModal(this.elements.categoryModal));
        }

        // Handle closing modals
        document.querySelectorAll(".close-modal").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const modal = e.target.closest(".modal");
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Handle form submissions
        if (this.elements.productForm) {
            this.elements.productForm.addEventListener("submit", (e) => this.saveProduct(e));
        }
        if (this.elements.clientForm) {
            this.elements.clientForm.addEventListener("submit", (e) => this.saveClient(e));
        }
        if (this.elements.userForm) {
            this.elements.userForm.addEventListener("submit", (e) => this.saveUser(e));
        }
    }

    // Fetches data from the API
    async fetchApi(url, method = "GET", body = null) {
        const headers = {
            "Content-Type": "application/json"
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        const options = {
            method,
            headers
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return fetch(url, options);
    }

    // Check for authentication status
    async checkAuth() {
        // For a real app, this would check local storage for a token
        if (this.token) {
            this.showMainApp();
            this.navigate({ preventDefault: () => {}, target: { href: `#${this.currentPage}` } });
        } else {
            this.showLoginPage();
        }
    }

    // Show the login page
    showLoginPage() {
        this.elements.loginPage.classList.remove("hidden");
        this.elements.mainAppLayout.classList.add("hidden");
    }

    // Show the main application layout
    showMainApp() {
        this.elements.loginPage.classList.add("hidden");
        this.elements.mainAppLayout.classList.remove("hidden");
    }

    // Handle user login
    async handleLogin(event) {
        event.preventDefault();
        const email = this.elements.loginForm.elements["login-email"].value;
        const password = this.elements.loginForm.elements["login-password"].value;

        try {
            const response = await this.fetchApi("/api/auth/login", "POST", { email, password });
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.token = data.token;
                this.elements.userInfo.textContent = `Olá, ${this.user.full_name || this.user.email}!`;
                this.showMainApp();
                this.navigate({ preventDefault: () => {}, target: { href: `#dashboard` } });
            } else {
                const errorData = await response.json();
                this.elements.loginErrorMessage.textContent = errorData.error || "Erro de login.";
                this.elements.loginErrorMessage.classList.remove("hidden");
            }
        } catch (error) {
            console.error("Login error:", error);
            this.elements.loginErrorMessage.textContent = "Erro de conexão. Tente novamente.";
            this.elements.loginErrorMessage.classList.remove("hidden");
        }
    }

    // Handle user logout
    async logout() {
        try {
            await this.fetchApi("/api/auth/logout", "POST");
            this.user = null;
            this.token = null;
            this.showLoginPage();
            console.log("Logout successful");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if logout fails on the server, log out on the client side for better UX
            this.user = null;
            this.token = null;
            this.showLoginPage();
        }
    }

    // Handle page navigation
    navigate(event) {
        event.preventDefault();
        const targetPage = event.target.getAttribute("href").substring(1);
        this.currentPage = targetPage;
        
        // Hide all pages
        document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));

        // Show the target page
        const pageElement = document.getElementById(`${targetPage}-page`);
        if (pageElement) {
            pageElement.classList.remove("hidden");
            this.elements.currentPageTitle.textContent = event.target.textContent;
            this.loadPageData(targetPage);
        }

        // Highlight active link
        this.elements.navLinks.forEach(link => link.classList.remove("bg-blue-500"));
        event.target.classList.add("bg-blue-500");
    }

    // Load data specific to the current page
    async loadPageData(page) {
        switch (page) {
            case "products":
                this.loadProducts();
                break;
            case "clients":
                this.loadClients();
                break;
            case "settings":
                this.loadUsers();
                break;
            case "dashboard":
                // No specific data to load for now
                break;
            case "sales":
                // Load sales data
                break;
            case "receivables":
                // Load receivables data
                break;
            case "reports":
                // Load reports data
                break;
        }
    }

    // Open a modal
    openModal(modalElement) {
        modalElement.classList.remove("hidden");
    }

    // Close a modal
    closeModal(modalElement) {
        modalElement.classList.add("hidden");
        // Reset form fields
        const form = modalElement.querySelector("form");
        if (form) {
            form.reset();
            const hiddenId = form.querySelector('input[type="hidden"]');
            if (hiddenId) {
                hiddenId.value = "";
            }
        }
    }

    // Load products from the API and render them
    async loadProducts() {
        try {
            const response = await this.fetchApi("/api/products");
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
            } else {
                console.error("Error loading products:", await response.text());
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    }

    // Render the products list
    renderProducts() {
        const listElement = this.elements.productsPage.querySelector("#products-list");
        if (!listElement) return;

        listElement.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${this.products.map(product => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">${product.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap">R$ ${product.price.toFixed(2)}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${product.stock}</td>
                            <td class="px-6 py-4 whitespace-nowrap space-x-2">
                                <button data-id="${product.id}" class="edit-product-btn text-blue-600 hover:text-blue-900">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button data-id="${product.id}" class="delete-product-btn text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        // Add event listeners for edit and delete buttons
        listElement.querySelectorAll(".edit-product-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.editProduct(e.currentTarget.dataset.id));
        });
        listElement.querySelectorAll(".delete-product-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.deleteProduct(e.currentTarget.dataset.id));
        });
    }

    // Save or update a product
    async saveProduct(event) {
        event.preventDefault();
        const id = this.elements.productForm.elements["product-id"].value;
        const name = this.elements.productForm.elements["product-name"].value;
        const price = parseFloat(this.elements.productForm.elements["product-price"].value);
        const stock = parseInt(this.elements.productForm.elements["product-stock"].value);
        const category_id = this.elements.productForm.elements["product-category"].value;

        const productData = { name, price, stock, category_id };
        
        try {
            let response;
            if (id) {
                response = await this.fetchApi(`/api/products/${id}`, "PUT", productData);
            } else {
                response = await this.fetchApi("/api/products", "POST", productData);
            }
            if (response.ok) {
                this.closeModal(this.elements.productModal);
                this.loadProducts();
            } else {
                console.error("Erro ao salvar produto:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar produto:", error);
        }
    }

    // Edit a product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.elements.productForm.elements["product-id"].value = product.id;
            this.elements.productForm.elements["product-name"].value = product.name;
            this.elements.productForm.elements["product-price"].value = product.price;
            this.elements.productForm.elements["product-stock"].value = product.stock;
            // set category
            this.openModal(this.elements.productModal);
        }
    }

    // Delete a product
    async deleteProduct(productId) {
        if (!confirm("Tem certeza que deseja excluir este produto?")) {
            return;
        }
        try {
            const response = await this.fetchApi(`/api/products/${productId}`, "DELETE");
            if (response.ok) {
                this.loadProducts();
            } else {
                console.error("Erro ao excluir produto:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir produto:", error);
        }
    }

    // Load clients from the API and render them
    async loadClients() {
        try {
            const response = await this.fetchApi("/api/clients");
            if (response.ok) {
                this.clients = await response.json();
                this.renderClients();
            } else {
                console.error("Erro ao carregar clientes:", await response.text());
            }
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    }

    // Render the clients list
    renderClients() {
        const listElement = this.elements.clientsPage.querySelector("#clients-list");
        if (!listElement) return;

        listElement.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${this.clients.map(client => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">${client.name}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${client.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${client.phone || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap space-x-2">
                                <button data-id="${client.id}" class="edit-client-btn text-blue-600 hover:text-blue-900">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button data-id="${client.id}" class="delete-client-btn text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        // Add event listeners for edit and delete buttons
        listElement.querySelectorAll(".edit-client-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.editClient(e.currentTarget.dataset.id));
        });
        listElement.querySelectorAll(".delete-client-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.deleteClient(e.currentTarget.dataset.id));
        });
    }

    // Save or update a client
    async saveClient(event) {
        event.preventDefault();
        const id = this.elements.clientForm.elements["client-id"].value;
        const name = this.elements.clientForm.elements["client-name"].value;
        const email = this.elements.clientForm.elements["client-email"].value;
        const phone = this.elements.clientForm.elements["client-phone"].value;
        const address = this.elements.clientForm.elements["client-address"].value;

        const clientData = { name, email, phone, address };

        try {
            let response;
            if (id) {
                response = await this.fetchApi(`/api/clients/${id}`, "PUT", clientData);
            } else {
                response = await this.fetchApi("/api/clients", "POST", clientData);
            }
            if (response.ok) {
                this.closeModal(this.elements.clientModal);
                this.loadClients();
            } else {
                console.error("Erro ao salvar cliente:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar cliente:", error);
        }
    }

    // Edit a client
    editClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            this.elements.clientForm.elements["client-id"].value = client.id;
            this.elements.clientForm.elements["client-name"].value = client.name;
            this.elements.clientForm.elements["client-email"].value = client.email;
            this.elements.clientForm.elements["client-phone"].value = client.phone;
            this.elements.clientForm.elements["client-address"].value = client.address;
            this.openModal(this.elements.clientModal);
        }
    }

    // Delete a client
    async deleteClient(clientId) {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) {
            return;
        }
        try {
            const response = await this.fetchApi(`/api/clients/${clientId}`, "DELETE");
            if (response.ok) {
                this.loadClients();
            } else {
                console.error("Erro ao excluir cliente:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir cliente:", error);
        }
    }

    // Load users from the API and render them
    async loadUsers() {
        try {
            const response = await this.fetchApi("/api/users");
            if (response.ok) {
                this.users = await response.json();
                this.renderUsers();
            } else {
                console.error("Erro ao carregar usuários:", await response.text());
            }
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
        }
    }

    // Render the users list
    renderUsers() {
        const listElement = this.elements.settingsPage.querySelector("#settings-user-list");
        if (!listElement) return;

        listElement.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${this.users.map(user => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">${user.full_name || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${user.is_admin ? '<i class="fas fa-check-circle text-green-500"></i>' : '<i class="fas fa-times-circle text-red-500"></i>'}</td>
                            <td class="px-6 py-4 whitespace-nowrap space-x-2">
                                <button data-id="${user.id}" class="edit-user-btn text-blue-600 hover:text-blue-900">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button data-id="${user.id}" class="delete-user-btn text-red-600 hover:text-red-900">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        // Add event listeners for edit and delete buttons
        listElement.querySelectorAll(".edit-user-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.editUser(e.currentTarget.dataset.id));
        });
        listElement.querySelectorAll(".delete-user-btn").forEach(btn => {
            btn.addEventListener("click", (e) => this.deleteUser(e.currentTarget.dataset.id));
        });
    }

    // Save or update a user
    async saveUser(event) {
        event.preventDefault();
        const id = this.elements.userForm.elements["user-id"].value;
        const fullName = this.elements.userForm.elements["user-full-name"].value;
        const email = this.elements.userForm.elements["user-email"].value;
        const password = this.elements.userForm.elements["user-password"].value;
        const isAdmin = this.elements.userForm.elements["user-is-admin"].checked;

        const userData = { full_name: fullName, email, is_admin: isAdmin };
        if (password) {
            userData.password = password;
        }

        try {
            let response;
            if (id) {
                response = await this.fetchApi(`/api/users/${id}`, "PUT", userData);
            } else {
                // For new user, use signup endpoint
                response = await this.fetchApi("/api/auth/signup", "POST", { ...userData, password });
            }

            if (response.ok) {
                this.closeModal(this.elements.userModal);
                this.loadUsers();
            } else {
                console.error("Erro ao salvar usuário:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao salvar usuário:", error);
        }
    }

    // Edit a user
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.elements.userForm.elements["user-id"].value = user.id;
            this.elements.userForm.elements["user-full-name"].value = user.full_name;
            this.elements.userForm.elements["user-email"].value = user.email;
            this.elements.userForm.elements["user-is-admin"].checked = user.is_admin;
            this.openModal(this.elements.userModal);
        }
    }

    // Delete a user
    async deleteUser(userId) {
        if (!confirm("Tem certeza que deseja excluir este usuário?")) {
            return;
        }
        try {
            const response = await this.fetchApi(`/api/users/${userId}`, "DELETE");
            if (response.ok) {
                this.loadUsers();
            } else {
                console.error("Erro ao excluir usuário:", await response.text());
            }
        } catch (error) {
            console.error("Erro de conexão ao excluir usuário:", error);
        }
    }

}

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    new SGApp();
});
