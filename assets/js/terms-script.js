// ========== INICIALIZAÇÃO ==========

document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 Página de Termos de Uso carregada");

  initializeBackButton();
  addScrollAnimations();
  trackReadTime();
});

// ========== BOTÃO VOLTAR ==========

function initializeBackButton() {
  const backButton = document.getElementById("go-back");

  if (backButton) {
    backButton.addEventListener("click", function () {
      // Efeito visual de clique
      this.style.transform = "scale(0.95)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);

      // Navegar de volta
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          // Se não houver histórico, voltar para configurações
          window.location.href = "/pages/configuracao/html/index.html";
        }
      }, 150);

      console.log("🔙 Voltando para página anterior");
    });
  }
}

// ========== ANIMAÇÕES DE SCROLL ==========

function addScrollAnimations() {
  // Observer para animar seções quando entram na viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  // Observar todas as seções
  const sections = document.querySelectorAll(".terms-section");
  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    observer.observe(section);
  });

  console.log(`👁️ Observando ${sections.length} seções para animação`);
}

// ========== RASTREAMENTO DE TEMPO DE LEITURA ==========

function trackReadTime() {
  let startTime = Date.now();
  let hasScrolledToBottom = false;

  // Detectar quando usuário chega ao final
  window.addEventListener("scroll", function () {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;

    // Considerar "final" quando chegar a 90% da página
    if (scrollPosition >= documentHeight * 0.9 && !hasScrolledToBottom) {
      hasScrolledToBottom = true;
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      console.log(`✅ Usuário leu os termos por ${timeSpent} segundos`);

      // Aqui você pode enviar analytics
      logTermsReading(timeSpent);
    }
  });
}

function logTermsReading(timeSpent) {
  // Salvar no sessionStorage que o usuário leu os termos
  sessionStorage.setItem("termsReadTime", timeSpent);
  sessionStorage.setItem("termsReadDate", new Date().toISOString());

  console.log("💾 Leitura dos termos salva:", {
    timeSpent: `${timeSpent}s`,
    date: new Date().toLocaleString("pt-BR"),
  });

  // Mostrar notificação sutil
  showReadConfirmation();
}

function showReadConfirmation() {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    padding: 14px 24px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(34, 197, 94, 0.5);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideUpNotification 0.4s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Termos visualizados</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideDownNotification 0.4s ease forwards";
    setTimeout(() => notification.remove(), 400);
  }, 2500);
}

// ========== HIGHLIGHT DE TEXTO ==========

// Destacar palavras importantes ao passar o mouse
document.addEventListener("DOMContentLoaded", function () {
  const strongElements = document.querySelectorAll(".section-text strong");

  strongElements.forEach((element) => {
    element.addEventListener("mouseenter", function () {
      this.style.textShadow = "0 0 10px rgba(0, 212, 255, 0.5)";
      this.style.transform = "scale(1.02)";
      this.style.display = "inline-block";
      this.style.transition = "all 0.3s ease";
    });

    element.addEventListener("mouseleave", function () {
      this.style.textShadow = "";
      this.style.transform = "";
    });
  });
});

// ========== COPIAR SEÇÃO ==========

// Adicionar funcionalidade de copiar texto da seção (útil para usuários)
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".terms-section");

  sections.forEach((section) => {
    section.addEventListener("dblclick", function () {
      const text = this.querySelector(".section-content").textContent;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          showCopyNotification();
        });
      }
    });
  });
});

function showCopyNotification() {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.5);
    z-index: 10001;
    animation: slideDownNotification 0.4s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-copy" style="margin-right: 8px;"></i>
    Texto copiado!
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideUpNotification 0.4s ease forwards";
    setTimeout(() => notification.remove(), 400);
  }, 2000);
}

// ========== ANIMAÇÕES CSS ==========

const style = document.createElement("style");
style.textContent = `
  @keyframes slideUpNotification {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideDownNotification {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
`;
document.head.appendChild(style);

// ========== INFORMAÇÕES DE DEBUG ==========

console.log("✅ Termos de Uso carregados com sucesso!");
console.log("💡 Dicas:", {
  "Duplo clique": "Duplo clique em qualquer seção para copiar o texto",
  Scroll: "Role até o final para marcar como lido",
  Voltar: "Clique no botão voltar para retornar",
});

// ========== UTILITÁRIOS ==========

// Função para verificar se usuário já leu os termos
window.hasReadTerms = function () {
  const readTime = sessionStorage.getItem("termsReadTime");
  const readDate = sessionStorage.getItem("termsReadDate");

  if (readTime && readDate) {
    console.log("📖 Termos já foram lidos:", {
      tempo: `${readTime}s`,
      data: new Date(readDate).toLocaleString("pt-BR"),
    });
    return true;
  }

  return false;
};

// Função para limpar histórico de leitura
window.clearTermsHistory = function () {
  sessionStorage.removeItem("termsReadTime");
  sessionStorage.removeItem("termsReadDate");
  console.log("🗑️ Histórico de leitura dos termos limpo");
};

// Verificar ao carregar se já leu antes
if (window.hasReadTerms()) {
  console.log("👤 Usuário retornando - já leu os termos anteriormente");
}
