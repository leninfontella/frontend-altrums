// ===============================
// ENHANCED TIMELINE SYSTEM v2.0
// Sistema completo de timeline com filtros, cache e API
// ===============================

// Configuração global
const API_BASE_URL = "https://api-backend-coins.onrender.com";
const CACHE_DURATION = 30000; // 30 segundos
const PULL_THRESHOLD = 70; // Distância para pull-to-refresh

// Variáveis globais
let currentFilter = "all";
let currentUser = null;
let transactionCount = 0;
let todayCount = 0;
let donationsCache = new Map();
let lastFetchTime = 0;
let isLoading = false;

// ===============================
// SISTEMA DE AUTENTICAÇÃO
// ===============================
class AuthService {
  static getToken() {
    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  }

  static setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem("authToken", token);
    } else {
      sessionStorage.setItem("authToken", token);
    }
  }

  static removeToken() {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  }

  static isAuthenticated() {
    return !!this.getToken();
  }

  static async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      return false;
    }
  }
}

// ===============================
// CLIENTE HTTP MELHORADO
// ===============================
class HttpClient {
  static async request(url, options = {}) {
    const token = AuthService.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      let response = await fetch(`${API_BASE_URL}${url}`, config);

      // Tentar renovar token se expirou
      if (response.status === 401) {
        const refreshed = await AuthService.refreshToken();
        if (refreshed) {
          config.headers.Authorization = `Bearer ${AuthService.getToken()}`;
          response = await fetch(`${API_BASE_URL}${url}`, config);
        } else {
          AuthService.removeToken();
          NotificationService.show(
            "Sessão expirada. Faça login novamente.",
            "error"
          );
          return null;
        }
      }

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Erro na requisição" }));
        throw new Error(error.message || `Erro HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro na requisição:", error);
      NotificationService.show(error.message || "Erro de conexão", "error");
      return null;
    }
  }

  static get(url, options = {}) {
    return this.request(url, { method: "GET", ...options });
  }

  static post(url, data, options = {}) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  static put(url, data, options = {}) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  static delete(url, options = {}) {
    return this.request(url, { method: "DELETE", ...options });
  }
}

// ===============================
// SERVIÇO DE DOAÇÕES AVANÇADO
// ===============================
class DonationService {
  static async getUserDonations(type = "all", page = 1, limit = 20) {
    const cacheKey = `${type}-${page}-${limit}`;
    const cached = donationsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    let endpoint;
    switch (type) {
      case "sent":
        endpoint = `/api/users/donations/sent?page=${page}&limit=${limit}`;
        break;
      case "received":
        endpoint = `/api/users/donations/received?page=${page}&limit=${limit}`;
        break;
      case "all":
        endpoint = `/api/users/donations/all?page=${page}&limit=${limit}`;
        break;
      default:
        endpoint = `/api/users/donations?type=${type}&page=${page}&limit=${limit}`;
    }

    const response = await HttpClient.get(endpoint);
    if (response?.data) {
      donationsCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response?.data || null;
  }

  static async getRecentDonations(page = 1, limit = 20) {
    const response = await HttpClient.get(
      `/api/donations/recent?page=${page}&limit=${limit}`
    );
    return response?.data || null;
  }

  static async getUserStats() {
    const response = await HttpClient.get("/api/users/stats");
    return response?.data || null;
  }

  static async createDonation(recipientId, amount, message = "") {
    const response = await HttpClient.post("/api/users/donations", {
      recipientId,
      amount: parseInt(amount),
      message,
    });

    if (response?.success) {
      this.clearCache();
      TimelineManager.refresh();
    }

    return response;
  }

  static async searchUsers(query, page = 1, limit = 10) {
    const response = await HttpClient.get(
      `/api/users/donations/search?q=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    return response?.data || null;
  }

  static clearCache() {
    donationsCache.clear();
  }
}

// ===============================
// SERVIÇO DE USUÁRIO MELHORADO
// ===============================
class UserService {
  static async getCurrentUser() {
    const response = await HttpClient.get("/api/users/profile");
    return response?.data || null;
  }

  static async getUserStats() {
    const response = await HttpClient.get("/api/users/stats");
    return response?.data || null;
  }

  static async getBalance() {
    const response = await HttpClient.get("/api/users/balance");
    return response?.data || null;
  }

  static async updateProfile(data) {
    const response = await HttpClient.put("/api/users/profile", data);
    return response;
  }
}

// ===============================
// SERVIÇO DE NOTIFICAÇÕES
// ===============================
class NotificationService {
  static show(message, type = "info", duration = 4000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed; top: 100px; right: 30px;
      background: linear-gradient(135deg, ${this.getTypeColors(type)});
      color: white; padding: 16px 20px; border-radius: 16px;
      font-size: 14px; font-weight: 600; z-index: 1000;
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
      transform: translateX(300px);
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
      max-width: 320px; border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <i class="fas fa-${this.getTypeIcon(
          type
        )}" style="font-size: 16px;"></i>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => (notification.style.transform = "translateX(0)"), 100);

    // Auto-remove
    setTimeout(() => {
      notification.style.transform = "translateX(300px)";
      setTimeout(() => notification.remove(), 300);
    }, duration);

