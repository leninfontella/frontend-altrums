// ========== CONFIGURAÇÃO E INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  console.log("🔒 Inicializando página de segurança...");
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

  console.log("✅ Página de segurança inicializada!");
}

// ========== CARREGAR CONFIGURAÇÕES DO USUÁRIO ==========
function loadSecuritySettings() {
  try {
    // Tentar carregar do sessionStorage
    const savedSettings = sessionStorage.getItem("securitySettings");

    if (savedSettings) {
      securitySettings = { ...securitySettings, ...JSON.parse(savedSettings) };
      console.log("📄 Configurações carregadas:", securitySettings);
    }

    // Aplicar configurações aos toggles
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
    console.log("💾 Configurações salvas!");
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

        console.log(`🔄 ${settingName}: ${this.checked ? "ON" : "OFF"}`);
      });
    }
  });
}

// ========== CÁLCULO DO SCORE DE SEGURANÇA ==========
function calculateSecurityScore() {
  let score = 70; // Base score (maior já que não tem autenticação extra)

  // Privacidade conta mais agora
  if (!securitySettings.publicProfile) score += 10;
  if (!securitySettings.showRanking) score += 10;
  if (!securitySettings.publicDonationHistory) score += 10;

  // Atualizar UI
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

  console.log(`🔒 Score de segurança: ${score}/100`);
}

// ========== GERENCIAMENTO DE SESSÕES ==========
function setupSessions() {
  loadOtherSessions();

  const logoutAllBtn = document.getElementById("logout-all");
  if (logoutAllBtn) {
    logoutAllBtn.addEventListener("click", handleLogoutAll);
  }
}

