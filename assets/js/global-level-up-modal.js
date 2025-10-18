// global-level-up-modal.js - Sistema Global de Modal de Subida de Nível

/**
 * Sistema de Modal Global para Notificações de Subida de Nível
 * Pode ser incluído em qualquer página do sistema
 */

class LevelUpModalSystem {
  constructor() {
    this.isInitialized = false;
    this.currentModal = null;
    this.previousLevel = null;
    this.checkInterval = null;

    // Definição dos níveis (sincronizado com levels-badges-script.js)
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
  }

  /**
   * Inicializa o sistema de modal global
   */
  async initialize() {
    if (this.isInitialized) {
      console.log("⚠️ Sistema de modal já inicializado");
      return;
    }

    try {
      console.log("🚀 Inicializando sistema de modal de subida de nível...");

      // Aguardar dependências
      await this.waitForDependencies();

      // Injetar estilos CSS
      this.injectStyles();

      // Obter nível inicial do usuário
      await this.loadUserLevel();

      // Configurar listeners
      this.setupListeners();

      // Iniciar monitoramento periódico (opcional)
      this.startLevelMonitoring();

      this.isInitialized = true;
      console.log("✅ Sistema de modal inicializado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao inicializar sistema de modal:", error);
    }
  }

  /**
   * Aguarda carregamento das dependências necessárias
   */
  waitForDependencies() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.Auth && window.api) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Carrega o nível atual do usuário
   */
  async loadUserLevel() {
    try {
      if (!Auth.isLoggedIn()) {
        return;
      }

      const response = await api.get("/api/badges");
      const result = await response.json();

      if (result.success) {
        const badgesData = result.data?.badges || {};
        const currentPoints = badgesData.currentPoints || 0;
        const currentLevel = this.getCurrentLevel(currentPoints);

        this.previousLevel = currentLevel.level;
        console.log(
          `📊 Nível atual carregado: ${currentLevel.name} (${currentPoints} pontos)`
        );
      }
    } catch (error) {
      console.error("❌ Erro ao carregar nível do usuário:", error);
    }
  }

  /**
   * Determina o nível baseado nos pontos
   */
  getCurrentLevel(points) {
    for (let level in this.levels) {
      const levelData = this.levels[level];
      if (points >= levelData.min && points <= levelData.max) {
        return { level: parseInt(level), ...levelData };
      }
    }
    return { level: 1, ...this.levels[1] };
  }

  /**
   * Verifica se houve mudança de nível
   */
  async checkLevelChange() {
    try {
      if (!Auth.isLoggedIn()) {
        return;
      }

      const response = await api.get("/api/badges");
      const result = await response.json();

      if (result.success) {
        const badgesData = result.data?.badges || {};
        const currentPoints = badgesData.currentPoints || 0;
        const currentLevel = this.getCurrentLevel(currentPoints);

        // Verificar se subiu de nível
        if (
          this.previousLevel !== null &&
          currentLevel.level > this.previousLevel
        ) {
          console.log(
            `🎉 SUBIDA DE NÍVEL! ${this.levels[this.previousLevel].name} → ${
              currentLevel.name
            }`
          );

          // Mostrar modal
          this.showLevelUpModal(currentLevel, this.levels[this.previousLevel]);

          // Atualizar nível anterior
          this.previousLevel = currentLevel.level;

          // Disparar evento customizado
          window.dispatchEvent(
            new CustomEvent("levelUp", {
              detail: {
                newLevel: currentLevel,
                previousLevel: this.levels[this.previousLevel],
              },
            })
          );
        } else if (this.previousLevel === null) {
          // Primeira verificação
          this.previousLevel = currentLevel.level;
        }
      }
    } catch (error) {
      console.error("❌ Erro ao verificar mudança de nível:", error);
    }
  }

  /**
   * Mostra o modal de subida de nível
   */
  showLevelUpModal(newLevel, previousLevel = null) {
    // Remover modal anterior se existir
    this.closeModal();

    // Criar container do modal
    const modalContainer = document.createElement("div");
    modalContainer.id = "globalLevelUpModal";
    modalContainer.className = "level-up-modal-container";

    // Criar backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "level-up-backdrop";

    // Criar conteúdo do modal
    const modalContent = document.createElement("div");
    modalContent.className = "level-up-content";

    // Efeito de confete
    const confetti = this.createConfetti();

    // HTML do modal
    modalContent.innerHTML = `
      <div class="level-up-glow" style="background: ${newLevel.color}40;"></div>
      
      <div class="level-up-icon-container">
        <div class="level-up-icon" style="
          background: linear-gradient(135deg, ${newLevel.color}40, ${
      newLevel.color
    }20);
          border: 3px solid ${newLevel.color};
          box-shadow: 0 0 40px ${newLevel.color}80, 0 0 80px ${
      newLevel.color
    }40;
        ">
          <span class="level-icon-emoji">${newLevel.icon}</span>
        </div>
        <div class="level-up-sparkles"></div>
      </div>

      <div class="level-up-badge" style="
        background: linear-gradient(135deg, ${newLevel.color}30, ${
      newLevel.color
    }10);
        border: 2px solid ${newLevel.color}60;
      ">
        <span style="color: ${newLevel.color};">NÍVEL ${newLevel.level}</span>
      </div>

      <h2 class="level-up-title">
        🎉 Parabéns! 🎉
      </h2>

      <div class="level-up-message">
        Você alcançou o nível
      </div>

      <div class="level-up-level-name" style="color: ${newLevel.color};">
        ${newLevel.name}
      </div>

      ${
        previousLevel
          ? `
        <div class="level-up-progression">
          <div class="progression-item old">
            <span class="progression-icon">${previousLevel.icon}</span>
            <span class="progression-name">${previousLevel.name}</span>
          </div>
          <div class="progression-arrow">→</div>
          <div class="progression-item new" style="border-color: ${newLevel.color};">
            <span class="progression-icon">${newLevel.icon}</span>
            <span class="progression-name" style="color: ${newLevel.color};">${newLevel.name}</span>
          </div>
        </div>
      `
          : ""
      }

      <div class="level-up-description">
        Continue doando e interagindo para desbloquear novos níveis e benefícios!
      </div>

      <div class="level-up-rewards">
        <div class="reward-item">
          <i class="fas fa-star"></i>
          <span>Novo Badge Desbloqueado</span>
        </div>
        <div class="reward-item">
          <i class="fas fa-trophy"></i>
          <span>Reconhecimento da Comunidade</span>
        </div>
        <div class="reward-item">
          <i class="fas fa-gift"></i>
          <span>Benefícios Exclusivos</span>
        </div>
      </div>

      <div class="level-up-actions">
        <button class="level-up-btn-view" onclick="window.LevelUpModal.viewBadges()">
          Ver Todos os Badges
        </button>
        <button class="level-up-btn-close" onclick="window.LevelUpModal.closeModal()">
          Continuar
        </button>
      </div>
    `;

    // Montar estrutura
    modalContainer.appendChild(backdrop);
    modalContainer.appendChild(confetti);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);

    // Armazenar referência
    this.currentModal = modalContainer;

    // Adicionar animação de entrada
    setTimeout(() => {
      modalContainer.classList.add("active");
      this.animateSparkles(modalContent.querySelector(".level-up-sparkles"));
    }, 10);

    // Tocar som de celebração (se disponível)
    this.playLevelUpSound();

    // Fechar ao clicar no backdrop
    backdrop.addEventListener("click", () => this.closeModal());

    // Auto-fechar após 15 segundos
    setTimeout(() => {
      if (this.currentModal === modalContainer) {
        this.closeModal();
      }
    }, 15000);
  }

  /**
   * Cria efeito de confete
   */
  createConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.className = "level-up-confetti";

    const colors = [
      "#FFD700",
      "#00d4ff",
      "#FF6B9D",
      "#00ff88",
      "#8B5CF6",
      "#F59E0B",
    ];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.animationDelay = Math.random() * 3 + "s";
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confettiContainer.appendChild(confetti);
    }

    return confettiContainer;
  }

  /**
   * Anima os sparkles ao redor do ícone
   */
  animateSparkles(container) {
    const sparkleCount = 12;

    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.animationDelay = i * 0.1 + "s";

      const angle = (360 / sparkleCount) * i;
      const radius = 70;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;

      sparkle.style.left = `calc(50% + ${x}px)`;
      sparkle.style.top = `calc(50% + ${y}px)`;

      container.appendChild(sparkle);
    }
  }

  /**
   * Toca som de subida de nível (se disponível)
   */
  playLevelUpSound() {
    try {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Segunda nota
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();

        osc2.connect(gain2);
        gain2.connect(audioContext.destination);

        osc2.frequency.value = 659.25; // E5
        osc2.type = "sine";

        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 150);
    } catch (error) {
      console.log("🔇 Som de nível não disponível");
    }
  }

  /**
   * Fecha o modal atual
   */
  closeModal() {
    if (this.currentModal) {
      this.currentModal.classList.remove("active");
      this.currentModal.classList.add("closing");

      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 400);
    }
  }

  /**
   * Redireciona para página de badges
   */
  viewBadges() {
    this.closeModal();

    // Redirecionar após animação
    setTimeout(() => {
      window.location.href = "/views/dashboard/badges/badges.html";
    }, 300);
  }

  /**
   * Configura listeners de eventos
   */
  setupListeners() {
    // Listener para mudanças de saldo (indicativo de possível subida de nível)
    window.addEventListener("balanceUpdated", () => {
      setTimeout(() => this.checkLevelChange(), 1000);
    });

    // Listener para doações recebidas
    window.addEventListener("donationReceived", () => {
      setTimeout(() => this.checkLevelChange(), 1500);
    });

    // Listener customizado para forçar verificação
    window.addEventListener("checkLevelUp", () => {
      this.checkLevelChange();
    });

    // Listener para limpeza
    window.addEventListener("beforeunload", () => {
      this.cleanup();
    });
  }

  /**
   * Inicia monitoramento periódico do nível (opcional)
   */
  startLevelMonitoring(intervalMs = 60000) {
    // Verificar a cada 1 minuto
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkLevelChange();
    }, intervalMs);
  }

  /**
   * Para o monitoramento periódico
   */
  stopLevelMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Limpeza ao sair da página
   */
  cleanup() {
    this.stopLevelMonitoring();
    this.closeModal();
  }

  /**
   * Injeta os estilos CSS necessários
   */
  injectStyles() {
    if (document.getElementById("levelUpModalStyles")) {
      return; // Estilos já injetados
    }

    const styles = document.createElement("style");
    styles.id = "levelUpModalStyles";
    styles.textContent = `
      /* Container Principal */
      .level-up-modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }

      .level-up-modal-container.active {
        opacity: 1;
        pointer-events: auto;
      }

      .level-up-modal-container.closing {
        opacity: 0;
      }

      /* Backdrop */
      .level-up-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
      }

      /* Conteúdo do Modal */
      .level-up-content {
        position: relative;
        background: linear-gradient(145deg, rgba(26, 26, 26, 0.98) 0%, rgba(18, 18, 18, 0.98) 50%, rgba(10, 10, 10, 0.98) 100%);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 32px;
        padding: 48px 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 
          0 40px 120px rgba(0, 212, 255, 0.4),
          0 20px 60px rgba(0, 0, 0, 0.8),
          inset 0 2px 0 rgba(255, 255, 255, 0.15);
        animation: modalSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        overflow: hidden;
      }

      .level-up-modal-container.closing .level-up-content {
        animation: modalSlideOut 0.4s ease-in forwards;
      }

      @keyframes modalSlideIn {
        0% {
          opacity: 0;
          transform: translateY(60px) scale(0.85);
        }
        60% {
          transform: translateY(-10px) scale(1.02);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes modalSlideOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(40px) scale(0.9);
        }
      }

      /* Brilho de fundo */
      .level-up-glow {
        position: absolute;
        top: -100%;
        left: -50%;
        width: 200%;
        height: 300%;
        border-radius: 50%;
        filter: blur(100px);
        animation: glowPulse 3s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes glowPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }

      /* Ícone Principal */
      .level-up-icon-container {
        position: relative;
        margin: 0 auto 32px;
        width: 140px;
        height: 140px;
      }

      .level-up-icon {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 64px;
        animation: iconBounce 1s ease-in-out infinite;
        position: relative;
        z-index: 2;
      }

      .level-icon-emoji {
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
      }

      @keyframes iconBounce {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-10px) scale(1.05); }
      }

      /* Sparkles */
      .level-up-sparkles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .sparkle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: linear-gradient(45deg, #FFD700, #FFA500);
        border-radius: 50%;
        animation: sparkleFloat 2s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
      }

      @keyframes sparkleFloat {
        0%, 100% { 
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
        50% { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }

      /* Badge do Nível */
      .level-up-badge {
        display: inline-block;
        padding: 12px 28px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        margin-bottom: 24px;
        animation: badgePulse 2s ease-in-out infinite;
      }

      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      /* Título */
      .level-up-title {
        font-size: 36px;
        font-weight: 900;
        color: #ffffff;
        margin-bottom: 16px;
        text-shadow: 0 2px 8px rgba(0, 212, 255, 0.6);
        animation: titleGlow 2s ease-in-out infinite;
      }

      @keyframes titleGlow {
        0%, 100% { text-shadow: 0 2px 8px rgba(0, 212, 255, 0.6); }
        50% { text-shadow: 0 4px 16px rgba(0, 212, 255, 0.9); }
      }

      /* Mensagem */
      .level-up-message {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 12px;
        font-weight: 500;
      }

      /* Nome do Nível */
      .level-up-level-name {
        font-size: 32px;
        font-weight: 900;
        margin-bottom: 32px;
        text-shadow: 0 0 20px currentColor;
        animation: levelNameGlow 1.5s ease-in-out infinite;
      }

      @keyframes levelNameGlow {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      /* Progressão */
      .level-up-progression {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin-bottom: 32px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .progression-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        min-width: 100px;
      }

      .progression-item.old {
        opacity: 0.6;
      }

      .progression-item.new {
        animation: progressionPulse 1s ease-in-out infinite;
      }

      @keyframes progressionPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .progression-icon {
        font-size: 32px;
      }

      .progression-name {
        font-size: 14px;
        font-weight: 700;
      }

      .progression-arrow {
        font-size: 24px;
        color: #00d4ff;
        animation: arrowBounce 1s ease-in-out infinite;
      }

      @keyframes arrowBounce {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
      }

      /* Descrição */
      .level-up-description {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 28px;
        line-height: 1.6;
      }

      /* Recompensas */
      .level-up-rewards {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
        padding: 20px;
        background: rgba(0, 212, 255, 0.05);
        border-radius: 16px;
        border: 1px solid rgba(0, 212, 255, 0.2);
      }

      .reward-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 600;
      }

      .reward-item i {
        font-size: 18px;
        color: #00d4ff;
      }

      /* Botões */
      .level-up-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .level-up-actions button {
        flex: 1;
        padding: 16px 24px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        position: relative;
        overflow: hidden;
      }

      .level-up-btn-view {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 153, 204, 0.3));
        border: 2px solid rgba(0, 212, 255, 0.5);
        color: #00d4ff;
      }

      .level-up-btn-view:hover {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 153, 204, 0.4));
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4);
      }

      .level-up-btn-close {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      .level-up-btn-close:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
      }

      /* Confete */
      .level-up-confetti {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
      }

      .confetti-piece {
        position: absolute;
        width: 10px;
        height: 10px;
        top: -10%;
        opacity: 0;
        animation: confettiFall linear forwards;
      }

      @keyframes confettiFall {
        0% {
          top: -10%;
          opacity: 1;
          transform: translateX(0) rotate(0deg);
        }
        100% {
          top: 110%;
          opacity: 0;
          transform: translateX(100px) rotate(720deg);
        }
      }

      /* Responsividade */
      @media (max-width: 600px) {
        .level-up-content {
          padding: 36px 24px;
          border-radius: 24px;
        }

        .level-up-icon-container {
          width: 120px;
          height: 120px;
        }

        .level-up-icon {
          width: 120px;
          height: 120px;
          font-size: 56px;
        }

        .level-up-title {
          font-size: 28px;
        }

        .level-up-level-name {
          font-size: 26px;
        }

        .level-up-progression {
          flex-direction: column;
          gap: 16px;
        }

        .progression-arrow {
          transform: rotate(90deg);
        }

        .level-up-actions {
          flex-direction: column;
        }

        .level-up-actions button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Método público para forçar verificação de nível
   */
  async forceCheck() {
    await this.checkLevelChange();
  }

  /**
   * Método público para mostrar modal de teste
   */
  showTestModal(levelNumber = 2) {
    const level = this.levels[levelNumber];
    const previousLevel = this.levels[levelNumber - 1];

    if (level) {
      this.showLevelUpModal(level, previousLevel);
    } else {
      console.error("Nível inválido para teste");
    }
  }
}

// Criar instância global
window.LevelUpModal = new LevelUpModalSystem();

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.LevelUpModal.initialize();
  });
} else {
  window.LevelUpModal.initialize();
}

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = LevelUpModalSystem;
}

/**
 * INSTRUÇÕES DE USO:
 *
 * 1. Incluir o script em QUALQUER página HTML:
 *    <script src="path/to/global-level-up-modal.js"></script>
 *
 * 2. O sistema se auto-inicializa e monitora mudanças de nível
 *
 * 3. Forçar verificação manual:
 *    window.LevelUpModal.forceCheck();
 *
 * 4. Testar o modal (ambiente de desenvolvimento):
 *    window.LevelUpModal.showTestModal(3); // Mostra modal do nível 3
 *
 * 5. Disparar verificação após ação específica:
 *    window.dispatchEvent(new Event('checkLevelUp'));
 *
 * 6. Escutar evento de subida de nível:
 *    window.addEventListener('levelUp', (e) => {
 *      console.log('Novo nível:', e.detail.newLevel);
 *    });
 *
 * 7. Parar/Iniciar monitoramento:
 *    window.LevelUpModal.stopLevelMonitoring();
 *    window.LevelUpModal.startLevelMonitoring(30000); // 30 segundos
 */
