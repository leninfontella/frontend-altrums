// ========== INTEGRAÇÃO COM AUTH.JS E API BACKEND ==========

// Verificar se Auth.js está carregado
if (typeof Auth === "undefined") {
  console.error(
    "❌ Auth.js não está carregado! Certifique-se de importar auth.js antes deste script."
  );
  throw new Error("Auth.js é obrigatório");
}

// Sistema de usuário integrado com Auth.js
const UserSystem = {
  async loadUserProfile() {
    try {
      console.log("📄 Carregando perfil do usuário...");

      const profile = await Auth.getProfile();

      if (profile) {
        this.updateUserInterface(profile);
        console.log("✅ Perfil carregado:", profile);
        return profile;
      } else {
        // Fallback para dados salvos localmente
        const localData = Auth.getUserData();
        if (localData) {
          this.updateUserInterface(localData);
          console.log("⚠️ Usando dados locais:", localData);
          return localData;
        }
        throw new Error("Perfil não encontrado");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);

      // Tentar usar dados salvos como fallback
      const localData = Auth.getUserData();
      if (localData) {
        this.updateUserInterface(localData);
        console.log("⚠️ Fallback para dados locais");
        return localData;
      }

      // Mostrar erro amigável
      showNotification("Alguns dados podem não estar atualizados", "warning");
      return null;
    }
  },

  async loadUserBalance() {
    try {
      console.log("📄 Carregando saldo do usuário...");

      const balance = await Auth.getBalance();

      if (balance !== null && balance !== undefined) {
        this.updateBalanceInterface(balance);
        console.log("✅ Saldo carregado:", balance);
        return balance;
      } else {
        // Fallback para saldo local se API falhar
        const localBalance = Auth.getUserBalance();
        this.updateBalanceInterface(localBalance);
        console.log("⚠️ Usando saldo local:", localBalance);
        return localBalance;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar saldo:", error);

      // Usar saldo local como fallback
      const localBalance = Auth.getUserBalance();
      this.updateBalanceInterface(localBalance);
      console.log("⚠️ Fallback para saldo local:", localBalance);
      return localBalance;
    }
  },

  async loadUserStats() {
    try {
      console.log("📄 Carregando estatísticas do usuário...");

      const stats = await Auth.getStats();

      if (stats) {
        this.updateStatsInterface(stats);
        console.log("✅ Estatísticas carregadas:", stats);
        return stats;
      } else {
        throw new Error("Estatísticas não disponíveis");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas:", error);

      // Fallback com stats simuladas baseadas no saldo
      const balance = Auth.getUserBalance();
      const mockStats = {
        totalEarned: balance + Math.floor(Math.random() * 500),
        totalDonated: Math.floor(Math.random() * balance * 0.3),
        bonusCoins: Math.floor(Math.random() * 200),
        monthlyCoins: Math.floor(Math.random() * 300),
      };

      this.updateStatsInterface(mockStats);
      console.log("⚠️ Usando estatísticas simuladas:", mockStats);
      return mockStats;
    }
  },

  updateUserInterface(userData) {
    try {
      console.log("🎨 Atualizando interface do usuário:", userData);

      // Atualizar saudação - CORREÇÃO: verificar se name existe
      const greetingElement = document.getElementById("user-greeting");
      if (greetingElement && userData.name) {
        // Use o nome completo diretamente
        greetingElement.textContent = `Olá, ${userData.name}!`;
        console.log("✅ Saudação atualizada para:", userData.name);
      } else if (greetingElement) {
        // Fallback se não tiver nome
        greetingElement.textContent = "Olá, Usuário!";
        console.log("⚠️ Nome não disponível, usando fallback");
      }

      // Atualizar avatar se houver
      const profilePic = document.querySelector(".profile-pic");
      if (profilePic && userData.avatar) {
        profilePic.innerHTML = userData.avatar;
        console.log("✅ Avatar atualizado");
      }

      // Atualizar outros elementos do perfil se existirem
      const userNameElements = document.querySelectorAll(".user-name");
      userNameElements.forEach((element) => {
        element.textContent = userData.name || "Usuário";
      });

      console.log("✅ Interface do usuário atualizada");
    } catch (error) {
      console.error("❌ Erro ao atualizar interface:", error);
    }
  },

  updateBalanceInterface(balance) {
    try {
      console.log("💰 Atualizando saldo na interface:", balance);

      // CORREÇÃO: Remover placeholder e atualizar saldo
      const balanceElement = document.querySelector("#user-balance");
      if (balanceElement) {
        // Remover placeholder se existir
        const placeholder = balanceElement.querySelector(".data-placeholder");
        if (placeholder) {
          placeholder.remove();
        }

        balanceElement.textContent = balance.toLocaleString();

        // Animação de atualização
        const balanceCard = document.getElementById("balance-card");
        if (balanceCard) {
          balanceCard.classList.add("balance-updated");
          setTimeout(() => {
            balanceCard.classList.remove("balance-updated");
          }, 400);
        }
      }

      console.log("✅ Saldo atualizado na interface:", balance);
    } catch (error) {
      console.error("❌ Erro ao atualizar saldo na interface:", error);
    }
  },

  updateStatsInterface(stats) {
    try {
      console.log("📊 Atualizando estatísticas na interface:", stats);

      // Mapeamento correto dos cards
      const statsMap = [
        { id: "earned-coins-card", value: stats.totalEarned },
        { id: "donated-coins-card", value: stats.totalDonated },
        { id: "bonus-coins-card", value: stats.bonusCoins },
        { id: "monthly-coins-card", value: stats.monthlyCoins },
      ];

      statsMap.forEach(({ id, value }) => {
        const card = document.getElementById(id);
        if (card && value !== undefined) {
          const amountSpan = card.querySelector(".coin-amount span");
          if (amountSpan) {
            // Remover placeholder se existir
            const placeholder = amountSpan.querySelector(".data-placeholder");
            if (placeholder) {
              placeholder.remove();
            }

            amountSpan.textContent = value.toLocaleString();
            card.classList.remove("loading");
            card.classList.add("fade-in");
          }
        }
      });

      console.log("✅ Estatísticas atualizadas na interface");
    } catch (error) {
      console.error("❌ Erro ao atualizar estatísticas:", error);
    }
  },

  async donateCoins(recipientId, amount, message = "") {
    try {
      console.log(
        `🎁 Processando doação: ${amount} moedas para usuário ${recipientId}`
      );

      const result = await Auth.updateBalance(
        amount,
        "subtract",
        `Doação para usuário ${recipientId}: ${message || "Sem mensagem"}`
      );

      if (result && result.success) {
        this.updateBalanceInterface(result.balance);
        showNotification(
          `Doação de ${amount} moedas realizada com sucesso!`,
          "success"
        );

        // Recarregar estatísticas após doação
        setTimeout(() => this.loadUserStats(), 1000);

        return result;
      } else {
        throw new Error("Erro ao processar doação");
      }
    } catch (error) {
      console.error("❌ Erro na doação:", error);
      showNotification(error.message || "Erro ao processar doação", "error");
      throw error;
    }
  },
};

// // Sistema de níveis baseado no saldo
const LevelSystem = {
  levels: {
    1: { min: 0, max: 99, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
    2: { min: 100, max: 499, name: "Explorador", color: "#06B6D4", icon: "🔍" },
    3: {
      min: 500,
      max: 999,
      name: "Aventureiro",
      color: "#10B981",
      icon: "🎒",
    },
    4: {
      min: 1000,
      max: 4999,
      name: "Benfeitor",
      color: "#F59E0B",
      icon: "🤝",
    },
    5: { min: 5000, max: 9999, name: "Generoso", color: "#EF4444", icon: "❤️" },
    6: {
      min: 10000,
      max: 49999,
      name: "Filantropo",
      color: "#EC4899",
      icon: "🏆",
    },
    7: {
      min: 50000,
      max: 99999,
      name: "Magnata",
      color: "#8B5CF6",
      icon: "💎",
    },
    8: {
      min: 100000,
      max: 499999,
      name: "Lenda",
      color: "#06B6D4",
      icon: "⭐",
    },
    9: { min: 500000, max: 999999, name: "Mito", color: "#F97316", icon: "🔥" },
    10: {
      min: 1000000,
      max: Infinity,
      name: "Divino",
      color: "#FFD700",
      icon: "👑",
    },
  },

  calculateLevel(balance) {
    for (let level = 1; level <= 10; level++) {
      const levelInfo = this.levels[level];
      if (balance >= levelInfo.min && balance <= levelInfo.max) {
        return {
          level: level,
          ...levelInfo,
          progress: this.calculateProgress(balance, levelInfo),
        };
      }
    }
    return { level: 1, ...this.levels[1], progress: 0 };
  },

  calculateProgress(balance, levelInfo) {
    if (levelInfo.max === Infinity) return 100;
    const range = levelInfo.max - levelInfo.min + 1;
    const current = balance - levelInfo.min;
    return Math.min(100, Math.max(0, (current / range) * 100));
  },

  addLevelBadge(balance) {
    try {
      const levelInfo = this.calculateLevel(balance);

      // Procurar um local para adicionar o badge
      const profileSection = document.querySelector(
        ".profile-section, .user-info, .header"
      );
      if (profileSection) {
        let levelBadge = document.querySelector(".user-level-badge");

        if (!levelBadge) {
          levelBadge = document.createElement("div");
          levelBadge.className = "user-level-badge";
          profileSection.appendChild(levelBadge);
        }

        levelBadge.innerHTML = `
          <div class="level-info" style="
            background: linear-gradient(135deg, ${levelInfo.color}20, ${
          levelInfo.color
        }40);
            border: 1px solid ${levelInfo.color}60;
            border-radius: 12px;
            padding: 8px 12px;
            margin-top: 8px;
            text-align: center;
          ">
            <div style="color: ${
              levelInfo.color
            }; font-size: 14px; font-weight: 600;">
              ${levelInfo.icon} ${levelInfo.name}
            </div>
            <div style="color: #888; font-size: 11px;">
              Nivel ${levelInfo.level} • ${Math.round(levelInfo.progress)}%
            </div>
          </div>
        `;

        console.log("Badge de nivel adicionado:", levelInfo);
      }
    } catch (error) {
      console.error("Erro ao adicionar badge de nivel:", error);
    }
  },
};

// ========== SISTEMA DE BUSCA E DOAÇÃO - INTEGRAÇÃO COM API ==========

// REMOVIDO: Base de dados simulada substituída por chamadas à API

// ... (existing code)

// ========== SISTEMA DE BUSCA E DOAÇÃO - INTEGRAÇÃO COM API ==========

const UserSearchAPI = {
  // CORREÇÃO: Mudar a porta para 5000, que é a porta do backend
  baseUrl: "http://localhost:5000/api", // Configurar conforme sua API

  async searchUsers(query) {
    try {
      if (!query || query.length < 2) return [];

      console.log("🔍 Buscando usuários na API:", query);

      const token = Auth.getToken();
      const response = await fetch(
        `${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na busca: ${response.status}`);
      }

      const data = await response.json();

      // DEBUG: Ver toda a estrutura da resposta
      console.log("📋 Resposta completa da API:", data);
      console.log("📋 Tipo da resposta:", typeof data);
      console.log("📋 Chaves disponíveis:", Object.keys(data));

      // CORREÇÃO: Tentar diferentes estruturas possíveis
      let users = [];

      if (data.users) {
        users = data.users;
      } else if (data.data && data.data.users) {
        users = data.data.users;
      } else if (Array.isArray(data)) {
        users = data;
      } else if (data.result) {
        users = data.result;
      } else {
        console.warn("⚠️ Estrutura de resposta não reconhecida:", data);
        users = [];
      }

      console.log("✅ Usuários encontrados:", users.length);
      console.log("👥 Lista de usuários:", users);

      return users;
    } catch (error) {
      console.error("❌ Erro ao buscar usuários:", error);
      showNotification("Erro ao buscar usuários", "error");
      return [];
    }
  },

  async getUserDetails(userId) {
    try {
      const token = Auth.getToken();
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar usuário: ${response.status}`);
      }

      const userData = await response.json();
      console.log("✅ Detalhes do usuário carregados:", userData);

      // ⬇️ Retorna direto o objeto do usuário
      return userData.data.user;
    } catch (error) {
      console.error("❌ Erro ao carregar detalhes do usuário:", error);
      return null;
    }
  },

  async processDonation(recipientId, amount, message = "") {
    try {
      console.log("🎁 Processando doação via API:", { recipientId, amount });

      const token = Auth.getToken();
      // CORREÇÃO: A rota agora é '/donations'
      const response = await fetch(`${this.baseUrl}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId,
          amount,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Erro na doação: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("✅ Doação processada com sucesso:", result);

      return result;
    } catch (error) {
      console.error("❌ Erro ao processar doação:", error);
      throw error;
    }
  },
};
// ... (rest of the code)

function getCurrentUserBalance() {
  return Auth.getUserBalance();
}

// ========== MODAIS ==========

function createSearchModal() {
  const modalHTML = `
    <div id="search-modal" class="search-modal">
      <div class="modal-backdrop" onclick="closeSearchModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>Buscar doador</h3>
          <button class="close-btn" onclick="closeSearchModal()">✕</button>
        </div>
        
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              id="user-search-input" 
              placeholder="Digite o nome do usuário"
              autocomplete="off"
            >
            <span class="search-icon">🔍</span>
          </div>
        </div>
        
        <div class="search-results" id="search-results">
          <div class="no-results">
            Digite pelo menos 2 caracteres para buscar
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function createDonationModal(user) {
  const currentBalance = getCurrentUserBalance();

  const modalHTML = `
    <div id="donation-modal" class="donation-modal">
      <div class="modal-backdrop" onclick="closeDonationModal()"></div>
      <div class="modal-content donation-content">
        <div class="modal-header">
          <h3>Doar Moedas</h3>
          <button class="close-btn" onclick="closeDonationModal()">✕</button>
        </div>
        
        <div class="donation-info">
          <div class="recipient-info">
            <div class="recipient-avatar">${user.avatar || "👤"}</div>
            <div class="recipient-details">
              <h4>${user.name}</h4>
              <p class="username">${
                user.username ||
                `${user.email.toLowerCase().replace(/\s+/g, "_")}`
              }</p>
              <p class="institution">${user.institution || "Nível atual:"}</p>
              <div class="level-badge ${(user.level || "iniciante")
                .toLowerCase()
                .replace(" ", "-")}">${user.level || "Iniciante"}</div>
            </div>
          </div>
          
          <div class="balance-info">
            <p class="current-balance">Seu saldo atual: <strong>${currentBalance.toLocaleString()} moedas</strong></p>
          </div>
          
          <div class="donation-amount-section">
            <label for="donation-amount">Quantidade de moedas para doar:</label>
            <div class="amount-input-wrapper">
              <input 
                type="number" 
                id="donation-amount" 
                min="1" 
                max="${currentBalance}" 
                placeholder="Digite a quantidade"
              >
              <span class="coin-icon">🪙</span>
            </div>
            
              <div class="quick-amounts">
              <button class="quick-amount" onclick="setDonationAmount(10)">10</button>
              <button class="quick-amount" onclick="setDonationAmount(50)">50</button>
              <button class="quick-amount" onclick="setDonationAmount(100)">100</button>
              </div>
              </div>
          
          <div class="donation-message-section">
            <label for="donation-message">Mensagem (opcional):</label>
            <textarea 
              id="donation-message" 
              placeholder="Escreva uma mensagem motivacional..."
              maxlength="200"
            ></textarea>
            <div class="char-counter">0/200</div>
          </div>
          
          <div class="donation-actions">
  <button class="cancel-btn" onclick="closeDonationModal()">Cancelar</button>
  <button class="confirm-donation-btn" onclick="confirmDonation('${user.id}')">
    Confirmar Doação
  </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Event listeners
  const messageTextarea = document.getElementById("donation-message");
  const charCounter = document.querySelector(".char-counter");

  messageTextarea.addEventListener("input", function () {
    const count = this.value.length;
    charCounter.textContent = `${count}/200`;
    charCounter.style.color = count > 180 ? "#ff6b6b" : "#666";
  });
}

function renderSearchResults(users) {
  const resultsContainer = document.getElementById("search-results");

  if (users.length === 0) {
    resultsContainer.innerHTML =
      '<div class="no-results">Nenhum usuario encontrado</div>';
    return;
  }

  const resultsHTML = users
    .map(
      (user) => `
    <div class="user-result" onclick="openDonationModal('${user.id}')">
      <div class="user-avatar">${user.avatar || "👤"}</div>
      <div class="user-info">
        <h4>${user.name}</h4>
        <p class="username">${
          user.username || `@${user.name.toLowerCase().replace(/\s+/g, "_")}`
        }</p>      
        <div class="user-stats">
          <span class="coins-count">${(
            user.coins || 0
          ).toLocaleString()} 🪙</span>
          <span class="level-badge ${(user.level || "iniciante")
            .toLowerCase()
            .replace(" ", "-")}">${user.level || "Iniciante"}</span>
        </div>
      </div>
      <div class="donate-icon">👐</div>
    </div>
  `
    )
    .join("");

  resultsContainer.innerHTML = resultsHTML;
}

// ========== FUNÇÕES DOS MODAIS ==========

function openSearchModal() {
  const existingModal = document.getElementById("search-modal");
  if (existingModal) existingModal.remove();

  createSearchModal();

  const searchInput = document.getElementById("user-search-input");
  let searchTimeout;

  searchInput.addEventListener("input", function () {
    const query = this.value;

    // Debounce para evitar muitas requisições
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const results = await UserSearchAPI.searchUsers(query);
      renderSearchResults(results);
    }, 500); // Aguardar 500ms após parar de digitar
  });

  setTimeout(() => searchInput.focus(), 100);
}

