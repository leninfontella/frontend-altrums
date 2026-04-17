// Sistema de Badges Integrado com Auth e API Unificados - Altrum

// Aguardar carregamento dos módulos de dependência
function waitForDependencies() {
  return new Promise((resolve) => {
    const checkDependencies = () => {
      if (window.Auth && window.api) {
        // console.log("✅ Dependências carregadas: Auth e API");
        resolve();
      } else {
        // console.log("🔄 Aguardando dependências...", {
        //   Auth: !!window.Auth,
        //   API: !!window.api,
        // });
        setTimeout(checkDependencies, 100);
      }
    };
    checkDependencies();
  });
}

// Definição dos níveis de badge - baseado nos dados do backend
const levels = {
  1: { min: 0, max: 199, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
  2: { min: 200, max: 499, name: "Explorador", color: "#06B6D4", icon: "🔍" },
  3: { min: 500, max: 999, name: "Aventureiro", color: "#10B981", icon: "🎒" },
  4: { min: 1000, max: 4999, name: "Benfeitor", color: "#F59E0B", icon: "🤝" },
  5: { min: 5000, max: 9999, name: "Generoso", color: "#EF4444", icon: "❤️" },
  6: {
    min: 10000,
    max: 49999,
    name: "Filantropo",
    color: "#EC4899",
    icon: "🏆",
  },
  7: { min: 50000, max: 99999, name: "Magnata", color: "#8B5CF6", icon: "💎" },
  8: { min: 100000, max: 499999, name: "Lenda", color: "#06B6D4", icon: "⭐" },
  9: { min: 500000, max: 999999, name: "Mito", color: "#F97316", icon: "🔥" },
  10: {
    min: 1000000,
    max: Infinity,
    name: "Divino",
    color: "#FFD700",
    icon: "👑",
  },
};

// Variáveis para armazenar dados do usuário
let currentUserData = null;
let currentPoints = 0;

// Função para buscar dados do usuário atual usando a rota unificada de badges
async function fetchUserData() {
  try {
    // console.log("🔄 Carregando dados do usuário via /api/badges...");

    const response = await api.get("/api/badges");
    const result = await response.json();

    if (!result.success) {
      throw new Error("Falha ao carregar dados do usuário");
    }

    // Estrutura correta da resposta
    const data = result.data || {};

    // Alteração 1: Acessar a propriedade correta para os dados do usuário
    const userDataFromApi = data.user || {};

    currentUserData = {
      ...userDataFromApi,
      coins: userDataFromApi.coins || 0,
      totalDonated: userDataFromApi.totalDonated || 0,
      totalReceived: userDataFromApi.totalReceived || 0,
      // Alteração 2: Acessar a propriedade de nível correta do backend
      level: userDataFromApi.level,
      profilePhotoUrl: userDataFromApi.profilePhotoUrl,
    };

    // Alteração 3: Acessar as propriedades de badges do backend
    const badgesData = data.badges || {};
    const currentLevelData = badgesData.currentLevel || {};

    // Alteração 4: Corrigir a lógica para pegar pontos e progresso
    currentPoints = badgesData.currentPoints || 0;

    // console.log("✅ Dados do usuário carregados:", {
    //   name: currentUserData.name,
    //   points: currentPoints,
    //   coins: currentUserData.coins,
    // });

    return currentUserData;
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);

    currentPoints = 0;
    currentUserData = {
      name: "Usuário",
      coins: 0,
      totalDonated: 0,
      totalReceived: 0,
      level: 1,
    };

    showErrorMessage("Erro ao carregar dados. Verifique sua conexão.");
    return currentUserData;
  }
}

// Função para mostrar mensagem de erro
function showErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid #fca5a5;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: slideInRight 0.3s ease-out;
  `;

  errorDiv.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">Aviso</div>
    <div style="font-size: 14px;">${message}</div>
  `;

  document.body.appendChild(errorDiv);

  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => errorDiv.remove(), 300);
    }
  }, 5000);
}

// Função para buscar dados específicos de badges via API unificada (se disponível)

