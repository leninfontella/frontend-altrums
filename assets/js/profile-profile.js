// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Inicializando página de perfil...");
  initializeProfile();
});

// ========== CONFIGURAÇÃO DA API ==========
const API_BASE_URL = "https://api-backend-coins.onrender.com/api"; // Ajuste conforme seu backend

// Cache para evitar requisições excessivas
let apiCache = new Map();
let lastApiCall = 0;
const API_COOLDOWN = 2000; // 2 segundos entre chamadas

// Função para fazer requisições autenticadas
async function apiRequest(endpoint, options = {}) {
  try {
    // Rate limiting básico
    const now = Date.now();
    if (now - lastApiCall < API_COOLDOWN) {
      console.log("⏳ Aguardando cooldown da API...");
      await new Promise((resolve) =>
        setTimeout(resolve, API_COOLDOWN - (now - lastApiCall))
      );
    }

    // Verificar cache para GET requests
    if (!options.method || options.method === "GET") {
      const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
      const cached = apiCache.get(cacheKey);
      if (cached && now - cached.timestamp < 30000) {
        // Cache por 30 segundos
        console.log("📋 Usando dados do cache para:", endpoint);
        return cached.data;
      }
    }

    // Obter token do Auth module
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

    // Verificar se a resposta é JSON antes de tentar fazer parse
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textResponse = await response.text();
      console.error("Resposta não é JSON:", textResponse);
      throw new Error(
        `Resposta inválida do servidor: ${textResponse.substring(0, 100)}`
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "Muitas requisições - tente novamente em alguns segundos"
        );
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    // Salvar no cache para GET requests
    if (!options.method || options.method === "GET") {
      const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
      apiCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    console.error("Erro na requisição API:", error);
    throw error;
  }
}

// ========== SERVIÇO DE USUÁRIO MELHORADO ==========
class UserProfileService {
  // Função para extrair primeiro nome
  static getFirstName(fullName) {
    if (!fullName) return "Usuário";
    return fullName.trim().split(" ")[0];
  }

  // Buscar dados reais do dashboard via API
  static async getDashboardData() {
    try {
      console.log("📄 Buscando dados do dashboard da API...");

      const response = await apiRequest("/dashboard");

      if (response.success && response.data) {
        const data = response.data;
        console.log("✅ Dados do dashboard carregados:", data);

        // Transformar dados da API para formato esperado pelo frontend
        const userData = {
          fullName: data.user.name,
          firstName: this.getFirstName(data.user.name),
          email: data.user.email,
          phone: "", // Não retornado pela API por segurança
          level: data.user.level || "Explorador",
          xp: data.user.xp || 0,
          maxXp: data.user.maxXp || 1000,
          rank: data.user.rank || 0,
          score: data.user.score || 0,
          coins: data.user.coins || 0,
          donations: data.monthlyStats.donated.count || 0,
          totalDonated: data.user.totalDonated || 0,
          monthlyDonated: data.monthlyStats.donated.amount || 0,
          monthlyReceived: data.monthlyStats.received.amount || 0,
          lastDonationAmount: data.lastDonation.amount || 0,
          lastDonationDate: data.lastDonation.date || "Nenhuma doação ainda",
          lastDonationToUser: data.lastDonation.toUser || null,
          donationGoal: data.goal.target || 100,
          goalProgress: data.goal.progress || 0,
          goalCurrent: data.goal.current || 0,
          topInteractingUser:
            data.topInteraction.userName || "Nenhuma interação ainda",
          topUserInteractions: data.topInteraction.interactionCount || 0,
          topUserAmount: data.topInteraction.totalAmount || 0,
          period: data.period,
        };

        // Salvar no sessionStorage para cache
        sessionStorage.setItem("currentUser", JSON.stringify(userData));
        sessionStorage.setItem("dashboardData", JSON.stringify(data));

        return userData;
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados do dashboard:", error);

      // Fallback para dados do sessionStorage ou dados de exemplo
      return this.getUserDataFallback();
    }
  }

  // Fallback para quando a API não está disponível
  static getUserDataFallback() {
    console.log("📄 Usando fallback para dados do usuário...");

    // Primeiro tentar sessionStorage
    const storedUser = Auth.getUserData();
    if (storedUser) {
      console.log("✅ Dados encontrados no sessionStorage:", storedUser);
      return {
        fullName: storedUser.name || storedUser.fullName || "Usuário",
        firstName: this.getFirstName(storedUser.name || storedUser.fullName),
        email: storedUser.email || "usuario@exemplo.com",
        phone: storedUser.phone || "",
        level: storedUser.level || "Explorador",
        xp: storedUser.xp || 650,
        maxXp: storedUser.maxXp || 1000,
        rank: storedUser.rank || 8,
        score: storedUser.score || 2050,
        coins: storedUser.coins || 1250,
        donations: storedUser.donations || 0,
        totalDonated: storedUser.totalDonated || 0,
        monthlyDonated: storedUser.monthlyDonated || 0,
        monthlyReceived: storedUser.monthlyReceived || 0,
        lastDonationAmount: storedUser.lastDonationAmount || 0,
        lastDonationDate: storedUser.lastDonationDate || "Nenhuma doação ainda",
        lastDonationToUser: storedUser.lastDonationToUser || null,
        donationGoal: storedUser.donationGoal || 100,
        goalProgress: storedUser.goalProgress || 0,
        goalCurrent: storedUser.goalCurrent || 0,
        topInteractingUser:
          storedUser.topInteractingUser || "Nenhuma interação ainda",
        topUserInteractions: storedUser.topUserInteractions || 0,
        topUserAmount: storedUser.topUserAmount || 0,
      };
    }

    // Se não tem nada, usar dados de exemplo
    console.warn("⚠️ Usando dados de exemplo");
    return {
      fullName: "Usuário Demo",
      firstName: "Usuário",
      email: "demo@exemplo.com",
      phone: "",
      level: "Explorador",
      xp: 650,
      maxXp: 1000,
      rank: 8,
      score: 2050,
      coins: 1250,
      donations: 0,
      totalDonated: 0,
      monthlyDonated: 0,
      monthlyReceived: 0,
      lastDonationAmount: 0,
      lastDonationDate: "Nenhuma doação ainda",
      lastDonationToUser: null,
      donationGoal: 100,
      goalProgress: 0,
      goalCurrent: 0,
      topInteractingUser: "Nenhuma interação ainda",
      topUserInteractions: 0,
      topUserAmount: 0,
    };
  }

  // Método principal para obter dados (tenta API primeiro, depois fallback)
  static async getUserData() {
    try {
      return await this.getDashboardData();
    } catch (error) {
      console.warn("⚠️ Falha na API, usando fallback:", error.message);
      return this.getUserDataFallback();
    }
  }

  // Salva dados atualizados do usuário
  static saveUserData(userData) {
    try {
      const currentData = Auth.getUserData() || {};
      const updatedData = { ...currentData, ...userData };

      // Usar sessionStorage como o módulo Auth
      sessionStorage.setItem("currentUser", JSON.stringify(updatedData));
      console.log("✅ Dados do usuário salvos:", updatedData);
      return true;
    } catch (error) {
      console.error("❌ Erro ao salvar dados do usuário:", error);
      return false;
    }
  }

  // Função para atualizar meta via API
  static async updateGoal(newGoalAmount) {
    try {
      console.log(`🎯 Atualizando meta para ${newGoalAmount} via API...`);

      const response = await apiRequest("/dashboard/goal", {
        method: "PUT",
        body: JSON.stringify({ goalAmount: newGoalAmount }),
      });

      if (response.success) {
        console.log("✅ Meta atualizada na API:", response.data);

        // Atualizar dados locais também
        this.saveUserData({ donationGoal: newGoalAmount });

        return true;
      } else {
        throw new Error(response.message || "Falha ao atualizar meta");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar meta via API:", error);

      // Fallback para atualização local
      console.log("📄 Usando fallback local para meta...");
      return this.saveUserData({ donationGoal: newGoalAmount });
    }
  }

  // Função de debug
  static debugLocalStorage() {
    console.log("🔧 DEBUG - SessionStorage:");
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      console.log(`  ${key}:`, value);
    }
  }
}

// ========== GERENCIADOR DE METAS ==========
class GoalManager {
  static getGoalData() {
    const dashboardData = sessionStorage.getItem("dashboardData");
    if (dashboardData) {
      try {
        const data = JSON.parse(dashboardData);
        return {
          current: data.goal?.current || 0,
          goal: data.goal?.target || 100,
          progress: data.goal?.progress || 0,
        };
      } catch (error) {
        console.error("Erro ao parse dashboardData:", error);
      }
    }

    // Fallback para dados locais
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        const currentDonated =
          userData.monthlyDonated || userData.goalCurrent || 0;
        const goalAmount = userData.donationGoal || 100;
        const progress =
          goalAmount > 0
            ? Math.min((currentDonated / goalAmount) * 100, 100)
            : 0;

        return {
          current: currentDonated,
          goal: goalAmount,
          progress: progress,
        };
      } catch (error) {
        console.error("Erro ao parse currentUser:", error);
      }
    }

    // Fallback final
    return {
      current: 0,
      goal: 100,
      progress: 0,
    };
  }

  static async updateGoal(newGoalAmount) {
    try {
      const success = await UserProfileService.updateGoal(newGoalAmount);

      if (success) {
        this.updateGoalDisplay();
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Erro ao atualizar meta:", error);
      return false;
    }
  }

  static updateGoalDisplay() {
    const goalData = this.getGoalData();
    const progressText = document.getElementById("goal-progress-text");
    const progressBar = document.getElementById("goal-progress-bar");

    console.log("🎯 Atualizando display da meta:", goalData);

    if (progressText) {
      progressText.textContent = `${goalData.current}/${goalData.goal}`;
    }

    if (progressBar) {
      progressBar.style.width = `${Math.max(goalData.progress, 2)}%`;
    }
  }

  // Nova função para atualizar meta após doação
  static updateAfterDonation(donationAmount) {
    const userData = UserProfileService.getUserDataFallback();
    const newMonthlyDonated = userData.monthlyDonated + donationAmount;

    // Atualizar dados no storage
    const success = UserProfileService.saveUserData({
      monthlyDonated: newMonthlyDonated,
      coins: Math.max(0, userData.coins - donationAmount),
      donations: userData.donations + 1,
      lastDonationAmount: donationAmount,
      lastDonationDate: "agora mesmo",
    });

    if (success) {
      this.updateGoalDisplay();
      return true;
    }
    return false;
  }
}

// ========== GERENCIADOR DE DASHBOARD ==========
class DashboardManager {
  static updateDashboard(userData) {
    console.log("📊 Atualizando dashboard com dados:", userData);

    // Atualizar usuário com maior interação
    const topUserEl = document.getElementById("top-interacting-user");
    const topInteractionsEl = document.getElementById("top-user-interactions");

    if (topUserEl) {
      topUserEl.textContent =
        userData.topInteractingUser || "Nenhuma interação ainda";
    }

    if (topInteractionsEl) {
      const interactionText =
        userData.topUserInteractions > 0
          ? `${userData.topUserInteractions} interações este mês`
          : "Nenhuma interação este mês";
      topInteractionsEl.textContent = interactionText;
    }

    // Atualizar última doação
    const lastAmountEl = document.getElementById("last-donation-amount");
    const lastDateEl = document.getElementById("last-donation-date");
    const lastUserEl = document.getElementById("last-donation-user");

    if (lastAmountEl) {
      const amountText =
        userData.lastDonationAmount > 0
          ? `${userData.lastDonationAmount} moedas`
          : "Nenhuma doação";
      lastAmountEl.textContent = amountText;
    }

    if (lastDateEl) {
      lastDateEl.textContent =
        userData.lastDonationDate || "Nenhuma doação ainda";
    }

    if (lastUserEl && userData.lastDonationToUser) {
      lastUserEl.textContent = `para ${userData.lastDonationToUser}`;
    }

    // Atualizar gráfico de doações
    this.updateDonationChart(userData);
  }

  static updateDonationChart(userData) {
    const donatedCount = document.getElementById("donated-count");
    const receivedCount = document.getElementById("received-count");
    const donatedBar = document.getElementById("donated-bar");
    const receivedBar = document.getElementById("received-bar");

    const donated = userData.monthlyDonated || 0;
    const received = userData.monthlyReceived || 0;
    const total = donated + received;

    console.log(
      "📊 Atualizando gráfico - Doadas:",
      donated,
      "Recebidas:",
      received
    );

    if (donatedCount) {
      donatedCount.textContent = `Doadas: ${donated}`;
    }

    if (receivedCount) {
      receivedCount.textContent = `Recebidas: ${received}`;
    }

    // Calcular alturas das barras baseado na proporção
    if (total > 0) {
      const donatedHeight = Math.max((donated / total) * 100, 5);
      const receivedHeight = Math.max((received / total) * 100, 5);

      if (donatedBar) {
        donatedBar.style.height = `${donatedHeight}%`;
      }

      if (receivedBar) {
        receivedBar.style.height = `${receivedHeight}%`;
      }
    } else {
      // Se não há doações, mostrar barras pequenas
      if (donatedBar) donatedBar.style.height = "5%";
      if (receivedBar) receivedBar.style.height = "5%";
    }
  }
}

// ========== FUNÇÃO PRINCIPAL PARA CARREGAR DADOS DO USUÁRIO ==========
let isLoadingData = false; // Flag para evitar chamadas múltiplas

async function loadAndDisplayUserData() {
  // Evitar chamadas múltiplas simultâneas
  if (isLoadingData) {
    console.log("⏳ Carregamento já em andamento...");
    return;
  }

  isLoadingData = true;
  console.log("📄 Carregando e exibindo dados do usuário...");

  // Mostrar loading
  showLoadingState();

  try {
    // Debug para ver o que tem no sessionStorage
    UserProfileService.debugLocalStorage();

    const userData = await UserProfileService.getUserData();

    if (!userData) {
      console.error("❌ Falha ao carregar dados do usuário");
      showErrorState();
      return;
    }

    console.log("📊 Dados do usuário carregados:", userData);

    // Esconder loading
    hideLoadingState();

    // Atualizar nome
    const profileName = document.getElementById("profile-name");
    if (profileName) {
      profileName.textContent = userData.fullName;
      console.log("✅ Nome atualizado:", userData.fullName);
    } else {
      console.warn("⚠️ Elemento 'profile-name' não encontrado");
    }

    // Atualizar email
    const profileEmail = document.getElementById("profile-email");
    if (profileEmail) {
      profileEmail.textContent = userData.email;
      console.log("✅ Email atualizado:", userData.email);
    } else {
      console.warn("⚠️ Elemento 'profile-email' não encontrado");
    }

    // Atualizar estatísticas
    updateStats(userData);

    // Atualizar dashboard
    DashboardManager.updateDashboard(userData);

    // Atualizar metas
    GoalManager.updateGoalDisplay();

    // Procurar por outros elementos que possam precisar do nome
    updateAllNameElements(userData);
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
    hideLoadingState();
    showErrorState();
  } finally {
    isLoadingData = false;
  }
}

// ========== ESTADOS DE LOADING E ERRO ==========
function showLoadingState() {
  // Adicionar indicadores de loading nos elementos principais
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const userCoins = document.getElementById("user-coins");
  const userDonations = document.getElementById("user-donations");

  // Adicionar os elementos do dashboard
  const topInteractingUser = document.getElementById("top-interacting-user");
  const topUserInteractions = document.getElementById("top-user-interactions");
  const lastDonationAmount = document.getElementById("last-donation-amount");
  const lastDonationDate = document.getElementById("last-donation-date");

  if (profileName) profileName.textContent = "Carregando...";
  if (profileEmail) profileEmail.textContent = "Carregando...";
  if (userCoins) userCoins.textContent = "...";
  if (userDonations) userDonations.textContent = "...";

  // Atualizar os elementos do dashboard
  if (topInteractingUser) topInteractingUser.textContent = "Carregando...";
  if (topUserInteractions) topUserInteractions.textContent = "...";
  if (lastDonationAmount) lastDonationAmount.textContent = "Carregando...";
  if (lastDonationDate) lastDonationDate.textContent = "...";
}

function hideLoadingState() {
  // Remove qualquer indicador de loading se necessário
  console.log("✅ Loading concluído");
}

function showErrorState() {
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");

  if (profileName) profileName.textContent = "Erro ao carregar";
  if (profileEmail) profileEmail.textContent = "Tente novamente";

  // Mostrar mensagem de erro discreta
  console.error("❌ Estado de erro ativado");
}

// ========== FUNÇÃO PARA ATUALIZAR TODOS OS ELEMENTOS COM NOME ==========
function updateAllNameElements(userData) {
  // Lista de seletores possíveis para nome do usuário
  const nameSelectors = [
    "#profile-name",
    ".profile-name",
    ".user-name",
    ".current-user-name",
    "[data-user-name]",
    ".header-name",
    ".display-name",
  ];

  nameSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = userData.fullName;
        console.log(`✅ Nome atualizado em ${selector}`);
      }
    });
  });

  // Lista de seletores possíveis para email
  const emailSelectors = [
    "#profile-email",
    ".profile-email",
    ".user-email",
    "[data-user-email]",
  ];

  emailSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = userData.email;
        console.log(`✅ Email atualizado em ${selector}`);
      }
    });
  });
}

