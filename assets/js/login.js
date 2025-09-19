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

// Mostrar loader pós-login antes de redirecionar
function showPostLoginLoader() {
  const loader = document.getElementById("postLoginLoader");
  const phoneContainer = document.querySelector(".phone-container");

  if (phoneContainer) {
    // Suavizar desaparecimento
    phoneContainer.style.opacity = "0";
    setTimeout(() => {
      phoneContainer.style.display = "none";
    }, 500); // tempo da transição do CSS
  }

  if (loader) {
    loader.style.display = "flex";
    setTimeout(() => {
      loader.style.opacity = "1";
    }, 50); // pequeno delay para aplicar transição
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

// 🔧 VERSÃO LIMPA E CORRIGIDA DA FUNÇÃO DE LOGIN
async function handleLogin(e) {
  e.preventDefault();
  console.log("📝 Formulário de login enviado");

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
    console.log("🌐 Enviando requisição para login...");

    // 🔧 CORREÇÃO: Preservar foto de perfil ANTES do login
    let existingProfilePhoto = null;
    const existingUserData = Auth.getUserData();
    if (existingUserData && existingUserData.profilePhotoUrl) {
      existingProfilePhoto = existingUserData.profilePhotoUrl;
      console.log(
        "📸 Foto de perfil existente preservada:",
        existingProfilePhoto
      );
    }

    // Fazer login usando o módulo Auth
    const result = await Auth.login(email, password, rememberMe.checked);

    if (result.success) {
      console.log("✅ Login bem-sucedido!");

      // 🔧 CORREÇÃO: Restaurar foto de perfil após login se ela existir
      if (existingProfilePhoto) {
        console.log("🔄 Restaurando foto de perfil após login...");
        Auth.updateProfilePhoto(existingProfilePhoto);
      }

      // Atualizar botão para sucesso
      loginButton.innerHTML =
        '<i class="fas fa-check" style="margin-right: 8px;"></i>Sucesso!';
      loginButton.style.background =
        "linear-gradient(135deg, #51cf66, #69db7c)";

      // Mostrar feedback com saldo
      const userData = Auth.getUserData();
      const userBalance = userData?.balance || userData?.coins || 0;
      showSuccessFeedback(userBalance);

      // 🔧 CORREÇÃO: NÃO buscar perfil após login para evitar sobrescrever dados
      // await Auth.getProfile(); // REMOVIDO - causava perda da foto

      // Redirecionar para o dashboard
      console.log("🔄 Mostrando loader pós-login...");
      showPostLoginLoader();

      setTimeout(() => {
        window.location.href = CONFIG.UI.pages.dashboard;
      }, CONFIG.UI.redirectDelay);
    } else {
      throw new Error("Erro inesperado no login");
    }
  } catch (err) {
    console.error("❌ Erro no login:", err);

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

console.log(
  "✅ Login.js carregado - versão corrigida para preservar foto de perfil"
);

// Loader inicial - esconde após carregar a página
window.addEventListener("load", () => {
  const initialLoader = document.getElementById("initialLoader");
  if (initialLoader) {
    setTimeout(() => {
      initialLoader.style.opacity = "0";
      initialLoader.style.transition = "opacity 0.5s ease";
      setTimeout(() => initialLoader.remove(), 500);
    }, 600); // pequeno delay para suavizar
  }
});
