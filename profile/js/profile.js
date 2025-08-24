// Aguarda o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Inicializando página de perfil...");
  initializeProfile();
});

// ========== SERVIÇO DE USUÁRIO MELHORADO ==========
class UserProfileService {
  // Função para extrair primeiro nome
  static getFirstName(fullName) {
    if (!fullName) return "Usuário";
    return fullName.trim().split(" ")[0];
  }

  // Busca dados do usuário usando o módulo Auth
  static getUserData() {
    console.log("🔍 Buscando dados do usuário através do módulo Auth...");

    // Use o método getUserData do módulo Auth para garantir que os dados de sessionStorage sejam usados.
    const userData = Auth.getUserData();

    if (userData) {
      console.log("✅ Dados do usuário encontrados via Auth:", userData);
      return {
        fullName:
          userData.name || userData.fullName || "Usuário Não Encontrado",
        firstName: this.getFirstName(userData.name || userData.fullName),
        email: userData.email || "email@exemplo.com",
        phone: userData.phone || "",
        level: userData.level || "Explorador",
        xp: userData.xp || 650,
        maxXp: userData.maxXp || 1000,
        rank: userData.rank || 8,
        score: userData.score || 2050,
        coins: userData.coins || 0,
        donations: userData.totalDonated || 0,
        monthlyDonated: userData.monthlyDonated || 0,
        monthlyReceived: userData.monthlyReceived || 0,
        lastDonationAmount: userData.lastDonationAmount || 50,
        lastDonationDate: userData.lastDonationDate || "há 2 dias",
        donationGoal: userData.donationGoal || 100,
        topInteractingUser: userData.topInteractingUser || "Ana Silva",
        topUserInteractions: userData.topUserInteractions || 12,
      };
    } else {
      console.warn(
        "⚠️ Nenhum dado de usuário encontrado no sessionStorage. Usando dados de exemplo."
      );
      // Fallback para dados de exemplo se Auth.getUserData() retornar nulo
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
        donations: 15,
        monthlyDonated: 15,
        monthlyReceived: 8,
        lastDonationAmount: 50,
        lastDonationDate: "há 2 dias",
        donationGoal: 100,
        topInteractingUser: "Ana Silva",
        topUserInteractions: 12,
      };
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

  // Função de debug pode ser mantida ou adaptada
  static debugLocalStorage() {
    console.log("🔧 DEBUG - Todas as chaves no localStorage:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, value);
    }

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
    const userData = UserProfileService.getUserData();
    const currentDonated = userData.monthlyDonated || 0;
    const goalAmount = userData.donationGoal || 100;
    const progress = Math.min((currentDonated / goalAmount) * 100, 100);

    return {
      current: currentDonated,
      goal: goalAmount,
      progress: progress,
    };
  }

  static updateGoal(newGoalAmount) {
    const success = UserProfileService.saveUserData({
      donationGoal: newGoalAmount,
    });

    if (success) {
      this.updateGoalDisplay();
      return true;
    }
    return false;
  }

  static updateGoalDisplay() {
    const goalData = this.getGoalData();
    const progressText = document.getElementById("goal-progress-text");
    const progressBar = document.getElementById("goal-progress-bar");

    if (progressText) {
      progressText.textContent = `${goalData.current}/${goalData.goal}`;
    }

    if (progressBar) {
      progressBar.style.width = `${goalData.progress}%`;
    }
  }

  // Nova função para atualizar meta após doação
  static updateAfterDonation(donationAmount) {
    const userData = UserProfileService.getUserData();
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
    // Atualizar usuário com maior interação
    const topUserEl = document.getElementById("top-interacting-user");
    const topInteractionsEl = document.getElementById("top-user-interactions");

    if (topUserEl) {
      topUserEl.textContent = userData.topInteractingUser;
    }

    if (topInteractionsEl) {
      topInteractionsEl.textContent = `${userData.topUserInteractions} interações este mês`;
    }

    // Atualizar última doação
    const lastAmountEl = document.getElementById("last-donation-amount");
    const lastDateEl = document.getElementById("last-donation-date");

    if (lastAmountEl) {
      lastAmountEl.textContent = `${userData.lastDonationAmount} moedas`;
    }

    if (lastDateEl) {
      lastDateEl.textContent = userData.lastDonationDate;
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

    if (donatedCount) {
      donatedCount.textContent = `Doadas: ${donated}`;
    }

    if (receivedCount) {
      receivedCount.textContent = `Recebidas: ${received}`;
    }

    // Calcular alturas das barras baseado na proporção
    if (total > 0) {
      const donatedHeight = (donated / total) * 100;
      const receivedHeight = (received / total) * 100;

      if (donatedBar) {
        donatedBar.style.height = `${Math.max(donatedHeight, 10)}%`;
      }

      if (receivedBar) {
        receivedBar.style.height = `${Math.max(receivedHeight, 10)}%`;
      }
    }
  }
}

// ========== FUNÇÃO PRINCIPAL PARA CARREGAR DADOS DO USUÁRIO ==========
function loadAndDisplayUserData() {
  console.log("📄 Carregando e exibindo dados do usuário...");

  // Debug para ver o que tem no localStorage/sessionStorage
  UserProfileService.debugLocalStorage();

  const userData = UserProfileService.getUserData();

  if (!userData) {
    console.error("❌ Falha ao carregar dados do usuário");
    return;
  }

  console.log("📊 Dados do usuário carregados:", userData);

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
function initializeProfile() {
  console.log("⚙️ Configurando perfil...");

  // Carrega dados do usuário PRIMEIRO
  loadAndDisplayUserData();

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
    saveBtn.addEventListener("click", () => {
      const newGoal = parseInt(goalSelect.value);
      if (newGoal && GoalManager.updateGoal(newGoal)) {
        modal.classList.remove("show");

        // Mostrar feedback visual
        saveBtn.textContent = "Salvo!";
        saveBtn.style.background = "linear-gradient(135deg, #00ff88, #00cc66)";

        setTimeout(() => {
          saveBtn.textContent = "Salvar Meta";
          saveBtn.style.background =
            "linear-gradient(135deg, #00d4ff, #0099cc)";
        }, 2000);
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
  "go-home": "../../home/html/index.html",
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
function testProfileUpdate() {
  const mockUser = {
    name: "João Silva Santos",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    level: "Expert",
    xp: 850,
    maxXp: 1000,
    coins: 2500,
    donations: 25,
    monthlyDonated: 20,
    monthlyReceived: 12,
    lastDonationAmount: 75,
    lastDonationDate: "ontem",
    donationGoal: 200,
    topInteractingUser: "Maria Santos",
    topUserInteractions: 18,
  };

  sessionStorage.setItem("currentUser", JSON.stringify(mockUser));
  console.log("🧪 Dados de teste salvos:", mockUser);

  // Recarrega os dados
  loadAndDisplayUserData();
}

function simulateDonation(amount) {
  const userData = UserProfileService.getUserData();
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
    console.log(`💰 Doação simulada: ${amount} moedas`);

    // Atualizar as metas também
    GoalManager.updateGoalDisplay();

    // Recarregar dados na tela
    loadAndDisplayUserData();
    return true;
  }
  return false;
}

function debugProfile() {
  console.log("🔧 DEBUG - Estado atual do perfil:");
  console.log("SessionStorage keys:", Object.keys(sessionStorage));
  console.log("currentUser:", sessionStorage.getItem("currentUser"));

  const userData = UserProfileService.getUserData();
  console.log("Dados processados:", userData);

  const goalData = GoalManager.getGoalData();
  console.log("Dados da meta:", goalData);
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
}

// Exportar funções para uso em outros scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    updateStats,
    handleTabNavigation,
    loadAndDisplayUserData,
    GoalManager,
    DashboardManager,
  };
}

console.log(`
🎮 Sistema de Perfil Atualizado!
📱 Dados salvos em: sessionStorage.currentUser
🛠️ Debug: debugProfile(), testProfileUpdate()
📄 Reload: loadAndDisplayUserData()
💰 Simular doação: simulateDonation(50)
🎯 Gerenciar metas: GoalManager
📊 Dashboard: DashboardManager
`);
