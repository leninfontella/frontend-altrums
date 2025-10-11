// ===============================
// ENHANCED TIMELINE SYSTEM v2.1 - MOBILE OPTIMIZED
// Sistema completo de timeline com design mobile como profile
// ===============================

// Configuração global
const API_BASE_URL = "https://api-backend-coins.onrender.com";
const CACHE_DURATION = 30000; // 30 segundos
const PULL_THRESHOLD = 80; // Distância para pull-to-refresh

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
    setTimeout(() => notification.classList.add("show"), 100);

    // Auto-remove
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, duration);

    return notification;
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
    const timelineContainer = document.getElementById("timelineContainer");
    if (!timelineContainer) {
      console.error("Container da timeline não encontrado");
      return;
    }

    // Limpar itens existentes
    timelineContainer.innerHTML = "";

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

    // Obter nomes do receptor e doador
    const recipientName =
      donation.recipientInfo?.name || donation.recipient?.name || "Usuário";
    const donorName =
      donation.donorInfo?.name || donation.donor?.name || "Usuário";

    // Determinar nome principal e secundário baseado no filtro
    let mainName = userData.name;
    let displayActionText = actionText;

    if (currentFilter === "sent") {
      const userName = currentUser?.name || "Você";
      mainName = `${userName}`;
      displayActionText = `Enviou para ${recipientName}`;
    } else if (currentFilter === "received") {
      const userName = currentUser?.name || "Você";
      mainName = `${userName}`;
      displayActionText = `Recebeu de ${donorName}`;
    } else {
      const isSent = donation.donor && donation.donor._id === currentUser?.id;
      const isReceived =
        donation.recipient && donation.recipient._id === currentUser?.id;

      if (isSent) {
        mainName = recipientName;
        displayActionText = `Recebeu de ${currentUser?.name || "Você"}`;
      } else if (isReceived) {
        mainName = donorName;
        displayActionText = `Enviou para ${currentUser?.name || "Você"}`;
      } else {
        mainName = recipientName;
        displayActionText = `Recebeu de ${donorName}`;
      }
    }

    // 🔧 CORREÇÃO: Obter profilePhotoUrl baseado no filtro e tipo de transação
    let profilePhotoUrl = null;

    if (currentFilter === "sent") {
      // No filtro "sent", mostrar foto do RECEPTOR (para quem você enviou)
      profilePhotoUrl =
        donation.recipientInfo?.profilePhotoUrl ||
        donation.recipient?.profilePhotoUrl;
    } else if (currentFilter === "received") {
      // No filtro "received", mostrar foto do DOADOR (quem enviou para você)
      profilePhotoUrl =
        donation.donorInfo?.profilePhotoUrl || donation.donor?.profilePhotoUrl;
    } else {
      // No filtro "all", determinar baseado em quem é o usuário logado
      const isSent = donation.donor && donation.donor._id === currentUser?.id;
      const isReceived =
        donation.recipient && donation.recipient._id === currentUser?.id;

      if (isSent) {
        // Você enviou, mostrar foto do receptor
        profilePhotoUrl =
          donation.recipientInfo?.profilePhotoUrl ||
          donation.recipient?.profilePhotoUrl;
      } else if (isReceived) {
        // Você recebeu, mostrar foto do doador
        profilePhotoUrl =
          donation.donorInfo?.profilePhotoUrl ||
          donation.donor?.profilePhotoUrl;
      } else {
        // Transação entre outros usuários, mostrar receptor
        profilePhotoUrl =
          donation.recipientInfo?.profilePhotoUrl ||
          donation.recipient?.profilePhotoUrl;
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
            ${this.renderAvatar(
              userData.avatar,
              userData.name,
              profilePhotoUrl
            )}
          </div>
          <div class="user-details">
            <h4>${mainName}</h4>
            <p class="transaction-type">${displayActionText}</p>
            <p class="timestamp">${timeAgo}</p>
          </div>
        </div>
        <div class="transaction-amount">
          <div class="coin-icon-small">🪙</div>
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

    item.addEventListener("click", () => this.handleItemClick(donation));

    return item;
  }

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
        profilePhotoUrl: null, // Sistema não tem foto
      };
      dotClass = "system";
      dotIcon = "fas fa-robot";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Bônus do sistema";
    } else if (currentFilter === "sent") {
      // 🔧 CORREÇÃO: No filtro "sent", mostrar foto do RECEPTOR (para quem enviou)
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
        profilePhotoUrl:
          donation.recipientInfo?.profilePhotoUrl ||
          donation.recipient?.profilePhotoUrl, // 🔧 Foto do RECEPTOR
      };
      dotClass = "sent";
      dotIcon = "fas fa-arrow-up";
      amountClass = "negative";
      amountPrefix = "-";
      actionText = "Enviou para";
    } else if (currentFilter === "received") {
      // 🔧 CORREÇÃO: No filtro "received", mostrar foto do DOADOR (quem enviou para você)
      userData = {
        name: donation.donorInfo?.name || donation.donor?.name || "Usuário",
        avatar: donation.donorInfo?.avatar || donation.donor?.avatar || "👤",
        username:
          donation.donorInfo?.username || donation.donor?.username || "",
        gradient: "#22c55e, #16a34a",
        profilePhotoUrl:
          donation.donorInfo?.profilePhotoUrl ||
          donation.donor?.profilePhotoUrl, // 🔧 Foto do DOADOR
      };
      dotClass = "received";
      dotIcon = "fas fa-arrow-down";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Recebeu de";
    } else if (isSent) {
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
        profilePhotoUrl:
          donation.recipientInfo?.profilePhotoUrl ||
          donation.recipient?.profilePhotoUrl, // 🔧 NOVO
      };
      dotClass = "sent";
      dotIcon = "fas fa-arrow-up";
      amountClass = "negative";
      amountPrefix = "-";
      actionText = "Enviou para";
    } else if (isReceived) {
      userData = {
        name: donation.donorInfo?.name || donation.donor?.name || "Usuário",
        avatar: donation.donorInfo?.avatar || donation.donor?.avatar || "👤",
        username:
          donation.donorInfo?.username || donation.donor?.username || "",
        gradient: "#22c55e, #16a34a",
        profilePhotoUrl:
          donation.donorInfo?.profilePhotoUrl ||
          donation.donor?.profilePhotoUrl, // 🔧 NOVO
      };
      dotClass = "received";
      dotIcon = "fas fa-arrow-down";
      amountClass = "positive";
      amountPrefix = "+";
      actionText = "Recebeu de";
    } else {
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
        profilePhotoUrl:
          donation.recipientInfo?.profilePhotoUrl ||
          donation.recipient?.profilePhotoUrl, // 🔧 NOVO
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

  static renderAvatar(avatar, name, profilePhotoUrl = null) {
    const DEFAULT_AVATAR = "👤";
    const GCS_BASE_URL =
      "https://storage.googleapis.com/altrum-storage-uploader/profiles/";

    // 🔧 PRIORIDADE 1: Usar profilePhotoUrl (vindo do backend)
    if (profilePhotoUrl && profilePhotoUrl.startsWith("http")) {
      return `<img src="${profilePhotoUrl}" 
                 alt="${name}" 
                 style="width: 100%; height: 100%; object-fit: cover; display: block;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <span style="display: none; font-size: 16px; align-items: center; justify-content: center; width: 100%; height: 100%;">
              ${DEFAULT_AVATAR}
            </span>`;
    }

    // 🔧 PRIORIDADE 2: Usar avatar (pode ser filename ou URL)
    if (avatar && avatar !== DEFAULT_AVATAR) {
      // Se for apenas o filename, construir URL completa
      const imageUrl = avatar.startsWith("http")
        ? avatar
        : `${GCS_BASE_URL}${avatar}`;

      return `<img src="${imageUrl}" 
                 alt="${name}" 
                 style="width: 100%; height: 100%; object-fit: cover; display: block;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <span style="display: none; font-size: 16px; align-items: center; justify-content: center; width: 100%; height: 100%;">
              ${DEFAULT_AVATAR}
            </span>`;
    }

    // 🔧 FALLBACK: Avatar padrão
    return `<span style="font-size: 16px; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
    ${DEFAULT_AVATAR}
  </span>`;
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
    const timeline = document.getElementById("timelineContainer");
    if (timeline) {
      timeline.classList.toggle("timeline-loading", show);
    }
  }

  static showEmptyState(filterType = "all") {
    const timelineContainer = document.getElementById("timelineContainer");
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
    // NotificationService.show("Timeline atualizada!", "success");
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
// SISTEMA DE FILTROS MOBILE
// ===============================
class FilterManager {
  static initialize() {
    this.bindFilterEvents();
  }

  static bindFilterEvents() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        // Remover active de todos
        document
          .querySelectorAll(".filter-btn")
          .forEach((b) => b.classList.remove("active"));

        // Adicionar active ao clicado
        this.classList.add("active");

        // Carregar dados com o filtro selecionado
        const filter = this.dataset.filter;
        TimelineManager.loadData(filter);
      });
    });
  }
}

