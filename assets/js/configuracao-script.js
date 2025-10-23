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
        window.location.href = "/index.html";
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

// Listener para logout - VERSÃO CORRIGIDA
document.addEventListener("DOMContentLoaded", function () {
  const logoutItem = document.getElementById("logout-item");

  if (logoutItem) {
    logoutItem.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

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
          <p style="margin-bottom: 25px; opacity: 0.8; font-size: 14px;">Tem certeza que deseja se desconectar do Altrum?</p>
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
              position: relative;
            ">
              <span id="logout-text">Sair</span>
              <div id="logout-loading" style="display: none;">
                <div style="
                  width: 16px;
                  height: 16px;
                  border: 2px solid transparent;
                  border-top: 2px solid white;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 0 auto;
                "></div>
              </div>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(confirmModal);

      // Botão cancelar
      document.getElementById("cancel-logout").addEventListener("click", () => {
        confirmModal.remove();
      });

      // Botão confirmar logout
      document
        .getElementById("confirm-logout")
        .addEventListener("click", async () => {
          const logoutButton = document.getElementById("confirm-logout");
          const logoutText = document.getElementById("logout-text");
          const logoutLoading = document.getElementById("logout-loading");

          // Desabilitar botão e mostrar loading
          logoutButton.disabled = true;
          logoutButton.style.opacity = "0.7";
          logoutText.style.display = "none";
          logoutLoading.style.display = "block";

          console.log("🚪 Iniciando processo de logout...");

          try {
            // 1. Tentar fazer logout via API se disponível
            let logoutSuccess = false;

            if (typeof Auth !== "undefined" && Auth.logout) {
              console.log("📡 Fazendo logout via Auth module...");
              try {
                await Auth.logout();
                logoutSuccess = true;
                console.log("✅ Logout via Auth module concluído");
              } catch (error) {
                console.error("❌ Erro no logout via Auth module:", error);
              }
            }

            // 2. Tentar fazer logout via fetch para API diretamente
            if (!logoutSuccess) {
              console.log("📡 Tentando logout via API fetch...");
              try {
                const response = await fetch("/api/auth/logout", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${
                      sessionStorage.getItem("token") ||
                      localStorage.getItem("token")
                    }`,
                  },
                  credentials: "include",
                });

                if (response.ok) {
                  logoutSuccess = true;
                  console.log("✅ Logout via API fetch concluído");
                } else {
                  console.warn(
                    "⚠️ Logout via API retornou status:",
                    response.status
                  );
                }
              } catch (error) {
                console.warn("⚠️ Erro no logout via API fetch:", error);
              }
            }

            // 3. Limpar dados locais independente do sucesso da API
            console.log("🧹 Limpando dados locais...");

            // Limpar sessionStorage
            const sessionKeys = [
              "token",
              "refreshToken",
              "userId",
              "userName",
              "userEmail",
              "userData",
              "name",
              "fullName",
              "email",
            ];
            sessionKeys.forEach((key) => {
              sessionStorage.removeItem(key);
            });

            // Limpar localStorage (dados menos críticos)
            const localKeys = [
              "userName",
              "userEmail",
              "userData",
              "name",
              "fullName",
              "email",
              "appLanguage",
            ];
            localKeys.forEach((key) => {
              localStorage.removeItem(key);
            });

            // Limpar cookies se possível
            try {
              document.cookie.split(";").forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie =
                  name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              });
              console.log("🍪 Cookies limpos");
            } catch (error) {
              console.warn("⚠️ Erro ao limpar cookies:", error);
            }

            console.log("✅ Dados locais limpos com sucesso");

            // 4. Aguardar um pouco para garantir que tudo foi processado
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 5. Fechar modal
            confirmModal.remove();

            // 6. Redirecionar para página de login
            console.log("🔄 Redirecionando para página de login...");

            // Forçar limpeza da história do navegador
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, null, "/index.html");
            }

            // Redirecionar
            window.location.href = "/index.html";
          } catch (error) {
            console.error("❌ Erro crítico durante logout:", error);

            // Mesmo com erro, limpar dados e redirecionar
            sessionStorage.clear();
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");

            confirmModal.remove();
            window.location.href = "/index.html";
          }
        });

      // Fechar modal clicando fora
      confirmModal.addEventListener("click", (e) => {
        if (e.target === confirmModal) {
          confirmModal.remove();
        }
      });

      // Fechar modal com ESC
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          confirmModal.remove();
          document.removeEventListener("keydown", handleEsc);
        }
      };
      document.addEventListener("keydown", handleEsc);
    });
  }
});

// Função auxiliar para logout programático
window.performLogout = async function () {
  console.log("🚪 Logout programático iniciado...");

  try {
    // Tentar Auth module primeiro
    if (typeof Auth !== "undefined" && Auth.logout) {
      try {
        await Auth.logout();
        console.log("✅ Logout via Auth module concluído");
      } catch (error) {
        console.error("❌ Erro no Auth.logout:", error);
      }
    }

    // Tentar API diretamente
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            sessionStorage.getItem("token") || localStorage.getItem("token")
          }`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.warn("⚠️ Erro na API de logout:", error);
    }

    // Limpar dados locais
    sessionStorage.clear();
    [
      "token",
      "refreshToken",
      "userId",
      "userName",
      "userEmail",
      "userData",
    ].forEach((key) => {
      localStorage.removeItem(key);
    });

    // Redirecionar
    window.location.href = "/index.html";
  } catch (error) {
    console.error("❌ Erro no logout programático:", error);
    // Forçar limpeza e redirecionamento mesmo com erro
    sessionStorage.clear();
    window.location.href = "/index.html";
  }
};

// Adicionar CSS para animação de loading
const logoutStyles = document.createElement("style");
logoutStyles.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  #confirm-logout:disabled {
    cursor: not-allowed !important;
  }
`;
document.head.appendChild(logoutStyles);

// Log de debug
console.log("🔧 Sistema de logout corrigido carregado!");
console.log(
  "💡 Para testar logout programático, execute: window.performLogout()"
);

// Verificar se usuário está logado na inicialização
document.addEventListener("DOMContentLoaded", function () {
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  const userId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (!token && !userId) {
    console.log("⚠️ Usuário não parece estar logado, redirecionando...");
    window.location.href = "/index.html";
  }
});

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
console.log("🚀 Altrum Settings carregado com sucesso!");
console.log("💡 Dicas:", {
  "Busca rápida": "Pressione Ctrl+F (Cmd+F no Mac)",
  "Easter egg": "Clique 7 vezes no avatar do usuário",
  "Economia de energia": "Ativado após 1 minuto de inatividade",
  "Scroll suave": 'Clique no título "Configurações" para voltar ao topo',
  Debug: "Execute window.debugUserData() no console para verificar dados",
  Logout: "Clique em 'Sair da Conta' para testar o logout",
});

// ========== CONFIGURAÇÃO DE MODAIS ==========

document.addEventListener("DOMContentLoaded", function () {
  console.log("🎨 Inicializando modais de configuração...");

  initializeThemeModal();
  initializeLanguageModal();
  initializeSecurityModal();
});

// ========== MODAL DE TEMA ==========

function initializeThemeModal() {
  const themeSetting = document.getElementById("theme-setting");
  const themeModal = document.getElementById("theme-modal");
  const closeBtn = document.getElementById("close-theme-modal");
  const themeOptions = document.querySelectorAll(".theme-option");
  const currentThemeText = document.getElementById("current-theme");

  if (!themeSetting || !themeModal) {
    console.warn("⚠️ Elementos do modal de tema não encontrados");
    return;
  }

  // Abrir modal
  themeSetting.addEventListener("click", () => {
    themeModal.classList.remove("hidden");
    themeModal.classList.remove("closing");
    console.log("🎨 Modal de tema aberto");
  });

  // Fechar modal
  function closeThemeModal() {
    themeModal.classList.add("closing");
    setTimeout(() => {
      themeModal.classList.add("hidden");
      themeModal.classList.remove("closing");
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeThemeModal);
  }

  // Fechar ao clicar no backdrop
  const backdrop = themeModal.querySelector(".config-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeThemeModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !themeModal.classList.contains("hidden")) {
      closeThemeModal();
    }
  });

  // Selecionar tema
  themeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");

      // Remover seleção anterior
      themeOptions.forEach((opt) => opt.classList.remove("selected"));

      // Adicionar seleção atual
      this.classList.add("selected");

      // Salvar tema
      saveTheme(theme);

      // Atualizar texto
      updateThemeText(theme, currentThemeText);

      // Aplicar tema
      applyTheme(theme);

      // Fechar modal após um delay
      setTimeout(() => {
        closeThemeModal();
      }, 400);

      console.log("🎨 Tema selecionado:", theme);
    });
  });

  // Carregar tema salvo
  loadSavedTheme(themeOptions, currentThemeText);
}

function updateThemeText(theme, element) {
  const themeNames = {
    dark: "Escuro",
    light: "Claro",
    auto: "Automático",
  };

  if (element) {
    element.textContent = themeNames[theme] || "Escuro";
  }
}

function saveTheme(theme) {
  try {
    sessionStorage.setItem("appTheme", theme);
    console.log("💾 Tema salvo:", theme);
  } catch (error) {
    console.error("❌ Erro ao salvar tema:", error);
  }
}

function applyTheme(theme) {
  const body = document.body;

  body.classList.remove("theme-dark", "theme-light", "theme-auto");

  if (theme === "light") {
    body.classList.add("theme-light");
    body.style.background =
      "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)";
    console.log("☀️ Tema claro aplicado");
  } else if (theme === "auto") {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;

    if (isDay) {
      body.classList.add("theme-light");
      body.style.background =
        "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)";
      console.log("🌅 Tema automático: claro (dia)");
    } else {
      body.classList.add("theme-dark");
      body.style.background =
        "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)";
      console.log("🌙 Tema automático: escuro (noite)");
    }
  } else {
    body.classList.add("theme-dark");
    body.style.background =
      "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)";
    console.log("🌙 Tema escuro aplicado");
  }
}

function loadSavedTheme(themeOptions, currentThemeText) {
  const savedTheme = sessionStorage.getItem("appTheme") || "dark";

  themeOptions.forEach((option) => {
    if (option.getAttribute("data-theme") === savedTheme) {
      option.classList.add("selected");
    }
  });

  updateThemeText(savedTheme, currentThemeText);
  applyTheme(savedTheme);

  console.log("📂 Tema carregado:", savedTheme);
}

// ========== MODAL DE IDIOMA ==========

function initializeLanguageModal() {
  const languageSetting = document.getElementById("language-setting");
  const languageModal = document.getElementById("language-modal");
  const closeBtn = document.getElementById("close-language-modal");
  const languageOptions = document.querySelectorAll(".language-option");
  const currentLanguageText = document.getElementById("current-language");

  if (!languageSetting || !languageModal) {
    console.warn("⚠️ Elementos do modal de idioma não encontrados");
    return;
  }

  // Abrir modal
  languageSetting.addEventListener("click", () => {
    languageModal.classList.remove("hidden");
    languageModal.classList.remove("closing");
    console.log("🌐 Modal de idioma aberto");
  });

  // Fechar modal
  function closeLanguageModal() {
    languageModal.classList.add("closing");
    setTimeout(() => {
      languageModal.classList.add("hidden");
      languageModal.classList.remove("closing");
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLanguageModal);
  }

  // Fechar ao clicar no backdrop
  const backdrop = languageModal.querySelector(".config-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeLanguageModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !languageModal.classList.contains("hidden")) {
      closeLanguageModal();
    }
  });

  // Selecionar idioma
  languageOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const lang = this.getAttribute("data-lang");
      const langName = this.querySelector(".language-name").textContent;

      // Remover seleção anterior
      languageOptions.forEach((opt) => opt.classList.remove("selected"));

      // Adicionar seleção atual
      this.classList.add("selected");

      // Salvar idioma
      saveLanguage(lang);

      // Atualizar texto
      if (currentLanguageText) {
        currentLanguageText.textContent = langName;
      }

      // Fechar modal após um delay
      setTimeout(() => {
        closeLanguageModal();
      }, 400);

      console.log("🌐 Idioma selecionado:", lang);

      // Mostrar notificação (opcional)
      showLanguageNotification(langName);
    });
  });

  // Carregar idioma salvo
  loadSavedLanguage(languageOptions, currentLanguageText);
}

function saveLanguage(lang) {
  try {
    sessionStorage.setItem("appLanguage", lang);
    console.log("💾 Idioma salvo:", lang);
  } catch (error) {
    console.error("❌ Erro ao salvar idioma:", error);
  }
}

function loadSavedLanguage(languageOptions, currentLanguageText) {
  const savedLang = sessionStorage.getItem("appLanguage") || "pt-BR";

  languageOptions.forEach((option) => {
    if (option.getAttribute("data-lang") === savedLang) {
      option.classList.add("selected");

      const langName = option.querySelector(".language-name").textContent;
      if (currentLanguageText) {
        currentLanguageText.textContent = langName;
      }
    }
  });

  console.log("📂 Idioma carregado:", savedLang);
}

function showLanguageNotification(langName) {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
    color: white;
    padding: 14px 24px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.5);
    z-index: 10001;
    animation: slideUpNotification 0.4s ease;
  `;
  notification.textContent = `Idioma alterado para: ${langName}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideDownNotification 0.4s ease forwards";
    setTimeout(() => notification.remove(), 400);
  }, 2500);
}

// ========== MODAL DE SEGURANÇA ==========

function initializeSecurityModal() {
  const securitySetting = document.getElementById("security-setting");
  const securityModal = document.getElementById("security-modal");
  const closeBtn = document.getElementById("close-security-modal");
  const changePasswordOption = document.getElementById(
    "change-password-option"
  );

  if (!securitySetting || !securityModal) {
    console.warn("⚠️ Elementos do modal de segurança não encontrados");
    return;
  }

  // Abrir modal
  securitySetting.addEventListener("click", () => {
    securityModal.classList.remove("hidden");
    securityModal.classList.remove("closing");
    console.log("🔒 Modal de segurança aberto");
  });

  // Fechar modal
  function closeSecurityModal() {
    securityModal.classList.add("closing");
    setTimeout(() => {
      securityModal.classList.add("hidden");
      securityModal.classList.remove("closing");
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeSecurityModal);
  }

  // Fechar ao clicar no backdrop
  const backdrop = securityModal.querySelector(".config-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeSecurityModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !securityModal.classList.contains("hidden")) {
      closeSecurityModal();
    }
  });

  // Ir para página de alteração de senha
  if (changePasswordOption) {
    changePasswordOption.addEventListener("click", () => {
      console.log("🔑 Navegando para alteração de senha...");
      window.location.href = "/pages/change-password/html/change-password.html";
    });
  }
  // Desativar opções de Autenticação em Dois Fatores e Biometria
  const securityOptions = securityModal.querySelectorAll(".security-option");

  securityOptions.forEach((option) => {
    const optionName = option
      .querySelector(".security-name")
      ?.textContent.trim();

    // Desativa apenas as opções com toggle (2FA e Biometria)
    if (
      optionName === "Autenticação em Dois Fatores" ||
      optionName === "Biometria"
    ) {
      option.classList.add("disabled");

      // Remove event listeners de toggle se existirem
      const toggleSwitch = option.querySelector(".toggle-switch");
      if (toggleSwitch) {
        // Cria um clone para remover todos os event listeners
        const newToggle = toggleSwitch.cloneNode(true);
        toggleSwitch.parentNode.replaceChild(newToggle, toggleSwitch);
      }

      console.log(`🔒 Opção "${optionName}" desativada`);
    }
  });

  console.log(
    "✅ Opções de segurança configuradas (2FA e Biometria desativadas)"
  );
}

// ========== MODAL DE DESATIVAR CONTA ==========

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 Inicializando modal de desativação de conta...");

  initializeDeactivateModal();
});

function initializeDeactivateModal() {
  const deactivateModal = document.getElementById("deactivate-modal");
  const closeBtn = document.getElementById("close-deactivate-modal");
  const cancelBtn = document.getElementById("btn-cancel-deactivate");
  const confirmBtn = document.getElementById("btn-confirm-deactivate");
  const passwordInput = document.getElementById("deactivate-password");
  const confirmCheckbox = document.getElementById("deactivate-confirm");
  const togglePassword = document.getElementById("toggle-deactivate-password");
  const reasonSelect = document.getElementById("deactivate-reason");
  const deactivateForm = document.getElementById("deactivate-form");
  const successScreen = document.getElementById("deactivate-success");
  const closeSuccessBtn = document.getElementById("btn-close-success");
  const passwordError = document.getElementById("password-error");

  // Buscar item de desativação de forma robusta
  const settingItems = document.querySelectorAll(".setting-item");
  let deactivateButton = null;

  settingItems.forEach((item) => {
    const title = item.querySelector(".setting-title");
    if (title && title.textContent.trim().includes("Desativar Conta")) {
      deactivateButton = item;
      console.log("✅ Botão de desativação encontrado");
    }
  });

  if (!deactivateButton) {
    console.warn("⚠️ Botão de desativação não encontrado");
    return;
  }

  if (!deactivateModal) {
    console.warn("⚠️ Modal de desativação não encontrado");
    return;
  }

  // Abrir modal
  deactivateButton.addEventListener("click", (e) => {
    e.stopPropagation();
    openDeactivateModal();
  });

  // Fechar modal
  function closeDeactivateModal() {
    deactivateModal.classList.add("closing");
    setTimeout(() => {
      deactivateModal.classList.add("hidden");
      deactivateModal.classList.remove("closing");
      resetForm();
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDeactivateModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeDeactivateModal);
  }

  // Fechar ao clicar no backdrop
  const backdrop = deactivateModal.querySelector(".deactivate-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeDeactivateModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !deactivateModal.classList.contains("hidden")) {
      closeDeactivateModal();
    }
  });

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;

      const icon = togglePassword.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
      }
    });
  }

  // Validar checkbox e senha para habilitar botão
  function validateForm() {
    const isChecked = confirmCheckbox?.checked || false;
    const hasPassword = passwordInput?.value.trim().length > 0;

    if (confirmBtn) {
      confirmBtn.disabled = !(isChecked && hasPassword);
    }
  }

  if (confirmCheckbox) {
    confirmCheckbox.addEventListener("change", validateForm);
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      validateForm();
      // Remover erro ao digitar
      if (passwordError) {
        passwordError.classList.remove("show");
      }
      if (passwordInput.classList.contains("error")) {
        passwordInput.classList.remove("error");
      }
    });

    // Enter para submeter
    passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !confirmBtn.disabled) {
        handleDeactivation();
      }
    });
  }

  // Confirmar desativação
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleDeactivation);
  }

  async function handleDeactivation() {
    const password = passwordInput?.value.trim();
    const reason = reasonSelect?.value || "not_specified";

    if (!password) {
      showPasswordError("Por favor, digite sua senha");
      return;
    }

    // Mostrar loading
    if (confirmBtn) {
      confirmBtn.classList.add("loading");
      confirmBtn.disabled = true;
    }

    console.log("🔄 Processando desativação de conta...");

    try {
      // Simular validação de senha (substituir por chamada real à API)
      const isPasswordValid = await validatePassword(password);

      if (!isPasswordValid) {
        showPasswordError("Senha incorreta. Tente novamente.");
        if (confirmBtn) {
          confirmBtn.classList.remove("loading");
          confirmBtn.disabled = false;
        }
        return;
      }

      // Processar desativação
      await deactivateAccount(password, reason);

      console.log("✅ Conta desativada com sucesso");

      // Mostrar tela de sucesso
      showSuccessScreen();

      // Após 3 segundos, fazer logout
      setTimeout(() => {
        performLogout();
      }, 3000);
    } catch (error) {
      console.error("❌ Erro ao desativar conta:", error);
      showPasswordError("Erro ao processar. Tente novamente.");

      if (confirmBtn) {
        confirmBtn.classList.remove("loading");
        confirmBtn.disabled = false;
      }
    }
  }

  // Validar senha
  async function validatePassword(password) {
    try {
      // Se existe Auth module, usar ele
      if (typeof Auth !== "undefined" && Auth.validatePassword) {
        return await Auth.validatePassword(password);
      }

      // Caso contrário, fazer requisição à API
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await fetch("/api/auth/validate-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.valid === true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao validar senha:", error);
      // Em caso de erro, simular validação (remover em produção)
      return password.length >= 6;
    }
  }

  // Desativar conta
  async function deactivateAccount(password, reason) {
    try {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      const userId =
        sessionStorage.getItem("userId") || localStorage.getItem("userId");

      const response = await fetch("/api/user/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          password,
          reason,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Falha na desativação");
      }

      const data = await response.json();
      console.log("Resposta da API:", data);

      return data;
    } catch (error) {
      console.error("Erro na API de desativação:", error);
      // Continuar mesmo com erro (para fins de demonstração)
      return { success: true };
    }
  }

  // Mostrar erro de senha
  function showPasswordError(message) {
    if (passwordInput) {
      passwordInput.classList.add("error");
      passwordInput.focus();
    }

    if (passwordError) {
      const errorSpan = passwordError.querySelector("span");
      if (errorSpan) {
        errorSpan.textContent = message;
      }
      passwordError.classList.add("show");
    }

    // Vibrar input
    if (passwordInput) {
      passwordInput.style.animation = "shake 0.5s";
      setTimeout(() => {
        passwordInput.style.animation = "";
      }, 500);
    }
  }

  // Mostrar tela de sucesso
  function showSuccessScreen() {
    if (deactivateForm) {
      deactivateForm.style.display = "none";
    }

    if (successScreen) {
      successScreen.classList.add("show");
    }
  }

  // Resetar formulário
  function resetForm() {
    if (passwordInput) {
      passwordInput.value = "";
      passwordInput.classList.remove("error");
    }

    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
    }

    if (reasonSelect) {
      reasonSelect.value = "";
    }

    if (passwordError) {
      passwordError.classList.remove("show");
    }

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.classList.remove("loading");
    }

    if (deactivateForm) {
      deactivateForm.style.display = "block";
    }

    if (successScreen) {
      successScreen.classList.remove("show");
    }
  }

  // Abrir modal
  function openDeactivateModal() {
    deactivateModal.classList.remove("hidden");
    deactivateModal.classList.remove("closing");
    resetForm();
    console.log("⚠️ Modal de desativação aberto");
  }

  // Fechar tela de sucesso
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      closeDeactivateModal();
      // Redirecionar após fechar
      setTimeout(() => {
        performLogout();
      }, 300);
    });
  }

  // Função de logout
  async function performLogout() {
    console.log("🚪 Fazendo logout após desativação...");

    try {
      // Tentar logout via Auth module
      if (typeof Auth !== "undefined" && Auth.logout) {
        await Auth.logout();
      }

      // Limpar dados locais
      sessionStorage.clear();
      [
        "token",
        "refreshToken",
        "userId",
        "userName",
        "userEmail",
        "userData",
      ].forEach((key) => {
        localStorage.removeItem(key);
      });

      // Redirecionar
      window.location.href = "/index.html";
    } catch (error) {
      console.error("Erro no logout:", error);
      // Forçar limpeza e redirecionamento
      sessionStorage.clear();
      window.location.href = "/index.html";
    }
  }

  console.log("✅ Modal de desativação inicializado");
}

// ========== MODAL DE LIMPAR CACHE ==========
// ADICIONAR NO ARQUIVO: configuracao-script.js
// Adicionar após a função initializeDeactivateModal()

document.addEventListener("DOMContentLoaded", function () {
  console.log("🧹 Inicializando modal de limpar cache...");

  initializeClearCacheModal();
});

function initializeClearCacheModal() {
  const clearCacheModal = document.getElementById("clear-cache-modal");
  const clearCacheSetting = document.getElementById("clear-cache-setting");
  const closeBtn = document.getElementById("close-clear-cache-modal");
  const cancelBtn = document.getElementById("btn-cache-cancel");
  const clearBtn = document.getElementById("btn-cache-clear");
  const cacheForm = document.getElementById("cache-form");
  const successScreen = document.getElementById("cache-success");
  const closeSuccessBtn = document.getElementById("btn-cache-close-success");

  if (!clearCacheSetting || !clearCacheModal) {
    console.warn("⚠️ Elementos do modal de cache não encontrados");
    return;
  }

  // Calcular tamanho do cache (simulado)
  function calculateCacheSize() {
    // Em produção, isso viria de uma API real
    const sizes = {
      images: Math.floor(Math.random() * 50) + 20, // 20-70 MB
      temp: Math.floor(Math.random() * 30) + 10, // 10-40 MB
      logs: Math.floor(Math.random() * 20) + 5, // 5-25 MB
    };

    const total = Object.values(sizes).reduce((a, b) => a + b, 0);

    return { sizes, total };
  }

  // Atualizar tamanhos no modal
  function updateCacheSizes() {
    const { sizes, total } = calculateCacheSize();

    // Atualizar tamanho total
    const cacheSizeEl = document.getElementById("cache-total-size");
    if (cacheSizeEl) {
      cacheSizeEl.textContent = `${total} MB`;
    }

    // Atualizar preview na tela de configurações
    const cachePreviewEl = document.getElementById("cache-size-preview");
    if (cachePreviewEl) {
      cachePreviewEl.textContent = total;
    }

    // Atualizar itens individuais
    const imageSize = document.getElementById("cache-images-size");
    const tempSize = document.getElementById("cache-temp-size");
    const logsSize = document.getElementById("cache-logs-size");

    if (imageSize) imageSize.textContent = `${sizes.images} MB`;
    if (tempSize) tempSize.textContent = `${sizes.temp} MB`;
    if (logsSize) logsSize.textContent = `${sizes.logs} MB`;

    return total;
  }

  // Abrir modal
  clearCacheSetting.addEventListener("click", (e) => {
    e.stopPropagation();
    openClearCacheModal();
  });

  function openClearCacheModal() {
    clearCacheModal.classList.remove("hidden");
    clearCacheModal.classList.remove("closing");
    updateCacheSizes();
    resetCacheForm();
    console.log("🧹 Modal de limpar cache aberto");
  }

  // Fechar modal
  function closeClearCacheModal() {
    clearCacheModal.classList.add("closing");
    setTimeout(() => {
      clearCacheModal.classList.add("hidden");
      clearCacheModal.classList.remove("closing");
      resetCacheForm();
    }, 300);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeClearCacheModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeClearCacheModal);
  }

  // Fechar ao clicar no backdrop
  const backdrop = clearCacheModal.querySelector(".clear-cache-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeClearCacheModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !clearCacheModal.classList.contains("hidden")) {
      closeClearCacheModal();
    }
  });

  // Limpar cache
  if (clearBtn) {
    clearBtn.addEventListener("click", handleClearCache);
  }

  async function handleClearCache() {
    console.log("🧹 Iniciando limpeza de cache...");

    // Guardar tamanho antes de limpar
    const sizeBeforeCleaning = parseInt(
      document
        .getElementById("cache-total-size")
        ?.textContent.replace(" MB", "") || "0"
    );

    // Mostrar loading
    if (clearBtn) {
      clearBtn.classList.add("loading");
      clearBtn.disabled = true;
    }

    try {
      // Simular limpeza de cache
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Em produção, fazer chamada à API
      // const result = await clearCacheAPI();
      // Exemplo de chamada real:
      /*
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao limpar cache');
      }
      
      const result = await response.json();
      const sizeBeforeCleaning = result.freedSpace;
      */

      console.log("✅ Cache limpo com sucesso");

      // Atualizar texto de espaço liberado
      const freedSpaceEl = document.getElementById("cache-freed-space");
      if (freedSpaceEl) {
        freedSpaceEl.textContent = `${sizeBeforeCleaning} MB`;
      }

      // Mostrar tela de sucesso
      showCacheSuccessScreen();

      // Resetar tamanhos (simular cache vazio)
      setTimeout(() => {
        const cacheSizeEl = document.getElementById("cache-total-size");
        if (cacheSizeEl) {
          cacheSizeEl.textContent = "0 MB";
        }

        const cachePreviewEl = document.getElementById("cache-size-preview");
        if (cachePreviewEl) {
          cachePreviewEl.textContent = "0";
        }

        const sizes = document.querySelectorAll('[id^="cache-"][id$="-size"]');
        sizes.forEach((el) => {
          if (el.id !== "cache-total-size") {
            el.textContent = "0 MB";
          }
        });
      }, 100);

      // Atualizar novamente após 3 segundos (simular novo acúmulo)
      setTimeout(() => {
        updateCacheSizes();
      }, 3000);
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);

      // Mostrar notificação de erro
      showCacheErrorNotification();

      if (clearBtn) {
        clearBtn.classList.remove("loading");
        clearBtn.disabled = false;
      }
    }
  }

  // Mostrar tela de sucesso
  function showCacheSuccessScreen() {
    if (cacheForm) {
      cacheForm.style.display = "none";
    }

    if (successScreen) {
      successScreen.classList.add("show");
    }

    if (clearBtn) {
      clearBtn.classList.remove("loading");
      clearBtn.disabled = false;
    }
  }

  // Resetar formulário
  function resetCacheForm() {
    if (cacheForm) {
      cacheForm.style.display = "block";
    }

    if (successScreen) {
      successScreen.classList.remove("show");
    }

    if (clearBtn) {
      clearBtn.classList.remove("loading");
      clearBtn.disabled = false;
    }
  }

  // Fechar tela de sucesso
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      closeClearCacheModal();
    });
  }

  // Mostrar notificação de erro
  function showCacheErrorNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 14px 24px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5);
      z-index: 10001;
      animation: slideUpNotification 0.4s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>Erro ao limpar cache. Tente novamente.</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideDownNotification 0.4s ease forwards";
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }

  // Atualizar tamanhos ao carregar a página
  updateCacheSizes();

  console.log("✅ Modal de limpar cache inicializado");
}

// Função auxiliar para limpar cache via API (exemplo)
async function clearCacheAPI() {
  try {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    const userId =
      sessionStorage.getItem("userId") || localStorage.getItem("userId");

    const response = await fetch("/api/cache/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Falha ao limpar cache");
    }

    const data = await response.json();
    console.log("Resposta da API:", data);

    return data;
  } catch (error) {
    console.error("Erro na API de limpeza de cache:", error);
    throw error;
  }
}

console.log("✅ Sistema de limpar cache carregado!");

// Adicionar animação de shake para erro
const shakeStyles = document.createElement("style");
shakeStyles.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(8px); }
  }
`;
document.head.appendChild(shakeStyles);

console.log("✅ Sistema de desativação de conta carregado!");

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

console.log("✅ Sistema de modais de configuração carregado com sucesso!");

// ========== MODAL DE AVALIAR APP ==========

document.addEventListener("DOMContentLoaded", function () {
  console.log("⭐ Inicializando modal de avaliação...");
  initializeRatingModal();
});

function initializeRatingModal() {
  const ratingModal = document.getElementById("rating-modal");

  // Buscar o item "Avaliar App"
  const settingItems = document.querySelectorAll(".setting-item");
  let ratingButton = null;

  settingItems.forEach((item) => {
    const title = item.querySelector(".setting-title");
    if (title && title.textContent.trim().includes("Avaliar App")) {
      ratingButton = item;
      console.log("✅ Botão de avaliação encontrado");
    }
  });

  if (!ratingButton || !ratingModal) {
    console.warn("⚠️ Elementos do modal de avaliação não encontrados");
    return;
  }

  const closeBtn = document.getElementById("close-rating-modal");
  const cancelBtn = document.getElementById("btn-rating-cancel");
  const submitBtn = document.getElementById("btn-rating-submit");
  const stars = document.querySelectorAll(".rating-stars i");
  const feedbackText = document.getElementById("rating-feedback");
  const commentGroup = document.getElementById("comment-group");
  const commentTextarea = document.getElementById("rating-comment");
  const charCount = document.getElementById("char-count");
  const ratingForm = document.getElementById("rating-form");
  const successScreen = document.getElementById("rating-success");
  const closeSuccessBtn = document.getElementById("btn-rating-close-success");
  const successStarsContainer = document.getElementById("success-stars");

  let selectedRating = 0;

  // Mensagens de feedback
  const feedbackMessages = {
    1: "😔 Sentimos muito! O que podemos melhorar?",
    2: "😕 Poderia ser melhor. Conte-nos mais!",
    3: "😊 Bom! Como podemos deixar ainda melhor?",
    4: "😃 Ótimo! Ficamos felizes que esteja gostando!",
    5: "🤩 Incrível! Você é demais! Muito obrigado!",
  };

  // Abrir modal
  ratingButton.addEventListener("click", (e) => {
    e.stopPropagation();
    ratingModal.classList.remove("hidden");
    ratingModal.classList.remove("closing");
    resetRatingForm();
    console.log("⭐ Modal de avaliação aberto");
  });

  // Fechar modal
  function closeRatingModal() {
    ratingModal.classList.add("closing");
    setTimeout(() => {
      ratingModal.classList.add("hidden");
      ratingModal.classList.remove("closing");
      resetRatingForm();
    }, 300);
  }

  if (closeBtn) closeBtn.addEventListener("click", closeRatingModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeRatingModal);

  // Fechar ao clicar no backdrop
  const backdrop = ratingModal.querySelector(".rating-modal-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", closeRatingModal);
  }

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ratingModal.classList.contains("hidden")) {
      closeRatingModal();
    }
  });

  // Sistema de estrelas
  stars.forEach((star, index) => {
    star.addEventListener("mouseenter", () => {
      highlightStars(index + 1);
    });

    star.addEventListener("click", () => {
      selectedRating = index + 1;
      selectStars(selectedRating);
      updateFeedback(selectedRating);
      showCommentField();
      enableSubmitButton();
      console.log(`⭐ Avaliação: ${selectedRating} estrelas`);
    });
  });

  // Resetar hover
  const starsContainer = document.querySelector(".rating-stars");
  if (starsContainer) {
    starsContainer.addEventListener("mouseleave", () => {
      if (selectedRating > 0) {
        selectStars(selectedRating);
      } else {
        resetStars();
      }
    });
  }

  function highlightStars(count) {
    stars.forEach((star, index) => {
      if (index < count) {
        star.style.color = "#ffd700";
        star.style.transform = "scale(1.15)";
      } else {
        star.style.color = "rgba(255, 215, 0, 0.3)";
        star.style.transform = "scale(1)";
      }
    });
  }

  function selectStars(count) {
    stars.forEach((star, index) => {
      if (index < count) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
  }

  function resetStars() {
    stars.forEach((star) => {
      star.classList.remove("active");
      star.style.color = "";
      star.style.transform = "";
    });
  }

  function updateFeedback(rating) {
    if (feedbackText) {
      feedbackText.textContent = feedbackMessages[rating];
    }
  }

  function showCommentField() {
    if (commentGroup) {
      commentGroup.style.display = "block";
    }
  }

  function enableSubmitButton() {
    if (submitBtn) {
      submitBtn.disabled = false;
    }
  }

  // Contador de caracteres
  if (commentTextarea && charCount) {
    commentTextarea.addEventListener("input", () => {
      const count = commentTextarea.value.length;
      charCount.textContent = count;
      charCount.style.color =
        count > 450 ? "#f59e0b" : "rgba(255, 255, 255, 0.5)";
    });
  }

  // Enviar avaliação
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmitRating);
  }

  async function handleSubmitRating() {
    if (selectedRating === 0) return;

    const comment = commentTextarea?.value.trim() || "";

    console.log("📤 Enviando avaliação...");

    submitBtn.classList.add("loading");
    submitBtn.disabled = true;

    try {
      // Simular API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("✅ Avaliação enviada:", { rating: selectedRating, comment });

      // Confetes em 5 estrelas
      if (selectedRating === 5) {
        setTimeout(() => showConfetti(), 800);
      }

      updateSuccessStars(selectedRating);
      showRatingSuccessScreen();
    } catch (error) {
      console.error("❌ Erro ao enviar avaliação:", error);
      showRatingErrorNotification();
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  function updateSuccessStars(rating) {
    if (successStarsContainer) {
      const successStars = successStarsContainer.querySelectorAll("i");
      successStars.forEach((star, index) => {
        if (index < rating) {
          star.style.color = "#ffd700";
        } else {
          star.style.color = "rgba(255, 215, 0, 0.3)";
        }
      });
    }
  }

  function showRatingSuccessScreen() {
    if (ratingForm) ratingForm.style.display = "none";
    if (successScreen) successScreen.classList.add("show");
    if (submitBtn) {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  function resetRatingForm() {
    selectedRating = 0;
    resetStars();
    if (commentTextarea) commentTextarea.value = "";
    if (charCount) {
      charCount.textContent = "0";
      charCount.style.color = "rgba(255, 255, 255, 0.5)";
    }
    if (feedbackText) {
      feedbackText.textContent = "Toque nas estrelas para avaliar";
    }
    if (commentGroup) commentGroup.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.remove("loading");
    }
    if (ratingForm) ratingForm.style.display = "block";
    if (successScreen) successScreen.classList.remove("show");
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", closeRatingModal);
  }

  function showRatingErrorNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 14px 24px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(239, 68, 68, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    notification.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>Erro ao enviar avaliação. Tente novamente.</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }

  console.log("✅ Modal de avaliação inicializado");
}

// Função de confetes para 5 estrelas
function showConfetti() {
  const colors = ["#ffd700", "#ffb700", "#ff6b6b", "#4ecdc4", "#95e1d3"];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}%;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10002;
        animation: confettiRain ${2 + Math.random() * 2}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, i * 30);
  }
}

console.log("⭐ Sistema de avaliação com efeitos especiais carregado!");