async function fetchBadgeProgressFromAPI() {
  try {
    // Tentar usar endpoint específico de badges se disponível
    if (window.api && window.api.getBadgeProgress) {
      const response = await window.api.getBadgeProgress();
      if (response.success) {
        return response.data;
      }
    }
    return null;
  } catch (error) {
    console.warn(
      "Endpoint de badges não disponível, usando dados do Auth:",
      error.message,
    );
    return null;
  }
}

// Função para determinar o nível atual baseado nos pontos
function getCurrentLevel(points) {
  for (let level in levels) {
    const levelData = levels[level];
    if (points >= levelData.min && points <= levelData.max) {
      return { level: parseInt(level), ...levelData };
    }
  }
  return { level: 1, ...levels[1] }; // Fallback para nível 1
}

// Função para obter o próximo nível
function getNextLevel(currentLevel) {
  const nextLevelNum = currentLevel + 1;
  return levels[nextLevelNum]
    ? { level: nextLevelNum, ...levels[nextLevelNum] }
    : null;
}

// Função para calcular o progresso até o próximo nível
function calculateProgress(points, currentLevel, nextLevel) {
  if (!nextLevel) return 100; // Se é o último nível

  const currentLevelMin = levels[currentLevel].min;
  const nextLevelMin = nextLevel.min;
  const progress =
    ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;

  return Math.max(0, Math.min(100, progress));
}

