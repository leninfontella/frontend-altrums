// assets/js/global-level-up.js
// Sistema de Level Up que funciona em TODAS as páginas

class GlobalLevelUpSystem {
  constructor() {
    this.levels = {
      1: { min: 0, max: 199, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
      2: {
        min: 200,
        max: 499,
        name: "Explorador",
        color: "#06B6D4",
        icon: "🔍",
      },
      3: {
        min: 500,
        max: 999,
        name: "Aventureiro",
        color: "#10B981",
        icon: "🎒",
      },
      4: {
        min: 1000,
        max: 4999,
        name: "Benfeitor",
        color: "#F59E0B",
        icon: "🤝",
      },
      5: {
        min: 5000,
        max: 9999,
        name: "Generoso",
        color: "#EF4444",
        icon: "❤️",
      },
      6: {
        min: 10000,
        max: 49999,
        name: "Filantropo",
        color: "#EC4899",
        icon: "🏆",
      },
      7: {
        min: 50000,
        max: 99999,
        name: "Magnata",
        color: "#8B5CF6",
        icon: "💎",
      },
      8: {
        min: 100000,
        max: 499999,
        name: "Lenda",
        color: "#06B6D4",
        icon: "⭐",
      },
      9: {
        min: 500000,
        max: 999999,
        name: "Mito",
        color: "#F97316",
        icon: "🔥",
      },
      10: {
        min: 1000000,
        max: Infinity,
        name: "Divino",
        color: "#FFD700",
        icon: "👑",
      },
    };

    this.currentLevel = null;
    this.isInitialized = false;

    console.log("🎖️ Sistema Global de Level Up inicializado");
  }

  initialize() {
    if (this.isInitialized) return;

    // Adicionar HTML do modal ao body
    this.injectModalHTML();

    // Adicionar CSS do modal
    this.injectModalCSS();

    // Conectar ao WebSocket Global
    this.setupWebSocketListeners();

    // Verificar nível inicial
    this.checkInitialLevel();

    this.isInitialized = true;
    console.log("✅ Sistema Global de Level Up pronto");
  }

  injectModalHTML() {
    const modalHTML = `
      <div id="globalLevelUpModal" class="global-level-up-modal" style="display: none;">
        <div class="global-level-up-backdrop"></div>
        <div class="global-level-up-content">
          <!-- Confete animado -->
          <div class="global-level-up-confetti">
            ${Array(10)
              .fill(0)
              .map(() => '<div class="global-confetti-particle"></div>')
              .join("")}
          </div>

          <!-- Ícone do novo nível -->
          <div class="global-level-up-icon-container">
            <div class="global-level-up-icon" id="globalLevelUpIcon">🎉</div>
            <div class="global-level-up-glow"></div>
          </div>

          <!-- Título -->
          <h2 class="global-level-up-title">
            <span class="global-level-up-title-line">Parabéns!</span>
            <span class="global-level-up-title-line">Você subiu de nível!</span>
          </h2>

          <!-- Badge do novo nível -->
          <div class="global-level-up-badge">
            <div class="global-level-up-badge-icon" id="globalLevelUpBadgeIcon">🏆</div>
          </div>

          <!-- Nome do nível -->
          <div class="global-level-up-name" id="globalLevelUpName">Benfeitor</div>

          <!-- Descrição -->
          <div class="global-level-up-description">
            Você alcançou o nível <strong id="globalLevelUpNumber">4</strong>
          </div>

          <!-- Linha divisória -->
          <div class="global-level-up-divider"></div>

          <!-- Informações do progresso -->
          <div class="global-level-up-stats">
            <div class="global-level-up-stat">
              <div class="global-level-up-stat-label">Pontos Totais</div>
              <div class="global-level-up-stat-value" id="globalLevelUpTotalPoints">1,000</div>
            </div>
            <div class="global-level-up-stat-divider"></div>
            <div class="global-level-up-stat">
              <div class="global-level-up-stat-label">Próximo Nível</div>
              <div class="global-level-up-stat-value" id="globalLevelUpNextLevel">Generoso</div>
            </div>
          </div>

          <!-- Botão de fechar -->
          <button class="global-level-up-close" onclick="GlobalLevelUp.closeModal()">
            <span>Continuar</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  injectModalCSS() {
    const styleId = "global-level-up-styles";
    if (document.getElementById(styleId)) return;

    const link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = "/assets/css/global-level-up.css";
    document.head.appendChild(link);
  }

  setupWebSocketListeners() {
    if (!window.GlobalWS) {
      console.warn("⚠️ GlobalWS não encontrado, tentando novamente...");
      setTimeout(() => this.setupWebSocketListeners(), 1000);
      return;
    }

    // Escutar evento de level up do WebSocket
    GlobalWS.on("level_up", (data) => {
      console.log("🎖️ Level Up recebido via WebSocket:", data);
      this.showLevelUpModal(data);
    });

    // Escutar doações (podem causar level up)
    GlobalWS.on("donation_received", (data) => {
      if (data.levelUp) {
        console.log("🎖️ Level Up após doação:", data.levelUp);
        this.showLevelUpModal(data.levelUp);
      }
    });

    console.log("✅ Listeners do WebSocket configurados");
  }

  async checkInitialLevel() {
    try {
      if (!window.Auth || !Auth.checkSession()) return;

      const userData = Auth.getUserData();
      if (!userData) return;

      // Buscar dados atuais de badges
      const response = await fetch("/api/badges", {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      });

      if (!response.ok) return;

      const result = await response.json();
      const badgesData = result.data?.badges || {};
      const currentPoints = badgesData.currentPoints || 0;

      this.currentLevel = this.getCurrentLevel(currentPoints);
      console.log("📊 Nível atual:", this.currentLevel);
    } catch (error) {
      console.warn("⚠️ Não foi possível verificar nível inicial:", error);
    }
  }

  getCurrentLevel(points) {
    for (let level in this.levels) {
      const levelData = this.levels[level];
      if (points >= levelData.min && points <= levelData.max) {
        return { level: parseInt(level), ...levelData };
      }
    }
    return { level: 1, ...this.levels[1] };
  }

  getNextLevel(currentLevelNum) {
    const nextLevelNum = currentLevelNum + 1;
    return this.levels[nextLevelNum]
      ? { level: nextLevelNum, ...this.levels[nextLevelNum] }
      : null;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  }

  showLevelUpModal(levelData) {
    const modal = document.getElementById("globalLevelUpModal");
    if (!modal) {
      console.error("❌ Modal não encontrado");
      return;
    }

    // Extrair dados do nível
    const levelInfo =
      this.levels[levelData.level] || this.levels[levelData.newLevel];
    if (!levelInfo) {
      console.error("❌ Nível inválido:", levelData);
      return;
    }

    const points = levelData.totalPoints || levelData.points || 0;
    const nextLevel = this.getNextLevel(levelInfo.level || levelData.level);

    // Preencher modal
    document.getElementById("globalLevelUpIcon").textContent = levelInfo.icon;
    document.getElementById("globalLevelUpBadgeIcon").textContent =
      levelInfo.icon;
    document.getElementById("globalLevelUpName").textContent = levelInfo.name;
    document.getElementById("globalLevelUpNumber").textContent =
      levelInfo.level || levelData.level;
    document.getElementById("globalLevelUpTotalPoints").textContent =
      this.formatNumber(points);

    const nextLevelEl = document.getElementById("globalLevelUpNextLevel");
    if (nextLevelEl) {
      nextLevelEl.textContent = nextLevel ? nextLevel.name : "Nível Máximo";
    }

    // Atualizar cores
    const badgeIcon = document.querySelector(".global-level-up-badge-icon");
    if (badgeIcon) {
      badgeIcon.style.background = `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}CC)`;
      badgeIcon.style.borderColor = `${levelInfo.color}99`;
    }

    const levelName = document.getElementById("globalLevelUpName");
    if (levelName) {
      levelName.style.color = levelInfo.color;
      levelName.style.textShadow = `0 0 20px ${levelInfo.color}80, 0 3px 10px ${levelInfo.color}60`;
    }

    // Mostrar modal
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Efeitos extras
    this.playLevelUpSound();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // Auto-fechar após 8 segundos
    setTimeout(() => this.closeModal(), 8000);

    console.log("✨ Modal de Level Up exibido:", levelInfo);
  }

  closeModal() {
    const modal = document.getElementById("globalLevelUpModal");
    if (!modal) return;

    modal.classList.add("closing");

    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("closing");
      document.body.style.overflow = "auto";
    }, 400);
  }

  playLevelUpSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      let currentTime = audioContext.currentTime;

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = index === notes.length - 1 ? "triangle" : "sine";

        const volume = index === notes.length - 1 ? 0.15 : 0.1;
        gainNode.gain.setValueAtTime(volume, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.4);

        currentTime += 0.18;
      });
    } catch (error) {
      console.log("⚠️ Som de level up não disponível");
    }
  }

  // Método para testar o modal
  test(level = 4) {
    const levelInfo = this.levels[level];
    if (!levelInfo) {
      console.error("Nível inválido para teste");
      return;
    }

    this.showLevelUpModal({
      level: level,
      newLevel: level,
      totalPoints: levelInfo.min + 100,
      points: levelInfo.min + 100,
    });
  }
}

// Inicializar sistema global
const GlobalLevelUp = new GlobalLevelUpSystem();

// Auto-inicializar quando página carregar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (Auth && Auth.checkSession()) {
      GlobalLevelUp.initialize();
    }
  });
} else {
  if (Auth && Auth.checkSession()) {
    GlobalLevelUp.initialize();
  }
}

// Adicionar listener para fechamento com ESC
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    GlobalLevelUp.closeModal();
  }
});

// Fechar ao clicar no backdrop
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("global-level-up-backdrop")) {
    GlobalLevelUp.closeModal();
  }
});

// Exportar globalmente
window.GlobalLevelUp = GlobalLevelUp;

console.log(
  "✅ Sistema Global de Level Up carregado - Funciona em todas as páginas!"
);
