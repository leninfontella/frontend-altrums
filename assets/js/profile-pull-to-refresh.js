// ========== PULL TO REFRESH SYSTEM ==========
class PullToRefresh {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      threshold: 80, // Distância mínima para ativar refresh
      maxPullDistance: 120, // Distância máxima de pull
      refreshCallback: null, // Função a ser executada no refresh
      ...options,
    };

    this.isRefreshing = false;
    this.isPulling = false;
    this.startY = 0;
    this.currentY = 0;
    this.pullDistance = 0;

    this.init();
  }

  init() {
    this.createRefreshIndicator();
    this.bindEvents();
  }

  createRefreshIndicator() {
    this.refreshIndicator = document.createElement("div");
    this.refreshIndicator.id = "pullToRefreshIndicator";
    this.refreshIndicator.style.cssText = `
    position: fixed;
      top: 0;
      left: 50%;
      transform: translate(-50%, -100%) scale(0);
      background: linear-gradient(135deg, #00d4ff, #0099cc);
      color: white;
      padding: 12px;
      border-radius: 50%;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
    `;

    this.refreshIndicator.innerHTML = `
      <i class="fas fa-sync-alt" style="font-size: 18px;"></i>
    `;

    // Adicionar ao body para posicionamento fixo
    document.body.appendChild(this.refreshIndicator);
  }

  addStyles() {
    if (document.getElementById("pull-refresh-styles")) return;

    const styles = document.createElement("style");
    styles.id = "pull-refresh-styles";
    styles.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .pull-refresh-container {
        position: relative;
        overflow: hidden;
      }
    `;

    document.head.appendChild(styles);
  }

  bindEvents() {
    // Adicionar classes necessárias
    this.container.classList.add("pull-refresh-container");

    // Encontrar o conteúdo principal (opcional, só para compatibilidade)
    this.content =
      this.container.querySelector(".main-content") || this.container;

    // Adicionar estilos CSS dinamicamente
    this.addStyles();

    // Touch events
    this.container.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false }
    );
    this.container.addEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
      { passive: false }
    );

    // Mouse events para desktop (opcional)
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.container.addEventListener("mouseup", this.handleMouseEnd.bind(this));
    this.container.addEventListener(
      "mouseleave",
      this.handleMouseEnd.bind(this)
    );
  }

  handleTouchStart(e) {
    if (this.isRefreshing) return;

    // Só ativar se estiver no topo da página
    if (this.content.scrollTop > 0) return;

    this.startY = e.touches[0].clientY;
    this.isPulling = false;
  }

  handleTouchMove(e) {
    if (this.isRefreshing || this.content.scrollTop > 0) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    if (deltaY > 0) {
      e.preventDefault();
      this.isPulling = true;
      this.updatePull(deltaY);
    }
  }

  handleTouchEnd(e) {
    if (!this.isPulling || this.isRefreshing) return;

    this.endPull();
  }

  // Mouse events (para desktop)
  handleMouseDown(e) {
    if (this.isRefreshing || this.content.scrollTop > 0) return;

    this.startY = e.clientY;
    this.isPulling = false;
    this.isMouseDown = true;
  }

  handleMouseMove(e) {
    if (!this.isMouseDown || this.isRefreshing || this.content.scrollTop > 0)
      return;

    this.currentY = e.clientY;
    const deltaY = this.currentY - this.startY;

    if (deltaY > 10) {
      // Pequeno threshold para mouse
      e.preventDefault();
      this.isPulling = true;
      this.updatePull(deltaY);
    }
  }

  handleMouseEnd(e) {
    this.isMouseDown = false;
    if (!this.isPulling || this.isRefreshing) return;

    this.endPull();
  }

  updatePull(deltaY) {
    // Limitar a distância de pull
    this.pullDistance = Math.min(deltaY * 0.5, this.options.maxPullDistance);

    // Calcular progresso (0 a 1)
    const progress = Math.min(this.pullDistance / this.options.threshold, 1);

    // Mostrar indicador baseado no progresso
    if (progress > 0.1) {
      this.refreshIndicator.style.opacity = progress;
      this.refreshIndicator.style.transform = `translate(-50%, ${
        -50 + progress * 50
      }px) scale(${progress})`;
    } else {
      this.refreshIndicator.style.opacity = "0";
      this.refreshIndicator.style.transform = "translate(-50%, -100%) scale(0)";
    }
  }

  endPull() {
    this.isPulling = false;

    if (this.pullDistance >= this.options.threshold && !this.isRefreshing) {
      this.triggerRefresh();
    } else {
      this.resetPull();
    }
  }

  async triggerRefresh() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;

    // Mostrar indicador fixo no topo
    this.refreshIndicator.style.opacity = "1";
    this.refreshIndicator.style.transform = "translate(-50%, 20px) scale(1)";

    // Adicionar animação de spin
    const icon = this.refreshIndicator.querySelector("i");
    icon.style.animation = "spin 1s linear infinite";

    try {
      // Executar callback de refresh se fornecido
      if (
        this.options.refreshCallback &&
        typeof this.options.refreshCallback === "function"
      ) {
        await this.options.refreshCallback();
      }

      // Aguardar um tempo mínimo para melhor UX
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro durante refresh:", error);
    } finally {
      this.resetAfterRefresh();
    }
  }

  resetAfterRefresh() {
    // Mostrar sucesso brevemente
    // const icon = this.refreshIndicator.querySelector("i");
    // icon.style.animation = "";
    // icon.className = "fas fa-check";

    setTimeout(() => {
      this.resetPull();
    }, 500);
  }

  resetPull() {
    // Resetar indicador
    this.refreshIndicator.style.opacity = "0";
    this.refreshIndicator.style.transform = "translate(-50%, -100%) scale(0)";

    const icon = this.refreshIndicator.querySelector("i");
    icon.className = "fas fa-sync-alt";
    icon.style.animation = "";

    // Resetar estados
    this.isRefreshing = false;
    this.pullDistance = 0;
  }

  // Método público para triggerar refresh programaticamente
  refresh() {
    if (this.isRefreshing) return;

    this.pullDistance = this.options.threshold;
    this.triggerRefresh();
  }

  // Método para destruir o pull-to-refresh
  destroy() {
    // Remover event listeners
    this.container.removeEventListener("touchstart", this.handleTouchStart);
    this.container.removeEventListener("touchmove", this.handleTouchMove);
    this.container.removeEventListener("touchend", this.handleTouchEnd);
    this.container.removeEventListener("mousedown", this.handleMouseDown);
    this.container.removeEventListener("mousemove", this.handleMouseMove);
    this.container.removeEventListener("mouseup", this.handleMouseEnd);
    this.container.removeEventListener("mouseleave", this.handleMouseEnd);

    // Remover elementos
    if (this.refreshIndicator && this.refreshIndicator.parentNode) {
      this.refreshIndicator.parentNode.removeChild(this.refreshIndicator);
    }

    // Remover classes
    this.container.classList.remove("pull-refresh-container");
  }
}

// ========== INTEGRAÇÃO COM PERFIL ==========
class ProfilePullToRefresh {
  constructor() {
    this.pullToRefresh = null;
  }

  init() {
    const container = document.querySelector(".screen");

    if (!container) {
      console.warn("Container .screen não encontrado para pull-to-refresh");
      return;
    }

    this.pullToRefresh = new PullToRefresh(container, {
      threshold: 70,
      maxPullDistance: 100,
      refreshCallback: this.handleRefresh.bind(this),
    });

    // console.log("✅ Pull-to-refresh inicializado no perfil");
  }

  async handleRefresh() {
    try {
      // console.log("🔄 Iniciando refresh do perfil via pull-to-refresh...");

      // Limpar cache se as funções estão disponíveis
      if (typeof refreshDashboard === "function") {
        await refreshDashboard();
      } else if (typeof loadAndDisplayUserData === "function") {
        await loadAndDisplayUserData();
      } else {
        // Fallback básico
        console.log("🔄 Executando refresh básico...");
        window.location.reload();
      }

      // console.log("✅ Refresh do perfil concluído");
    } catch (error) {
      console.error("❌ Erro durante refresh:", error);
      throw error; // Re-throw para o PullToRefresh tratar
    }
  }

  // Método para triggerar refresh programaticamente
  refresh() {
    if (this.pullToRefresh) {
      this.pullToRefresh.refresh();
    }
  }

  // Método para destruir
  destroy() {
    if (this.pullToRefresh) {
      this.pullToRefresh.destroy();
      this.pullToRefresh = null;
    }
  }
}

// ========== INICIALIZAÇÃO AUTOMÁTICA ==========
let profilePullToRefresh = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", function () {
  // Aguardar um pouco para garantir que outros scripts foram carregados
  setTimeout(() => {
    profilePullToRefresh = new ProfilePullToRefresh();
    profilePullToRefresh.init();
  }, 500);
});

// Expor globalmente para debug e controle manual
if (typeof window !== "undefined") {
  window.PullToRefresh = PullToRefresh;
  window.ProfilePullToRefresh = ProfilePullToRefresh;
  window.profilePullToRefresh = profilePullToRefresh;
}

// Exportar para uso em outros módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PullToRefresh,
    ProfilePullToRefresh,
  };
}