// Função para formatar números
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Função para renderizar o card do nível atual com dados reais
function renderCurrentLevelCard() {
  const currentLevel = getCurrentLevel(currentPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progress = calculateProgress(
    currentPoints,
    currentLevel.level,
    nextLevel,
  );

  // Atualizar elementos do card atual
  const currentIcon = document.getElementById("currentIcon");
  const currentName = document.getElementById("currentName");
  const currentPointsEl = document.getElementById("currentPoints");
  const currentBadge = document.getElementById("currentBadge");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const nextLevelInfo = document.getElementById("nextLevelInfo");

  if (currentIcon) currentIcon.textContent = currentLevel.icon;
  if (currentName) currentName.textContent = currentLevel.name;
  if (currentPointsEl)
    currentPointsEl.textContent = `${formatNumber(currentPoints)} pontos`;

  // Atualizar informações do usuário se disponível
  if (currentUserData) {
    const userInfoEl = document.getElementById("userInfo");
    if (userInfoEl) {
      userInfoEl.innerHTML = `
        <div style="font-size: 14px; color: #888; margin-top: 8px;">
          ${currentUserData.name || "Usuário"} • ${formatNumber(
            currentUserData.coins || 0,
          )} moedas
        </div>
      `;
    }
  }

  // Atualizar cor do badge atual
  if (currentBadge) {
    currentBadge.style.background = `linear-gradient(135deg, ${currentLevel.color}80, ${currentLevel.color}40)`;
    currentBadge.style.border = `2px solid ${currentLevel.color}60`;
  }

  // Atualizar barra de progresso
  if (progressFill) {
    progressFill.style.width = `${Math.max(5, progress)}%`;
    progressFill.style.background = `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}CC)`;
  }

  if (nextLevel) {
    if (progressText) {
      progressText.textContent = `${formatNumber(
        currentPoints,
      )} / ${formatNumber(nextLevel.min)}`;
    }
    if (nextLevelInfo) {
      const pointsNeeded = nextLevel.min - currentPoints;
      nextLevelInfo.innerHTML = `Próximo: <span id="nextLevelName">${
        nextLevel.name
      }</span> - <span id="pointsNeeded">${formatNumber(
        pointsNeeded,
      )} pontos restantes</span>`;
    }
  } else {
    if (progressText) {
      progressText.textContent = "Nível máximo atingido!";
    }
    if (nextLevelInfo) {
      nextLevelInfo.innerHTML =
        '<span style="color: #FFD700;">🎉 Parabéns! Você atingiu o nível máximo!</span>';
    }
  }
}

// Função para renderizar o grid de badges
function renderBadgesGrid() {
  const badgesGrid = document.getElementById("badgesGrid");
  if (!badgesGrid) {
    console.warn("Elemento badgesGrid não encontrado");
    return;
  }

  const currentLevel = getCurrentLevel(currentPoints);
  badgesGrid.innerHTML = "";

  for (let levelNum in levels) {
    const level = levels[levelNum];
    const levelNumber = parseInt(levelNum);

    const badgeCard = document.createElement("div");
    badgeCard.className = "badge-card";

    // Determinar status do badge
    let status = "locked";
    let statusText = "Bloqueado";

    if (currentPoints >= level.min) {
      status = "unlocked";
      statusText = "Desbloqueado";
    }

    if (levelNumber === currentLevel.level) {
      status = "current";
      statusText = "Atual";
    }

    badgeCard.classList.add(status);

    // Formatação do range de pontos
    let rangeText;
    if (level.max === Infinity) {
      rangeText = `${formatNumber(level.min)}+ pontos`;
    } else {
      rangeText = `${formatNumber(level.min)} - ${formatNumber(
        level.max,
      )} pontos`;
    }

    badgeCard.innerHTML = `
      <div class="badge-level" style="background: linear-gradient(135deg, ${level.color}80, ${level.color}40); border: 2px solid ${level.color}60;">
        ${level.icon}
      </div>
      <div class="badge-name">${level.name}</div>
      <div class="badge-range">${rangeText}</div>
      <div class="badge-status ${status}">${statusText}</div>
    `;

    // Adicionar efeito de hover personalizado
    badgeCard.addEventListener("mouseenter", function () {
      if (status !== "locked") {
        this.style.borderColor = level.color + "60";
        this.style.boxShadow = `0 12px 32px ${level.color}20`;
      }
    });

    badgeCard.addEventListener("mouseleave", function () {
      if (status === "unlocked") {
        this.style.borderColor = "rgba(255, 255, 255, 0.08)";
        this.style.boxShadow = "none";
      } else if (status === "current") {
        this.style.borderColor = "rgba(0, 212, 255, 0.6)";
        this.style.boxShadow = "0 8px 32px rgba(0, 212, 255, 0.2)";
      }
    });

    badgesGrid.appendChild(badgeCard);
  }
}

// Função para mostrar notificação de subida de nível
function showLevelUpNotification(newLevel) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, ${newLevel.color}20, ${newLevel.color}10);
    backdrop-filter: blur(20px);
    border: 2px solid ${newLevel.color}60;
    border-radius: 20px;
    padding: 24px;
    text-align: center;
    z-index: 10000;
    animation: levelUpAnimation 3s ease-out forwards;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    color: white;
    font-family: "SF Pro Display", -apple-system, sans-serif;
  `;

  notification.innerHTML = `
    <div style="font-size: 40px; margin-bottom: 12px; animation: bounce 1s ease-in-out infinite;">${newLevel.icon}</div>
    <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Parabéns!</div>
    <div style="font-size: 16px; color: ${newLevel.color};">Você atingiu o nível</div>
    <div style="font-size: 20px; font-weight: 800; color: ${newLevel.color};">${newLevel.name}</div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Função para atualizar toda a exibição
async function updateDisplay() {
  try {
    // console.log("🔄 Atualizando display de badges...");

    // Mostrar loading
    showLoadingState();

    // Buscar dados atualizados via Auth integrado
    await fetchUserData();

    // Tentar buscar dados específicos de badges da API
    const badgeProgress = await fetchBadgeProgressFromAPI();
    if (badgeProgress) {
      currentPoints = badgeProgress.points || currentPoints;
      // console.log("📊 Dados de badge da API:", badgeProgress);
    }

    // Renderizar interface
    renderCurrentLevelCard();
    renderBadgesGrid();

    // Esconder loading
    hideLoadingState();

    // console.log("✅ Display atualizado com sucesso");
  } catch (error) {
    console.error("❌ Erro ao atualizar display:", error);
    hideLoadingState();

    // Tentar renderizar com dados locais
    if (currentUserData) {
      renderCurrentLevelCard();
      renderBadgesGrid();
    }
  }
}

