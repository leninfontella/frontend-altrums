// ========== HOME MOBILE - INTEGRAÇÃO COM AUTH.JS E API BACKEND ==========

// Verificar se Auth.js está carregado
if (typeof Auth === "undefined") {
  console.error(
    "❌ Auth.js não está carregado! Certifique-se de importar auth.js antes deste script."
  );
  throw new Error("Auth.js é obrigatório");
}

// Sistema de usuário integrado com Auth.js
const UserSystem = {
  profilePicInitialized: false,

  async loadUserProfile() {
    try {
      console.log("🔄 Carregando perfil do usuário...");

      const localData = Auth.getUserData();
      const profileFromAPI = await Auth.getProfile();

      const finalProfileData = {
        ...(localData || {}),
        ...(profileFromAPI || {}),
      };

      if (Object.keys(finalProfileData).length > 0) {
        this.updateUserInterface(finalProfileData);
        console.log("✅ Perfil carregado:", finalProfileData);
        return finalProfileData;
      } else {
        throw new Error("Perfil não encontrado");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);

      const localData = Auth.getUserData();
      if (localData) {
        this.updateUserInterface(localData);
        console.log("⚠️ Fallback para dados locais");
        return localData;
      }

      showNotification("Alguns dados podem não estar atualizados", "warning");
      return null;
    }
  },

  async loadUserBalance() {
    try {
      console.log("🔄 Carregando saldo do usuário...");

      const balance = await Auth.getBalance();

      if (balance !== null && balance !== undefined) {
        this.updateBalanceInterface(balance);
        console.log("✅ Saldo carregado:", balance);
        return balance;
      } else {
        const localBalance = Auth.getUserBalance();
        this.updateBalanceInterface(localBalance);
        console.log("⚠️ Usando saldo local:", localBalance);
        return localBalance;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar saldo:", error);

      const localBalance = Auth.getUserBalance();
      this.updateBalanceInterface(localBalance);
      console.log("⚠️ Fallback para saldo local:", localBalance);
      return localBalance;
    }
  },

  async loadUserStats() {
    try {
      console.log("🔄 Carregando estatísticas do usuário...");

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

      const balance = Auth.getUserBalance();
      const mockStats = {
        totalReceived: balance + Math.floor(Math.random() * 500),
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

      const greetingElement = document.getElementById("user-greeting");
      if (greetingElement && userData.name) {
        const firstName = userData.name.split(" ")[0];
        greetingElement.textContent = `Olá, ${firstName}!`;
        console.log("✅ Saudação atualizada para:", firstName);
      } else if (greetingElement) {
        greetingElement.textContent = "Olá, Usuário!";
        console.log("⚠️ Nome não disponível, usando fallback");
      }

      const userNameElements = document.querySelectorAll(".user-name");
      userNameElements.forEach((element) => {
        element.textContent = userData.name || "Usuário";
      });

      console.log("✅ Interface do usuário atualizada");
    } catch (error) {
      console.error("❌ Erro ao atualizar interface:", error);
    }
  },

  updateProfilePicture(newPhotoUrl) {
    const profilePic = document.querySelector(".profile-pic");
    if (!profilePic) return;

    const img = profilePic.querySelector("img[data-user-photo]");
    const icon = profilePic.querySelector(".fa-user-astronaut");

    if (!img || !icon) return;

    if (newPhotoUrl) {
      let imageUrl = newPhotoUrl;

      if (!newPhotoUrl.startsWith("http")) {
        imageUrl = `http://localhost:5000/${newPhotoUrl}`;
      }

      img.src = imageUrl;
      img.style.display = "block";
      icon.style.display = "none";

      img.onerror = () => {
        console.error("❌ Erro ao carregar foto:", imageUrl);
        img.style.display = "none";
        icon.style.display = "block";
      };

      img.onload = () => {
        console.log("✅ Foto atualizada externamente:", imageUrl);
      };
    } else {
      img.style.display = "none";
      icon.style.display = "block";
      console.log("✅ Foto removida, ícone padrão restaurado");
    }
  },

  updateBalanceInterface(balance) {
    try {
      console.log("💰 Atualizando saldo na interface:", balance);

      const balanceElement = document.querySelector("#user-balance");
      if (balanceElement) {
        const placeholder = balanceElement.querySelector(".data-placeholder");
        if (placeholder) {
          placeholder.remove();
        }

        balanceElement.textContent = balance.toLocaleString();

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

      const statsMap = [
        {
          id: "earned-coins-card",
          value: stats.totalReceived || stats.totalEarned,
        },
        { id: "donated-coins-card", value: stats.totalDonated },
      ];

      statsMap.forEach(({ id, value }) => {
        const card = document.getElementById(id);
        if (card && value !== undefined) {
          const amountSpan = card.querySelector(".coin-amount span");
          if (amountSpan) {
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

// Sistema de níveis baseado no saldo
const LevelSystem = {
  levels: {
    1: { min: 0, max: 199, name: "Iniciante", color: "#8B5CF6", icon: "🌱" },
    2: { min: 200, max: 499, name: "Explorador", color: "#06B6D4", icon: "🔍" },
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
      const headerContent = document.querySelector(".header-content");

      if (headerContent) {
        let levelBadge = document.querySelector(".user-level-badge");

        if (!levelBadge) {
          levelBadge = document.createElement("div");
          levelBadge.className = "user-level-badge";
          headerContent.appendChild(levelBadge);
        }

        levelBadge.innerHTML = `
          <div class="level-info" style="
            background: linear-gradient(135deg, ${levelInfo.color}12, ${
          levelInfo.color
        }20);
            backdrop-filter: blur(8px);
            border: 1.5px solid ${levelInfo.color}35;
            border-radius: 16px;
            padding: 16px 20px;
            margin: 12px 0;
            box-shadow: 
              0 4px 20px ${levelInfo.color}18,
              0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 1px 1px rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: default;
          " onmouseover="this.style.transform='translateY(-1px)'" 
             onmouseout="this.style.transform='translateY(0)'">
            
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;
            ">
              <div style="
                font-size: 20px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
                line-height: 1;
              ">
                ${levelInfo.icon}
              </div>
              <div style="
                color: ${levelInfo.color};
                font-size: 16px;
                font-weight: 600;
                text-shadow: 0 0.5px 1px rgba(0,0,0,0.1);
                letter-spacing: 0.3px;
                flex: 1;
              ">
                ${levelInfo.name}
              </div>
              <div style="
                background: ${levelInfo.color}20;
                color: ${levelInfo.color};
                font-size: 12px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 8px;
                border: 1px solid ${levelInfo.color}30;
                line-height: 1;
              ">
                Nível ${levelInfo.level}
              </div>
            </div>
            
            <div onclick="if(window.location.pathname.includes('levels')) return; window.location.href='/pages/levels/html/badges.html'"
            style="
              display: flex;
              align-items: center;
              gap: 12px;
              cursor: pointer;
            ">
              <div style="
                flex: 1;
                height: 10px;
                background: ${levelInfo.color}15;
                border-radius: 12px;
                border: 1px solid ${levelInfo.color}20;
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
              ">
                <div style="
                  height: 100%;
                  width: ${levelInfo.progress}%;
                  background: linear-gradient(90deg, ${levelInfo.color}, ${
          levelInfo.color
        }dd);
                  border-radius: 12px;
                  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                  position: relative;
                  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                "></div>
              </div>
              
              <div style="
                color: ${levelInfo.color};
                font-size: 13px;
                font-weight: 600;
                text-shadow: 0 0.5px 1px rgba(0,0,0,0.1);
                min-width: 40px;
                text-align: right;
              ">
                ${Math.round(levelInfo.progress)}%
              </div>
            </div>
          </div>
        `;

        console.log("Badge de nível adicionado:", levelInfo);
      }
    } catch (error) {
      console.error("Erro ao adicionar badge de nível:", error);
    }
  },
};

// Sistema de busca e doação - integração com API
const UserSearchAPI = {
  baseUrl: "https://api-backend-coins.onrender.com/api",

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
      return userData.data
        ? userData.data.user || userData.data
        : userData.user || userData;
    } catch (error) {
      console.error("❌ Erro ao carregar detalhes do usuário:", error);
      return null;
    }
  },

  async processDonation(recipientId, amount, message = "") {
    try {
      console.log("🎁 Processando doação via API:", { recipientId, amount });

      const token = Auth.getToken();
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
          <h3>Buscar usuário</h3>
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

  let recipientAvatarHTML;
  const photoUrl = user.profilePhoto || user.photo || user.profilePhotoUrl;

  if (photoUrl) {
    const fullPhotoUrl = photoUrl.startsWith("http")
      ? photoUrl
      : `http://localhost:5000${
          photoUrl.startsWith("/") ? photoUrl : "/" + photoUrl
        }`;

    recipientAvatarHTML = `
      <div class="recipient-avatar" style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: #667eea;">
        <img 
          src="${fullPhotoUrl}" 
          alt="${user.name}"
          style="width: 100%; height: 100%; object-fit: cover;"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div style="width: 100%; height: 100%; display: none; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: bold; font-size: 20px;">
          ${user.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)}
        </div>
      </div>
    `;
  } else {
    const initials = user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
    recipientAvatarHTML = `
      <div class="recipient-avatar" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
        ${initials}
      </div>
    `;
  }

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
            ${recipientAvatarHTML}
            <div class="recipient-details">
              <h4>${user.name}</h4>
              <p class="username">${
                user.username ||
                user.email?.toLowerCase().replace(/\s+/g, "_") ||
                user.name.toLowerCase().replace(/\s+/g, "_")
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
            <button class="confirm-donation-btn" onclick="confirmDonation('${
              user.id || user._id
            }')">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

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
      '<div class="no-results">Nenhum usuário encontrado</div>';
    return;
  }

  const resultsHTML = users
    .map((user) => {
      let avatarHTML;
      const photoUrl = user.profilePhoto || user.photo || user.profilePhotoUrl;

      if (photoUrl) {
        const fullPhotoUrl = photoUrl.startsWith("http")
          ? photoUrl
          : `http://localhost:5000${
              photoUrl.startsWith("/") ? photoUrl : "/" + photoUrl
            }`;

        avatarHTML = `
          <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #667eea;">
            <img 
              src="${fullPhotoUrl}" 
              alt="${user.name}"
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div style="width: 100%; height: 100%; display: none; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: bold; font-size: 14px;">
              ${user.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}
            </div>
          </div>
        `;
      } else {
        const initials = user.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
        avatarHTML = `
          <div class="user-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
            ${initials}
          </div>
        `;
      }

      return `
        <div class="user-result" onclick="openDonationModal('${
          user.id || user._id
        }')">
          ${avatarHTML}
          <div class="user-info">
            <h4>${user.name}</h4>
            <p class="username">${
              user.username ||
              `@${user.name.toLowerCase().replace(/\s+/g, "_")}`
            }</p>      
            <div class="user-stats">
              <span class="coins-count">${(
                user.coins ||
                user.balance ||
                0
              ).toLocaleString()} 🪙</span>
              <span class="level-badge ${(user.level || "iniciante")
                .toLowerCase()
                .replace(" ", "-")}">${user.level || "Iniciante"}</span>
            </div>
          </div>
          <div class="donate-icon">💝</div>
        </div>
      `;
    })
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

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const results = await UserSearchAPI.searchUsers(query);
      renderSearchResults(results);
    }, 500);
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

async function confirmDonation(recipientId) {
  const amountInput = document.getElementById("donation-amount");
  const messageInput = document.getElementById("donation-message");

  const amount = parseInt(amountInput.value);
  const message = messageInput.value.trim();
  const currentBalance = getCurrentUserBalance();

  if (!amount || amount <= 0) {
    showNotification("Digite uma quantidade válida", "error");
    return;
  }

  if (amount > currentBalance) {
    showNotification("Saldo insuficiente para esta doação", "error");
    return;
  }

  try {
    const result = await UserSearchAPI.processDonation(
      recipientId,
      amount,
      message
    );

    if (result.success || result.data) {
      const newBalance = await Auth.getBalance();
      UserSystem.updateBalanceInterface(newBalance);
      closeDonationModal();
      showNotification(
        `Doação de ${amount} moedas realizada com sucesso!`,
        "success"
      );
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
  // Remover notificações existentes
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notif) => notif.remove());

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
  // Verificar se usuário está logado
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

    const profileData = profile.status === "fulfilled" ? profile.value : null;
    const balanceData =
      balance.status === "fulfilled" ? balance.value : Auth.getUserBalance();
    const statsData = stats.status === "fulfilled" ? stats.value : null;

    if (profileData) {
      console.log("Perfil carregado");
    }

    if (balanceData !== null) {
      LevelSystem.addLevelBadge(balanceData);
      console.log("Saldo carregado e nivel calculado");
    }

    if (statsData) {
      console.log("Estatisticas carregadas");
    }

    // Habilitar botão de doação
    const searchDonateBtn = document.getElementById("search-donate-btn");
    if (searchDonateBtn) {
      searchDonateBtn.disabled = false;
      searchDonateBtn.style.opacity = "1";
      searchDonateBtn.style.cursor = "pointer";
      console.log("Botao de doacao habilitado");
    }

    console.log("Inicializacao concluida!");
    // showNotification("Bem-vindo ao Altrums!", "success");
  } catch (error) {
    console.error("Erro durante inicializacao:", error);
    showNotification("Alguns dados podem não estar atualizados", "warning");

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

  // Event listeners para foto de perfil
  window.addEventListener("profilePhotoUpdated", (event) => {
    console.log("Evento de foto atualizada recebido:", event.detail);
    const newPhotoUrl = event.detail.photoUrl;
    UserSystem.updateProfilePicture(newPhotoUrl);
  });

  window.addEventListener("profilePhotoRemoved", () => {
    console.log("Evento de foto removida recebido");
    UserSystem.updateProfilePicture(null);
  });

  window.addEventListener("userDataUpdated", (event) => {
    console.log("Dados do usuário atualizados:", event.detail);
    const userData = event.detail.userData;
    if (userData) {
      UserSystem.updateUserInterface(userData);
    }
  });

  // Event listener para atualização de saldo
  window.addEventListener("balanceUpdated", (event) => {
    console.log("Saldo atualizado:", event.detail);
    const newBalance = event.detail.balance;
    if (newBalance !== null && newBalance !== undefined) {
      UserSystem.updateBalanceInterface(newBalance);
      LevelSystem.addLevelBadge(newBalance);
    }
  });
});

// ========== EVENT LISTENERS ==========

// Botão principal de busca e doação
const searchDonateBtn = document.getElementById("search-donate-btn");
if (searchDonateBtn) {
  searchDonateBtn.addEventListener("click", () => {
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
const viewAwardsBtn = document.getElementById("view-all");

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

// Feedback tátil para dispositivos móveis
function addTouchFeedback(element) {
  if (!element) return;

  element.addEventListener(
    "touchstart",
    () => {
      element.style.transform = "scale(0.98)";
    },
    { passive: true }
  );

  element.addEventListener(
    "touchend",
    () => {
      element.style.transform = "scale(1)";
    },
    { passive: true }
  );

  element.addEventListener(
    "touchcancel",
    () => {
      element.style.transform = "scale(1)";
    },
    { passive: true }
  );
}

// Aplicar feedback tátil
[searchDonateBtn, viewAwardsBtn, ...navItems].forEach(addTouchFeedback);

// Cards clicáveis
const coinCards = document.querySelectorAll(".coin-card");
coinCards.forEach((card) => {
  addTouchFeedback(card);
  card.addEventListener("click", () => {
    // Pode redirecionar para página de estatísticas detalhadas
    console.log("Card de moeda clicado");
  });
});

const awardItems = document.querySelectorAll(".award-item");
awardItems.forEach((item) => {
  addTouchFeedback(item);
  item.addEventListener("click", () => {
    // Pode redirecionar para página de prêmios
    if (viewAwardsBtn) {
      viewAwardsBtn.click();
    }
  });
});

// Balance card clicável
const balanceCard = document.getElementById("balance-card");
if (balanceCard) {
  addTouchFeedback(balanceCard);
  balanceCard.addEventListener("click", () => {
    // Pode mostrar histórico de transações ou detalhes do saldo
    console.log("Balance card clicado");
  });
}

// Status de conexão
// function updateConnectionStatus() {
//   const statusElement = document.getElementById("connection-status");
//   const statusText = document.getElementById("connection-text");

//   if (navigator.onLine) {
//     statusElement.className = "connection-status online";
//     if (statusText) statusText.textContent = "Conectado";
//   } else {
//     statusElement.className = "connection-status offline";
//     if (statusText) statusText.textContent = "Offline";
//   }
// }

// window.addEventListener("online", updateConnectionStatus);
// window.addEventListener("offline", updateConnectionStatus);
// updateConnectionStatus();

// Atualizar horário (se necessário)
// function updateTime() {
//   const now = new Date();
//   const hours = now.getHours().toString().padStart(2, "0");
//   const minutes = now.getMinutes().toString().padStart(2, "0");
//   const statusBarTime = document.querySelector("#status-time");
//   if (statusBarTime) {
//     statusBarTime.textContent = `${hours}:${minutes}`;
//   }
// }

// setInterval(updateTime, 60000);
// updateTime();

// Prevenção de zoom acidental em dispositivos móveis
document.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

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
  { passive: false }
);

// Pull-to-refresh (pode ser implementado se necessário)
let startY = 0;
let isRefreshing = false;

document.addEventListener(
  "touchstart",
  function (e) {
    startY = e.touches[0].pageY;
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  function (e) {
    const y = e.touches[0].pageY;
    const pullDistance = y - startY;

    // Se estiver no topo da página e puxando para baixo
    if (
      window.scrollY === 0 &&
      pullDistance > 0 &&
      pullDistance > 100 &&
      !isRefreshing
    ) {
      isRefreshing = true;

      // Recarregar dados
      showNotification("Atualizando dados...", "info");

      Promise.allSettled([
        UserSystem.loadUserProfile(),
        UserSystem.loadUserBalance(),
        UserSystem.loadUserStats(),
      ])
        .then(() => {
          isRefreshing = false;
          showNotification("Dados atualizados!", "success");
        })
        .catch(() => {
          isRefreshing = false;
          showNotification("Erro ao atualizar", "error");
        });
    }
  },
  { passive: true }
);

console.log(
  "Sistema mobile HOME integrado com Auth.js e API real carregado com sucesso!"
);

// Exportar funções globalmente para compatibilidade
window.UserSystem = UserSystem;
window.LevelSystem = LevelSystem;
window.UserSearchAPI = UserSearchAPI;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
window.openDonationModal = openDonationModal;
window.closeDonationModal = closeDonationModal;
window.setDonationAmount = setDonationAmount;
window.confirmDonation = confirmDonation;
window.showNotification = showNotification;
