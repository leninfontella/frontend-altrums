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
        totalReceived: 0,
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
          value: stats.totalReceived ?? stats.totalEarned,
        },
        { id: "donated-coins-card", value: stats.totalDonated ?? 0 },
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

// Sistema de níveis baseado no total doado
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

  calculateLevel(totalDonated) {
    for (let level = 1; level <= 10; level++) {
      const levelInfo = this.levels[level];
      if (totalDonated >= levelInfo.min && totalDonated <= levelInfo.max) {
        return {
          level: level,
          ...levelInfo,
          progress: this.calculateProgress(totalDonated, levelInfo),
        };
      }
    }
    return { level: 1, ...this.levels[1], progress: 0 };
  },

  calculateProgress(totalDonated, levelInfo) {
    if (levelInfo.max === Infinity) return 100;
    const range = levelInfo.max - levelInfo.min + 1;
    const current = totalDonated - levelInfo.min;
    return Math.min(100, Math.max(0, (current / range) * 100));
  },

  async addLevelBadge(stats = null) {
    try {
      // Se não recebeu stats como parâmetro, tenta carregar
      let totalDonated = 0;

      if (stats && stats.totalDonated !== undefined) {
        totalDonated = stats.totalDonated;
      } else {
        // Tenta carregar as estatísticas para obter o total doado
        try {
          const userStats = await Auth.getStats();
          totalDonated = userStats?.totalDonated || 0;
        } catch (error) {
          console.warn(
            "Não foi possível carregar estatísticas para o nível:",
            error
          );
          // Como fallback, usa 0 (nível iniciante)
          totalDonated = 0;
        }
      }

      const levelInfo = this.calculateLevel(totalDonated);
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
            
            <div style="
              margin-top: 8px;
              font-size: 11px;
              color: ${levelInfo.color}80;
              text-align: center;
              font-weight: 500;
            ">
              ${totalDonated.toLocaleString()} moedas doadas
            </div>
          </div>
        `;

        console.log("Badge de nível adicionado baseado no total doado:", {
          totalDonated,
          levelInfo,
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar badge de nível:", error);
    }
  },

  getUserLevel(totalDonated) {
    return this.calculateLevel(totalDonated);
  },

  getNextLevel(currentLevel) {
    if (currentLevel >= 10) return null;
    return this.levels[currentLevel + 1];
  },

  getCoinsToNextLevel(totalDonated) {
    const currentLevel = this.calculateLevel(totalDonated);
    const nextLevel = this.getNextLevel(currentLevel.level);

    if (!nextLevel) return 0;
    return nextLevel.min - totalDonated;
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
      <div class="recipient-avatar" style="width: 72px; height: 72px; border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #667eea, #764ba2); position: relative;">
        <img 
          src="${fullPhotoUrl}" 
          alt="${user.name}"
          style="width: 100%; height: 100%; object-fit: cover;"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: bold; font-size: 24px;">
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
      <div class="recipient-avatar" style="width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; border: 2px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(15px);">
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
            }', '${user.name}')">
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
    charCounter.style.color =
      count > 180 ? "#ff6b6b" : "rgba(255, 255, 255, 0.5)";
  });
}

// ========== POP-UP DE SUCESSO MODERNO ==========

function createSuccessPopup(amount, recipientName) {
  const popupHTML = `
    <div id="success-popup" class="success-popup">
      <div class="success-popup-backdrop" onclick="closeSuccessPopup()"></div>
      <div class="success-popup-content">
        <div class="success-popup-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <h2 class="success-popup-title">Doação Realizada!</h2>
        
        <p class="success-popup-message">
          Parabéns! Sua generosidade fez a diferença.
        </p>
        
        <div class="success-popup-details">
          <div class="success-popup-amount">
            <span class="coin-icon">🪙</span>
            ${amount.toLocaleString()} moedas
          </div>
          <div class="success-popup-recipient">
            doadas para <strong>${recipientName}</strong>
          </div>
        </div>
        
        <button class="success-popup-close" onclick="closeSuccessPopup()">
          Continuar
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupHTML);

  // Auto-close após 8 segundos
  setTimeout(() => {
    closeSuccessPopup();
  }, 8000);
}

