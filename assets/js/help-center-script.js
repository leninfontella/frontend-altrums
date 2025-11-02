// ========== DADOS FAQ ==========

const faqData = [
  {
    id: 1,
    category: "account",
    icon: "fas fa-user-circle",
    question: "Como faço para criar uma conta?",
    answer:
      "Para criar uma conta no Altrum, clique no botão 'Criar Conta' na página inicial, preencha seus dados pessoais (nome, e-mail e senha), confirme seu e-mail através do link enviado e pronto! Sua conta estará ativa e você poderá começar a usar todos os recursos da plataforma.",
    keywords: ["criar conta", "registro", "cadastro", "nova conta", "sign up"],
  },
  {
    id: 2,
    category: "account",
    icon: "fas fa-key",
    question: "Esqueci minha senha, como recupero?",
    answer:
      "Na tela de login, clique em 'Esqueci minha senha'. Digite o e-mail cadastrado e você receberá um link para redefinir sua senha. O link é válido por 24 horas. Após criar uma nova senha, você poderá fazer login normalmente.",
    keywords: [
      "senha",
      "esqueci senha",
      "recuperar senha",
      "redefinir senha",
      "reset",
    ],
  },
  {
    id: 3,
    category: "account",
    icon: "fas fa-user-edit",
    question: "Como edito meu perfil?",
    answer:
      "Acesse Configurações > Editar Perfil. Lá você pode alterar seu nome, foto, biografia, links das redes sociais e outras informações públicas. Não se esqueça de clicar em 'Salvar Alterações' ao finalizar.",
    keywords: [
      "editar perfil",
      "alterar dados",
      "mudar foto",
      "atualizar perfil",
    ],
  },
  {
    id: 4,
    category: "donations",
    icon: "fas fa-donate",
    question: "Como recebo doações?",
    answer:
      "Após criar sua conta, você automaticamente recebe um link único de doação (altrum.com/seu-usuario). Compartilhe este link nas suas redes sociais ou onde quiser. Quando alguém acessar e doar, você receberá uma notificação e o valor será creditado na sua carteira virtual.",
    keywords: [
      "receber doação",
      "link doação",
      "como ganhar",
      "carteira",
      "dinheiro",
    ],
  },
  {
    id: 5,
    category: "donations",
    icon: "fas fa-money-bill-wave",
    question: "Qual o valor mínimo para saque?",
    answer:
      "O valor mínimo para solicitar um saque é de R$ 20,00. Você pode sacar via PIX (instantâneo) ou transferência bancária (1-2 dias úteis). Não cobramos taxas para saques acima de R$ 50,00.",
    keywords: ["saque", "retirar", "valor mínimo", "pix", "transferência"],
  },
  {
    id: 6,
    category: "donations",
    icon: "fas fa-chart-line",
    question: "Como acompanho minhas doações?",
    answer:
      "Na tela principal do app, você verá um dashboard com todas as suas estatísticas: total recebido, número de doadores, doações recentes e gráficos de evolução. Também pode acessar um relatório detalhado em 'Histórico de Doações'.",
    keywords: [
      "histórico",
      "acompanhar",
      "estatísticas",
      "dashboard",
      "relatório",
    ],
  },
  {
    id: 7,
    category: "security",
    icon: "fas fa-shield-alt",
    question: "Minha conta está segura?",
    answer:
      "Sim! Utilizamos criptografia de ponta a ponta, autenticação de dois fatores (2FA), e todos os dados são armazenados em servidores seguros com certificação SSL. Recomendamos ativar o 2FA em Configurações > Segurança para proteção adicional.",
    keywords: ["segurança", "proteção", "2fa", "criptografia", "dados seguros"],
  },
  {
    id: 8,
    category: "security",
    icon: "fas fa-mobile-alt",
    question: "O que é autenticação de dois fatores (2FA)?",
    answer:
      "2FA é uma camada extra de segurança que requer não apenas sua senha, mas também um código temporário enviado para seu celular ou app autenticador. Isso impede que outras pessoas acessem sua conta mesmo se souberem sua senha.",
    keywords: ["2fa", "dois fatores", "autenticação", "código", "segurança"],
  },
  {
    id: 9,
    category: "security",
    icon: "fas fa-fingerprint",
    question: "Como ativo a biometria?",
    answer:
      "Vá em Configurações > Segurança > Biometria e ative a opção. Você precisará confirmar sua identidade com sua digital ou Face ID. Após ativado, você poderá fazer login rapidamente usando sua biometria ao invés de digitar a senha.",
    keywords: [
      "biometria",
      "digital",
      "face id",
      "impressão digital",
      "login rápido",
    ],
  },
  {
    id: 10,
    category: "technical",
    icon: "fas fa-bell",
    question: "Não estou recebendo notificações",
    answer:
      "Verifique se as notificações estão ativadas em Configurações > Notificações. Também cheque as configurações do seu dispositivo: Android (Configurações > Apps > Altrum > Notificações) ou iOS (Ajustes > Notificações > Altrum). Se o problema persistir, tente desinstalar e reinstalar o app.",
    keywords: [
      "notificações",
      "push",
      "alertas",
      "não recebo",
      "problema notificação",
    ],
  },
  {
    id: 11,
    category: "technical",
    icon: "fas fa-sync-alt",
    question: "O app está lento ou travando",
    answer:
      "Experimente limpar o cache em Configurações > Dados e Backup > Limpar Cache. Se não resolver, feche completamente o app e abra novamente. Certifique-se de que está usando a versão mais recente. Em casos extremos, reinstale o aplicativo.",
    keywords: ["lento", "travando", "cache", "app lento", "performance", "bug"],
  },
  {
    id: 12,
    category: "technical",
    icon: "fas fa-exclamation-triangle",
    question: "Encontrei um bug, como reporto?",
    answer:
      "Agradecemos por nos ajudar a melhorar! Você pode reportar bugs através do chat ao vivo, enviando e-mail para bugs@altrum.com, ou entrando em contato via WhatsApp. Descreva o problema detalhadamente e, se possível, envie prints de tela.",
    keywords: ["bug", "erro", "problema", "reportar", "suporte técnico"],
  },
  {
    id: 13,
    category: "account",
    icon: "fas fa-user-times",
    question: "Como excluo minha conta?",
    answer:
      "Para excluir sua conta, vá em Configurações > Ações da Conta > Excluir Conta. Você precisará confirmar sua senha e todos os seus dados serão permanentemente removidos em até 30 dias. Esta ação não pode ser desfeita.",
    keywords: ["excluir conta", "deletar", "remover conta", "apagar conta"],
  },
  {
    id: 14,
    category: "donations",
    icon: "fas fa-percentage",
    question: "Vocês cobram taxas?",
    answer:
      "Cobramos uma pequena taxa de 3.5% sobre cada doação recebida para manter a plataforma. Saques via PIX acima de R$ 50 são gratuitos. Abaixo disso, há uma taxa de R$ 2,00. Transferência bancária tem taxa fixa de R$ 3,50.",
    keywords: ["taxas", "comissão", "custos", "quanto cobram", "preço"],
  },
  {
    id: 15,
    category: "account",
    icon: "fas fa-globe",
    question: "Posso mudar o idioma do app?",
    answer:
      "Sim! Vá em Configurações > Idioma e escolha entre Português, Inglês, Espanhol, Francês, Alemão, Italiano, Japonês e Chinês. O app será atualizado automaticamente com o idioma selecionado.",
    keywords: ["idioma", "linguagem", "tradução", "language", "mudar idioma"],
  },
];

