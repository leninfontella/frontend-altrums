// ========== CONFIGURAÇÃO E INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  // console.log("🔒 Inicializando página de segurança...");
  initializeSecurity();
});

// Configuração da API
const API_BASE_URL = "https://api-backend-coins.onrender.com/api";

// Estado global das configurações
let securitySettings = {
  publicProfile: true,
  showRanking: true,
  publicDonationHistory: false,
  notifications: true,
};

// ========== FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ==========
function initializeSecurity() {
  loadSecuritySettings();
  setupToggles();
  setupModal();
  setupSessions();
  setupDataManagement();
  setupBackButton();
  calculateSecurityScore();

  // console.log("✅ Página de segurança inicializada!");
}

// ========== CARREGAR CONFIGURAÇÕES DO USUÁRIO ==========
function loadSecuritySettings() {
  try {
    const savedSettings = sessionStorage.getItem("securitySettings");

    if (savedSettings) {
      securitySettings = { ...securitySettings, ...JSON.parse(savedSettings) };
      // console.log("📄 Configurações carregadas:", securitySettings);
    }

    applySettingsToUI();
  } catch (error) {
    console.error("❌ Erro ao carregar configurações:", error);
  }
}

function applySettingsToUI() {
  document.getElementById("toggle-public-profile").checked =
    securitySettings.publicProfile;
  document.getElementById("toggle-ranking").checked =
    securitySettings.showRanking;
  document.getElementById("toggle-donation-history").checked =
    securitySettings.publicDonationHistory;
  document.getElementById("toggle-notifications").checked =
    securitySettings.notifications;
}

// ========== SALVAR CONFIGURAÇÕES ==========
function saveSecuritySettings() {
  try {
    sessionStorage.setItem(
      "securitySettings",
      JSON.stringify(securitySettings)
    );
    // console.log("💾 Configurações salvas!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    return false;
  }
}

// ========== CONFIGURAÇÃO DE TOGGLES ==========
function setupToggles() {
  const toggles = {
    "toggle-public-profile": "publicProfile",
    "toggle-ranking": "showRanking",
    "toggle-donation-history": "publicDonationHistory",
    "toggle-notifications": "notifications",
  };

  Object.keys(toggles).forEach((toggleId) => {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.addEventListener("change", function () {
        const settingKey = toggles[toggleId];
        securitySettings[settingKey] = this.checked;

        saveSecuritySettings();
        calculateSecurityScore();

        const settingName =
          this.closest(".setting-card").querySelector(
            ".setting-title"
          ).textContent;
        showToast(
          `${settingName} ${this.checked ? "ativado" : "desativado"}`,
          "success"
        );

        // console.log(`🔄 ${settingName}: ${this.checked ? "ON" : "OFF"}`);
      });
    }
  });
}

// ========== CÁLCULO DO SCORE DE SEGURANÇA ==========
function calculateSecurityScore() {
  let score = 70;

  if (!securitySettings.publicProfile) score += 10;
  if (!securitySettings.showRanking) score += 10;
  if (!securitySettings.publicDonationHistory) score += 10;

  const progressBar = document.getElementById("security-progress-bar");
  const scoreText = document.getElementById("security-score");
  const levelText = document.getElementById("security-level");

  if (progressBar) {
    progressBar.style.width = `${score}%`;
  }

  if (scoreText) {
    scoreText.textContent = `${score}/100 pontos`;
  }

  if (levelText) {
    let level;
    if (score < 75) level = "Básico";
    else if (score < 90) level = "Médio";
    else level = "Forte";

    levelText.textContent = `Nível: ${level}`;
  }

  // console.log(`🔒 Score de segurança: ${score}/100`);
}

// ========== GERENCIAMENTO DE SESSÕES ==========
function setupSessions() {
  loadCurrentSession();

  loadOtherSessions();

  const logoutAllBtn = document.getElementById("logout-all");
  if (logoutAllBtn) {
    logoutAllBtn.addEventListener("click", handleLogoutAll);
  }
}