function closeSuccessPopup() {
  const popup = document.getElementById("success-popup");
  if (popup) {
    popup.classList.add("closing");
    setTimeout(() => popup.remove(), 300);
  }
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
          <div class="user-avatar" style="width: 54px; height: 54px; border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, #667eea, #764ba2); position: relative;">
            <img 
              src="${fullPhotoUrl}" 
              alt="${user.name}"
              style="width: 100%; height: 100%; object-fit: cover;"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; display: none; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea, #764ba2); color: white; font-weight: bold; font-size: 16px;">
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
          <div class="user-avatar" style="width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px);">
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

async function confirmDonation(recipientId, recipientName) {
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

  // Desabilitar botão para evitar cliques duplos
  const confirmBtn = document.querySelector(".confirm-donation-btn");
  const originalText = confirmBtn.textContent;
  confirmBtn.disabled = true;
  confirmBtn.textContent = "Processando...";

  try {
    const result = await UserSearchAPI.processDonation(
      recipientId,
      amount,
      message
    );

    if (result.success || result.data) {
      // Atualizar saldo local
      const newBalance = await Auth.getBalance();
      UserSystem.updateBalanceInterface(newBalance);

      // Fechar modal de doação
      closeDonationModal();

      // Mostrar pop-up de sucesso moderno
      setTimeout(() => {
        createSuccessPopup(amount, recipientName);
      }, 400);

      // Atualizar estatísticas após um delay
      setTimeout(() => UserSystem.loadUserStats(), 1500);

      console.log("Doação realizada com sucesso:", result);
    } else {
      throw new Error(result.message || "Erro ao processar doação");
    }
  } catch (error) {
    console.error("Erro na doação:", error);
    showNotification(error.message || "Erro ao processar doação", "error");

    // Reabilitar botão em caso de erro
    confirmBtn.disabled = false;
    confirmBtn.textContent = originalText;
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
    console.log("Card de moeda clicado");
  });
});

