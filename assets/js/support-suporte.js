// Botão go home:

const goHome = document.getElementById("go-home");
const homeButton = document.getElementById("go-home-button");

homeButton.addEventListener("click", () => {
  if (document.referrer) {
    // Se existe uma página anterior no histórico, volta para ela
    window.history.back();
  } else {
    // Se não existe (ex: usuário entrou direto), vai para uma página padrão
    window.location.href = "/index.html";
  }
});
// goHome.onclick = goHomeButton;
// homeButton.onclick = goHomeButton;

// Função para voltar à página anterior
function goBack() {
  console.log("Voltando para a página anterior...");
  // window.history.back();

  // Ou redirecionar para uma página específica:
  // window.location.href = "/index.html";
}

// Função para abrir WhatsApp
function openWhatsApp() {
  const phoneNumber = "5551989134037"; // Substitua pelo número real
  const message = "Olá! Preciso de suporte com o Altrum!";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Abre em uma nova aba
  window.open(url, "_blank");
}

// Função para abrir cliente de email
function openEmail() {
  const email = "suporte@leninfontella.com";
  const subject = "Solicitação de Suporte";
  const body = "Olá! Preciso de ajuda com a plataforma.";

  // Cria o link mailto
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

// Função para fechar formulário de contato
function closeContactForm() {
  AppState.closeForm();

  // Adicionar animação de saída
  const form = document.getElementById("contactForm");
  form.style.animation = "slideUp 0.3s ease";

  setTimeout(() => {
    form.classList.remove("active");
    form.style.animation = "";
  }, 300);
}

// Função para mostrar/esconder formulário de contato
function toggleContactForm() {
  const form = document.getElementById("contactForm");
  form.classList.toggle("active");

  // Se o formulário foi aberto, fazer scroll suave até ele
  if (form.classList.contains("active")) {
    form.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}

// Função para abrir FAQ
function openFAQ() {
  console.log("Abrindo FAQ...");
  // Redirecionar para a página de FAQ
  // window.location.href = '../faq/html/faq.html';

  // Ou abrir em nova aba
  // window.open('../faq/html/faq.html', '_blank');
}

// Função para enviar formulário
function submitForm(event) {
  event.preventDefault();

  const button = event.target.querySelector(".submit-button");
  const originalText = button.textContent;

  // Desabilitar botão e mostrar loading
  button.textContent = "Enviando...";
  button.disabled = true;

  // Simular envio (substituir por integração real)
  setTimeout(() => {
    // Mostrar sucesso
    showSuccessMessage(
      "Mensagem enviada com sucesso! Entraremos em contato em breve."
    );

    // Restaurar botão
    button.textContent = originalText;
    button.disabled = false;

    // Limpar formulário
    event.target.reset();

    // Fechar formulário
    document.getElementById("contactForm").classList.remove("active");
  }, 2000);
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = "success-notification";
  notification.textContent = message;

  // Adicionar estilos
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "linear-gradient(135deg, #7877c6 0%, #5b5a9f 100%)",
    color: "white",
    padding: "16px 24px",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(120, 119, 198, 0.3)",
    zIndex: "9999",
    fontSize: "14px",
    fontWeight: "500",
    maxWidth: "300px",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  });

  // Adicionar ao DOM
  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remover após 5 segundos
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

// Função para validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para adicionar validação em tempo real
function addRealTimeValidation() {
  const form = document.querySelector("#contactForm form");
  const inputs = form.querySelectorAll(".input-field, .textarea-field");

  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this);
    });

    input.addEventListener("input", function () {
      if (this.classList.contains("error")) {
        validateField(this);
      }
    });
  });
}

// Função para validar campo individual
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Validação por tipo
  if (field.type === "email" && value) {
    if (!isValidEmail(value)) {
      isValid = false;
      errorMessage = "E-mail inválido";
    }
  }

  // Validação de campos obrigatórios
  if (field.required && !value) {
    isValid = false;
    errorMessage = "Campo obrigatório";
  }

  // Aplicar estilos de validação
  if (!isValid) {
    field.classList.add("error");
    showFieldError(field, errorMessage);
  } else {
    field.classList.remove("error");
    removeFieldError(field);
  }

  return isValid;
}

// Função para mostrar erro no campo
function showFieldError(field, message) {
  let errorElement = field.parentNode.querySelector(".field-error");

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "field-error";
    Object.assign(errorElement.style, {
      color: "#ff4757",
      fontSize: "12px",
      marginTop: "4px",
      fontWeight: "500",
    });
    field.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = message;
  field.style.borderColor = "#ff4757";
}

// Função para remover erro do campo
function removeFieldError(field) {
  const errorElement = field.parentNode.querySelector(".field-error");
  if (errorElement) {
    errorElement.remove();
  }
  field.style.borderColor = "";
}

// Função para animar elementos na entrada
function animateElementsOnLoad() {
  const options = document.querySelectorAll(".support-option");

  options.forEach((option, index) => {
    // Reset inicial
    option.style.opacity = "0";
    option.style.transform = "translateY(20px)";

    // Animar com delay
    setTimeout(() => {
      option.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      option.style.opacity = "1";
      option.style.transform = "translateY(0)";
    }, index * 100 + 200);
  });
}