// ========== DETECÇÃO DE DISPOSITIVO E NAVEGADOR ==========
function detectDevice() {
  const ua = navigator.userAgent;
  let device = "Desktop";

  if (/Android/i.test(ua)) {
    device = "Android";
  } else if (/iPhone/i.test(ua)) {
    device = "iPhone";
  } else if (/iPad/i.test(ua)) {
    device = "iPad";
  } else if (/iPod/i.test(ua)) {
    device = "iPod";
  } else if (/Windows/i.test(ua)) {
    device = "Windows";
  } else if (/Mac/i.test(ua)) {
    device = "Mac";
  } else if (/Linux/i.test(ua)) {
    device = "Linux";
  }

  return device;
}

function detectBrowser() {
  const ua = navigator.userAgent;
  let browser = "Navegador Desconhecido";

  if (ua.includes("Opera") || ua.includes("OPR")) {
    browser = "Opera";
  } else if (ua.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Chrome")) {
    browser = "Chrome";
  }

  return browser;
}

function getDeviceIcon(device) {
  const icons = {
    iPhone: "fa-mobile-alt",
    iPad: "fa-tablet-alt",
    iPod: "fa-mobile-alt",
    Android: "fa-mobile-alt",
    Windows: "fa-laptop",
    Mac: "fa-laptop",
    Linux: "fa-laptop",
    Desktop: "fa-desktop",
  };

  return icons[device] || "fa-desktop";
}

function getUserLocation() {
  return "Porto Alegre, RS - Brasil";
}

function loadCurrentSession() {
  const currentDevice = detectDevice();
  const currentBrowser = detectBrowser();
  const currentLocation = getUserLocation();
  const currentIcon = getDeviceIcon(currentDevice);

  const currentSessionHtml = `
    <div class="session-card current-session">
      <div class="session-icon">
        <i class="fas ${currentIcon}"></i>
      </div>
      <div class="session-info">
        <h4 class="session-device">${currentBrowser} - ${currentDevice}</h4>
        <p class="session-location">${currentLocation}</p>
        <p class="session-time">Agora (Sessão atual)</p>
      </div>
      <span class="current-badge">Atual</span>
    </div>
  `;

  const container = document.getElementById("current-session-container");
  if (container) {
    container.innerHTML = currentSessionHtml;
  }

  // console.log("📱 Sessão atual carregada:", {
  //   device: currentDevice,
  //   browser: currentBrowser,
  //   location: currentLocation,
  // });
}

function loadOtherSessions() {
  const sessions = [
    // {
    //   device: "iPhone 13",
    //   location: "São Paulo, SP - Brasil",
    //   time: "há 2 dias",
    //   icon: "fa-mobile-alt",
    // },
    // {
    //   device: "Chrome - Windows",
    //   location: "Curitiba, PR - Brasil",
    //   time: "há 5 dias",
    //   icon: "fa-laptop",
    // },
  ];

  const container = document.getElementById("other-sessions-container");
  if (!container) return;

  container.innerHTML = sessions
    .map(
      (session) => `
    <div class="session-card">
      <div class="session-icon">
        <i class="fas ${session.icon}"></i>
      </div>
      <div class="session-info">
        <h4 class="session-device">${session.device}</h4>
        <p class="session-location">${session.location}</p>
        <p class="session-time">${session.time}</p>
      </div>
      <button onclick="handleLogoutSession(this)" type="button" aria-label="Encerrar sessão">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </div>
  `
    )
    .join("");
}

function handleLogoutSession(button) {
  const sessionCard = button.closest(".session-card");
  const deviceName = sessionCard.querySelector(".session-device").textContent;

  showConfirmModal(
    "Encerrar Sessão",
    `Deseja encerrar a sessão em "${deviceName}"?`,
    () => {
      sessionCard.style.opacity = "0";
      sessionCard.style.transform = "translateX(-100%)";

      setTimeout(() => {
        sessionCard.remove();
        showToast("Sessão encerrada com sucesso", "success");
      }, 300);
    }
  );
}