const awardItems = document.querySelectorAll(".award-item");
awardItems.forEach((item) => {
  addTouchFeedback(item);
  item.addEventListener("click", () => {
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
    console.log("Balance card clicado");
  });
}

// Pull-to-refresh
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

    if (
      window.scrollY === 0 &&
      pullDistance > 0 &&
      pullDistance > 100 &&
      !isRefreshing
    ) {
      isRefreshing = true;

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

// Prevenção de zoom acidental
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

// ========== SISTEMA DE FILA DE NOTIFICAÇÕES PERSISTENTE (SEM MUDANÇAS ESTRUTURAIS) ==========

const DonationQueue = {
  STORAGE_KEY: "pendingDonations",

  // Adiciona uma doação à fila (sempre chamado para persistir no localStorage)
  add(amount, newBalance, donorName = null, timestamp = Date.now()) {
    const queue = this.getAll();

    const donation = {
      id: `donation_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      newBalance,
      donorName,
      timestamp,
      shown: false,
    };

    queue.push(donation);
    this.save(queue);

    console.log("Doação adicionada à fila persistente:", donation);
    return donation; // Retorna o objeto completo para uso imediato
  },

  // Obtém todas as doações pendentes
  getAll() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Erro ao carregar fila de doações:", error);
      return [];
    }
  },

  // Obtém apenas doações não visualizadas
  getPending() {
    // Filtra e garante que o retorno está ordenado por tempo
    return this.getAll()
      .filter((d) => !d.shown)
      .sort((a, b) => a.timestamp - b.timestamp); // Mais antigas primeiro
  },

  // Salva a fila
  save(queue) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
      console.log("Fila de doações salva com sucesso no localStorage."); // Adicionado para confirmação
    } catch (error) {
      // ESTE CATCH AGORA É CRÍTICO
      if (error.name === "QuotaExceededError") {
        console.error(
          "ERRO CRÍTICO: Quota do localStorage Excedida! Não foi possível salvar a doação.",
          error
        );
      } else {
        console.error(
          "ERRO AO SALVAR FILA DE DOAÇÕES NO LOCALSTORAGE:",
          error.name,
          error.message,
          error
        );
      }
      // Se não salva, o sistema de persistência falha
    }
  },

  // Marca uma doação como visualizada
  markAsShown(donationId) {
    const queue = this.getAll();
    const donation = queue.find((d) => d.id === donationId);

    if (donation && !donation.shown) {
      donation.shown = true;
      this.save(queue);
      console.log("Doação marcada como visualizada:", donationId);
    }
  },

  // Remove doações antigas (mais de 7 dias)
  cleanup() {
    const queue = this.getAll();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cleaned = queue.filter((d) => d.timestamp > sevenDaysAgo);

    if (cleaned.length < queue.length) {
      this.save(cleaned);
      console.log(
        `Limpeza: ${queue.length - cleaned.length} doações antigas removidas`
      );
    }
  },

  // Limpa todas as doações (para teste)
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log("Fila de doações limpa");
  },

  // Conta quantas doações pendentes existem
  count() {
    return this.getPending().length;
  },
};

// ========== POPUP DE DOAÇÃO COM FILA (MELHORIA NO FLUXO isShowingPopup) ==========

let currentPopupQueue = []; // Fila de exibição da sessão
let isShowingPopup = false;

function createDonationReceivedPopup(
  amount,
  newBalance,
  donorName = null,
  donationId = null
) {
  console.log("Criando popup de doação recebida...", {
    amount,
    newBalance,
    donorName,
    donationId,
  });

  // Remove qualquer popup existente antes de criar um novo
  const existingPopup = document.getElementById("donation-received-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  document.body.style.overflow = "hidden";

  const donorInfo = donorName
    ? `<div class="donation-received-donor">Doação de <strong>${donorName}</strong></div>`
    : "";

  const buttonText =
    currentPopupQueue.length > 0
      ? `Próxima (${currentPopupQueue.length} restante${
          currentPopupQueue.length > 1 ? "s" : ""
        })`
      : "Continuar";

  const popupHTML = `
    <div id="donation-received-popup" class="donation-received-popup" data-donation-id="${
      donationId || ""
    }">
      <div class="donation-received-backdrop"></div>
      <div class="donation-received-content">
        <div class="donation-confetti">
          <div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div><div class="confetti-piece"></div>
        </div>

        <div class="donation-received-icon">
          <i class="fas fa-gift"></i>
        </div>
        
        <h2 class="donation-received-title">Parabéns!</h2>
        
        <p class="donation-received-message">
          Você recebeu uma doação! Continue fazendo a diferença.
        </p>
        
        <div class="donation-received-details">
          <div class="donation-received-amount">
            <span class="coin-emoji">🪙</span>
            +${amount.toLocaleString()}
          </div>
          <div class="donation-received-new-balance">
            Seu saldo atual é <strong>${newBalance.toLocaleString()} moedas</strong>
          </div>
          ${donorInfo}
        </div>
        
        <button class="donation-received-close" id="close-donation-popup">
          ${buttonText}
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupHTML);

  setTimeout(() => {
    const backdrop = document.querySelector(".donation-received-backdrop");
    const closeBtn = document.getElementById("close-donation-popup");

    if (backdrop) {
      backdrop.addEventListener("click", closeDonationReceivedPopup);
      backdrop.addEventListener("touchend", closeDonationReceivedPopup);
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeDonationReceivedPopup);
      closeBtn.addEventListener("touchend", closeDonationReceivedPopup);
    }
  }, 100);

  playDonationSound();

  // Fecha automaticamente após 10 segundos
  window.donationPopupTimer = setTimeout(() => {
    closeDonationReceivedPopup();
  }, 10000);

  console.log("Popup exibido");
}

function closeDonationReceivedPopup() {
  const popup = document.getElementById("donation-received-popup");
  if (popup) {
    // 1. Marca como visualizada no localStorage
    const donationId = popup.getAttribute("data-donation-id");
    if (donationId) {
      DonationQueue.markAsShown(donationId);
    }

    popup.classList.add("closing");

    if (window.donationPopupTimer) {
      clearTimeout(window.donationPopupTimer);
      window.donationPopupTimer = null;
    }

    setTimeout(() => {
      popup.remove();
      document.body.style.overflow = "";

      // 2. Mostra a próxima doação da fila
      showNextDonationFromQueue();
    }, 400); // Duração da animação de fechamento
  }
}

// Mostra a próxima doação da fila
function showNextDonationFromQueue() {
  if (currentPopupQueue.length > 0) {
    // O popup está prestes a ser exibido
    isShowingPopup = true;
    const nextDonation = currentPopupQueue.shift();

    // Pequeno delay para transição suave entre popups sequenciais
    setTimeout(() => {
      createDonationReceivedPopup(
        nextDonation.amount,
        nextDonation.newBalance,
        nextDonation.donorName,
        nextDonation.id // Passa o ID para marcação
      );
    }, 500);
  } else {
    // A fila de exibição da sessão terminou
    isShowingPopup = false;
    console.log("Fila de popups concluída.");
  }
}

// Processa todas as doações pendentes ao carregar a página HOME
function processAllPendingDonations() {
  // Já retorna ordenado por timestamp
  const pending = DonationQueue.getPending();

  if (pending.length === 0) {
    console.log("Nenhuma doação pendente no localStorage.");
    return;
  }

  console.log(
    `${pending.length} doação(ões) pendente(s) encontrada(s) no localStorage.`
  );

  // Adiciona **TODAS** à fila de exibição da sessão
  currentPopupQueue = [...pending];

  // Mostra a primeira, se não houver popup em exibição
  if (!isShowingPopup) {
    showNextDonationFromQueue();
  }
}

// ... playDonationSound (não alterado) ...

function playDonationSound() {
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log("Som não disponível:", error);
  }
}