function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.add("closing");
    setTimeout(() => modal.remove(), 300);
  }
}

async function openDonationModal(userId) {
  const user = await UserSearchAPI.getUserDetails(userId);
  if (!user) {
    showNotification("Erro ao carregar dados do usuário", "error");
    return;
  }
  createDonationModal(user); // agora `user.name`, `user.email`, etc. funcionam

  closeSearchModal();
  const existingModal = document.getElementById("donation-modal");
  if (existingModal) existingModal.remove();

  setTimeout(() => createDonationModal(user), 350);
}

function closeDonationModal() {
  const modal = document.getElementById("donation-modal");
  if (modal) {
    modal.classList.add("closing");
    setTimeout(() => modal.remove(), 300);
  }
}

function setDonationAmount(amount) {
  const input = document.getElementById("donation-amount");
  input.value = amount;
  input.focus();
}

// Dentro do seu arquivo script.js

async function confirmDonation(recipientId) {
  const amountInput = document.getElementById("donation-amount");
  const messageInput = document.getElementById("donation-message");

  const amount = parseInt(amountInput.value);
  const message = messageInput.value.trim();
  const currentBalance = getCurrentUserBalance();

  // ... (código de validação) ...

  try {
    // 1. Processar doação via API
    const result = await UserSearchAPI.processDonation(
      recipientId,
      amount,
      message
    );

    if (result.success) {
      // 2. BUSCAR O SALDO MAIS RECENTE DIRETAMENTE DA API
      const newBalance = await Auth.getBalance();

      // 3. ATUALIZAR A INTERFACE COM O NOVO SALDO
      UserSystem.updateBalanceInterface(newBalance);

      // Fechar modal
      closeDonationModal();

      showNotification(
        `Doação de ${amount} moedas realizada com sucesso!`,
        "success"
      );

      // Recarregar estatísticas (isso já está correto)
      setTimeout(() => UserSystem.loadUserStats(), 1000);

      console.log("Doação realizada com sucesso:", result);
    } else {
      throw new Error(result.message || "Erro ao processar doação");
    }
  } catch (error) {
    console.error("Erro na doação:", error);
    showNotification(error.message || "Erro ao processar doação", "error");
  }
}

