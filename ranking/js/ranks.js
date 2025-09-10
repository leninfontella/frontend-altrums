// ========== FUNÇÕES AUXILIARES PARA FOTOS - VERSÃO CORRIGIDA ==========

/**
 * Função auxiliar para gerar iniciais do nome
 */
function getUserInitials(name) {
  if (!name || name.trim() === "") return "U";
  return name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0) // Filtrar partes vazias
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Função auxiliar para gerar ID do usuário para foto
 */
function getUserPhotoId(name) {
  if (!name || name.trim() === "") return "user";
  return name
    .toLowerCase()
    .trim()
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
 * FUNÇÃO CORRIGIDA: Obter a foto do usuário atual (apenas para o usuário logado)
 */
function getCurrentUserPhoto() {
  try {
    // Tentar obter a foto do userService
    if (
      window.userService &&
      typeof window.userService.getUserPhoto === "function"
    ) {
      const photo = window.userService.getUserPhoto();
      if (photo && isValidPhotoUrl(photo)) return photo;
    }

    // Tentar obter do userData
    const userData = getUserData();
    if (
      userData &&
      userData.profilePhotoUrl &&
      isValidPhotoUrl(userData.profilePhotoUrl)
    ) {
      return userData.profilePhotoUrl;
    }

    // Tentar obter do localStorage
    const storedPhoto = localStorage.getItem("userProfilePhoto");
    if (storedPhoto && isValidPhotoUrl(storedPhoto)) return storedPhoto;

    return null;
  } catch (error) {
    console.error("Erro ao obter foto do usuário atual:", error);
    return null;
  }
}

/**
 * NOVA FUNÇÃO: Validar se a URL da foto é válida
 */
function isValidPhotoUrl(url) {
  if (!url || typeof url !== "string") return false;

  // Não aceitar emojis ou caracteres especiais problemáticos
  if (url.includes("👤") || url.includes("🖼️") || url.includes("📸"))
    return false;

  // Deve ser uma URL válida ou caminho válido
  return (
    url.startsWith("http") ||
    url.startsWith("/uploads/") ||
    url.startsWith("./uploads/")
  );
}

/**
 * FUNÇÃO TOTALMENTE CORRIGIDA: Processar dados de profilePhoto da API
 */
function processProfilePhoto(user) {
  console.log(
    `🔍 Processando foto para usuário: ${user.name || user.displayName}`
  );
  console.log(`📸 Dados do profilePhoto:`, user.profilePhoto);

  // Se já tem profilePhotoUrl válida, usar ela
  if (user.profilePhotoUrl && isValidPhotoUrl(user.profilePhotoUrl)) {
    console.log(`✅ ProfilePhotoUrl já válida: ${user.profilePhotoUrl}`);
    return user.profilePhotoUrl;
  }

  // Se tem profilePhoto com estrutura válida da API
  if (user.profilePhoto && typeof user.profilePhoto === "object") {
    const { filename, path } = user.profilePhoto;

    // Se tem filename válido, construir URL
    if (filename && filename !== null && filename !== "null") {
      const photoUrl = `http://localhost:5000/uploads/profiles/${filename}`;
      console.log(`✅ URL construída a partir do filename: ${photoUrl}`);
      return photoUrl;
    }

    // Se tem path válido, usar ele
    if (path && path !== null && path !== "null") {
      const photoUrl = path.startsWith("http")
        ? path
        : `http://localhost:5000${path}`;
      console.log(`✅ URL construída a partir do path: ${photoUrl}`);
      return photoUrl;
    }
  }

  // Fallback: verificar se profilePhoto é uma string
  if (
    typeof user.profilePhoto === "string" &&
    user.profilePhoto !== "null" &&
    user.profilePhoto.trim() !== ""
  ) {
    if (isValidPhotoUrl(user.profilePhoto)) {
      console.log(`✅ ProfilePhoto como string válida: ${user.profilePhoto}`);
      return user.profilePhoto;
    }
  }

  // Verificar avatar como fallback
  if (user.avatar && isValidPhotoUrl(user.avatar)) {
    console.log(`✅ Avatar como fallback: ${user.avatar}`);
    return user.avatar;
  }

  console.log(
    `❌ Nenhuma foto válida encontrada para ${user.name || user.displayName}`
  );
  return null;
}

/**
 * FUNÇÃO CORRIGIDA: Gerar URL completa da imagem
 */
function getFullImageUrl(photoUrl) {
  if (!photoUrl || !isValidPhotoUrl(photoUrl)) return null;

  try {
    // Se já é uma URL completa, retorna como está
    if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
      return photoUrl;
    }

    // Se é um caminho relativo para uploads
    if (photoUrl.startsWith("/uploads/") || photoUrl.includes("uploads/")) {
      const cleanPath = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
      return `http://localhost:5000${cleanPath}`;
    }

    // Se não tem nenhum dos padrões esperados, assumir que é um nome de arquivo
    if (!photoUrl.startsWith("/") && !photoUrl.includes("/")) {
      return `http://localhost:5000/uploads/profiles/${photoUrl}`;
    }

    return photoUrl;
  } catch (error) {
    console.error("Erro ao processar URL da imagem:", error);
    return null;
  }
}