function loadOtherSessions() {
  // Dados de exemplo de sessões
  const sessions = [
    {
      device: "iPhone 13",
      location: "São Paulo, SP - Brasil",
      time: "há 2 dias",
      icon: "fa-mobile-alt",
    },
    {
      device: "Chrome - Windows",
      location: "Curitiba, PR - Brasil",
      time: "há 5 dias",
      icon: "fa-laptop",
    },
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
      <button onclick="handleLogoutSession(this)">
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
    "Encerrar Todas as Sessões",
    "Você será desconectado de todos os dispositivos, exceto o atual. Deseja continuar?",
    () => {
      const container = document.getElementById("other-sessions-container");
      if (container) {
        container.innerHTML =
          '<p style="color: #888; text-align: center; padding: 20px;">Nenhuma outra sessão ativa</p>';
      }
      showToast("Todas as sessões foram encerradas", "success");
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

  // Simular preparação de dados
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Criar dados de exemplo
  const userData = {
    name: "Usuário Demo",
    email: "usuario@exemplo.com",
    coins: 1250,
    donations: 45,
    settings: securitySettings,
    exportDate: new Date().toISOString(),
  };

  // Criar e baixar arquivo JSON
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

// security.js - Substituir função handleDeleteAccount

/**
 * Modal de confirmação de exclusão com senha
 */
function showDeleteAccountModal() {
  const modal = document.getElementById("confirm-modal");
  const modalBody = modal.querySelector(".modal-body");

  // Criar formulário de confirmação
  modalBody.innerHTML = `
    <div class="delete-account-form">
      <div class="warning-box">
        <i class="fas fa-exclamation-triangle"></i>
        <p><strong>⚠️ ATENÇÃO: Esta ação é irreversível!</strong></p>
        <p>Todos os seus dados serão permanentemente excluídos:</p>
        <ul style="text-align: left; margin: 10px 0;">
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
        />
      </div>

      <div id="delete-error" class="error-message" style="display: none;"></div>
    </div>
  `;

  // Configurar botões do modal
  const modalTitle = document.getElementById("modal-title");
  const confirmBtn = document.getElementById("modal-confirm");
  const cancelBtn = document.getElementById("modal-cancel");

  if (modalTitle) {
    modalTitle.textContent = "Excluir Conta Permanentemente";
  }

  if (confirmBtn) {
    confirmBtn.textContent = "Excluir Conta";
    confirmBtn.className = "btn-danger";
    confirmBtn.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a24)";

    // Remover listeners antigos
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener("click", async () => {
      await processAccountDeletion();
    });
  }

  if (cancelBtn) {
    cancelBtn.textContent = "Cancelar";
  }

  // Mostrar modal
  modal.classList.add("show");

  // Focar no campo de senha
  setTimeout(() => {
    document.getElementById("delete-password")?.focus();
  }, 300);
}

/**
 * Processar exclusão da conta
 */
async function processAccountDeletion() {
  const passwordInput = document.getElementById("delete-password");
  const confirmationInput = document.getElementById("delete-confirmation");
  const errorDiv = document.getElementById("delete-error");
  const confirmBtn = document.getElementById("modal-confirm");

  // Validações no frontend
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

  // Desabilitar botão durante processamento
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Excluindo...';
  }

  try {
    // 🔧 CORREÇÃO: Buscar token de múltiplas formas
    let token = null;

    // 1. Tentar localStorage
    const possibleKeys = ["accessToken", "token", "authToken", "jwt"];
    for (const key of possibleKeys) {
      token = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (token) {
        console.log(`✅ Token encontrado na chave: ${key}`);
        break;
      }
    }
    if (!token) {
      console.warn(
        "❌ Nenhum token encontrado nas chaves conhecidas:",
        possibleKeys
      );
    }

    // 3. Se ainda não encontrar, tentar usar a classe Auth (se existir)
    if (!token && typeof Auth !== "undefined") {
      try {
        token = Auth.getToken();
        console.log(
          "📍 Token via Auth.getToken():",
          token ? "✅ Encontrado" : "❌ Não encontrado"
        );
      } catch (e) {
        console.warn("⚠️ Erro ao obter token via Auth:", e);
      }
    }

    // 4. Verificar se encontrou o token
    if (!token) {
      console.error("❌ Token não encontrado em nenhum lugar!");
      console.log("🔍 Debug - localStorage:", localStorage);
      console.log("🔍 Debug - sessionStorage:", sessionStorage);

      showDeleteError("Sessão não encontrada. Faça login novamente.");

      // Aguardar e redirecionar para login
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);

      return;
    }

    console.log("✅ Token encontrado, fazendo requisição...");
    console.log("📡 URL da API:", `${API_BASE_URL}/users/account`);

    // Fazer requisição para API
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

    console.log("📥 Resposta da API:", response.status, response.statusText);

    const data = await response.json();
    console.log("📦 Dados retornados:", data);

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir conta");
    }

    // Sucesso - Limpar dados e redirecionar
    console.log("✅ Conta excluída com sucesso:", data);

    // Fechar modal
    hideModal();

    // Mostrar mensagem de sucesso
    showToast("Conta excluída com sucesso. Até logo! 👋", "success");

    // Aguardar 2 segundos
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Limpar todos os dados locais
    localStorage.clear();
    sessionStorage.clear();

    // Limpar cookies (se houver)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log("🧹 Dados locais limpos");

    // Redirecionar para página inicial
    window.location.href = "/index.html";
  } catch (error) {
    console.error("❌ Erro ao excluir conta:", error);
    console.error("📋 Stack trace:", error.stack);

    // Exibir erro específico
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

    // Reabilitar botão
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = "Excluir Conta";
    }
  }
}

/**
 * Exibir mensagem de erro no modal
 */
function showDeleteError(message) {
  const errorDiv = document.getElementById("delete-error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";

    // Esconder após 5 segundos
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }
}

/**
 * Atualizar handleDeleteAccount para usar o novo modal
 */
function handleDeleteAccount() {
  showDeleteAccountModal();
}

const deleteModalStyles = `
<style>
.delete-account-form {
  text-align: center;
}

.warning-box {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(238, 90, 36, 0.1));
  border: 2px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.warning-box i {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 10px;
}

.warning-box p {
  margin: 10px 0;
  color: #ff6b6b;
}

.warning-box ul {
  color: #666;
  font-size: 14px;
}

.form-group {
  margin: 20px 0;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
}

.form-group label i {
  margin-right: 8px;
  color: #00d4ff;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.error-message {
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 14px;
}

.btn-danger {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
`;