// ========== SISTEMA DE NOTIFICAÇÕES ==========

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 4000);
}

// ========== INICIALIZAÇÃO E EVENTOS ==========

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar se usuário está logado usando Auth.js
  if (!Auth.checkSession()) {
    console.log("Usuario não logado - redirecionando");
    Auth.redirectToLogin();
    return;
  }

  console.log("Iniciando carregamento dos dados do usuario...");

  try {
    // Mostrar loading state
    const balanceElement = document.querySelector("#user-balance");
    if (balanceElement && !balanceElement.textContent.includes("placeholder")) {
      balanceElement.innerHTML =
        '<div class="data-placeholder" style="width: 80px; display: inline-block"></div>';
    }

    // Carregar dados do usuário em paralelo
    const [profile, balance, stats] = await Promise.allSettled([
      UserSystem.loadUserProfile(),
      UserSystem.loadUserBalance(),
      UserSystem.loadUserStats(),
    ]);

    // Processar resultados
    const profileData = profile.status === "fulfilled" ? profile.value : null;
    const balanceData =
      balance.status === "fulfilled" ? balance.value : Auth.getUserBalance();
    const statsData = stats.status === "fulfilled" ? stats.value : null;

    if (profileData) {
      console.log("Perfil carregado");
    }

    if (balanceData !== null) {
      // Adicionar badge de nível baseado no saldo
      LevelSystem.addLevelBadge(balanceData);
      console.log("Saldo carregado e nivel calculado");
    }

    if (statsData) {
      console.log("Estatisticas carregadas");
    }

    // CORREÇÃO: Habilitar botão de doação após carregar dados
    const searchDonateBtn = document.getElementById("search-donate-btn");
    if (searchDonateBtn) {
      searchDonateBtn.disabled = false;
      searchDonateBtn.style.opacity = "1";
      searchDonateBtn.style.cursor = "pointer";
      console.log("Botao de doacao habilitado");
    }

    console.log("Inicializacao concluida!");
    showNotification("Bem-vindo ao Autrums!", "success");
  } catch (error) {
    console.error("Erro durante inicializacao:", error);
    showNotification("Alguns dados podem não estar atualizados", "warning");

    // Mesmo com erro, habilitar o botão se tiver saldo
    const searchDonateBtn = document.getElementById("search-donate-btn");
    if (searchDonateBtn && Auth.getUserBalance() > 0) {
      searchDonateBtn.disabled = false;
      searchDonateBtn.style.opacity = "1";
      searchDonateBtn.style.cursor = "pointer";
    }
  }

  // Animações de entrada
  const animateElements = document.querySelectorAll(
    ".action-button, .coin-card, .award-item"
  );
  animateElements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";

    setTimeout(() => {
      element.style.transition = "all 0.6s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 100);
  });
});