// ========== DETECÇÃO DE DOAÇÕES (CORRIGIDO) ==========

let lastKnownBalance = null;
let isInitialized = false;

// Assume-se que Auth e Auth.getBalance existem
const originalGetBalance = Auth.getBalance;

Auth.getBalance = async function () {
  try {
    const newBalance = await originalGetBalance.call(Auth);

    console.log("Saldo obtido:", newBalance, "| Anterior:", lastKnownBalance);

    if (!isInitialized) {
      lastKnownBalance = newBalance;
      isInitialized = true;
      console.log("Saldo inicial registrado:", lastKnownBalance);
      return newBalance;
    }

    // Detecta aumento (doação recebida)
    if (lastKnownBalance !== null && newBalance > lastKnownBalance) {
      const difference = newBalance - lastKnownBalance;

      console.log("DOAÇÃO DETECTADA!", {
        anterior: lastKnownBalance,
        novo: newBalance,
        diferenca: difference,
      });

      // PASSO 1: SEMPRE salva a doação na fila persistente (localStorage)
      const newDonation = DonationQueue.add(difference, newBalance);

      // Verifica se estamos na página HOME
      const isOnHomePage =
        window.location.pathname.includes("home") ||
        window.location.pathname.includes("index") ||
        window.location.pathname === "/";

      if (isOnHomePage) {
        // PASSO 2: Se estiver na HOME, adiciona à fila de exibição da sessão
        currentPopupQueue.push(newDonation);

        // PASSO 3: Inicia a exibição se não houver popup visível
        if (!isShowingPopup) {
          showNextDonationFromQueue();
        }
      } else {
        // Se não estiver na HOME, a doação permanece apenas no localStorage.
        console.log(
          "Doação salva na fila persistente (usuário em outra página)"
        );
      }
    }

    lastKnownBalance = newBalance;
    return newBalance;
  } catch (error) {
    console.error("Erro ao obter saldo:", error);
    throw error;
  }
};

// ========== INICIALIZAÇÃO NA PÁGINA HOME (MANTIDO) ==========

document.addEventListener("DOMContentLoaded", () => {
  // Limpa doações antigas
  DonationQueue.cleanup();

  // Verifica se está na página HOME
  const isOnHomePage =
    window.location.pathname.includes("home") ||
    window.location.pathname.includes("index") ||
    window.location.pathname === "/";

  if (isOnHomePage) {
    console.log("Página HOME detectada - verificando doações pendentes...");

    // Aguarda um pouco para garantir que a página e o Auth carregaram
    setTimeout(() => {
      processAllPendingDonations();
    }, 2000);
  }
});

