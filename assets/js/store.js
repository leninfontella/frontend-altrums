// ========== STORE PAGE - SISTEMA DE COMPRAS (PADRÃO HOME) ==========

// Verificar se Auth.js está carregado
if (typeof Auth === "undefined") {
  console.error("❌ Auth.js não está carregado!");
  throw new Error("Auth.js é obrigatório");
}

// Sistema de gerenciamento da loja
const StoreSystem = {
  currentBalance: 0,
  selectedProduct: null,

  // Inicializar sistema
  async init() {
    console.log("🏪 Inicializando sistema da loja...");

    // Verificar autenticação
    if (!Auth.checkSession()) {
      console.log("❌ Usuário não autenticado");
      Auth.redirectToLogin();
      return;
    }

    // Carregar saldo do usuário
    await this.loadUserBalance();

    // Adicionar event listeners
    this.setupEventListeners();

    // Marcar nav ativo
    this.setActiveNav();

    console.log("✅ Sistema da loja inicializado!");
  },

  // Carregar saldo do usuário
  async loadUserBalance() {
    try {
      console.log("💰 Carregando saldo do usuário...");

      // Tentar carregar da API primeiro
      const balance = await Auth.getBalance();

      if (balance !== null && balance !== undefined) {
        this.currentBalance = balance;
      } else {
        // Fallback para saldo local
        this.currentBalance = Auth.getUserBalance();
      }

      this.updateBalanceDisplay();
      this.updateProductAvailability();

      console.log("✅ Saldo carregado:", this.currentBalance);
    } catch (error) {
      console.error("❌ Erro ao carregar saldo:", error);

      // Usar saldo local como fallback
      this.currentBalance = Auth.getUserBalance();
      this.updateBalanceDisplay();
      this.updateProductAvailability();
    }
  },

  // Atualizar exibição do saldo
  updateBalanceDisplay() {
    const balanceElement = document.getElementById("header-balance");
    if (balanceElement) {
      balanceElement.textContent = this.currentBalance.toLocaleString();
    }
  },

  // Atualizar disponibilidade dos produtos
  updateProductAvailability() {
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card) => {
      const price = parseInt(card.dataset.price);
      const buyButton = card.querySelector(".buy-button");

      if (this.currentBalance < price) {
        buyButton.disabled = true;
        buyButton.innerHTML = '<i class="fas fa-lock"></i> Saldo insuficiente';
        card.style.opacity = "0.6";
      } else {
        buyButton.disabled = false;
        buyButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Comprar';
        card.style.opacity = "1";
      }
    });
  },

  // Marcar navegação ativa
  setActiveNav() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
    });
  },

  // Configurar event listeners
  setupEventListeners() {
    // Animações de entrada
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";

      setTimeout(() => {
        card.style.transition = "all 0.6s ease";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 80);
    });

    // Feedback tátil para mobile
    productCards.forEach((card) => {
      this.addTouchFeedback(card);
    });

    // Event listeners para nav items
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      this.addTouchFeedback(item);
      item.addEventListener("click", () => {
        item.style.transform = "scale(0.95)";
        setTimeout(() => {
          item.style.transform = "scale(1)";
        }, 150);
      });
    });
  },

  // Adicionar feedback tátil
  addTouchFeedback(element) {
    if (!element) return;

    element.addEventListener(
      "touchstart",
      () => {
        element.style.transform = "scale(0.98)";
      },
      { passive: true }
    );

    element.addEventListener(
      "touchend",
      () => {
        element.style.transform = "scale(1)";
      },
      { passive: true }
    );

    element.addEventListener(
      "touchcancel",
      () => {
        element.style.transform = "scale(1)";
      },
      { passive: true }
    );
  },

  // Processar compra
  async processPurchase(productName, price, productId) {
    try {
      console.log(`🛒 Processando compra de ${productName}...`);

      // Verificar saldo novamente
      if (this.currentBalance < price) {
        throw new Error("Saldo insuficiente");
      }

      // Atualizar saldo via Auth.js
      const result = await Auth.updateBalance(
        price,
        "subtract",
        `Compra: ${productName}`
      );

      if (result && result.success) {
        // Atualizar saldo local
        this.currentBalance = result.balance;
        this.updateBalanceDisplay();
        this.updateProductAvailability();

        // Mostrar modal de sucesso
        this.showSuccessModal(productName, price);

        console.log("✅ Compra realizada com sucesso!");
        return true;
      } else {
        throw new Error("Erro ao processar compra");
      }
    } catch (error) {
      console.error("❌ Erro ao processar compra:", error);
      showNotification(error.message || "Erro ao processar compra", "error");
      return false;
    }
  },

  // Modal de sucesso
  showSuccessModal(productName, price) {
    const existingModal = document.getElementById("success-modal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="success-modal" class="success-modal">
        <div class="modal-backdrop" onclick="closeSuccessModal()"></div>
        <div class="modal-content">
          <div class="modal-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          
          <h2 class="modal-title">Compra Realizada!</h2>
          
          <p style="color: rgba(255, 255, 255, 0.85); font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
            Parabéns! Você adquiriu seu prêmio com sucesso.
          </p>
          
          <div class="modal-details">
            <div class="modal-detail-row">
              <span class="modal-detail-label">Produto:</span>
              <span class="modal-detail-value">${productName}</span>
            </div>
            
            <div class="modal-detail-row">
              <span class="modal-detail-label">Valor:</span>
              <span class="modal-detail-value">${price.toLocaleString()} 🪙</span>
            </div>
            
            <div class="modal-detail-row">
              <span class="modal-detail-label">Novo Saldo:</span>
              <span class="modal-detail-value highlight">${this.currentBalance.toLocaleString()} 🪙</span>
            </div>
          </div>
          
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 10px; margin-bottom: 20px; color: #10b981; font-size: 12px; line-height: 1.4;">
            <i class="fas fa-info-circle"></i> Entraremos em contato em breve para entregar seu prêmio!
          </div>
          
          <div class="modal-actions">
            <button class="modal-button confirm" onclick="closeSuccessModal()">
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Tocar som de sucesso
    this.playSuccessSound();

    // Auto-fechar após 8 segundos
    setTimeout(() => {
      closeSuccessModal();
    }, 8000);
  },

  // Som de sucesso
  playSuccessSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },
        { freq: 659.25, start: 0.15, duration: 0.15 },
        { freq: 783.99, start: 0.3, duration: 0.15 },
        { freq: 1046.5, start: 0.45, duration: 0.4 },
      ];

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = note.freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(
          0.3,
          audioContext.currentTime + note.start
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + note.start + note.duration
        );

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });
    } catch (error) {
      console.log("⚠️ Não foi possível tocar som");
    }
  },
};

