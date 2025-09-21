// ========== FUNÇÕES AUXILIARES PARA FOTOS ==========
/**
 * Função auxiliar para gerar iniciais do nome
 */
function getUserInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Função auxiliar para gerar ID do usuário para foto
 */
function getUserPhotoId(name) {
  if (!name) return "user";
  return name
    .toLowerCase()
    .replace(/[áàãâä]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòõôö]/g, "o")
    .replace(/[úùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * NOVA FUNÇÃO: Obter a foto do usuário atual (apenas para o usuário logado)
 */
function getCurrentUserPhoto() {
  // Tentar obter a foto do userService
  if (window.userService && window.userService.getUserPhoto) {
    const photo = window.userService.getUserPhoto();
    if (photo) return photo;
  }

  // Tentar obter do userData
  const userData = getUserData();
  if (userData && userData.profilePhotoUrl) {
    return userData.profilePhotoUrl;
  }

  // Tentar obter do localStorage
  const storedPhoto = localStorage.getItem("userProfilePhoto");
  if (storedPhoto) return storedPhoto;

  return null;
}

/**
 * NOVA FUNÇÃO: Gerar URL completa da imagem
 */
function getFullImageUrl(photoUrl) {
  if (!photoUrl) return null;

  if (photoUrl.startsWith("http")) {
    return photoUrl;
  }

  if (photoUrl.startsWith("/uploads/") || photoUrl.includes("uploads")) {
    return `http://localhost:5000${
      photoUrl.startsWith("/") ? "" : "/"
    }${photoUrl}`;
  }

  return photoUrl;
}

/**
 * NOVA FUNÇÃO: Validar se a URL da foto é válida
 */
function isValidPhotoUrl(photoUrl) {
  if (
    !photoUrl ||
    photoUrl.trim() === "" ||
    photoUrl === "null" ||
    photoUrl === "undefined"
  ) {
    return false;
  }
  return true;
}

/**
 * NOVA FUNÇÃO: Gerar avatar com foto real ou iniciais
 */
function generateAvatarHtml(
  user,
  isCurrentUser = false,
  currentUserPhoto = null
) {
  const displayName = user.displayName || user.name || "Usuário";
  const userInitials = getUserInitials(displayName);

  // Para o usuário atual, priorizar foto do currentUserPhoto
  if (isCurrentUser && currentUserPhoto && isValidPhotoUrl(currentUserPhoto)) {
    const fullPhotoUrl = getFullImageUrl(currentUserPhoto);
    return `
      <img
        data-user-photo
        class="profile-image"
        src="${fullPhotoUrl}"
        alt="Foto do Perfil"
        onerror="this.src='https://placehold.co/50x50/00d4ff/ffffff?text=${userInitials}'"
      />
    `;
  }

  // Para qualquer usuário (incluindo atual) com profilePhotoUrl da API
  if (user.profilePhotoUrl && isValidPhotoUrl(user.profilePhotoUrl)) {
    const fullPhotoUrl = getFullImageUrl(user.profilePhotoUrl);
    const avatarClass = isCurrentUser ? "profile-image" : "profile-image";
    const fallbackColor = isCurrentUser ? "00d4ff" : "666";

    return `
      <img
        ${isCurrentUser ? "data-user-photo" : ""}
        class="${avatarClass}"
        src="${fullPhotoUrl}"
        alt="${isCurrentUser ? "Foto do Perfil" : "Foto do Usuário"}"
        onerror="this.src='https://placehold.co/50x50/${fallbackColor}/ffffff?text=${userInitials}'"
      />
    `;
  }

  // Fallback: avatar com iniciais
  const fallbackColor = isCurrentUser ? "00d4ff" : "666";
  return `
    <img
      ${isCurrentUser ? "data-user-photo" : ""}
      class="profile-image"
      src="https://placehold.co/50x50/${fallbackColor}/ffffff?text=${userInitials}"
      alt="${isCurrentUser ? "Foto do Perfil" : "Avatar"}"
    />
  `;
}

// ========== CONFIGURAÇÃO DA API ==========
const API_CONFIG = {
  baseURL: "https://api-backend-coins.onrender.com/api",
  endpoints: {
    ranking: "/ranking",
    top10: "/ranking/top10",
    myPosition: "/ranking/my-position",
    aroundMe: "/ranking/around-me",
    userProfile: "/users/profile",
  },
};

// ========== CLASSE PARA GERENCIAR DADOS DO USUÁRIO ==========
class UserService {
  /**
   * Extrai o primeiro nome de um nome completo
   */
  static getFirstName(fullName) {
    return fullName?.trim().split(" ")[0] || "Usuário";
  }

  /**
   * Busca token de autenticação (versão melhorada)
   */
  static getAuthToken() {
    const possibleKeys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "jwtToken",
      "bearerToken",
      "userToken",
    ];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (
        token &&
        token.trim() !== "" &&
        token !== "null" &&
        token !== "undefined"
      ) {
        console.log(`Token encontrado na chave: ${key}`);
        return token.trim();
      }
    }

    for (const key of possibleKeys) {
      const token = sessionStorage.getItem(key);
      if (
        token &&
        token.trim() !== "" &&
        token !== "null" &&
        token !== "undefined"
      ) {
        console.log(`Token encontrado no sessionStorage na chave: ${key}`);
        return token.trim();
      }
    }

    console.warn("Nenhum token válido encontrado");
    return null;
  }

  /**
   * Salva token de autenticação
   */
  static saveAuthToken(token) {
    if (token && token.trim() !== "") {
      localStorage.setItem("token", token.trim());
      localStorage.setItem("authToken", token.trim());
      console.log("Token salvo com sucesso");
      return true;
    }
    return false;
  }

  /**
   * Valida se o token está no formato correto
   */
  static validateToken(token) {
    if (!token) return false;

    // Token JWT básico deve ter 3 partes separadas por ponto
    if (token.includes(".")) {
      const parts = token.split(".");
      return parts.length >= 2; // Pelo menos header e payload
    }

    // Para outros tipos de token, apenas verifica se não está vazio
    return token.length > 10;
  }

  /**
   * Faz requisição autenticada para a API
   */
  static async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = this.getAuthToken();

    if (!token) {
      console.error("Token de autenticação não encontrado");
      throw new Error("Token de autenticação não encontrado");
    }

    if (!this.validateToken(token)) {
      console.error("Token inválido");
      this.handleAuthError();
      throw new Error("Token inválido");
    }

    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    };

    try {
      console.log(`Fazendo requisição para: ${API_CONFIG.baseURL}${endpoint}`);
      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, config);

      if (!response.ok) {
        console.error(
          `Erro na API: ${response.status} - ${response.statusText}`
        );

        if (response.status === 401 || response.status === 403) {
          this.handleAuthError();
          throw new Error("Token expirado ou inválido");
        }
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API recebida:", data);
      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("Erro de conexão com a API:", error);
        throw new Error("Erro de conexão com a API");
      }
      throw error;
    }
  }

  /**
   * Trata erro de autenticação
   */
  static handleAuthError() {
    console.warn("Erro de autenticação detectado. Limpando dados...");

    const tokenKeys = [
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "jwtToken",
      "bearerToken",
      "userToken",
    ];
    tokenKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    const message =
      "Sua sessão expirou. Você será redirecionado para o login em alguns segundos...";

    if (typeof alert !== "undefined") {
      setTimeout(() => alert(message), 1000);
    } else {
      console.error(message);
    }

    setTimeout(() => {
      window.location.href = "../../login/html/login.html";
    }, 3000);
  }

  /**
   * Busca dados do usuário da API
   */
  static async getUserFromAPI() {
    try {
      console.log("Buscando dados do usuário da API...");
      const response = await this.makeAuthenticatedRequest(
        API_CONFIG.endpoints.userProfile
      );

      if (response && (response.success || response.data || response.user)) {
        const userData = response.data || response.user || response;

        // CORREÇÃO: Priorizar nome correto da estrutura da API
        const userObj = userData.user || userData;
        const fullName =
          userObj.fullName ||
          userObj.name ||
          userObj.displayName ||
          userObj.username ||
          `${userObj.firstName || ""} ${userObj.lastName || ""}`.trim();

        const processedData = {
          fullName: fullName,
          name: fullName,
          firstName: this.getFirstName(fullName),
          email: userObj.email,
          phone: userObj.phone,
          balance: userObj.coins || userObj.balance || 0,
          coins: userObj.coins || userObj.balance || 0,
          rank: userObj.rank || 0,
          level: userObj.level || "Iniciante",
          id: userObj.id || userObj._id,
          avatar: userObj.avatar,
          totalDonated: userObj.totalDonated || 0,
          totalReceived: userObj.totalReceived || 0,
          profilePhotoUrl: userObj.profilePhotoUrl || null, // NOVO: incluir foto
        };

        console.log("✅ Dados do usuário processados da API:", processedData);
        console.log(`📋 Nome completo extraído: "${fullName}"`);
        return processedData;
      }

      console.warn("Resposta da API não contém dados válidos:", response);
      return null;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário da API:", error);

      if (
        error.message.includes("Token") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw error;
      }

      return null;
    }
  }

  /**
   * Busca dados do usuário do localStorage (fallback)
   */
  static getUserFromStorage() {
    try {
      console.log("Buscando dados do localStorage...");

      const possibleKeys = ["currentUser", "userData", "user"];
      let userData = null;

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (stored && stored !== "null" && stored !== "undefined") {
          try {
            userData = JSON.parse(stored);
            if (userData && (userData.name || userData.fullName)) {
              console.log(`Dados encontrados na chave: ${key}`, userData);
              break;
            }
          } catch (parseError) {
            console.warn(`Erro ao parsear dados da chave ${key}:`, parseError);
          }
        }
      }

      if (userData && (userData.name || userData.fullName)) {
        const fullName =
          userData.fullName ||
          userData.name ||
          userData.displayName ||
          userData.username ||
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim();

        const processedData = {
          fullName: fullName,
          name: fullName,
          firstName: this.getFirstName(fullName),
          email: userData.email,
          phone: userData.phone,
          balance: userData.coins || userData.balance || 0,
          coins: userData.coins || userData.balance || 0,
          rank: userData.rank || 0,
          level: userData.level || "Iniciante",
          id: userData.id || userData._id,
          avatar: userData.avatar,
          totalDonated: userData.totalDonated || 0,
          totalReceived: userData.totalReceived || 0,
          profilePhotoUrl: userData.profilePhotoUrl || null, // NOVO: incluir foto
        };

        console.log("✅ Dados do localStorage processados:", processedData);
        console.log(`📋 Nome completo extraído: "${fullName}"`);
        return processedData;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar dados do localStorage:", error);
      return null;
    }
  }

  /**
   * Função principal para buscar dados do usuário
   */
  static async getCurrentUser() {
    console.log("=== Iniciando busca dos dados do usuário ===");

    try {
      let userData = await this.getUserFromAPI();

      if (userData) {
        console.log("✓ Dados obtidos da API:", userData);
        return userData;
      }

      console.log("API não retornou dados válidos, tentando localStorage...");
      userData = this.getUserFromStorage();

      if (userData) {
        console.log("✓ Dados obtidos do localStorage:", userData);
        return userData;
      }

      console.warn("⚠ Nenhum dado encontrado. Usando dados de exemplo.");
      userData = {
        fullName: "Usuário Demo",
        firstName: "Usuário",
        email: "demo@example.com",
        balance: 0,
        coins: 0,
        rank: 0,
        level: "Iniciante",
        id: "demo-user",
        profilePhotoUrl: null,
      };

      return userData;
    } catch (error) {
      if (error.message.includes("Token")) {
        console.error("❌ Erro de autenticação:", error.message);
        throw error;
      }

      console.error("❌ Erro geral ao buscar usuário:", error);
      return null;
    }
  }
}

