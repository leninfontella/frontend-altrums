// Definição dos níveis de badge
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

// Pontos atuais do usuário (simulado - em um app real viria do backend)
let currentPoints = 750; // Exemplo: usuário no nível Aventureiro

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

// Função para renderizar o card do nível atual
function renderCurrentLevelCard() {
  const currentLevel = getCurrentLevel(currentPoints);
  const nextLevel = getNextLevel(currentLevel.level);
  const progress = calculateProgress(
    currentPoints,
    currentLevel.level,
    nextLevel
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

  // Atualizar cor do badge atual
  if (currentBadge) {
    currentBadge.style.background = `linear-gradient(135deg, ${currentLevel.color}80, ${currentLevel.color}40)`;
    currentBadge.style.border = `2px solid ${currentLevel.color}60`;
  }

  // Atualizar barra de progresso
  if (progressFill) {
    progressFill.style.width = `${Math.max(5, progress)}%`; // Mínimo de 5% para visibilidade
    progressFill.style.background = `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}CC)`;
  }

  if (nextLevel) {
    if (progressText) {
      progressText.textContent = `${formatNumber(
        currentPoints
      )} / ${formatNumber(nextLevel.min)}`;
    }
    if (nextLevelInfo) {
      const pointsNeeded = nextLevel.min - currentPoints;
      nextLevelInfo.innerHTML = `Próximo: <span id="nextLevelName">${
        nextLevel.name
      }</span> - <span id="pointsNeeded">${formatNumber(
        pointsNeeded
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
        level.max
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

// Função para simular ganho de pontos (para demonstração)
function addPoints(amount) {
  const oldLevel = getCurrentLevel(currentPoints);
  currentPoints += amount;
  const newLevel = getCurrentLevel(currentPoints);

  updateDisplay();

  // Verificar se subiu de nível
  if (newLevel.level > oldLevel.level) {
    showLevelUpNotification(newLevel);
  }

  // Adicionar feedback visual
  showPointsGain(amount);
}

// Função para mostrar notificação de subida de nível
function showLevelUpNotification(newLevel) {
  // Criar elemento de notificação
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

  // Remover após a animação
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Função para mostrar ganho de pontos
function showPointsGain(amount) {
  const pointsElement = document.createElement("div");
  pointsElement.textContent = `+${formatNumber(amount)}`;
  pointsElement.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    color: #00d4ff;
    font-size: 24px;
    font-weight: 800;
    z-index: 9999;
    pointer-events: none;
    animation: pointsGainAnimation 2s ease-out forwards;
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  `;

  document.body.appendChild(pointsElement);

  setTimeout(() => {
    if (pointsElement.parentNode) {
      pointsElement.parentNode.removeChild(pointsElement);
    }
  }, 2000);
}

// Função para atualizar toda a exibição
function updateDisplay() {
  renderCurrentLevelCard();
  renderBadgesGrid();
}

// Função de voltar (placeholder)
function goBack() {
  // Em um app real, isso navegaria para a página anterior
  console.log("Voltando para a página anterior...");
  // window.history.back() ou navegação do framework
}

const goHome = document.getElementById("go-home");
goHome.onclick = () => {
  window.location.href = "../../home/html/index.html";
};

// Função para simular diferentes quantidades de pontos (para demonstração)
function simulateProgress() {
  const scenarios = [
    { points: 150, desc: "Novo usuário" },
    { points: 350, desc: "Usuário ativo" },
    { points: 750, desc: "Contribuidor regular" },
    { points: 2500, desc: "Benfeitor ativo" },
    { points: 7500, desc: "Grande doador" },
    { points: 25000, desc: "Filantropo" },
    { points: 75000, desc: "Magnata" },
    { points: 250000, desc: "Lenda viva" },
    { points: 750000, desc: "Mito da comunidade" },
    { points: 1500000, desc: "Status divino" },
  ];

  let currentScenario = 0;

  // Criar botão de teste (remover em produção)
  const testButton = document.createElement("button");
  testButton.textContent = "Simular Progresso";
  testButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #00d4ff, #0099cc);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 16px rgba(0, 212, 255, 0.3);
    transition: all 0.3s ease;
  `;

  testButton.addEventListener("click", () => {
    const scenario = scenarios[currentScenario];
    currentPoints = scenario.points;
    updateDisplay();

    // Mostrar cenário atual
    console.log(
      `Cenário: ${scenario.desc} (${formatNumber(scenario.points)} pontos)`
    );

    currentScenario = (currentScenario + 1) % scenarios.length;
  });

  // Adicionar apenas em desenvolvimento
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    document.body.appendChild(testButton);
  }
}

// Adicionar estilos para animações
const styles = document.createElement("style");
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
  
  @keyframes pointsGainAnimation {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    20% {
      opacity: 1;
      transform: translateX(-50%) translateY(0px);
    }
    80% {
      opacity: 1;
      transform: translateX(-50%) translateY(-10px);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-30px);
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
`;
document.head.appendChild(styles);

// Função para adicionar interatividade aos cards de badge
function addBadgeInteractivity() {
  // Adicionar clique nos badges para mostrar detalhes
  document.addEventListener("click", (e) => {
    const badgeCard = e.target.closest(".badge-card");
    if (badgeCard && !badgeCard.classList.contains("locked")) {
      const badgeLevel =
        Array.from(badgeCard.parentNode.children).indexOf(badgeCard) + 1;
      showBadgeDetails(badgeLevel);
    }
  });
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

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  addBadgeInteractivity();
  simulateProgress(); // Remover em produção

  // Adicionar animação de entrada suave
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease-out";
    document.body.style.opacity = "1";
  }, 100);
});

// Função para atualizar pontos em tempo real (seria conectada ao backend)
function updatePointsFromServer(newPoints) {
  const oldLevel = getCurrentLevel(currentPoints);
  currentPoints = newPoints;
  const newLevel = getCurrentLevel(currentPoints);

  updateDisplay();

  if (newLevel.level > oldLevel.level) {
    showLevelUpNotification(newLevel);
  }
}

// Exportar funções para uso externo (se necessário)
window.BadgesSystem = {
  addPoints,
  updatePointsFromServer,
  getCurrentLevel: () => getCurrentLevel(currentPoints),
  getCurrentPoints: () => currentPoints,
};