    return notification;
  }

  static getTypeColors(type) {
    const colors = {
      success: "#22c55e, #16a34a",
      error: "#ef4444, #dc2626",
      warning: "#f59e0b, #d97706",
      info: "#00d4ff, #0099cc",
    };
    return colors[type] || colors.info;
  }

  static getTypeIcon(type) {
    const icons = {
      success: "check-circle",
      error: "exclamation-triangle",
      warning: "exclamation-circle",
      info: "info-circle",
    };
    return icons[type] || icons.info;
  }
}

// ===============================
// GERENCIADOR DE TIMELINE PRINCIPAL
// ===============================
class TimelineManager {
  static async loadData(filterType = "all", page = 1) {
    if (isLoading) return;

    try {
      isLoading = true;
      this.showLoadingState(true);
      currentFilter = filterType;

      const donationsData = await DonationService.getUserDonations(
        filterType,
        page,
        20
      );
      if (!donationsData) {
        console.error("Não foi possível carregar doações");
        return;
      }

      this.renderTimeline(donationsData.donations || []);
      await this.updateStats();
      this.updateFilterButtons(filterType);

      lastFetchTime = Date.now();
    } catch (error) {
      console.error("Erro ao carregar timeline:", error);
      NotificationService.show("Erro ao carregar dados da timeline", "error");
    } finally {
      isLoading = false;
      this.showLoadingState(false);
    }
  }

  static renderTimeline(donations) {
    const timelineContainer = document.querySelector(".timeline-container");
    if (!timelineContainer) {
      console.error("Container da timeline não encontrado");
      return;
    }

    // Limpar itens existentes
    timelineContainer
      .querySelectorAll(".timeline-item")
      .forEach((item) => item.remove());

    if (donations.length === 0) {
      this.showEmptyState(currentFilter);
      return;
    }

    donations.forEach((donation, index) => {
      const timelineItem = this.createTimelineItem(donation, index);
      timelineContainer.appendChild(timelineItem);
    });
  }

  static createTimelineItem(donation, index) {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.style.animationDelay = `${index * 0.1}s`;

    const {
      userData,
      dotClass,
      dotIcon,
      amountClass,
      amountPrefix,
      actionText,
    } = this.getTransactionDetails(donation);

    const timeAgo = this.getTimeAgo(donation.createdAt);

    // Obter o nome do receptor e do doador
    const recipientName =
      donation.recipientInfo?.name || donation.recipient?.name || "Usuário";
    const donorName =
      donation.donorInfo?.name || donation.donor?.name || "Usuário";

    // Escolher o nome principal com base no filtro
    let mainName = userData.name;
    if (currentFilter === "received") {
      mainName = recipientName; // Em destaque, o receptor
    } else if (currentFilter === "sent") {
      mainName = recipientName; // Em destaque, o receptor
    } else {
      // all ou outros
      // Manter a lógica original
      const isSent = donation.donor && donation.donor._id === currentUser?.id;
      if (isSent) {
        mainName = recipientName;
      } else {
        mainName = donorName;
      }
    }

    item.innerHTML = `
      <div class="timeline-dot ${dotClass}">
        <i class="${dotIcon}"></i>
      </div>
      <div class="timeline-content" data-donation-id="${donation._id}">
        <div class="transaction-header">
          <div class="user-info">
            <div class="user-avatar" style="background: linear-gradient(135deg, ${
              userData.gradient
            });">
              ${this.renderAvatar(userData.avatar, userData.name)}
            </div>
            <div class="user-details">
              <h4>${mainName}</h4>
              <p class="transaction-type">${actionText} ${
      mainName === recipientName ? donorName : recipientName
    }</p>
              <p class="timestamp">${timeAgo}</p>
            </div>
          </div>
          <div class="transaction-amount">
            <div class="coin-icon-small">Æ</div>
            <span class="amount ${amountClass}">${amountPrefix}${
      donation.amount
    }</span>
          </div>
        </div>
        ${
          donation.message
            ? `
          <div class="transaction-message">
            <i class="fas fa-comment" style="margin-right: 8px; color: #64748b;"></i>
            "${donation.message}"
          </div>
        `
            : ""
        }
        <div class="transaction-meta">
          <span class="transaction-status ${
            donation.status
          }">${this.getStatusText(donation.status)}</span>
          ${
            userData.username
              ? `<span class="username">@${userData.username}</span>`
              : ""
          }
        </div>
      </div>
    `;

    // Adicionar interatividade
    item.addEventListener("click", () => this.handleItemClick(donation));

    return item;
  }

