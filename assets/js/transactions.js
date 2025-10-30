// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function () {
  // console.log("🚀 Inicializando página de transações...");
  initializeTransactions();
});

// ========== CONFIGURAÇÃO DA API ==========
const API_BASE_URL = "https://api-backend-coins.onrender.com/api";

// Cache e rate limiting
let transactionsCache = null;
let lastApiCall = 0;
const API_COOLDOWN = 1000; // Reduzido para 1s

// Estado da aplicação
let currentFilter = "sent"; // Inicia com 'sent' como padrão
let currentPage = 1;
let hasMoreTransactions = true;
const ITEMS_PER_PAGE = 20;

// ========== FUNÇÃO PARA FAZER REQUISIÇÕES AUTENTICADAS ==========
async function apiRequest(endpoint, options = {}) {
  try {
    const now = Date.now();
    if (now - lastApiCall < API_COOLDOWN) {
      // console.log("⏳ Aguardando cooldown da API...");
      await new Promise((resolve) =>
        setTimeout(resolve, API_COOLDOWN - (now - lastApiCall))
      );
    }

    const token = Auth.getToken();
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    lastApiCall = Date.now();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textResponse = await response.text();
      console.error("Resposta não é JSON:", textResponse);
      throw new Error("Resposta inválida do servidor");
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ Token inválido ou expirado");
      }
      if (response.status === 429) {
        throw new Error("Muitas requisições - tente novamente");
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Erro na requisição API:", error);
    throw error;
  }
}

// ========== SERVIÇO DE TRANSAÇÕES ==========
class TransactionsService {
  // Buscar doações enviadas
  static async getSentDonations(page = 1, limit = ITEMS_PER_PAGE) {
    try {
      // console.log(`📤 Buscando doações ENVIADAS - Página: ${page}`);

      const response = await apiRequest(
        `/users/donations/sent?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        // console.log("✅ Doações enviadas carregadas:", response.data);
        return this.formatDonations(response.data, "sent");
      }
      throw new Error("Resposta inválida da API");
    } catch (error) {
      console.error("❌ Erro ao buscar doações enviadas:", error);
      throw error;
    }
  }

  // Buscar doações recebidas
  static async getReceivedDonations(page = 1, limit = ITEMS_PER_PAGE) {
    try {
      // console.log(`📥 Buscando doações RECEBIDAS - Página: ${page}`);

      const response = await apiRequest(
        `/users/donations/received?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        // console.log("✅ Doações recebidas carregadas:", response.data);
        return this.formatDonations(response.data, "received");
      }
      throw new Error("Resposta inválida da API");
    } catch (error) {
      console.error("❌ Erro ao buscar doações recebidas:", error);
      throw error;
    }
  }

