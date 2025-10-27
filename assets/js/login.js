// Script específico para página de Login Mobile - Altrum
document.addEventListener("DOMContentLoaded", function () {
  // console.log("Página de login mobile carregada com sistema de moedas");

  // Verificar se usuário já está logado (usando módulos externos se disponíveis)
  if (typeof Auth !== "undefined" && Auth.isLoggedIn && Auth.isLoggedIn()) {
    // console.log("Usuário já está logado, redirecionando...");
    if (typeof CONFIG !== "undefined" && CONFIG.UI && CONFIG.UI.pages) {
      window.location.href = CONFIG.UI.pages.dashboard;
    } else {
      window.location.href = "/dashboard";
    }
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

  // console.log("Elementos da página inicializados:", window.elements);
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
  if (form) {
    form.addEventListener("submit", handleLogin);
  }

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

  // console.log("Event listeners configurados");
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

    if (heightDiff > 150 && window.elements.screen) {
      // Teclado provavelmente aberto
      document.body.classList.add("keyboard-open");
      window.elements.screen.style.height = `${currentHeight}px`;
    } else if (window.elements.screen) {
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

  // console.log("Otimizações mobile configuradas");
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
    if (loginContainer) {
      loginContainer.style.opacity = "0";
      loginContainer.style.transform = "translateY(30px)";

      setTimeout(() => {
        loginContainer.style.transition = "all 0.6s ease-out";
        loginContainer.style.opacity = "1";
        loginContainer.style.transform = "translateY(0)";
      }, 200);
    }
  }

  // console.log("Animações configuradas");
}

// Carregar email lembrado
function loadRememberedEmail() {
  const { emailField, rememberMe } = window.elements;

  // Usar módulo Auth se disponível, caso contrário usar localStorage
  let rememberedEmail = null;
  let shouldRemember = false;

  if (typeof Auth !== "undefined" && Auth.shouldRememberMe) {
    shouldRemember = Auth.shouldRememberMe();
    if (shouldRemember && Auth.getRememberedEmail) {
      rememberedEmail = Auth.getRememberedEmail();
    }
  } else {
    // Fallback para localStorage
    rememberedEmail = localStorage.getItem("rememberedEmail");
    shouldRemember = localStorage.getItem("shouldRememberMe") === "true";
  }

  if (rememberedEmail && shouldRemember && emailField && rememberMe) {
    emailField.value = rememberedEmail;
    rememberMe.checked = true;
    // console.log("Email lembrado carregado:", rememberedEmail);
  }
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
  const { passwordField, togglePassword } = window.elements;

  if (!passwordField || !togglePassword) return;

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
  if (!emailField) return;

  const email = emailField.value.trim();

  if (!email) {
    emailField.classList.remove("error-border", "success-border");
    return;
  }

  // Usar regex do CONFIG se disponível, caso contrário usar regex padrão
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    typeof CONFIG !== "undefined" &&
    CONFIG.VALIDATION &&
    CONFIG.VALIDATION.email &&
    CONFIG.VALIDATION.email.regex
  ) {
    emailRegex = CONFIG.VALIDATION.email.regex;
  }

  if (emailRegex.test(email)) {
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
  if (!passwordField) return;

  const password = passwordField.value;

  if (!password) {
    passwordField.classList.remove("error-border", "success-border");
    return;
  }

  // Usar configuração do CONFIG se disponível, caso contrário usar valor padrão
  let minLength = 6;
  if (
    typeof CONFIG !== "undefined" &&
    CONFIG.VALIDATION &&
    CONFIG.VALIDATION.password &&
    CONFIG.VALIDATION.password.minLength
  ) {
    minLength = CONFIG.VALIDATION.password.minLength;
  }

  if (password.length >= minLength) {
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

  if (!rememberMe || !emailField) return;

  if (rememberMe.checked && emailField.value) {
    // Usar módulo Auth se disponível, caso contrário usar localStorage
    if (typeof Auth !== "undefined" && Auth.saveRememberMe) {
      Auth.saveRememberMe(emailField.value, true);
    } else {
      localStorage.setItem("rememberedEmail", emailField.value);
      localStorage.setItem("shouldRememberMe", "true");
    }
  } else if (!rememberMe.checked) {
    if (typeof Auth !== "undefined" && Auth.saveRememberMe) {
      Auth.saveRememberMe("", false);
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.setItem("shouldRememberMe", "false");
    }
  }

  // Feedback tátil
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(30);
  }
}

// Manipular mudança no email
function handleEmailChange() {
  const { rememberMe, emailField } = window.elements;

  if (!rememberMe || !emailField) return;

  if (rememberMe.checked) {
    if (typeof Auth !== "undefined" && Auth.saveRememberMe) {
      Auth.saveRememberMe(emailField.value, true);
    } else {
      localStorage.setItem("rememberedEmail", emailField.value);
    }
  }
}

// Manipular clique no link de registro
function handleRegisterClick(e) {
  e.preventDefault();
  const { registerLink } = window.elements;

  if (!registerLink) return;

  // Efeito visual antes de redirecionar
  registerLink.style.transform = "scale(1.05)";
  registerLink.style.boxShadow = "0 8px 25px rgba(108, 92, 231, 0.4)";

  // Feedback tátil
  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(50);
  }

  setTimeout(() => {
    // Usar configuração do CONFIG se disponível
    if (
      typeof CONFIG !== "undefined" &&
      CONFIG.UI &&
      CONFIG.UI.pages &&
      CONFIG.UI.pages.register
    ) {
      window.location.href = CONFIG.UI.pages.register;
    } else {
      window.location.href = "/pages/register/html/signup.html";
    }
  }, 200);
}

// Mostrar/ocultar mensagens de erro - CORRIGIDO
function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  // console.log(`🔴 Mostrando erro para ${fieldId}:`, message);

  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
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
  } else {
    console.error(`❌ Elementos não encontrados para ${fieldId}`);
  }
}

