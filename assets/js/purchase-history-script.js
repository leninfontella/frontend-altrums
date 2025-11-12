// ========== PURCHASE HISTORY SYSTEM ==========

if (typeof Auth === "undefined") {
  console.error("❌ Auth.js não está carregado!");
  throw new Error("Auth.js é obrigatório");
}

const PurchaseHistory = {
  currentPage: 1,
  hasMore: true,
  isLoading: false,

  async init() {
    console.log("📦 Inicializando histórico de compras...");

    if (!Auth.checkSession()) {
      Auth.redirectToLogin();
      return;
    }

    await this.loadPurchases();
    this.setupEventListeners();

    console.log("✅ Histórico inicializado!");
  },

  async loadPurchases(append = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const loadingState = document.getElementById("loading-state");
      const purchasesList = document.getElementById("purchases-list");
      const emptyState = document.getElementById("empty-state");

      if (!append) {
        loadingState.style.display = "block";
        purchasesList.style.display = "none";
        emptyState.style.display = "none";
      }

      const token = Auth.getToken();
      const response = await fetch(
        `https://api-backend-coins.onrender.com/api/users/purchases?page=${this.currentPage}&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar histórico");
      }

      const data = await response.json();

      if (data.success) {
        const { purchases, stats, pagination } = data.data;

        // Atualizar estatísticas
        this.updateStats(stats);

        // Renderizar compras
        if (purchases.length === 0 && this.currentPage === 1) {
          loadingState.style.display = "none";
          emptyState.style.display = "block";
        } else {
          loadingState.style.display = "none";
          purchasesList.style.display = "flex";

          if (append) {
            this.appendPurchases(purchases);
          } else {
            this.renderPurchases(purchases);
          }

          // Controlar botão "Carregar Mais"
          this.hasMore = pagination.hasNext;
          this.updateLoadMoreButton();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar compras:", error);
      this.showNotification("Erro ao carregar histórico", "error");
    } finally {
      this.isLoading = false;
    }
  },

  updateStats(stats) {
    const totalPurchasesEl = document.getElementById("total-purchases");
    const totalSpentEl = document.getElementById("total-spent");

    if (totalPurchasesEl) {
      totalPurchasesEl.textContent = stats.totalPurchases || 0;
    }

    if (totalSpentEl) {
      totalSpentEl.textContent = (stats.totalSpent || 0).toLocaleString();
    }
  },

  renderPurchases(purchases) {
    const purchasesList = document.getElementById("purchases-list");
    purchasesList.innerHTML = "";

    purchases.forEach((purchase) => {
      purchasesList.appendChild(this.createPurchaseCard(purchase));
    });
  },

  appendPurchases(purchases) {
    const purchasesList = document.getElementById("purchases-list");

    purchases.forEach((purchase) => {
      purchasesList.appendChild(this.createPurchaseCard(purchase));
    });
  },

  createPurchaseCard(purchase) {
    const card = document.createElement("div");
    card.className = "purchase-item";
    card.onclick = () => this.showPurchaseDetails(purchase.id);

    const icon = this.getProductIcon(purchase.productId);
    const statusText = this.getStatusText(purchase.deliveryStatus);
    const statusClass = this.getStatusClass(purchase.deliveryStatus);

    card.innerHTML = `
      <div class="purchase-icon">
        <i class="${icon}"></i>
      </div>
      <div class="purchase-details">
        <div class="purchase-name">${purchase.productName}</div>
        <div class="purchase-meta">
          <span class="purchase-date">
            <i class="far fa-calendar"></i>
            ${this.formatDate(purchase.createdAt)}
          </span>
          <span class="purchase-status ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="purchase-price">${purchase.price.toLocaleString()} 🪙</div>
    `;

    return card;
  },

  getProductIcon(productId) {
    const icons = {
      monitor: "fas fa-desktop",
      smartwatch: "fas fa-clock",
      alexa: "fas fa-volume-up",
      fone: "fas fa-headphones",
      teclado: "fas fa-keyboard",
      mouse: "fas fa-mouse",
      tenis: "fas fa-running",
      camiseta: "fas fa-tshirt",
      oculos: "fas fa-glasses",
      livros: "fas fa-book",
    };
    return icons[productId] || "fas fa-gift";
  },

  getStatusText(status) {
    const texts = {
      pending: "Pendente",
      contacted: "Contatado",
      in_transit: "Em trânsito",
      delivered: "Entregue",
    };
    return texts[status] || "Pendente";
  },

  getStatusClass(status) {
    return status === "delivered" ? "status-delivered" : "";
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  },

  updateLoadMoreButton() {
    const container = document.getElementById("load-more-container");
    const button = document.getElementById("load-more-btn");

    if (this.hasMore) {
      container.style.display = "block";
      button.disabled = false;
      button.textContent = "Carregar Mais";
    } else {
      container.style.display = "none";
    }
  },

  async loadMore() {
    if (!this.hasMore || this.isLoading) return;

    this.currentPage++;
    const button = document.getElementById("load-more-btn");
    button.disabled = true;
    button.textContent = "Carregando...";

    await this.loadPurchases(true);
  },

  async showPurchaseDetails(purchaseId) {
    try {
      const token = Auth.getToken();
      const response = await fetch(
        `https://api-backend-coins.onrender.com/api/users/purchases/${purchaseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Erro ao carregar detalhes");

      const data = await response.json();

      if (data.success) {
        this.showDetailsModal(data.data.purchase);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar detalhes:", error);
      this.showNotification("Erro ao carregar detalhes", "error");
    }
  },

  showDetailsModal(purchase) {
    const existingModal = document.getElementById("purchase-details-modal");
    if (existingModal) existingModal.remove();

    const icon = this.getProductIcon(purchase.productId);
    const statusText = this.getStatusText(purchase.deliveryStatus);

    const modalHTML = `
      <div id="purchase-details-modal" class="modal">
        <div class="modal-backdrop" onclick="closePurchaseDetailsModal()"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>Detalhes da Compra</h3>
            <button class="close-btn" onclick="closePurchaseDetailsModal()">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="detail-icon">
              <i class="${icon}"></i>
            </div>
            
            <h2>${purchase.productName}</h2>
            
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Preço</span>
                <span class="detail-value">${purchase.price.toLocaleString()} 🪙</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">${statusText}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Data</span>
                <span class="detail-value">${purchase.formattedDate}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Saldo após compra</span>
                <span class="detail-value">${purchase.balanceAfter.toLocaleString()} 🪙</span>
              </div>
            </div>
            
            <div class="detail-note">
              <i class="fas fa-info-circle"></i>
              Entraremos em contato em breve para entregar seu prêmio!
            </div>
          </div>
          
          <button class="modal-close-btn" onclick="closePurchaseDetailsModal()">Fechar</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.addModalStyles();
  },

  addModalStyles() {
    if (document.getElementById("modal-styles")) return;

    const styles = `
      <style id="modal-styles">
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
        }

        .modal-content {
          position: relative;
          background: rgba(30, 30, 30, 0.95);
          backdrop-filter: blur(30px);
          border: 2px solid rgba(0, 212, 255, 0.3);
          border-radius: 24px;
          width: 90%;
          max-width: 400px;
          padding: 0;
          overflow: hidden;
          animation: slideUp 0.4s ease;
        }

        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 18px;
          color: #ffffff;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: #ffffff;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
          padding: 24px;
          text-align: center;
        }

        .detail-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: #00d4ff;
          margin: 0 auto 16px;
        }

        .modal-body h2 {
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 24px;
        }

        .detail-grid {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .detail-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .detail-note {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 12px;
          padding: 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close-btn {
          width: calc(100% - 48px);
          margin: 0 24px 24px;
          background: linear-gradient(135deg, #00d4ff, #0099cc);
          border: none;
          border-radius: 12px;
          padding: 14px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modal-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML("beforeend", styles);
  },

  setupEventListeners() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => this.loadMore());
    }
  },

  showNotification(message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Implementar sistema de notificação visual se necessário
  },
};

// ========== FUNÇÕES GLOBAIS ==========

function goBack() {
  window.history.back();
}

function closePurchaseDetailsModal() {
  const modal = document.getElementById("purchase-details-modal");
  if (modal) {
    modal.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => modal.remove(), 300);
  }
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener("DOMContentLoaded", () => {
  PurchaseHistory.init();
});

window.PurchaseHistory = PurchaseHistory;
window.goBack = goBack;
window.closePurchaseDetailsModal = closePurchaseDetailsModal;