  // Formatar doações do backend para o formato esperado pelo frontend
  //Corrigida:
  static formatDonations(data, filterType) {
    const { donations, pagination } = data;

    // Transformar doações do backend para formato do frontend
    const formattedTransactions = donations.map((donation) => {
      const type = filterType;

      // 🔧 CRÍTICO: Verificar se usuários foram excluídos
      const isDonorDeleted =
        donation.donorDeleted ||
        !donation.donor ||
        donation.donor._id === "deleted";

      const isRecipientDeleted =
        donation.recipientDeleted ||
        !donation.recipient ||
        donation.recipient._id === "deleted";

      // Determinar qual usuário mostrar baseado no tipo
      let otherUser, otherUserData;

      if (type === "sent") {
        // Mostrar receptor
        if (isRecipientDeleted) {
          otherUserData = {
            fullName: "Usuário Excluído",
            name: "Usuário Excluído",
            avatar: "🔒",
            profilePhotoUrl: null,
            _id: "deleted",
          };
        } else {
          otherUserData = {
            fullName:
              donation.recipient?.fullName ||
              donation.recipient?.name ||
              donation.recipientInfo?.name ||
              "Usuário Desconhecido",
            name:
              donation.recipient?.name ||
              donation.recipientInfo?.name ||
              "Usuário Desconhecido",
            avatar:
              donation.recipient?.avatar ||
              donation.recipientInfo?.avatar ||
              "👤",
            profilePhotoUrl:
              donation.recipient?.profilePhotoUrl ||
              donation.recipientInfo?.profilePhotoUrl ||
              null,
            _id: donation.recipient?._id || null,
          };
        }
      } else {
        // Mostrar doador
        if (isDonorDeleted) {
          otherUserData = {
            fullName: "Usuário Excluído",
            name: "Usuário Excluído",
            avatar: "🔒",
            profilePhotoUrl: null,
            _id: "deleted",
          };
        } else {
          otherUserData = {
            fullName:
              donation.donor?.fullName ||
              donation.donor?.name ||
              donation.donorInfo?.name ||
              "Usuário Desconhecido",
            name:
              donation.donor?.name ||
              donation.donorInfo?.name ||
              "Usuário Desconhecido",
            avatar:
              donation.donor?.avatar || donation.donorInfo?.avatar || "👤",
            profilePhotoUrl:
              donation.donor?.profilePhotoUrl ||
              donation.donorInfo?.profilePhotoUrl ||
              null,
            _id: donation.donor?._id || null,
          };
        }
      }

      // Descrição com tratamento de usuário excluído
      const description =
        type === "sent"
          ? `Doação para ${otherUserData.fullName}`
          : `Doação de ${otherUserData.fullName}`;

      return {
        id: donation._id,
        type: type,
        amount: donation.amount,
        user: otherUserData.fullName,
        userAvatar: otherUserData.avatar,
        userPhoto: otherUserData.profilePhotoUrl,
        date: donation.createdAt,
        status: donation.status || "completed",
        message: donation.message || "",
        description: description,
        isDeleted: isDonorDeleted || isRecipientDeleted,

        // Dados completos para detalhes (com fallback)
        donor: donation.donor || {
          _id: "deleted",
          name: "Usuário Excluído",
          fullName: "Usuário Excluído",
          avatar: "🔒",
          profilePhotoUrl: null,
        },
        recipient: donation.recipient || {
          _id: "deleted",
          name: "Usuário Excluído",
          fullName: "Usuário Excluído",
          avatar: "🔒",
          profilePhotoUrl: null,
        },
        donorInfo: donation.donorInfo || {
          name: "Usuário Excluído",
          avatar: "🔒",
          profilePhotoUrl: null,
        },
        recipientInfo: donation.recipientInfo || {
          name: "Usuário Excluído",
          avatar: "🔒",
          profilePhotoUrl: null,
        },
      };
    });

    // Calcular totais para resumo
    const sent = formattedTransactions.filter((t) => t.type === "sent");
    const received = formattedTransactions.filter((t) => t.type === "received");

    return {
      transactions: formattedTransactions,
      summary: {
        totalSent: sent.length,
        totalSentAmount: sent.reduce((sum, t) => sum + t.amount, 0),
        totalReceived: received.length,
        totalReceivedAmount: received.reduce((sum, t) => sum + t.amount, 0),
      },
      hasMore: pagination?.hasNext || false,
      pagination: pagination,
    };
  }

  // Buscar transações baseado no filtro atual
  static async getTransactions(
    filter = "sent",
    page = 1,
    limit = ITEMS_PER_PAGE
  ) {
    switch (filter) {
      case "sent":
        return await this.getSentDonations(page, limit);
      case "received":
        return await this.getReceivedDonations(page, limit);
      default:
        return await this.getSentDonations(page, limit);
    }
  }
}

// ========== GERENCIADOR DE UI ==========
class TransactionsUI {
  static showLoading() {
    const loadingState = document.getElementById("loading-state");
    const emptyState = document.getElementById("empty-state");
    const transactionsList = document.getElementById("transactions-list");

    if (loadingState) loadingState.style.display = "flex";
    if (emptyState) emptyState.style.display = "none";
    if (transactionsList) transactionsList.innerHTML = "";
  }