function clearError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement && inputElement) {
    errorElement.classList.remove("show");
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
    // Usar formatador do CONFIG se disponível
    let formattedBalance = balance || 0;
    if (typeof CONFIG !== "undefined" && CONFIG.formatCoins) {
      formattedBalance = CONFIG.formatCoins(balance || 0);
    }

    userBalanceSpan.textContent = formattedBalance;
    successFeedback.style.display = "flex";

    // Feedback tátil de sucesso
    if (isMobileDevice() && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // Usar duração do CONFIG se disponível
    let duration = 3000;
    if (
      typeof CONFIG !== "undefined" &&
      CONFIG.UI &&
      CONFIG.UI.successFeedbackDuration
    ) {
      duration = CONFIG.UI.successFeedbackDuration;
    }

    setTimeout(() => {
      successFeedback.style.display = "none";
    }, duration);
  }
}

/**
 * Analisa a mensagem de erro do backend para identificar o campo afetado (e-mail ou senha).
 * @param {Error} error - O objeto Error lançado pelo módulo Auth.
 * @returns {{field: 'email'|'password', message: string}} Objeto com o campo e a mensagem de erro.
 */
function identifyAuthError(error) {
  const defaultMessage = "Verifique se seu e-mail e senha estão corretos.";
  const errorMessage = error.message || defaultMessage;
  const errorLower = errorMessage.toLowerCase();

  // Lista de palavras-chave que indicam um erro no campo E-MAIL
  const emailKeywords = [
    "e-mail",
    "email",
    "usuário",
    "user not found",
    "não cadastrado",
    "não encontrado",
    "não existe",
    "inválido",
  ];

  // Verifica se a mensagem de erro contém alguma palavra-chave de e-mail
  const isEmailError = emailKeywords.some((keyword) =>
    errorLower.includes(keyword)
  );

  // Se a mensagem da API for muito genérica, usamos a mensagem padrão para credenciais
  if (
    errorMessage.includes("Erro de conexão") ||
    errorMessage.includes("Erro HTTP")
  ) {
    return { field: "password", message: errorMessage };
  }

  if (isEmailError) {
    // Se a mensagem for muito específica, a usamos. Caso contrário, usamos uma genérica de e-mail.
    const specificEmailMessage = errorLower.includes("e-mail não encontrado")
      ? "E-mail não encontrado ou não cadastrado."
      : errorMessage;
    return { field: "email", message: specificEmailMessage };
  }

  // Se não for um erro de rede ou de e-mail, assumimos que o problema está na SENHA ou nas credenciais combinadas.
  // Usamos a mensagem padrão ou a mensagem que veio da API.
  return {
    field: "password",
    message: defaultMessage,
  };
}

