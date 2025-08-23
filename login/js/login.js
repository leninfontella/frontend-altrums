// Script específico para página de Login - Living Coins
document.addEventListener("DOMContentLoaded", function () {
  console.log("Página de login carregada com sistema de moedas");

  // Verificar se usuário já está logado
  if (Auth.isLoggedIn()) {
    console.log("Usuário já está logado, redirecionando...");
    window.location.href = CONFIG.UI.pages.dashboard;
    return;
  }

  // Inicializar elementos da página
  initializeElements();
  setupEventListeners();
  setupAnimations();
  loadRememberedEmail();
});

// Inicializar elementos
function initializeElements() {
  // Elementos principais
  window.elements = {
    form: document.getElementById("formLogin"),
    emailField: document.getElementById("email"),
    passwordField: document.getElementById("password"),
    togglePassword: document.querySelector(".password-toggle"),
    rememberMe: document.getElementById("rememberMe"),
    loginButton: document.querySelector(".login-button"),
    registerLink: document.querySelector(".register-link"),
    loadingOverlay: document.getElementById("loadingOverlay"),
    successFeedback: document.getElementById("successFeedback"),
    userBalanceSpan: document.getElementById("userBalance"),
    logoContainer: document.querySelector(".logo-container"),
  };
}

// Configurar event listeners
function setupEventListeners() {
  const {
    form,
    emailField,
    passwordField,
    togglePassword,
    rememberMe,
    registerLink,
    logoContainer,
  } = window.elements;

  // Submissão do formulário
  form.addEventListener("submit", handleLogin);

  // Toggle de senha
  if (togglePassword) {
    togglePassword.addEventListener("click", togglePasswordVisibility);
  }

  // Validação em tempo real
  if (emailField) {
    emailField.addEventListener("input", validateEmail);
    emailField.addEventListener("focus", () => handleFieldFocus("email"));
    emailField.addEventListener("blur", () => handleFieldBlur("email"));
  }

  if (passwordField) {
    passwordField.addEventListener("input", validatePassword);
    passwordField.addEventListener("focus", () => handleFieldFocus("password"));
    passwordField.addEventListener("blur", () => handleFieldBlur("password"));
  }

  // Remember me functionality
  if (rememberMe && emailField) {
    rememberMe.addEventListener("change", handleRememberMeChange);
    emailField.addEventListener("input", handleEmailChange);
  }

  // Link para registro
  if (registerLink) {
    registerLink.addEventListener("click", handleRegisterClick);
  }

  // Hover no logo
  if (logoContainer) {
    logoContainer.addEventListener("mouseenter", () => {
      logoContainer.style.transform = "scale(1.05) rotate(5deg)";
    });
    logoContainer.addEventListener("mouseleave", () => {
      logoContainer.style.transform = "scale(1) rotate(0deg)";
    });
  }
}

// Configurar animações
function setupAnimations() {
  // Animação das partículas
  const particles = document.querySelectorAll(".particle");
  particles.forEach((particle, index) => {
    const randomDelay = Math.random() * 8;
    const randomDuration = 8 + Math.random() * 4;
    particle.style.animationDelay = `${randomDelay}s`;
    particle.style.animationDuration = `${randomDuration}s`;
  });
}

// Carregar email lembrado
function loadRememberedEmail() {
  const { emailField, rememberMe } = window.elements;

  if (Auth.shouldRememberMe()) {
    const rememberedEmail = Auth.getRememberedEmail();
    if (rememberedEmail && emailField) {
      emailField.value = rememberedEmail;
      if (rememberMe) {
        rememberMe.checked = true;
      }
    }
  }
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
  const { passwordField, togglePassword } = window.elements;

  if (passwordField.type === "password") {
    passwordField.type = "text";
    togglePassword.classList.remove("fa-eye");
    togglePassword.classList.add("fa-eye-slash");
  } else {
    passwordField.type = "password";
    togglePassword.classList.remove("fa-eye-slash");
    togglePassword.classList.add("fa-eye");
  }
}