// ========== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ==========
async function initializeProfile() {
  console.log("⚙️ Configurando perfil...");

  // Carrega dados do usuário PRIMEIRO
  await loadAndDisplayUserData();

  // Depois configura as outras funcionalidades
  setupMenuInteractions();
  setupNavigationInteractions();
  setupHeaderButtons();
  setupGoalModal();
  animateDashboard();

  console.log("✅ Perfil inicializado com sucesso!");
}

// ========== CONFIGURAÇÃO DO MODAL DE METAS ==========
function setupGoalModal() {
  const editBtn = document.getElementById("edit-goal-btn");
  const modal = document.getElementById("goal-modal");
  const closeBtn = document.getElementById("close-modal");
  const saveBtn = document.getElementById("save-goal");
  const goalSelect = document.getElementById("goal-amount");

  if (editBtn && modal) {
    editBtn.addEventListener("click", () => {
      modal.classList.add("show");

      // Definir valor atual no select
      const currentGoal = GoalManager.getGoalData().goal;
      if (goalSelect) {
        goalSelect.value = currentGoal;
      }
    });
  }

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

  if (saveBtn && goalSelect && modal) {
    saveBtn.addEventListener("click", async () => {
      const newGoal = parseInt(goalSelect.value);

      if (newGoal) {
        // Mostrar estado de loading no botão
        const originalText = saveBtn.textContent;
        saveBtn.textContent = "Salvando...";
        saveBtn.disabled = true;

        try {
          const success = await GoalManager.updateGoal(newGoal);

          if (success) {
            modal.classList.remove("show");

            // Mostrar feedback de sucesso
            saveBtn.textContent = "Salvo!";
            saveBtn.style.background =
              "linear-gradient(135deg, #00ff88, #00cc66)";

            setTimeout(() => {
              saveBtn.textContent = originalText;
              saveBtn.style.background =
                "linear-gradient(135deg, #00d4ff, #0099cc)";
              saveBtn.disabled = false;
            }, 2000);

            // Recarregar dados para mostrar a nova meta
            await loadAndDisplayUserData();
          } else {
            throw new Error("Falha ao salvar meta");
          }
        } catch (error) {
          console.error("❌ Erro ao salvar meta:", error);

          // Mostrar erro
          saveBtn.textContent = "Erro!";
          saveBtn.style.background =
            "linear-gradient(135deg, #ff4444, #cc0000)";

          setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background =
              "linear-gradient(135deg, #00d4ff, #0099cc)";
            saveBtn.disabled = false;
          }, 3000);
        }
      }
    });
  }
}

