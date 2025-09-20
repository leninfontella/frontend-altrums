// ========== SISTEMA CENTRALIZADO DE GERENCIAMENTO DE DADOS ==========
// storage-manager.js - Sistema para sincronizar dados entre páginas

class DataManager {
  static STORAGE_KEYS = {
    USER_DATA: "currentUser",
    USER_STATS: "userStats",
    INTERACTIONS: "userInteractions",
    DONATIONS: "donationHistory",
    TIMELINE_CACHE: "timelineCache",
  };

  // ========== GETTERS DE DADOS ==========
  static getUserData() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      return null;
    }
  }

  static getUserStats() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.USER_STATS);
      return data ? JSON.parse(data) : this.getDefaultStats();
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      return this.getDefaultStats();
    }
  }

  static getInteractionData() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.INTERACTIONS);
      return data ? JSON.parse(data) : this.getDefaultInteractions();
    } catch (error) {
      console.error("Erro ao carregar interações:", error);
      return this.getDefaultInteractions();
    }
  }

  static getDonationHistory() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.DONATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erro ao carregar histórico de doações:", error);
      return [];
    }
  }

  // ========== SETTERS DE DADOS ==========
  static saveUserData(userData) {
    try {
      const currentData = this.getUserData() || {};
      const updatedData = { ...currentData, ...userData };
      sessionStorage.setItem(
        this.STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedData)
      );
      this.triggerStorageEvent("userDataUpdated", updatedData);
      return true;
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
      return false;
    }
  }

  static saveUserStats(stats) {
    try {
      const currentStats = this.getUserStats();
      const updatedStats = { ...currentStats, ...stats };
      sessionStorage.setItem(
        this.STORAGE_KEYS.USER_STATS,
        JSON.stringify(updatedStats)
      );
      this.triggerStorageEvent("userStatsUpdated", updatedStats);
      return true;
    } catch (error) {
      console.error("Erro ao salvar estatísticas:", error);
      return false;
    }
  }

  static saveInteractionData(interactions) {
    try {
      sessionStorage.setItem(
        this.STORAGE_KEYS.INTERACTIONS,
        JSON.stringify(interactions)
      );
      this.triggerStorageEvent("interactionsUpdated", interactions);
      return true;
    } catch (error) {
      console.error("Erro ao salvar interações:", error);
      return false;
    }
  }

  // ========== FUNÇÕES DE DOAÇÃO ==========
  static processDonation(recipientId, amount, message = "") {
    try {
      const userData = this.getUserData();
      const stats = this.getUserStats();
      const interactions = this.getInteractionData();
      const donationHistory = this.getDonationHistory();

      if (!userData || userData.coins < amount) {
        throw new Error("Saldo insuficiente");
      }

      // Criar registro da doação
      const donation = {
        id: Date.now().toString(),
        recipientId,
        amount,
        message,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString("pt-BR"),
        timeAgo: "agora mesmo",
      };

      // Atualizar dados do usuário
      const newBalance = userData.coins - amount;
      this.saveUserData({
        coins: newBalance,
        lastDonationAmount: amount,
        lastDonationDate: "agora mesmo",
        lastDonationTimestamp: Date.now(),
      });

      // Atualizar estatísticas
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

      this.saveUserStats({
        totalDonated: (stats.totalDonated || 0) + amount,
        monthlyDonated: (stats.monthlyDonated || 0) + amount,
        totalDonations: (stats.totalDonations || 0) + 1,
        donations: (stats.donations || 0) + 1,
        lastDonationMonth: currentMonth,
      });

      // Atualizar interações
      this.updateUserInteraction(recipientId, amount);

      // Adicionar ao histórico
      donationHistory.unshift(donation);
      // Manter apenas os últimos 50 registros
      if (donationHistory.length > 50) {
        donationHistory.splice(50);
      }
      sessionStorage.setItem(
        this.STORAGE_KEYS.DONATIONS,
        JSON.stringify(donationHistory)
      );

      console.log("Doação processada com sucesso:", donation);
      return { success: true, donation, newBalance };
    } catch (error) {
      console.error("Erro ao processar doação:", error);
      return { success: false, error: error.message };
    }
  }

  static updateUserInteraction(recipientId, amount) {
    const interactions = this.getInteractionData();
    const recipientName = this.getRecipientName(recipientId);

    if (!interactions.users[recipientId]) {
      interactions.users[recipientId] = {
        name: recipientName,
        totalAmount: 0,
        count: 0,
        lastInteraction: Date.now(),
      };
    }

    interactions.users[recipientId].totalAmount += amount;
    interactions.users[recipientId].count += 1;
    interactions.users[recipientId].lastInteraction = Date.now();

    // Encontrar usuário com maior interação
    let topUser = null;
    let maxCount = 0;

    Object.entries(interactions.users).forEach(([id, user]) => {
      if (user.count > maxCount) {
        maxCount = user.count;
        topUser = { id, ...user };
      }
    });

    if (topUser) {
      interactions.topUser = topUser;
    }

    this.saveInteractionData(interactions);
  }

  static getRecipientName(recipientId) {
    // Tentar buscar nome do recipiente de várias fontes
    const timelineCache = this.getTimelineCache();
    const cachedUser = timelineCache.users && timelineCache.users[recipientId];

    if (cachedUser) {
      return cachedUser.name;
    }

    // Nomes fictícios para demo
    const demoNames = [
      "Ana Silva",
      "Carlos Santos",
      "Maria Oliveira",
      "João Costa",
      "Fernanda Lima",
      "Pedro Martins",
      "Julia Ferreira",
      "Lucas Almeida",
    ];

    return (
      demoNames[Math.abs(recipientId.hashCode() || 0) % demoNames.length] ||
      "Usuário"
    );
  }

  // ========== FUNÇÕES DE RECEBIMENTO ==========
  static processReceivedDonation(donorId, amount, message = "") {
    try {
      const userData = this.getUserData();
      const stats = this.getUserStats();

      // Atualizar saldo
      const newBalance = (userData.coins || 0) + amount;
      this.saveUserData({
        coins: newBalance,
      });

      // Atualizar estatísticas de recebimento
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;

      this.saveUserStats({
        totalReceived: (stats.totalReceived || 0) + amount,
        monthlyReceived: (stats.monthlyReceived || 0) + amount,
        donationsReceived: (stats.donationsReceived || 0) + 1,
        lastReceivedMonth: currentMonth,
      });

      console.log("Doação recebida processada:", { donorId, amount });
      return { success: true, newBalance };
    } catch (error) {
      console.error("Erro ao processar recebimento:", error);
      return { success: false, error: error.message };
    }
  }

  // ========== FUNÇÕES PARA O GRÁFICO ==========
  static getMonthlyChartData() {
    const stats = this.getUserStats();
    const donated = stats.monthlyDonated || 0;
    const received = stats.monthlyReceived || 0;
    const total = donated + received;

    return {
      donated,
      received,
      total,
      donatedPercent: total > 0 ? Math.round((donated / total) * 100) : 0,
      receivedPercent: total > 0 ? Math.round((received / total) * 100) : 0,
    };
  }

  // ========== FUNÇÕES PARA METAS ==========
  static getGoalProgress() {
    const userData = this.getUserData();
    const stats = this.getUserStats();

    const currentBalance = userData.coins || 0;
    const goalAmount = userData.donationGoal || 100;
    const monthlyDonated = stats.monthlyDonated || 0;

    return {
      currentBalance,
      goalAmount,
      monthlyDonated,
      progress: Math.min((monthlyDonated / goalAmount) * 100, 100),
      remaining: Math.max(goalAmount - monthlyDonated, 0),
    };
  }

  static updateGoal(newGoalAmount) {
    return this.saveUserData({
      donationGoal: newGoalAmount,
    });
  }

  // ========== DADOS PADRÃO ==========
  static getDefaultStats() {
    return {
      totalDonated: 0,
      totalReceived: 0,
      monthlyDonated: 0,
      monthlyReceived: 0,
      totalDonations: 0,
      donationsReceived: 0,
      donations: 0,
    };
  }

  static getDefaultInteractions() {
    return {
      users: {},
      topUser: {
        name: "Nenhuma interação ainda",
        count: 0,
      },
    };
  }

  // ========== CACHE DA TIMELINE ==========
  static getTimelineCache() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEYS.TIMELINE_CACHE);
      return data ? JSON.parse(data) : { users: {}, donations: [] };
    } catch (error) {
      console.error("Erro ao carregar cache da timeline:", error);
      return { users: {}, donations: [] };
    }
  }

  static saveTimelineCache(cache) {
    try {
      sessionStorage.setItem(
        this.STORAGE_KEYS.TIMELINE_CACHE,
        JSON.stringify(cache)
      );
      return true;
    } catch (error) {
      console.error("Erro ao salvar cache da timeline:", error);
      return false;
    }
  }

  // ========== SISTEMA DE EVENTOS ==========
  static eventListeners = new Map();

  static addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  static removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  static triggerStorageEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Erro no listener de evento:", error);
        }
      });
    }

    // Dispara evento customizado para outras páginas
    window.dispatchEvent(
      new CustomEvent("dataManager:" + event, { detail: data })
    );
  }

  // ========== FUNÇÕES DE UTILIDADE ==========
  static formatCurrency(amount) {
    return amount.toLocaleString("pt-BR");
  }

  static getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;

    if (diff < minute) return "agora mesmo";
    if (diff < hour) return `${Math.floor(diff / minute)} min atrás`;
    if (diff < day) return `${Math.floor(diff / hour)}h atrás`;
    return `${Math.floor(diff / day)}d atrás`;
  }

  static debugStorageData() {
    console.group("🔍 Debug - Dados do SessionStorage");
    console.log("👤 User Data:", this.getUserData());
    console.log("📊 User Stats:", this.getUserStats());
    console.log("🤝 Interactions:", this.getInteractionData());
    console.log("💰 Donations:", this.getDonationHistory().slice(0, 5));
    console.log("🎯 Goal Progress:", this.getGoalProgress());
    console.log("📈 Chart Data:", this.getMonthlyChartData());
    console.groupEnd();
  }

  // ========== MIGRAÇÃO E COMPATIBILIDADE ==========
  static migrateOldData() {
    try {
      // Verificar se há dados antigos para migrar
      const oldUserData =
        localStorage.getItem("userData") || localStorage.getItem("currentUser");

      if (oldUserData && !this.getUserData()) {
        const parsed = JSON.parse(oldUserData);
        this.saveUserData(parsed);
        console.log("✅ Dados migrados do localStorage para sessionStorage");
      }

      return true;
    } catch (error) {
      console.error("Erro na migração de dados:", error);
      return false;
    }
  }

  // ========== INICIALIZAÇÃO ==========
  static initialize() {
    console.log("🚀 Inicializando DataManager...");

    // Migrar dados antigos se necessário
    this.migrateOldData();

    // Configurar dados iniciais se não existirem
    if (!this.getUserData()) {
      this.saveUserData({
        name: "Usuário",
        email: "usuario@exemplo.com",
        coins: 1250,
        donationGoal: 100,
      });
    }

    if (!this.getUserStats()) {
      this.saveUserStats(this.getDefaultStats());
    }

    if (!this.getInteractionData()) {
      this.saveInteractionData(this.getDefaultInteractions());
    }

    console.log("✅ DataManager inicializado");
    return true;
  }
}