/**
 * NOVA FUNÇÃO: Verificar se imagem existe no servidor
 */
async function checkImageExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.warn(`Imagem não encontrada: ${url}`);
    return false;
  }
}

/**
 * FUNÇÃO CORRIGIDA: Buscar foto de perfil de usuário específico da API
 */
async function getUserProfilePhoto(userId) {
  try {
    if (!userId) return null;

    const response = await UserService.makeAuthenticatedRequest(
      `/users/${userId}/photo`
    );

    if (
      response &&
      response.success &&
      response.data &&
      response.data.profilePhoto
    ) {
      const photoUrl = getFullImageUrl(response.data.profilePhoto);

      // Verificar se a imagem existe antes de retornar
      if (photoUrl && (await checkImageExists(photoUrl))) {
        return photoUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn(`Erro ao buscar foto do usuário ${userId}:`, error);
    return null;
  }
}

/**
 * FUNÇÃO CORRIGIDA: Criar elemento de imagem com fallback melhorado
 */
function createImageElement(
  photoUrl,
  userName,
  size = 50,
  isCurrentUser = false
) {
  const img = document.createElement("img");
  const userInitials = getUserInitials(userName || "Usuario");

  // Configurar classe CSS
  img.className = "profile-image";
  if (isCurrentUser) {
    img.setAttribute("data-user-photo", "");
  }

  // Se tem foto válida, tentar usar ela com verificação assíncrona
  if (photoUrl && isValidPhotoUrl(photoUrl)) {
    const fullUrl = getFullImageUrl(photoUrl);
    if (fullUrl) {
      img.src = fullUrl;
      img.alt = "Foto do Perfil";

      // Fallback melhorado em caso de erro ao carregar
      img.onerror = function () {
        console.warn("Imagem não encontrada, usando placeholder:", fullUrl);
        this.src = `https://placehold.co/${size}x${size}/${
          isCurrentUser ? "00d4ff" : "666"
        }/ffffff?text=${encodeURIComponent(userInitials)}`;
        this.alt = "Avatar";
        this.onerror = null; // Prevenir loop infinito
      };

      // Adicionar loading="lazy" para melhor performance
      img.loading = "lazy";

      return img;
    }
  }

  // Usar placeholder com iniciais como padrão
  img.src = `https://placehold.co/${size}x${size}/${
    isCurrentUser ? "00d4ff" : "666"
  }/ffffff?text=${encodeURIComponent(userInitials)}`;
  img.alt = "Avatar";

  return img;
}

/**
 * FUNÇÃO CORRIGIDA: Atualizar avatar existente no DOM
 */
function updateAvatarElement(
  avatarElement,
  photoUrl,
  userName,
  isCurrentUser = false
) {
  if (!avatarElement) return;

  const userInitials = getUserInitials(userName || "Usuario");

  // Se tem foto válida
  if (photoUrl && isValidPhotoUrl(photoUrl)) {
    const fullUrl = getFullImageUrl(photoUrl);
    if (fullUrl) {
      avatarElement.src = fullUrl;
      avatarElement.alt = "Foto do Perfil";

      // Atualizar onerror com melhor tratamento
      avatarElement.onerror = function () {
        console.warn("Erro ao carregar foto, usando fallback:", fullUrl);
        this.src = `https://placehold.co/50x50/${
          isCurrentUser ? "00d4ff" : "666"
        }/ffffff?text=${encodeURIComponent(userInitials)}`;
        this.alt = "Avatar";
        this.onerror = null; // Prevenir loop infinito
      };

      return;
    }
  }

  // Usar placeholder com iniciais
  avatarElement.src = `https://placehold.co/50x50/${
    isCurrentUser ? "00d4ff" : "666"
  }/ffffff?text=${encodeURIComponent(userInitials)}`;
  avatarElement.alt = "Avatar";
  avatarElement.onerror = null; // Remover handler de erro
}

/**
 * Cache de fotos de usuários - Versão melhorada
 */
class PhotoCache {
  constructor() {
    this.cache = new Map();
    this.maxAge = 10 * 60 * 1000; // 10 minutos
    this.maxSize = 100; // Máximo 100 fotos em cache
    this.failedUrls = new Set(); // Cache de URLs que falharam
  }

  get(userId) {
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.photoUrl;
    }

    // Remover entrada expirada
    if (cached) {
      this.cache.delete(userId);
    }

    return null;
  }

  set(userId, photoUrl) {
    // Limitar tamanho do cache
    if (this.cache.size >= this.maxSize) {
      // Remover entradas mais antigas
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.3));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }

    this.cache.set(userId, {
      photoUrl,
      timestamp: Date.now(),
    });
  }

  markFailed(url) {
    this.failedUrls.add(url);
    // Limpar URLs falidas antigas (máximo 50)
    if (this.failedUrls.size > 50) {
      const urlsArray = Array.from(this.failedUrls);
      urlsArray.slice(0, 25).forEach((url) => this.failedUrls.delete(url));
    }
  }

  hasFailed(url) {
    return this.failedUrls.has(url);
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.failedUrls.clear();
    return size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
      failedUrls: this.failedUrls.size,
    };
  }
}