function handleLogoutAll() {
  showConfirmModal(
    "Encerrar sessão atual",
    "Você será desconectado de sua sessão atual. Deseja continuar?",
    async () => {
      try {
        let token = null;
        const possibleKeys = ["accessToken", "token", "authToken", "jwt"];

        for (const key of possibleKeys) {
          token = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (token) break;
        }

        if (!token && typeof Auth !== "undefined") {
          try {
            token = Auth.getToken();
          } catch (e) {
            console.warn("⚠️ Erro ao obter token via Auth:", e);
          }
        }

        if (!token) {
          showToast("Sessão não encontrada. Faça login novamente.", "error");
          setTimeout(() => {
            window.location.href = "/index.html";
          }, 2000);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao encerrar sessões");
        }

        // console.log("✅ Todas as sessões encerradas");
        logSecurityEvent("logout_all_sessions", {
          device: detectDevice(),
          browser: detectBrowser(),
        });

        // Limpar todos os dados locais
        localStorage.clear();
        sessionStorage.clear();

        // Limpar cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        showToast("Todas as sessões foram encerradas. Até logo! 👋", "success");

        // Redirecionar para login após 1.5 segundos
        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1500);
      } catch (error) {
        console.error("❌ Erro ao encerrar sessões:", error);

        // Mesmo em caso de erro, fazer logout local e redirecionar
        localStorage.clear();
        sessionStorage.clear();

        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/"
            );
        });

        showToast(
          "Sessões encerradas localmente. Redirecionando...",
          "warning"
        );

        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1500);
      }
    }
  );
}

// ========== GERENCIAMENTO DE DADOS ==========
function setupDataManagement() {
  const downloadBtn = document.getElementById("download-data");
  const deleteBtn = document.getElementById("delete-account");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", handleDownloadData);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDeleteAccount);
  }
}

