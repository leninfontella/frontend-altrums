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
      // console.log("🔄 Carregando perfil do usuário...");

      const localData = Auth.getUserData();
      const profileFromAPI = await Auth.getProfile();

      const finalProfileData = {
        ...(localData || {}),
        ...(profileFromAPI || {}),
      };

      if (Object.keys(finalProfileData).length > 0) {
        this.updateUserInterface(finalProfileData);
        // console.log("✅ Perfil carregado:", finalProfileData);
        return finalProfileData;
      } else {
        throw new Error("Perfil não encontrado");
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil:", error);

      const localData = Auth.getUserData();
      if (localData) {
        this.updateUserInterface(localData);
        // console.log("⚠️ Fallback para dados locais");
        return localData;
      }

      showNotification("Alguns dados podem não estar atualizados", "warning");
      return null;
    }
  },

  async loadUserBalance() {
    try {
      // console.log("🔄 Carregando saldo do usuário...");

      const balance = await Auth.getBalance();

      if (balance !== null && balance !== undefined) {
        this.updateBalanceInterface(balance);
        // console.log("✅ Saldo carregado:", balance);
        return balance;
      } else {
        const localBalance = Auth.getUserBalance();
        this.updateBalanceInterface(localBalance);
        // console.log("⚠️ Usando saldo local:", localBalance);
        return localBalance;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar saldo:", error);

      const localBalance = Auth.getUserBalance();
      this.updateBalanceInterface(localBalance);
      // console.log("⚠️ Fallback para saldo local:", localBalance);
      return localBalance;
    }
  },

  async loadUserStats() {
    try {
      // console.log("🔄 Carregando estatísticas do usuário...");

      const stats = await Auth.getStats();

      if (stats) {
        this.updateStatsInterface(stats);
        // console.log("✅ Estatísticas carregadas:", stats);
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
      // console.log("⚠️ Usando estatísticas simuladas:", mockStats);
      return mockStats;
    }
  },

  updateUserInterface(userData) {
    try {
      // console.log("🎨 Atualizando interface do usuário:", userData);

      const greetingElement = document.getElementById("user-greeting");
      if (greetingElement && userData.name) {
        const firstName = userData.name.split(" ")[0];
        greetingElement.textContent = `Olá, ${firstName}!`;
        // console.log("✅ Saudação atualizada para:", firstName);
      } else if (greetingElement) {
        greetingElement.textContent = "Olá, Usuário!";
        // console.log("⚠️ Nome não disponível, usando fallback");
      }

      const userNameElements = document.querySelectorAll(".user-name");
      userNameElements.forEach((element) => {
        element.textContent = userData.name || "Usuário";
      });

      // console.log("✅ Interface do usuário atualizada");
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
        // console.log("✅ Foto atualizada externamente:", imageUrl);
      };
    } else {
      img.style.display = "none";
      icon.style.display = "block";
      // console.log("✅ Foto removida, ícone padrão restaurado");
    }
  },

  updateBalanceInterface(balance) {
    try {
      // console.log("💰 Atualizando saldo na interface:", balance);

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

      // console.log("✅ Saldo atualizado na interface:", balance);
    } catch (error) {
      console.error("❌ Erro ao atualizar saldo na interface:", error);
    }
  },

  updateStatsInterface(stats) {
    try {
      // console.log("📊 Atualizando estatísticas na interface:", stats);

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

      // console.log("✅ Estatísticas atualizadas na interface");
    } catch (error) {
      console.error("❌ Erro ao atualizar estatísticas:", error);
    }
  },

  async donateCoins(recipientId, amount, message = "") {
    try {
      // console.log(
      //   `🎁 Processando doação: ${amount} moedas para usuário ${recipientId}`
      // );

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
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <span class="level-text" style="
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 9px 21px;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%);
            color: white;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0.4px;
            border: 1.5px solid rgba(0, 212, 255, 0.5);
            border-radius: 9px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          ">
            <span style="font-size: 15px;">🎯</span>
            Seu nível atual
          </span>
        </div>
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
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.borderColor='${
            levelInfo.color
          }50'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='${
               levelInfo.color
             }35'">
            
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

        // console.log("Badge de nível adicionado baseado no total doado:", {
        //   totalDonated,
        //   levelInfo,
        // });
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

// ========== SISTEMA DE NOTIFICAÇÃO DE LEVEL UP ==========

const LevelUpNotification = {
  currentLevel: null,
  lastCheckedDonated: 0,

  // Inicializar o sistema
  async init() {
    try {
      const stats = await Auth.getStats();
      if (stats && stats.totalDonated !== undefined) {
        const levelInfo = LevelSystem.calculateLevel(stats.totalDonated);
        this.currentLevel = levelInfo.level;
        this.lastCheckedDonated = stats.totalDonated;

        // Salvar estado
        sessionStorage.setItem("userCurrentLevel", this.currentLevel);
        sessionStorage.setItem("lastCheckedDonated", this.lastCheckedDonated);

        // console.log("🎯 Sistema de Level Up inicializado:", {
        //   level: this.currentLevel,
        //   donated: this.lastCheckedDonated,
        // });
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar sistema de Level Up:", error);

      // Tentar recuperar do sessionStorage
      const savedLevel = sessionStorage.getItem("userCurrentLevel");
      const savedDonated = sessionStorage.getItem("lastCheckedDonated");

      if (savedLevel && savedDonated) {
        this.currentLevel = parseInt(savedLevel);
        this.lastCheckedDonated = parseInt(savedDonated);
        console.log("⚠️ Recuperado do sessionStorage:", {
          level: this.currentLevel,
          donated: this.lastCheckedDonated,
        });
      }
    }
  },

  // Verificar se houve mudança de nível
  async checkLevelChange(newTotalDonated) {
    if (newTotalDonated === undefined || newTotalDonated === null) {
      return false;
    }

    const newLevelInfo = LevelSystem.calculateLevel(newTotalDonated);
    const oldLevel = this.currentLevel;
    const newLevel = newLevelInfo.level;

    // Verificar se realmente subiu de nível
    if (newLevel > oldLevel && oldLevel !== null) {
      // Atualizar estado
      this.currentLevel = newLevel;
      this.lastCheckedDonated = newTotalDonated;

      // Salvar no sessionStorage
      sessionStorage.setItem("userCurrentLevel", newLevel);
      sessionStorage.setItem("lastCheckedDonated", newTotalDonated);

      // Mostrar modal de level up
      this.showLevelUpModal(oldLevel, newLevelInfo, newTotalDonated);

      return true;
    }

    // Atualizar valores mesmo sem mudança de nível
    if (newTotalDonated !== this.lastCheckedDonated) {
      this.lastCheckedDonated = newTotalDonated;
      sessionStorage.setItem("lastCheckedDonated", newTotalDonated);
    }

    return false;
  },

  // ... (resto do código do LevelUpNotification permanece igual)

  // Mostrar modal de level up
  showLevelUpModal(oldLevel, newLevelInfo, totalDonated) {
    // Remover modal existente se houver
    const existingModal = document.getElementById("level-up-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const { level, name, color, icon, progress } = newLevelInfo;
    const nextLevel = LevelSystem.getNextLevel(level);
    const coinsToNext = nextLevel
      ? LevelSystem.getCoinsToNextLevel(totalDonated)
      : 0;

    const modalHTML = `
      <div id="level-up-modal" class="global-level-up-modal">
        <div class="global-level-up-backdrop" onclick="closeLevelUpModal()"></div>
        <div class="global-level-up-content" style="
          border-color: ${color}80;
          box-shadow: 
            0 50px 150px ${color}70,
            0 25px 80px rgba(0, 0, 0, 0.9),
            0 0 0 1px ${color}50,
            inset 0 3px 0 rgba(255, 255, 255, 0.2),
            inset 0 -2px 0 rgba(0, 0, 0, 0.6);
        ">
          
          <!-- Borda animada superior -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(
              90deg,
              transparent,
              ${color},
              ${color}dd,
              ${color},
              transparent
            );
            background-size: 200% 100%;
            animation: globalLevelUpBorderShimmer 3s linear infinite;
          "></div>
          
          <!-- Confetes animados -->
          <div class="global-level-up-confetti">
            ${this.generateConfetti(10, color)}
          </div>
          
          <!-- Container do ícone principal -->
          <div class="global-level-up-icon-container">
            <div class="global-level-up-glow" style="
              background: radial-gradient(
                circle,
                ${color}60 0%,
                ${color}40 50%,
                transparent 100%
              );
            "></div>
            <div class="global-level-up-icon" style="
              background: linear-gradient(135deg, ${color}50, ${color}30);
              border-color: ${color}80;
              box-shadow: 
                0 20px 60px ${color}80,
                inset 0 3px 0 rgba(255, 255, 255, 0.4),
                inset 0 -3px 0 rgba(0, 0, 0, 0.4);
            ">
              ${icon}
            </div>
          </div>
          
          <!-- Título -->
          <div class="global-level-up-title">
            <span class="global-level-up-title-line">PARABÉNS!</span>
            <span class="global-level-up-title-line">Você subiu de nível</span>
          </div>
          
          <!-- Badge do novo nível -->
          <div class="global-level-up-badge">
            <div class="global-level-up-badge-icon" style="
              background: linear-gradient(135deg, ${color}, ${color}cc);
              border-color: ${color}90;
              box-shadow: 
                0 15px 50px ${color}90,
                inset 0 2px 0 rgba(255, 255, 255, 0.4),
                inset 0 -2px 0 rgba(0, 0, 0, 0.4);
            ">
              ${icon}
              <div style="
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border-radius: 20px;
                background: linear-gradient(135deg, ${color}80, ${color}60);
                animation: globalLevelUpBadgeGlow 2s ease-in-out infinite;
                z-index: -1;
              "></div>
            </div>
          </div>
          
          <!-- Nome do nível -->
          <div class="global-level-up-name" style="
            color: ${color};
            text-shadow: 
              0 0 20px ${color}cc,
              0 3px 10px ${color}99;
          ">
            Nível ${level} - ${name}
          </div>
          
          <!-- Descrição -->
          <div class="global-level-up-description">
            ${this.getMotivationalMessage(level)}
          </div>
          
          <!-- Linha divisória -->
          <div class="global-level-up-divider" style="
            background: linear-gradient(90deg, transparent, ${color}60, transparent);
          "></div>
          
          <!-- Estatísticas -->
          <div class="global-level-up-stats" style="
            background: linear-gradient(135deg, ${color}15, ${color}10);
            border-color: ${color}40;
            box-shadow: 
              0 10px 40px ${color}30,
              inset 0 2px 0 rgba(255, 255, 255, 0.15),
              inset 0 -2px 0 rgba(0, 0, 0, 0.3);
          ">
            <div class="global-level-up-stat">
              <div class="global-level-up-stat-label">Nível Anterior</div>
              <div class="global-level-up-stat-value">${oldLevel}</div>
            </div>
            
            <div class="global-level-up-stat-divider"></div>
            
            <div class="global-level-up-stat">
              <div class="global-level-up-stat-label">Moedas Doadas</div>
              <div class="global-level-up-stat-value">${totalDonated.toLocaleString()}</div>
            </div>
            
            ${
              nextLevel
                ? `
              <div class="global-level-up-stat-divider"></div>
              <div class="global-level-up-stat">
                <div class="global-level-up-stat-label">Doe mais</div>
                <div class="global-level-up-stat-value">${coinsToNext.toLocaleString()}</div>
              </div>
            `
                : ""
            }
          </div>
          
          <!-- Botões de ação -->
          <div style="
            display: flex;
            gap: 10px;
            margin-top: 24px;
          ">
            <button class="global-level-up-share" onclick="shareLevelUp(${level}, '${name}')" style="
              flex: 1;
              background: linear-gradient(135deg, ${color}30, ${color}20);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 2px solid ${color}60;
              border-radius: 15px;
              padding: 14px 20px;
              color: #ffffff;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 
                0 8px 30px ${color}40,
                inset 0 2px 0 rgba(255, 255, 255, 0.2),
                inset 0 -2px 0 rgba(0, 0, 0, 0.3);
              position: relative;
              overflow: hidden;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
              letter-spacing: 0.03em;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              height: 48px;
              min-width: 0;
            ">
              <i class="fas fa-share-alt"></i>
              Compartilhar
            </button>
            
            <button class="global-level-up-close" onclick="closeLevelUpModal()" style="
              flex: 1;
              background: linear-gradient(135deg, ${color}50, ${color}30);
              border-color: ${color}80;
              box-shadow: 
                0 8px 30px ${color}60,
                inset 0 2px 0 rgba(255, 255, 255, 0.3),
                inset 0 -2px 0 rgba(0, 0, 0, 0.3);
              height: 48px;
              min-width: 0;
            ">
              Continuar
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Tocar som de celebração
    this.playLevelUpSound();

    // Adicionar estilos CSS se ainda não existirem
    if (!document.getElementById("level-up-styles")) {
      this.addStyles();
    }

    // Auto-fechar após 15 segundos
    setTimeout(() => {
      closeLevelUpModal();
    }, 15000);
  },

  // Gerar confetes aleatórios
  generateConfetti(count, levelColor) {
    let confettiHTML = "";

    for (let i = 0; i < count; i++) {
      const left = (i + 1) * (100 / (count + 1));
      const delay = Math.random() * 0.5;

      confettiHTML += `
        <div class="global-confetti-particle" style="
          left: ${left}%;
          background: linear-gradient(135deg, ${levelColor}, ${levelColor}cc);
          animation: globalLevelUpConfettiFall 3s ease-in-out ${delay}s;
        "></div>
      `;
    }

    return confettiHTML;
  },

  // Mensagens motivacionais por nível
  getMotivationalMessage(level) {
    const messages = {
      2: "Você está apenas <strong>começando</strong>! Continue doando e fazendo a diferença! 🚀",
      3: "Sua <strong>generosidade</strong> está crescendo! Que jornada incrível! 🎒",
      4: "Você está <strong>ajudando</strong> muitas pessoas! Continue esse trabalho maravilhoso! 🤝",
      5: "Sua generosidade <strong>não tem limites</strong>! Você é inspirador! ❤️",
      6: "Um verdadeiro <strong>filantropo</strong>! Seu impacto é extraordinário! 🏆",
      7: "<strong>Magnata</strong> da generosidade! Você está mudando vidas! 💎",
      8: "Você é uma <strong>lenda viva</strong>! Seu legado é eterno! ⭐",
      9: "<strong>Mítico</strong>! Poucos alcançam esse patamar de generosidade! 🔥",
      10: "<strong>DIVINO</strong>! Você atingiu o ápice da generosidade! 👑",
    };

    return (
      messages[level] ||
      "Parabéns por esse <strong>marco incrível</strong>! Continue brilhando! ✨"
    );
  },

  // Tocar som de level up
  playLevelUpSound() {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Sequência de notas para melodia de level up
      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 }, // C5
        { freq: 659.25, start: 0.15, duration: 0.15 }, // E5
        { freq: 783.99, start: 0.3, duration: 0.15 }, // G5
        { freq: 1046.5, start: 0.45, duration: 0.4 }, // C6
      ];

      notes.forEach((note) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = note.freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(
          0.3,
          audioContext.currentTime + note.start
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + note.start + note.duration
        );

        oscillator.start(audioContext.currentTime + note.start);
        oscillator.stop(audioContext.currentTime + note.start + note.duration);
      });
    } catch (error) {
      // console.log("⚠️ Não foi possível tocar som de level up");
    }
  },

  // ... (restante dos métodos)

  // Adicionar estilos CSS
  addStyles() {
    const styles = `
      <style id="level-up-styles">
        .global-level-up-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10003;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: globalLevelUpModalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .global-level-up-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        .global-level-up-content {
          position: relative;
          background: linear-gradient(
            145deg,
            rgba(30, 30, 30, 0.98) 0%,
            rgba(20, 20, 20, 0.98) 50%,
            rgba(15, 15, 15, 0.98) 100%
          );
          backdrop-filter: blur(50px);
          -webkit-backdrop-filter: blur(50px);
          border: 3px solid;
          border-radius: 24px;
          width: 67.5%;
          max-width: 315px;
          padding: 36px 27px;
          text-align: center;
          animation: globalLevelUpContentSlideScale 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          overflow: hidden;
        }

        .global-level-up-confetti {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .global-confetti-particle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          opacity: 0;
        }

        .global-level-up-icon-container {
          position: relative;
          width: 75px;
          height: 75px;
          margin: 0 auto 21px;
        }

        .global-level-up-icon {
          width: 75px;
          height: 75px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 39px;
          border: 3px solid;
          animation: globalLevelUpIconBounce 2s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }

        .global-level-up-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 105px;
          height: 105px;
          border-radius: 50%;
          animation: globalLevelUpGlowPulse 2s ease-in-out infinite;
          z-index: 1;
        }

        .global-level-up-title {
          color: #ffffff;
          font-size: 21px;
          font-weight: 900;
          margin-bottom: 18px;
          text-shadow: 
            0 3px 10px rgba(0, 0, 0, 0.7),
            0 5px 20px rgba(0, 0, 0, 0.6);
          line-height: 1.3;
          letter-spacing: -0.02em;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .global-level-up-title-line {
          display: block;
          animation: globalLevelUpTitleSlide 0.8s ease-out;
        }

        .global-level-up-title-line:nth-child(2) {
          animation-delay: 0.1s;
        }

        .global-level-up-badge {
          width: 68px;
          height: 68px;
          margin: 0 auto 15px;
          position: relative;
          animation: globalLevelUpBadgeRotate 4s linear infinite;
        }

        .global-level-up-badge-icon {
          width: 68px;
          height: 68px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          border: 2px solid;
          position: relative;
        }

        .global-level-up-name {
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 9px;
          letter-spacing: -0.02em;
          animation: globalLevelUpNamePulse 1.5s ease-in-out infinite;
        }

        .global-level-up-description {
          color: rgba(255, 255, 255, 0.85);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 21px;
          line-height: 1.5;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .global-level-up-description strong {
          color: #fff;
          font-weight: 800;
        }

        .global-level-up-divider {
          width: 100%;
          height: 2px;
          margin-bottom: 18px;
        }

        .global-level-up-stats {
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding: 15px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 15px;
          border: 2px solid;
        }

        .global-level-up-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .global-level-up-stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        .global-level-up-stat-value {
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .global-level-up-stat-divider {
          width: 2px;
          height: 30px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
        }

        .global-level-up-share {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid;
          border-radius: 15px;
          padding: 14px 20px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .global-level-up-share::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .global-level-up-share:hover {
          transform: translateY(-3px) scale(1.02);
        }

        .global-level-up-share:hover::before {
          left: 100%;
        }

        .global-level-up-share:active {
          transform: translateY(-1px) scale(1.01);
        }

        .global-level-up-share i {
          font-size: 12px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .global-level-up-share:hover i {
          transform: scale(1.2) rotate(15deg);
        }

        .global-level-up-close {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 2px solid;
          border-radius: 15px;
          padding: 14px 20px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          height: 48px;
        }

        .global-level-up-close::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .global-level-up-close:hover {
          transform: translateY(-3px) scale(1.02);
        }

        .global-level-up-close:hover::before {
          left: 100%;
        }

        .global-level-up-close:active {
          transform: translateY(-1px) scale(1.01);
        }

        .global-level-up-close i {
          font-size: 12px;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .global-level-up-close:hover i {
          transform: translateX(5px);
        }

        @keyframes globalLevelUpModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes globalLevelUpContentSlideScale {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.8);
          }
          60% {
            transform: translateY(-12px) scale(1.03);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes globalLevelUpBorderShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes globalLevelUpConfettiFall {
          0% {
            top: -10%;
            opacity: 1;
            transform: translateX(0) rotate(0deg) scale(1);
          }
          100% {
            top: 110%;
            opacity: 0;
            transform: translateX(80px) rotate(720deg) scale(0.3);
          }
        }

        @keyframes globalLevelUpIconBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.08); }
        }

        @keyframes globalLevelUpGlowPulse {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes globalLevelUpTitleSlide {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes globalLevelUpBadgeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes globalLevelUpBadgeGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes globalLevelUpNamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .global-level-up-modal.closing {
          animation: globalLevelUpModalFadeOut 0.4s ease-in;
        }

        .global-level-up-modal.closing .global-level-up-content {
          animation: globalLevelUpContentSlideOut 0.4s ease-in;
        }

        @keyframes globalLevelUpModalFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes globalLevelUpContentSlideOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(50px) scale(0.85);
          }
        }

        @media (max-width: 768px) {
          .global-level-up-content {
            width: 92%;
            max-width: none;
            padding: 32px 24px;
            margin: 0 16px;
          }

          .global-level-up-icon-container {
            width: 70px;
            height: 70px;
            margin-bottom: 18px;
          }

          .global-level-up-icon {
            width: 70px;
            height: 70px;
            font-size: 36px;
          }

          .global-level-up-glow {
            width: 100px;
            height: 100px;
          }

          .global-level-up-title {
            font-size: 20px;
            margin-bottom: 16px;
          }

          .global-level-up-badge {
            width: 64px;
            height: 64px;
            margin-bottom: 14px;
          }

          .global-level-up-badge-icon {
            width: 64px;
            height: 64px;
            font-size: 34px;
            border-radius: 16px;
          }

          .global-level-up-name {
            font-size: 22px;
            margin-bottom: 8px;
          }

          .global-level-up-description {
            font-size: 12px;
            margin-bottom: 18px;
          }

          .global-level-up-divider {
            margin-bottom: 16px;
          }

          .global-level-up-stats {
            gap: 10px;
            padding: 14px;
            margin-bottom: 20px;
          }

          .global-level-up-stat-label {
            font-size: 9px;
          }

          .global-level-up-stat-value {
            font-size: 13px;
          }

          .global-level-up-share,
          .global-level-up-close {
            font-size: 12px;
            padding: 13px 18px;
            height: 46px;
          }
        }

        @media (max-width: 480px) {
          .global-level-up-content {
            width: 94%;
            padding: 28px 20px;
            margin: 0 12px;
          }

          .global-level-up-icon-container {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
          }

          .global-level-up-icon {
            width: 64px;
            height: 64px;
            font-size: 33px;
          }

          .global-level-up-glow {
            width: 90px;
            height: 90px;
          }

          .global-level-up-title {
            font-size: 18px;
            margin-bottom: 14px;
          }

          .global-level-up-badge {
            width: 60px;
            height: 60px;
            margin-bottom: 12px;
          }

          .global-level-up-badge-icon {
            width: 60px;
            height: 60px;
            font-size: 32px;
            border-radius: 15px;
          }

          .global-level-up-name {
            font-size: 20px;
            margin-bottom: 7px;
          }

          .global-level-up-description {
            font-size: 11px;
            margin-bottom: 16px;
          }

          .global-level-up-divider {
            margin-bottom: 14px;
          }

          .global-level-up-stats {
            flex-direction: column;
            gap: 8px;
            padding: 12px;
            margin-bottom: 18px;
          }

          .global-level-up-stat {
            width: 100%;
          }

          .global-level-up-stat-divider {
            width: 70%;
            height: 2px;
            margin: 0 auto;
          }

          .global-level-up-stat-label {
            font-size: 9px;
          }

          .global-level-up-stat-value {
            font-size: 14px;
          }

          .global-level-up-share {
            font-size: 11px;
            padding: 12px 16px;
            height: 44px;
          }

          .global-level-up-close {
            font-size: 11px;
            padding: 12px 16px;
            height: 44px;
          }

          .global-level-up-share i,
          .global-level-up-close i {
            font-size: 11px;
          }
        }

        @media (max-width: 360px) {
          .global-level-up-content {
            width: 96%;
            padding: 24px 18px;
            margin: 0 8px;
          }

          .global-level-up-title {
            font-size: 17px;
          }

          .global-level-up-name {
            font-size: 19px;
          }

          .global-level-up-description {
            font-size: 10px;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML("beforeend", styles);
  },
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Funções globais
function closeLevelUpModal() {
  const modal = document.getElementById("level-up-modal");
  if (modal) {
    modal.classList.add("closing");
    setTimeout(() => modal.remove(), 400);
  }
}

function shareLevelUp(level, levelName) {
  const message = `🎉 Acabei de alcançar o nível ${level} (${levelName}) no sistema de doações! 🏆`;

  if (navigator.share) {
    navigator
      .share({
        title: "Level Up!",
        text: message,
      })
      .catch((err) => console.error("Erro ao compartilhar:", err));
  } else {
    navigator.clipboard.writeText(message).then(() => {
      showNotification(
        "Mensagem copiada para área de transferência!",
        "success"
      );
    });
  }
}

// Integrar com o sistema existente
const originalConfirmDonation = window.confirmDonation;
window.confirmDonation = async function (recipientId, recipientName) {
  const statsBefore = await Auth.getStats();
  const totalDonatedBefore = statsBefore?.totalDonated || 0;

  await originalConfirmDonation(recipientId, recipientName);

  setTimeout(async () => {
    const statsAfter = await Auth.getStats();
    const totalDonatedAfter = statsAfter?.totalDonated || 0;

    if (totalDonatedAfter > totalDonatedBefore) {
      await LevelUpNotification.checkLevelChange(totalDonatedAfter);
    }
  }, 2000);
};

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  LevelUpNotification.init();

  // Integrar com WebSocket para doações recebidas (após inicialização)
  setTimeout(() => {
    if (typeof wsClient !== "undefined" && wsClient) {
      wsClient.on("donation_received", async (data) => {
        setTimeout(async () => {
          const stats = await Auth.getStats();
          if (stats?.totalDonated) {
            await LevelUpNotification.checkLevelChange(stats.totalDonated);
          }
        }, 1500);
      });
      // console.log("✅ WebSocket integrado com Level Up System");
    }
  }, 1000);
});

// Exportar globalmente
window.LevelUpNotification = LevelUpNotification;
window.closeLevelUpModal = closeLevelUpModal;
window.shareLevelUp = shareLevelUp;

// console.log("✅ Sistema de notificação de Level Up carregado!");

// Sistema de busca e doação - integração com API
const UserSearchAPI = {
  baseUrl: "https://api-backend-coins.onrender.com/api",

  async searchUsers(query) {
    try {
      if (!query || query.length < 2) return [];

      // console.log("🔍 Buscando usuários na API:", query);

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

      // console.log("✅ Usuários encontrados:", users.length);
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
      // console.log("✅ Detalhes do usuário carregados:", userData);
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
      // console.log("🎁 Processando doação via API:", { recipientId, amount });

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
      // console.log("✅ Doação processada com sucesso:", result);
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

  // ✅ CORREÇÃO: Acessar corretamente os campos de foto
  const photoUrl = user.profilePhotoUrl || user.photo || user.profilePhoto;

  // ✅ Verificar se photoUrl existe E é uma string antes de usar startsWith
  if (photoUrl && typeof photoUrl === "string" && photoUrl.trim() !== "") {
    // Construir URL completa se necessário
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
    // ✅ Fallback: usar iniciais
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
          <h3>Doar moedas para:</h3>
          <button class="close-btn" onclick="closeDonationModal()">✕</button>
        </div>
        
        <div class="donation-info">
          <div class="recipient-info">
            ${recipientAvatarHTML}
            <div class="recipient-details">
              <h4>${user.name}</h4>
   
              <span class="recipient-nivel" >Nível atual:</span>
              <div class="level-badge ${(user.level || "iniciante")
                .toLowerCase()
                .replace(" ", "-")}">${user.level || "Iniciante"}</div>
            </div>
          </div>
          
          <div class="balance-info">
            <p class="current-balance">Seu saldo atual: <strong>${currentBalance.toLocaleString()} moedas</strong></p>
          </div>
          
          <div class="donation-amount-section">
            <label for="donation-amount">Quantidade de moedas para doar: 🫰</label>
            <div class="amount-input-wrapper">
              <input 
                type="number" 
                inputmode="numeric" 
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
            <label for="donation-message">Mensagem 💬 (opcional):</label>
            <textarea 
              id="donation-message" 
              placeholder="Escreva uma mensagem..."
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

      // ✅ CORREÇÃO: Mesma lógica para buscar foto
      const photoUrl = user.profilePhotoUrl || user.photo || user.profilePhoto;

      if (photoUrl && typeof photoUrl === "string" && photoUrl.trim() !== "") {
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
                 <div class="user-stats">
              <span class="coins-count">${(
                user.coins ||
                user.balance ||
                0
              ).toLocaleString()}🪙</span>
              <span class="level-badge ${(user.level || "iniciante")
                .toLowerCase()
                .replace(" ", "-")}">${user.level || "Iniciante"}</span>
            </div>
          </div>
     
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

      // console.log("Doação realizada com sucesso:", result);
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
    // console.log("Usuario não logado - redirecionando");
    Auth.redirectToLogin();
    return;
  }

  // console.log("Iniciando carregamento dos dados do usuario...");

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

    // if (profileData) {
    //   console.log("Perfil carregado");
    // }

    if (balanceData !== null) {
      LevelSystem.addLevelBadge(balanceData);
      // console.log("Saldo carregado e nivel calculado");
    }

    // if (statsData) {
    //   console.log("Estatisticas carregadas");
    // }

    // Habilitar botão de doação
    const searchDonateBtn = document.getElementById("search-donate-btn");
    if (searchDonateBtn) {
      searchDonateBtn.disabled = false;
      searchDonateBtn.style.opacity = "1";
      searchDonateBtn.style.cursor = "pointer";
      // console.log("Botao de doacao habilitado");
    }

    // console.log("Inicializacao concluida!");
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
    // console.log("Evento de foto atualizada recebido:", event.detail);
    const newPhotoUrl = event.detail.photoUrl;
    UserSystem.updateProfilePicture(newPhotoUrl);
  });

  window.addEventListener("profilePhotoRemoved", () => {
    // console.log("Evento de foto removida recebido");
    UserSystem.updateProfilePicture(null);
  });

  window.addEventListener("userDataUpdated", (event) => {
    // console.log("Dados do usuário atualizados:", event.detail);
    const userData = event.detail.userData;
    if (userData) {
      UserSystem.updateUserInterface(userData);
    }
  });

  // Event listener para atualização de saldo
  window.addEventListener("balanceUpdated", (event) => {
    // console.log("Saldo atualizado:", event.detail);
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
    // console.log("Modal de busca aberto");
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

// ========== LOJA - EVENT LISTENER ==========

const viewStoreBtn = document.getElementById("view-store");

if (viewStoreBtn) {
  viewStoreBtn.addEventListener("click", () => {
    window.location.href = "/pages/store/store.html";
  });
}

// Event listeners para itens da loja
const storeItems = document.querySelectorAll(".store-item");
storeItems.forEach((item) => {
  addTouchFeedback(item);
  item.addEventListener("click", () => {
    const itemName = item.querySelector(".award-name").textContent;
    const itemPrice = item.querySelector(".store-price").textContent;

    // Aqui você pode adicionar a lógica de compra
    showNotification(`${itemName} selecionado! Preço: ${itemPrice}`, "info");

    // Quando implementar a funcionalidade de compra, pode abrir um modal
    // openPurchaseModal(itemName, itemPrice);
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
    // console.log("Card de moeda clicado");
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
    // console.log("Balance card clicado");
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

// ========== WEBSOCKET CLIENT ==========

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
    this.isAuthenticated = false;
    this.heartbeatInterval = null;
    this.listeners = new Map();

    // console.log("🔌 WebSocket Client inicializado");
  }

  connect() {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      // console.log("⚠️ Já existe uma conexão ativa ou em andamento");
      return;
    }

    this.isConnecting = true;

    // Determinar URL do WebSocket baseado no ambiente
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const port = window.location.hostname === "localhost" ? ":5000" : "";
    const wsUrl = `${protocol}//${host}${port}/ws`;

    // console.log(`🔌 Conectando ao WebSocket: ${wsUrl}`);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // console.log("✅ WebSocket conectado");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.authenticate();
        this.startHeartbeat();
        this.emit("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("❌ Erro ao processar mensagem:", error);
        }
      };

      this.ws.onerror = (error) => {
        console.error("❌ Erro no WebSocket:", error);
        this.emit("error", error);
      };

      this.ws.onclose = (event) => {
        // console.log("🔌 WebSocket desconectado", event.code, event.reason);
        this.isConnecting = false;
        this.isAuthenticated = false;
        this.stopHeartbeat();
        this.emit("disconnected");
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("❌ Erro ao criar WebSocket:", error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  authenticate() {
    const token = Auth.getToken();

    if (!token) {
      console.error("❌ Token não encontrado para autenticação WebSocket");
      this.disconnect();
      return;
    }

    this.send({
      type: "auth",
      token: token,
    });
  }

  handleMessage(data) {
    // console.log("📨 Mensagem recebida:", data.type);

    switch (data.type) {
      case "authenticated":
        this.isAuthenticated = true;
        // console.log("✅ Autenticado no WebSocket");
        this.emit("authenticated");
        break;

      case "donation_received":
        // console.log("💰 Doação recebida:", data.data);
        this.handleDonationReceived(data.data);
        break;

      case "pong":
        // Resposta ao heartbeat
        break;

      case "error":
        console.error("❌ Erro do servidor:", data.message);
        this.emit("error", data.message);
        break;

      default:
      // console.log("⚠️ Tipo de mensagem desconhecido:", data.type);
    }

    // Emitir evento genérico
    this.emit("message", data);
  }

  handleDonationReceived(donationData) {
    // Atualizar saldo local
    if (donationData.newBalance !== undefined) {
      Auth.updateLocalBalance(donationData.newBalance);

      // Disparar evento para atualizar UI
      if (typeof UserSystem !== "undefined") {
        UserSystem.updateBalanceInterface(donationData.newBalance);
      }
    }

    // Mostrar popup de doação recebida
    this.showDonationReceivedPopup(donationData);

    // Emitir evento para outros listeners
    this.emit("donation_received", donationData);

    // Atualizar estatísticas após 1 segundo
    setTimeout(() => {
      if (typeof UserSystem !== "undefined") {
        UserSystem.loadUserStats();
      }
    }, 1000);
  }

  showDonationReceivedPopup(data) {
    // Remover popup existente se houver
    const existingPopup = document.getElementById("donation-received-popup");
    if (existingPopup) {
      existingPopup.remove();
    }

    const { amount, message, donor, newBalance } = data;

    const popupHTML = `
      <div id="donation-received-popup" class="donation-received-popup">
        <div class="donation-received-backdrop" onclick="closeDonationReceivedPopup()"></div>
        <div class="donation-received-content">
          <div class="donation-confetti">
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
            <div class="confetti-piece"></div>
          </div>
          
          <div class="donation-received-icon">
            <i class="fas fa-gift"></i>
          </div>
          
          <h2 class="donation-received-title">Você Recebeu uma Doação!</h2>
          
          <p class="donation-received-message">
            ${message ? message : "Alguém acreditou em você e fez uma doação!"}
          </p>
          
          <div class="donation-received-details">
            <div class="donation-received-amount">
              <span class="coin-emoji">🪙</span>
              ${amount.toLocaleString()} moedas
            </div>
            
            <div class="donation-received-new-balance">
              Seu saldo atual é: <strong>${newBalance.toLocaleString()} moedas</strong>
            </div>
            
            <div class="donation-received-donor">
              Doação de <strong>${donor.name}</strong>
              ${donor.username ? ` (@${donor.username})` : ""}
            </div>
          </div>
          
          <button class="donation-received-close" onclick="closeDonationReceivedPopup()">
            Continuar
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Som de notificação (opcional)
    this.playNotificationSound();

    // Auto-fechar após 10 segundos
    setTimeout(() => {
      closeDonationReceivedPopup();
    }, 10000);
  }

  playNotificationSound() {
    // Criar e tocar som de notificação
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
      // console.log("⚠️ Não foi possível tocar som de notificação");
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem:", error);
        return false;
      }
    } else {
      // console.warn("⚠️ WebSocket não está conectado");
      return false;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 30000); // A cada 30 segundos
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // console.log("❌ Máximo de tentativas de reconexão atingido");
      this.emit("max_reconnect_attempts");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    // console.log(
    //   `🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`
    // );

    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.isAuthenticated = false;
    this.reconnectAttempts = 0;

    // console.log("🔌 WebSocket desconectado manualmente");
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `❌ Erro ao executar callback para evento ${event}:`,
            error
          );
        }
      });
    }
  }

  getStatus() {
    return {
      connected: this.ws && this.ws.readyState === WebSocket.OPEN,
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Instância global do WebSocket Client
const wsClient = new WebSocketClient();

// Função global para fechar popup de doação recebida
function closeDonationReceivedPopup() {
  const popup = document.getElementById("donation-received-popup");
  if (popup) {
    popup.classList.add("closing");
    setTimeout(() => popup.remove(), 400);
  }
}

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

// Exportar para uso global
window.wsClient = wsClient;
window.closeDonationReceivedPopup = closeDonationReceivedPopup;

// console.log(
//   "Sistema mobile HOME integrado com Auth.js, API real e pop-up de sucesso moderno carregado!"
// );

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