// ========== FUNÇÕES DE CONFIGURAÇÃO ==========
function setupMenuInteractions() {
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      handleMenuClick(this);
    });

    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(5px) scale(1.02)";
    });

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0) scale(1)";
    });
  });
}

function handleMenuClick(menuItem) {
  menuItem.style.transform = "scale(0.95)";
  menuItem.style.transition = "transform 0.15s ease";

  setTimeout(() => {
    menuItem.style.transform = "";
    menuItem.style.transition = "all 0.3s ease";
  }, 150);

  const menuTitle = menuItem.querySelector(".menu-title").textContent;
  handleMenuAction(menuTitle);
}

function handleMenuAction(menuTitle) {
  switch (menuTitle) {
    case "Histórico":
      console.log("Navegando para histórico de transações");
      break;
    case "Segurança":
      console.log("Abrindo configurações de segurança");
      break;
    case "Suporte":
      console.log("Abrindo suporte");
      break;
    default:
      console.log("Ação não definida para:", menuTitle);
  }
}

// ========== NAVEGAÇÃO ==========
const goBackButton = document.getElementById("go-back");
if (goBackButton) {
  goBackButton.addEventListener("click", () => {
    if (document.referrer) {
      window.history.back();
    } else {
      window.location.href = "../../login/html/login.html";
    }
  });
}

