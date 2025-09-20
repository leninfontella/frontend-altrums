// Variáveis globais para dados do portfolio
let portfolioData = {
  neuralCoin: { amount: 2547, value: 3821.5, change: 12.5 },
  ethereum: { amount: 0.75, value: 1245.0, change: -2.1 },
  bitcoin: { amount: 0.05, value: 2150.0, change: 8.2 },
};

let analyticsData = {
  totalSent: 847,
  totalReceived: 1243,
  totalImpact: 2100,
  networkSize: 127,
};

// Botão go settings:

const goSettings = document.getElementById("go-settings");
goSettings.onclick = () => {
  window.location.href = "/pages/home/html/index.html";
};

// Botão go ranks:

const goRanks = document.getElementById("go-ranks");
goRanks.onclick = () => {
  window.location.href = "../../ranking/html/ranks.html";
};

// Botão go timeline:

const goTimeline = document.getElementById("go-timeline");
goTimeline.onclick = () => {
  window.location.href = "../../timeline/html/timeline.html";
};

// Botão go home:

const goHome = document.getElementById("go-home");
goHome.onclick = () => {
  window.location.href = "/pages/home/html/index.html";
};

// Botão go profile:

const goProfile = document.getElementById("go-profile");
goProfile.onclick = () => {
  window.location.href = "../../profile/pages/profile.html";
};

// Cotações simuladas (atualização em tempo real)
const coinPrices = {
  NRC: 1.5,
  ETH: 1660.0,
  BTC: 43000.0,
};

// Função para atualizar saldos
function updateBalances() {
  // Pequenas flutuações nas cotações
  Object.keys(coinPrices).forEach((coin) => {
    const change = (Math.random() - 0.5) * 0.02; // ±1%
    coinPrices[coin] *= 1 + change;
  });

  // Atualizar valores em USD
  portfolioData.neuralCoin.value =
    portfolioData.neuralCoin.amount * coinPrices.NRC;
  portfolioData.ethereum.value = portfolioData.ethereum.amount * coinPrices.ETH;
  portfolioData.bitcoin.value = portfolioData.bitcoin.amount * coinPrices.BTC;

  // Atualizar mudanças percentuais
  portfolioData.neuralCoin.change += (Math.random() - 0.5) * 0.5;
  portfolioData.ethereum.change += (Math.random() - 0.5) * 0.3;
  portfolioData.bitcoin.change += (Math.random() - 0.5) * 0.4;

  // Atualizar display
  updateDisplayValues();
}