// Funções de loading state
function showLoadingState() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.id = "loadingOverlay";
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease-out;
  `;

  loadingOverlay.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px 32px;
      text-align: center;
      color: white;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid #333;
        border-top: 3px solid #00d4ff;
        border-radius: 50%;
        margin: 0 auto 16px;
        animation: spin 1s linear infinite;
      "></div>
      <div style="font-weight: 600;">Atualizando badges...</div>
    </div>
  `;

  document.body.appendChild(loadingOverlay);
}

function hideLoadingState() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.animation = "fadeOut 0.3s ease-out";
    setTimeout(() => loadingOverlay.remove(), 300);
  }
}

// Função para atualizar dados em tempo real (chamada quando houver mudanças)
async function refreshUserData() {
  const oldLevel = getCurrentLevel(currentPoints);

  await fetchUserData();

  // Tentar buscar dados específicos de badges
  const badgeProgress = await fetchBadgeProgressFromAPI();
  if (badgeProgress) {
    currentPoints = badgeProgress.points || currentPoints;
  }

  const newLevel = getCurrentLevel(currentPoints);

  // Verificar se subiu de nível
  if (newLevel.level > oldLevel.level) {
    showLevelUpNotification(newLevel);
  }

  // Atualizar display
  renderCurrentLevelCard();
  renderBadgesGrid();
}

// Função de voltar
function goBack() {
  // console.log("Voltando para a página anterior...");
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Usar Auth para redirecionamento consistente
    Auth.redirectToDashboard();
  }
}

// Configurar botão de voltar
function setupBackButton() {
  const goHome = document.getElementById("go-home");
  if (goHome) {
    goHome.onclick = () => {
      Auth.redirectToDashboard();
    };
  }
}

// Função para mostrar detalhes do badge
function showBadgeDetails(levelNumber) {
  const level = levels[levelNumber];
  const currentLevel = getCurrentLevel(currentPoints);

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: fadeIn 0.3s ease-out;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
    border: 2px solid ${level.color}60;
    border-radius: 20px;
    padding: 32px;
    text-align: center;
    max-width: 300px;
    margin: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideInUp 0.3s ease-out;
  `;

  let statusText = "";
  if (levelNumber <= currentLevel.level) {
    statusText =
      levelNumber === currentLevel.level ? "Nível Atual" : "Desbloqueado";
  } else {
    const pointsNeeded = level.min - currentPoints;
    statusText = `Faltam ${formatNumber(pointsNeeded)} pontos`;
  }

  modalContent.innerHTML = `
    <div style="font-size: 60px; margin-bottom: 16px;">${level.icon}</div>
    <h2 style="color: ${level.color}; font-size: 24px; margin-bottom: 8px;">${
      level.name
    }</h2>
    <p style="color: #888; font-size: 14px; margin-bottom: 16px;">
      ${
        level.max === Infinity
          ? `${formatNumber(level.min)}+`
          : `${formatNumber(level.min)} - ${formatNumber(level.max)}`
      } pontos
    </p>
    <div style="background: ${level.color}20; border: 1px solid ${
      level.color
    }40; border-radius: 12px; padding: 12px; margin-bottom: 20px;">
      <div style="color: ${
        level.color
      }; font-weight: 600; font-size: 14px;">${statusText}</div>
    </div>
    <button onclick="this.closest('.modal').remove()" style="
      background: linear-gradient(135deg, ${level.color}, ${level.color}CC);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    ">Fechar</button>
  `;

  modal.className = "modal";
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Função para adicionar interatividade aos cards de badge
function addBadgeInteractivity() {
  document.addEventListener("click", (e) => {
    const badgeCard = e.target.closest(".badge-card");
    if (badgeCard && !badgeCard.classList.contains("locked")) {
      const badgeLevel =
        Array.from(badgeCard.parentNode.children).indexOf(badgeCard) + 1;
      showBadgeDetails(badgeLevel);
    }
  });
}

// Adicionar estilos para animações
function addAnimationStyles() {
  if (document.getElementById("badgeAnimationStyles")) {
    return; // Já foi adicionado
  }

  const styles = document.createElement("style");
  styles.id = "badgeAnimationStyles";
  styles.textContent = `
    @keyframes levelUpAnimation {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
      }
      20% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
      }
      90% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.9);
      }
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styles);
}