  static hideLoading() {
    const loadingState = document.getElementById("loading-state");
    if (loadingState) loadingState.style.display = "none";
  }

  static showEmpty() {
    const emptyState = document.getElementById("empty-state");
    if (emptyState) emptyState.style.display = "flex";
  }

  static showError(message) {
    const transactionsList = document.getElementById("transactions-list");
    if (transactionsList) {
      transactionsList.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px; color: #f44336;"></i>
          <p style="font-size: 16px; margin-bottom: 8px;">Erro ao carregar transações</p>
          <p style="font-size: 14px; color: #999;">${message}</p>
          <button onclick="refreshTransactions()" style="margin-top: 16px; padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer;">
            <i class="fas fa-redo"></i> Tentar Novamente
          </button>
        </div>
      `;
    }
  }

  static updateSummary(summary) {
    const totalSent = document.getElementById("total-sent");
    const totalSentAmount = document.getElementById("total-sent-amount");
    const totalReceived = document.getElementById("total-received");
    const totalReceivedAmount = document.getElementById(
      "total-received-amount"
    );

    if (totalSent) {
      this.animateNumber(totalSent, 0, summary.totalSent);
    }
    if (totalSentAmount) {
      totalSentAmount.textContent = `${summary.totalSentAmount} moedas`;
    }
    if (totalReceived) {
      this.animateNumber(totalReceived, 0, summary.totalReceived);
    }
    if (totalReceivedAmount) {
      totalReceivedAmount.textContent = `${summary.totalReceivedAmount} moedas`;
    }
  }

  static animateNumber(element, from, to) {
    const duration = 1000;
    const start = Date.now();
    const difference = to - from;

    function update() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(from + difference * progress);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  static renderTransactions(transactions, append = false) {
    const transactionsList = document.getElementById("transactions-list");
    if (!transactionsList) return;

    if (!append) {
      transactionsList.innerHTML = "";
    }

    if (transactions.length === 0 && !append) {
      this.showEmpty();
      return;
    }

    transactions.forEach((transaction, index) => {
      const item = this.createTransactionItem(transaction);
      item.style.animationDelay = `${index * 0.05}s`;
      transactionsList.appendChild(item);
    });
  }

  //Corrigida:
  static createTransactionItem(transaction) {
    const item = document.createElement("div");
    item.className = `transaction-item ${transaction.type}`;
    item.dataset.transactionId = transaction.id;

    // 🔧 CORREÇÃO: Tratar usuário excluído no avatar
    const iconContainer = document.createElement("div");
    iconContainer.className = "transaction-icon";

    // 🆕 Se usuário foi excluído, mostrar ícone especial
    if (transaction.isDeleted) {
      iconContainer.innerHTML = `
        <div style="
          width: 100%; 
          height: 100%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 24px;
          opacity: 0.5;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 25%;
        ">
          🔒
        </div>
      `;
    } else if (transaction.userPhoto) {
      // Usar foto real do GCS
      iconContainer.innerHTML = `
        <img src="${transaction.userPhoto}" 
             alt="${transaction.user}" 
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 25%;"
             onerror="this.style.display='none'; this.parentElement.innerHTML='${transaction.userAvatar}';">
      `;
    } else {
      // Usar emoji avatar como fallback
      iconContainer.textContent = transaction.userAvatar;
      iconContainer.style.fontSize = "24px";
      iconContainer.style.display = "flex";
      iconContainer.style.alignItems = "center";
      iconContainer.style.justifyContent = "center";
    }

    const info = document.createElement("div");
    info.className = "transaction-info";

    const user = document.createElement("div");
    user.className = "transaction-user";

    // 🆕 Adicionar badge para usuário excluído
    const userText =
      transaction.type === "sent"
        ? `Para ${transaction.user}`
        : `De ${transaction.user}`;

    const deletedBadge = transaction.isDeleted
      ? ` <span style="
          font-size: 10px;
          padding: 2px 6px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          margin-left: 6px;
        ">Excluído</span>`
      : "";

    user.innerHTML = userText + deletedBadge;

    const date = document.createElement("div");
    date.className = "transaction-date";
    date.textContent = this.formatDate(transaction.date);

    info.appendChild(user);
    info.appendChild(date);

    const amount = document.createElement("div");
    amount.className = "transaction-amount";
    amount.textContent =
      transaction.type === "sent"
        ? `-${transaction.amount}`
        : `+${transaction.amount}`;

    item.appendChild(iconContainer);
    item.appendChild(info);
    item.appendChild(amount);

    // Click handler para mostrar detalhes
    item.addEventListener("click", () => {
      this.showTransactionDetails(transaction);
    });

    return item;
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? "agora mesmo" : `há ${diffMinutes} minutos`;
      }
      return diffHours === 1 ? "há 1 hora" : `há ${diffHours} horas`;
    }

    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  //Corrigida:
  static showTransactionDetails(transaction) {
    const modal = document.getElementById("transaction-modal");
    const modalBody = document.getElementById("modal-body");

    if (!modal || !modalBody) return;

    const typeText = transaction.type === "sent" ? "Enviada" : "Recebida";
    const userLabel = transaction.type === "sent" ? "Para" : "De";
    const amountClass = transaction.type === "sent" ? "sent" : "received";

    // 🔧 CORREÇÃO: Tratar usuário excluído no modal
    const otherUser =
      transaction.type === "sent" ? transaction.recipient : transaction.donor;

    let photoHtml;

    if (transaction.isDeleted) {
      // Usuário excluído - mostrar ícone especial
      photoHtml = `
        <div style="
          width: 60px; 
          height: 60px; 
          border-radius: 50%; 
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.3);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 32px; 
          margin: 0 auto 16px;
          opacity: 0.6;
        ">
          🔒
        </div>
        <p style="
          text-align: center;
          font-size: 12px;
          color: #ef4444;
          margin-bottom: 16px;
          font-weight: 500;
        ">
          <i class="fas fa-user-slash"></i> Conta Excluída
        </p>
      `;
    } else if (otherUser?.profilePhotoUrl) {
      // Foto real
      photoHtml = `
        <img src="${otherUser.profilePhotoUrl}" 
             alt="${transaction.user}" 
             style="
               width: 60px; 
               height: 60px; 
               border-radius: 50%; 
               object-fit: cover; 
               margin: 0 auto 16px;
             " 
             onerror="this.style.display='none';">
      `;
    } else {
      // Avatar emoji
      photoHtml = `
        <div style="
          width: 60px; 
          height: 60px; 
          border-radius: 50%; 
          background: #f0f0f0; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 32px; 
          margin: 0 auto 16px;
        ">
          ${transaction.userAvatar}
        </div>
      `;
    }

    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        ${photoHtml}
      </div>
      <div class="detail-row">
        <span class="detail-label">Tipo</span>
        <span class="detail-value">${typeText}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">${userLabel}</span>
        <span class="detail-value">${transaction.user}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Valor</span>
        <span class="detail-value amount ${amountClass}">
          ${transaction.type === "sent" ? "-" : "+"}${transaction.amount} moedas
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Data</span>
        <span class="detail-value">${new Date(
          transaction.date
        ).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">
          <span style="color: #4CAF50; font-weight: 500;">
            <i class="fas fa-check-circle"></i> Concluída
          </span>
        </span>
      </div>
      ${
        transaction.message
          ? `
        <div class="detail-row">
          <span class="detail-label">Mensagem</span>
          <span class="detail-value" style="font-style: italic; color: #666;">"${transaction.message}"</span>
        </div>
      `
          : ""
      }
      ${
        transaction.isDeleted
          ? `
        <div style="
          margin-top: 16px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          text-align: center;
        ">
          <i class="fas fa-info-circle" style="color: #ef4444; margin-right: 6px;"></i>
          <span style="font-size: 13px; color: #666;">
            Esta transação foi mantida no histórico, mas a conta do usuário foi excluída.
          </span>
        </div>
      `
          : ""
      }
      <div class="detail-row">
        <span class="detail-label">ID da Transação</span>
        <span class="detail-value" style="font-size: 12px; color: #666; word-break: break-all;">${
          transaction.id
        }</span>
      </div>
    `;

    modal.classList.add("show");
  }

  static updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById("load-more");
    if (loadMoreBtn) {
      loadMoreBtn.style.display = hasMore ? "flex" : "none";
    }
  }
}

// ========== GERENCIADOR DE FILTROS ==========
class FilterManager {
  static setupFilters() {
    const filterChips = document.querySelectorAll(".filter-chip");

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        this.handleFilterChange(chip);
      });
    });
  }

  static async handleFilterChange(chip) {
    // Remover active de todos
    document.querySelectorAll(".filter-chip").forEach((c) => {
      c.classList.remove("active");
    });

    // Adicionar active no clicado
    chip.classList.add("active");

    // Atualizar filtro e resetar página
    currentFilter = chip.dataset.filter;
    currentPage = 1;

    // Recarregar transações com novo filtro
    await loadTransactions();
  }
}

// ========== FUNÇÃO PRINCIPAL PARA CARREGAR TRANSAÇÕES ==========
async function loadTransactions(append = false) {
  if (!append) {
    TransactionsUI.showLoading();
  }

  try {
    const data = await TransactionsService.getTransactions(
      currentFilter,
      currentPage,
      ITEMS_PER_PAGE
    );

    if (data) {
      if (append && transactionsCache) {
        // Adicionar novas transações ao cache
        transactionsCache.transactions = [
          ...transactionsCache.transactions,
          ...data.transactions,
        ];
        // Atualizar totais
        transactionsCache.summary = data.summary;
        hasMoreTransactions = data.hasMore;
      } else {
        // Novo carregamento
        transactionsCache = data;
        hasMoreTransactions = data.hasMore;
      }

      TransactionsUI.hideLoading();
      TransactionsUI.updateSummary(transactionsCache.summary);
      TransactionsUI.renderTransactions(
        append ? data.transactions : transactionsCache.transactions,
        append
      );
      TransactionsUI.updateLoadMoreButton(hasMoreTransactions);

      // console.log("✅ Transações carregadas com sucesso!", {
      //   filter: currentFilter,
      //   page: currentPage,
      //   total: transactionsCache.transactions.length,
      //   hasMore: hasMoreTransactions,
      // });
    }
  } catch (error) {
    console.error("❌ Erro ao carregar transações:", error);
    TransactionsUI.hideLoading();
    TransactionsUI.showError(error.message);
  }
}

// ========== CONFIGURAÇÃO DE NAVEGAÇÃO ==========
function setupNavigation() {
  const backButton = document.getElementById("go-back");
  if (backButton) {
    backButton.addEventListener("click", () => {
      if (
        document.referrer &&
        document.referrer.includes(window.location.host)
      ) {
        window.history.back();
      } else {
        window.location.href = "../html/profile.html";
      }
    });
  }

  // Navegação bottom nav
  const navigationButtons = {
    "go-home": "/pages/home/html/index.html",
    "go-timeline": "../../timeline/html/timeline.html",
    "go-ranks": "../../ranking/html/ranks.html",
    "go-profile": "/pages/profile/pages/profile.html",
  };

  Object.keys(navigationButtons).forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.onclick = () => {
        window.location.href = navigationButtons[buttonId];
      };
    }
  });
}

// ========== CONFIGURAÇÃO DO MODAL ==========
function setupModal() {
  const modal = document.getElementById("transaction-modal");
  const closeBtn = document.getElementById("close-modal");

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  }
}

// ========== CONFIGURAÇÃO DO LOAD MORE ==========
function setupLoadMore() {
  const loadMoreBtn = document.getElementById("load-more");

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", async () => {
      if (!hasMoreTransactions) return;

      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Carregando...';

      currentPage++;
      await loadTransactions(true);

      loadMoreBtn.disabled = false;
      loadMoreBtn.innerHTML =
        '<i class="fas fa-chevron-down"></i> Carregar Mais';
    });
  }
}

// ========== ANIMAÇÃO INICIAL ==========
function animateInitialLoad() {
  const summaryCard = document.querySelector(".summary-card");
  const filterPanel = document.querySelector(".filter-panel");

  if (summaryCard) {
    summaryCard.style.opacity = "0";
    summaryCard.style.transform = "translateY(20px)";
    setTimeout(() => {
      summaryCard.style.transition = "all 0.5s ease";
      summaryCard.style.opacity = "1";
      summaryCard.style.transform = "translateY(0)";
    }, 100);
  }

  if (filterPanel) {
    filterPanel.style.opacity = "0";
    filterPanel.style.transform = "translateY(20px)";
    setTimeout(() => {
      filterPanel.style.transition = "all 0.5s ease";
      filterPanel.style.opacity = "1";
      filterPanel.style.transform = "translateY(0)";
    }, 200);
  }
}

// ========== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ==========
async function initializeTransactions() {
  // console.log("⚙️ Configurando página de transações...");

  // Verificar autenticação
  if (!Auth.getToken()) {
    console.error("❌ Usuário não autenticado");
    return;
  }

  // Configurar componentes
  setupNavigation();
  setupModal();
  FilterManager.setupFilters();
  setupLoadMore();

  // Animação inicial
  animateInitialLoad();

  // Carregar dados
  await loadTransactions();

  // console.log("✅ Página de transações inicializada com sucesso!");
}

// ========== FUNÇÕES DE DEBUG ==========
async function refreshTransactions() {
  // console.log("🔄 Atualizando transações...");
  transactionsCache = null;
  currentPage = 1;
  currentFilter = "sent";

  // Reset filter chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.remove("active");
    if (chip.dataset.filter === "sent") {
      chip.classList.add("active");
    }
  });

  await loadTransactions();
  // console.log("✅ Transações atualizadas!");
}

function debugTransactions() {
  // console.log("🔧 DEBUG - Estado atual:");
  // console.log("Current Filter:", currentFilter);
  // console.log("Current Page:", currentPage);
  // console.log("Has More:", hasMoreTransactions);
  // console.log("Cache:", transactionsCache);
  // console.log("Token:", Auth.getToken() ? "Presente" : "Ausente");
}

// ========== HEADER & FOOTER FUNCTIONALITY ==========

class HeaderFooterManager {
  constructor() {
    this.header = document.getElementById("app-header");
    this.navLinks = document.querySelectorAll(".header-nav-link");
    this.notificationBtn = document.getElementById("header-notification-btn");
    this.notificationBadge = document.getElementById("notification-badge");
    this.footerLinks = document.querySelectorAll(".footer-link");
    this.lastScrollY = window.scrollY;

    this.init();
  }

  init() {
    this.setupScrollBehavior();
    this.setupActiveNavigation();
    this.setupNotifications();
    this.setupFooterLinks();
    this.setupSocialLinks();
  }

  // ========== SCROLL BEHAVIOR ==========
  setupScrollBehavior() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;

    // Adicionar classe 'scrolled' quando rolar para baixo
    if (currentScrollY > 10) {
      this.header?.classList.add("scrolled");
    } else {
      this.header?.classList.remove("scrolled");
    }

    this.lastScrollY = currentScrollY;
  }

  // ========== ACTIVE NAVIGATION ==========
  setupActiveNavigation() {
    const currentPath = window.location.pathname;

    this.navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      // Remove active de todos
      link.classList.remove("active");

      // Adiciona active ao link atual
      if (href && currentPath.includes(href)) {
        link.classList.add("active");
      }
    });

    // Adicionar evento de clique para links placeholder
    this.navLinks.forEach((link) => {
      if (link.getAttribute("href") === "#") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const linkText = link.textContent.trim();

          if (typeof showNotification === "function") {
            showNotification(`Página de ${linkText} em breve!`, "info");
          } else {
            console.log(`Página de ${linkText} em desenvolvimento`);
          }
        });
      }
    });
  }

  // ========== NOTIFICAÇÕES ==========
  setupNotifications() {
    this.notificationBtn?.addEventListener("click", () => {
      this.handleNotificationClick();
    });

    // Inicializar contador em 0
    this.updateNotificationCount(0);
  }

  handleNotificationClick() {
    console.log("Abrindo notificações...");

    if (typeof showNotification === "function") {
      showNotification("Você não tem novas notificações", "info");
    }

    // Zerar contador
    this.updateNotificationCount(0);
  }

  updateNotificationCount(count) {
    if (!this.notificationBadge) return;

    if (count > 0) {
      this.notificationBadge.textContent = count > 99 ? "99+" : count;
      this.notificationBadge.style.display = "flex";
    } else {
      this.notificationBadge.style.display = "none";
    }
  }

  // Método público para adicionar notificação
  addNotification() {
    const currentCount = parseInt(this.notificationBadge?.textContent || "0");
    this.updateNotificationCount(currentCount + 1);
  }

  // Método público para limpar notificações
  clearNotifications() {
    this.updateNotificationCount(0);
  }

  // ========== FOOTER LINKS ==========
  setupFooterLinks() {
    this.footerLinks.forEach((link) => {
      if (link.getAttribute("href") === "#") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const linkText = link.textContent.trim();

          if (typeof showNotification === "function") {
            showNotification(`${linkText} em breve!`, "info");
          } else {
            console.log(`${linkText} em desenvolvimento`);
          }
        });
      }
    });
  }

  // ========== SOCIAL LINKS ==========
  setupSocialLinks() {
    const socialLinks = document.querySelectorAll(".footer-social-link");

    socialLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        // Se o href for '#', prevenir navegação
        if (link.getAttribute("href") === "#") {
          e.preventDefault();
          const platform = link.getAttribute("title");

          // Usar showNotification se disponível
          if (typeof showNotification === "function") {
            showNotification(`Link para ${platform} em breve!`, "info");
          } else {
            console.log(`Link para ${platform} em desenvolvimento`);
          }
        }
      });
    });
  }
}

// ========== INICIALIZAÇÃO ==========

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar gerenciador
  window.headerFooterManager = new HeaderFooterManager();

  console.log("✅ Header & Footer inicializados com notificações");
});

// ========== INTEGRAÇÃO COM WEBSOCKET (OPCIONAL) ==========

// Se o WebSocket estiver disponível, conectar notificações em tempo real
if (typeof wsClient !== "undefined") {
  wsClient.on("notification", (data) => {
    if (window.headerFooterManager) {
      window.headerFooterManager.addNotification();
      if (typeof showNotification === "function") {
        showNotification(data.message || "Nova notificação", "info");
      }
    }
  });
}

// ========== HELPERS PÚBLICOS ==========

// Adicionar uma notificação ao contador
function addHeaderNotification() {
  if (window.headerFooterManager) {
    window.headerFooterManager.addNotification();
  }
}

// Limpar notificações
function clearHeaderNotifications() {
  if (window.headerFooterManager) {
    window.headerFooterManager.clearNotifications();
  }
}

// Exportar para uso global
window.HeaderFooterManager = HeaderFooterManager;
window.addHeaderNotification = addHeaderNotification;
window.clearHeaderNotifications = clearHeaderNotifications;

// ========== EXPOSIÇÃO GLOBAL PARA DEBUG ==========
if (typeof window !== "undefined") {
  window.TransactionsService = TransactionsService;
  window.TransactionsUI = TransactionsUI;
  window.FilterManager = FilterManager;
  window.refreshTransactions = refreshTransactions;
  window.debugTransactions = debugTransactions;
  window.loadTransactions = loadTransactions;
}