// Função para atualizar valores na tela
function updateDisplayValues() {
  const totalValue =
    portfolioData.neuralCoin.value +
    portfolioData.ethereum.value +
    portfolioData.bitcoin.value;

  document.getElementById("mainBalance").textContent =
    portfolioData.neuralCoin.amount.toLocaleString();
  document.getElementById(
    "balanceUSD"
  ).textContent = `≈ $${totalValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Atualizar cards do portfólio
  updatePortfolioCards();

  // Atualizar indicador de tendência
  updateTrendIndicator();
}

// Função para atualizar cards do portfólio
function updatePortfolioCards() {
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  // Neural Coin (primeiro item)
  const neuralCard = portfolioItems[0];
  if (neuralCard) {
    neuralCard.querySelector(".coin-amount").textContent =
      portfolioData.neuralCoin.amount.toLocaleString();
    neuralCard.querySelector(
      ".coin-value"
    ).textContent = `$${portfolioData.neuralCoin.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const changeElement = neuralCard.querySelector(".coin-change");
    changeElement.textContent = `${
      portfolioData.neuralCoin.change > 0 ? "+" : ""
    }${portfolioData.neuralCoin.change.toFixed(1)}%`;
    changeElement.className = `coin-change ${
      portfolioData.neuralCoin.change >= 0 ? "positive" : "negative"
    }`;
  }

  // Ethereum (segundo item)
  const ethCard = portfolioItems[1];
  if (ethCard) {
    ethCard.querySelector(".coin-amount").textContent =
      portfolioData.ethereum.amount.toFixed(2);
    ethCard.querySelector(
      ".coin-value"
    ).textContent = `$${portfolioData.ethereum.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const changeElement = ethCard.querySelector(".coin-change");
    changeElement.textContent = `${
      portfolioData.ethereum.change > 0 ? "+" : ""
    }${portfolioData.ethereum.change.toFixed(1)}%`;
    changeElement.className = `coin-change ${
      portfolioData.ethereum.change >= 0 ? "positive" : "negative"
    }`;
  }

  // Bitcoin (terceiro item)
  const btcCard = portfolioItems[2];
  if (btcCard) {
    btcCard.querySelector(".coin-amount").textContent =
      portfolioData.bitcoin.amount.toFixed(3);
    btcCard.querySelector(
      ".coin-value"
    ).textContent = `$${portfolioData.bitcoin.value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    const changeElement = btcCard.querySelector(".coin-change");
    changeElement.textContent = `${
      portfolioData.bitcoin.change > 0 ? "+" : ""
    }${portfolioData.bitcoin.change.toFixed(1)}%`;
    changeElement.className = `coin-change ${
      portfolioData.bitcoin.change >= 0 ? "positive" : "negative"
    }`;
  }
}

// Função para atualizar indicador de tendência
function updateTrendIndicator() {
  const trendElement = document.querySelector(".trend-indicator");
  const avgChange =
    (portfolioData.neuralCoin.change +
      portfolioData.ethereum.change +
      portfolioData.bitcoin.change) /
    3;

  trendElement.className = `trend-indicator ${
    avgChange >= 0 ? "positive" : "negative"
  }`;
  trendElement.querySelector("span").textContent = `${
    avgChange > 0 ? "+" : ""
  }${avgChange.toFixed(1)}%`;
  trendElement.querySelector("i").className = `fas fa-arrow-${
    avgChange >= 0 ? "up" : "down"
  }`;
}

// Função para alternar configurações
function toggleSettings() {
  const settingsBtn = document.querySelector(".settings-btn");
  const isActive = settingsBtn.classList.contains("active");

  if (isActive) {
    settingsBtn.classList.remove("active");
    settingsBtn.style.background = "rgba(255,255,255,0.05)";
    settingsBtn.style.color = "#7877C6";
    showNotification("⚙️ Configurações fechadas");
  } else {
    settingsBtn.classList.add("active");
    settingsBtn.style.background = "rgba(120,119,198,0.2)";
    settingsBtn.style.color = "#ffffff";
    showNotification("⚙️ Modo configuração ativo");
  }
}

// Funções de navegação das ações rápidas
function navigateToSend() {
  showNotification("🚀 Redirecionando para Enviar...");
  simulatePageTransition();
}

function navigateToReceive() {
  showNotification("📱 Gerando QR Code...", "success");
  simulatePageTransition();
}

function navigateToBuy() {
  showNotification("💳 Abrindo loja de moedas...");
  simulatePageTransition();
}

function navigateToStake() {
  showNotification("🌱 Carregando opções de Stake...");
  simulatePageTransition();
}

// Função para simular transição de página
function simulatePageTransition() {
  const screen = document.querySelector(".screen");
  screen.style.transform = "scale(0.95)";
  screen.style.opacity = "0.8";

  setTimeout(() => {
    screen.style.transform = "scale(1)";
    screen.style.opacity = "1";
  }, 500);
}

// Função para alternar visualização do portfólio
function togglePortfolioView() {
  const viewBtn = document.querySelector(".view-all");
  const isChart = viewBtn.textContent === "Ver lista";

  if (isChart) {
    viewBtn.textContent = "Ver gráfico";
    showNotification("📊 Visualização em lista ativada");
  } else {
    viewBtn.textContent = "Ver lista";
    showNotification("📈 Visualização em gráfico ativada");
  }
}

// Função para mudar período das analytics
function changePeriod(period) {
  const periods = {
    "7d": "última semana",
    "30d": "último mês",
    "90d": "últimos 3 meses",
    "1y": "último ano",
  };

  showNotification(`📊 Analytics: ${periods[period]}`);

  // Simular mudança nos dados
  setTimeout(() => {
    analyticsData.totalSent += Math.floor(Math.random() * 100);
    analyticsData.totalReceived += Math.floor(Math.random() * 150);
    analyticsData.totalImpact += Math.floor(Math.random() * 200);
    analyticsData.networkSize += Math.floor(Math.random() * 10);

    updateAnalyticsDisplay();
  }, 500);
}

// Função para atualizar display das analytics
function updateAnalyticsDisplay() {
  document.getElementById("totalSent").textContent =
    analyticsData.totalSent.toLocaleString();
  document.getElementById("totalReceived").textContent =
    analyticsData.totalReceived.toLocaleString();
  document.getElementById("totalImpact").textContent =
    (analyticsData.totalImpact / 1000).toFixed(1) + "k";
  document.getElementById("networkSize").textContent =
    analyticsData.networkSize;
}

// Sistema de navegação
function initializeNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".nav-item")
        .forEach((nav) => nav.classList.remove("active"));
      this.classList.add("active");

      // Efeito de clique
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 150);
    });
  });
}