  // Fix for the getTransactionDetails method
  static getTransactionDetails(donation) {
    const isSent = donation.donor && donation.donor._id === currentUser?.id;
    const isReceived =
      donation.recipient && donation.recipient._id === currentUser?.id;
    const isSystem =
      donation.type === "system" || donation.category === "bonus";

    let userData, dotClass, dotIcon, amountClass, amountPrefix, actionText;

    if (isSystem) {
      userData = {
        name: "Sistema Neural",
        avatar: "🤖",
        gradient: "#7877c6, #5b5a9f",
      };
      dotClass = "system";
      dotIcon = "fas fa-robot";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Bônus do sistema";
    } else if (currentFilter === "sent") {
      // For "sent" filter, show current user as main name
      userData = {
        name: currentUser?.name || "Você",
        avatar: currentUser?.avatar || "👤",
        username: currentUser?.username || "",
        gradient: "#ef4444, #dc2626",
      };
      dotClass = "sent";
      dotIcon = "fas fa-arrow-up";
      amountClass = "negative";
      amountPrefix = "-";
      actionText = "Enviou para";
    } else if (currentFilter === "received") {
      // For "received" filter, show current user as main name
      userData = {
        name: currentUser?.name || "Você",
        avatar: currentUser?.avatar || "👤",
        username: currentUser?.username || "",
        gradient: "#22c55e, #16a34a",
      };
      dotClass = "received";
      dotIcon = "fas fa-arrow-down";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Recebeu de";
    } else if (isSent) {
      // For "all" filter, show recipient when current user sent
      userData = {
        name:
          donation.recipientInfo?.name || donation.recipient?.name || "Usuário",
        avatar:
          donation.recipientInfo?.avatar || donation.recipient?.avatar || "👤",
        username:
          donation.recipientInfo?.username ||
          donation.recipient?.username ||
          "",
        gradient: "#ef4444, #dc2626",
      };
      dotClass = "sent";
      dotIcon = "fas fa-arrow-up";
      amountClass = "negative";
      amountPrefix = "-";
      actionText = "Enviou para";
    } else if (isReceived) {
      // For "all" filter, show donor when current user received
      userData = {
        name: donation.donorInfo?.name || donation.donor?.name || "Usuário",
        avatar: donation.donorInfo?.avatar || donation.donor?.avatar || "👤",
        username:
          donation.donorInfo?.username || donation.donor?.username || "",
        gradient: "#22c55e, #16a34a",
      };
      dotClass = "received";
      dotIcon = "fas fa-arrow-down";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Recebeu de";
    } else {
      // For transactions between other users (not involving current user)
      userData = {
        name:
          donation.recipientInfo?.name || donation.recipient?.name || "Usuário",
        avatar:
          donation.recipientInfo?.avatar || donation.recipient?.avatar || "👤",
        username:
          donation.recipientInfo?.username ||
          donation.recipient?.username ||
          "",
        gradient: "#6366f1, #4f46e5",
      };
      dotClass = "neutral";
      dotIcon = "fas fa-exchange-alt";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Transação";
    }

    return {
      userData,
      dotClass,
      dotIcon,
      amountClass,
      amountPrefix,
      actionText,
    };
  }

  // Also need to fix the createTimelineItem method to handle the display names correctly
  static createTimelineItem(donation, index) {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.style.animationDelay = `${index * 0.1}s`;

    const {
      userData,
      dotClass,
      dotIcon,
      amountClass,
      amountPrefix,
      actionText,
    } = this.getTransactionDetails(donation);

    const timeAgo = this.getTimeAgo(donation.createdAt);

    // Get recipient and donor names
    const recipientName =
      donation.recipientInfo?.name || donation.recipient?.name || "Usuário";
    const donorName =
      donation.donorInfo?.name || donation.donor?.name || "Usuário";

    // Determine the main name and secondary name based on filter and transaction type
    let mainName = userData.name;
    let secondaryName = "";
    let displayActionText = actionText;

    if (currentFilter === "sent") {
      const userName =
        currentUser?.user?.name ||
        currentUser?.user?.displayName ||
        currentUser?.user?.username ||
        "Usuário";
      mainName = `${userName} (você)`;
      secondaryName = recipientName;
      displayActionText = `Enviou para ${recipientName}`;
    } else if (currentFilter === "received") {
      const userName =
        currentUser?.user?.name ||
        currentUser?.user?.displayName ||
        currentUser?.user?.username ||
        "Usuário";
      mainName = `${userName} (você)`;
      secondaryName = donorName;
      displayActionText = `Recebeu de ${donorName}`;
    } else {
      // For "all" filter, show transactions between any users
      const isSent = donation.donor && donation.donor._id === currentUser?.id;
      const isReceived =
        donation.recipient && donation.recipient._id === currentUser?.id;

      if (isSent) {
        // Current user sent this donation
        mainName = recipientName;
        displayActionText = `Recebeu de ${currentUser?.name || "Você"}`;
      } else if (isReceived) {
        // Current user received this donation
        mainName = donorName;
        displayActionText = `Enviou para ${currentUser?.name || "Você"}`;
      } else {
        // Transaction between other users
        mainName = recipientName;
        displayActionText = `Recebeu de ${donorName}`;
      }
    }

    item.innerHTML = `
    <div class="timeline-dot ${dotClass}">
      <i class="${dotIcon}"></i>
    </div>
    <div class="timeline-content" data-donation-id="${donation._id}">
      <div class="transaction-header">
        <div class="user-info">
          <div class="user-avatar" style="background: linear-gradient(135deg, ${
            userData.gradient
          });">
            ${this.renderAvatar(userData.avatar, userData.name)}
          </div>
          <div class="user-details">
            <h4>${mainName}</h4>
            <p class="transaction-type">${displayActionText}</p>
            <p class="timestamp">${timeAgo}</p>
          </div>
        </div>
        <div class="transaction-amount">
          <div class="coin-icon-small">Æ</div>
          <span class="amount ${amountClass}">${amountPrefix}${
      donation.amount
    }</span>
        </div>
      </div>
      ${
        donation.message
          ? `
        <div class="transaction-message">
          <i class="fas fa-comment" style="margin-right: 8px; color: #64748b;"></i>
          "${donation.message}"
        </div>
      `
          : ""
      }
      <div class="transaction-meta">
        <span class="transaction-status ${
          donation.status
        }">${this.getStatusText(donation.status)}</span>
        ${
          userData.username
            ? `<span class="username">@${userData.username}</span>`
            : ""
        }
      </div>
    </div>
  `;

    // Add interactivity
    item.addEventListener("click", () => this.handleItemClick(donation));

    return item;
  }