// ===============================
// PULL-TO-REFRESH MOBILE OTIMIZADO
// ===============================
class PullToRefreshManager {
  static initialize() {
    const mainContent = document.querySelector(".main-content");
    const indicator = document.getElementById("pullToRefreshIndicator");

    if (!mainContent || !indicator) return;

    let startY = 0;
    let isDragging = false;
    let refreshTriggered = false;

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

        mainContent.style.transform = `translateY(${pullValue}px)`;
        indicator.style.transform = `translateX(-50%) translateY(${
          20 + pullValue
        }px) scale(${0.5 + pullFraction / 2})`;
        indicator.style.opacity = pullFraction;

        if (dragDistance >= PULL_THRESHOLD && !refreshTriggered) {
          refreshTriggered = true;
          indicator.classList.add("ready");
          if (navigator.vibrate) navigator.vibrate(50);
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

      if (refreshTriggered) {
        indicator.classList.add("loading");
        await TimelineManager.refresh();
        indicator.classList.remove("loading", "ready");
      }

      // Reset positions
      mainContent.style.transform = "translateY(0)";
      indicator.style.transform = "translateX(-50%) translateY(-50px) scale(0)";
      indicator.style.opacity = "0";

      refreshTriggered = false;
    });
  }
}

// ===============================
// SISTEMA DE BUSCA MOBILE
// ===============================
class SearchManager {
  static searchTimeout = null;
  static searchCache = new Map();

