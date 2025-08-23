// DOM Elements
const backBtn = document.getElementById("back-btn");
const recoveryForm = document.getElementById("recovery-form");
const emailInput = document.getElementById("email-input");
const submitBtn = document.getElementById("submit-btn");
const methodOptions = document.querySelectorAll(".method-option");
const loadingOverlay = document.getElementById("loading-overlay");
const successModal = document.getElementById("success-modal");
const modalClose = document.getElementById("modal-close");
const floatingMessage = document.getElementById("floating-message");
const contactSupport = document.getElementById("contact-support");
const createAccount = document.getElementById("create-account");

// State
let selectedMethod = "email";
let isProcessing = false;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeAnimations();
  updateTime();
  setInterval(updateTime, 60000);

  // Show welcome message
  setTimeout(() => {
    showFloatingMessage("🧠 Sistema neural inicializado");
  }, 1000);
});

// Animation initialization
function initializeAnimations() {
  const animatedElements = document.querySelectorAll(
    ".method-option, .submit-button, .link-option"
  );
  animatedElements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";

    setTimeout(() => {
      element.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 100 + 500);
  });
}

// Botão go login:

const goLogin = document.getElementById("go-login");

goLogin.addEventListener("click", () => {
  if (document.referrer) {
    // Se existe uma página anterior no histórico, volta para ela
    window.history.back();
  } else {
    // Se não existe (ex: usuário entrou direto), vai para uma página padrão
    window.location.href = "../../login/html/login.html";
  }
});

// Botão go support:

const goSupport = document.getElementById("go-support");
goSupport.onclick = () => {
  window.location.href = "../../support/html/suporte.html";
};

// Method selection
methodOptions.forEach((option) => {
  option.addEventListener("click", () => {
    // Remove active from all options
    methodOptions.forEach((opt) => opt.classList.remove("active"));

    // Add active to clicked option
    option.classList.add("active");
    selectedMethod = option.dataset.method;

    // Update UI feedback
    const methodName = option.querySelector(".method-name").textContent;
    showFloatingMessage(`✅ ${methodName} selecionado`);

    // Add visual feedback
    option.style.transform = "scale(0.98)";
    setTimeout(() => {
      option.style.transform = "scale(1)";
    }, 150);
  });
});

// Email input validation
emailInput.addEventListener("input", (e) => {
  const email = e.target.value;
  const isValid = validateEmail(email);

  if (email.length > 0) {
    if (isValid) {
      emailInput.style.borderColor = "#00C851";
      emailInput.style.boxShadow = "0 0 0 3px rgba(0,200,81,0.2)";
    } else {
      emailInput.style.borderColor = "#FF4444";
      emailInput.style.boxShadow = "0 0 0 3px rgba(255,68,68,0.2)";
    }
  } else {
    emailInput.style.borderColor = "rgba(255,255,255,0.08)";
    emailInput.style.boxShadow = "none";
  }
});

// Form submission
recoveryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (isProcessing) return;

  const email = emailInput.value.trim();

  if (!email) {
    showFloatingMessage("❌ Por favor, insira seu email");
    shakeElement(emailInput);
    return;
  }

  if (!validateEmail(email)) {
    showFloatingMessage("❌ Email inválido");
    shakeElement(emailInput);
    return;
  }

  startRecoveryProcess();
});

// Start recovery process
function startRecoveryProcess() {
  isProcessing = true;

  // Show loading
  loadingOverlay.classList.add("active");
  submitBtn.disabled = true;

  // Update loading text based on selected method
  const loadingText = document.querySelector(".loading-text");
  const methodTexts = {
    email: "Enviando link neural por email...",
    sms: "Preparando SMS quântico...",
    biometric: "Iniciando scan biométrico...",
  };

  loadingText.textContent = methodTexts[selectedMethod];

  // Simulate processing time
  setTimeout(() => {
    // Hide loading
    loadingOverlay.classList.remove("active");

    // Show success modal
    successModal.classList.add("active");

    // Update success message based on method
    const successMessages = {
      email: "Um link de recuperação foi enviado para seu email.",
      sms: "Um código de verificação foi enviado para seu celular.",
      biometric: "Scan biométrico concluído. Verifique seu dispositivo.",
    };

    const modalText = successModal.querySelector("p");
    modalText.textContent = successMessages[selectedMethod];

    isProcessing = false;
    submitBtn.disabled = false;
  }, 3000);
}

// Modal close functionality
modalClose.addEventListener("click", () => {
  successModal.classList.remove("active");

  // Reset form
  emailInput.value = "";
  emailInput.style.borderColor = "rgba(255,255,255,0.08)";
  emailInput.style.boxShadow = "none";

  showFloatingMessage("✨ Pronto para nova tentativa");
});

