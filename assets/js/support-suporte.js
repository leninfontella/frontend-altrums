// ========== CONFIGURAÇÃO ==========
const SUPPORT_CONFIG = {
  whatsapp: {
    number: "5551989134037", // Substitua pelo número real (código do país + DDD + número)
    message: "Olá! Preciso de ajuda com o Altrum Coins.",
  },
  email: {
    address: "suporte@leninfontella.com",
    subject: "Suporte Altrum Coins",
    body: "Olá, gostaria de ajuda com:",
  },
  socialMedia: {
    instagram: "https://instagram.com/altrumcoins",
    youtube: "https://youtube.com/@altrumcoins",
    facebook: "https://facebook.com/altrumcoins",
    discord: "https://discord.gg/altrumcoins",
    tiktok: "https://tiktok.com/@altrumcoins",
    twitter: "https://x.com/altrumcoins",
    linkedin: "https://linkedin.com/company/altrumcoins",
    telegram: "https://t.me/altrumcoins",
  },
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Inicializando página de suporte...");

  initializeSupport();
  setupContactOptions();
  setupSocialMedia();
  animateOnLoad();

  console.log("✅ Página de suporte inicializada!");
});

// ========== FUNÇÃO PRINCIPAL ==========
function initializeSupport() {
  console.log("⚙️ Configurando suporte...");

  // Verificar se o usuário está autenticado
  checkAuthentication();

  // Configurar eventos
  setupBackButton();
}

// ========== VERIFICAÇÃO DE AUTENTICAÇÃO ==========
function checkAuthentication() {
  // Verificar se existe módulo Auth global
  if (
    typeof Auth !== "undefined" &&
    Auth.isAuthenticated &&
    !Auth.isAuthenticated()
  ) {
    console.warn("⚠️ Usuário não autenticado");
    // Opcional: redirecionar para login
    // window.location.href = '/login.html';
  }
}

// ========== NAVEGAÇÃO ==========
function setupBackButton() {
  const backButton = document.getElementById("go-back");

  if (backButton) {
    backButton.addEventListener("click", function () {
      // Adicionar feedback visual
      this.style.transform = "scale(0.9)";

      setTimeout(() => {
        this.style.transform = "";

        // Voltar para a página anterior ou perfil
        if (document.referrer) {
          window.history.back();
        } else {
          window.location.href = "../profile/html/profile.html";
        }
      }, 150);
    });
  }
}

// ========== OPÇÕES DE CONTATO ==========
function setupContactOptions() {
  const whatsappOption = document.getElementById("whatsapp-option");
  const emailOption = document.getElementById("email-option");

  if (whatsappOption) {
    whatsappOption.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsApp();
    });
  }

  if (emailOption) {
    emailOption.addEventListener("click", function (e) {
      e.preventDefault();
      openEmail();
    });
  }
}