  // Also need to fix the createTimelineItem method to handle the display names correctly

  static renderAvatar(avatar, name) {
    if (!avatar) return `<span style="font-size: 16px;">👤</span>`;

    if (avatar.startsWith("http")) {
      return `<img src="${avatar}" alt="${name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }

    return `<span style="font-size: 16px;">${avatar}</span>`;
  }

  static handleItemClick(donation) {
    console.log("Clique na doação:", donation);
    // Aqui você pode adicionar modal de detalhes, etc.
  }

  static async updateStats() {
    try {
      const stats = await UserService.getUserStats();
      if (stats) {
        transactionCount = stats.totalTransactions || 0;
        todayCount = stats.todayActivity || 0;

        this.animateCounter("totalTransactions", transactionCount);
        this.animateCounter("todayActivity", todayCount);
        this.animateCounter("donationsSent", stats.donationsSent || 0);
        this.animateCounter("donationsReceived", stats.donationsReceived || 0);
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
    }
  }

  static animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 20);

    if (currentValue < targetValue) {
      element.textContent = Math.min(currentValue + increment, targetValue);
      setTimeout(() => this.animateCounter(elementId, targetValue), 50);
    }
  }

  static showLoadingState(show) {
    const timeline = document.querySelector(".timeline-container");
    if (timeline) {
      timeline.style.opacity = show ? "0.6" : "1";
      timeline.style.pointerEvents = show ? "none" : "auto";
    }
  }

  static showEmptyState(filterType = "all") {
    const timelineContainer = document.querySelector(".timeline-container");
    if (!timelineContainer) return;

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";

    const messages = {
      sent: {
        title: "Nenhuma doação enviada",
        description: "Suas doações enviadas aparecerão aqui.",
        icon: "fas fa-arrow-up",
      },
      received: {
        title: "Nenhuma doação recebida",
        description: "Suas doações recebidas aparecerão aqui.",
        icon: "fas fa-arrow-down",
      },
      all: {
        title: "Nenhuma transação encontrada",
        description: "Todas as suas doações aparecerão aqui.",
        icon: "fas fa-history",
      },
    };

    const msg = messages[filterType] || messages.all;

    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="${msg.icon}"></i>
      </div>
      <h3>${msg.title}</h3>
      <p>${msg.description}</p>
    `;

    timelineContainer.appendChild(emptyState);
  }

  static updateFilterButtons(activeFilter) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === activeFilter);
    });
  }

  static async refresh() {
    DonationService.clearCache();
    await this.loadData(currentFilter);
    NotificationService.show("Timeline atualizada!", "success");
  }

  static getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "agora mesmo";
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  static getStatusText(status) {
    const statusMap = {
      completed: "Concluído",
      pending: "Pendente",
      cancelled: "Cancelado",
      failed: "Falhou",
      processing: "Processando",
    };
    return statusMap[status] || status;
  }
}

// ===============================
// SISTEMA DE FILTROS
// ===============================
class FilterManager {
  static initialize() {
    const filterContainer = this.createFilterContainer();

    const filters = [
      { key: "all", label: "Todas", icon: "fas fa-list" },
      { key: "sent", label: "Enviadas", icon: "fas fa-arrow-up" },
      { key: "received", label: "Recebidas", icon: "fas fa-arrow-down" },
    ];

    filters.forEach((filter) => {
      const btn = this.createFilterButton(filter);
      filterContainer.appendChild(btn);
    });
  }

  // Replace the existing createFilterContainer method in FilterManager class

  static createFilterContainer() {
    let container = document.querySelector(".filter-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "filter-container";
      container.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap;
      gap: 8px;
      margin: 16px 0;
      padding: 12px 16px;
      background: transparent;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      position: relative;
    `;

      // Add a subtle animated background
      const animatedBg = document.createElement("div");
      animatedBg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, 
        rgba(0, 212, 255, 0.03) 0%, 
        rgba(0, 153, 204, 0.05) 50%, 
        rgba(0, 212, 255, 0.03) 100%);
      animation: subtle-pulse 4s ease-in-out infinite;
      border-radius: 16px;
      pointer-events: none;
    `;
      container.appendChild(animatedBg);

      // Hide scrollbar for webkit browsers
      const style = document.createElement("style");
      style.textContent = `
      .filter-container::-webkit-scrollbar {
        display: none;
      }
      
      @keyframes subtle-pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      
      .filter-container::before {
        content: '';
        position: absolute;
        top: -1px;
        left: -1px;
        right: -1px;
        bottom: -1px;
        background: linear-gradient(45deg, 
          rgba(0, 212, 255, 0.1), 
          transparent, 
          rgba(0, 153, 204, 0.1));
        border-radius: 17px;
        z-index: -1;
      }
    `;
      document.head.appendChild(style);

      const timelineContainer = document.querySelector(".timeline-container");
      if (timelineContainer) {
        timelineContainer.parentNode.insertBefore(container, timelineContainer);
      }
    }
    return container;
  }