// Função principal de inicialização
async function initializeBadgesSystem() {
  try {
    // console.log("🚀 Inicializando sistema de badges integrado...");

    // Aguardar dependências
    await waitForDependencies();

    // Verificar autenticação
    if (!Auth.isLoggedIn()) {
      console.warn("Usuário não está logado, redirecionando...");
      Auth.redirectToLogin();
      return;
    }

    // Adicionar estilos de animação
    addAnimationStyles();

    // Configurar botão de voltar
    setupBackButton();

    // Carregar dados iniciais e renderizar
    await updateDisplay();

    // Adicionar interatividade
    addBadgeInteractivity();

    // Animação de entrada suave
    document.body.style.opacity = "0";
    setTimeout(() => {
      document.body.style.transition = "opacity 0.5s ease-out";
      document.body.style.opacity = "1";
    }, 100);

    // console.log("✅ Sistema de badges inicializado com sucesso");

    // Configurar listeners para atualizações em tempo real
    window.addEventListener("userChanged", refreshUserData);
    window.addEventListener("profileUpdated", refreshUserData);
    window.addEventListener("balanceUpdated", refreshUserData);
  } catch (error) {
    console.error("❌ Erro na inicialização:", error);
    showErrorMessage("Erro ao inicializar sistema de badges");
  }
}

// Função para atualizar pontos em tempo real usando API integrada
async function updatePointsFromServer() {
  try {
    const progressData = await fetchBadgeProgressFromAPI();

    if (progressData) {
      const oldLevel = getCurrentLevel(currentPoints);
      currentPoints =
        progressData.points || progressData.totalDonated || currentPoints;
      const newLevel = getCurrentLevel(currentPoints);

      // Verificar se subiu de nível
      if (newLevel.level > oldLevel.level) {
        showLevelUpNotification(newLevel);
      }

      // Atualizar display
      renderCurrentLevelCard();
      renderBadgesGrid();

      // console.log("Dados de badges atualizados via API");
      return true;
    }

    // Fallback: usar dados do Auth
    await refreshUserData();
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados do servidor:", error);
    return false;
  }
}

// Polling para atualizar dados periodicamente (opcional)
let updateInterval;

function startPeriodicUpdate(intervalMs = 30000) {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(async () => {
    try {
      const success = await updatePointsFromServer();
      // if (success) {
      //   console.log("🔄 Dados atualizados automaticamente");
      // }
    } catch (error) {
      console.warn("⚠️ Falha na atualização automática:", error);
    }
  }, intervalMs);
}

function stopPeriodicUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

// Exportar funções para uso externo
window.BadgesSystem = {
  updatePointsFromServer,
  refreshUserData,
  getCurrentLevel: () => getCurrentLevel(currentPoints),
  getCurrentPoints: () => currentPoints,
  getCurrentUserData: () => currentUserData,
  startPeriodicUpdate,
  stopPeriodicUpdate,
  initializeBadgesSystem,
};

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initializeBadgesSystem);

// Cleanup ao sair da página
window.addEventListener("beforeunload", () => {
  stopPeriodicUpdate();
});

// Listener para mudanças de autenticação
window.addEventListener("storage", (event) => {
  if (event.key === "authToken" || event.key === "userData") {
    // console.log("🔄 Mudança de autenticação detectada, atualizando badges...");
    setTimeout(refreshUserData, 1000); // Aguardar estabilização
  }
});

// Verificar se Auth já existe, senão aguardar
if (typeof window.Auth !== "undefined" && typeof window.api !== "undefined") {
  // console.log("✅ Dependências já carregadas");
} else {
  // console.log("⏳ Aguardando carregamento das dependências...");
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

  // console.log("✅ Header & Footer inicializados com notificações");
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
