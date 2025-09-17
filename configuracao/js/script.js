// Função principal para alternar switches
function toggleSwitch(element) {
  element.classList.toggle("active");
}

// Função para carregar e exibir dados do usuário
function loadUserData() {
  console.log("📄 Carregando dados do usuário...");

  // Tentar múltiplas fontes de dados
  let userName = null;
  let userEmail = null;

  // 1. Primeiro, tentar pegar do Auth module se disponível
  if (typeof Auth !== "undefined" && Auth.getUserData) {
    const userData = Auth.getUserData();
    if (userData) {
      userName = userData.name || userData.fullName;
      userEmail = userData.email;
      console.log("✅ Dados carregados via Auth module:", {
        userName,
        userEmail,
      });
    }
  }

  // 2. Se não encontrou, tentar sessionStorage
  if (!userName || !userEmail) {
    userName =
      sessionStorage.getItem("userName") ||
      sessionStorage.getItem("name") ||
      sessionStorage.getItem("fullName");
    userEmail =
      sessionStorage.getItem("userEmail") || sessionStorage.getItem("email");
    console.log("📱 Dados carregados via sessionStorage:", {
      userName,
      userEmail,
    });
  }

  // 3. Se ainda não encontrou, tentar localStorage
  if (!userName || !userEmail) {
    userName =
      localStorage.getItem("userName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("fullName");
    userEmail =
      localStorage.getItem("userEmail") || localStorage.getItem("email");
    console.log("💾 Dados carregados via localStorage:", {
      userName,
      userEmail,
    });
  }

  // 4. Tentar userData completo do sessionStorage
  if (!userName || !userEmail) {
    try {
      const userDataString = sessionStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userName = userData.name || userData.fullName || userData.displayName;
        userEmail = userData.email;
        console.log("📋 Dados encontrados em userData:", {
          userName,
          userEmail,
        });
      }
    } catch (error) {
      console.warn("⚠️ Erro ao parsear userData:", error);
    }
  }

  // 5. Valores padrão se ainda não encontrou
  if (!userName) {
    userName = "Usuário";
    console.log("⚠️ Nome não encontrado, usando valor padrão");
  }

  if (!userEmail) {
    userEmail = "usuario@coinfuture.com";
    console.log("⚠️ Email não encontrado, usando valor padrão");
  }

  // Atualizar elementos na página
  updateUserInterface(userName, userEmail);

  return { userName, userEmail };
}

document.addEventListener("DOMContentLoaded", () => {
  const userCards = document.querySelectorAll(".clickable-card");

  userCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Exemplo de ação: ir para uma URL baseada em dados do card
      const userId = card.getAttribute("data-user-id");
      window.location.href = "../../profile/pages/profile.html";

      // Ou você pode chamar qualquer outra função, como:
      // showUserProfileModal(userId);
    });
  });
});

// Função para atualizar a interface com os dados do usuário
function updateUserInterface(userName, userEmail) {
  // Selecionar elementos com múltiplas tentativas
  const userNameSelectors = [
    ".user-card .user-info h3",
    ".user-info h3",
    ".user-name",
    "[data-user-name]",
  ];

  const userEmailSelectors = [
    ".user-card .user-info p",
    ".user-info p",
    ".user-email",
    "[data-user-email]",
  ];

  // Atualizar nome do usuário
  let nameUpdated = false;
  for (const selector of userNameSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element && element.textContent !== userEmail) {
        // Evitar substituir email
        element.textContent = userName;
        nameUpdated = true;
        console.log(`✅ Nome atualizado no seletor: ${selector}`);
      }
    });
  }

  // Atualizar email do usuário
  let emailUpdated = false;
  for (const selector of userEmailSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element && element.textContent !== userName) {
        // Evitar substituir nome
        // Verificar se parece com um email ou é um placeholder
        const currentText = element.textContent.trim();
        if (
          currentText.includes("@") ||
          currentText === "usuario@coinfuture.com" ||
          currentText === ""
        ) {
          element.textContent = userEmail;
          emailUpdated = true;
          console.log(`✅ Email atualizado no seletor: ${selector}`);
        }
      }
    });
  }

  // Log de debug
  console.log("🎯 Status da atualização:", {
    userName,
    userEmail,
    nameUpdated,
    emailUpdated,
    availableElements: {
      nameElements: document.querySelectorAll(".user-info h3").length,
      emailElements: document.querySelectorAll(".user-info p").length,
    },
  });

  // Tentar forçar atualização se não funcionou
  if (!nameUpdated || !emailUpdated) {
    setTimeout(() => forceUpdateUserData(userName, userEmail), 500);
  }
}