async function handleDownloadData() {
  showToast("Preparando seus dados...", "success");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const userData = {
    name: "Usuário Demo",
    email: "usuario@exemplo.com",
    coins: 1250,
    donations: 45,
    settings: securitySettings,
    exportDate: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `altrum-coins-data-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);

  showToast("Dados baixados com sucesso!", "success");
}

// ========== MODAL DE EXCLUSÃO DE CONTA ==========

function handleDeleteAccount() {
  showDeleteAccountModal();
}

function showDeleteAccountModal() {
  const modal = document.getElementById("confirm-modal");
  const modalBody = modal.querySelector(".modal-body");

  modalBody.innerHTML = `
    <div class="delete-account-form">
      <div class="warning-box">
        <i class="fas fa-exclamation-triangle"></i>
        <p><strong>⚠️ ATENÇÃO: Esta ação é irreversível!</strong></p>
        <p>Todos os seus dados serão permanentemente excluídos:</p>
        <ul>
          <li>✗ Perfil e informações pessoais</li>
          <li>✗ Saldo de moedas</li>
          <li>✗ Histórico de doações</li>
          <li>✗ Notificações</li>
          <li>✗ Estatísticas e conquistas</li>
        </ul>
      </div>

      <div class="form-group">
        <label for="delete-password">
          <i class="fas fa-lock"></i> Digite sua senha para confirmar
        </label>
        <input 
          type="password" 
          id="delete-password" 
          class="form-input" 
          placeholder="Senha"
          required
          autocomplete="current-password"
        />
      </div>

      <div class="form-group">
        <label for="delete-confirmation">
          Digite exatamente: <strong>EXCLUIR MINHA CONTA</strong>
        </label>
        <input 
          type="text" 
          id="delete-confirmation" 
          class="form-input" 
          placeholder="EXCLUIR MINHA CONTA"
          required
          autocomplete="off"
        />
      </div>

      <div id="delete-error" class="error-message" style="display: none;"></div>
    </div>
  `;

  const modalTitle = document.getElementById("modal-title");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  if (modalTitle) {
    modalTitle.textContent = "Excluir Conta Permanentemente";
  }

  if (confirmBtn) {
    confirmBtn.textContent = "Excluir Conta";
    confirmBtn.className = "btn-delete-account"; // Classe específica para evitar conflitos

    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener("click", async () => {
      await processAccountDeletion();
    });
  }

  if (cancelBtn) {
    cancelBtn.textContent = "Cancelar";
  }

  modal.classList.add("show");

  setTimeout(() => {
    document.getElementById("delete-password")?.focus();
  }, 300);
}

// ========== PROCESSAR EXCLUSÃO DA CONTA ==========
async function processAccountDeletion() {
  const passwordInput = document.getElementById("delete-password");
  const confirmationInput = document.getElementById("delete-confirmation");
  const confirmBtn = document.getElementById("modal-confirm");

  const password = passwordInput?.value?.trim();
  const confirmation = confirmationInput?.value?.trim();

  if (!password) {
    showDeleteError("Por favor, digite sua senha");
    return;
  }

  if (confirmation !== "EXCLUIR MINHA CONTA") {
    showDeleteError('Digite exatamente: "EXCLUIR MINHA CONTA"');
    return;
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
  }

  try {
    let token = null;

    const possibleKeys = ["accessToken", "token", "authToken", "jwt"];
    for (const key of possibleKeys) {
      token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        // console.log(`✅ Token encontrado na chave: ${key}`);
        break;
      }
    }

    if (!token && typeof Auth !== "undefined") {
      try {
        token = Auth.getToken();
        // console.log(
        //   "📍 Token via Auth.getToken():",
        //   token ? "✅ Encontrado" : "❌ Não encontrado"
        // );
      } catch (e) {
        console.warn("⚠️ Erro ao obter token via Auth:", e);
      }
    }

    if (!token) {
      console.error("❌ Token não encontrado em nenhum lugar!");
      // console.log("🔍 Debug - localStorage:", localStorage);
      // console.log("🔍 Debug - sessionStorage:", sessionStorage);

      showDeleteError("Sessão não encontrada. Faça login novamente.");

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);

      return;
    }

    // console.log("✅ Token encontrado, fazendo requisição...");
    // console.log("📡 URL da API:", `${API_BASE_URL}/users/account`);

    const response = await fetch(`${API_BASE_URL}/users/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: password,
        confirmation: confirmation,
      }),
    });

    // console.log("📥 Resposta da API:", response.status, response.statusText);

    const data = await response.json();
    // console.log("📦 Dados retornados:", data);

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir conta");
    }

    // console.log("✅ Conta excluída com sucesso:", data);

    hideModal();

    showToast("Conta excluída com sucesso. Até logo! 👋", "success");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // console.log("🧹 Dados locais limpos");

    window.location.href = "/index.html";
  } catch (error) {
    console.error("❌ Erro ao excluir conta:", error);
    console.error("📋 Stack trace:", error.stack);

    let errorMessage = error.message;

    if (errorMessage.includes("Senha incorreta")) {
      errorMessage = "Senha incorreta. Tente novamente.";
    } else if (errorMessage.includes("Confirmação incorreta")) {
      errorMessage = 'Digite exatamente: "EXCLUIR MINHA CONTA"';
    } else if (errorMessage.includes("Token") || errorMessage.includes("401")) {
      errorMessage = "Sessão expirada. Faça login novamente.";
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    } else if (
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Failed to fetch")
    ) {
      errorMessage =
        "Erro de conexão. Verifique sua internet e tente novamente.";
    } else if (errorMessage.includes("404")) {
      errorMessage =
        "Endpoint não encontrado. Verifique a configuração da API.";
    }

    showDeleteError(errorMessage);

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = "Excluir Conta";
    }
  }
}

// ========== EXIBIR ERRO NO MODAL ==========
function showDeleteError(message) {
  const errorDiv = document.getElementById("delete-error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";

    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }
}