// ========== LISTENERS ADICIONAIS (CORRIGIDO) ==========

window.addEventListener("balanceUpdated", (event) => {
  console.log("Evento balanceUpdated recebido:", event.detail);
  const newBalance = event.detail.balance;

  // Lógica de detecção de aumento (similar ao Auth.getBalance)
  if (
    lastKnownBalance !== null &&
    newBalance > lastKnownBalance &&
    isInitialized
  ) {
    const difference = newBalance - lastKnownBalance;

    // PASSO 1: SEMPRE salva a doação na fila persistente
    const newDonation = DonationQueue.add(difference, newBalance);

    const isOnHomePage =
      window.location.pathname.includes("home") ||
      window.location.pathname.includes("index") ||
      window.location.pathname === "/";

    if (isOnHomePage) {
      // PASSO 2: Se estiver na HOME, adiciona à fila de exibição da sessão
      currentPopupQueue.push(newDonation);

      // PASSO 3: Inicia a exibição se não houver popup visível
      if (!isShowingPopup) {
        showNextDonationFromQueue();
      }
    }
  }

  if (!isInitialized) {
    isInitialized = true;
  }
  lastKnownBalance = newBalance;
});

window.addEventListener("donationReceived", (event) => {
  const { amount, newBalance, donorName } = event.detail;
  console.log("Evento donationReceived:", event.detail);

  // PASSO 1: SEMPRE salva a doação na fila persistente
  const newDonation = DonationQueue.add(amount, newBalance, donorName);

  const isOnHomePage =
    window.location.pathname.includes("home") ||
    window.location.pathname.includes("index") ||
    window.location.pathname === "/";

  if (isOnHomePage) {
    // PASSO 2: Se estiver na HOME, adiciona à fila de exibição da sessão
    currentPopupQueue.push(newDonation);

    // PASSO 3: Inicia a exibição se não houver popup visível
    if (!isShowingPopup) {
      showNextDonationFromQueue();
    }
  }
});

// ========== FUNÇÕES DE TESTE (MANTIDAS) ==========

function testDonationPopup() {
  console.log("Testando popup imediato (sem persistência)...");
  createDonationReceivedPopup(150, 2500, "Maria Santos");
}

function simulateDonation(amount) {
  // Assumindo que Auth.getUserBalance() existe e retorna um valor numérico
  const currentBalance = Auth.getUserBalance
    ? Auth.getUserBalance()
    : lastKnownBalance || 1000;
  const newBalance = currentBalance + amount;

  // Dispara o fluxo de detecção (que agora é persistente)
  console.log(`Simulando doação de ${amount} moedas`);
  const newDonation = DonationQueue.add(amount, newBalance, "Simulação");

  // Força a exibição como se tivesse ocorrido na HOME
  if (!isShowingPopup) {
    currentPopupQueue.push(newDonation);
    showNextDonationFromQueue();
  }
}

function testDonationQueue() {
  console.log("Adicionando 3 doações à fila para teste...");
  DonationQueue.add(50, 1550, "João Silva");
  DonationQueue.add(100, 1650, "Maria Santos");
  DonationQueue.add(75, 1725);
  console.log(
    `${DonationQueue.count()} doações adicionadas. Recarregue a página HOME para visualizar.`
  );
}

function showQueueStatus() {
  const pending = DonationQueue.getPending();
  console.log(`Doações pendentes: ${pending.length}`);
  console.table(pending);
}

// Exportar funções globalmente
window.DonationQueue = DonationQueue;
window.createDonationReceivedPopup = createDonationReceivedPopup;
window.closeDonationReceivedPopup = closeDonationReceivedPopup;
window.testDonationPopup = testDonationPopup;
window.simulateDonation = simulateDonation;
window.testDonationQueue = testDonationQueue;
window.showQueueStatus = showQueueStatus;
window.processAllPendingDonations = processAllPendingDonations;

console.log("Sistema de fila de notificações carregado (v2 - Corrigido)");

console.log(
  "Sistema mobile HOME integrado com Auth.js, API real e pop-up de sucesso moderno carregado!"
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
window.createSuccessPopup = createSuccessPopup;
window.closeSuccessPopup = closeSuccessPopup;