// Função para forçar atualização quando seletores normais falham
function forceUpdateUserData(userName, userEmail) {
  console.log("🔧 Forçando atualização dos dados do usuário...");

  // Buscar por qualquer elemento que contenha dados do usuário
  const allElements = document.querySelectorAll("*");

  allElements.forEach((element) => {
    const text = element.textContent?.trim();

    // Se encontrar texto que parece ser nome padrão
    if (text === "João Silva" || text === "Usuario" || text === "Usuário") {
      element.textContent = userName;
      console.log("🔧 Nome forçadamente atualizado:", element);
    }

    // Se encontrar texto que parece ser email padrão
    if (
      text === "joao.silva@coinfuture.com" ||
      text === "usuario@coinfuture.com"
    ) {
      element.textContent = userEmail;
      console.log("🔧 Email forçadamente atualizado:", element);
    }
  });
}

// Função para buscar dados atualizados da API
async function refreshUserDataFromAPI() {
  console.log("🌐 Buscando dados atualizados da API...");

  if (typeof Auth !== "undefined" && Auth.getProfile) {
    try {
      const userData = await Auth.getProfile();
      if (userData) {
        console.log("✅ Dados atualizados da API:", userData);

        // Salvar dados atualizados
        sessionStorage.setItem(
          "userName",
          userData.name || userData.fullName || ""
        );
        sessionStorage.setItem("userEmail", userData.email || "");

        // Atualizar interface
        updateUserInterface(
          userData.name || userData.fullName || "Usuário",
          userData.email || "usuario@coinfuture.com"
        );

        return userData;
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados da API:", error);
    }
  }

  return null;
}

// Adicionar efeito de clique nos itens de configuração
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Iniciando configurações...");

  // Carregar dados do usuário imediatamente
  const userData = loadUserData();

  // Tentar buscar dados atualizados da API
  setTimeout(() => {
    refreshUserDataFromAPI();
  }, 1000);

  // Observar mudanças no DOM para elementos que são carregados dinamicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Se novos elementos foram adicionados, tentar atualizar dados
            const userInfoElements = node.querySelectorAll
              ? node.querySelectorAll(".user-info h3, .user-info p")
              : [];

            if (userInfoElements.length > 0) {
              console.log(
                "📄 Novos elementos detectados, atualizando dados..."
              );
              setTimeout(() => loadUserData(), 100);
            }
          }
        });
      }
    });
  });

  // Observar mudanças no body
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Efeito de pressão nos itens de configuração
  document.querySelectorAll(".setting-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      if (!e.target.closest(".toggle-switch")) {
        this.style.transform = "scale(0.98)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      }
    });
  });

  // Ir para editar perfil
  document.querySelectorAll(".setting-item").forEach((item) => {
    item.addEventListener("click", () => {
      const link = item.getAttribute("data-link");
      if (link) {
        window.location.href = link;
      }
    });
  });

  // Botão voltar
  const backButton = document.querySelector(".back-button");
  if (backButton) {
    backButton.addEventListener("click", function () {
      this.style.transform = "scale(0.9)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
      console.log("Voltando para tela anterior...");
    });
  }

  // Botão perfil
  const profileButton = document.querySelector(".profile-button");
  if (profileButton) {
    profileButton.addEventListener("click", function () {
      this.style.transform = "scale(0.9)";
      setTimeout(() => {
        this.style.transform = "";
      }, 150);
      console.log("Abrindo perfil do usuário...");
    });
  }

  // Inicializar efeitos avançados
  addAdvancedEffects();
});