// Outros botões de navegação
const navigationButtons = {
  "go-ranks": "../../ranking/html/ranks.html",
  "go-timeline": "../../timeline/html/timeline.html",
  "go-settings": "../../configuracao/html/index.html",
  "go-home": "/pages/home/html/index.html",
  "go-support": "../../support/html/suporte.html",
};

Object.keys(navigationButtons).forEach((buttonId) => {
  const button = document.getElementById(buttonId);
  if (button) {
    button.onclick = () => {
      window.location.href = navigationButtons[buttonId];
    };
  }
});

// Botão settings alternativo
const settingsButton = document.getElementById("go-settings-button");
if (settingsButton) {
  settingsButton.onclick = () => {
    window.location.href = "../../configuracao/html/index.html";
  };
}

function setupNavigationInteractions() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      handleNavigation(this);
    });
  });
}

function handleNavigation(navItem) {
  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.classList.remove("active");
  });

  navItem.classList.add("active");
  const tabName = navItem.dataset.tab;
  console.log("Navegando para tab:", tabName);
  handleTabNavigation(tabName);
}

function handleTabNavigation(tabName) {
  switch (tabName) {
    case "home":
      console.log("Navegando para home");
      break;
    case "timeline":
      console.log("Navegando para timeline");
      break;
    case "ranks":
      console.log("Navegando para ranks");
      break;
    case "profile":
      console.log("Já está na página de profile");
      break;
    default:
      console.log("Tab não reconhecida:", tabName);
  }
}