// Instância global do cache de fotos
const photoCache = new PhotoCache();

// ========== FUNÇÃO UTILITÁRIA PARA DEBUG ==========

/**
 * Função para debug de problemas com fotos
 */
function debugPhotoIssues(userName, photoUrl, userId) {
  console.group(`🔍 DEBUG: Problemas com foto`);
  console.log(`👤 Nome do usuário: "${userName}"`);
  console.log(`🆔 User ID: "${userId}"`);
  console.log(`📷 URL da foto original: "${photoUrl}"`);
  console.log(`✅ URL é válida: ${isValidPhotoUrl(photoUrl)}`);
  console.log(`🔄 URL completa gerada: "${getFullImageUrl(photoUrl)}"`);
  console.log(`🅰️ Iniciais geradas: "${getUserInitials(userName)}"`);
  console.log(`💾 Foto no cache: ${photoCache.get(userId) ? "Sim" : "Não"}`);
  console.log(
    `❌ URL falhou antes: ${photoCache.hasFailed(photoUrl) ? "Sim" : "Não"}`
  );
  console.groupEnd();
}

// Exposição global para debug
if (typeof window !== "undefined") {
  window.debugPhotoIssues = debugPhotoIssues;
  window.getUserInitials = getUserInitials;
  window.isValidPhotoUrl = isValidPhotoUrl;
  window.getFullImageUrl = getFullImageUrl;
  window.createImageElement = createImageElement;
  window.updateAvatarElement = updateAvatarElement;
  window.processProfilePhoto = processProfilePhoto;
  window.checkImageExists = checkImageExists;
}

// ========== CONFIGURAÇÃO DA API ==========
const API_CONFIG = {
  baseURL: "http://localhost:5000/api",
  endpoints: {
    ranking: "/ranking",
    top10: "/ranking/top10",
    myPosition: "/ranking/my-position",
    aroundMe: "/ranking/around-me",
    userProfile: "/users/profile",
    userPhoto: "/users",
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
          profilePhoto: userObj.profilePhoto,
          profilePhotoUrl: processProfilePhoto(userObj), // CORRIGIDO: processar foto
          totalDonated: userObj.totalDonated || 0,
          totalReceived: userObj.totalReceived || 0,
        };

        console.log("✅ Dados do usuário processados da API:", processedData);
        console.log(`📝 Nome completo extraído: "${fullName}"`);
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
          profilePhoto: userData.profilePhoto,
          profilePhotoUrl: userData.profilePhotoUrl,
          totalDonated: userData.totalDonated || 0,
          totalReceived: userData.totalReceived || 0,
        };

        console.log("✅ Dados do localStorage processados:", processedData);
        console.log(`📝 Nome completo extraído: "${fullName}"`);
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