  // ===============================
  // MODERN FILTER BUTTONS STYLING
  // ===============================

  // Replace the existing createFilterButton method in FilterManager class

  static createFilterButton(filter) {
    const btn = document.createElement("button");
    btn.className = `filter-btn ${filter.key === "all" ? "active" : ""}`;
    btn.dataset.filter = filter.key;
    btn.innerHTML = `<i class="${filter.icon}"></i> ${filter.label}`;

    // Modern base styling
    btn.style.cssText = `
    position: relative;
    background: linear-gradient(135deg, rgba(45, 55, 72, 0.4), rgba(55, 65, 81, 0.4));
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 85px;
    height: 36px;
    justify-content: center;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  `;

    // Add pseudo-element for modern glow effect
    const glowOverlay = document.createElement("div");
    glowOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 153, 204, 0.1));
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    border-radius: 12px;
  `;
    btn.appendChild(glowOverlay);

    // Active state styling
    if (filter.key === "all") {
      btn.style.background = "linear-gradient(135deg, #00d4ff, #0099cc)";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "rgba(0, 212, 255, 0.3)";
      btn.style.boxShadow =
        "0 8px 25px rgba(0, 212, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)";
      btn.style.transform = "translateY(-1px)";
      glowOverlay.style.opacity = "1";
    }

    // Hover effects
    btn.addEventListener("mouseenter", () => {
      if (!btn.classList.contains("active")) {
        btn.style.background =
          "linear-gradient(135deg, rgba(55, 65, 81, 0.9), rgba(67, 79, 99, 0.9))";
        btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
        btn.style.transform = "translateY(-2px)";
        btn.style.boxShadow =
          "0 8px 25px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)";
        btn.style.color = "#00d4ff";
        glowOverlay.style.opacity = "0.5";
      } else {
        btn.style.transform = "translateY(-3px)";
        btn.style.boxShadow =
          "0 12px 30px rgba(0, 212, 255, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15)";
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (!btn.classList.contains("active")) {
        btn.style.background =
          "linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(55, 65, 81, 0.8))";
        btn.style.borderColor = "rgba(255, 255, 255, 0.08)";
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        btn.style.color = "#e2e8f0";
        glowOverlay.style.opacity = "0";
      } else {
        btn.style.transform = "translateY(-1px)";
        btn.style.boxShadow =
          "0 8px 25px rgba(0, 212, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)";
      }
    });

    // Click animation
    btn.addEventListener("mousedown", () => {
      btn.style.transform = "translateY(0) scale(0.98)";
    });

    btn.addEventListener("mouseup", () => {
      setTimeout(() => {
        if (btn.classList.contains("active")) {
          btn.style.transform = "translateY(-1px) scale(1)";
        } else {
          btn.style.transform = "translateY(-2px) scale(1)";
        }
      }, 100);
    });

    // Click handler
    btn.addEventListener("click", () => {
      // Update active states
      document.querySelectorAll(".filter-btn").forEach((filterBtn) => {
        filterBtn.classList.remove("active");
        const btnGlow = filterBtn.querySelector("div");

        // Reset to inactive styling
        filterBtn.style.background =
          "linear-gradient(135deg, rgba(45, 55, 72, 0.8), rgba(55, 65, 81, 0.8))";
        filterBtn.style.color = "#e2e8f0";
        filterBtn.style.borderColor = "rgba(255, 255, 255, 0.08)";
        filterBtn.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        filterBtn.style.transform = "translateY(0)";
        if (btnGlow) btnGlow.style.opacity = "0";
      });

      // Set active styling for clicked button
      btn.classList.add("active");
      btn.style.background = "linear-gradient(135deg, #00d4ff, #0099cc)";
      btn.style.color = "#ffffff";
      btn.style.borderColor = "rgba(0, 212, 255, 0.3)";
      btn.style.boxShadow =
        "0 8px 25px rgba(0, 212, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)";
      btn.style.transform = "translateY(-1px)";
      glowOverlay.style.opacity = "1";

      // Load data with the selected filter
      TimelineManager.loadData(filter.key);
    });

    return btn;
  }

  // ===============================
  // ENHANCED FILTER CONTAINER STYLING
  // ===============================
}

// ===============================
// PULL-TO-REFRESH MELHORADO
// ===============================
class PullToRefreshManager {
  static initialize() {
    const mainContent = document.querySelector(".main-content");
    const timelineContainer = document.querySelector(".timeline-container");

    if (!mainContent || !timelineContainer) return;

    let startY = 0;
    let isDragging = false;
    let refreshTriggered = false;

    // Criar indicador de refresh se não existir
    let indicator = document.getElementById("pullToRefreshIndicator");
    if (!indicator) {
      indicator = this.createRefreshIndicator();
      document.body.appendChild(indicator);
    }

    mainContent.addEventListener("touchstart", (e) => {
      if (mainContent.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isDragging = true;
        mainContent.style.transition = "none";
      }
    });

    mainContent.addEventListener("touchmove", (e) => {
      if (!isDragging) return;

      const currentY = e.touches[0].clientY;
      const dragDistance = currentY - startY;

      if (dragDistance > 0) {
        e.preventDefault();
        const pullFraction = Math.min(dragDistance / PULL_THRESHOLD, 1);
        const pullValue = pullFraction * 60;

        timelineContainer.style.transform = `translateY(${pullValue}px)`;
        indicator.style.transform = `translate(-50%, ${
          20 + pullValue
        }px) scale(${0.5 + pullFraction / 2})`;
        indicator.style.opacity = pullFraction;

        if (dragDistance >= PULL_THRESHOLD && !refreshTriggered) {
          refreshTriggered = true;
          indicator.classList.add("ready");
          navigator.vibrate && navigator.vibrate(50); // Feedback háptico
        } else if (dragDistance < PULL_THRESHOLD && refreshTriggered) {
          refreshTriggered = false;
          indicator.classList.remove("ready");
        }
      }
    });

    mainContent.addEventListener("touchend", async () => {
      if (!isDragging) return;

      isDragging = false;
      mainContent.style.transition = "transform 0.3s ease-out";
      timelineContainer.style.transition = "transform 0.3s ease-out";

      if (refreshTriggered) {
        indicator.classList.add("loading");
        await TimelineManager.refresh();
        indicator.classList.remove("loading", "ready");
      }

      // Reset positions
      timelineContainer.style.transform = "translateY(0)";
      indicator.style.transform = "translate(-50%, -100%) scale(0)";
      indicator.style.opacity = "0";

      refreshTriggered = false;
    });
  }

  static createRefreshIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "pullToRefreshIndicator";
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 50%;
      transform: translate(-50%, -100%) scale(0);
      background: linear-gradient(135deg, #00d4ff, #0099cc);
      color: white;
      padding: 12px;
      border-radius: 50%;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    `;

    indicator.innerHTML = `
      <i class="fas fa-sync-alt" style="font-size: 18px;"></i>
    `;

    return indicator;
  }
}