// ========== HANDLER PRINCIPAL DE EXCLUSÃO ==========
function handleDeleteAccount() {
  showDeleteAccountModal();
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function setupModal() {
  const modal = document.getElementById("confirm-modal");
  const cancelBtn = document.getElementById("modal-cancel");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", hideModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
  }
}

function showConfirmModal(title, message, onConfirm, isDanger = false) {
  const modal = document.getElementById("confirm-modal");

  // Resetar modal antes de usar
  resetModalToDefault();

  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const confirmBtn = document.getElementById("modal-confirm");
  const modalIcon = document.querySelector(".modal-icon");

  if (modalTitle) modalTitle.textContent = title;
  if (modalMessage) modalMessage.textContent = message;

  if (confirmBtn) {
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    if (isDanger) {
      newBtn.className = "btn-primary";
      newBtn.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a24)";
      newBtn.textContent = "Sim, Excluir";
      if (modalIcon) {
        modalIcon.style.background =
          "linear-gradient(135deg, #ff6b6b, #ee5a24)";
      }
    } else {
      newBtn.className = "btn-primary";
      newBtn.style.background = "linear-gradient(135deg, #00d4ff, #0099cc)";
      newBtn.textContent = "Confirmar";
      if (modalIcon) {
        modalIcon.style.background =
          "linear-gradient(135deg, #ffd700, #ffaa00)";
      }
    }

    newBtn.addEventListener("click", () => {
      hideModal();
      if (onConfirm) onConfirm();
    });
  }

  if (modal) {
    modal.classList.add("show");
  }
}

function hideModal() {
  const modal = document.getElementById("confirm-modal");
  if (modal) {
    modal.classList.remove("show");

    // Resetar modal para estado original após fechar
    setTimeout(() => {
      resetModalToDefault();
    }, 300);
  }
}

function resetModalToDefault() {
  const modal = document.getElementById("confirm-modal");
  const modalBody = modal.querySelector(".modal-body");
  const modalTitle = document.getElementById("modal-title");
  const confirmBtn = document.getElementById("modal-confirm");
  const modalIcon = document.querySelector(".modal-icon");

  // Restaurar conteúdo padrão do body
  if (modalBody) {
    modalBody.innerHTML =
      '<p id="modal-message" class="modal-message">Tem certeza que deseja continuar?</p>';
  }

  // Restaurar título padrão
  if (modalTitle) {
    modalTitle.textContent = "Confirmar Ação";
  }

  // Restaurar botão de confirmação
  if (confirmBtn) {
    confirmBtn.className = "btn-primary";
    confirmBtn.textContent = "Confirmar";
    confirmBtn.disabled = false;
    confirmBtn.style.background = "";

    // Remover todos os event listeners clonando o botão
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  }

  // Restaurar ícone padrão
  if (modalIcon) {
    modalIcon.style.background = "";
    modalIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
  }
}

// ========== TOAST DE NOTIFICAÇÃO ==========
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = toast.querySelector(".toast-icon i");

  if (!toast) return;

  toast.className = `toast ${type}`;

  if (toastIcon) {
    toastIcon.className =
      type === "error"
        ? "fas fa-times-circle"
        : type === "warning"
        ? "fas fa-exclamation-triangle"
        : "fas fa-check-circle";
  }

  if (toastMessage) {
    toastMessage.textContent = message;
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ========== BOTÃO VOLTAR ==========
function setupBackButton() {
  const backBtn = document.getElementById("go-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (document.referrer) {
        window.history.back();
      } else {
        window.location.href = "../profile/html/index.html";
      }
    });
  }
}

// ========== FUNÇÕES DE DEBUG ==========
function debugSecurity() {
  // console.log("🔧 DEBUG - Estado de Segurança:");
  // console.log("Settings:", securitySettings);
  // console.log("SessionStorage:", sessionStorage.getItem("securitySettings"));
}