// ========== DADOS DOS TUTORIAIS ==========

const tutorialsData = {
  "getting-started": {
    title: "🚀 Primeiros Passos no Altrum",
    steps: [
      {
        title: "Crie sua conta",
        content:
          "Acesse altrum.com e clique em 'Criar Conta'. Preencha seus dados básicos: nome completo, e-mail válido e uma senha forte (mínimo 8 caracteres com letras e números).",
        tip: "Use um e-mail que você acessa frequentemente para não perder notificações importantes!",
      },
      {
        title: "Confirme seu e-mail",
        content:
          "Verifique sua caixa de entrada (e spam!) para o e-mail de confirmação. Clique no link de ativação. Este passo é essencial para garantir a segurança da sua conta.",
        tip: "Se não receber o e-mail em 5 minutos, clique em 'Reenviar e-mail de confirmação'.",
      },
      {
        title: "Complete seu perfil",
        content:
          "Adicione uma foto de perfil profissional, escreva uma biografia cativante e adicione links das suas redes sociais. Quanto mais completo seu perfil, mais confiança você transmite aos doadores.",
        tip: "Perfis com foto recebem 3x mais doações do que perfis sem foto!",
      },
      {
        title: "Compartilhe seu link",
        content:
          "Seu link único de doação estará disponível em 'Meu Perfil'. Copie e compartilhe nas suas redes sociais, bio do Instagram, descrição do YouTube ou onde você quiser. Exemplo: altrum.com/seu-usuario",
        tip: "Adicione uma chamada para ação como 'Me apoie no Altrum!' junto com o link.",
      },
      {
        title: "Configure notificações",
        content:
          "Ative as notificações push em Configurações > Notificações para ser alertado instantaneamente quando receber uma doação. Você nunca perderá nenhuma contribuição!",
        tip: "Recomendamos deixar pelo menos as notificações de doações ativadas.",
      },
    ],
  },
  "receive-donations": {
    title: "💰 Como Receber Doações",
    steps: [
      {
        title: "Entenda como funciona",
        content:
          "Doadores acessam seu link único e podem fazer contribuições usando cartão de crédito, PIX ou carteira digital. O valor é processado instantaneamente e creditado na sua carteira Altrum.",
        tip: "Você pode personalizar valores sugeridos de doação em Configurações.",
      },
      {
        title: "Divulgue estrategicamente",
        content:
          "Não basta apenas ter um link - você precisa divulgá-lo! Adicione na bio das redes sociais, mencione em vídeos/posts, crie conteúdo exclusivo para apoiadores e agradeça publicamente quem doa.",
        tip: "Criadores que divulgam ativamente recebem 10x mais doações!",
      },
      {
        title: "Ofereça contrapartidas",
        content:
          "Incentive doações oferecendo algo em troca: acesso a conteúdo exclusivo, menções, agradecimentos personalizados ou participação em lives especiais.",
        tip: "Doadores adoram sentir que fazem parte de algo especial!",
      },
      {
        title: "Acompanhe suas métricas",
        content:
          "Use o dashboard para entender de onde vêm suas doações, horários de pico e perfil dos doadores. Isso ajuda a otimizar sua estratégia de divulgação.",
        tip: "Verifique o dashboard semanalmente para identificar padrões.",
      },
      {
        title: "Solicite saques",
        content:
          "Quando atingir o valor mínimo de R$ 20, você pode sacar via PIX (instantâneo) ou transferência bancária. Acesse Carteira > Solicitar Saque e siga as instruções.",
        tip: "Saques via PIX acima de R$ 50 não têm taxa!",
      },
    ],
  },
  "secure-account": {
    title: "🔒 Protegendo sua Conta",
    steps: [
      {
        title: "Use uma senha forte",
        content:
          "Crie uma senha com pelo menos 12 caracteres, combinando letras maiúsculas, minúsculas, números e símbolos. Nunca use a mesma senha de outras plataformas.",
        tip: "Use um gerenciador de senhas como Bitwarden ou 1Password para criar e guardar senhas seguras.",
      },
      {
        title: "Ative autenticação de dois fatores (2FA)",
        content:
          "Vá em Configurações > Segurança > 2FA e ative. Você receberá códigos temporários no seu celular sempre que fizer login. Isso impede acessos não autorizados mesmo se alguém souber sua senha.",
        tip: "Use um app autenticador como Google Authenticator para mais segurança.",
      },
      {
        title: "Configure biometria",
        content:
          "Se seu dispositivo suporta, ative login por biometria (impressão digital ou Face ID). É mais rápido e seguro que digitar senha toda vez.",
        tip: "A biometria funciona offline e é mais segura que senhas numéricas.",
      },
      {
        title: "Verifique sessões ativas",
        content:
          "Em Configurações > Segurança > Sessões Ativas, você pode ver todos os dispositivos conectados à sua conta. Se ver algo suspeito, desconecte imediatamente e mude sua senha.",
        tip: "Faça essa verificação mensalmente para garantir que ninguém mais está acessando.",
      },
      {
        title: "Nunca compartilhe dados sensíveis",
        content:
          "O Altrum NUNCA pedirá sua senha por e-mail ou telefone. Cuidado com e-mails de phishing e links suspeitos. Sempre acesse o app pelo link oficial ou app das lojas.",
        tip: "Em caso de dúvida, entre em contato diretamente com nosso suporte oficial.",
      },
    ],
  },
};