// Função principal de login otimizada para mobile
async function handleLogin(e) {
  e.preventDefault();
  // console.log("📱 Formulário de login mobile enviado");

  const { emailField, passwordField, loginButton, rememberMe } =
    window.elements;

  if (!emailField || !passwordField || !loginButton || !rememberMe) {
    console.error("Elementos do formulário não encontrados");
    return;
  }

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

  // Usar regex e mensagem do CONFIG se disponíveis
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let emailMessage = "Por favor, digite um e-mail válido";

  if (
    typeof CONFIG !== "undefined" &&
    CONFIG.VALIDATION &&
    CONFIG.VALIDATION.email
  ) {
    if (CONFIG.VALIDATION.email.regex)
      emailRegex = CONFIG.VALIDATION.email.regex;
    if (CONFIG.VALIDATION.email.message)
      emailMessage = CONFIG.VALIDATION.email.message;
  }

  if (!emailRegex.test(email)) {
    showError("email", emailMessage);
    return;
  }

  if (!password) {
    showError("password", "Por favor, digite sua senha");
    return;
  }

  // Usar configurações do CONFIG se disponíveis
  let minLength = 6;
  let passwordMessage = `A senha deve ter pelo menos ${minLength} caracteres`;

  if (
    typeof CONFIG !== "undefined" &&
    CONFIG.VALIDATION &&
    CONFIG.VALIDATION.password
  ) {
    if (CONFIG.VALIDATION.password.minLength)
      minLength = CONFIG.VALIDATION.password.minLength;
    if (CONFIG.VALIDATION.password.message)
      passwordMessage = CONFIG.VALIDATION.password.message;
  }

  if (password.length < minLength) {
    showError("password", passwordMessage);
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
    // console.log("🌐 Enviando requisição para login mobile...");

    // Preservar foto de perfil existente se Auth módulo estiver disponível
    let existingProfilePhoto = null;
    if (typeof Auth !== "undefined" && Auth.getUserData) {
      const existingUserData = Auth.getUserData();
      if (existingUserData && existingUserData.profilePhotoUrl) {
        existingProfilePhoto = existingUserData.profilePhotoUrl;
        // console.log(
        //   "📸 Foto de perfil existente preservada:",
        //   existingProfilePhoto
        // );
      }
    }

    // Fazer login usando o módulo Auth se disponível
    let result;
    if (typeof Auth !== "undefined" && Auth.login) {
      result = await Auth.login(email, password, rememberMe.checked);
    } else {
      // Simular login para demonstração
      await new Promise((resolve) => setTimeout(resolve, 2000));
      result = { success: true };
      // console.log(
      //   "⚠️ Módulo Auth não encontrado, simulando login bem-sucedido"
      // );
    }

    if (result.success) {
      // console.log("✅ Login mobile bem-sucedido!");

      // Restaurar foto de perfil após login se ela existir e Auth estiver disponível
      if (
        existingProfilePhoto &&
        typeof Auth !== "undefined" &&
        Auth.updateProfilePhoto
      ) {
        // console.log("🔄 Restaurando foto de perfil após login...");
        Auth.updateProfilePhoto(existingProfilePhoto);
      }

      // Atualizar botão para sucesso
      loginButton.innerHTML =
        '<i class="fas fa-check" style="margin-right: 8px;"></i>Sucesso!';
      loginButton.style.background =
        "linear-gradient(135deg, #51cf66, #69db7c)";

      // Mostrar feedback com saldo
      let userBalance = 0;
      if (typeof Auth !== "undefined" && Auth.getUserData) {
        const userData = Auth.getUserData();
        userBalance = userData?.balance || userData?.coins || 0;
      } else {
        // Simular saldo para demonstração
        userBalance = Math.floor(Math.random() * 1000) + 100;
      }

      showSuccessFeedback(userBalance);

      // Redirecionar para o dashboard
      // console.log("🔄 Mostrando loader pós-login mobile...");
      showPostLoginLoader();

      // Usar delay e página do CONFIG se disponíveis
      let redirectDelay = 2000;
      let dashboardPage = "/dashboard";

      if (typeof CONFIG !== "undefined" && CONFIG.UI) {
        if (CONFIG.UI.redirectDelay) redirectDelay = CONFIG.UI.redirectDelay;
        if (CONFIG.UI.pages && CONFIG.UI.pages.dashboard)
          dashboardPage = CONFIG.UI.pages.dashboard;
      }

      setTimeout(() => {
        window.location.href = dashboardPage;
      }, redirectDelay);
    } else {
      throw new Error(result.message || "Erro inesperado no login");
    }
  } catch (err) {
    console.error("❌ Erro no login mobile:", err);

    // Identificar tipo de erro usando função auxiliar
    const errorInfo = identifyAuthError(err);

    // console.log(
    //   `📋 Erro identificado - Campo: ${errorInfo.field}, Mensagem: ${errorInfo.message}`
    // );

    // Mostrar erro no campo apropriado
    showError(errorInfo.field, errorInfo.message);

    // Resetar botão
    loginButton.innerHTML = originalText;
    loginButton.disabled = false;
    loginButton.style.background =
      "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
    loginButton.style.opacity = "1";
  } finally {
    // Esconder loading
    showLoading(false);
  }
}

// Interceptar eventos de conectividade
window.addEventListener("online", () => {
  // console.log("📱 Conexão mobile restaurada");
  clearError("password");

  // Feedback visual de conexão restaurada
  if (isMobileDevice()) {
    const screen = document.querySelector(".screen");
    if (screen) {
      screen.style.borderTop = "3px solid #51cf66";
      setTimeout(() => {
        screen.style.borderTop = "none";
      }, 2000);
    }
  }
});

window.addEventListener("offline", () => {
  // console.log("📱 Conexão mobile perdida");
  showError("password", "Sem conexão com a internet");

  // Feedback visual de perda de conexão
  if (isMobileDevice()) {
    const screen = document.querySelector(".screen");
    if (screen) {
      screen.style.borderTop = "3px solid #ff6b6b";
    }
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

// Loader inicial - esconde após carregar a página
window.addEventListener("load", () => {
  const initialLoader = document.getElementById("initialLoader");
  if (initialLoader) {
    setTimeout(() => {
      initialLoader.style.opacity = "0";
      initialLoader.style.transition = "opacity 0.5s ease";
      setTimeout(() => initialLoader.remove(), 500);
    }, 400);
  }
});

// console.log(
//   "✅ Login mobile.js carregado - versão otimizada com tratamento de erro aprimorado"
// );