// ========== CLASSE PARA GERENCIAR RANKING ==========
class RankingManager {
  /**
   * Busca dados completos de ranking da API
   */
  static async getRankingFromAPI() {
    try {
      console.log("Buscando ranking da API...");
      const response = await UserService.makeAuthenticatedRequest(
        `${API_CONFIG.endpoints.ranking}?limit=50`
      );

      if (response && response.success !== false) {
        const data = response.data || response;
        const result = {
          users: data.users || data.ranking || [],
          totalUsers: data.totalUsers || data.total || 0,
          currentUserRank: data.currentUserRank || data.userRank || 0,
          currentUser: data.currentUser || data.user || null,
        };

        console.log("✓ Dados de ranking obtidos:", result);
        return result;
      }

      throw new Error("Resposta da API inválida");
    } catch (error) {
      console.error("Erro ao buscar ranking da API:", error);

      if (error.message.includes("Token")) {
        throw error;
      }

      console.log("Usando dados mock como fallback");
      return this.getMockRankingData();
    }
  }

  /**
   * Busca apenas o top 10 da API
   */
  static async getTop10FromAPI() {
    try {
      console.log("Buscando top 10 da API...");
      const response = await UserService.makeAuthenticatedRequest(
        API_CONFIG.endpoints.top10
      );

      if (response && response.success !== false) {
        const data = response.data || response;
        const users = data.users || data.top10 || data;

        if (Array.isArray(users) && users.length > 0) {
          console.log("✓ Top 10 obtido:", users);
          return users;
        }
      }

      throw new Error("Resposta inválida para top 10");
    } catch (error) {
      console.error("Erro ao buscar top 10:", error);
      console.log("Usando dados mock para top 10");
      return this.getMockRankingData().users.slice(0, 10);
    }
  }