// ========== INICIALIZAÇÃO ==========

document.addEventListener("DOMContentLoaded", function () {
  // console.log("🎓 Central de Ajuda inicializada");

  // Debug: verificar se elementos existem
  // console.log("🔍 Debug - Elementos encontrados:");
  // console.log(
  //   "  - Contact buttons:",
  //   document.querySelectorAll(".contact-button").length
  // );
  // console.log(
  //   "  - Contact cards:",
  //   document.querySelectorAll(".contact-card").length
  // );
  // console.log("  - FAQ items:", document.querySelectorAll(".faq-item").length);

  initializeBackButton();
  initializeSearch();
  renderFAQ(faqData);
  initializeTutorials();
  initializeContactButtons();
  initializeLegalModals();

  // console.log("✅ Todas as funções inicializadas!");
});

// ========== BOTÃO VOLTAR ==========

function initializeBackButton() {
  const backButton = document.getElementById("go-back");
  if (backButton) {
    backButton.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/pages/configuracao/html/index.html";
      }
    });
  }
}

// ========== SISTEMA DE BUSCA ==========

function initializeSearch() {
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  const searchSuggestions = document.getElementById("search-suggestions");

  if (!searchInput) return;

  let searchTimeout;

  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    if (query) {
      searchClear.style.display = "flex";
    } else {
      searchClear.style.display = "none";
      searchSuggestions.classList.remove("active");
      searchSuggestions.innerHTML = "";
      filterFAQ("");
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  searchClear.addEventListener("click", function () {
    searchInput.value = "";
    searchClear.style.display = "none";
    searchSuggestions.classList.remove("active");
    searchSuggestions.innerHTML = "";
    filterFAQ("");
    searchInput.focus();
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim().toLowerCase();
      if (query) {
        performSearch(query);
        searchSuggestions.classList.remove("active");
      }
    }
  });
}