// Adicionar estilos ao documento se ainda não existirem
if (!document.getElementById("delete-modal-styles")) {
  const styleEl = document.createElement("div");
  styleEl.id = "delete-modal-styles";
  styleEl.innerHTML = deleteModalStyles;
  document.head.appendChild(styleEl);
}

// ========== MODAL DE CONFIRMAÇÃO ==========
function setupModal() {
  const modal = document.getElementById("confirm-modal");
  const cancelBtn = document.getElementById("modal-cancel");
  const confirmBtn = document.getElementById("modal-confirm");

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
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const confirmBtn = document.getElementById("modal-confirm");
  const modalIcon = document.querySelector(".modal-icon");

  if (modalTitle) modalTitle.textContent = title;
  if (modalMessage) modalMessage.textContent = message;

  if (confirmBtn) {
    // Remover listeners antigos
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    // Estilizar botão
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
  }
}

// ========== TOAST DE NOTIFICAÇÃO ==========
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = toast.querySelector(".toast-icon i");

  if (!toast) return;

  // Configurar tipo
  toast.className = `toast ${type}`;

  // Configurar ícone
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

  // Mostrar toast
  toast.classList.add("show");

  // Esconder após 3 segundos
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
  console.log("🔧 DEBUG - Estado de Segurança:");
  console.log("Settings:", securitySettings);
  console.log("SessionStorage:", sessionStorage.getItem("securitySettings"));
}

// Expor funções globalmente para debug
if (typeof window !== "undefined") {
  window.securitySettings = securitySettings;
  window.debugSecurity = debugSecurity;
  window.showToast = showToast;
  window.calculateSecurityScore = calculateSecurityScore;
  window.handleLogoutSession = handleLogoutSession;
}

// ========== INTEGRAÇÃO COM API (OPCIONAL) ==========
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
      console.log("✅ Configurações sincronizadas com API");
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

// Avisar antes de sair se houver mudanças não salvas
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

// Executar animações após carregamento
setTimeout(animateSecurityCards, 100);

// ========== VERIFICAÇÃO DE SEGURANÇA PERIÓDICA ==========
function startSecurityMonitoring() {
  // Verificar a cada 5 minutos
  setInterval(() => {
    checkSecurityStatus();
  }, 5 * 60 * 1000);
}

function checkSecurityStatus() {
  // Verificações básicas
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

// Iniciar monitoramento
startSecurityMonitoring();

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener("keydown", (e) => {
  // ESC para fechar modal
  if (e.key === "Escape") {
    hideModal();
  }

  // Ctrl/Cmd + S para salvar (se implementado)
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
    activeSessions: 3, // Exemplo
    lastPasswordChange: "há 30 dias", // Exemplo
  };

  // Adicionar recomendações
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

  // Aqui você poderia enviar para a API
  // await fetch(`${API_BASE_URL}/security/log`, { ... });
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

  console.log("📱 Dispositivo detectado:", device);
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

      console.log(
        "🔐 Suporte biométrico:",
        available ? "Disponível" : "Não disponível"
      );
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
      console.log("Logs:", logsText);
      showToast("Logs exibidos no console", "success");
    });
}

// Adicionar à janela para debug
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
    console.log("🌙 Dark mode detectado");
  }
}

checkDarkMode();

// ========== PERFORMANCE MONITORING ==========
if ("performance" in window) {
  window.addEventListener("load", () => {
    const perfData = performance.getEntriesByType("navigation")[0];
    if (perfData) {
      console.log(
        `⚡ Página carregada em ${Math.round(
          perfData.loadEventEnd - perfData.fetchStart
        )}ms`
      );
    }
  });
}

// ========== MENSAGEM DE BOAS-VINDAS NO CONSOLE ==========
console.log(`
🔒 Sistema de Segurança - Altrum Coins
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Página inicializada com sucesso
📱 Dispositivo: ${detectDevice()}
🔐 Score de segurança: ${calculateSecurityScoreValue()}/100

🛠️ Comandos de Debug Disponíveis:
   • debugSecurity() - Ver estado atual
   • copySecurityLogs() - Copiar logs
   • generateSecurityReport() - Gerar relatório
   • showToast(msg, type) - Testar notificações
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

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