// Função para adicionar efeitos de ripple nos botões
function addRippleEffect() {
  const buttons = document.querySelectorAll(
    ".support-option, .submit-button, .back-button"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      Object.assign(ripple.style, {
        position: "absolute",
        width: size + "px",
        height: size + "px",
        left: x + "px",
        top: y + "px",
        background: "rgba(255, 255, 255, 0.3)",
        borderRadius: "50%",
        transform: "scale(0)",
        animation: "ripple 0.6s ease-out",
        pointerEvents: "none",
      });

      // Garantir que o botão tenha position relative
      if (getComputedStyle(this).position === "static") {
        this.style.position = "relative";
      }

      this.appendChild(ripple);

      // Remover ripple após animação
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Função para adicionar animação de digitação
function addTypingAnimation() {
  const subtitle = document.querySelector(".app-subtitle");
  const originalText = subtitle.textContent;

  subtitle.textContent = "";

  let i = 0;
  const typeInterval = setInterval(() => {
    subtitle.textContent += originalText.charAt(i);
    i++;

    if (i >= originalText.length) {
      clearInterval(typeInterval);
    }
  }, 50);
}

// Função para detectar scroll no formulário
function handleFormScroll() {
  const supportOptions = document.querySelector(".support-options");
  const contactForm = document.getElementById("contactForm");

  // Observer para detectar quando o formulário fica visível
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = "slideInUp 0.6s ease forwards";
      }
    });
  });

  // Observar o formulário quando ele estiver ativo
  const formObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        if (contactForm.classList.contains("active")) {
          observer.observe(contactForm);
        } else {
          observer.unobserve(contactForm);
        }
      }
    });
  });

  formObserver.observe(contactForm, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

// Função para gerenciar estado da aplicação
const AppState = {
  isFormOpen: false,

  openForm() {
    this.isFormOpen = true;
    document.getElementById("contactForm").classList.add("active");
  },

  closeForm() {
    this.isFormOpen = false;
    document.getElementById("contactForm").classList.remove("active");
  },

  toggleForm() {
    if (this.isFormOpen) {
      this.closeForm();
    } else {
      this.openForm();
    }
  },
};

// Função para adicionar atalhos de teclado
function addKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // ESC para fechar formulário
    if (e.key === "Escape" && AppState.isFormOpen) {
      AppState.closeForm();
    }

    // Ctrl/Cmd + Enter para enviar formulário
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && AppState.isFormOpen) {
      const form = document.querySelector("#contactForm form");
      if (form) {
        form.dispatchEvent(new Event("submit"));
      }
    }
  });
}

// Função para salvar rascunho do formulário
function setupFormDraft() {
  const form = document.querySelector("#contactForm form");
  const inputs = form.querySelectorAll(".input-field, .textarea-field");

  // Carregar rascunho salvo
  inputs.forEach((input) => {
    const savedValue = localStorage.getItem(
      `draft_${input.name || input.type}`
    );
    if (savedValue) {
      input.value = savedValue;
    }

    // Salvar automaticamente enquanto digita
    input.addEventListener("input", () => {
      localStorage.setItem(`draft_${input.name || input.type}`, input.value);
    });
  });

  // Limpar rascunho após envio
  form.addEventListener("submit", () => {
    inputs.forEach((input) => {
      localStorage.removeItem(`draft_${input.name || input.type}`);
    });
  });
}

// Função para adicionar feedback tátil (vibração)
function addHapticFeedback() {
  const buttons = document.querySelectorAll(
    ".support-option, .submit-button, .back-button"
  );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Vibração leve em dispositivos móveis
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

// Função principal de inicialização
function initializeApp() {
  // Aguardar carregamento completo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
    return;
  }

  // Inicializar todas as funcionalidades
  animateElementsOnLoad();
  addRippleEffect();
  addFormBackButtonRipple();
  addRealTimeValidation();
  handleFormScroll();
  addKeyboardShortcuts();
  addHapticFeedback();

  // Adicionar animação de digitação após delay
  setTimeout(addTypingAnimation, 1000);

  // Configurar rascunho apenas se localStorage estiver disponível
  if (typeof Storage !== "undefined") {
    setupFormDraft();
  }

  console.log("Página de Suporte inicializada com sucesso!");
}

// Função para cleanup ao sair da página
function cleanup() {
  // Remover event listeners se necessário
  console.log("Cleanup executado");
}

// Event listeners para ciclo de vida da página
window.addEventListener("beforeunload", cleanup);

// Atualizar função toggleContactForm para usar AppState
function toggleContactForm() {
  AppState.toggleForm();

  if (AppState.isFormOpen) {
    document.getElementById("contactForm").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}

// Função para adicionar efeito ripple no botão de voltar do formulário
function addFormBackButtonRipple() {
  const formBackButton = document.querySelector(".form-back-button");

  if (formBackButton) {
    formBackButton.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      Object.assign(ripple.style, {
        position: "absolute",
        width: size + "px",
        height: size + "px",
        left: x + "px",
        top: y + "px",
        background: "rgba(120, 119, 198, 0.3)",
        borderRadius: "50%",
        transform: "scale(0)",
        animation: "ripple 0.6s ease-out",
        pointerEvents: "none",
      });

      this.style.position = "relative";
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }
}

// Adicionar CSS para animação de ripple
const rippleStyles = document.createElement("style");
rippleStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .field-error {
    animation: shake 0.3s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(rippleStyles);

// Inicializar aplicação
initializeApp();