  static initialize() {
    this.bindSearchEvents();
  }

  static bindSearchEvents() {
    const searchToggle = document.getElementById("search-toggle");
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    if (!searchToggle || !searchContainer || !searchInput || !searchResults)
      return;

    // Toggle search container
    searchToggle.addEventListener("click", () => {
      const isVisible = searchContainer.style.display !== "none";
      searchContainer.style.display = isVisible ? "none" : "block";

      if (!isVisible) {
        searchInput.focus();
      } else {
        searchInput.value = "";
        searchResults.style.display = "none";
      }
    });

    // Search input events
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

    // Focus/blur events
    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = "rgba(0, 212, 255, 0.5)";
    });

    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = "rgba(0, 212, 255, 0.2)";

      setTimeout(() => {
        searchResults.style.display = "none";
      }, 200);
    });

    // Close search when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchContainer.contains(e.target) &&
        !searchToggle.contains(e.target)
      ) {
        searchContainer.style.display = "none";
        searchInput.value = "";
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
        <div class="no-results">
          <div class="loading-spinner"></div> Buscando...
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
        <div class="no-results" style="color: #ef4444;">
          Erro na busca. Tente novamente.
        </div>
      `;
    }
  }

  static displaySearchResults(results) {
    const searchResults = document.getElementById("searchResults");
    if (!searchResults) return;

    if (!results || !results.users || results.users.length === 0) {
      searchResults.innerHTML =
        '<div class="no-results">Nenhum resultado encontrado</div>';
      searchResults.style.display = "block";
      return;
    }

    const resultsHTML = results.users
      .map(
        (user) => `
    <div class="search-result-item" 
         data-user-id="${user._id}">
      <div class="user-avatar-small">
        ${
          user.profilePhotoUrl
            ? `<img src="${user.profilePhotoUrl}" 
                  alt="${user.name}" 
                  style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"
                  onerror="this.outerHTML='<span>${
                    user.avatar || "👤"
                  }</span>';">`
            : user.avatar || "👤"
        }
      </div>
      <div class="user-info-small">
        <div class="user-name">${user.name}</div>
        ${
          user.username
            ? `<div class="user-details">@${user.username}</div>`
            : ""
        }
      </div>
      <div class="user-coins">${user.coins || 0} 🪙</div>
    </div>
  `
      )
      .join("");

    searchResults.innerHTML = resultsHTML;
    searchResults.style.display = "block";

    searchResults.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        const userId = item.dataset.userId;
        this.handleUserSelect(userId);
      });
    });
  }

  static handleUserSelect(userId) {
    console.log("Usuário selecionado:", userId);

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchContainer = document.getElementById("searchContainer");

    if (searchInput) searchInput.value = "";
    if (searchResults) searchResults.style.display = "none";
    if (searchContainer) searchContainer.style.display = "none";
  }
}

// ===============================
// SISTEMA DE NAVEGAÇÃO MOBILE
// ===============================
class NavigationManager {
  static navigationHistory = [];
  static currentPage = "timeline";

  static initialize() {
    this.initializeNavigationTracking();
    this.initializeBackButton();
    this.initializeNavItems();
    this.initializeScrollEffects();
    this.createScrollToTopButton();
  }

  static initializeNavigationTracking() {
    // Salvar informações de navegação
    const referrer = document.referrer;
    const currentUrl = window.location.href;

    // Armazenar no sessionStorage para rastreamento
    const navigationData = {
      referrer: referrer,
      timestamp: Date.now(),
      currentUrl: currentUrl,
    };

    sessionStorage.setItem(
      "timeline_navigation",
      JSON.stringify(navigationData)
    );

    // Escutar mudanças no histórico
    window.addEventListener("popstate", (event) => {
      console.log("Navegação via histórico detectada:", event);
    });
  }

  static initializeBackButton() {
    const backButton = document.getElementById("go-back");
    if (backButton) {
      backButton.addEventListener("click", (e) => {
        e.preventDefault();

        // Recuperar dados de navegação
        const navigationData = JSON.parse(
          sessionStorage.getItem("timeline_navigation") || "{}"
        );
        const referrer = navigationData.referrer || document.referrer;
        const currentDomain = window.location.origin;

        console.log("Dados de navegação:", {
          referrer,
          currentDomain,
          historyLength: window.history.length,
        });

        // Estratégia 1: Se veio de uma página interna
        if (referrer && referrer.startsWith(currentDomain)) {
          console.log("Voltando via history.back() - referrer interno");
          this.goBackWithFallback();
          return;
        }

        // Estratégia 2: Se há histórico suficiente
        if (window.history.length > 2) {
          console.log("Voltando via history.back() - histórico disponível");
          this.goBackWithFallback();
          return;
        }

        // Estratégia 3: Verificar se veio de uma página específica comum
        const commonSources = [
          "/index.html",
          "/pages/profile/pages/profile.html",
          "/pages/ranking/html/ranks.html",
        ];
        const possibleSource = commonSources.find((source) =>
          referrer.includes(source)
        );

        if (possibleSource) {
          console.log("Redirecionando para fonte provável:", possibleSource);
          window.location.href = possibleSource;
          return;
        }

        // Estratégia 4: Fallback para home
        console.log("Redirecionando para home - fallback");
        window.location.href = "/index.html";
      });

      // Adicionar feedback visual
      backButton.addEventListener("mousedown", () => {
        backButton.style.transform = "scale(0.95)";
      });

      backButton.addEventListener("mouseup", () => {
        setTimeout(() => {
          backButton.style.transform = "scale(1.05)";
        }, 100);
      });

      backButton.addEventListener("mouseleave", () => {
        backButton.style.transform = "scale(1)";
      });
    }
  }

  static goBackWithFallback() {
    // Marcar que estamos tentando voltar
    const isGoingBack = true;
    sessionStorage.setItem("timeline_going_back", "true");

    // Tentar voltar
    window.history.back();

    // Verificar se conseguiu voltar após um tempo
    setTimeout(() => {
      const stillGoingBack = sessionStorage.getItem("timeline_going_back");

      if (stillGoingBack === "true") {
        // Se ainda está marcado como "voltando", significa que não conseguiu
        sessionStorage.removeItem("timeline_going_back");
        console.log("Não conseguiu voltar, redirecionando para home");
        window.location.href = "/index.html";
      }
    }, 500);
  }

  static initializeNavItems() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      // Skip items que são links <a>
      if (item.tagName === "A") return;

      item.addEventListener("click", function () {
        // Remove active de todos os nav-items do tipo div
        document.querySelectorAll(".nav-item").forEach((nav) => {
          if (nav.tagName !== "A") {
            nav.classList.remove("active");
          }
        });

        // Add active ao clicado
        this.classList.add("active");

        // Add animation
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "scale(1)";
        }, 150);

        // Handle navigation
        const target = this.dataset.tab;
        if (target) {
          NavigationManager.handleNavigation(target);
        }
      });

      // Hover effects para elementos div
      if (item.tagName !== "A") {
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
      }
    });

    // Add click effects for <a> elements too
    document.querySelectorAll(".nav-item").forEach((item) => {
      if (item.tagName === "A") {
        item.addEventListener("click", function (e) {
          // Add animation
          this.style.transform = "scale(0.95)";
          setTimeout(() => {
            this.style.transform = "scale(1)";
          }, 150);
        });

        // Hover effects for <a> elements
        item.addEventListener("mouseenter", function () {
          this.style.transform = "translateY(-2px)";
        });

        item.addEventListener("mouseleave", function () {
          this.style.transform = "translateY(0)";
        });
      }
    });
  }

  static handleNavigation(target) {
    console.log("Navegando para:", target);

    // Mapear targets para URLs
    const navigationMap = {
      home: "/index.html",
      timeline: "#", // Página atual
      ranks: "/pages/ranking/html/ranks.html",
      profile: "/pages/profile/pages/profile.html",
    };

    const url = navigationMap[target];
    if (url && url !== "#") {
      window.location.href = url;
    }
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
        if (scrollTop > 300) {
          scrollToTopBtn.style.display = "flex";
        } else {
          scrollToTopBtn.style.display = "none";
        }
      }
    });
  }

  static createScrollToTopButton() {
    const scrollToTop = document.getElementById("scrollToTop");
    if (!scrollToTop) return;

    scrollToTop.addEventListener("click", () => {
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  }
}

// ===============================
// MODAL MANAGER
// ===============================
class ModalManager {
  static initialize() {
    this.bindModalEvents();
  }

  static bindModalEvents() {
    const donationModal = document.getElementById("donationModal");
    const closeDonationModal = document.getElementById("closeDonationModal");
    const cancelDonationBtn = document.getElementById("cancelDonationBtn");
    const confirmDonationBtn = document.getElementById("confirmDonationBtn");

    if (closeDonationModal) {
      closeDonationModal.addEventListener("click", this.closeDonationModal);
    }

    if (cancelDonationBtn) {
      cancelDonationBtn.addEventListener("click", this.closeDonationModal);
    }

    if (confirmDonationBtn) {
      confirmDonationBtn.addEventListener("click", this.processDonation);
    }

    // Close modal clicking on overlay
    if (donationModal) {
      donationModal.addEventListener("click", (e) => {
        if (e.target === donationModal) {
          this.closeDonationModal();
        }
      });
    }

    // Recipient search
    this.initializeRecipientSearch();
  }

  static initializeRecipientSearch() {
    const recipientSearch = document.getElementById("recipientSearch");
    const modalSearchResults = document.getElementById("modalSearchResults");

    if (!recipientSearch || !modalSearchResults) return;

    let searchTimeout;
    recipientSearch.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      if (query.length >= 2) {
        searchTimeout = setTimeout(async () => {
          const results = await DonationService.searchUsers(query, 1, 5);
          ModalManager.displayModalSearchResults(results);
        }, 300);
      } else {
        modalSearchResults.innerHTML = "";
        modalSearchResults.style.display = "none";
      }
    });
  }

  static displayModalSearchResults(results) {
    const container = document.getElementById("modalSearchResults");
    if (!container) return;

    if (!results || !results.users || results.users.length === 0) {
      container.innerHTML =
        '<div class="no-results">Nenhum usuário encontrado</div>';
      container.style.display = "block";
      return;
    }

    container.innerHTML = results.users
      .map(
        (user) => `
      <div class="search-result-item" data-user-id="${user._id}">
        <div class="user-avatar-small">
          ${user.avatar || "👤"}
        </div>
        <div class="user-info-small">
          <div class="user-name">${user.name}</div>
          <div class="user-details">${
            user.username ? "@" + user.username : ""
          } ${user.institution || ""}</div>
        </div>
        <div class="user-coins">
          ${user.coins} 🪙
        </div>
      </div>
    `
      )
      .join("");

    container.style.display = "block";

    // Add click handlers
    container.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", () => {
        const userId = item.dataset.userId;
        const userName = item.querySelector(".user-name").textContent;
        this.selectRecipient(userId, userName);
      });
    });
  }

  static selectedRecipientId = null;

  static selectRecipient(userId, userName) {
    this.selectedRecipientId = userId;
    const recipientSearch = document.getElementById("recipientSearch");
    const modalSearchResults = document.getElementById("modalSearchResults");

    if (recipientSearch) recipientSearch.value = userName;
    if (modalSearchResults) modalSearchResults.style.display = "none";
  }

  static closeDonationModal() {
    const donationModal = document.getElementById("donationModal");
    if (donationModal) donationModal.style.display = "none";

    // Clear form
    const recipientSearch = document.getElementById("recipientSearch");
    const donationAmount = document.getElementById("donationAmount");
    const donationMessage = document.getElementById("donationMessage");
    const modalSearchResults = document.getElementById("modalSearchResults");

    if (recipientSearch) recipientSearch.value = "";
    if (donationAmount) donationAmount.value = "";
    if (donationMessage) donationMessage.value = "";
    if (modalSearchResults) modalSearchResults.innerHTML = "";

    ModalManager.selectedRecipientId = null;
  }

  static async processDonation() {
    if (!ModalManager.selectedRecipientId) {
      NotificationService.show("Selecione um destinatário", "warning");
      return;
    }

    const donationAmount = document.getElementById("donationAmount");
    const donationMessage = document.getElementById("donationMessage");

    const amount = parseInt(donationAmount?.value || 0);
    const message = donationMessage?.value || "";

    if (!amount || amount <= 0) {
      NotificationService.show("Insira uma quantidade válida", "warning");
      return;
    }

    try {
      const btn = document.getElementById("confirmDonationBtn");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="loading-spinner"></div> Processando...';
      }

      const result = await DonationService.createDonation(
        ModalManager.selectedRecipientId,
        amount,
        message
      );

      if (result && result.success) {
        ModalManager.closeDonationModal();
        await TimelineManager.loadData(currentFilter);
        NotificationService.show("Doação realizada com sucesso!", "success");
      }
    } catch (error) {
      console.error("Erro ao processar doação:", error);
      NotificationService.show(
        "Erro ao processar doação. Tente novamente.",
        "error"
      );
    } finally {
      const btn = document.getElementById("confirmDonationBtn");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Doar";
      }
    }
  }
}

// ===============================
// SISTEMA DE AUTO-UPDATE
// ===============================
class AutoUpdateManager {
  static interval = null;

  static start() {
    this.stop();

    this.interval = setInterval(async () => {
      if (Date.now() - lastFetchTime > CACHE_DURATION) {
        await TimelineManager.loadData(currentFilter);
      }
    }, 30000);

    // Update stats every minute
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
  console.log("🚀 Enhanced Timeline System v2.1 Mobile - Inicializando...");

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
    SearchManager.initialize();
    NavigationManager.initialize();
    ModalManager.initialize();

    // Carregar dados iniciais
    await TimelineManager.loadData("all");

    // Iniciar auto-update
    AutoUpdateManager.start();

    // Feedback de sucesso
    // setTimeout(() => {
    //   NotificationService.show(" Timeline carregada com sucesso!", "success");
    // }, 1000);

    console.log("✅ Timeline mobile inicializada com sucesso");
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
  filterTimeline: (filter) => TimelineManager.loadData(filter), // Método que estava faltando

  // Services
  DonationService,
  UserService,
  AuthService,

  // Managers
  TimelineManager,
  FilterManager,
  NotificationService,
  SearchManager,
  NavigationManager,
  ModalManager,

  // Utilities
  getCurrentFilter: () => currentFilter,
  getCurrentUser: () => currentUser,
  isLoading: () => isLoading,

  // Cache management
  clearCache: () => DonationService.clearCache(),

  // Auto-update control
  startAutoUpdate: () => AutoUpdateManager.start(),
  stopAutoUpdate: () => AutoUpdateManager.stop(),

  // Version info
  version: "2.1",
  features: [
    "mobile_optimized",
    "timeline_management",
    "filtering_system",
    "pull_to_refresh",
    "search_functionality",
    "modal_system",
    "auto_updates",
    "touch_interactions",
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const goBackButton = document.getElementById("go-back");

  if (goBackButton) {
    goBackButton.addEventListener("click", () => {
      history.back();
    });
  }
});

// ===============================
// INICIALIZAÇÃO E EVENTOS
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌟 Sistema Timeline Mobile v2.1 - Inicializando...");

  try {
    const initialized = await initialize();

    if (initialized) {
      console.log("✅ Todos os componentes mobile inicializados!");
    } else {
      console.error("❌ Falha na inicialização");
    }
  } catch (error) {
    console.error("💥 Erro crítico:", error);
    NotificationService.show("Erro crítico na inicialização", "error");
  }
});

// Cleanup
window.addEventListener("beforeunload", () => {
  AutoUpdateManager.stop();
  DonationService.clearCache();
  SearchManager.searchCache.clear();
});

console.log("🎉 Enhanced Timeline System v2.1 Mobile carregado!");
console.log("📚 API disponível em: window.timelineAPI");