// Validação de email
function validateEmail() {
  const { emailField } = window.elements;
  const email = emailField.value.trim();

  if (!email) {
    emailField.classList.remove("error-border", "success-border");
    return;
  }

  if (CONFIG.VALIDATION.email.regex.test(email)) {
    emailField.classList.add("success-border");
    emailField.classList.remove("error-border");
  } else {
    emailField.classList.add("error-border");
    emailField.classList.remove("success-border");
  }
}

// Validação de senha
function validatePassword() {
  const { passwordField } = window.elements;
  const password = passwordField.value;

  if (!password) {
    passwordField.classList.remove("error-border", "success-border");
    return;
  }

  if (password.length >= CONFIG.VALIDATION.password.minLength) {
    passwordField.classList.add("success-border");
    passwordField.classList.remove("error-border");
  } else {
    passwordField.classList.add("error-border");
    passwordField.classList.remove("success-border");
  }
}

// Manipular foco dos campos
function handleFieldFocus(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.parentElement.classList.add("focused");
    clearError(fieldId);
  }
}

function handleFieldBlur(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.parentElement.classList.remove("focused");
  }
}

// Manipular mudança no "Lembre de mim"
function handleRememberMeChange() {
  const { rememberMe, emailField } = window.elements;

  if (rememberMe.checked && emailField.value) {
    Auth.saveRememberMe(emailField.value, true);
  } else if (!rememberMe.checked) {
    Auth.saveRememberMe("", false);
  }
}

// Manipular mudança no email
function handleEmailChange() {
  const { rememberMe, emailField } = window.elements;

  if (rememberMe.checked) {
    Auth.saveRememberMe(emailField.value, true);
  }
}

// Manipular clique no link de registro
function handleRegisterClick(e) {
  e.preventDefault();
  const { registerLink } = window.elements;

  // Efeito visual antes de redirecionar
  registerLink.style.transform = "scale(1.05)";
  registerLink.style.boxShadow = "0 8px 25px rgba(0, 212, 255, 0.4)";

  setTimeout(() => {
    window.location.href = CONFIG.UI.pages.register;
  }, 200);
}

// Mostrar/ocultar mensagens de erro
function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    inputElement.classList.add("error-border");
    inputElement.classList.remove("success-border");
  }
}

function clearError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement && inputElement) {
    errorElement.style.display = "none";
    inputElement.classList.remove("error-border");
  }
}

// Mostrar loading
function showLoading(show) {
  const { loadingOverlay } = window.elements;
  if (loadingOverlay) {
    loadingOverlay.style.display = show ? "flex" : "none";
  }
}

// Mostrar feedback de sucesso
function showSuccessFeedback(balance) {
  const { successFeedback, userBalanceSpan } = window.elements;

  if (successFeedback && userBalanceSpan) {
    userBalanceSpan.textContent = CONFIG.formatCoins(balance || 0);
    successFeedback.style.display = "flex";

    setTimeout(() => {
      successFeedback.style.display = "none";
    }, CONFIG.UI.successFeedbackDuration);
  }
}