// ========== CLASSE PARA GERENCIAR RANKING - VERSÃO TOTALMENTE CORRIGIDA ==========
class RankingManager {
  /**
   * TOTALMENTE CORRIGIDO: Busca dados completos de ranking com fotos da API
   */
  static async getRankingFromAPI() {
    try {
      console.log("Buscando ranking da API...");
      const response = await UserService.makeAuthenticatedRequest(
        `${API_CONFIG.endpoints.ranking}?limit=50&includePhotos=true`
      );

      if (response && response.success !== false) {
        const data = response.data || response;
        console.log("🎯 Dados brutos recebidos da API:", data);

        // Processar usuários com fotos (TOTALMENTE CORRIGIDO)
        let users = data.users || data.ranking || [];
        console.log(`👥 Processando ${users.length} usuários...`);

        users = await Promise.all(
          users.map(async (user) => {
            console.log(
              `\n🔄 Processando usuário: ${user.name || user.displayName}`
            );

            // Validar e limpar dados do usuário
            const cleanUser = {
              ...user,
              name: user.name || user.fullName || user.displayName || "Usuário",
              displayName:
                user.displayName || user.fullName || user.name || "Usuário",
              profilePhotoUrl: null,
            };

            // NOVA LÓGICA: Processar foto usando a função corrigida
            const processedPhotoUrl = processProfilePhoto(user);
            if (processedPhotoUrl) {
              // Verificar se a imagem existe no servidor
              const imageExists = await checkImageExists(processedPhotoUrl);
              if (imageExists) {
                cleanUser.profilePhotoUrl = processedPhotoUrl;
                console.log(
                  `✅ Foto processada e verificada para ${cleanUser.name}: ${processedPhotoUrl}`
                );

                // Cache da foto processada
                if (user._id || user.id) {
                  photoCache.set(user._id || user.id, processedPhotoUrl);
                }
              } else {
                console.log(
                  `❌ Imagem não encontrada no servidor para ${cleanUser.name}`
                );
                photoCache.markFailed(processedPhotoUrl);
              }
            } else {
              console.log(`❌ Nenhuma foto válida para ${cleanUser.name}`);
            }

            return cleanUser;
          })
        );

        const result = {
          users: users,
          totalUsers: data.totalUsers || data.total || 0,
          currentUserRank: data.currentUserRank || data.userRank || 0,
          currentUser: data.currentUser || data.user || null,
        };

        // Processar foto do usuário atual também
        if (result.currentUser) {
          const currentUserPhotoUrl = processProfilePhoto(result.currentUser);
          if (
            currentUserPhotoUrl &&
            (await checkImageExists(currentUserPhotoUrl))
          ) {
            result.currentUser.profilePhotoUrl = currentUserPhotoUrl;
          }
        }

        console.log("✅ Dados de ranking processados com fotos:", result);
        console.log(`📊 Total de usuários: ${result.totalUsers}`);
        console.log(`👤 Posição atual: ${result.currentUserRank}`);

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
   * CORRIGIDO: Busca apenas o top 10 com fotos da API
   */
  static async getTop10FromAPI() {
    try {
      console.log("Buscando top 10 da API...");
      const response = await UserService.makeAuthenticatedRequest(
        `${API_CONFIG.endpoints.top10}?includePhotos=true`
      );

      if (response && response.success !== false) {
        const data = response.data || response;
        let users = data.users || data.top10 || data;

        if (Array.isArray(users) && users.length > 0) {
          // Processar fotos para o top 10 com verificação assíncrona
          users = await Promise.all(
            users.map(async (user) => {
              const cleanUser = {
                ...user,
                name:
                  user.name || user.fullName || user.displayName || "Usuário",
                displayName:
                  user.displayName || user.fullName || user.name || "Usuário",
                profilePhotoUrl: null,
              };

              // Processar foto
              const processedPhotoUrl = processProfilePhoto(user);
              if (
                processedPhotoUrl &&
                (await checkImageExists(processedPhotoUrl))
              ) {
                cleanUser.profilePhotoUrl = processedPhotoUrl;
              }

              return cleanUser;
            })
          );

          console.log("✅ Top 10 obtido com fotos processadas:", users);
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
        console.log("✅ Posição do usuário obtida:", data);
        return data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar posição do usuário:", error);
      return null;
    }
  }

  /**
   * Dados mock para fallback - SEM emojis problemáticos
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
          rank: 8,
          level: "Benfeitor",
          profilePhotoUrl: null,
        },
        {
          name: "Beatriz Alves",
          displayName: "Beatriz Alves",
          balance: 1750,
          coins: 1750,
          rank: 9,
          level: "Aventureiro",
          profilePhotoUrl: null,
        },
        {
          name: "Pedro Santos",
          displayName: "Pedro Santos",
          balance: 1650,
          coins: 1650,
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

      // Ordem do pódium: [2º, 1º, 3º]
      const podiumOrder = [top3[1], top3[0], top3[2]];
      const podiumPositions = ["second", "first", "third"];

      podiumOrder.forEach((user, index) => {
        if (!user) return;

        const podiumItem = document.querySelector(
          `.podium-item.${podiumPositions[index]}`
        );
        if (!podiumItem) return;

        const nameElement = podiumItem.querySelector(".podium-name");
        const balanceElement = podiumItem.querySelector(".podium-balance span");
        const avatarElement = podiumItem.querySelector(".podium-avatar img");

        if (nameElement) {
          nameElement.textContent = user.displayName || user.name;
        }

        if (balanceElement) {
          const balance = user.balance || user.coins || 0;
          balanceElement.textContent = balance.toLocaleString();
        }

        // CORRIGIDO: Atualizar avatar com foto real processada
        if (avatarElement) {
          updateAvatarElement(
            avatarElement,
            user.profilePhotoUrl,
            user.displayName || user.name,
            false
          );
        }
      });

      console.log("✅ Pódium atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar pódium:", error);
      const mockData = this.getMockRankingData();
      this.updatePodiumWithData(mockData.users.slice(0, 3));
    }
  }

  /**
   * CORRIGIDO: Atualiza pódium com dados fornecidos e fotos
   */
  static updatePodiumWithData(top3) {
    const podiumOrder = [top3[1], top3[0], top3[2]];
    const podiumPositions = ["second", "first", "third"];

    podiumOrder.forEach((user, index) => {
      if (!user) return;

      const podiumItem = document.querySelector(
        `.podium-item.${podiumPositions[index]}`
      );
      if (!podiumItem) return;

      const nameElement = podiumItem.querySelector(".podium-name");
      const balanceElement = podiumItem.querySelector(".podium-balance span");
      const avatarElement = podiumItem.querySelector(".podium-avatar img");

      if (nameElement) {
        nameElement.textContent = user.displayName || user.name;
      }

      if (balanceElement) {
        const balance = user.balance || user.coins || 0;
        balanceElement.textContent = balance.toLocaleString();
      }

      // CORRIGIDO: Atualizar avatar com foto
      if (avatarElement) {
        updateAvatarElement(
          avatarElement,
          user.profilePhotoUrl,
          user.displayName || user.name,
          false
        );
      }
    });
  }

  /**
   * TOTALMENTE CORRIGIDO: Atualiza a lista de ranking com fotos reais da API
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

      rankingList.innerHTML = ""; // Limpar lista

      // Obter usuários para mostrar (a partir do 4º lugar)
      const usersToShow = rankingData.users.filter((user) => user.rank >= 4);
      const currentUserId = currentUser?.id;

      console.log(
        `📝 Exibindo ${usersToShow.length} usuários na lista (rank >= 4)`
      );

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

        // CORRIGIDA: Usar foto processada
        const photoUrl = user.profilePhotoUrl;
        console.log(`📸 Foto para ${displayName}: ${photoUrl}`);

        // Criar elemento de imagem com foto processada
        const avatarImg = createImageElement(
          photoUrl,
          displayName,
          50,
          isCurrentUser
        );

        rankItem.innerHTML = `
          <div class="rank-position">${user.rank}</div>
          <div class="rank-avatar ${isCurrentUser ? "highlighted" : ""}">
            ${avatarImg.outerHTML}
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

      // Se não encontrou o usuário logado na lista, adicionar separadamente
      if (
        currentUser &&
        !usersToShow.find(
          (u) => u._id === currentUserId || u.id === currentUserId
        )
      ) {
        // Buscar dados do usuário atual do ranking completo
        const currentUserDataFromRanking = rankingData.users.find(
          (u) => u._id === currentUserId || u.id === currentUserId
        );

        if (currentUserDataFromRanking || rankingData.currentUser) {
          const userToShow =
            currentUserDataFromRanking || rankingData.currentUser;
          const rankItem = document.createElement("div");
          rankItem.classList.add("rank-item", "current-user", "user-in-list");

          const balance = userToShow.balance || userToShow.coins || 0;
          const displayName =
            userToShow.displayName || userToShow.name || "Usuário";

          // Processar foto do usuário atual
          let photoUrl = userToShow.profilePhotoUrl;
          if (!photoUrl && userToShow.profilePhoto) {
            photoUrl = processProfilePhoto(userToShow);
          }

          const avatarImg = createImageElement(photoUrl, displayName, 50, true);

          rankItem.innerHTML = `
            <div class="rank-position">${userToShow.rank}</div>
            <div class="rank-avatar highlighted">
              ${avatarImg.outerHTML}
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
      }

      console.log("✅ Lista de ranking atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar lista de ranking:", error);
      const mockData = this.getMockRankingData();
      const mockUsers = mockData.users.filter((user) => user.rank >= 4);
      this.updateRankingListWithData(mockUsers, mockData);
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

    // CORRIGIDA: Lógica de foto para usuário atual
    let photoToUse = null;
    if (currentUserPhoto && isValidPhotoUrl(currentUserPhoto)) {
      photoToUse = getFullImageUrl(currentUserPhoto);
    } else if (
      currentUser.profilePhotoUrl &&
      isValidPhotoUrl(currentUser.profilePhotoUrl)
    ) {
      photoToUse = currentUser.profilePhotoUrl;
    }

    // Criar elemento de imagem
    const avatarImg = createImageElement(photoToUse, displayName, 50, true);

    rankItem.innerHTML = `
      <div class="rank-position">${rank}</div>
      <div class="rank-avatar highlighted">
        ${avatarImg.outerHTML}
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
   * CORRIGIDO: Atualiza lista com dados fornecidos (fallback) COM FOTOS
   */
  static updateRankingListWithData(users, data = {}) {
    const rankingList = document.querySelector(".ranking-list");
    if (!rankingList) {
      console.warn("Elemento .ranking-list não encontrado");
      return;
    }

    const totalUsersElement = document.querySelector(".total-users");
    if (totalUsersElement) {
      totalUsersElement.textContent = `${
        data.totalUsers || users.length
      } usuários`;
    }

    rankingList.innerHTML = "";

    users.forEach((user) => {
      if (!user) return;

      const rankItem = document.createElement("div");
      rankItem.classList.add("rank-item");

      const balance = user.balance || user.coins || 0;
      const displayName = user.displayName || user.name || "Usuário";
      const photoUrl = user.profilePhotoUrl;

      const avatarImg = createImageElement(photoUrl, displayName, 50, false);

      rankItem.innerHTML = `
        <div class="rank-position">${user.rank}</div>
        <div class="rank-avatar">
          ${avatarImg.outerHTML}
        </div>
        <div class="rank-info">
          <div class="rank-name">${displayName}</div>
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

        // Sempre priorizar nome completo
        const displayName =
          userData.fullName || userData.name || userData.firstName || "Usuário";

        console.log("📝 Dados do usuário para exibição:", {
          fullName: userData.fullName,
          name: userData.name,
          firstName: userData.firstName,
          displayName: displayName,
          balance: userBalance,
          rank: userRank,
          profilePhoto: userData.profilePhoto,
          profilePhotoUrl: userData.profilePhotoUrl,
        });

        // Atualizar card do usuário com NOME COMPLETO
        this.updateElement("user-name", displayName);
        this.updateElement("user-balance", userBalance.toLocaleString());
        this.updateElement("user-position", userRank);

        // CORRIGIDO: Atualizar foto do usuário atual no card
        const userAvatarElement = document.querySelector("[data-user-photo]");
        if (userAvatarElement) {
          const userInitials = getUserInitials(displayName);
          const currentUserPhoto =
            userData.profilePhotoUrl || getCurrentUserPhoto();

          if (currentUserPhoto && isValidPhotoUrl(currentUserPhoto)) {
            const fullPhotoUrl = getFullImageUrl(currentUserPhoto);

            // Verificar se a imagem existe antes de definir
            const imageExists = await checkImageExists(fullPhotoUrl);
            if (imageExists) {
              userAvatarElement.src = fullPhotoUrl;
              userAvatarElement.alt = "Foto do Perfil";
              userAvatarElement.onerror = function () {
                console.warn(
                  "Erro ao carregar foto do usuário atual, usando fallback"
                );
                this.src = `https://placehold.co/50x50/00d4ff/ffffff?text=${encodeURIComponent(
                  userInitials
                )}`;
                this.alt = "Avatar";
                this.onerror = null;
              };
            } else {
              // Imagem não existe, usar placeholder diretamente
              userAvatarElement.src = `https://placehold.co/50x50/00d4ff/ffffff?text=${encodeURIComponent(
                userInitials
              )}`;
              userAvatarElement.alt = "Avatar";
            }
          } else {
            userAvatarElement.src = `https://placehold.co/50x50/00d4ff/ffffff?text=${encodeURIComponent(
              userInitials
            )}`;
            userAvatarElement.alt = "Avatar";
          }
        }

        // Elementos que podem não existir no HTML
        this.safeUpdateElement("user-name-in-list", `${displayName} (Você)`);
        this.safeUpdateElement(
          "user-balance-in-list",
          userBalance.toLocaleString()
        );

        console.log("✅ Interface do usuário atualizada com sucesso");
        console.log(`✅ Nome exibido: "${displayName}"`);
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
   * Atualiza elemento apenas se existir (sem warning)
   */
  static safeUpdateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = content;
      console.log(`✅ Elemento '${elementId}' atualizado: "${content}"`);
    }
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

    const elements = ["user-name", "user-balance", "user-position"];
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
      home: "../../home/html/index.html",
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
        `${API_CONFIG.baseURL.replace("/api", "")}/api/health`,
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
      profilePhoto: null,
      profilePhotoUrl: null,
      registeredAt: new Date().toISOString(),
    };

    const testToken = "test_jwt_token_" + Date.now();

    localStorage.setItem("currentUser", JSON.stringify(testUser));
    localStorage.setItem("token", testToken);
    localStorage.setItem("authToken", testToken);

    console.log("✅ Dados de teste salvos:");
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
      "userProfilePhoto",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Limpar cache de fotos
    photoCache.clear();

    console.log("✅ Dados do usuário limpos");
  }

  static debugInfo() {
    const token = UserService.getAuthToken();
    const isValidToken = UserService.validateToken(token);
    const cacheStats = photoCache.getStats();

    console.log(`
=== SISTEMA DE RANKING - DEBUG INFO ===
📊 API Base: ${API_CONFIG.baseURL}
🔑 Token: ${token ? "Presente" : "Ausente"}
✅ Token Válido: ${isValidToken ? "Sim" : "Não"}
📁 Dados no localStorage: ${localStorage.getItem("currentUser") ? "Sim" : "Não"}
🖼️ Cache de Fotos: ${cacheStats.size}/${cacheStats.maxSize}
❌ URLs que falharam: ${cacheStats.failedUrls}

🛠️ COMANDOS DISPONÍVEIS:
   • testUser() - Cria usuário de teste com token
   • clearData() - Limpa todos os dados salvos
   • checkAPI() - Verifica conexão com API
   • debugInfo() - Mostra informações do sistema
   • forceReload() - Força recarregamento da interface
   • clearPhotoCache() - Limpa cache de fotos
   • debugPhotoProcessing() - Debug do processamento de fotos
   • runDiagnostic() - Executa diagnóstico completo
   
🔧 CLASSES PRINCIPAIS:
   • UserService - Gerencia autenticação e dados do usuário
   • RankingManager - Gerencia dados de ranking COM FOTOS
   • UIManager - Gerencia interface do usuário
   • NavigationManager - Gerencia navegação
   • PhotoCache - Cache de fotos de perfil
   
💡 PRINCIPAIS CORREÇÕES:
   ✅ Verificação assíncrona de existência de imagens
   ✅ Cache melhorado com URLs que falharam
   ✅ Fallback inteligente para placeholders
   ✅ Processamento assíncrono de fotos
   ✅ Melhor tratamento de erros 404
   
💡 DICA: Se imagens não carregam:
   1. Verifique se arquivos existem em /uploads/profiles/
   2. Use debugPhotoProcessing() para testar
   3. Verifique logs do servidor para erros 404
   4. Cache automaticamente usa placeholder se imagem não existe
==========================================
    `);
  }

  static async forceReload() {
    console.log("🔄 Forçando recarregamento da interface...");
    try {
      UIManager.showLoading();
      await UIManager.updateUserInterface();
      console.log("✅ Interface recarregada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao recarregar interface:", error);
      UIManager.showConnectionError();
    }
  }

  static clearPhotoCache() {
    const cleared = photoCache.clear();
    console.log(`🧹 Cache de fotos limpo (${cleared} entradas removidas)`);
    console.log("Cache de URLs falidas também foi limpo");
  }

  static debugPhotoProcessing() {
    console.log("🔍 Testando processamento de fotos...");

    // Simular dados da API como no teste cURL
    const testUsers = [
      {
        name: "Sol Cazzeri",
        profilePhoto: {
          filename: "profile-68b6324b601d026ad790d698-1756770937150.webp",
          path: "/uploads/profiles/profile-68b6324b601d026ad790d698-1756770937150.webp",
          uploadDate: "2025-09-01T23:55:37.318Z",
        },
      },
      {
        name: "Carol Santana",
        profilePhoto: {
          filename: "profile-68b7713053c601a84c025f8a-1757283419454.webp",
          path: "/uploads/profiles/profile-68b7713053c601a84c025f8a-1757283419454.webp",
          uploadDate: "2025-09-07T22:16:59.552Z",
        },
      },
      {
        name: "Usuário Sem Foto",
        profilePhoto: {
          filename: null,
          path: null,
          uploadDate: null,
        },
      },
    ];

    testUsers.forEach(async (user) => {
      console.log(`\n--- Testando: ${user.name} ---`);
      const processedUrl = processProfilePhoto(user);
      console.log(`URL processada: ${processedUrl}`);

      if (processedUrl) {
        const exists = await checkImageExists(processedUrl);
        console.log(`Imagem existe no servidor: ${exists ? "Sim" : "Não"}`);

        if (!exists) {
          console.log(`❌ Arquivo não encontrado: ${processedUrl}`);
          console.log("💡 Será usado placeholder automaticamente");
        }
      }
    });
  }

  static async runDiagnostic() {
    console.log("🔍 Executando diagnóstico completo...");

    const results = {
      token: !!UserService.getAuthToken(),
      tokenValid: UserService.validateToken(UserService.getAuthToken()),
      apiConnection: await Utils.checkAPIConnection(),
      localStorageData: !!localStorage.getItem("currentUser"),
      photoCacheStats: photoCache.getStats(),
      domElements: {
        userCard: !!document.getElementById("user-name"),
        rankingList: !!document.querySelector(".ranking-list"),
        podium: !!document.querySelector(".podium-item"),
        userPhoto: !!document.querySelector("[data-user-photo]"),
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
    if (!results.domElements.userPhoto)
      suggestions.push("⚠️ Elemento de foto do usuário não encontrado");
    if (results.photoCacheStats.failedUrls > 0)
      suggestions.push(
        `⚠️ ${results.photoCacheStats.failedUrls} URLs de imagem falharam - verifique arquivos no servidor`
      );

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
      await UIManager.updateUserInterface();

      console.log("🎉 Aplicação de ranking carregada com sucesso!");
      console.log(
        "📸 Sistema de processamento de fotos com verificação assíncrona ativo!"
      );
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
  window.PhotoCache = PhotoCache;
  window.photoCache = photoCache;

  // Funções de utilidade
  window.testUser = Utils.generateTestUser;
  window.clearData = Utils.clearUserData;
  window.checkAPI = Utils.checkAPIConnection;
  window.debugInfo = Utils.debugInfo;
  window.forceReload = Utils.forceReload;
  window.runDiagnostic = Utils.runDiagnostic;
  window.reinit = RanksApp.reinitialize;
  window.clearPhotoCache = Utils.clearPhotoCache;
  window.debugPhotoProcessing = Utils.debugPhotoProcessing;
}

// ========== FUNÇÕES DE CALLBACK (COMPATIBILIDADE) ==========
window.goBack = NavigationManager.goBack.bind(NavigationManager);
window.goToPage = NavigationManager.goToPage.bind(NavigationManager);