// ========== FUNÇÕES GLOBAIS ==========

// Voltar para página anterior
function goBack() {
  window.history.back();
}

// Abrir modal de compra
function openPurchaseModal(productName, price, productId) {
  const existingModal = document.getElementById("purchase-modal");
  if (existingModal) existingModal.remove();

  const currentBalance = StoreSystem.currentBalance;
  const newBalance = currentBalance - price;
  const hasBalance = currentBalance >= price;

  const modalHTML = `
    <div id="purchase-modal" class="purchase-modal">
      <div class="modal-backdrop" onclick="closePurchaseModal()"></div>
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        
        <h2 class="modal-title">Confirmar Compra</h2>
        
        <div class="modal-product-name">${productName}</div>
        
        <div class="modal-details">
          <div class="modal-detail-row">
            <span class="modal-detail-label">Preço:</span>
            <span class="modal-detail-value">${price.toLocaleString()} 🪙</span>
          </div>
          
          <div class="modal-detail-row">
            <span class="modal-detail-label">Saldo Atual:</span>
            <span class="modal-detail-value">${currentBalance.toLocaleString()} 🪙</span>
          </div>
          
          <div class="modal-detail-row">
            <span class="modal-detail-label">Novo Saldo:</span>
            <span class="modal-detail-value ${
              hasBalance ? "highlight" : "insufficient"
            }">
              ${hasBalance ? newBalance.toLocaleString() : "Insuficiente"} 🪙
            </span>
          </div>
        </div>
        
        ${
          !hasBalance
            ? `
          <div class="modal-warning">
            <i class="fas fa-exclamation-triangle"></i> Você não tem saldo suficiente para esta compra
          </div>
        `
            : ""
        }
        
        <div class="modal-actions">
          <button class="modal-button cancel" onclick="closePurchaseModal()">
            Cancelar
          </button>
          <button 
            class="modal-button confirm" 
            onclick="confirmPurchase('${productName}', ${price}, '${productId}')"
            ${!hasBalance ? "disabled" : ""}
          >
            ${hasBalance ? "Confirmar Compra" : "Saldo Insuficiente"}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

// Fechar modal de compra
function closePurchaseModal() {
  const modal = document.getElementById("purchase-modal");
  if (modal) {
    modal.style.animation = "modalFadeOut 0.3s ease-in";
    setTimeout(() => modal.remove(), 300);
  }
}

// Confirmar compra
async function confirmPurchase(productName, price, productId) {
  const confirmButton = document.querySelector(".modal-button.confirm");
  const originalText = confirmButton.textContent;

  confirmButton.disabled = true;
  confirmButton.textContent = "Processando...";

  const success = await StoreSystem.processPurchase(
    productName,
    price,
    productId
  );

  if (success) {
    closePurchaseModal();
  } else {
    confirmButton.disabled = false;
    confirmButton.textContent = originalText;
  }
}

// Fechar modal de sucesso
function closeSuccessModal() {
  const modal = document.getElementById("success-modal");
  if (modal) {
    modal.style.animation = "modalFadeOut 0.3s ease-in";
    setTimeout(() => modal.remove(), 300);
  }
}

// Sistema de notificações
function showNotification(message, type = "info") {
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => notif.remove());

  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;

  // Adicionar estilos inline
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10002;
    max-width: 350px;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  const contentStyle = notification.querySelector(".notification-content");
  contentStyle.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
  `;

  const spanStyle = contentStyle.querySelector("span");
  spanStyle.style.cssText = `
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    flex: 1;
    margin-right: 12px;
  `;

  const buttonStyle = contentStyle.querySelector("button");
  buttonStyle.style.cssText = `
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
  `;

  // Cores baseadas no tipo
  if (type === "error") {
    notification.style.borderLeft = "4px solid #ef4444";
  } else if (type === "success") {
    notification.style.borderLeft = "4px solid #10b981";
  } else if (type === "warning") {
    notification.style.borderLeft = "4px solid #ff9800";
  } else {
    notification.style.borderLeft = "4px solid #00d4ff";
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 4000);
}

// ========== INICIALIZAÇÃO ==========

document.addEventListener("DOMContentLoaded", () => {
  StoreSystem.init();

  console.log("✅ Página da loja carregada com padrão Home!");
});

// Exportar para uso global
window.StoreSystem = StoreSystem;
window.goBack = goBack;
window.openPurchaseModal = openPurchaseModal;
window.closePurchaseModal = closePurchaseModal;
window.confirmPurchase = confirmPurchase;
window.closeSuccessModal = closeSuccessModal;
window.showNotification = showNotification;