function openWhatsApp() {
  console.log("📱 Abrindo WhatsApp...");

  const { number, message } = SUPPORT_CONFIG.whatsapp;
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${number}?text=${encodedMessage}`;

  // Feedback visual
  showNotification("Abrindo WhatsApp...", "success");

  // Abrir WhatsApp
  window.open(url, "_blank");

  // Registrar evento (analytics opcional)
  logSupportEvent("whatsapp_opened");
}

function openEmail() {
  console.log("📧 Abrindo cliente de e-mail...");

  const { address, subject, body } = SUPPORT_CONFIG.email;
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  const url = `mailto:${address}?subject=${encodedSubject}&body=${encodedBody}`;

  // Feedback visual
  showNotification("Abrindo e-mail...", "success");

  // Abrir cliente de e-mail
  window.location.href = url;

  // Registrar evento (analytics opcional)
  logSupportEvent("email_opened");
}

// ========== REDES SOCIAIS ==========
function setupSocialMedia() {
  const socialLinks = document.querySelectorAll(".social-link");

  socialLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const platform = this.classList[1]; // instagram, youtube, etc.
      openSocialMedia(platform, this);
    });
  });
}

function openSocialMedia(platform, element) {
  console.log(`🌐 Abrindo ${platform}...`);

  const url = SUPPORT_CONFIG.socialMedia[platform];

  if (url) {
    // Feedback visual
    addClickAnimation(element);
    showNotification(`Abrindo ${platform}...`, "info");

    // Abrir rede social
    setTimeout(() => {
      window.open(url, "_blank");
    }, 200);

    // Registrar evento
    logSupportEvent("social_media_opened", { platform });
  } else {
    console.warn(`⚠️ URL não configurada para ${platform}`);
    showNotification("Link não disponível no momento", "warning");
  }
}

// ========== ANIMAÇÕES ==========
function animateOnLoad() {
  // Animar hero section
  const heroSection = document.querySelector(".hero-section");
  if (heroSection) {
    heroSection.style.opacity = "0";
    heroSection.style.transform = "translateY(20px)";

    setTimeout(() => {
      heroSection.style.transition = "all 0.6s ease";
      heroSection.style.opacity = "1";
      heroSection.style.transform = "translateY(0)";
    }, 100);
  }

  // Animar cards com delay
  const cards = document.querySelectorAll(".support-option, .info-card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 200 + index * 50);
  });

  // Animar ícones sociais
  const socialLinks = document.querySelectorAll(".social-link");
  socialLinks.forEach((link, index) => {
    link.style.opacity = "0";
    link.style.transform = "scale(0.8)";

    setTimeout(() => {
      link.style.transition = "all 0.4s ease";
      link.style.opacity = "1";
      link.style.transform = "scale(1)";
    }, 400 + index * 30);
  });
}

function addClickAnimation(element) {
  if (!element) return;

  element.style.transform = "scale(0.95)";
  element.style.transition = "transform 0.15s ease";

  setTimeout(() => {
    element.style.transform = "";
    element.style.transition = "all 0.3s ease";
  }, 150);
}

// ========== NOTIFICAÇÕES ==========
function showNotification(message, type = "info") {
  console.log(`📢 Notificação (${type}):`, message);

  // Criar elemento de notificação
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos inline
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background:
      type === "success"
        ? "linear-gradient(135deg, #00ff88, #00cc66)"
        : type === "warning"
        ? "linear-gradient(135deg, #ffaa00, #cc8800)"
        : type === "error"
        ? "linear-gradient(135deg, #ff4444, #cc0000)"
        : "linear-gradient(135deg, #00d4ff, #0099cc)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    zIndex: "9999",
    animation: "slideDown 0.3s ease",
    maxWidth: "90%",
    textAlign: "center",
  });

  // Adicionar ao body
  document.body.appendChild(notification);

  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideUp 0.3s ease";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Adicionar estilos de animação
const style = document.createElement("style");
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`;
document.head.appendChild(style);

// ========== ANALYTICS E LOGGING ==========
function logSupportEvent(eventName, data = {}) {
  const eventData = {
    event: eventName,
    timestamp: new Date().toISOString(),
    page: "support",
    ...data,
  };

  console.log("📊 Evento registrado:", eventData);

  // Aqui você pode integrar com Google Analytics, Mixpanel, etc.
  // Exemplo:
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, data);
  // }

  // Ou salvar localmente para análise
  try {
    const events = JSON.parse(localStorage.getItem("support_events") || "[]");
    events.push(eventData);
    localStorage.setItem("support_events", JSON.stringify(events.slice(-50))); // Manter últimos 50
  } catch (error) {
    console.warn("⚠️ Erro ao salvar evento:", error);
  }
}

// ========== FUNÇÕES AUXILIARES ==========
function formatPhoneNumber(number) {
  // Remove caracteres não numéricos
  const cleaned = number.replace(/\D/g, "");

  // Formata para padrão internacional
  if (cleaned.length === 13) {
    // +55 34 999999999
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(
      4,
      9
    )}-${cleaned.slice(9)}`;
  }

  return number;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showNotification("Copiado para área de transferência!", "success");
      })
      .catch((err) => {
        console.error("❌ Erro ao copiar:", err);
        showNotification("Erro ao copiar", "error");
      });
  } else {
    // Fallback para navegadores antigos
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      showNotification("Copiado para área de transferência!", "success");
    } catch (err) {
      console.error("❌ Erro ao copiar:", err);
      showNotification("Erro ao copiar", "error");
    }

    document.body.removeChild(textArea);
  }
}

// ========== DEBUG ==========
function debugSupport() {
  console.log("🔧 DEBUG - Configuração de Suporte:");
  console.log("WhatsApp:", SUPPORT_CONFIG.whatsapp);
  console.log("E-mail:", SUPPORT_CONFIG.email);
  console.log("Redes Sociais:", SUPPORT_CONFIG.socialMedia);

  const events = JSON.parse(localStorage.getItem("support_events") || "[]");
  console.log("Eventos registrados:", events);
}

// ========== EXPOSIÇÃO GLOBAL ==========
if (typeof window !== "undefined") {
  window.openWhatsApp = openWhatsApp;
  window.openEmail = openEmail;
  window.openSocialMedia = openSocialMedia;
  window.showNotification = showNotification;
  window.debugSupport = debugSupport;
  window.copyToClipboard = copyToClipboard;
}

// ========== LOG INICIAL ==========
console.log(`
🎯 Sistema de Suporte Altrum Coins
📱 WhatsApp: ${SUPPORT_CONFIG.whatsapp.number}
📧 E-mail: ${SUPPORT_CONFIG.email.address}
🌐 Redes Sociais: 8 plataformas configuradas
🛠️ Debug: debugSupport()
📋 Copiar: copyToClipboard(text)
`);