  /**
   * Busca posição do usuário atual
   */
  static async getMyPosition() {
    try {
      console.log("Buscando posição do usuário...");
      const response = await UserService.makeAuthenticatedRequest(
        API_CONFIG.endpoints.myPosition
      );

      if (response && response.success !== false) {
        const data = response.data || response;
        console.log("✓ Posição do usuário obtida:", data);
        return data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar posição do usuário:", error);
      return null;
    }
  }

  /**
   * Dados mock para fallback
   */
  static getMockRankingData() {
    return {
      users: [
        {
          name: "João Santos",
          displayName: "João Santos",
          balance: 4890,
          coins: 4890,
          rank: 1,
          level: "Lenda",
          profilePhotoUrl: null,
        },
        {
          name: "Ana Silva",
          displayName: "Ana Silva",
          balance: 3240,
          coins: 3240,
          rank: 2,
          level: "Magnata",
          profilePhotoUrl: null,
        },
        {
          name: "Maria Costa",
          displayName: "Maria Costa",
          balance: 2850,
          coins: 2850,
          rank: 3,
          level: "Filantropo",
          profilePhotoUrl: null,
        },
        {
          name: "Carlos Lima",
          displayName: "Carlos Lima",
          balance: 2640,
          coins: 2640,
          rank: 4,
          level: "Filantropo",
          profilePhotoUrl: null,
        },
        {
          name: "Lucia Mendes",
          displayName: "Lucia Mendes",
          balance: 2480,
          coins: 2480,
          rank: 5,
          level: "Generoso",
          profilePhotoUrl: null,
        },
        {
          name: "Roberto Ferreira",
          displayName: "Roberto Ferreira",
          balance: 2320,
          coins: 2320,
          rank: 6,
          level: "Generoso",
          profilePhotoUrl: null,
        },
        {
          name: "Amanda Silva",
          displayName: "Amanda Silva",
          balance: 2180,
          coins: 2180,
          rank: 7,
          level: "Benfeitor",
          profilePhotoUrl: null,
        },
        {
          name: "Felipe Costa",
          displayName: "Felipe Costa",
          balance: 1890,
          coins: 1890,
          rank: 9,
          level: "Benfeitor",
          profilePhotoUrl: null,
        },
        {
          name: "Beatriz Alves",
          displayName: "Beatriz Alves",
          balance: 1750,
          coins: 1750,
          rank: 10,
          level: "Aventureiro",
          profilePhotoUrl: null,
        },
      ],
      totalUsers: 156,
      currentUserRank: 8,
    };
  }

  /**
   * CORRIGIDO: Atualiza o pódium com dados reais e fotos
   */
  /**
   * CORREÇÃO: Atualiza o pódium com dados reais e fotos proporcionais
   */
  /**
   * CORREÇÃO: Atualiza o pódium com cores de medalhas (ouro, prata, bronze)
   */
  static async updatePodium() {
    try {
      console.log("Atualizando pódium...");
      const top10 = await this.getTop10FromAPI();
      const top3 = top10.slice(0, 3);

      if (top3.length < 3) {
        console.warn("Menos de 3 usuários no ranking, usando dados mock");
        const mockData = this.getMockRankingData();
        this.updatePodiumWithData(mockData.users.slice(0, 3));
        return;
      }

      // Ordem do pódium: [2º, 1º, 3º] com cores específicas
      const podiumOrder = [top3[1], top3[0], top3[2]];
      const podiumPositions = ["second", "first", "third"];
      const medalColors = ["#C0C0C0", "#FFD700", "#CD7F32"]; // Prata, Ouro, Bronze

      podiumOrder.forEach((user, index) => {
        if (!user) return;

        const podiumItem = document.querySelector(
          `.podium-item.${podiumPositions[index]}`
        );
        if (!podiumItem) return;

        const nameElement = podiumItem.querySelector(".podium-name");
        const balanceElement = podiumItem.querySelector(".podium-balance span");
        const avatarElement = podiumItem.querySelector(".podium-avatar");

        if (nameElement) {
          nameElement.textContent = user.displayName || user.name;
        }
        if (balanceElement) {
          const balance = user.balance || user.coins || 0;
          balanceElement.textContent = balance.toLocaleString();
        }

        // CORREÇÃO: Avatar com cor de medalha específica
        if (avatarElement) {
          const displayName = user.displayName || user.name || "Usuário";
          const userInitials = getUserInitials(displayName);
          const borderColor = medalColors[index];

          if (user.profilePhotoUrl && isValidPhotoUrl(user.profilePhotoUrl)) {
            const fullPhotoUrl = getFullImageUrl(user.profilePhotoUrl);
            avatarElement.innerHTML = `
            <img
              class="podium-profile-image"
              src="${fullPhotoUrl}"
              alt="Foto do Usuário"
              onerror="this.src='https://placehold.co/80x80/${borderColor.replace(
                "#",
                ""
              )}/ffffff?text=${userInitials}'"
              style="
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                object-position: center;
                border: 3px solid ${borderColor};
                background: #f0f0f0;
                display: block;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(${
                  borderColor === "#FFD700"
                    ? "255, 215, 0"
                    : borderColor === "#C0C0C0"
                    ? "192, 192, 192"
                    : "205, 127, 50"
                }, 0.3);
              "
            />
          `;
          } else {
            // Fallback: avatar com iniciais e cor de medalha
            avatarElement.innerHTML = `
            <img
              class="podium-profile-image"
              src="https://placehold.co/80x80/${borderColor.replace(
                "#",
                ""
              )}/ffffff?text=${userInitials}"
              alt="Avatar"
              style="
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid ${borderColor};
                display: block;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(${
                  borderColor === "#FFD700"
                    ? "255, 215, 0"
                    : borderColor === "#C0C0C0"
                    ? "192, 192, 192"
                    : "205, 127, 50"
                }, 0.3);
              "
            />
          `;
          }
        }
      });

      console.log("✓ Pódium atualizado com cores de medalhas");
    } catch (error) {
      console.error("Erro ao atualizar pódium:", error);
      const mockData = this.getMockRankingData();
      this.updatePodiumWithData(mockData.users.slice(0, 3));
    }
  }

  /**
   * CORREÇÃO: Atualiza pódium com dados fornecidos - versão com cores de medalhas
   */
  static updatePodiumWithData(top3) {
    const podiumOrder = [top3[1], top3[0], top3[2]];
    const podiumPositions = ["second", "first", "third"];
    const medalColors = ["#C0C0C0", "#FFD700", "#CD7F32"]; // Prata, Ouro, Bronze

    podiumOrder.forEach((user, index) => {
      if (!user) return;

      const podiumItem = document.querySelector(
        `.podium-item.${podiumPositions[index]}`
      );
      if (!podiumItem) return;

      const nameElement = podiumItem.querySelector(".podium-name");
      const balanceElement = podiumItem.querySelector(".podium-balance span");
      const avatarElement = podiumItem.querySelector(".podium-avatar");

      if (nameElement) {
        nameElement.textContent = user.displayName || user.name;
      }
      if (balanceElement) {
        const balance = user.balance || user.coins || 0;
        balanceElement.textContent = balance.toLocaleString();
      }

      // Avatar com cor de medalha específica
      if (avatarElement) {
        const displayName = user.displayName || user.name || "Usuário";
        const userInitials = getUserInitials(displayName);
        const borderColor = medalColors[index];

        if (user.profilePhotoUrl && isValidPhotoUrl(user.profilePhotoUrl)) {
          const fullPhotoUrl = getFullImageUrl(user.profilePhotoUrl);
          avatarElement.innerHTML = `
          <img
            class="podium-profile-image"
            src="${fullPhotoUrl}"
            alt="Foto do Usuário"
            onerror="this.src='https://placehold.co/80x80/${borderColor.replace(
              "#",
              ""
            )}/ffffff?text=${userInitials}'"
            style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              object-position: center;
              border: 3px solid ${borderColor};
              background: #f0f0f0;
              display: block;
              margin: 0 auto;
              box-shadow: 0 4px 12px rgba(${
                borderColor === "#FFD700"
                  ? "255, 215, 0"
                  : borderColor === "#C0C0C0"
                  ? "192, 192, 192"
                  : "205, 127, 50"
              }, 0.3);
            "
          />
        `;
        } else {
          // Fallback: avatar com iniciais e cor de medalha
          avatarElement.innerHTML = `
          <img
            class="podium-profile-image"
            src="https://placehold.co/80x80/${borderColor.replace(
              "#",
              ""
            )}/ffffff?text=${userInitials}"
            alt="Avatar"
            style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              object-fit: cover;
              border: 3px solid ${borderColor};
              display: block;
              margin: 0 auto;
              box-shadow: 0 4px 12px rgba(${
                borderColor === "#FFD700"
                  ? "255, 215, 0"
                  : borderColor === "#C0C0C0"
                  ? "192, 192, 192"
                  : "205, 127, 50"
              }, 0.3);
            "
          />
        `;
        }
      }
    });
  }

  /**
   * Função para aplicar CSS corretivo globalmente com cores de medalhas
   */
  static addPodiumCSS() {
    // Verificar se o CSS já foi adicionado
    if (document.getElementById("podium-fix-styles")) return;

    const style = document.createElement("style");
    style.id = "podium-fix-styles";
    style.textContent = `
    /* CSS corretivo para fotos do pódio com cores de medalhas */
    .podium-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 10px auto;
      width: 86px;
      height: 86px;
    }

    /* Estilo geral para todas as posições */
    .podium-profile-image {
      width: 80px !important;
      height: 80px !important;
      border-radius: 50% !important;
      object-fit: cover !important;
      object-position: center !important;
      background: #f0f0f0 !important;
      display: block !important;
      margin: 0 auto !important;
      transition: transform 0.3s ease !important;
    }

    /* 1º lugar - Ouro */
    .podium-item.first .podium-profile-image {
      border: 1px solid #FFD700 !important;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4) !important;
    }

    /* 2º lugar - Prata */
    .podium-item.second .podium-profile-image {
      border: 1px solid #C0C0C0 !important;
      box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4) !important;
    }

    /* 3º lugar - Bronze */
    .podium-item.third .podium-profile-image {
      border: 1px solid #CD7F32 !important;
      box-shadow: 0 4px 12px rgba(205, 127, 50, 0.4) !important;
    }

    .podium-profile-image:hover {
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      .podium-profile-image {
        width: 60px !important;
        height: 60px !important;
        border-width: 2px !important;
      }
      
      .podium-avatar {
        width: 66px;
        height: 66px;
      }
    }
  `;

    document.head.appendChild(style);
    console.log("✓ CSS do pódio com cores de medalhas aplicado");
  }

  /**
   * CORRIGIDO: Atualiza a lista de ranking com lógica de foto correta
   */
  static async updateRankingList(currentUser) {
    try {
      console.log("Atualizando lista de ranking...");
      const rankingData = await this.getRankingFromAPI();
      const rankingList = document.querySelector(".ranking-list");

      if (!rankingList) {
        console.warn("Elemento .ranking-list não encontrado");
        return;
      }

      // Atualizar total de usuários
      const totalUsersElement = document.querySelector(".total-users");
      if (totalUsersElement) {
        totalUsersElement.textContent = `${rankingData.totalUsers} usuários`;
      }

      rankingList.innerHTML = "";

      // CORREÇÃO: Obter foto do usuário atual antes do loop
      const usersToShow = rankingData.users.filter((user) => user.rank >= 4);
      const currentUserId = currentUser?.id;
      const currentUserPhoto = getCurrentUserPhoto(); // NOVA FUNÇÃO

      usersToShow.forEach((user) => {
        // Identificar se é o usuário atual
        const isCurrentUser =
          currentUserId &&
          (user._id === currentUserId ||
            user.id === currentUserId ||
            (user.name === currentUser.fullName &&
              user.coins === currentUser.coins));

        const rankItem = document.createElement("div");
        rankItem.classList.add("rank-item");
        if (isCurrentUser) {
          rankItem.classList.add("current-user");
        }

        const balance = user.balance || user.coins || 0;
        const displayName = user.displayName || user.name || "Usuário";

        // CORREÇÃO PRINCIPAL: Usar função generateAvatarHtml
        const avatarContent = generateAvatarHtml(
          user,
          isCurrentUser,
          currentUserPhoto
        );

        rankItem.innerHTML = `
          <div class="rank-position">${user.rank}</div>
          <div class="rank-avatar ${isCurrentUser ? "highlighted" : ""}">
            ${avatarContent}
          </div>
          <div class="rank-info">
            <div class="rank-name">${displayName}${
          isCurrentUser ? " (Você)" : ""
        }</div>
          </div>
          <div class="rank-balance">
            <div class="coin-icon">₿</div>
            <span>${balance.toLocaleString()}</span>
          </div>
        `;

        rankingList.appendChild(rankItem);
      });

      // Se não encontrou o usuário atual na lista, adiciona
      const userFoundInList = usersToShow.some(
        (u) =>
          currentUserId &&
          (u._id === currentUserId ||
            u.id === currentUserId ||
            (u.name === currentUser.fullName && u.coins === currentUser.coins))
      );

      if (currentUser && !userFoundInList) {
        this.addCurrentUserToList(
          currentUser,
          rankingData.currentUserRank,
          currentUserPhoto
        );
      }

      console.log("✓ Lista de ranking atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar lista de ranking:", error);
      const mockData = this.getMockRankingData();
      this.updateRankingListWithData(mockData.users.slice(3), currentUser);
    }
  }

  /**
   * CORRIGIDO: Adiciona usuário atual na lista se não estiver presente COM FOTO
   */
  static addCurrentUserToList(currentUser, rank, currentUserPhoto = null) {
    const rankingList = document.querySelector(".ranking-list");
    if (!rankingList) return;

    const rankItem = document.createElement("div");
    rankItem.classList.add("rank-item", "current-user");

    const balance = currentUser.coins || currentUser.balance || 0;
    const displayName = currentUser.fullName || currentUser.name;

    // CORREÇÃO: Usar função generateAvatarHtml
    const user = {
      ...currentUser,
      displayName: displayName,
      profilePhotoUrl: currentUser.profilePhotoUrl,
    };
    const avatarContent = generateAvatarHtml(user, true, currentUserPhoto);

    rankItem.innerHTML = `
      <div class="rank-position">${rank}</div>
      <div class="rank-avatar highlighted">
        ${avatarContent}
      </div>
      <div class="rank-info">
        <div class="rank-name">${displayName} (Você)</div>
      </div>
      <div class="rank-balance">
        <div class="coin-icon">₿</div>
        <span>${balance.toLocaleString()}</span>
      </div>
    `;

    rankingList.appendChild(rankItem);
  }

  /**
   * CORRIGIDO: Atualiza lista com dados fornecidos (fallback) COM CORREÇÃO DE FOTO
   */
  static updateRankingListWithData(users, currentUser) {
    const rankingList = document.querySelector(".ranking-list");
    if (!rankingList) return;

    rankingList.innerHTML = "";
    const currentUserId = currentUser?.id;
    const currentUserPhoto = getCurrentUserPhoto(); // NOVA FUNÇÃO

    users.forEach((user) => {
      // CORREÇÃO: Melhor identificação do usuário atual
      const isCurrentUser =
        currentUserId &&
        (user._id === currentUserId ||
          user.id === currentUserId ||
          (user.name === currentUser.fullName &&
            user.coins === currentUser.coins));

      const rankItem = document.createElement("div");
      rankItem.classList.add("rank-item");
      if (isCurrentUser) {
        rankItem.classList.add("current-user");
      }

      const balance = user.balance || user.coins || 0;
      const displayName = user.displayName || user.name;

      // CORREÇÃO: Usar função generateAvatarHtml
      const avatarContent = generateAvatarHtml(
        user,
        isCurrentUser,
        currentUserPhoto
      );

      rankItem.innerHTML = `
        <div class="rank-position">${user.rank}</div>
        <div class="rank-avatar ${isCurrentUser ? "highlighted" : ""}">
          ${avatarContent}
        </div>
        <div class="rank-info">
          <div class="rank-name">${displayName}${
        isCurrentUser ? " (Você)" : ""
      }</div>
        </div>
        <div class="rank-balance">
          <div class="coin-icon">₿</div>
          <span>${balance.toLocaleString()}</span>
        </div>
      `;

      rankingList.appendChild(rankItem);
    });
  }
}

// ========== FUNÇÕES DE INTERFACE ==========
class UIManager {
  /**
   * Atualiza a interface do usuário com seus dados reais
   */
  static async updateUserInterface() {
    try {
      console.log("=== Atualizando interface do usuário ===");

      const userData = await UserService.getCurrentUser();

      if (userData) {
        const positionData = await RankingManager.getMyPosition();
        const userRank = positionData?.user?.rank || userData.rank || 0;
        const userBalance = userData.coins || userData.balance || 0;

        // CORREÇÃO: Sempre priorizar nome completo
        const displayName =
          userData.fullName || userData.name || userData.firstName || "Usuário";

        console.log("📋 Dados do usuário para exibição:", {
          fullName: userData.fullName,
          name: userData.name,
          firstName: userData.firstName,
          displayName: displayName,
          balance: userBalance,
          rank: userRank,
          profilePhotoUrl: userData.profilePhotoUrl,
        });

        // Atualizar card do usuário com NOME COMPLETO
        this.updateElement("user-name", displayName);
        this.updateElement("user-balance", userBalance.toLocaleString());
        this.updateElement("user-position", userRank);

        // CORREÇÃO: Elementos que podem não existir no HTML
        this.safeUpdateElement("user-name-in-list", `${displayName} (Você)`);
        this.safeUpdateElement(
          "user-balance-in-list",
          userBalance.toLocaleString()
        );

        console.log("✓ Interface do usuário atualizada com sucesso");
        console.log(`✓ Nome exibido: "${displayName}"`);
      }

      await RankingManager.updatePodium();
      await RankingManager.updateRankingList(userData);
      this.animateRankingItems();
    } catch (error) {
      console.error("❌ Erro ao atualizar interface:", error);

      if (error.message.includes("Token")) {
        this.showTokenExpiredMessage();
        return;
      }

      this.showFallbackData();
    }
  }