function performSearch(query) {
  // console.log("🔍 Buscando por:", query);
  filterFAQ(query);
  showSearchSuggestions(query);
}

function showSearchSuggestions(query) {
  const searchSuggestions = document.getElementById("search-suggestions");
  if (!searchSuggestions) return;

  const matches = faqData.filter((item) => {
    const questionMatch = item.question.toLowerCase().includes(query);
    const answerMatch = item.answer.toLowerCase().includes(query);
    const keywordMatch = item.keywords.some((keyword) =>
      keyword.includes(query)
    );
    return questionMatch || answerMatch || keywordMatch;
  });

  if (matches.length > 0) {
    searchSuggestions.innerHTML = matches
      .slice(0, 5)
      .map(
        (item) => `
      <div class="suggestion-item" data-faq-id="${item.id}">
        <i class="${item.icon}"></i>
        <span>${item.question}</span>
      </div>
    `
      )
      .join("");

    searchSuggestions.classList.add("active");

    searchSuggestions.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", function () {
        const faqId = parseInt(this.getAttribute("data-faq-id"));
        scrollToFAQ(faqId);
        searchSuggestions.classList.remove("active");
      });
    });
  } else {
    searchSuggestions.classList.remove("active");
  }
}

function filterFAQ(query) {
  const faqItems = document.querySelectorAll(".faq-item");
  const noResults = document.getElementById("no-results");
  let visibleCount = 0;

  faqItems.forEach((item) => {
    const question = item
      .querySelector(".faq-question h3")
      .textContent.toLowerCase();
    const answer = item
      .querySelector(".faq-answer-content")
      .textContent.toLowerCase();

    if (!query || question.includes(query) || answer.includes(query)) {
      item.classList.remove("hidden");
      visibleCount++;
    } else {
      item.classList.add("hidden");
    }
  });

  if (noResults) {
    if (visibleCount === 0 && query) {
      noResults.style.display = "block";
    } else {
      noResults.style.display = "none";
    }
  }
}