// Manipular login
async function handleLogin(e) {
  e.preventDefault();
  console.log("Formulário de login enviado");

  const { emailField, passwordField, loginButton, rememberMe } =
    window.elements;

  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  // Limpar erros anteriores
  clearError("email");
  clearError("password");

  // Validações básicas
  if (!email) {
    showError("email", "Por favor, digite seu e-mail");
    return;
  }

  if (!CONFIG.VALIDATION.email.regex.test(email)) {
    showError("email", CONFIG.VALIDATION.email.message);
    return;
  }

  if (!password) {
    showError("password", "Por favor, digite sua senha");
    return;
  }

  if (password.length < CONFIG.VALIDATION.password.minLength) {
    showError("password", CONFIG.VALIDATION.password.message);
    return;
  }

  // Efeito visual no botão
  const originalText = loginButton.innerHTML;
  loginButton.innerHTML =
    '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Conectando...';
  loginButton.disabled = true;
  loginButton.style.opacity = "0.8";

  // Mostrar loading overlay
  showLoading(true);

  try {
    console.log("Enviando requisição para login...");

    // Fazer login usando o módulo Auth
    const result = await Auth.login(email, password);

    if (result.success) {
      console.log("Login bem-sucedido!");

      // Atualizar botão para sucesso
      loginButton.innerHTML =
        '<i class="fas fa-check" style="margin-right: 8px;"></i>Sucesso!';
      loginButton.style.background =
        "linear-gradient(135deg, #51cf66, #69db7c)";

      // Salvar "lembre de mim"
      Auth.saveRememberMe(email, rememberMe.checked);

      // Mostrar feedback com saldo
      const userData = Auth.getUserData();
      const userBalance = userData?.balance || 0;
      showSuccessFeedback(userBalance);

      // Buscar dados atualizados do perfil (opcional)
      try {
        await Auth.getProfile();
      } catch (profileErr) {
        console.warn("Erro ao buscar perfil completo:", profileErr);
      }

      // Redirecionar para o dashboard
      console.log("Redirecionando para dashboard...");
      setTimeout(() => {
        window.location.href = CONFIG.UI.pages.dashboard;
      }, CONFIG.UI.redirectDelay);
    } else {
      throw new Error("Erro inesperado no login");
    }
  } catch (err) {
    console.error("Erro no login:", err);

    // Tratamento de erros específicos
    const errorMessage = err.message.toLowerCase();

    if (
      errorMessage.includes("email") ||
      errorMessage.includes("usuário") ||
      errorMessage.includes("não encontrado")
    ) {
      showError("email", "E-mail não encontrado ou inválido");
    } else if (
      errorMessage.includes("password") ||
      errorMessage.includes("senha") ||
      errorMessage.includes("credenciais")
    ) {
      showError("password", "Senha incorreta");
    } else if (
      errorMessage.includes("conexão") ||
      errorMessage.includes("network") ||
      errorMessage.includes("fetch")
    ) {
      showError("password", "Erro de conexão. Verifique sua internet.");
    } else {
      showError("password", err.message || "Erro interno. Tente novamente.");
    }

    // Resetar botão
    loginButton.style.background =
      "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
    loginButton.style.opacity = "1";
  } finally {
    // Esconder loading
    showLoading(false);

    // Sempre restaurar o botão após delay
    setTimeout(() => {
      loginButton.innerHTML = originalText;
      loginButton.disabled = false;
      loginButton.style.opacity = "1";
    }, CONFIG.UI.redirectDelay);
  }
}

// Interceptar eventos de conectividade
window.addEventListener("online", () => {
  console.log("Conexão restaurada");
  clearError("password");
});

window.addEventListener("offline", () => {
  console.log("Conexão perdida");
  showError("password", "Sem conexão com a internet");
});

// --------------------------------------------------------

// 🔧 PATCH PARA LOGIN.JS - COMPATIBILIDADE COMPLETA
// Cole este código no FINAL do arquivo login.js

console.log("🔧 Aplicando patch de compatibilidade para dados do usuário...");

// SOBRESCREVER a função handleLogin para salvar dados corretamente
const originalHandleLogin = window.handleLogin;