  /**
   * Mostra mensagem de token expirado
   */
  static showTokenExpiredMessage() {
    console.warn("Mostrando mensagem de token expirado");

    const elements = ["user-name", "user-balance", "user-position"];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        if (id === "user-name") {
          element.textContent = "Sessão expirada";
        } else {
          element.textContent = "---";
        }
      }
    });

    setTimeout(() => {
      const message =
        "Sua sessão expirou. Você será redirecionado para o login.";
      if (typeof alert !== "undefined") {
        alert(message);
      } else {
        console.error(message);
      }
    }, 1000);
  }

  /**
   * Mostra dados de fallback em caso de erro
   */
  static showFallbackData() {
    console.warn("Usando dados de fallback devido a erro na API");

    this.updateElement("user-name", "Usuário Demo");
    this.updateElement("user-balance", "0");
    this.updateElement("user-position", "---");

    const mockData = RankingManager.getMockRankingData();
    RankingManager.updatePodiumWithData(mockData.users.slice(0, 3));
    RankingManager.updateRankingListWithData(mockData.users.slice(3), null);
  }

  /**
   * Atualiza um elemento do DOM
   */
  static updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
      console.log(`✅ Elemento '${elementId}' atualizado: "${content}"`);
    } else {
      console.warn(`⚠️ Elemento com ID '${elementId}' não encontrado no DOM`);
    }
  }

  /**
   * CORREÇÃO: Atualiza elemento apenas se existir (sem warning)
   */
  static safeUpdateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
      console.log(`✅ Elemento '${elementId}' atualizado: "${content}"`);
    }
    // Não mostra warning se elemento não existir
  }

  /**
   * Aplica animações aos itens do ranking
   */
  static animateRankingItems() {
    const rankItems = document.querySelectorAll(".rank-item");
    rankItems.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";

      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
        item.style.transition = "all 0.3s ease-in";
      }, index * 100);
    });
  }

  static showLoading() {
    console.log("Mostrando estado de loading");

    const elements = [
      "user-name",
      "user-balance",
      "user-position",
      "podium-name-1",
      "podium-coins-1",
      "podium-name-2",
      "podium-coins-2",
      "podium-name-3",
      "podium-coins-3",
    ];

    // Itera sobre a lista e atualiza o texto de cada elemento
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = "...";
      }
    });

    const rankingList = document.querySelector(".ranking-list");
    if (rankingList) {
      rankingList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p>Carregando ranking...</p>
        </div>
      `;
    }
  }

  static showConnectionError() {
    console.error("Mostrando erro de conexão");

    const rankingList = document.querySelector(".ranking-list");
    if (rankingList) {
      rankingList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #ff6b6b;">
          <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p>Erro ao carregar ranking</p>
          <button onclick="location.reload()" style="
            margin-top: 15px; 
            padding: 8px 16px; 
            background: #00d4ff; 
            border: none; 
            border-radius: 8px; 
            color: white; 
            cursor: pointer;
          ">Tentar novamente</button>
        </div>
      `;
    }
  }
}