// Helper para hash simples de string
String.prototype.hashCode = function () {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// ========== INTEGRAÇÃO COM AUTH.JS ==========
class AuthDataSync {
  static syncWithAuth() {
    if (typeof Auth !== "undefined") {
      const authUserData = Auth.getUserData();
      const authBalance = Auth.getUserBalance();

      if (authUserData) {
        // Sincronizar dados do Auth com o DataManager
        DataManager.saveUserData({
          ...authUserData,
          coins: authBalance || 0,
        });
      }
    }
  }

  static updateAuthBalance(newBalance) {
    if (typeof Auth !== "undefined" && Auth.updateUserBalance) {
      Auth.updateUserBalance(newBalance);
    }
  }
}

// ========== EXPORTAÇÃO GLOBAL ==========
if (typeof window !== "undefined") {
  window.DataManager = DataManager;
  window.AuthDataSync = AuthDataSync;

  // Auto-inicializar quando o script é carregado
  document.addEventListener("DOMContentLoaded", () => {
    DataManager.initialize();
    AuthDataSync.syncWithAuth();
  });
}

// ========== LOG DE INICIALIZAÇÃO ==========
console.log(`
🗄️  DataManager v1.0 carregado!
📱 Funcionalidades:
   • Gerenciamento centralizado de dados
   • Sincronização entre páginas
   • Histórico de doações
   • Estatísticas em tempo real
   • Sistema de metas
   • Tracking de interações

🛠️  Comandos de debug:
   • DataManager.debugStorageData()
   • DataManager.processDonation(recipientId, amount)
   • DataManager.getGoalProgress()
`);

export { DataManager, AuthDataSync };
