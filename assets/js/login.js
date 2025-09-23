// Script específico para página de Login Mobile - Living Coins
document.addEventListener("DOMContentLoaded", function () {
  console.log("Página de login mobile carregada com sistema de moedas");

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
  setupMobileOptimizations();
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
    screen: document.querySelector(".screen"),
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
    togglePassword.addEventListener("touchstart", (e) => {
      e.preventDefault();
      togglePasswordVisibility();
    });
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

  // Hover no logo (apenas para desktop)
  if (logoContainer && !isMobileDevice()) {
    logoContainer.addEventListener("mouseenter", () => {
      logoContainer.style.transform = "scale(1.05) rotate(5deg)";
    });
    logoContainer.addEventListener("mouseleave", () => {
      logoContainer.style.transform = "scale(1) rotate(0deg)";
    });
  }
}

// Configurar otimizações mobile
function setupMobileOptimizations() {
  // Prevenir zoom em inputs no iOS
  if (isIOS()) {
    const inputs = document.querySelectorAll(
      'input[type="email"], input[type="password"]'
    );
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        input.style.fontSize = "16px";
      });
    });
  }

  // Ajustar altura da tela baseado no viewport
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  setVH();
  window.addEventListener("resize", setVH);
  window.addEventListener("orientationchange", () => {
    setTimeout(setVH, 100);
  });

  // Detectar teclado virtual no mobile
  let initialHeight = window.innerHeight;

  window.addEventListener("resize", () => {
    const currentHeight = window.innerHeight;
    const heightDiff = initialHeight - currentHeight;

    if (heightDiff > 150) {
      // Teclado provavelmente aberto
      document.body.classList.add("keyboard-open");
      window.elements.screen.style.height = `${currentHeight}px`;
    } else {
      document.body.classList.remove("keyboard-open");
      window.elements.screen.style.height = "100vh";
    }
  });

  // Smooth scroll para inputs em foco (mobile)
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      setTimeout(() => {
        input.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 300);
    });
  });
}

// Detectar dispositivos
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
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

  // Animação de entrada para mobile
  if (isMobileDevice()) {
    const loginContainer = document.querySelector(".login-container");
    loginContainer.style.opacity = "0";
    loginContainer.style.transform = "translateY(30px)";

    setTimeout(() => {
      loginContainer.style.transition = "all 0.6s ease-out";
      loginContainer.style.opacity = "1";
      loginContainer.style.transform = "translateY(0)";
    }, 200);
  }
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

  // Feedback tátil em mobile
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(50);
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

  // Feedback tátil
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(30);
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

  // Feedback tátil
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(50);
  }

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

    // Shake animation para mobile
    if (isMobileDevice()) {
      inputElement.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        inputElement.style.animation = "";
      }, 500);

      // Feedback tátil
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
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
  const screen = document.querySelector(".screen");

  if (screen) {
    // Suavizar desaparecimento
    screen.style.opacity = "0";
    setTimeout(() => {
      screen.style.display = "none";
    }, 500);
  }

  if (loader) {
    loader.style.display = "flex";
    setTimeout(() => {
      loader.style.opacity = "1";
    }, 50);
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

    // Feedback tátil de sucesso
    if (isMobileDevice() && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    setTimeout(() => {
      successFeedback.style.display = "none";
    }, CONFIG.UI.successFeedbackDuration);
  }
}

// Função principal de login otimizada para mobile
async function handleLogin(e) {
  e.preventDefault();
  console.log("📱 Formulário de login mobile enviado");

  const { emailField, passwordField, loginButton, rememberMe } =
    window.elements;
  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  // Fechar teclado virtual no mobile
  if (isMobileDevice()) {
    emailField.blur();
    passwordField.blur();
  }

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

  // Efeito visual no botão otimizado para mobile
  const originalText = loginButton.innerHTML;
  loginButton.innerHTML =
    '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Conectando...';
  loginButton.disabled = true;
  loginButton.style.opacity = "0.8";

  // Feedback tátil de início
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(100);
  }

  // Mostrar loading overlay
  showLoading(true);

  try {
    console.log("🌐 Enviando requisição para login mobile...");

    // Preservar foto de perfil existente
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
      console.log("✅ Login mobile bem-sucedido!");

      // Restaurar foto de perfil após login se ela existir
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

      // Redirecionar para o dashboard
      console.log("🔄 Mostrando loader pós-login mobile...");
      showPostLoginLoader();

      setTimeout(() => {
        window.location.href = CONFIG.UI.pages.dashboard;
      }, CONFIG.UI.redirectDelay);
    } else {
      throw new Error("Erro inesperado no login");
    }
  } catch (err) {
    console.error("❌ Erro no login mobile:", err);

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
  console.log("📱 Conexão mobile restaurada");
  clearError("password");

  // Feedback visual de conexão restaurada
  if (isMobileDevice()) {
    const screen = document.querySelector(".screen");
    screen.style.borderTop = "3px solid #51cf66";
    setTimeout(() => {
      screen.style.borderTop = "none";
    }, 2000);
  }
});

window.addEventListener("offline", () => {
  console.log("📱 Conexão mobile perdida");
  showError("password", "Sem conexão com a internet");

  // Feedback visual de perda de conexão
  if (isMobileDevice()) {
    const screen = document.querySelector(".screen");
    screen.style.borderTop = "3px solid #ff6b6b";
  }
});

// Prevenir zoom em duplo toque (iOS Safari)
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

// Adicionar shake animation ao CSS dinamicamente
const shakeCSS = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = shakeCSS;
document.head.appendChild(styleSheet);

console.log(
  "✅ Login mobile.js carregado - versão otimizada para dispositivos móveis"
);

// Loader inicial - esconde após carregar a página
window.addEventListener("load", () => {
  const initialLoader = document.getElementById("initialLoader");
  if (initialLoader) {
    setTimeout(() => {
      initialLoader.style.opacity = "0";
      initialLoader.style.transition = "opacity 0.5s ease";
      setTimeout(() => initialLoader.remove(), 500);
    }, 400); // delay menor para mobile
  }
});