// ========== NAVEGAÇÃO ==========
class NavigationManager {
  static setupNavigation() {
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", this.goBack);
    }

    const navHome = document.getElementById("nav-home");
    const navTimeline = document.getElementById("nav-timeline");
    const navProfile = document.getElementById("nav-profile");

    if (navHome) navHome.addEventListener("click", () => this.goToPage("home"));
    if (navTimeline)
      navTimeline.addEventListener("click", () => this.goToPage("timeline"));
    if (navProfile)
      navProfile.addEventListener("click", () => this.goToPage("profile"));
  }

  static goBack() {
    if (document.referrer) {
      window.history.back();
    } else {
      window.location.href = "../../login/html/login.html";
    }
  }

  static goToPage(page) {
    const routes = {
      home: "/pages/home/html/index.html",
      timeline: "../../timeline/html/timeline.html",
      profile: "../../profile/pages/profile.html",
    };

    if (routes[page]) {
      window.location.href = routes[page];
    }
  }
}

// ========== UTILITÁRIOS ==========
class Utils {
  static formatNumber(number) {
    return new Intl.NumberFormat("pt-BR").format(number);
  }

  static async checkAPIConnection() {
    try {
      console.log("Verificando conexão com a API...");

      const response = await fetch(
        `${API_CONFIG.baseURL}/health`, // <-- Corrigido aqui
        {
          method: "GET",
          timeout: 5000,
        }
      );

      const isConnected = response.ok;
      console.log(`API ${isConnected ? "acessível" : "inacessível"}`);
      return isConnected;
    } catch (error) {
      console.warn("API não está acessível:", error.message);
      return false;
    }
  }

