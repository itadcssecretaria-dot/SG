class SGApp {
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
            cancelProductBtn: document.getElementById("cancel-product-btn"),
            productsTableBody: document.querySelector("#products-table tbody"),
            productSearch: document.getElementById("product-search"),
            productsEmptyState: document.getElementById("products-empty-state"),
            addProductEmptyBtn: document.getElementById("add-product-empty-btn"),
            addClientBtn: document.getElementById("add-client-btn"),
            clientModal: document.getElementById("client-modal"),
            clientForm: document.getElementById("client-form"),
            cancelClientBtn: document.getElementById("cancel-client-btn"),
            clientsTableBody: document.querySelector("#clients-table tbody"),
            clientSearch: document.getElementById("client-search"),
            clientsEmptyState: document.getElementById("clients-empty-state"),
            addClientEmptyBtn: document.getElementById("add-client-empty-btn"),
            clientFilterButtons: document.querySelectorAll("#clients-page .btn-filter"),
            saleProductSearch: document.getElementById("sale-product-search"),
            productListForSale: document.getElementById("product-list-for-sale"),
            cartItems: document.getElementById("cart-items"),
            cartSubtotal: document.getElementById("cart-subtotal"),
            cartDiscountPercentage: document.getElementById("cart-discount-percentage"),
            cartDiscountValue: document.getElementById("cart-discount-value"),
            cartTotal: document.getElementById("cart-total"),
            finalizeSaleBtn: document.getElementById("finalize-sale-btn"),
            cancelSaleBtn: document.getElementById("cancel-sale-btn"),
            addReceivableBtn: document.getElementById("add-receivable-btn"),
            receivableModal: document.getElementById("receivable-modal"),
            receivableForm: document.getElementById("receivable-form"),
            cancelReceivableBtn: document.getElementById("cancel-receivable-btn"),
            receivablesTableBody: document.querySelector("#receivables-table tbody"),
            receivableSearch: document.getElementById("receivable-search"),
            receivablesEmptyState: document.getElementById("receivables-empty-state"),
            addReceivableEmptyBtn: document.getElementById("add-receivable-empty-btn"),
            receivableFilterButtons: document.querySelectorAll("#receivables-page .btn-filter"),
            reportTypeSelect: document.getElementById("report-type"),
            reportPeriodSelect: document.getElementById("report-period"),
            generateReportBtn: document.getElementById("generate-report-btn"),
            reportContent: document.getElementById("report-content"),
            reportChartCanvas: document.getElementById("reportChart"),
            companyNameInput: document.getElementById("company-name"),
            currencySymbolInput: document.getElementById("currency-symbol"),
            usersTableBody: document.querySelector("#users-table tbody"),
            addUserBtn: document.getElementById("add-user-btn"),
            userModal: document.getElementById("user-modal"),
            userForm: document.getElementById("user-form"),
            cancelUserBtn: document.getElementById("cancel-user-btn"),
            confirmationModal: document.getElementById("confirmation-modal"),
            confirmationMessage: document.getElementById("confirmation-message"),
            confirmActionBtn: document.getElementById("confirm-action-btn"),
            cancelConfirmationBtn: document.getElementById("cancel-confirmation-btn"),
            modalOverlay: document.getElementById("modal-overlay"),
        };

        this.initEventListeners();
        this.checkLoginStatus();
    }

    initEventListeners() {
        this.elements.loginForm.addEventListener("submit", this.handleLogin.bind(this));
        this.elements.logoutButtonNavbar.addEventListener("click", this.handleLogout.bind(this));

        this.elements.navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        // Products Page
        this.elements.addProductBtn.addEventListener("click", () => this.openProductModal());
        this.elements.addProductEmptyBtn.addEventListener("click", () => this.openProductModal());
        this.elements.cancelProductBtn.addEventListener("click", () => this.closeModal(this.elements.productModal));
        this.elements.productForm.addEventListener("submit", this.handleProductFormSubmit.bind(this));
        this.elements.productSearch.addEventListener("input", (e) => this.filterProducts(e.target.value));

        // Clients Page
        this.elements.addClientBtn.addEventListener("click", () => this.openClientModal());
        this.elements.addClientEmptyBtn.addEventListener("click", () => this.openClientModal());
        this.elements.cancelClientBtn.addEventListener("click", () => this.closeModal(this.elements.clientModal));
        this.elements.clientForm.addEventListener("submit", this.handleClientFormSubmit.bind(this));
        this.elements.clientSearch.addEventListener("input", (e) => this.filterClients(e.target.value));
        this.elements.clientFilterButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                this.elements.clientFilterButtons.forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");
                this.filterClients(this.elements.clientSearch.value, e.target.dataset.filter);
            });
        });

        // Sales Page
        this.elements.saleProductSearch.addEventListener("input", this.handleSaleProductSearch.bind(this));
        this.elements.cartDiscountPercentage.addEventListener("input", this.updateCartSummary.bind(this));
        this.elements.cartDiscountValue.addEventListener("input", this.updateCartSummary.bind(this));
        this.elements.finalizeSaleBtn.addEventListener("click", this.handleFinalizeSale.bind(this));
        this.elements.cancelSaleBtn.addEventListener("click", this.handleCancelSale.bind(this));

        // Receivables Page
        this.elements.addReceivableBtn.addEventListener("click", () => this.openReceivableModal());
        this.elements.addReceivableEmptyBtn.addEventListener("click", () => this.openReceivableModal());
        this.elements.cancelReceivableBtn.addEventListener("click", () => this.closeModal(this.elements.receivableModal));
        this.elements.receivableForm.addEventListener("submit", this.handleReceivableFormSubmit.bind(this));
        this.elements.receivableSearch.addEventListener("input", (e) => this.filterReceivables(e.target.value));
        this.elements.receivableFilterButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                this.elements.receivableFilterButtons.forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");
                this.filterReceivables(this.elements.receivableSearch.value, e.target.dataset.filter);
            });
        });

        // Reports Page
        this.elements.generateReportBtn.addEventListener("click", this.generateReport.bind(this));

        // Settings Page
        this.elements.addUserBtn.addEventListener("click", () => this.openUserModal());
        this.elements.cancelUserBtn.addEventListener("click", () => this.closeModal(this.elements.userModal));
        this.elements.userForm.addEventListener("submit", this.handleUserFormSubmit.bind(this));

        // Confirmation Modal
        this.elements.cancelConfirmationBtn.addEventListener("click", () => this.closeModal(this.elements.confirmationModal));
        this.elements.modalOverlay.addEventListener("click", (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.closeAllModals();
            }
        });
    }

    showModal(modalElement) {
        this.elements.modalOverlay.style.display = "flex";
        modalElement.style.display = "block";
    }

    closeModal(modalElement) {
        modalElement.style.display = "none";
        this.elements.modalOverlay.style.display = "none";
    }

    closeAllModals() {
        const modals = document.querySelectorAll(".modal-content");
        modals.forEach(modal => modal.style.display = "none");
        this.elements.modalOverlay.style.display = "none";
    }

    showConfirmationModal(message, onConfirm) {
        this.elements.confirmationMessage.textContent = message;
        this.elements.confirmActionBtn.onclick = () => {
            onConfirm();
            this.closeModal(this.elements.confirmationModal);
        };
        this.showModal(this.elements.confirmationModal);
    }

    async checkLoginStatus() {
        const token = localStorage.getItem("token");
        if (token) {
            this.token = token;
            // In a real app, you'd validate the token with your backend
            // For this demo, we'll assume it's valid and fetch user info
            try {
                const response = await this.fetchApi("/api/users/me", "GET"); // Assuming a /api/users/me endpoint
                if (response.ok) {
                    const userData = await response.json();
                    this.user = userData;
                    this.elements.userInfo.textContent = `Olá, ${this.user.full_name || this.user.email}`;
                    this.elements.loginPage.classList.remove("active");
                    this.elements.mainAppLayout.classList.remove("hidden");
                    this.navigateTo("dashboard");
                } else {
                    this.handleLogout(); // Token invalid or expired
                }
            } catch (error) {
                console.error("Error checking login status:", error);
                this.handleLogout();
            }
        } else {
            this.elements.loginPage.classList.add("active");
            this.elements.mainAppLayout.classList.add("hidden");
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                this.token = data.access_token;
                this.user = data.profile; // Assuming profile contains full_name etc.
                this.elements.userInfo.textContent = `Olá, ${this.user.full_name || this.user.email}`;
                this.elements.loginPage.classList.remove("active");
                this.elements.mainAppLayout.classList.remove("hidden");
                this.navigateTo("dashboard");
                this.elements.loginErrorMessage.textContent = "";
            } else {
                this.elements.loginErrorMessage.textContent = data.error || "Erro ao fazer login.";
            }
        } catch (error) {
            console.error("Login error:", error);
            this.elements.loginErrorMessage.textContent = "Erro de conexão. Tente novamente.";
        }
    }

    handleLogout() {
        localStorage.removeItem("token");
        this.user = null;
        this.token = null;
        this.elements.loginPage.classList.add("active");
        this.elements.mainAppLayout.classList.add("hidden");
        this.elements.loginForm.reset();
        this.elements.loginErrorMessage.textContent = "";
        this.navigateTo("login"); // Ensure we go back to login view
    }

    navigateTo(pageId) {
        // Hide all content sections
        document.querySelectorAll(".content-section").forEach(section => {
            section.classList.remove("active");
        });

        // Deactivate all nav links
        this.elements.navLinks.forEach(link => link.classList.remove("active"));

        // Show the requested page and activate its nav link
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add("active");
            const activeNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
            if (activeNavLink) {
                activeNavLink.classList.add("active");
            }
            this.elements.currentPageTitle.textContent = activeNavLink ? activeNavLink.textContent : "";
        }

        // Load data specific to the page
        this.loadPageData(pageId);
    }

    async loadPageData(pageId) {
        switch (pageId) {
            case "dashboard":
                // Load dashboard metrics and charts
                this.loadDashboardMetrics();
                break;
            case "products":
                await this.loadProducts();
                await this.loadCategories();
                break;
            case "clients":
                await this.loadClients();
                break;
            case "sales":
                await this.loadProductsForSale();
                this.cart = [];
                this.renderCart();
                this.updateCartSummary();
                break;
            case "receivables":
                await this.loadReceivables();
                await this.loadClientsForReceivables(); // Load clients for the dropdown
                break;
            case "reports":
                // Initial load or reset report view
                this.elements.reportContent.innerHTML = "<p>Selecione um tipo de relatório e um período para gerar.</p>";
                if (this.reportChart) {
                    this.reportChart.destroy();
                    this.elements.reportChartCanvas.style.display = "none";
                }
                break;
            case "settings":
                await this.loadUsers();
                // Load company settings if any
                break;
        }
    }

    async fetchApi(endpoint, method = "GET", body = null) {
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`,
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return fetch(endpoint, options);
    }

    // Products Module
    async loadProducts() {
        try {
            const response = await this.fetchApi("/api/products");
            if (response.ok) {
                this.products = await response.json();
                this.renderProducts();
            } else {
                console.error("Failed to load products:", await response.text());
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    }

    async loadCategories() {
        try {
            const response = await this.fetchApi("/api/categories"); // Assuming a /api/categories endpoint
            if (response.ok) {
                this.categories = await response.json();
                this.populateCategoryDropdown();
            } else {
                console.error("Failed to load categories:", await response.text());
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }

    populateCategoryDropdown() {
        const productCategorySelect = document.getElementById("product-category");
        if (productCategorySelect) {
            productCategorySelect.innerHTML = 
                `<option value="">Selecione uma Categoria</option>` +
                this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join("");
        }
    }

    renderProducts() {
        const tbody = this.elements.productsTableBody;
        tbody.innerHTML = "";
        if (this.products.length === 0) {
            this.elements.productsEmptyState.style.display = "block";
            this.elements.productsTableBody.closest(".table-responsive").style.display = "none";
            return;
        }
        this.elements.productsEmptyState.style.display = "none";
        this.elements.productsTableBody.closest(".table-responsive").style.display = "block";

        this.products.forEach(product => {
            const row = tbody.insertRow();
            const categoryName = this.categories.find(cat => cat.id === product.category_id)?.name || "N/A";
            row.innerHTML = `
                <td>${product.name}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>${categoryName}</td>
                <td class="action-buttons">
                    <button class="btn-primary btn-sm" data-id="${product.id}" data-action="edit-product">Editar</button>
                    <button class="btn-danger btn-sm" data-id="${product.id}" data-action="delete-product">Excluir</button>
                </td>
            `;
            row.querySelector("[data-action=\"edit-product\"]").addEventListener("click", (e) => this.openProductModal(product));
            row.querySelector("[data-action=\"delete-product\"]").addEventListener("click", (e) => this.showConfirmationModal(
                `Tem certeza que deseja excluir o produto ${product.name}?`,
                () => this.deleteProduct(product.id)
            ));
        });
    }

    filterProducts(searchTerm) {
        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderProducts(filtered); // Re-render with filtered data
    }

    openProductModal(product = null) {
        const form = this.elements.productForm;
        form.reset();
        document.getElementById("product-id").value = "";
        if (product) {
            document.getElementById("product-id").value = product.id;
            document.getElementById("product-name").value = product.name;
            document.getElementById("product-price").value = product.price;
            document.getElementById("product-stock").value = product.stock;
            document.getElementById("product-category").value = product.category_id;
        }
        this.showModal(this.elements.productModal);
    }

    async handleProductFormSubmit(event) {
        event.preventDefault();
        const productId = document.getElementById("product-id").value;
        const productData = {
            name: document.getElementById("product-name").value,
            price: parseFloat(document.getElementById("product-price").value),
            stock: parseInt(document.getElementById("product-stock").value),
            category_id: parseInt(document.getElementById("product-category").value),
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
                alert("Erro ao salvar produto: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erro de conexão ao salvar produto.");
        }
    }

    async deleteProduct(productId) {
        try {
            const response = await this.fetchApi(`/api/products/${productId}`, "DELETE");
            if (response.ok) {
                this.loadProducts();
            } else {
                alert("Erro ao excluir produto: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Erro de conexão ao excluir produto.");
        }
    }

    // Clients Module
    async loadClients() {
        try {
            const response = await this.fetchApi("/api/clients");
            if (response.ok) {
                this.clients = await response.json();
                this.renderClients();
            } else {
                console.error("Failed to load clients:", await response.text());
            }
        } catch (error) {
            console.error("Error loading clients:", error);
        }
    }

    renderClients(clientsToRender = this.clients) {
        const tbody = this.elements.clientsTableBody;
        tbody.innerHTML = "";
        if (clientsToRender.length === 0) {
            this.elements.clientsEmptyState.style.display = "block";
            this.elements.clientsTableBody.closest(".table-responsive").style.display = "none";
            return;
        }
        this.elements.clientsEmptyState.style.display = "none";
        this.elements.clientsTableBody.closest(".table-responsive").style.display = "block";

        clientsToRender.forEach(client => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${client.name}</td>
                <td>${client.phone || "N/A"}</td>
                <td>${client.email || "N/A"}</td>
                <td>${client.status === "active" ? "Ativo" : "Inativo"}</td>
                <td class="action-buttons">
                    <button class="btn-primary btn-sm" data-id="${client.id}" data-action="edit-client">Editar</button>
                    <button class="btn-danger btn-sm" data-id="${client.id}" data-action="delete-client">Excluir</button>
                </td>
            `;
            row.querySelector("[data-action=\"edit-client\"]").addEventListener("click", (e) => this.openClientModal(client));
            row.querySelector("[data-action=\"delete-client\"]").addEventListener("click", (e) => this.showConfirmationModal(
                `Tem certeza que deseja excluir o cliente ${client.name}?`,
                () => this.deleteClient(client.id)
            ));
        });
    }

    filterClients(searchTerm, filterType = "all") {
        let filtered = this.clients;

        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.phone && client.phone.includes(searchTerm))
            );
        }

        if (filterType !== "all") {
            if (filterType === "debtors") {
                // This would require a backend endpoint or more complex client-side logic
                // For now, let's assume a simple flag or a placeholder
                filtered = filtered.filter(client => client.has_debt); // Placeholder
            } else {
                filtered = filtered.filter(client => client.status === filterType);
            }
        }
        this.renderClients(filtered);
    }

    openClientModal(client = null) {
        const form = this.elements.clientForm;
        form.reset();
        document.getElementById("client-id").value = "";
        if (client) {
            document.getElementById("client-id").value = client.id;
            document.getElementById("client-name").value = client.name;
            document.getElementById("client-phone").value = client.phone;
            document.getElementById("client-email").value = client.email;
            document.getElementById("client-status").value = client.status;
        }
        this.showModal(this.elements.clientModal);
    }

    async handleClientFormSubmit(event) {
        event.preventDefault();
        const clientId = document.getElementById("client-id").value;
        const clientData = {
            name: document.getElementById("client-name").value,
            phone: document.getElementById("client-phone").value,
            email: document.getElementById("client-email").value,
            status: document.getElementById("client-status").value,
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
                alert("Erro ao salvar cliente: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error saving client:", error);
            alert("Erro de conexão ao salvar cliente.");
        }
    }

    async deleteClient(clientId) {
        try {
            const response = await this.fetchApi(`/api/clients/${clientId}`, "DELETE");
            if (response.ok) {
                this.loadClients();
            } else {
                alert("Erro ao excluir cliente: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            alert("Erro de conexão ao excluir cliente.");
        }
    }

    // Sales Module
    async loadProductsForSale() {
        try {
            const response = await this.fetchApi("/api/products");
            if (response.ok) {
                this.products = await response.json();
                this.renderProductsForSale();
            } else {
                console.error("Failed to load products for sale:", await response.text());
            }
        } catch (error) {
            console.error("Error loading products for sale:", error);
        }
    }

    renderProductsForSale(productsToRender = this.products) {
        const productList = this.elements.productListForSale;
        productList.innerHTML = "";
        if (productsToRender.length === 0) {
            productList.innerHTML = "<p>Nenhum produto disponível para venda.</p>";
            return;
        }
        productsToRender.forEach(product => {
            const productItem = document.createElement("div");
            productItem.classList.add("product-item-sale", "card");
            productItem.dataset.id = product.id;
            productItem.innerHTML = `
                <h4>${product.name}</h4>
                <p>R$ ${product.price.toFixed(2)}</p>
                <small>Estoque: ${product.stock}</small>
            `;
            productItem.addEventListener("click", () => this.addProductToCart(product));
            productList.appendChild(productItem);
        });
    }

    handleSaleProductSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const filtered = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );
        this.renderProductsForSale(filtered);
    }

    addProductToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                alert(`Estoque máximo de ${product.name} atingido.`);
            }
        } else {
            if (product.stock > 0) {
                this.cart.push({ ...product, quantity: 1 });
            } else {
                alert(`${product.name} está fora de estoque.`);
            }
        }
        this.renderCart();
        this.updateCartSummary();
    }

    updateCartItemQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const productInStock = this.products.find(p => p.id === productId);
            if (productInStock) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    this.cart = this.cart.filter(i => i.id !== productId);
                } else if (item.quantity > productInStock.stock) {
                    item.quantity = productInStock.stock;
                    alert(`Estoque máximo de ${item.name} atingido.`);
                }
            }
        }
        this.renderCart();
        this.updateCartSummary();
    }

    removeProductFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.renderCart();
        this.updateCartSummary();
    }

    renderCart() {
        const cartItemsDiv = this.elements.cartItems;
        cartItemsDiv.innerHTML = "";
        if (this.cart.length === 0) {
            cartItemsDiv.innerHTML = "<p class=\"empty-cart-message\">Carrinho vazio. Adicione produtos!</p>";
            return;
        }
        this.cart.forEach(item => {
            const cartItemDiv = document.createElement("div");
            cartItemDiv.classList.add("cart-item");
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button data-id="${item.id}" data-action="decrease">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button data-id="${item.id}" data-action="increase">+</button>
                    <button data-id="${item.id}" data-action="remove">x</button>
                </div>
            `;
            cartItemDiv.querySelector("[data-action=\"decrease\"]").addEventListener("click", () => this.updateCartItemQuantity(item.id, -1));
            cartItemDiv.querySelector("[data-action=\"increase\"]").addEventListener("click", () => this.updateCartItemQuantity(item.id, 1));
            cartItemDiv.querySelector("[data-action=\"remove\"]").addEventListener("click", () => this.removeProductFromCart(item.id));
            cartItemsDiv.appendChild(cartItemDiv);
        });
    }

    updateCartSummary() {
        let subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountPercentage = parseFloat(this.elements.cartDiscountPercentage.value) || 0;
        let discountValue = parseFloat(this.elements.cartDiscountValue.value) || 0;

        // Apply percentage discount first
        let total = subtotal * (1 - discountPercentage / 100);
        // Then apply fixed value discount
        total -= discountValue;

        if (total < 0) total = 0; // Ensure total doesn't go negative

        this.elements.cartSubtotal.textContent = `R$ ${subtotal.toFixed(2)}`;
        this.elements.cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    async handleFinalizeSale() {
        if (this.cart.length === 0) {
            alert("O carrinho está vazio. Adicione produtos para finalizar a venda.");
            return;
        }

        const saleData = {
            items: this.cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price_at_sale: item.price,
            })),
            total_amount: parseFloat(this.elements.cartTotal.textContent.replace("R$ ", "")), // Get actual total
            discount_percentage: parseFloat(this.elements.cartDiscountPercentage.value) || 0,
            discount_value: parseFloat(this.elements.cartDiscountValue.value) || 0,
            // Add client_id if you implement client selection for sales
        };

        this.showConfirmationModal(
            `Confirmar venda no valor total de ${this.elements.cartTotal.textContent}?`,
            async () => {
                try {
                    const response = await this.fetchApi("/api/sales", "POST", saleData);
                    if (response.ok) {
                        alert("Venda finalizada com sucesso!");
                        this.cart = [];
                        this.renderCart();
                        this.updateCartSummary();
                        this.loadProductsForSale(); // Refresh product stock
                    } else {
                        alert("Erro ao finalizar venda: " + (await response.text()));
                    }
                } catch (error) {
                    console.error("Error finalizing sale:", error);
                    alert("Erro de conexão ao finalizar venda.");
                }
            }
        );
    }

    handleCancelSale() {
        this.showConfirmationModal(
            "Tem certeza que deseja cancelar a venda atual? O carrinho será esvaziado.",
            () => {
                this.cart = [];
                this.renderCart();
                this.updateCartSummary();
                alert("Venda cancelada.");
            }
        );
    }

    // Receivables Module
    async loadReceivables() {
        try {
            const response = await this.fetchApi("/api/receivables"); // Assuming a /api/receivables endpoint
            if (response.ok) {
                this.receivables = await response.json();
                this.renderReceivables();
            } else {
                console.error("Failed to load receivables:", await response.text());
            }
        } catch (error) {
            console.error("Error loading receivables:", error);
        }
    }

    async loadClientsForReceivables() {
        // Reuse loadClients if it fetches all client data needed
        if (this.clients.length === 0) {
            await this.loadClients();
        }
        const receivableClientSelect = document.getElementById("receivable-client");
        if (receivableClientSelect) {
            receivableClientSelect.innerHTML = 
                `<option value="">Selecione um Cliente</option>` +
                this.clients.map(client => `<option value="${client.id}">${client.name}</option>`).join("");
        }
    }

    renderReceivables(receivablesToRender = this.receivables) {
        const tbody = this.elements.receivablesTableBody;
        tbody.innerHTML = "";
        if (receivablesToRender.length === 0) {
            this.elements.receivablesEmptyState.style.display = "block";
            this.elements.receivablesTableBody.closest(".table-responsive").style.display = "none";
            return;
        }
        this.elements.receivablesEmptyState.style.display = "none";
        this.elements.receivablesTableBody.closest(".table-responsive").style.display = "block";

        receivablesToRender.forEach(receivable => {
            const clientName = this.clients.find(c => c.id === receivable.client_id)?.name || "N/A";
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${clientName}</td>
                <td>R$ ${receivable.amount.toFixed(2)}</td>
                <td>${new Date(receivable.due_date).toLocaleDateString()}</td>
                <td>${receivable.status}</td>
                <td class="action-buttons">
                    <button class="btn-primary btn-sm" data-id="${receivable.id}" data-action="edit-receivable">Editar</button>
                    <button class="btn-danger btn-sm" data-id="${receivable.id}" data-action="delete-receivable">Excluir</button>
                </td>
            `;
            row.querySelector("[data-action=\"edit-receivable\"]").addEventListener("click", (e) => this.openReceivableModal(receivable));
            row.querySelector("[data-action=\"delete-receivable\"]").addEventListener("click", (e) => this.showConfirmationModal(
                `Tem certeza que deseja excluir esta conta a receber?`,
                () => this.deleteReceivable(receivable.id)
            ));
        });
    }

    filterReceivables(searchTerm, filterType = "all") {
        let filtered = this.receivables;

        if (searchTerm) {
            filtered = filtered.filter(receivable => {
                const clientName = this.clients.find(c => c.id === receivable.client_id)?.name || "";
                return clientName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        if (filterType !== "all") {
            filtered = filtered.filter(receivable => receivable.status === filterType);
        }
        this.renderReceivables(filtered);
    }

    openReceivableModal(receivable = null) {
        const form = this.elements.receivableForm;
        form.reset();
        document.getElementById("receivable-id").value = "";
        if (receivable) {
            document.getElementById("receivable-id").value = receivable.id;
            document.getElementById("receivable-client").value = receivable.client_id;
            document.getElementById("receivable-amount").value = receivable.amount;
            document.getElementById("receivable-due-date").value = receivable.due_date; // YYYY-MM-DD format
            document.getElementById("receivable-status").value = receivable.status;
        }
        this.showModal(this.elements.receivableModal);
    }

    async handleReceivableFormSubmit(event) {
        event.preventDefault();
        const receivableId = document.getElementById("receivable-id").value;
        const receivableData = {
            client_id: parseInt(document.getElementById("receivable-client").value),
            amount: parseFloat(document.getElementById("receivable-amount").value),
            due_date: document.getElementById("receivable-due-date").value,
            status: document.getElementById("receivable-status").value,
        };

        try {
            let response;
            if (receivableId) {
                response = await this.fetchApi(`/api/receivables/${receivableId}`, "PUT", receivableData);
            } else {
                response = await this.fetchApi("/api/receivables", "POST", receivableData);
            }

            if (response.ok) {
                this.closeModal(this.elements.receivableModal);
                this.loadReceivables();
            } else {
                alert("Erro ao salvar conta a receber: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error saving receivable:", error);
            alert("Erro de conexão ao salvar conta a receber.");
        }
    }

    async deleteReceivable(receivableId) {
        try {
            const response = await this.fetchApi(`/api/receivables/${receivableId}`, "DELETE");
            if (response.ok) {
                this.loadReceivables();
            } else {
                alert("Erro ao excluir conta a receber: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error deleting receivable:", error);
            alert("Erro de conexão ao excluir conta a receber.");
        }
    }

    // Reports Module
    async generateReport() {
        const reportType = this.elements.reportTypeSelect.value;
        const reportPeriod = this.elements.reportPeriodSelect.value;
        this.elements.reportContent.innerHTML = "<p>Gerando relatório...</p>";
        if (this.reportChart) {
            this.reportChart.destroy();
            this.elements.reportChartCanvas.style.display = "none";
        }

        try {
            const response = await this.fetchApi(`/api/reports/${reportType}?period=${reportPeriod}`); // Assuming a /api/reports endpoint
            if (response.ok) {
                const reportData = await response.json();
                this.renderReport(reportType, reportData);
            } else {
                this.elements.reportContent.innerHTML = `<p>Erro ao gerar relatório: ${await response.text()}</p>`;
            }
        } catch (error) {
            console.error("Error generating report:", error);
            this.elements.reportContent.innerHTML = "<p>Erro de conexão ao gerar relatório.</p>";
        }
    }

    renderReport(reportType, data) {
        this.elements.reportContent.innerHTML = ""; // Clear previous content
        this.elements.reportChartCanvas.style.display = "block";

        let labels = [];
        let values = [];
        let title = "";

        switch (reportType) {
            case "sales-summary":
                title = "Resumo de Vendas";
                // Assuming data is an array of {date: "YYYY-MM-DD", total_sales: X}
                labels = data.map(item => item.date);
                values = data.map(item => item.total_sales);
                this.elements.reportContent.innerHTML = `
                    <h3>${title}</h3>
                    <p>Total de Vendas no Período: R$ ${values.reduce((a, b) => a + b, 0).toFixed(2)}</p>
                `;
                break;
            case "product-performance":
                title = "Desempenho de Produtos";
                // Assuming data is an array of {product_name: "X", units_sold: Y}
                labels = data.map(item => item.product_name);
                values = data.map(item => item.units_sold);
                this.elements.reportContent.innerHTML = `<h3>${title}</h3>`;
                break;
            case "client-debt":
                title = "Dívida de Clientes";
                // Assuming data is an array of {client_name: "X", total_debt: Y}
                labels = data.map(item => item.client_name);
                values = data.map(item => item.total_debt);
                this.elements.reportContent.innerHTML = `<h3>${title}</h3>`;
                break;
        }

        // Render Chart
        const ctx = this.elements.reportChartCanvas.getContext("2d");
        if (this.reportChart) {
            this.reportChart.destroy(); // Destroy previous chart instance
        }
        this.reportChart = new Chart(ctx, {
            type: "bar", // Can be 'line', 'pie', etc.
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "#444" },
                        ticks: { color: "#e0e0e0" }
                    },
                    x: {
                        grid: { color: "#444" },
                        ticks: { color: "#e0e0e0" }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: title, color: "#e0e0e0" }
                }
            }
        });
    }

    // Dashboard Module
    async loadDashboardMetrics() {
        try {
            // Fetch sales today
            const salesTodayResponse = await this.fetchApi("/api/reports/sales-summary?period=today");
            if (salesTodayResponse.ok) {
                const data = await salesTodayResponse.json();
                const totalSalesToday = data.reduce((sum, item) => sum + item.total_sales, 0);
                document.querySelector("#dashboard-page .metric-card:nth-child(1) .metric-value").textContent = `R$ ${totalSalesToday.toFixed(2)}`;
            }

            // Fetch products sold (example - might need a specific endpoint)
            // For now, placeholder
            document.querySelector("#dashboard-page .metric-card:nth-child(2) .metric-value").textContent = "0";

            // Fetch new clients (example - might need a specific endpoint)
            // For now, placeholder
            document.querySelector("#dashboard-page .metric-card:nth-child(3) .metric-value").textContent = "0";

            // Fetch receivables total
            const receivablesResponse = await this.fetchApi("/api/receivables");
            if (receivablesResponse.ok) {
                const data = await receivablesResponse.json();
                const totalReceivables = data.filter(r => r.status === "open" || r.status === "overdue").reduce((sum, item) => sum + item.amount, 0);
                document.querySelector("#dashboard-page .metric-card:nth-child(4) .metric-value").textContent = `R$ ${totalReceivables.toFixed(2)}`;
            }

            // Load sales chart data
            const salesChartResponse = await this.fetchApi("/api/reports/sales-summary?period=this-year");
            if (salesChartResponse.ok) {
                const salesData = await salesChartResponse.json();
                this.renderSalesChart(salesData);
            }

        } catch (error) {
            console.error("Error loading dashboard metrics:", error);
        }
    }

    renderSalesChart(salesData) {
        const ctx = document.getElementById("salesChart").getContext("2d");
        const labels = salesData.map(item => item.date); // Assuming date is month or year
        const data = salesData.map(item => item.total_sales);

        if (this.salesChartInstance) {
            this.salesChartInstance.destroy();
        }

        this.salesChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Vendas",
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: "#444" },
                        ticks: { color: "#e0e0e0" }
                    },
                    x: {
                        grid: { color: "#444" },
                        ticks: { color: "#e0e0e0" }
                    }
                },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Vendas por Período", color: "#e0e0e0" }
                }
            }
        });
    }

    // Settings Module - User Management
    async loadUsers() {
        try {
            const response = await this.fetchApi("/api/users");
            if (response.ok) {
                this.users = await response.json();
                this.renderUsers();
            } else {
                console.error("Failed to load users:", await response.text());
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    renderUsers() {
        const tbody = this.elements.usersTableBody;
        tbody.innerHTML = "";
        this.users.forEach(user => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${user.full_name || "N/A"}</td>
                <td>${user.email}</td>
                <td>${user.is_admin ? "Sim" : "Não"}</td>
                <td>${user.is_active ? "Sim" : "Não"}</td>
                <td class="action-buttons">
                    <button class="btn-primary btn-sm" data-id="${user.id}" data-action="edit-user">Editar</button>
                    <button class="btn-danger btn-sm" data-id="${user.id}" data-action="delete-user">Excluir</button>
                </td>
            `;
            row.querySelector("[data-action=\"edit-user\"]").addEventListener("click", (e) => this.openUserModal(user));
            row.querySelector("[data-action=\"delete-user\"]").addEventListener("click", (e) => this.showConfirmationModal(
                `Tem certeza que deseja excluir o usuário ${user.email}?`,
                () => this.deleteUser(user.id)
            ));
        });
    }

    openUserModal(user = null) {
        const form = this.elements.userForm;
        form.reset();
        document.getElementById("user-id").value = "";
        document.getElementById("user-password").required = true; // Password is required for new users

        if (user) {
            document.getElementById("user-id").value = user.id;
            document.getElementById("user-full-name").value = user.full_name;
            document.getElementById("user-email").value = user.email;
            document.getElementById("user-is-admin").checked = user.is_admin;
            document.getElementById("user-is-active").checked = user.is_active;
            document.getElementById("user-password").required = false; // Not required for edit
        }
        this.showModal(this.elements.userModal);
    }

    async handleUserFormSubmit(event) {
        event.preventDefault();
        const userId = document.getElementById("user-id").value;
        const userData = {
            full_name: document.getElementById("user-full-name").value,
            email: document.getElementById("user-email").value,
            is_admin: document.getElementById("user-is-admin").checked,
            is_active: document.getElementById("user-is-active").checked,
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
                // For new user, use signup endpoint
                response = await this.fetchApi("/api/auth/signup", "POST", { ...userData, password });
            }

            if (response.ok) {
                this.closeModal(this.elements.userModal);
                this.loadUsers();
            } else {
                alert("Erro ao salvar usuário: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error saving user:", error);
            alert("Erro de conexão ao salvar usuário.");
        }
    }

    async deleteUser(userId) {
        try {
            const response = await this.fetchApi(`/api/users/${userId}`, "DELETE");
            if (response.ok) {
                this.loadUsers();
            } else {
                alert("Erro ao excluir usuário: " + (await response.text()));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Erro de conexão ao excluir usuário.");
        }
    }

}

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    window.app = new SGApp();
});