// ===============================
// SISTEMA DE AUTO-UPDATE
// ===============================
class AutoUpdateManager {
  static interval = null;

  static start() {
    this.stop(); // Limpar interval anterior

    this.interval = setInterval(async () => {
      if (Date.now() - lastFetchTime > CACHE_DURATION) {
        await TimelineManager.loadData(currentFilter);
      }
    }, 30000);

    // Atualizar stats a cada minuto
    setInterval(() => TimelineManager.updateStats(), 60000);
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// ===============================
// INICIALIZAÇÃO PRINCIPAL
// ===============================
async function initialize() {
  console.log("🚀 Enhanced Timeline System v2.0 - Inicializando...");

  if (!AuthService.isAuthenticated()) {
    console.warn("Usuário não autenticado");
    NotificationService.show(
      "É necessário fazer login para acessar a timeline",
      "error"
    );
    return false;
  }

  try {
    // Carregar usuário atual
    currentUser = await UserService.getCurrentUser();
    if (!currentUser) {
      throw new Error("Não foi possível carregar dados do usuário");
    }

    // Inicializar componentes
    FilterManager.initialize();
    PullToRefreshManager.initialize();

    // Carregar dados iniciais
    await TimelineManager.loadData("all");

    // Iniciar sistema de auto-update
    AutoUpdateManager.start();

    // Feedback de sucesso
    setTimeout(() => {
      NotificationService.show("🌟 Timeline carregada com sucesso!", "success");
    }, 1000);

    console.log("✅ Timeline inicializada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro na inicialização:", error);
    NotificationService.show("Erro ao inicializar timeline", "error");
    return false;
  }
}

// ===============================
// API GLOBAL EXPORTADA
// ===============================
window.timelineAPI = {
  // Core functions
  initialize,
  refresh: () => TimelineManager.refresh(),
  loadData: (filter) => TimelineManager.loadData(filter),

  // Services
  DonationService,
  UserService,
  AuthService,

  // Managers
  TimelineManager,
  FilterManager,
  NotificationService,

  // Utilities
  getCurrentFilter: () => currentFilter,
  getCurrentUser: () => currentUser,
  isLoading: () => isLoading,

  // Cache management
  clearCache: () => DonationService.clearCache(),

  // Auto-update control
  startAutoUpdate: () => AutoUpdateManager.start(),
  stopAutoUpdate: () => AutoUpdateManager.stop(),
};

// ===============================
// SISTEMA DE NAVEGAÇÃO MELHORADO
// ===============================
class NavigationManager {
  static initialize() {
    this.initializeNavItems();
    this.initializeKeyboardShortcuts();
    this.initializeScrollEffects();
  }

  static initializeNavItems() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", function () {
        // Aqui você pode adicionar lógica para destacar o ativo
        document
          .querySelectorAll(".nav-item")
          .forEach((nav) => nav.classList.remove("active"));
        this.classList.add("active");

        // Add click animation
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "scale(1)";
        }, 150);