  static generateTestUser() {
    const testUser = {
      name: "Walter White",
      fullName: "Walter White",
      displayName: "Walter White",
      firstName: "Walter",
      lastName: "White",
      email: "walter.white@email.com",
      phone: "(11) 99999-9999",
      coins: 3500,
      balance: 3500,
      rank: 8,
      level: "Generoso",
      id: "68a647a0150337a0f1668e86",
      registeredAt: new Date().toISOString(),
      profilePhotoUrl: null,
    };

    const testToken = "test_jwt_token_" + Date.now();

    localStorage.setItem("currentUser", JSON.stringify(testUser));
    localStorage.setItem("token", testToken);
    localStorage.setItem("authToken", testToken);

    console.log("✓ Dados de teste salvos:");
    console.log("  - Usuário:", testUser);
    console.log("  - Token:", testToken);
    console.log(`  - Nome completo: "${testUser.fullName}"`);

    return testUser;
  }

  static clearUserData() {
    const keysToRemove = [
      "currentUser",
      "userData",
      "user",
      "token",
      "authToken",
      "accessToken",
      "jwt",
      "jwtToken",
      "bearerToken",
      "userToken",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log("✓ Dados do usuário limpos");
  }

  static debugInfo() {
    const token = UserService.getAuthToken();
    const isValidToken = UserService.validateToken(token);

    console.log(`
=== SISTEMA DE RANKING - DEBUG INFO ===
📊 API Base: ${API_CONFIG.baseURL}
🔑 Token: ${token ? "Presente" : "Ausente"}
✅ Token Válido: ${isValidToken ? "Sim" : "Não"}
📁 Dados no localStorage: ${localStorage.getItem("currentUser") ? "Sim" : "Não"}

🛠️ COMANDOS DISPONÍVEIS:
   • testUser() - Cria usuário de teste com token
   • clearData() - Limpa todos os dados salvos
   • checkAPI() - Verifica conexão com API
   • debugInfo() - Mostra informações do sistema
   • forceReload() - Força recarregamento da interface
   
🔧 CLASSES PRINCIPAIS:
   • UserService - Gerencia autenticação e dados do usuário
   • RankingManager - Gerencia dados de ranking
   • UIManager - Gerencia interface do usuário
   • NavigationManager - Gerencia navegação
   
💡 DICA: Se não estiver funcionando, tente:
   1. testUser() para criar dados de teste
   2. Verificar se a API está rodando
   3. Verificar console para erros específicos
==========================================
    `);
  }

  static async forceReload() {
    console.log("🔄 Forçando recarregamento da interface...");
    try {
      UIManager.showLoading();
      await UIManager.updateUserInterface();
      console.log("✓ Interface recarregada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao recarregar interface:", error);
      UIManager.showConnectionError();
    }
  }

  static async runDiagnostic() {
    console.log("🔍 Executando diagnóstico completo...");

    const results = {
      token: !!UserService.getAuthToken(),
      tokenValid: UserService.validateToken(UserService.getAuthToken()),
      apiConnection: await Utils.checkAPIConnection(),
      localStorageData: !!localStorage.getItem("currentUser"),
      domElements: {
        userCard: !!document.getElementById("user-name"),
        rankingList: !!document.querySelector(".ranking-list"),
        podium: !!document.querySelector(".podium-item"),
      },
    };

    console.log("📋 RESULTADO DO DIAGNÓSTICO:");
    console.table(results);

    const suggestions = [];
    if (!results.token)
      suggestions.push(
        "❌ Token ausente - faça login novamente ou use testUser()"
      );
    if (!results.tokenValid)
      suggestions.push("❌ Token inválido - faça login novamente");
    if (!results.apiConnection)
      suggestions.push("⚠️ API inacessível - usando dados mock");
    if (!results.localStorageData)
      suggestions.push("⚠️ Sem dados locais - dependendo da API");
    if (!results.domElements.userCard)
      suggestions.push("❌ Elementos DOM não encontrados - verifique HTML");

    if (suggestions.length > 0) {
      console.log("\n🔧 SUGESTÕES:");
      suggestions.forEach((s) => console.log(s));
    } else {
      console.log("✅ Sistema funcionando corretamente!");
    }

    return results;
  }
}

// ========== INICIALIZAÇÃO PRINCIPAL ==========
class RanksApp {
  static async init() {
    try {
      console.log("🚀 Inicializando aplicação de ranking...");

      const token = UserService.getAuthToken();

      if (!token) {
        console.warn("⚠️ Token não encontrado.");

        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          console.log(
            "🔧 Ambiente de desenvolvimento detectado. Criando dados de teste..."
          );
          Utils.generateTestUser();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log("🔒 Redirecionando para login...");
          this.redirectToLogin();
          return;
        }
      } else if (!UserService.validateToken(token)) {
        console.warn(
          "❌ Token inválido encontrado. Limpando e redirecionando..."
        );
        Utils.clearUserData();
        this.redirectToLogin();
        return;
      }

      UIManager.showLoading();

      const hasConnection = await Utils.checkAPIConnection();
      if (!hasConnection) {
        console.warn(
          "⚠️ API não acessível. Sistema funcionará com dados locais/mock."
        );
      } else {
        console.log("✅ Conexão com API estabelecida.");
      }

      NavigationManager.setupNavigation();
      RankingManager.addPodiumCSS();
      await UIManager.updateUserInterface();

      console.log("🎉 Aplicação de ranking carregada com sucesso!");
    } catch (error) {
      console.error("💥 Erro crítico ao inicializar aplicação:", error);

      if (error.message.includes("Token")) {
        this.redirectToLogin();
      } else {
        UIManager.showConnectionError();
      }
    }
  }