// ========== EVENT LISTENERS ==========

// Botão principal de buscar e doar - CORREÇÃO: Garantir que funcione
const searchDonateBtn = document.getElementById("search-donate-btn");
if (searchDonateBtn) {
  searchDonateBtn.addEventListener("click", () => {
    // Verificar se está habilitado
    if (searchDonateBtn.disabled) {
      showNotification("Aguarde o carregamento dos dados", "info");
      return;
    }

    searchDonateBtn.style.transform = "scale(0.98)";
    setTimeout(() => {
      searchDonateBtn.style.transform = "scale(1)";
    }, 200);

    openSearchModal();
    console.log("Modal de busca aberto");
  });
}

// Navegação
const navItems = document.querySelectorAll(".nav-item");
const profile = document.getElementById("profile");
const ranks = document.getElementById("ranks");
const buttonTimeline = document.getElementById("go-timeline");

if (ranks) {
  ranks.addEventListener("click", () => {
    window.location.href = "../../ranking/html/ranks.html";
  });
}

if (profile) {
  profile.addEventListener("click", () => {
    window.location.href = "../../profile/pages/profile.html";
  });
}

if (buttonTimeline) {
  buttonTimeline.addEventListener("click", () => {
    window.location.href = "../../timeline/html/timeline.html";
  });
}