function setupHeaderButtons() {
  const backButton = document.querySelector(".back-button");
  const settingsButton = document.querySelector(".settings-button");

  if (backButton) {
    backButton.addEventListener("click", function () {
      handleBackButton(this);
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", function () {
      handleSettingsButton(this);
    });
  }
}

function handleBackButton(button) {
  button.style.transform = "scale(0.9)";
  setTimeout(() => {
    button.style.transform = "";
  }, 150);
  console.log("Voltando para página anterior");
}

function handleSettingsButton(button) {
  button.style.transform = "rotate(90deg) scale(0.9)";
  setTimeout(() => {
    button.style.transform = "";
  }, 300);
  console.log("Abrindo configurações");
}

function animateDashboard() {
  const dashboardCards = document.querySelectorAll(
    ".highlight-card, .chart-card, .goal-item"
  );

  dashboardCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease";

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100 + 300);
  });

  // Animar barras de progresso
  setTimeout(() => {
    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach((bar) => {
      const width = bar.style.width;
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, 800);
}

function updateStats(userData) {
  const userCoins = document.getElementById("user-coins");
  const userDonations = document.getElementById("user-donations");

  console.log(
    "📊 Atualizando stats - Moedas:",
    userData.coins,
    "Doações:",
    userData.donations
  );

  if (userCoins) {
    animateNumber(userCoins, 0, userData.coins, true);
  }

  if (userDonations) {
    animateNumber(userDonations, 0, userData.donations, false);
  }
}

function animateNumber(element, from, to, isCoins = false) {
  const duration = 1000;
  const start = Date.now();
  const difference = to - from;

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(from + difference * progress);

    if (isCoins) {
      element.textContent = current.toLocaleString("pt-BR");
    } else {
      element.textContent = current;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ========== FUNÇÕES DE DEBUG E TESTE ==========
async function testProfileUpdate() {
  console.log("🧪 Testando atualização de perfil...");

  try {
    // Recarregar dados da API
    await loadAndDisplayUserData();
    console.log("✅ Teste de atualização concluído");
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

async function simulateDonation(amount) {
  console.log(`💰 Simulando doação de ${amount} moedas...`);

  try {
    // Simular doação localmente (na falta da API de doação)
    const userData = await UserProfileService.getUserData();
    const newCoins = Math.max(0, userData.coins - amount);
    const newMonthlyDonated = userData.monthlyDonated + amount;
    const newTotalDonations = userData.donations + 1;

    const updatedData = {
      coins: newCoins,
      monthlyDonated: newMonthlyDonated,
      donations: newTotalDonations,
      lastDonationAmount: amount,
      lastDonationDate: "agora mesmo",
    };

    if (UserProfileService.saveUserData(updatedData)) {
      console.log(`✅ Doação simulada: ${amount} moedas`);

      // Atualizar as metas também
      GoalManager.updateGoalDisplay();

      // Recarregar dados na tela
      await loadAndDisplayUserData();
      return true;
    }
  } catch (error) {
    console.error("❌ Erro na simulação:", error);
  }

  return false;
}

async function debugProfile() {
  console.log("🔧 DEBUG - Estado atual do perfil:");
  console.log("SessionStorage keys:", Object.keys(sessionStorage));
  console.log("currentUser:", sessionStorage.getItem("currentUser"));
  console.log("dashboardData:", sessionStorage.getItem("dashboardData"));

  try {
    const userData = await UserProfileService.getUserData();
    console.log("Dados processados:", userData);

    const goalData = GoalManager.getGoalData();
    console.log("Dados da meta:", goalData);
  } catch (error) {
    console.error("Erro no debug:", error);
  }
}

// ========== FUNÇÃO PARA FORÇAR REFRESH DOS DADOS ==========
async function refreshDashboard() {
  console.log("🔄 Forçando refresh do dashboard...");

  try {
    // Limpar cache
    sessionStorage.removeItem("dashboardData");

    // Recarregar dados
    await loadAndDisplayUserData();

    console.log("✅ Dashboard atualizado com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao atualizar dashboard:", error);
    return false;
  }
}

// ========== EXPOSIÇÃO GLOBAL PARA DEBUG ==========
if (typeof window !== "undefined") {
  window.UserProfileService = UserProfileService;
  window.GoalManager = GoalManager;
  window.DashboardManager = DashboardManager;
  window.testProfileUpdate = testProfileUpdate;
  window.simulateDonation = simulateDonation;
  window.debugProfile = debugProfile;
  window.loadAndDisplayUserData = loadAndDisplayUserData;
  window.refreshDashboard = refreshDashboard;
  window.apiRequest = apiRequest;
}

// Exportar funções para uso em outros scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    updateStats,
    handleTabNavigation,
    loadAndDisplayUserData,
    GoalManager,
    DashboardManager,
    refreshDashboard,
  };
}

console.log(`
🎮 Sistema de Perfil Atualizado com API!
📡 API Base: ${API_BASE_URL}
🔌 Conectado ao backend MongoDB
📱 Dados salvos em: sessionStorage.currentUser
🛠️ Debug: debugProfile(), testProfileUpdate()
🔄 Reload: loadAndDisplayUserData(), refreshDashboard()
💰 Simular doação: simulateDonation(50)
🎯 Gerenciar metas: GoalManager
📊 Dashboard: DashboardManager
🌐 API Request: apiRequest(endpoint, options)
`);