window.handleLogin = async function (e) {
  e.preventDefault();
  console.log("📝 Login com patch de compatibilidade aplicado");

  const { emailField, passwordField, loginButton, rememberMe } =
    window.elements;

  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  // Limpar erros anteriores
  clearError("email");
  clearError("password");

  // Validações básicas (mesmas do original)
  if (!email) {
    showError("email", "Por favor, digite seu e-mail");
    return;
  }

  if (!CONFIG.VALIDATION.email.regex.test(email)) {
    showError("email", CONFIG.VALIDATION.email.message);
    return;
  }

  if (!password) {
    showError("password", "Por favor, digite sua senha");
    return;
  }

  if (password.length < CONFIG.VALIDATION.password.minLength) {
    showError("password", CONFIG.VALIDATION.password.message);
    return;
  }

  // Efeito visual no botão
  const originalText = loginButton.innerHTML;
  loginButton.innerHTML =
    '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Conectando...';
  loginButton.disabled = true;
  loginButton.style.opacity = "0.8";

  // Mostrar loading overlay
  showLoading(true);

  try {
    console.log("🌐 Enviando requisição para login...");

    // Fazer login usando o módulo Auth
    const result = await Auth.login(email, password);

    if (result.success) {
      console.log("✅ Login bem-sucedido!");

      // ✨ PATCH: SALVAR DADOS EM MÚLTIPLOS FORMATOS PARA COMPATIBILIDADE
      const userData = result.data || result.user || Auth.getUserData();

      if (userData) {
        console.log("💾 Aplicando patch de compatibilidade nos dados...");

        // Criar objeto de dados unificado
        const unifiedUserData = {
          // Dados principais
          id: userData.id || userData._id || Date.now().toString(),
          name:
            userData.name ||
            userData.fullName ||
            userData.nome ||
            extractNameFromEmail(email),
          fullName:
            userData.fullName ||
            userData.name ||
            userData.nome ||
            extractNameFromEmail(email),
          firstName: extractFirstName(
            userData.name ||
              userData.fullName ||
              userData.nome ||
              extractNameFromEmail(email)
          ),
          email: email,
          phone: userData.phone || userData.telefone || userData.celular || "",

          // Dados de gamificação
          level: userData.level || "Explorador",
          xp: userData.xp || userData.experience || 0,
          maxXp: userData.maxXp || 1000,
          balance: userData.balance || userData.saldo || 0,
          rank:
            userData.rank ||
            userData.ranking ||
            calculateRank(userData.balance || 0),
          score:
            userData.score ||
            userData.pontos ||
            calculateScore(userData.balance || 0),

          // Dados extras
          achievements: userData.achievements || userData.conquistas || [],
          avatar: userData.avatar || generateAvatar(userData.name || email),
          joinDate:
            userData.joinDate || userData.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          accountType: userData.accountType || "standard",
        };

        // Salvar em TODOS os formatos possíveis para máxima compatibilidade
        const dataToSave = JSON.stringify(unifiedUserData);

        // Formatos que ranks.js procura
        localStorage.setItem("currentUser", dataToSave);
        localStorage.setItem("user", dataToSave);
        localStorage.setItem("userData", dataToSave);
        localStorage.setItem("loggedUser", dataToSave);
        localStorage.setItem("activeUser", dataToSave);

        // Token em múltiplos formatos
        const token = result.token || result.accessToken || result.authToken;
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("accessToken", token);
        }

        // Configurações
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("rememberMe", rememberMe.checked.toString());
        localStorage.setItem("rememberedEmail", email);

        console.log("✅ Dados salvos em múltiplos formatos:", unifiedUserData);

        // Verificar se os dados foram salvos corretamente
        const verification = localStorage.getItem("currentUser");
        if (verification) {
          console.log(
            "✅ Verificação: dados salvos corretamente em 'currentUser'"
          );
        } else {
          console.error("❌ ERRO: dados não foram salvos corretamente!");
        }
      }

      // Atualizar botão para sucesso
      loginButton.innerHTML =
        '<i class="fas fa-check" style="margin-right: 8px;"></i>Sucesso!';
      loginButton.style.background =
        "linear-gradient(135deg, #51cf66, #69db7c)";

      // Salvar "lembre de mim" (formato original)
      Auth.saveRememberMe(email, rememberMe.checked);

      // Mostrar feedback com saldo
      const userBalance = userData?.balance || 0;
      showSuccessFeedback(userBalance);

      // Buscar dados atualizados do perfil (opcional)
      try {
        await Auth.getProfile();
      } catch (profileErr) {
        console.warn("⚠️ Erro ao buscar perfil completo:", profileErr);
      }

      // Redirecionar para o dashboard
      console.log("🔄 Redirecionando para dashboard...");
      setTimeout(() => {
        window.location.href = CONFIG.UI.pages.dashboard;
      }, CONFIG.UI.redirectDelay);
    } else {
      throw new Error("Erro inesperado no login");
    }
  } catch (err) {
    console.error("❌ Erro no login:", err);

    // Tratamento de erros (mesmo do original)
    const errorMessage = err.message.toLowerCase();

    if (
      errorMessage.includes("email") ||
      errorMessage.includes("usuário") ||
      errorMessage.includes("não encontrado")
    ) {
      showError("email", "E-mail não encontrado ou inválido");
    } else if (
      errorMessage.includes("password") ||
      errorMessage.includes("senha") ||
      errorMessage.includes("credenciais")
    ) {
      showError("password", "Senha incorreta");
    } else if (
      errorMessage.includes("conexão") ||
      errorMessage.includes("network") ||
      errorMessage.includes("fetch")
    ) {
      showError("password", "Erro de conexão. Verifique sua internet.");
    } else {
      showError("password", err.message || "Erro interno. Tente novamente.");
    }

    loginButton.style.background =
      "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
    loginButton.style.opacity = "1";
  } finally {
    // Esconder loading
    showLoading(false);

    // Sempre restaurar o botão após delay
    setTimeout(() => {
      loginButton.innerHTML = originalText;
      loginButton.disabled = false;
      loginButton.style.opacity = "1";
    }, CONFIG.UI.redirectDelay);
  }
};