  static redirectToLogin() {
    console.log("📄 Redirecionando para login em 3 segundos...");

    const elements = ["user-name", "user-balance", "user-position"];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        if (id === "user-name") {
          element.textContent = "Redirecionando...";
        } else {
          element.textContent = "---";
        }
      }
    });

    setTimeout(() => {
      window.location.href = "../../login/html/login.html";
    }, 3000);
  }

  static async reinitialize() {
    console.log("🔄 Reinicializando aplicação...");
    await this.init();
  }
}

// ========== EVENTOS E INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  console.log("📄 DOM carregado, inicializando aplicação...");

  // Corrigir codificação imediatamente
  const userNameElement = document.getElementById("user-name");
  if (
    userNameElement &&
    (userNameElement.textContent === "UsuÃƒÆ'Ã‚Â¡rio" ||
      userNameElement.textContent === "UsuÃƒÂ¡rio")
  ) {
    userNameElement.textContent = "Carregando...";
  }

  const userNameInListElement = document.getElementById("user-name-in-list");
  if (
    userNameInListElement &&
    userNameInListElement.textContent.includes("UsuÃƒÆ'Ã‚Â¡rio")
  ) {
    userNameInListElement.textContent = "Carregando... (Você)";
  }

  RanksApp.init();

  setTimeout(() => {
    Utils.debugInfo();
  }, 2000);
});

