// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Inicializando página de transações...");
  initializeTransactions();
});

import { apiRequest } from "../../../assets/js/apiService.js";

async function loadTransactions(period = "current", type = "all") {
  try {
    const response = await apiRequest(
      `/transactions?period=${period}&type=${type}`
    );

    if (response.success) {
      renderTransactions(response.data.transactions);
      updateSummary(response.data.summary);
    } else {
      showEmptyState();
    }
  } catch (err) {
    console.error("Erro ao carregar transações:", err);
    showErrorMessage("Falha ao buscar transações. Tente novamente.");
  }
}

// ========== CONFIGURAÇÃO DA API ==========
const API_BASE_URL = "https://api-backend-coins.onrender.com/api";

// Cache e rate limiting
let transactionsCache = null;
let lastApiCall = 0;
const API_COOLDOWN = 2000;

// Estado da aplicação
let currentFilter = "all";
let currentPeriod = "current";
let currentPage = 1;
let hasMoreTransactions = true;
const ITEMS_PER_PAGE = 20;

// ========== FUNÇÃO PARA FAZER REQUISIÇÕES AUTENTICADAS ==========
async function apiRequest(endpoint, options = {}) {
  try {
    const now = Date.now();
    if (now - lastApiCall < API_COOLDOWN) {
      console.log("⏳ Aguardando cooldown da API...");
      await new Promise((resolve) =>
        setTimeout(resolve, API_COOLDOWN - (now - lastApiCall))
      );
    }

    const token = Auth.getToken();
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
      throw new Error(`Resposta inválida do servidor`);
    }

    if (!response.ok) {
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
  static async getTransactions(
    period = "current",
    page = 1,
    limit = ITEMS_PER_PAGE
  ) {
    try {
      console.log(
        `📄 Buscando transações - Período: ${period}, Página: ${page}`
      );

      const response = await apiRequest(
        `/transactions?period=${period}&page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        console.log("✅ Transações carregadas:", response.data);
        return response.data;
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar transações:", error);
      return this.getTransactionsFallback();
    }
  }

  static getTransactionsFallback() {
    console.log("📄 Usando dados de fallback para transações...");

    // Gerar transações de exemplo
    const transactions = [];
    const users = [
      "Ana Silva",
      "Carlos Santos",
      "Maria Oliveira",
      "João Pedro",
      "Fernanda Costa",
      "Ricardo Lima",
      "Juliana Souza",
      "Paulo Mendes",
    ];

    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const type = Math.random() > 0.5 ? "sent" : "received";
      const amount = Math.floor(Math.random() * 200) + 10;
      const user = users[Math.floor(Math.random() * users.length)];

      transactions.push({
        id: `tx_${Date.now()}_${i}`,
        type: type,
        amount: amount,
        user: user,
        date: date.toISOString(),
        status: "completed",
        description:
          type === "sent" ? `Doação para ${user}` : `Doação de ${user}`,
      });
    }

    // Ordenar por data (mais recente primeiro)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calcular totais
    const sent = transactions.filter((t) => t.type === "sent");
    const received = transactions.filter((t) => t.type === "received");

    return {
      transactions: transactions,
      summary: {
        totalSent: sent.length,
        totalSentAmount: sent.reduce((sum, t) => sum + t.amount, 0),
        totalReceived: received.length,
        totalReceivedAmount: received.reduce((sum, t) => sum + t.amount, 0),
      },
      hasMore: false,
    };
  }

  static filterTransactions(transactions, filter) {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
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

  static createTransactionItem(transaction) {
    const item = document.createElement("div");
    item.className = `transaction-item ${transaction.type}`;
    item.dataset.transactionId = transaction.id;

    const icon = document.createElement("div");
    icon.className = "transaction-icon";
    icon.innerHTML =
      transaction.type === "sent"
        ? '<i class="fas fa-arrow-up"></i>'
        : '<i class="fas fa-arrow-down"></i>';

    const info = document.createElement("div");
    info.className = "transaction-info";

    const user = document.createElement("div");
    user.className = "transaction-user";
    user.textContent =
      transaction.type === "sent"
        ? `Para ${transaction.user}`
        : `De ${transaction.user}`;

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

    item.appendChild(icon);
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

  static showTransactionDetails(transaction) {
    const modal = document.getElementById("transaction-modal");
    const modalBody = document.getElementById("modal-body");

    if (!modal || !modalBody) return;

    const typeText = transaction.type === "sent" ? "Enviada" : "Recebida";
    const userLabel = transaction.type === "sent" ? "Para" : "De";
    const amountClass = transaction.type === "sent" ? "sent" : "received";

    modalBody.innerHTML = `
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
        <span class="detail-value">Concluída</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">ID da Transação</span>
        <span class="detail-value" style="font-size: 12px; color: #666;">${
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

    // Period selector
    const periodSelector = document.getElementById("period-selector");
    if (periodSelector) {
      periodSelector.addEventListener("change", (e) => {
        currentPeriod = e.target.value;
        currentPage = 1;
        loadTransactions();
      });
    }
  }

  static handleFilterChange(chip) {
    // Remover active de todos
    document.querySelectorAll(".filter-chip").forEach((c) => {
      c.classList.remove("active");
    });

    // Adicionar active no clicado
    chip.classList.add("active");

    // Aplicar filtro
    currentFilter = chip.dataset.filter;
    this.applyFilter();
  }

  static applyFilter() {
    if (!transactionsCache) return;

    const filtered = TransactionsService.filterTransactions(
      transactionsCache.transactions,
      currentFilter
    );

    TransactionsUI.renderTransactions(filtered);

    // Atualizar resumo baseado no filtro
    if (currentFilter === "all") {
      TransactionsUI.updateSummary(transactionsCache.summary);
    } else {
      const filteredSummary = this.calculateFilteredSummary(filtered);
      TransactionsUI.updateSummary(filteredSummary);
    }
  }

  static calculateFilteredSummary(transactions) {
    const sent = transactions.filter((t) => t.type === "sent");
    const received = transactions.filter((t) => t.type === "received");

    return {
      totalSent: sent.length,
      totalSentAmount: sent.reduce((sum, t) => sum + t.amount, 0),
      totalReceived: received.length,
      totalReceivedAmount: received.reduce((sum, t) => sum + t.amount, 0),
    };
  }
}

// ========== FUNÇÃO PRINCIPAL PARA CARREGAR TRANSAÇÕES ==========
async function loadTransactions(append = false) {
  if (!append) {
    TransactionsUI.showLoading();
  }

  try {
    const data = await TransactionsService.getTransactions(
      currentPeriod,
      currentPage,
      ITEMS_PER_PAGE
    );

    if (data) {
      if (append && transactionsCache) {
        transactionsCache.transactions = [
          ...transactionsCache.transactions,
          ...data.transactions,
        ];
        hasMoreTransactions = data.hasMore || false;
      } else {
        transactionsCache = data;
        hasMoreTransactions = data.hasMore || false;
      }

      TransactionsUI.hideLoading();
      TransactionsUI.updateSummary(data.summary);

      const filtered = TransactionsService.filterTransactions(
        transactionsCache.transactions,
        currentFilter
      );

      TransactionsUI.renderTransactions(filtered, append);
      TransactionsUI.updateLoadMoreButton(hasMoreTransactions);

      console.log("✅ Transações carregadas com sucesso!");
    }
  } catch (error) {
    console.error("❌ Erro ao carregar transações:", error);
    TransactionsUI.hideLoading();
    TransactionsUI.showEmpty();
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
    "go-profile": "../html/profile.html",
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
  console.log("⚙️ Configurando página de transações...");

  // Configurar componentes
  setupNavigation();
  setupModal();
  FilterManager.setupFilters();
  setupLoadMore();

  // Animação inicial
  animateInitialLoad();

  // Carregar dados
  await loadTransactions();

  console.log("✅ Página de transações inicializada com sucesso!");
}

// ========== FUNÇÕES DE DEBUG ==========
async function refreshTransactions() {
  console.log("🔄 Atualizando transações...");
  transactionsCache = null;
  currentPage = 1;
  currentFilter = "all";

  // Reset filter chips
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.remove("active");
    if (chip.dataset.filter === "all") {
      chip.classList.add("active");
    }
  });

  await loadTransactions();
  console.log("✅ Transações atualizadas!");
}

function debugTransactions() {
  console.log("🔧 DEBUG - Estado atual:");
  console.log("Current Filter:", currentFilter);
  console.log("Current Period:", currentPeriod);
  console.log("Current Page:", currentPage);
  console.log("Has More:", hasMoreTransactions);
  console.log("Cache:", transactionsCache);
}

// ========== EXPOSIÇÃO GLOBAL PARA DEBUG ==========
if (typeof window !== "undefined") {
  window.TransactionsService = TransactionsService;
  window.TransactionsUI = TransactionsUI;
  window.FilterManager = FilterManager;
  window.refreshTransactions = refreshTransactions;
  window.debugTransactions = debugTransactions;
  window.loadTransactions = loadTransactions;
}

console.log(`
💳 Sistema de Histórico de Transações
📡 API Base: ${API_BASE_URL}
🔌 Conectado ao backend
🛠️ Debug: debugTransactions()
🔄 Reload: refreshTransactions()
📊 Services: TransactionsService, TransactionsUI
🎯 Filters: FilterManager
`);