// Interações com cartões de conquistas
function initializeAchievements() {
  document.querySelectorAll(".achievement-card.unlocked").forEach((card) => {
    card.addEventListener("click", function () {
      const title = this.querySelector("h4").textContent;
      const reward = this.querySelector(".reward").textContent;
      showNotification(`🏆 ${title}: ${reward}`, "success");

      // Efeito de celebração
      this.style.transform = "scale(1.05)";
      setTimeout(() => {
        this.style.transform = "scale(1)";
      }, 200);
    });
  });

  document.querySelectorAll(".achievement-card.locked").forEach((card) => {
    card.addEventListener("click", function () {
      showNotification("🔒 Conquista ainda não desbloqueada");
    });
  });
}

// Interações com métricas
function initializeMetrics() {
  document.querySelectorAll(".metric-card").forEach((card) => {
    card.addEventListener("click", function () {
      const label = this.querySelector(".metric-label").textContent;
      const value = this.querySelector(".metric-value").textContent;
      showNotification(`📊 ${label}: ${value}`);
    });
  });
}

// Sistema de notificações
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: linear-gradient(135deg, ${
          type === "success" ? "#22c55e" : "#7877C6"
        } 0%, ${type === "success" ? "#16a34a" : "#5B5A9F"} 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 16px 40px rgba(120,119,198,0.4);
        transform: translateX(300px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 250px;
        border: 1px solid rgba(255,255,255,0.1);
    `;
  notification.innerHTML = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(300px)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Easter eggs e comandos especiais
function initializeEasterEggs() {
  let secretMode = false;

  document.addEventListener("keydown", function (e) {
    // Comando secreto: Ctrl + Shift + M (Money mode)
    if (e.ctrlKey && e.shiftKey && e.code === "KeyM") {
      e.preventDefault();
      if (!secretMode) {
        secretMode = true;
        portfolioData.neuralCoin.amount *= 10;
        updateDisplayValues();
        showNotification("💰 Modo Milionário Ativado!", "success");
        document.querySelector(".design-label").style.background =
          "linear-gradient(135deg, #ffd700, #ffb347)";
        document.querySelector(".design-label").textContent = "MONEY MODE";
      }
    }

    // Simulação de mineração: Ctrl + Space
    if (e.ctrlKey && e.code === "Space") {
      e.preventDefault();
      const mined = Math.floor(Math.random() * 10) + 1;
      portfolioData.neuralCoin.amount += mined;
      updateDisplayValues();
      showNotification(`⛏️ Mineração: +${mined} NRC`, "success");
    }

    // Reset: Ctrl + R (interceptar)
    if (e.ctrlKey && e.code === "KeyR") {
      e.preventDefault();
      resetToDefault();
      showNotification("🔄 Dados resetados");
    }
  });
}

// Função para resetar dados padrão
function resetToDefault() {
  portfolioData = {
    neuralCoin: { amount: 2547, value: 3821.5, change: 12.5 },
    ethereum: { amount: 0.75, value: 1245.0, change: -2.1 },
    bitcoin: { amount: 0.05, value: 2150.0, change: 8.2 },
  };
  updateDisplayValues();
}

// Animações de entrada dos elementos
function initializeAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) translateX(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  document
    .querySelectorAll(".portfolio-item, .achievement-card, .metric-card")
    .forEach((item) => {
      observer.observe(item);
    });
}

// Efeito de partículas flutuantes
function animateParticles() {
  const particles = document.querySelectorAll(".particle");

  particles.forEach((particle, index) => {
    const delay = index * 2000;
    const duration = 6000 + index * 1000;

    setInterval(() => {
      particle.style.opacity = "0.8";
      particle.style.transform = "scale(1.5)";

      setTimeout(() => {
        particle.style.opacity = "0.4";
        particle.style.transform = "scale(1)";
      }, 1000);
    }, duration);
  });
}

// Simulação de atualizações em tempo real
function startRealTimeUpdates() {
  // Atualizar saldos a cada 5 segundos
  setInterval(updateBalances, 5000);

  // Pequenas atualizações nas analytics a cada 15 segundos
  setInterval(() => {
    if (Math.random() > 0.6) {
      analyticsData.totalImpact += Math.floor(Math.random() * 20) + 5;
      analyticsData.networkSize += Math.floor(Math.random() * 3);
      updateAnalyticsDisplay();
    }
  }, 15000);

  // Animação das partículas
  animateParticles();
}

// Feedback tátil para interações
function addTactileFeedback() {
  document.addEventListener("click", function (e) {
    const clickableElements = [
      ".quick-btn",
      ".portfolio-item",
      ".achievement-card",
      ".metric-card",
      ".settings-btn",
      ".view-all",
    ];

    for (const selector of clickableElements) {
      if (e.target.closest(selector)) {
        const element = e.target.closest(selector);
        element.style.transform = "scale(0.96)";
        setTimeout(() => {
          element.style.transform = "";
        }, 150);
        break;
      }
    }
  });
}

// Efeitos de hover avançados
function initializeHoverEffects() {
  document.querySelectorAll(".portfolio-item").forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.querySelector(".coin-icon").style.transform =
        "rotate(360deg) scale(1.1)";
      this.querySelector(".coin-icon").style.transition = "transform 0.6s ease";
    });

    item.addEventListener("mouseleave", function () {
      this.querySelector(".coin-icon").style.transform =
        "rotate(0deg) scale(1)";
    });
  });
}

// Sistema de conquistas progressivas
function checkAchievements() {
  const totalValue =
    portfolioData.neuralCoin.value +
    portfolioData.ethereum.value +
    portfolioData.bitcoin.value;

  // Conquista: Portfolio valorizado
  if (totalValue > 10000) {
    unlockAchievement("Portfolio Master", "Portfolio acima de $10k");
  }

  // Conquista: Hodler
  if (portfolioData.neuralCoin.amount > 5000) {
    unlockAchievement("Neural Hodler", "Mais de 5k Neural Coins");
  }
}

function unlockAchievement(title, description) {
  const lockedCards = document.querySelectorAll(".achievement-card.locked");
  if (lockedCards.length > 0) {
    const card = lockedCards[0];
    card.classList.remove("locked");
    card.classList.add("unlocked");

    card.querySelector("h4").textContent = title;
    card.querySelector("p").textContent = description;

    showNotification(`🎉 Nova conquista: ${title}!`, "success");

    // Atualizar contador
    const count = document.querySelector(".achievement-count");
    const current = parseInt(count.textContent.split("/")[0]) + 1;
    count.textContent = `${current}/12`;
  }
}

// Inicialização principal
function initialize() {
  console.log("💰 My Coins Inicializado");

  // Inicializar todos os sistemas
  initializeNavigation();
  initializeAchievements();
  initializeMetrics();
  initializeAnimations();
  initializeHoverEffects();
  initializeEasterEggs();
  addTactileFeedback();

  // Começar atualizações em tempo real
  startRealTimeUpdates();

  // Verificar conquistas periodicamente
  setInterval(checkAchievements, 10000);

  // Mensagem de boas-vindas
  setTimeout(() => {
    showNotification("💎 Portfolio Neural carregado!", "success");
  }, 1000);
}

// Aguardar DOM estar pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}

// Expor funções globais
window.toggleSettings = toggleSettings;
window.navigateToSend = navigateToSend;
window.navigateToReceive = navigateToReceive;
window.navigateToBuy = navigateToBuy;
window.navigateToStake = navigateToStake;
window.togglePortfolioView = togglePortfolioView;
window.changePeriod = changePeriod;