function scrollToFAQ(faqId) {
  const faqItem = document.querySelector(`[data-faq-id="${faqId}"]`);
  if (faqItem && faqItem.classList.contains("faq-item")) {
    faqItem.scrollIntoView({ behavior: "smooth", block: "center" });

    if (!faqItem.classList.contains("active")) {
      faqItem.classList.add("active");
    }

    faqItem.style.background = "rgba(0, 212, 255, 0.1)";
    setTimeout(() => {
      faqItem.style.background = "";
    }, 2000);
  }
}

// ========== RENDERIZAR FAQ ==========

function renderFAQ(data) {
  const faqContainer = document.getElementById("faq-container");
  if (!faqContainer) return;

  faqContainer.innerHTML = data
    .map(
      (item) => `
    <div class="faq-item" data-faq-id="${item.id}" data-category="${item.category}">
      <div class="faq-question">
        <div class="faq-question-text">
          <div class="faq-icon">
            <i class="${item.icon}"></i>
          </div>
          <h3>${item.question}</h3>
        </div>
        <div class="faq-toggle">
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-content">
          ${item.answer}
        </div>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", function () {
      const faqItem = this.closest(".faq-item");
      const isActive = faqItem.classList.contains("active");

      document.querySelectorAll(".faq-item.active").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
        }
      });

      faqItem.classList.toggle("active");

      // console.log(
      //   `❓ FAQ ${isActive ? "fechado" : "aberto"}:`,
      //   faqItem.querySelector("h3").textContent
      // );
    });
  });

  // console.log(`✅ ${data.length} perguntas FAQ renderizadas`);
}

// ========== TUTORIAIS ==========

function initializeTutorials() {
  const tutorialCards = document.querySelectorAll(".tutorial-card");

  tutorialCards.forEach((card) => {
    card.addEventListener("click", function () {
      const tutorialId = this.getAttribute("data-tutorial");
      openTutorialModal(tutorialId);
    });
  });
}

function openTutorialModal(tutorialId) {
  const tutorial = tutorialsData[tutorialId];
  if (!tutorial) {
    console.warn("⚠️ Tutorial não encontrado:", tutorialId);
    return;
  }

  const modal = document.getElementById("tutorial-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = tutorial.title;
  modalBody.innerHTML = tutorial.steps
    .map(
      (step, index) => `
    <div class="tutorial-step">
      <div class="step-header">
        <div class="step-number">${index + 1}</div>
        <h4 class="step-title">${step.title}</h4>
      </div>
      <div class="step-content">
        <p>${step.content}</p>
        ${
          step.tip
            ? `
          <div class="step-tip">
            <i class="fas fa-lightbulb"></i>
            <p><strong>Dica:</strong> ${step.tip}</p>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  modal.classList.remove("hidden");
  modal.classList.remove("closing");
  document.body.style.overflow = "hidden";

  // console.log("📖 Tutorial aberto:", tutorial.title);
}

function closeTutorialModal() {
  const modal = document.getElementById("tutorial-modal");
  if (!modal) return;

  modal.classList.add("closing");
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("closing");
    document.body.style.overflow = "";
  }, 300);
}

// ========== BOTÕES DE CONTATO (CORRIGIDO) ==========

function initializeContactButtons() {
  // console.log("🔧 Inicializando botões de contato...");

  // Método 1: Via botões diretos
  const contactButtons = document.querySelectorAll(".contact-button");

  contactButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const card = this.closest(".contact-card");
      const contactType = card ? card.getAttribute("data-contact-type") : null;

      // console.log("📞 Botão clicado! Tipo:", contactType);

      if (contactType === "email") {
        // console.log("📧 Abrindo e-mail...");
        const mailtoLink =
          "mailto:suporte@altrum.com?subject=Solicitação de Suporte - Altrum&body=Olá, preciso de ajuda com:";
        window.location.href = mailtoLink;

        setTimeout(() => {
          showNotification("📧 Cliente de e-mail aberto!", "success");
        }, 100);
      } else if (contactType === "whatsapp") {
        // console.log("💬 Abrindo WhatsApp...");
        const whatsappNumber = "5511999999999";
        const message = encodeURIComponent(
          "Olá! Preciso de ajuda com o Altrum."
        );
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

        const newWindow = window.open(
          whatsappURL,
          "_blank",
          "noopener,noreferrer"
        );

        if (newWindow) {
          showNotification("💬 WhatsApp aberto em nova aba!", "success");
        } else {
          // Fallback se popup blocker estiver ativo
          window.location.href = whatsappURL;
        }
      } else {
        console.warn("⚠️ Tipo de contato desconhecido:", contactType);
      }
    });
  });

  // Método 2: Via cards inteiros (fallback)
  const contactCards = document.querySelectorAll(".contact-card");

  contactCards.forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", function (e) {
      // Só executa se não clicou diretamente no botão
      if (!e.target.closest(".contact-button")) {
        const button = this.querySelector(".contact-button");
        if (button) {
          button.click();
        }
      }
    });
  });

  // Resource links
  const resourceLinks = document.querySelectorAll(".resource-link");
  resourceLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const resourceType = this.getAttribute("data-resource");

      // console.log("📚 Resource link clicado:", resourceType);

      if (resourceType === "terms") {
        openTermsModal();
      } else if (resourceType === "privacy") {
        openPrivacyModal();
      }
    });
  });

  // console.log("✅ Botões de contato inicializados:", contactButtons.length);
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");

  const colors = {
    success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    info: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    warning: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  };

  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type] || colors.info};
    color: white;
    padding: 16px 28px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    animation: slideUpNotification 0.4s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideDownNotification 0.4s ease forwards";
    setTimeout(() => notification.remove(), 400);
  }, 2500);
}

// ========== GERENCIAMENTO DOS MODAIS LEGAIS ==========

function initializeLegalModals() {
  // console.log("⚖️ Modais legais inicializados");

  setupCloseButtons();
  setupEscapeKey();
  setupBackdropClose();
}

function openTermsModal() {
  const modal = document.getElementById("terms-modal");
  if (!modal) {
    console.warn("⚠️ Modal de Termos não encontrado");
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.remove("closing");
  document.body.style.overflow = "hidden";

  const modalBody = modal.querySelector(".legal-modal-body");
  if (modalBody) {
    modalBody.scrollTop = 0;
  }

  // console.log("📄 Modal de Termos de Uso aberto");
  showNotification("📄 Termos de Uso aberto!", "info");
}

function openPrivacyModal() {
  const modal = document.getElementById("privacy-modal");
  if (!modal) {
    console.warn("⚠️ Modal de Privacidade não encontrado");
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.remove("closing");
  document.body.style.overflow = "hidden";

  const modalBody = modal.querySelector(".legal-modal-body");
  if (modalBody) {
    modalBody.scrollTop = 0;
  }

  // console.log("🔒 Modal de Política de Privacidade aberto");
  showNotification("🔒 Política de Privacidade aberta!", "info");
}

function setupCloseButtons() {
  const closeTermsBtn = document.getElementById("close-terms-modal");
  if (closeTermsBtn) {
    closeTermsBtn.addEventListener("click", function () {
      closeLegalModal("terms-modal");
    });
  }

  const closePrivacyBtn = document.getElementById("close-privacy-modal");
  if (closePrivacyBtn) {
    closePrivacyBtn.addEventListener("click", function () {
      closeLegalModal("privacy-modal");
    });
  }

  const closeTutorialBtn = document.getElementById("close-tutorial-modal");
  if (closeTutorialBtn) {
    closeTutorialBtn.addEventListener("click", closeTutorialModal);
  }
}

function closeLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add("closing");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("closing");
    document.body.style.overflow = "";
  }, 300);

  // console.log(`✖️ Modal ${modalId} fechado`);
}

function setupEscapeKey() {
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const termsModal = document.getElementById("terms-modal");
      const privacyModal = document.getElementById("privacy-modal");
      const tutorialModal = document.getElementById("tutorial-modal");

      if (termsModal && !termsModal.classList.contains("hidden")) {
        closeLegalModal("terms-modal");
      } else if (privacyModal && !privacyModal.classList.contains("hidden")) {
        closeLegalModal("privacy-modal");
      } else if (tutorialModal && !tutorialModal.classList.contains("hidden")) {
        closeTutorialModal();
      }
    }
  });
}

function setupBackdropClose() {
  const termsModal = document.getElementById("terms-modal");
  if (termsModal) {
    const backdrop = termsModal.querySelector(".legal-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeLegalModal("terms-modal");
      });
    }
  }

  const privacyModal = document.getElementById("privacy-modal");
  if (privacyModal) {
    const backdrop = privacyModal.querySelector(".legal-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function () {
        closeLegalModal("privacy-modal");
      });
    }
  }

  const tutorialModal = document.getElementById("tutorial-modal");
  if (tutorialModal) {
    const backdrop = tutorialModal.querySelector(".tutorial-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeTutorialModal);
    }
  }
}

// ========== ANIMAÇÕES CSS ADICIONAIS ==========

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

// ========== UTILITÁRIOS ==========

// Fechar sugestões ao clicar fora
document.addEventListener("click", function (e) {
  const searchSection = document.querySelector(".search-section");
  const searchSuggestions = document.getElementById("search-suggestions");

  if (searchSection && !searchSection.contains(e.target)) {
    if (searchSuggestions) {
      searchSuggestions.classList.remove("active");
    }
  }
});

// Logs de debug
// console.log("✅ Central de Ajuda carregada com sucesso!");
// console.log("📊 Estatísticas:", {
//   "Total de FAQs": faqData.length,
//   "Total de Tutoriais": Object.keys(tutorialsData).length,
// });

// Função para adicionar novos FAQs dinamicamente (para admins)
window.addFAQ = function (faqItem) {
  faqData.push(faqItem);
  renderFAQ(faqData);
  // console.log("➕ Novo FAQ adicionado:", faqItem.question);
};

// Função para buscar FAQ por ID
window.getFAQById = function (id) {
  return faqData.find((item) => item.id === id);
};

// Função para exportar FAQs (para backup)
window.exportFAQs = function () {
  const dataStr = JSON.stringify(faqData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "faqs-backup.json";
  link.click();
  // console.log("💾 FAQs exportados com sucesso!");
};

// ========== HEADER & FOOTER FUNCTIONALITY ==========

class HeaderFooterManager {
  constructor() {
    this.header = document.getElementById("app-header");
    this.navLinks = document.querySelectorAll(".header-nav-link");
    this.notificationBtn = document.getElementById("header-notification-btn");
    this.notificationBadge = document.getElementById("notification-badge");
    this.footerLinks = document.querySelectorAll(".footer-link");
    this.lastScrollY = window.scrollY;

    this.init();
  }

  init() {
    this.setupScrollBehavior();
    this.setupActiveNavigation();
    this.setupNotifications();
    this.setupFooterLinks();
    this.setupSocialLinks();
  }

  // ========== SCROLL BEHAVIOR ==========
  setupScrollBehavior() {
    let ticking = false;

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;

    // Adicionar classe 'scrolled' quando rolar para baixo
    if (currentScrollY > 10) {
      this.header?.classList.add("scrolled");
    } else {
      this.header?.classList.remove("scrolled");
    }

    this.lastScrollY = currentScrollY;
  }

  // ========== ACTIVE NAVIGATION ==========
  setupActiveNavigation() {
    const currentPath = window.location.pathname;

    this.navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      // Remove active de todos
      link.classList.remove("active");

      // Adiciona active ao link atual
      if (href && currentPath.includes(href)) {
        link.classList.add("active");
      }
    });

    // Adicionar evento de clique para links placeholder
    this.navLinks.forEach((link) => {
      if (link.getAttribute("href") === "#") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const linkText = link.textContent.trim();

          if (typeof showNotification === "function") {
            showNotification(`Página de ${linkText} em breve!`, "info");
          } else {
            console.log(`Página de ${linkText} em desenvolvimento`);
          }
        });
      }
    });
  }

  // ========== NOTIFICAÇÕES ==========
  setupNotifications() {
    this.notificationBtn?.addEventListener("click", () => {
      this.handleNotificationClick();
    });

    // Inicializar contador em 0
    this.updateNotificationCount(0);
  }

  handleNotificationClick() {
    console.log("Abrindo notificações...");

    if (typeof showNotification === "function") {
      showNotification("Você não tem novas notificações", "info");
    }

    // Zerar contador
    this.updateNotificationCount(0);
  }

  updateNotificationCount(count) {
    if (!this.notificationBadge) return;

    if (count > 0) {
      this.notificationBadge.textContent = count > 99 ? "99+" : count;
      this.notificationBadge.style.display = "flex";
    } else {
      this.notificationBadge.style.display = "none";
    }
  }

  // Método público para adicionar notificação
  addNotification() {
    const currentCount = parseInt(this.notificationBadge?.textContent || "0");
    this.updateNotificationCount(currentCount + 1);
  }

  // Método público para limpar notificações
  clearNotifications() {
    this.updateNotificationCount(0);
  }

  // ========== FOOTER LINKS ==========
  setupFooterLinks() {
    this.footerLinks.forEach((link) => {
      if (link.getAttribute("href") === "#") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const linkText = link.textContent.trim();

          if (typeof showNotification === "function") {
            showNotification(`${linkText} em breve!`, "info");
          } else {
            console.log(`${linkText} em desenvolvimento`);
          }
        });
      }
    });
  }

  // ========== SOCIAL LINKS ==========
  setupSocialLinks() {
    const socialLinks = document.querySelectorAll(".footer-social-link");

    socialLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        // Se o href for '#', prevenir navegação
        if (link.getAttribute("href") === "#") {
          e.preventDefault();
          const platform = link.getAttribute("title");

          // Usar showNotification se disponível
          if (typeof showNotification === "function") {
            showNotification(`Link para ${platform} em breve!`, "info");
          } else {
            console.log(`Link para ${platform} em desenvolvimento`);
          }
        }
      });
    });
  }
}

// ========== INICIALIZAÇÃO ==========

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar gerenciador
  window.headerFooterManager = new HeaderFooterManager();

  // console.log("✅ Header & Footer inicializados com notificações");
});

// ========== INTEGRAÇÃO COM WEBSOCKET (OPCIONAL) ==========

// Se o WebSocket estiver disponível, conectar notificações em tempo real
if (typeof wsClient !== "undefined") {
  wsClient.on("notification", (data) => {
    if (window.headerFooterManager) {
      window.headerFooterManager.addNotification();
      if (typeof showNotification === "function") {
        showNotification(data.message || "Nova notificação", "info");
      }
    }
  });
}

// ========== HELPERS PÚBLICOS ==========

// Adicionar uma notificação ao contador
function addHeaderNotification() {
  if (window.headerFooterManager) {
    window.headerFooterManager.addNotification();
  }
}

// Limpar notificações
function clearHeaderNotifications() {
  if (window.headerFooterManager) {
    window.headerFooterManager.clearNotifications();
  }
}

// Exportar para uso global
window.HeaderFooterManager = HeaderFooterManager;
window.addHeaderNotification = addHeaderNotification;
window.clearHeaderNotifications = clearHeaderNotifications;

// Exportar funções globalmente para uso externo
window.openTermsModal = openTermsModal;
window.openPrivacyModal = openPrivacyModal;
window.closeLegalModal = closeLegalModal;
