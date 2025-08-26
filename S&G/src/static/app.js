// app.js

/**
 * @class SG App
 * @description Classe principal para a aplicação de sistema de gestão.
 * Lida com o roteamento da página, estados da aplicação e interações com a API.
 */
class SG App {
    constructor() {
        // Propriedades para gerenciar o estado da aplicação
        this.currentPage = "";
        this.user = null;
        this.token = null;
        this.cart = [];
        this.products = [];
        this.clients = [];
        this.receivables = [];
        this.users = [];
        this.categories = [];

        // Mapeamento de elementos do DOM para fácil acesso
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
            addUserBtn: document.getElementById("add-user-btn"),
            userModal: document.getElementById("user-modal"),
            // Outros elementos do DOM que podem ser referenciados
            userList: document.getElementById("user-list"),
            productTableBody: document.getElementById("product-table-body"),
            clientTableBody: document.getElementById("client-table-body"),
        };
    }

    /**
     * @method init
     * @description Inicializa a aplicação, configurando eventos e o roteamento inicial.
     */
    init() {
        // Configura o evento de login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener("submit", this.handleLogin.bind(this));
        }

        // Configura a navegação
        this.elements.navLinks.forEach(link => {
            link.addEventListener("click", (e) => this.handleNavigation(e));
        });

        // Configura os botões de adicionar
        if (this.elements.addProductBtn) {
            this.elements.addProductBtn.addEventListener("click", () => this.showModal(this.elements.productModal, null, "add"));
        }
        if (this.elements.addClientBtn) {
            this.elements.addClientBtn.addEventListener("click", () => this.showModal(this.elements.clientModal, null, "add"));
        }
        if (this.elements.addUserBtn) {
            this.elements.addUserBtn.addEventListener("click", () => this.showModal(this.elements.userModal, null, "add"));
        }
        
        // Carrega a página inicial
        this.showPage("dashboard");
    }

    /**
     * @method handleNavigation
     * @description Lida com a navegação entre as páginas.
     * @param {Event} e O objeto de evento do clique.
     */
    handleNavigation(e) {
        e.preventDefault();
        const page = e.target.getAttribute("data-page");
        if (page) {
            this.showPage(page);
        }
    }

    /**
     * @method showPage
     * @description Exibe a página solicitada e esconde as outras.
     * @param {string} pageName O nome da página a ser exibida.
     */
    showPage(pageName) {
        // Esconde todas as páginas e exibe a selecionada
        const pages = document.querySelectorAll(".app-page");
        pages.forEach(page => page.style.display = "none");
        document.getElementById(`${pageName}-page`).style.display = "block";

        // Atualiza o título da página
        const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        if (this.elements.currentPageTitle) {
            this.elements.currentPageTitle.textContent = pageTitle;
        }

        this.currentPage = pageName;
        
        // Carrega dados específicos para a página
        switch (pageName) {
            case "products":
                this.loadProducts();
                break;
            case "clients":
                this.loadClients();
                break;
            case "users":
                this.loadUsers();
                break;
            // Outros casos para carregar dados de outras páginas
        }
    }

    /**
     * @method handleLogin
     * @description Processa o formulário de login.
     * @param {Event} e O objeto de evento do submit.
     */
    async handleLogin(e) {
        e.preventDefault();
        const email = this.elements.loginForm.email.value;
        const password = this.elements.loginForm.password.value;

        try {
            const response = await this.fetchApi("/api/auth/login", "POST", { email, password });
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.token = data.token;
                this.elements.loginPage.style.display = "none";
                this.elements.mainAppLayout.style.display = "block";
                if (this.elements.userInfo) {
                    this.elements.userInfo.textContent = `Olá, ${this.user.full_name || this.user.email}`;
                }
            } else {
                const error = await response.json();
                if (this.elements.loginErrorMessage) {
                    this.elements.loginErrorMessage.textContent = error.error;
                }
            }
        } catch (error) {
            console.error("Erro de login:", error);
            if (this.elements.loginErrorMessage) {
                this.elements.loginErrorMessage.textContent = "Erro de conexão. Tente novamente.";
            }
        }
    }

    /**
     * @method fetchApi
     * @description Um wrapper para a função fetch para lidar com solicitações de API.
     * @param {string} endpoint O endpoint da API.
     * @param {string} method O método HTTP (GET, POST, PUT, DELETE).
     * @param {object} body O corpo da requisição para métodos POST/PUT.
     * @returns {Promise<Response>} A resposta da requisição.
     */
    async fetchApi(endpoint, method = "GET", body = null) {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": this.token ? `Bearer ${this.token}` : "",
        };

        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
        };

        return fetch(endpoint, options);
    }

    /**
     * @method loadUsers
     * @description Carrega a lista de usuários da API.
     */
    async loadUsers() {
        try {
            const response = await this.fetchApi("/api/users");
            if (response.ok) {
                this.users = await response.json();
                this.renderUsers();
            } else {
                // Substituindo `alert` por um método de exibição de mensagem personalizado.
                this.showMessageBox("Erro ao carregar usuários: " + (await response.text()));
            }
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            // Substituindo `alert` por um método de exibição de mensagem personalizado.
            this.showMessageBox("Erro de conexão ao carregar usuários.");
        }
    }

    /**
     * @method renderUsers
     * @description Renderiza a lista de usuários na tabela.
     */
    renderUsers() {
        const tableBody = this.elements.userList;
        if (!tableBody) return;
        tableBody.innerHTML = "";
        this.users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.is_admin ? "Sim" : "Não"}</td>
                <td>
                    <button onclick="app.showModal(app.elements.userModal, '${user.id}', 'edit')">Editar</button>
                    <button onclick="app.deleteUser('${user.id}')">Excluir</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    /**
     * @method showModal
     * @description Exibe um modal para adicionar ou editar um usuário.
     * @param {HTMLElement} modal O elemento modal a ser exibido.
     * @param {string} userId O ID do usuário (nulo para adicionar).
     * @param {string} mode O modo do modal ('add' ou 'edit').
     */
    async showModal(modal, userId, mode) {
        // Implementação do modal
        // ... (código para exibir o modal e preencher o formulário)
        if (modal === this.elements.userModal) {
            const userForm = document.getElementById("user-form");
            const modalTitle = document.getElementById("user-modal-title");
            const passwordField = document.getElementById("user-password");
            
            userForm.reset();
            userForm.setAttribute("data-user-id", userId || "");

            if (mode === 'edit' && userId) {
                modalTitle.textContent = "Editar Usuário";
                passwordField.parentElement.style.display = "none";
                try {
                    const response = await this.fetchApi(`/api/users/${userId}`);
                    if (response.ok) {
                        const user = await response.json();
                        document.getElementById("user-full_name").value = user.full_name || "";
                        document.getElementById("user-email").value = user.email || "";
                        document.getElementById("user-is_admin").checked = user.is_admin;
                    } else {
                        this.showMessageBox("Erro ao carregar dados do usuário.");
                    }
                } catch (error) {
                    console.error("Erro ao carregar dados do usuário:", error);
                    this.showMessageBox("Erro de conexão ao carregar dados do usuário.");
                }
            } else {
                modalTitle.textContent = "Adicionar Usuário";
                passwordField.parentElement.style.display = "block";
            }
            modal.style.display = "block";
        }
    }

    /**
     * @method closeModal
     * @description Fecha um modal.
     * @param {HTMLElement} modal O elemento modal a ser fechado.
     */
    closeModal(modal) {
        modal.style.display = "none";
    }

    /**
     * @method saveUser
     * @description Salva ou atualiza um usuário via API.
     */
    async saveUser() {
        const userId = document.getElementById("user-form").getAttribute("data-user-id");
        const userData = {
            full_name: document.getElementById("user-full_name").value,
            email: document.getElementById("user-email").value,
            is_admin: document.getElementById("user-is_admin").checked
        };
        const password = document.getElementById("user-password").value;
        if (password) {
            userData.password = password;
        }

        try {
            let response;
            if (userId) {
                response = await this.fetchApi(`/api/users/${userId}`, "PUT", userData);
            } else {
                // Para novo usuário, use o endpoint de signup
                response = await this.fetchApi("/api/auth/signup", "POST", { ...userData, password });
            }

            if (response.ok) {
                this.closeModal(this.elements.userModal);
                this.loadUsers();
            } else {
                // Substituindo `alert` por um método de exibição de mensagem personalizado.
                this.showMessageBox("Erro ao salvar usuário: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error saving user:", error);
            // Substituindo `alert` por um método de exibição de mensagem personalizado.
            this.showMessageBox("Erro de conexão ao salvar usuário.");
        }
    }

    /**
     * @method deleteUser
     * @description Exclui um usuário via API.
     * @param {string} userId O ID do usuário a ser excluído.
     */
    async deleteUser(userId) {
        try {
            const response = await this.fetchApi(`/api/users/${userId}`, "DELETE");
            if (response.ok) {
                this.loadUsers();
            } else {
                // Substituindo `alert` por um método de exibição de mensagem personalizado.
                this.showMessageBox("Erro ao excluir usuário: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            // Substituindo `alert` por um método de exibição de mensagem personalizado.
            this.showMessageBox("Erro de conexão ao excluir usuário.");
        }
    }

    // Métodos para carregar e renderizar outras entidades (produtos, clientes, etc.)
    // ... (implementação similar a loadUsers e renderUsers)
    async loadProducts() {
        // Implementação para carregar produtos
    }
    async loadClients() {
        // Implementação para carregar clientes
    }

    // Método de substituição para `alert`, que deve ser implementado para exibir mensagens em um modal
    showMessageBox(message) {
        console.log(`[Message Box]: ${message}`);
        // Lógica para exibir um modal ou elemento de notificação aqui
    }

}

// Inicializa a aplicação quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", () => {
    window.app = new SGApp();
    window.app.init();
});