// Botão go home
document.addEventListener("DOMContentLoaded", function () {
  const goHome = document.getElementById("go-home");
  if (goHome) {
    goHome.addEventListener("click", () => {
      if (document.referrer) {
        window.history.back();
      } else {
        window.location.href = "/login/html/login.html";
      }
    });
  }

  // Botão go profile
  const goProfile = document.getElementById("go-profile");
  if (goProfile) {
    goProfile.onclick = () => {
      window.location.href = "/profile/pages/profile.html";
    };
  }
});

// Adicionar efeitos avançados e interações
function addAdvancedEffects() {
  // Efeito de vibração simulado visualmente
  function simulateVibration(element) {
    element.style.transform = "translateX(2px)";
    setTimeout(() => (element.style.transform = "translateX(-2px)"), 50);
    setTimeout(() => (element.style.transform = "translateX(0)"), 100);
  }

  // Adicionar feedback tátil visual nos toggles
  document.querySelectorAll(".toggle-switch").forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      simulateVibration(this);

      // Efeito de ondulação
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(120,119,198,0.3);
        transform: scale(0);
        animation: ripple-toggle 0.6s linear;
        pointer-events: none;
        left: 50%;
        top: 50%;
        width: 60px;
        height: 60px;
        margin-left: -30px;
        margin-top: -30px;
      `;

      this.style.position = "relative";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Log da ação
      const settingTitle =
        this.closest(".setting-item").querySelector(
          ".setting-title"
        ).textContent;
      const isActive = this.classList.contains("active");
      console.log(`${settingTitle}: ${isActive ? "Ativado" : "Desativado"}`);
    });
  });

  // Sistema de dicas contextuais
  let timeSpent = 0;
  const timer = setInterval(() => {
    timeSpent++;
    if (timeSpent === 30) {
      showTip();
      clearInterval(timer);
    }
  }, 1000);

  function showTip() {
    const tip = document.createElement("div");
    tip.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(120,119,198,0.4);
      z-index: 1000;
      animation: slideUp 0.5s ease;
    `;
    tip.innerHTML =
      "💡 Dica: Ative as notificações para não perder doações importantes!";
    document.body.appendChild(tip);

    setTimeout(() => {
      tip.style.animation = "slideDown 0.5s ease forwards";
      setTimeout(() => tip.remove(), 500);
    }, 3000);
  }

  // Observer para animações lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("pulse");
          setTimeout(() => entry.target.classList.remove("pulse"), 2000);
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observar ícones para efeito pulse
  document.querySelectorAll(".setting-icon").forEach((icon) => {
    observer.observe(icon);
  });

  // Smooth scroll para o topo
  const headerTitle = document.querySelector(".header-title");
  if (headerTitle) {
    headerTitle.addEventListener("click", function () {
      const content = document.querySelector(".content");
      if (content) {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // Easter egg: clique múltiplo no avatar
  let clickCount = 0;
  const userAvatar = document.querySelector(".user-avatar");
  if (userAvatar) {
    userAvatar.addEventListener("click", function () {
      clickCount++;
      if (clickCount === 7) {
        showEasterEgg();
        clickCount = 0;
      }
      setTimeout(() => {
        if (clickCount < 7) clickCount = 0;
      }, 2000);
    });
  }

  function showEasterEgg() {
    const egg = document.createElement("div");
    egg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #7877C6 0%, #5B5A9F 100%);
      color: white;
      padding: 20px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 16px 64px rgba(120,119,198,0.6);
      z-index: 2000;
      animation: pulse-glow 1s ease-in-out infinite;
    `;
    egg.innerHTML =
      "🚀 Parabéns! Você encontrou o Easter Egg!<br><small>Desenvolvido com 💜 pelo time CoinFuture</small>";
    document.body.appendChild(egg);

    setTimeout(() => {
      egg.style.animation = "slideDown 0.5s ease forwards";
      setTimeout(() => egg.remove(), 500);
    }, 3000);
  }

  // Salvar configurações
  function saveSettings() {
    const settings = {};
    document.querySelectorAll(".toggle-switch").forEach((toggle) => {
      const settingName = toggle
        .closest(".setting-item")
        .querySelector(".setting-title").textContent;
      settings[settingName] = toggle.classList.contains("active");
    });
    console.log("Configurações salvas:", settings);
  }

  // Salvar configurações quando mudar qualquer toggle
  document.querySelectorAll(".toggle-switch").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setTimeout(saveSettings, 100);
    });
  });

  // Implementar busca rápida
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      implementQuickSearch();
    }
  });

  function implementQuickSearch() {
    const searchOverlay = document.createElement("div");
    searchOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.placeholder = "Buscar configuração...";
    searchBox.style.cssText = `
      padding: 16px 20px;
      background: #1a1a1a;
      border: 1px solid #7877C6;
      border-radius: 16px;
      color: white;
      font-size: 16px;
      width: 300px;
      outline: none;
    `;

    searchOverlay.appendChild(searchBox);
    document.body.appendChild(searchOverlay);
    searchBox.focus();

    function closeSearch() {
      searchOverlay.remove();
    }

    searchBox.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeSearch();
      } else if (e.key === "Enter") {
        performSearch(this.value);
        closeSearch();
      }
    });

    searchOverlay.addEventListener("click", function (e) {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  function performSearch(query) {
    if (!query) return;

    const items = document.querySelectorAll(".setting-item");
    let found = false;

    items.forEach((item) => {
      const title =
        item.querySelector(".setting-title")?.textContent.toLowerCase() || "";
      const subtitle =
        item.querySelector(".setting-subtitle")?.textContent.toLowerCase() ||
        "";

      if (
        title.includes(query.toLowerCase()) ||
        subtitle.includes(query.toLowerCase())
      ) {
        item.style.background = "rgba(120,119,198,0.2)";
        item.scrollIntoView({ behavior: "smooth", block: "center" });
        found = true;

        setTimeout(() => {
          item.style.background = "";
        }, 3000);

        return;
      }
    });

    if (!found) {
      console.log(`Nenhuma configuração encontrada para: "${query}"`);
    }
  }

  // Implementar modo de economia de energia
  let inactivityTimer;
  let isIdle = false;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    if (isIdle) {
      document.body.style.filter = "";
      isIdle = false;
    }

    inactivityTimer = setTimeout(() => {
      document.body.style.filter = "brightness(0.7)";
      isIdle = true;
      console.log("Modo economia ativado");
    }, 60000);
  }

  ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
    (event) => {
      document.addEventListener(event, resetInactivityTimer, true);
    }
  );

  resetInactivityTimer();
}

// Listener para logout
document.addEventListener("DOMContentLoaded", function () {
  const logoutItem = document.getElementById("logout-item");

  if (logoutItem) {
    logoutItem.addEventListener("click", function (e) {
      e.preventDefault();

      const confirmModal = document.createElement("div");
      confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      confirmModal.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 30px;
          border-radius: 20px;
          text-align: center;
          color: white;
          max-width: 320px;
          margin: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        ">
          <i class="fas fa-sign-out-alt" style="font-size: 32px; color: #ef4444; margin-bottom: 15px;"></i>
          <h3 style="margin-bottom: 10px; font-size: 18px;">Sair da Conta</h3>
          <p style="margin-bottom: 25px; opacity: 0.8; font-size: 14px;">Tem certeza que deseja se desconectar do CoinFuture?</p>
          <div style="display: flex; gap: 10px;">
            <button id="cancel-logout" style="
              flex: 1;
              padding: 12px;
              background: rgba(255,255,255,0.1);
              border: 1px solid rgba(255,255,255,0.2);
              border-radius: 12px;
              color: white;
              cursor: pointer;
              font-size: 14px;
            ">Cancelar</button>
            <button id="confirm-logout" style="
              flex: 1;
              padding: 12px;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              border: none;
              border-radius: 12px;
              color: white;
              cursor: pointer;
              font-size: 14px;
              font-weight: 600;
            ">Sair</button>
          </div>
        </div>
      `;

      document.body.appendChild(confirmModal);

      document.getElementById("cancel-logout").addEventListener("click", () => {
        confirmModal.remove();
      });

      document
        .getElementById("confirm-logout")
        .addEventListener("click", () => {
          confirmModal.remove();
          if (typeof Auth !== "undefined" && Auth.logout) {
            Auth.logout();
          }
          window.location.href = "../../login/html/login.html";
        });

      confirmModal.addEventListener("click", (e) => {
        if (e.target === confirmModal) {
          confirmModal.remove();
        }
      });
    });
  }
});