        // Handle navigation based on data attribute
        const target = this.dataset.target;
        if (target) {
          NavigationManager.navigateTo(target);
        }
      });

      // Add hover effects
      item.addEventListener("mouseenter", function () {
        if (!this.classList.contains("active")) {
          this.style.transform = "translateY(-2px)";
        }
      });

      item.addEventListener("mouseleave", function () {
        if (!this.classList.contains("active")) {
          this.style.transform = "translateY(0)";
        }
      });
    });
  }

  static initializeKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case "1":
          e.preventDefault();
          TimelineManager.loadData("all");
          break;
        case "2":
          e.preventDefault();
          TimelineManager.loadData("sent");
          break;
        case "3":
          e.preventDefault();
          TimelineManager.loadData("received");
          break;
        case "r":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            TimelineManager.refresh();
          }
          break;
        case "Escape":
          // Close any open modals or overlays
          document.querySelectorAll(".modal, .overlay").forEach((el) => {
            el.classList.add("hidden");
          });
          break;
      }
    });
  }

  static initializeScrollEffects() {
    const mainContent = document.querySelector(".main-content");
    if (!mainContent) return;

    let isScrolling = false;
    let scrollTimeout;

    mainContent.addEventListener("scroll", () => {
      // Timeline line opacity effect
      const timelineLine = document.querySelector(".timeline-line");
      if (timelineLine && !isScrolling) {
        isScrolling = true;
        timelineLine.style.opacity = "0.3";

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          timelineLine.style.opacity = "1";
          isScrolling = false;
        }, 150);
      }

      // Show/hide scroll to top button
      const scrollTop = mainContent.scrollTop;
      const scrollToTopBtn = document.getElementById("scrollToTop");

      if (scrollToTopBtn) {
        if (scrollTop > 500) {
          scrollToTopBtn.style.display = "flex";
          scrollToTopBtn.style.opacity = "1";
        } else {
          scrollToTopBtn.style.opacity = "0";
          setTimeout(() => {
            if (scrollToTopBtn.style.opacity === "0") {
              scrollToTopBtn.style.display = "none";
            }
          }, 300);
        }
      }

      // Infinite scroll detection
      if (
        scrollTop + mainContent.clientHeight >=
        mainContent.scrollHeight - 100
      ) {
        this.handleInfiniteScroll();
      }
    });
  }

  static navigateTo(target) {
    console.log("Navegando para:", target);
    // Implementar navegação conforme necessário
  }

  static async handleInfiniteScroll() {
    if (isLoading) return;

    console.log("Loading more data...");
    // Implementar carregamento de mais dados
    // await TimelineManager.loadMoreData();
  }

  static createScrollToTopButton() {
    const btn = document.createElement("button");
    btn.id = "scrollToTop";
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff, #0099cc);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
      transition: all 0.3s ease;
    `;

    btn.addEventListener("click", () => {
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });

    document.body.appendChild(btn);
    return btn;
  }
}

// ===============================
// SISTEMA DE BUSCA AVANÇADO
// ===============================
class SearchManager {
  static searchTimeout = null;
  static searchCache = new Map();

  static initialize() {
    this.createSearchInterface();
    this.bindSearchEvents();
  }

  static createSearchInterface() {
    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";
    searchContainer.style.cssText = `
      position: relative;
      margin: 20px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    `;

    searchContainer.innerHTML = `
      <div class="search-input-wrapper" style="position: relative;">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Buscar usuários ou transações..."
          style="
            width: 100%;
            padding: 12px 45px 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            font-size: 14px;
            transition: all 0.3s ease;
          "
        />
        <i class="fas fa-search" style="
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        "></i>
      </div>
      <div id="searchResults" class="search-results" style="
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(30, 30, 30, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        margin-top: 8px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      "></div>
    `;

    // Insert after filter container
    const filterContainer = document.querySelector(".filter-container");
    if (filterContainer) {
      filterContainer.parentNode.insertBefore(
        searchContainer,
        filterContainer.nextSibling
      );
    }
  }

  static bindSearchEvents() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      clearTimeout(this.searchTimeout);

      if (query.length < 2) {
        searchResults.style.display = "none";
        return;
      }

      this.searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "rgba(0, 212, 255, 0.5)";
      searchInput.style.boxShadow = "0 0 0 3px rgba(0, 212, 255, 0.1)";
    });

    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "rgba(255, 255, 255, 0.1)";
      searchInput.style.boxShadow = "none";

      // Hide results after a delay to allow clicking
      setTimeout(() => {
        searchResults.style.display = "none";
      }, 200);
    });

    // Close search results when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target)
      ) {
        searchResults.style.display = "none";
      }
    });
  }

  static async performSearch(query) {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) return;

    // Check cache first
    if (this.searchCache.has(query)) {
      this.displaySearchResults(this.searchCache.get(query));
      return;
    }

    try {
      searchResults.innerHTML = `
        <div style="padding: 16px; text-align: center; color: rgba(255, 255, 255, 0.7);">
          <i class="fas fa-spinner fa-spin"></i> Buscando...
        </div>
      `;
      searchResults.style.display = "block";

      const results = await DonationService.searchUsers(query);

      if (results) {
        this.searchCache.set(query, results);
        this.displaySearchResults(results);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      searchResults.innerHTML = `
        <div style="padding: 16px; text-align: center; color: #ef4444;">
          Erro na busca. Tente novamente.
        </div>
      `;
    }
  }

  static displaySearchResults(results) {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) return;

    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div style="padding: 16px; text-align: center; color: rgba(255, 255, 255, 0.7);">
          Nenhum resultado encontrado
        </div>
      `;
      searchResults.style.display = "block";
      return;
    }

    const resultsHTML = results
      .map(
        (user) => `
      <div class="search-result-item" 
           data-user-id="${user._id}"
           style="
             padding: 12px 16px;
             border-bottom: 1px solid rgba(255, 255, 255, 0.05);
             cursor: pointer;
             transition: background 0.2s ease;
           "
           onmouseenter="this.style.background='rgba(255, 255, 255, 0.05)'"
           onmouseleave="this.style.background='transparent'">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">
            ${user.avatar || "👤"}
          </div>
          <div>
            <div style="color: white; font-weight: 600; font-size: 14px;">
              ${user.name}
            </div>
            ${
              user.username
                ? `
              <div style="color: rgba(255, 255, 255, 0.6); font-size: 12px;">
                @${user.username}
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `
      )
      .join("");

    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = "block";

    // Add click handlers
    searchResults.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        const userId = item.dataset.userId;
        this.handleUserSelect(userId);
      });
    });
  }

  static handleUserSelect(userId) {
    console.log("Usuário selecionado:", userId);
    // Implementar ação ao selecionar usuário (ex: abrir modal de doação)

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (searchInput) searchInput.value = "";
    if (searchResults) searchResults.style.display = "none";
  }
}

// ===============================
// SISTEMA DE TEMAS MELHORADO
// ===============================
class ThemeManager {
  static currentTheme = "dark";

  static initialize() {
    this.loadTheme();
    this.createThemeToggle();
  }

  static loadTheme() {
    const savedTheme = localStorage.getItem("timeline-theme") || "dark";
    this.setTheme(savedTheme);
  }

  static setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("timeline-theme", theme);

    // Update theme toggle button
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const icon = themeToggle.querySelector("i");
      if (icon) {
        icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
      }
    }
  }

  static toggleTheme() {
    const newTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
    NotificationService.show(
      `Tema ${newTheme === "dark" ? "escuro" : "claro"} ativado`,
      "info",
      2000
    );
  }

  static createThemeToggle() {
    const themeToggle = document.createElement("button");
    themeToggle.id = "themeToggle";
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    themeToggle.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: all 0.3s ease;
    `;

    themeToggle.addEventListener("click", () => this.toggleTheme());

    themeToggle.addEventListener("mouseenter", () => {
      themeToggle.style.background = "rgba(255, 255, 255, 0.2)";
      themeToggle.style.transform = "scale(1.1)";
    });

    themeToggle.addEventListener("mouseleave", () => {
      themeToggle.style.background = "rgba(255, 255, 255, 0.1)";
      themeToggle.style.transform = "scale(1)";
    });

    document.body.appendChild(themeToggle);
  }
}