// Ver mais botões
const viewCoinsBtn = document.getElementById("view-coins-btn");
const viewAwardsBtn = document.getElementById("view-all");

if (viewCoinsBtn) {
  viewCoinsBtn.addEventListener("click", () => {
    window.location.href = "../../profile/pages/profile.html";
  });
}

if (viewAwardsBtn) {
  viewAwardsBtn.addEventListener("click", () => {
    window.location.href = "../../prizes/html/index.html";
  });
}

// Navegação ativa
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    item.style.transform = "scale(0.95)";
    setTimeout(() => {
      item.style.transform = "scale(1)";
    }, 150);
  });
});

// Feedback tátil
function addTouchFeedback(element) {
  if (!element) return;

  element.addEventListener("touchstart", () => {
    element.style.transform = "scale(0.98)";
  });

  element.addEventListener("touchend", () => {
    element.style.transform = "scale(1)";
  });
}

[searchDonateBtn, viewCoinsBtn, viewAwardsBtn, ...navItems].forEach(
  addTouchFeedback
);

// Atualizar horário
function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const statusBarTime = document.querySelector("#status-time");
  if (statusBarTime) {
    statusBarTime.textContent = `${hours}:${minutes}`;
  }
}

setInterval(updateTime, 60000);
updateTime(); // Executar imediatamente

console.log("Sistema integrado com Auth.js e API real carregado com sucesso!");
console.log(
  "Funcionalidades disponíveis: Perfil, Saldo, Estatísticas, Doações via API"
);

// Exportar funções globalmente se necessário
window.UserSystem = UserSystem;
// window.LevelSystem = LevelSystem;
window.UserSearchAPI = UserSearchAPI;