// Adicionar estilos para animações
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse-glow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
  
  @keyframes slideUp {
    from { transform: translate(-50%, 100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, 100%); opacity: 0; }
  }
  
  @keyframes ripple-toggle {
    to { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Função utilitária para debug
window.debugUserData = function () {
  console.log("🔍 Debug - Estado atual dos dados do usuário:");
  console.log("SessionStorage:", {
    userName: sessionStorage.getItem("userName"),
    userEmail: sessionStorage.getItem("userEmail"),
    userData: sessionStorage.getItem("userData"),
  });
  console.log("LocalStorage:", {
    userName: localStorage.getItem("userName"),
    userEmail: localStorage.getItem("userEmail"),
    userData: localStorage.getItem("userData"),
  });
  if (typeof Auth !== "undefined") {
    console.log("Auth module:", Auth.getUserData());
  }

  // Forçar recarregamento
  loadUserData();
};

// Logs úteis para desenvolvimento
console.log("🚀 CoinFuture Settings carregado com sucesso!");
console.log("💡 Dicas:", {
  "Busca rápida": "Pressione Ctrl+F (Cmd+F no Mac)",
  "Easter egg": "Clique 7 vezes no avatar do usuário",
  "Economia de energia": "Ativado após 1 minuto de inatividade",
  "Scroll suave": 'Clique no título "Configurações" para voltar ao topo',
  Debug: "Execute window.debugUserData() no console para verificar dados",
  Logout: "Clique em 'Sair da Conta' para testar o logout",
});

document.addEventListener("DOMContentLoaded", function () {
  const langSetting = document.getElementById("language-setting");
  const langModal = document.getElementById("language-modal");
  const closeBtn = document.getElementById("close-language-modal");
  const langSubtitle = document.getElementById("current-language");

  if (langSetting && langModal) {
    langSetting.addEventListener("click", () => {
      langModal.classList.remove("hidden");
      const content = langModal.querySelector(".modal-content");
      content.style.animation = "fadeInCenter 0.4s ease forwards";
    });
  }

  function closeLangModal() {
    const content = langModal.querySelector(".modal-content");
    content.style.animation = "fadeOutCenter 0.3s ease forwards";
    setTimeout(() => langModal.classList.add("hidden"), 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLangModal);
  }

  langModal.addEventListener("click", (e) => {
    if (e.target === langModal) {
      closeLangModal();
    }
  });

  langModal.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      const lang = li.getAttribute("data-lang");
      const text = li.textContent;

      // Atualiza visualmente
      langSubtitle.textContent = text;

      // Salva escolha
      localStorage.setItem("appLanguage", lang);

      // Fecha modal
      langModal.classList.add("hidden");

      console.log("🌍 Idioma selecionado:", lang);
    });
  });

  // Carregar idioma salvo
  const savedLang = localStorage.getItem("appLanguage");
  if (savedLang) {
    const selected = langModal.querySelector(`li[data-lang="${savedLang}"]`);
    if (selected) {
      langSubtitle.textContent = selected.textContent;
    }
  }
});