// Verificação contínua para garantir que o nome seja atualizado
setInterval(() => {
  const userNameElement = document.getElementById("user-name");
  if (userNameElement) {
    const currentText = userNameElement.textContent;
    if (
      currentText === "UsuÃƒÆ'Ã‚Â¡rio" ||
      currentText === "UsuÃƒÂ¡rio" ||
      currentText === "..."
    ) {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (userData.fullName) {
        userNameElement.textContent = userData.fullName;
        console.log("🔄 Nome corrigido automaticamente:", userData.fullName);
      }
    }
  }
}, 1000);

// Tratamento de erros globais
window.addEventListener("error", function (event) {
  console.error("💥 Erro global capturado:", event.error);
});

window.addEventListener("unhandledrejection", function (event) {
  console.error("💥 Promise rejeitada não tratada:", event.reason);
});

// ========== EXPOSIÇÃO GLOBAL PARA DEBUG ==========
if (typeof window !== "undefined") {
  window.UserService = UserService;
  window.RankingManager = RankingManager;
  window.UIManager = UIManager;
  window.NavigationManager = NavigationManager;
  window.Utils = Utils;
  window.RanksApp = RanksApp;

  window.testUser = Utils.generateTestUser;
  window.clearData = Utils.clearUserData;
  window.checkAPI = Utils.checkAPIConnection;
  window.debugInfo = Utils.debugInfo;
  window.forceReload = Utils.forceReload;
  window.runDiagnostic = Utils.runDiagnostic;
  window.reinit = RanksApp.reinitialize;

  // NOVAS FUNÇÕES EXPOSTAS PARA DEBUG
  window.generateAvatarHtml = generateAvatarHtml;
  window.isValidPhotoUrl = isValidPhotoUrl;
  window.getFullImageUrl = getFullImageUrl;
  window.getCurrentUserPhoto = getCurrentUserPhoto;
}

// ========== FUNÇÕES DE CALLBACK (COMPATIBILIDADE) ==========
window.goBack = NavigationManager.goBack.bind(NavigationManager);
window.goToPage = NavigationManager.goToPage.bind(NavigationManager);