// Support and create account links
contactSupport.addEventListener("click", (e) => {
  e.preventDefault();
  showFloatingMessage("📞 Conectando ao suporte...");

  // Add click animation
  contactSupport.style.transform = "translateX(8px)";
  setTimeout(() => {
    contactSupport.style.transform = "translateX(4px)";
  }, 150);

  console.log("Contact support clicked");
});

createAccount.addEventListener("click", (e) => {
  e.preventDefault();
  showFloatingMessage("👤 Redirecionando para cadastro...");

  // Add click animation
  createAccount.style.transform = "translateX(8px)";
  setTimeout(() => {
    createAccount.style.transform = "translateX(4px)";
  }, 150);

  console.log("Create account clicked");
});

// Utility functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function shakeElement(element) {
  element.style.animation = "shake 0.5s ease-in-out";

  setTimeout(() => {
    element.style.animation = "";
  }, 500);
}

// Add shake animation to CSS (via JavaScript)
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

function showFloatingMessage(message) {
  floatingMessage.textContent = message;
  floatingMessage.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => {
    floatingMessage.classList.remove("show");

    // Reset to original message after animation
    setTimeout(() => {
      floatingMessage.textContent = "⚡ Sistema neural ativo";
    }, 500);
  }, 3000);
}

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const statusBarTime = document.querySelector(".status-bar span");
  if (statusBarTime) {
    statusBarTime.textContent = `${hours}:${minutes}`;
  }
}

// Add touch feedback for mobile devices
function addTouchFeedback(element) {
  element.addEventListener("touchstart", () => {
    element.style.transform = "scale(0.98)";
  });

  element.addEventListener("touchend", () => {
    element.style.transform = "scale(1)";
  });
}

// Apply touch feedback to interactive elements
[backBtn, submitBtn, modalClose, ...methodOptions].forEach(addTouchFeedback);

// Add hover effects to input
emailInput.addEventListener("focus", () => {
  emailInput.parentElement.querySelector(".input-label").style.color =
    "#7877C6";
});

emailInput.addEventListener("blur", () => {
  emailInput.parentElement.querySelector(".input-label").style.color =
    "#7877C6";
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // ESC to close modal
  if (e.key === "Escape") {
    if (successModal.classList.contains("active")) {
      modalClose.click();
    }
  }

  // Enter to submit form (when not in processing)
  if (
    e.key === "Enter" &&
    !isProcessing &&
    !successModal.classList.contains("active")
  ) {
    if (document.activeElement !== emailInput) {
      recoveryForm.dispatchEvent(new Event("submit"));
    }
  }
});

// Add loading states to buttons
submitBtn.addEventListener("click", () => {
  if (!isProcessing) {
    submitBtn.style.transform = "scale(0.98)";
    setTimeout(() => {
      submitBtn.style.transform = "scale(1)";
    }, 150);
  }
});

// Simulate network connectivity check
function checkNetworkStatus() {
  if (!navigator.onLine) {
    showFloatingMessage("⚠️ Sem conexão neural");
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
  } else {
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
  }
}

// Check network status on load and when it changes
window.addEventListener("load", checkNetworkStatus);
window.addEventListener("online", () => {
  checkNetworkStatus();
  showFloatingMessage("🌐 Conexão neural restaurada");
});
window.addEventListener("offline", checkNetworkStatus);

// Add progressive enhancement for modern browsers
if ("serviceWorker" in navigator) {
  console.log("Service Worker support detected");
}

// Add form auto-save (simulation)
let autoSaveTimeout;
emailInput.addEventListener("input", () => {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    // Simulate auto-save
    if (emailInput.value.trim()) {
      console.log("Auto-saved email:", emailInput.value);
    }
  }, 1000);
});

console.log("🚀 Página de recuperação de senha carregada com sucesso!");

// Add some easter eggs for developers
console.log(`
🧠 SISTEMA NEURAL ATIVO 🧠
═══════════════════════════
Status: Online
Versão: 2.1.47
Última atualização: ${new Date().toISOString()}
═══════════════════════════
`);

// Fun fact generator
const funFacts = [
  "🤖 IA processa 1TB de dados por segundo",
  "⚡ Conexões neurais: 86 bilhões",
  "🔮 Previsão quântica: 99.7% precisão",
  "🌟 Velocidade de processamento: Luz²",
  "🔐 Criptografia: Nível Galáctico",
];

setInterval(() => {
  if (Math.random() < 0.1) {
    // 10% chance every interval
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    if (!floatingMessage.classList.contains("show")) {
      showFloatingMessage(randomFact);
    }
  }
}, 15000); // Check every 15 seconds