// ===============================
// SISTEMA DE ANALYTICS
// ===============================
class AnalyticsManager {
  static events = [];

  static track(event, data = {}) {
    const eventData = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id,
    };

    this.events.push(eventData);

    // Send to analytics service if needed
    console.log("Analytics:", eventData);
  }

  static trackTimelineView(filter) {
    this.track("timeline_view", { filter });
  }

  static trackDonationClick(donationId) {
    this.track("donation_click", { donationId });
  }

  static trackSearch(query, resultsCount) {
    this.track("search", { query, resultsCount });
  }

  static trackRefresh(method) {
    this.track("timeline_refresh", { method });
  }
}

// ===============================
// INICIALIZAÇÃO COMPLETA
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌟 Sistema de Timeline v2.0 - Inicializando componentes...");

  try {
    // Initialize core system
    const initialized = await initialize();

    if (initialized) {
      // Initialize additional managers
      NavigationManager.initialize();
      SearchManager.initialize();
      ThemeManager.initialize();

      // Create additional UI elements
      NavigationManager.createScrollToTopButton();

      console.log("✅ Todos os componentes inicializados com sucesso!");

      // Track initialization
      AnalyticsManager.track("app_initialized", {
        version: "2.0",
        features: [
          "timeline",
          "filters",
          "search",
          "themes",
          "pull-to-refresh",
        ],
      });
    } else {
      console.error("❌ Falha na inicialização do sistema principal");
    }
  } catch (error) {
    console.error("💥 Erro crítico na inicialização:", error);
    NotificationService.show(
      "Erro crítico na inicialização do sistema",
      "error"
    );
  }
});

// ===============================
// CLEANUP E LIFECYCLE
// ===============================
window.addEventListener("beforeunload", () => {
  console.log("🧹 Limpando recursos...");

  // Stop auto-updates
  AutoUpdateManager.stop();

  // Clear caches
  DonationService.clearCache();
  SearchManager.searchCache.clear();

  // Track session end
  AnalyticsManager.track("session_end", {
    duration: Date.now() - lastFetchTime,
    eventsCount: AnalyticsManager.events.length,
  });
});

// ===============================
// EXTEND GLOBAL API
// ===============================
Object.assign(window.timelineAPI, {
  // Additional managers
  NavigationManager,
  SearchManager,
  ThemeManager,
  AnalyticsManager,

  // Utility functions
  trackEvent: (event, data) => AnalyticsManager.track(event, data),
  setTheme: (theme) => ThemeManager.setTheme(theme),
  search: (query) => SearchManager.performSearch(query),

  // System info
  version: "2.0",
  buildDate: new Date().toISOString(),
  features: [
    "timeline_management",
    "filtering_system",
    "pull_to_refresh",
    "search_functionality",
    "theme_switching",
    "auto_updates",
    "analytics_tracking",
    "keyboard_shortcuts",
    "infinite_scroll",
    "cache_management",
  ],
});

console.log("🎉 Enhanced Timeline System v2.0 carregado com sucesso!");
console.log("📚 API disponível em: window.timelineAPI");
console.log("🎨 Recursos:", window.timelineAPI.features);