// Expor funções globalmente
if (typeof window !== "undefined") {
  window.securitySettings = securitySettings;
  window.debugSecurity = debugSecurity;
  window.showToast = showToast;
  window.calculateSecurityScore = calculateSecurityScore;
  window.handleLogoutSession = handleLogoutSession;
}

// ========== INTEGRAÇÃO COM API ==========
async function syncSettingsWithAPI() {
  try {
    const token = Auth?.getToken();
    if (!token) {
      console.warn("⚠️ Token não encontrado");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/user/security-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(securitySettings),
    });

    if (response.ok) {
      // console.log("✅ Configurações sincronizadas com API");
    }
  } catch (error) {
    console.error("❌ Erro ao sincronizar com API:", error);
  }
}

// ========== DETECÇÃO DE MUDANÇAS NÃO SALVAS ==========
let hasUnsavedChanges = false;

function markAsChanged() {
  hasUnsavedChanges = true;
  const saveBtn = document.getElementById("save-all");
  if (saveBtn) {
    saveBtn.style.opacity = "1";
  }
}

function markAsSaved() {
  hasUnsavedChanges = false;
  const saveBtn = document.getElementById("save-all");
  if (saveBtn) {
    saveBtn.style.opacity = "0";
  }
}

window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});

// ========== ANIMAÇÕES DE ENTRADA ==========
function animateSecurityCards() {
  const cards = document.querySelectorAll(
    ".setting-card, .session-card, .data-card"
  );

  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease";

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 50 + 200);
  });
}

setTimeout(animateSecurityCards, 100);

// ========== VERIFICAÇÃO DE SEGURANÇA PERIÓDICA ==========
function startSecurityMonitoring() {
  setInterval(() => {
    checkSecurityStatus();
  }, 5 * 60 * 1000);
}

function checkSecurityStatus() {
  const recommendations = [];

  if (securitySettings.publicProfile) {
    recommendations.push("Considere tornar seu perfil privado");
  }

  if (securitySettings.publicDonationHistory) {
    recommendations.push("Seu histórico de doações está público");
  }

  if (securitySettings.showRanking) {
    recommendations.push("Você está visível nos rankings públicos");
  }

  if (recommendations.length > 0) {
    console.log("🔒 Recomendações de segurança:", recommendations);
  }
}

startSecurityMonitoring();

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideModal();
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    if (hasUnsavedChanges) {
      saveSecuritySettings();
      markAsSaved();
      showToast("Configurações salvas!", "success");
    }
  }
});

// ========== VALIDAÇÃO DE SESSÃO ==========
// function validateSession() {
//   try {
//     const token = Auth?.getToken();
//     const userData = Auth?.getUserData();

//     if (!token || !userData) {
//       console.warn("⚠️ Sessão inválida - redirecionando para login");
//       setTimeout(() => {
//         window.location.href = "/index.html";
//       }, 1000);
//       return false;
//     }

//     console.log("✅ Sessão válida");
//     return true;
//   } catch (error) {
//     console.error("❌ Erro ao validar sessão:", error);
//     return false;
//   }
// }

// // Validar sessão ao carregar
// validateSession();

// ========== EXPORTAR RELATÓRIO DE SEGURANÇA ==========
function generateSecurityReport() {
  const report = {
    date: new Date().toISOString(),
    securityScore: calculateSecurityScoreValue(),
    settings: securitySettings,
    recommendations: [],
    activeSessions: 3,
    lastPasswordChange: "há 30 dias",
  };

  if (securitySettings.publicProfile) {
    report.recommendations.push({
      priority: "medium",
      message: "Considere tornar seu perfil privado",
    });
  }

  if (securitySettings.publicDonationHistory) {
    report.recommendations.push({
      priority: "medium",
      message: "Seu histórico de doações está público",
    });
  }

  if (securitySettings.showRanking) {
    report.recommendations.push({
      priority: "low",
      message: "Você está visível nos rankings",
    });
  }

  return report;
}

