// Script para página de Login Responsivo - Altrum
document.addEventListener("DOMContentLoaded", function () {
  // Verificar se usuário já está logado
  if (typeof Auth !== "undefined" && Auth.isLoggedIn && Auth.isLoggedIn()) {
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
  setupResponsiveOptimizations();
});

// Inicializar elementos
function initializeElements() {
  window.elements = {
    form: document.getElementById("formLogin"),
    emailField: document.getElementById("email"),
    passwordField: document.getElementById("password"),
    togglePassword: document.getElementById("passwordToggle"),
    rememberMe: document.getElementById("rememberMe"),
    loginButton: document.querySelector(".login-button"),
    registerLink: document.querySelector(".register-link"),
    loadingOverlay: document.getElementById("loadingOverlay"),
    postLoginLoader: document.getElementById("postLoginLoader"),
    logoContainer: document.querySelector(".logo-container"),
    logoDisplay: document.querySelector(".logo-display"),
    screen: document.querySelector(".screen"),
    imageSection: document.querySelector(".image-section"),
    loginSection: document.querySelector(".login-section"),
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
    logoDisplay,
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

  // Hover no logo do formulário (apenas desktop)
  if (logoContainer && !isMobileDevice()) {
    logoContainer.addEventListener("mouseenter", () => {
      logoContainer.style.transform = "scale(1.05) rotate(5deg)";
    });
    logoContainer.addEventListener("mouseleave", () => {
      logoContainer.style.transform = "scale(1) rotate(0deg)";
    });
  }

  // Hover no logo da seção de imagem (apenas desktop)
  if (logoDisplay && !isMobileDevice()) {
    logoDisplay.addEventListener("mouseenter", () => {
      logoDisplay.style.transform = "scale(1.05) rotate(-5deg)";
    });
    logoDisplay.addEventListener("mouseleave", () => {
      logoDisplay.style.transform = "scale(1) rotate(0deg)";
    });
  }
}

// Configurar otimizações responsivas
function setupResponsiveOptimizations() {
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
      if (isMobileDevice()) {
        setTimeout(() => {
          input.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }, 300);
      }
    });
  });

  // Ajustar layout em mudanças de orientação
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      adjustLayoutForOrientation();
    }, 100);
  });

  // Ajuste inicial
  adjustLayoutForOrientation();
}

// Ajustar layout baseado na orientação e tamanho da tela
function adjustLayoutForOrientation() {
  const { imageSection, loginSection } = window.elements;
  const isLandscape = window.innerWidth > window.innerHeight;
  const isDesktop = window.innerWidth >= 1025;

  // Em desktop landscape, mostrar seção de imagem
  if (isDesktop && imageSection) {
    imageSection.style.display = "flex";
  } else if (imageSection) {
    imageSection.style.display = "none";
  }

  // Ajustar padding em landscape mobile
  if (isLandscape && !isDesktop && loginSection) {
    loginSection.style.padding = "20px 40px";
  } else if (loginSection && isMobileDevice()) {
    loginSection.style.padding = "40px 24px";
  }
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

function isDesktop() {
  return window.innerWidth >= 1025 && !isMobileDevice();
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

  // Animação de entrada
  const loginContainer = document.querySelector(".login-container");
  const imageContent = document.querySelector(".image-content");

  if (loginContainer) {
    loginContainer.style.opacity = "0";
    loginContainer.style.transform = "translateY(30px)";

    setTimeout(() => {
      loginContainer.style.transition = "all 0.6s ease-out";
      loginContainer.style.opacity = "1";
      loginContainer.style.transform = "translateY(0)";
    }, 200);
  }

  // Animação da seção de imagem (apenas desktop)
  if (imageContent && isDesktop()) {
    imageContent.style.opacity = "0";
    imageContent.style.transform = "translateX(-30px)";

    setTimeout(() => {
      imageContent.style.transition = "all 0.8s ease-out";
      imageContent.style.opacity = "1";
      imageContent.style.transform = "translateX(0)";
    }, 300);
  }
}

// Carregar email lembrado
function loadRememberedEmail() {
  const { emailField, rememberMe } = window.elements;

  let rememberedEmail = null;
  let shouldRemember = false;

  if (typeof Auth !== "undefined" && Auth.shouldRememberMe) {
    shouldRemember = Auth.shouldRememberMe();
    if (shouldRemember && Auth.getRememberedEmail) {
      rememberedEmail = Auth.getRememberedEmail();
    }
  } else {
    rememberedEmail = localStorage.getItem("rememberedEmail");
    shouldRemember = localStorage.getItem("shouldRememberMe") === "true";
  }

  if (rememberedEmail && shouldRemember && emailField && rememberMe) {
    emailField.value = rememberedEmail;
    rememberMe.checked = true;
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

  registerLink.style.transform = "scale(1.05)";
  registerLink.style.boxShadow = "0 8px 25px rgba(0, 212, 255, 0.4)";

  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(50);
  }

  setTimeout(() => {
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

// Mostrar/ocultar mensagens de erro
function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);

  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
    inputElement.classList.add("error-border");
    inputElement.classList.remove("success-border");

    if (isMobileDevice()) {
      inputElement.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        inputElement.style.animation = "";
      }, 500);

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
    errorElement.classList.remove("show");
    inputElement.classList.remove("error-border");
  }
}

