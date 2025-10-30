// Função para voltar à tela anterior
function goBack() {
  alert("Voltando para a tela anterior...");
  // Aqui você pode implementar a navegação de volta
  // Por exemplo: history.back() ou window.location.href = 'home.html'
}

// Botão doar

const ctaButton = document.getElementById("cta-button");
ctaButton.onclick = () => {
  window.location.href = "/pages/home/html/index.html";
};

// Função para iniciar doações
function startDonating() {
  // Efeito de ripple no botão
  const button = event.target;
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
    `;

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
    alert("Redirecionando para a seção de doações...");
    // Implementar navegação para a tela de doações
    // Por exemplo: window.location.href = 'donations.html'
  }, 300);
}

// Botão go home:

const goHome = document.getElementById("go-home");
goHome.onclick = () => {
  window.location.href = "/pages/home/html/index.html";
};

// Efeitos de hover personalizados nos cards
function initializePrizeCardEffects() {
  document.querySelectorAll(".prize-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-6px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0px)";
    });

    // Efeito de toque para dispositivos móveis
    card.addEventListener("touchstart", () => {
      card.style.transform = "translateY(-4px)";
    });

    card.addEventListener("touchend", () => {
      setTimeout(() => {
        card.style.transform = "translateY(0px)";
      }, 150);
    });
  });
}

// Função para criar partículas flutuantes adicionais
function createFloatingCoin() {
  const contentContainer = document.querySelector(".content-container");
  const coin = document.createElement("div");

  coin.style.cssText = `
        position: absolute;
        width: 16px;
        height: 16px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: 100%;
        pointer-events: none;
        z-index: 1000;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        font-weight: bold;
    `;

  coin.innerHTML = "🪙";
  contentContainer.appendChild(coin);

  const animation = coin.animate(
    [
      { transform: "translateY(0px) rotate(0deg)", opacity: 0 },
      { transform: "translateY(-50px) rotate(180deg)", opacity: 1 },
      { transform: "translateY(-400px) rotate(360deg)", opacity: 0 },
    ],
    {
      duration: 3000 + Math.random() * 2000,
      easing: "ease-out",
    }
  );

  animation.addEventListener("finish", () => {
    coin.remove();
  });
}

// Função para animar o número de moedas (contador)
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(start).toLocaleString("pt-BR");
  }, 16);
}

// Função para destacar prêmio com efeito especial
function highlightPrize(prizeElement) {
  prizeElement.style.animation = "pulse 1s ease-in-out 3";

  // Adicionar brilho temporário
  const glow = document.createElement("div");
  glow.style.cssText = `
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 22px;
        background: linear-gradient(45deg, #FFD700, transparent, #FFD700);
        z-index: -1;
        opacity: 0.5;
        animation: rotate 2s linear infinite;
    `;

  prizeElement.style.position = "relative";
  prizeElement.appendChild(glow);

  setTimeout(() => {
    glow.remove();
    prizeElement.style.animation = "";
  }, 3000);
}

// Função para simular atualização do ranking
function updateUserRanking() {
  // Simular dados do usuário
  const userPosition = Math.floor(Math.random() * 10) + 1;
  const userCoins = Math.floor(Math.random() * 50000) + 1000;

  // console.log(
  //   `Posição atual: ${userPosition}º | Moedas doadas: ${userCoins.toLocaleString(
  //     "pt-BR"
  //   )}`
  // );

  // Aqui você pode implementar a lógica real de atualização
  // Por exemplo, fazer uma requisição para a API do app
}

// Função para mostrar notificação de novo prêmio
function showPrizeNotification(prizeName) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(120,119,198,0.4);
        opacity: 0;
        animation: slideDown 0.5s ease forwards;
    `;

  notification.textContent = `🎉 Novo prêmio adicionado: ${prizeName}!`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideUp 0.5s ease forwards";
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar efeitos dos cards
  initializePrizeCardEffects();

  // Criar moedas flutuantes periodicamente
  setInterval(createFloatingCoin, 3000);

  // Simular atualização do ranking a cada 30 segundos
  setInterval(updateUserRanking, 30000);

  // Adicionar animação de entrada aos cards
  document.querySelectorAll(".prize-card").forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0px)";
    }, index * 200);
  });

  // Exemplo de destaque do primeiro prêmio após 5 segundos
  setTimeout(() => {
    const firstPrize = document.querySelector(".first-place");
    if (firstPrize) {
      highlightPrize(firstPrize);
    }
  }, 5000);
});

// Adicionar animações CSS dinamicamente
const additionalStyles = document.createElement("style");
additionalStyles.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0px); }
    }
    
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0px); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;

document.head.appendChild(additionalStyles);

// Função para vibração em dispositivos móveis (se suportado)
function vibrateDevice(pattern = [100, 50, 100]) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// Função para salvar progresso local (simulado)
function saveUserProgress(coins, position) {
  const userData = {
    totalCoins: coins,
    currentPosition: position,
    lastUpdate: new Date().toISOString(),
  };

  // Em um app real, isso seria salvo no AsyncStorage ou backend
  // console.log("Progresso salvo:", userData);
}

// Função para mostrar detalhes do prêmio em modal
function showPrizeDetails(prizeType) {
  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

  let prizeInfo = {};
  switch (prizeType) {
    case "ps5":
      prizeInfo = {
        name: "PlayStation 5",
        icon: "🎮",
        details:
          "Console PlayStation 5 novo, na caixa, com 1 ano de garantia + 2 jogos à sua escolha!",
      };
      break;
    case "iphone":
      prizeInfo = {
        name: "iPhone",
        icon: "📱",
        details:
          "iPhone mais recente, desbloqueado, com todos os acessórios originais + capinha premium!",
      };
      break;
    case "money":
      prizeInfo = {
        name: "R$ 1.000,00",
        icon: "💰",
        details:
          "Mil reais em dinheiro via PIX, transferência instantânea após verificação!",
      };
      break;
  }

  modal.innerHTML = `
        <div style="
            background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
            border-radius: 20px;
            padding: 32px;
            max-width: 320px;
            width: 90%;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.08);
            backdrop-filter: blur(20px);
        ">
            <div style="font-size: 60px; margin-bottom: 16px;">${prizeInfo.icon}</div>
            <h3 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 12px;">${prizeInfo.name}</h3>
            <p style="color: #aaaaaa; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">${prizeInfo.details}</p>
            <button onclick="closeModal()" style="
                background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
                border: none;
                border-radius: 12px;
                color: white;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Entendi</button>
        </div>
    `;

  document.body.appendChild(modal);

  // Animar entrada
  setTimeout(() => {
    modal.style.opacity = "1";
  }, 10);

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  window.currentModal = modal;
}

// Função para fechar modal
function closeModal() {
  const modal = window.currentModal;
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.remove();
      window.currentModal = null;
    }, 300);
  }
}

// Função para simular conquista de prêmio
function celebratePrizeWin(prizePosition) {
  vibrateDevice([200, 100, 200]);

  // Criar confetes
  for (let i = 0; i < 20; i++) {
    createConfetti();
  }

  const messages = {
    1: "🎉 PARABÉNS! Você ganhou o PlayStation 5!",
    2: "🎉 INCRÍVEL! Você ganhou o iPhone!",
    3: "🎉 FANTÁSTICO! Você ganhou R$ 1.000,00!",
  };

  setTimeout(() => {
    alert(messages[prizePosition] || "🎉 Parabéns por sua conquista!");
  }, 1000);
}

// Função para criar confetes
function createConfetti() {
  const confetti = document.createElement("div");
  const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: ${color};
        left: ${Math.random() * 100}%;
        top: -20px;
        pointer-events: none;
        z-index: 10000;
        border-radius: 2px;
    `;

  document.body.appendChild(confetti);

  const animation = confetti.animate(
    [
      { transform: "translateY(0px) rotate(0deg)", opacity: 1 },
      {
        transform: `translateY(${window.innerHeight + 50}px) rotate(720deg)`,
        opacity: 0,
      },
    ],
    {
      duration: 2000 + Math.random() * 1000,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    }
  );

  animation.addEventListener("finish", () => {
    confetti.remove();
  });
}

// Função para adicionar listeners aos cards para mostrar detalhes
function addPrizeCardListeners() {
  document.querySelector(".first-place").addEventListener("click", () => {
    showPrizeDetails("ps5");
  });

  document.querySelector(".second-place").addEventListener("click", () => {
    showPrizeDetails("iphone");
  });

  document.querySelector(".third-place").addEventListener("click", () => {
    showPrizeDetails("money");
  });
}

// Função para atualização em tempo real do ranking (simulada)
function startRankingUpdates() {
  setInterval(() => {
    const randomUser = Math.floor(Math.random() * 100) + 1;
    const randomCoins = Math.floor(Math.random() * 1000) + 100;

    // Simular notificação de nova doação
    if (Math.random() > 0.7) {
      showDonationNotification(randomUser, randomCoins);
    }
  }, 10000);
}

// Função para mostrar notificação de doação
function showDonationNotification(user, coins) {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(40,40,40,0.95);
        border: 1px solid rgba(120,119,198,0.3);
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 12px;
        color: #ffffff;
        z-index: 10000;
        backdrop-filter: blur(20px);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 250px;
    `;

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <div style="color: #7877C6;">🪙</div>
            <div>
                <div style="font-weight: 600;">Usuário ${user}</div>
                <div style="color: #888888; font-size: 11px;">Doou ${coins.toLocaleString(
                  "pt-BR"
                )} moedas</div>
            </div>
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0%)";
  }, 100);

  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(100%)";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Easter egg: sequência especial de toques
let tapSequence = [];
const secretSequence = [1, 2, 3, 1, 2, 3];

function handleSecretTap(position) {
  tapSequence.push(position);

  if (tapSequence.length > secretSequence.length) {
    tapSequence = tapSequence.slice(-secretSequence.length);
  }

  if (JSON.stringify(tapSequence) === JSON.stringify(secretSequence)) {
    // Easter egg ativado!
    celebratePrizeWin(1);
    showPrizeNotification("🚀 Easter Egg Descoberto!");
    tapSequence = [];
  }
}

// Função de inicialização principal
function initializeApp() {
  initializePrizeCardEffects();
  addPrizeCardListeners();
  startRankingUpdates();

  // Adicionar listeners para easter egg
  document
    .querySelector(".first-place")
    .addEventListener("dblclick", () => handleSecretTap(1));
  document
    .querySelector(".second-place")
    .addEventListener("dblclick", () => handleSecretTap(2));
  document
    .querySelector(".third-place")
    .addEventListener("dblclick", () => handleSecretTap(3));
}

// Aguardar carregamento completo da página
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
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