function calculateSecurityScoreValue() {
  let score = 70;
  if (!securitySettings.publicProfile) score += 10;
  if (!securitySettings.showRanking) score += 10;
  if (!securitySettings.publicDonationHistory) score += 10;
  return score;
}

// ========== LOGS DE AUDITORIA ==========
function logSecurityEvent(eventType, details) {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    details: details,
    userAgent: navigator.userAgent,
  };

  console.log("📝 Evento de segurança:", event);
}

// ========== DETECÇÃO DE DISPOSITIVO ==========
function detectDevice() {
  const ua = navigator.userAgent;
  let device = "Desktop";

  if (/Android/i.test(ua)) {
    device = "Android";
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    device = "iOS";
  } else if (/Windows/i.test(ua)) {
    device = "Windows";
  } else if (/Mac/i.test(ua)) {
    device = "Mac";
  } else if (/Linux/i.test(ua)) {
    device = "Linux";
  }

  // console.log("📱 Dispositivo detectado:", device);
  return device;
}

// ========== VERIFICAR SUPORTE A BIOMETRIA ==========
async function checkBiometricSupport() {
  if ("credentials" in navigator && "PublicKeyCredential" in window) {
    try {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

      if (!available) {
        const biometricToggle = document.getElementById("toggle-biometric");
        const biometricCard = biometricToggle?.closest(".setting-card");

        if (biometricCard) {
          biometricCard.style.opacity = "0.5";
          const description = biometricCard.querySelector(
            ".setting-description"
          );
          if (description) {
            description.textContent = "Não disponível neste dispositivo";
          }
          biometricToggle.disabled = true;
        }
      }

      // console.log(
      //   "🔐 Suporte biométrico:",
      //   available ? "Disponível" : "Não disponível"
      // );
    } catch (error) {
      console.error("Erro ao verificar biometria:", error);
    }
  }
}

checkBiometricSupport();

// ========== COPIAR LOGS PARA DEBUG ==========
function copySecurityLogs() {
  const logs = {
    settings: securitySettings,
    device: detectDevice(),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    securityScore: calculateSecurityScoreValue(),
    report: generateSecurityReport(),
  };

  const logsText = JSON.stringify(logs, null, 2);

  navigator.clipboard
    .writeText(logsText)
    .then(() => {
      showToast("Logs copiados para área de transferência", "success");
    })
    .catch(() => {
      // console.log("Logs:", logsText);
      showToast("Logs exibidos no console", "success");
    });
}

if (typeof window !== "undefined") {
  window.copySecurityLogs = copySecurityLogs;
  window.generateSecurityReport = generateSecurityReport;
  window.detectDevice = detectDevice;
}

// ========== DARK MODE AUTO-DETECT ==========
function checkDarkMode() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    // console.log("🌙 Dark mode detectado");
  }
}

checkDarkMode();

// ========== PERFORMANCE MONITORING ==========
if ("performance" in window) {
  window.addEventListener("load", () => {
    const perfData = performance.getEntriesByType("navigation")[0];
    if (perfData) {
      // console.log(
      //   `⚡ Página carregada em ${Math.round(
      //     perfData.loadEventEnd - perfData.fetchStart
      //   )}ms`
      // );
    }
  });
}

// ========== MENSAGEM DE BOAS-VINDAS NO CONSOLE ==========
// console.log(`
// 🔒 Sistema de Segurança - Altrum Coins
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Página inicializada com sucesso
// 📱 Dispositivo: ${detectDevice()}
// 🔐 Score de segurança: ${calculateSecurityScoreValue()}/100

// 🛠️ Comandos de Debug Disponíveis:
//    • debugSecurity() - Ver estado atual
//    • copySecurityLogs() - Copiar logs
//    • generateSecurityReport() - Gerar relatório
//    • showToast(msg, type) - Testar notificações
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// `);

// ========== EXPORTS ==========
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    securitySettings,
    saveSecuritySettings,
    calculateSecurityScore,
    showToast,
    generateSecurityReport,
  };
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