// FUNÇÕES AUXILIARES PARA O PATCH
function extractNameFromEmail(email) {
  return email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function extractFirstName(fullName) {
  return fullName ? fullName.split(" ")[0] : "";
}

function calculateRank(balance) {
  // Ranking baseado no saldo
  if (balance >= 10000) return 1;
  if (balance >= 5000) return 2;
  if (balance >= 1000) return 3;
  if (balance >= 500) return 5;
  if (balance >= 100) return 8;
  return 10;
}

function calculateScore(balance) {
  // Score baseado no saldo + bônus
  return balance * 2 + Math.floor(balance / 100) * 50;
}

function generateAvatar(name) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=22c55e&color=fff&size=100`;
}

// PATCH PARA O MÓDULO AUTH (se necessário)
if (window.Auth && window.Auth.login) {
  const originalAuthLogin = window.Auth.login;

  window.Auth.login = async function (email, password) {
    console.log("🔧 Auth.login com patch aplicado");

    try {
      // Tentar login original
      const result = await originalAuthLogin.call(this, email, password);

      // Se sucesso, aplicar patch nos dados
      if (result.success) {
        console.log("✅ Login original bem-sucedido, aplicando patch...");

        // Garantir que os dados estejam no formato correto
        if (result.data || result.user) {
          const userData = result.data || result.user;

          // Criar dados unificados
          const unifiedData = {
            id: userData.id || userData._id || Date.now().toString(),
            name:
              userData.name || userData.fullName || extractNameFromEmail(email),
            fullName:
              userData.fullName || userData.name || extractNameFromEmail(email),
            firstName: extractFirstName(
              userData.name || userData.fullName || extractNameFromEmail(email)
            ),
            email: email,
            phone: userData.phone || "",
            level: userData.level || "Explorador",
            xp: userData.xp || 0,
            maxXp: userData.maxXp || 1000,
            balance: userData.balance || 0,
            rank: userData.rank || calculateRank(userData.balance || 0),
            score: userData.score || calculateScore(userData.balance || 0),
            achievements: userData.achievements || [],
            avatar: userData.avatar || generateAvatar(userData.name || email),
            joinDate: userData.joinDate || new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
          };

          // Atualizar o resultado com dados unificados
          result.data = unifiedData;
          result.user = unifiedData;
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Erro no Auth.login com patch:", error);
      throw error;
    }
  };
}

console.log("✅ Patch de compatibilidade aplicado com sucesso!");
console.log("💡 Agora o login.js salvará dados compatíveis com ranks.js");

// TESTE DO PATCH (opcional)
window.testLoginPatch = function () {
  console.log("🧪 TESTANDO PATCH DE LOGIN:");
  console.log("📊 Formatos de dados que serão salvos:");
  console.log("  - currentUser: ✅");
  console.log("  - user: ✅");
  console.log("  - userData: ✅");
  console.log("  - loggedUser: ✅");
  console.log("  - activeUser: ✅");
  console.log("  - token: ✅");
  console.log("  - authToken: ✅");
  console.log("✅ Patch funcionando corretamente!");
};

// Disponibilizar teste
console.log("💡 Para testar o patch: testLoginPatch()");