// Mostrar loader pós-login
function showPostLoginLoader() {
  const { postLoginLoader, screen } = window.elements;

  if (screen) {
    screen.style.opacity = "0";
    setTimeout(() => {
      screen.style.display = "none";
    }, 500);
  }

  if (postLoginLoader) {
    postLoginLoader.style.display = "flex";
    setTimeout(() => {
      postLoginLoader.style.opacity = "1";
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

// Identificar erro de autenticação
function identifyAuthError(error) {
  const defaultMessage = "Verifique se seu e-mail e senha estão corretos.";
  const errorMessage = error.message || defaultMessage;
  const errorLower = errorMessage.toLowerCase();

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

  const isEmailError = emailKeywords.some((keyword) =>
    errorLower.includes(keyword)
  );

  if (
    errorMessage.includes("Erro de conexão") ||
    errorMessage.includes("Erro HTTP")
  ) {
    return { field: "password", message: errorMessage };
  }

  if (isEmailError) {
    const specificEmailMessage = errorLower.includes("e-mail não encontrado")
      ? "E-mail não encontrado ou não cadastrado."
      : errorMessage;
    return { field: "email", message: specificEmailMessage };
  }

  return {
    field: "password",
    message: defaultMessage,
  };
}

// Função principal de login
async function handleLogin(e) {
  e.preventDefault();

  const { emailField, passwordField, loginButton, rememberMe } =
    window.elements;

  if (!emailField || !passwordField || !loginButton || !rememberMe) {
    console.error("Elementos do formulário não encontrados");
    return;
  }

  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  // Fechar teclado virtual
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

  // Efeito visual no botão
  const originalText = loginButton.innerHTML;
  loginButton.innerHTML =
    '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Conectando...';
  loginButton.disabled = true;
  loginButton.style.opacity = "0.8";

  if (isMobileDevice() && navigator.vibrate) {
    navigator.vibrate(100);
  }

  showLoading(true);

  try {
    // Preservar foto de perfil
    let existingProfilePhoto = null;
    if (typeof Auth !== "undefined" && Auth.getUserData) {
      const existingUserData = Auth.getUserData();
      if (existingUserData && existingUserData.profilePhotoUrl) {
        existingProfilePhoto = existingUserData.profilePhotoUrl;
      }
    }

    // Fazer login
    let result;
    if (typeof Auth !== "undefined" && Auth.login) {
      result = await Auth.login(email, password, rememberMe.checked);
    } else {
      // Simular login para demonstração
      await new Promise((resolve) => setTimeout(resolve, 2000));
      result = { success: true };
    }

    if (result.success) {
      // Restaurar foto de perfil
      if (
        existingProfilePhoto &&
        typeof Auth !== "undefined" &&
        Auth.updateProfilePhoto
      ) {
        Auth.updateProfilePhoto(existingProfilePhoto);
      }

      // Atualizar botão para sucesso
      loginButton.innerHTML =
        '<i class="fas fa-check" style="margin-right: 8px;"></i>Sucesso!';
      loginButton.style.background =
        "linear-gradient(135deg, #51cf66, #69db7c)";

      // Mostrar loader pós-login
      showPostLoginLoader();

      // Redirecionar
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
    console.error("Erro no login:", err);

    const errorInfo = identifyAuthError(err);
    showError(errorInfo.field, errorInfo.message);

    // Resetar botão
    loginButton.innerHTML = originalText;
    loginButton.disabled = false;
    loginButton.style.background =
      "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)";
    loginButton.style.opacity = "1";
  } finally {
    showLoading(false);
  }
}

// Interceptar eventos de conectividade
window.addEventListener("online", () => {
  clearError("password");

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
  showError("password", "Sem conexão com a internet");

  if (isMobileDevice()) {
    const screen = document.querySelector(".screen");
    if (screen) {
      screen.style.borderTop = "3px solid #ff6b6b";
    }
  }
});

// Prevenir zoom em duplo toque
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

// Loader inicial
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
