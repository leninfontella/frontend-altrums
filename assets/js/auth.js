// Módulo de Autenticação Unificado - Living Coins
const Auth = {
  // ========== CONFIGURAÇÃO DA API ==========
  API_BASE: "https://api-backend-coins.onrender.com/api",

  // API_BASE: "http://localhost:5000/api",

  ENDPOINTS: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    profile: "/users/profile",
    balance: "/users/balance",
    updateBalance: "/user/update-balance",
    updateProfile: "/users/profile",
    stats: "/users/stats",
  },

  // ========== CHAVES PARA ARMAZENAMENTO ==========
  STORAGE_KEYS: {
    token: "authToken",
    userData: "userData",
    loginStatus: "isLoggedIn",
    rememberMe: "rememberMe",
    rememberedEmail: "rememberedEmail",
    userBalance: "userBalance",
    loginTimestamp: "loginTimestamp",
    profilePhoto: "userProfilePhoto",
  },

  // ========== CONTROLE DE USUÁRIO ATUAL ==========
  _currentUserId: null,
  _isNewUserRegistration: false,

  // ========== REQUISIÇÕES AUTENTICADAS - CORRIGIDO ==========
  // auth.js
  async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.API_BASE}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      console.log(`Fazendo requisição para: ${endpoint}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // 1. LANÇAMENTO DE ERRO PARA STATUS NÃO-OK (4xx, 5xx)
      if (!response.ok) {
        let errorData = {};
        try {
          // Tenta ler o corpo da resposta para obter a mensagem de erro específica da API
          errorData = await response.json();
        } catch (e) {
          // Se falhar ao ler JSON, usa uma mensagem genérica de erro
          console.error(
            "Falha ao ler corpo da resposta de erro (JSON inválido):",
            e
          );
        }

        // Determina a mensagem de erro a ser exibida/propagada
        let errorMessage = errorData.message || `Erro HTTP ${response.status}`;

        // Tratamento especial para 401 com token (requisições autenticadas)
        // Se for um 401, o fluxo de logout/redirecionamento deve ocorrer.
        if (response.status === 401 && endpoint !== this.ENDPOINTS.login) {
          console.warn("Token expirado ou inválido. Realizando logout.");
          this.logout();
          this.redirectToLogin();
          errorMessage =
            "Token de autenticação expirado. Por favor, faça login novamente.";
        }
        // Tratamento para 5xx (erros internos do servidor)
        else if (response.status >= 500) {
          errorMessage = "Erro no servidor. Tente novamente mais tarde.";
        }

        // LANÇA o erro para que a função chamadora (Auth.login) o intercepte.
        throw new Error(errorMessage);
      }

      console.log(`Requisição bem-sucedida para: ${endpoint}`);
      // Se a requisição foi OK (2xx), retorna o objeto 'Response' para ser lido no chamador
      return response;
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error);

      // 2. TRATAMENTO DE ERROS DE REDE (Failed to fetch, NetworkError)
      if (
        error.message.includes("fetch") ||
        error.name === "TypeError" ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Erro de conexão. Verifique sua internet e se o servidor está rodando."
        );
      }

      // Propaga outros erros (como o Error lançado no bloco 'if (!response.ok)')
      throw error;
    }
  },

  // ========== GERENCIAMENTO DE TOKEN ==========
  getToken() {
    return sessionStorage.getItem(this.STORAGE_KEYS.token);
  },

  setToken(token) {
    if (token) {
      sessionStorage.setItem(this.STORAGE_KEYS.token, token);
      console.log("Token salvo com sucesso");
    }
  },

  removeToken() {
    sessionStorage.removeItem(this.STORAGE_KEYS.token);
    console.log("Token removido");
  },

  // Marcar como novo usuário
  markAsNewUser() {
    this._isNewUserRegistration = true;
    console.log("Marcado como novo usuário - limpeza completa será feita");
  },

  // ========== GERENCIAMENTO DE DADOS DO USUÁRIO ==========
  saveUserData(responseData) {
    try {
      console.log("💾 Salvando dados do usuário:", responseData);

      // Extrair dados baseado em diferentes estruturas possíveis
      let token, user;

      if (responseData.success && responseData.data) {
        token = responseData.data.accessToken || responseData.data.token;
        user = responseData.data.user;
      } else if (responseData.data && responseData.data.user) {
        token = responseData.data.accessToken || responseData.data.token;
        user = responseData.data.user;
      } else if (responseData.user) {
        token = responseData.token || responseData.accessToken;
        user = responseData.user;
      } else {
        token = responseData.token || responseData.accessToken;
        user = responseData;
      }

      // Salvar token
      if (token) {
        this.setToken(token);
      }

      // Processar e salvar dados do usuário
      if (user) {
        // CRÍTICO: Detectar mudança de usuário
        const previousUserId = this._currentUserId;
        const currentUserId = user.id || user._id;

        // Se mudou de usuário, limpar dados antigos primeiro
        if (previousUserId && previousUserId !== currentUserId) {
          console.log("🔄 Mudança de usuário detectada:", {
            anterior: previousUserId,
            atual: currentUserId,
          });
          this.clearUserSpecificData();
        }

        // Atualizar ID do usuário atual
        this._currentUserId = currentUserId;

        // 🔧 CORREÇÃO CRÍTICA: Processar foto de perfil CORRETAMENTE
        let profilePhotoUrl =
          user.profilePhotoUrl || user.profilePhoto?.path || null;

        console.log("🖼️ Foto recebida da API:", {
          profilePhotoUrl: user.profilePhotoUrl,
          profilePhotoPath: user.profilePhoto?.path,
          profilePhotoStorage: user.profilePhoto?.storage,
          avatar: user.avatar,
        });

        // 🔧 VALIDAÇÃO: Apenas remover se for emoji ou caractere inválido
        if (profilePhotoUrl && typeof profilePhotoUrl === "string") {
          // Detectar emojis e caracteres inválidos
          const hasInvalidChars =
            profilePhotoUrl.includes("👤") ||
            profilePhotoUrl.includes("�") ||
            /[\u{1F300}-\u{1F9FF}]/u.test(profilePhotoUrl);

          if (hasInvalidChars) {
            console.warn(
              "⚠️ Caractere inválido detectado na foto, resetando para null"
            );
            profilePhotoUrl = null;
          } else if (!profilePhotoUrl.startsWith("http")) {
            // Se não começar com http, pode ser path relativo - validar
            console.warn("⚠️ URL sem protocolo detectada:", profilePhotoUrl);
            profilePhotoUrl = null;
          } else {
            console.log("✅ URL de foto válida:", profilePhotoUrl);
          }
        }

        // 🔧 NOVO: Para novos registros, NÃO limpar foto se vier da API
        if (this._isNewUserRegistration) {
          console.log("📝 Novo usuário: usando foto da API (se houver)");
          // Manter profilePhotoUrl como está (null ou URL válida)
        }

        const userInfo = {
          id: user.id || user._id,
          name: user.name || user.fullName,
          email: user.email,
          balance: user.coins || user.balance || 0,
          coins: user.coins || user.balance || 0,
          level: user.level || 1,
          avatar: user.avatar, // Emoji para fallback
          totalDonated: user.totalDonated || 0,
          totalReceived: user.totalReceived || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profilePhotoUrl: profilePhotoUrl, // 🔧 URL válida ou null
          phone: user.phone || "",
          cpf: user.cpf || user.document || "",
        };

        console.log("📦 Dados processados:", {
          name: userInfo.name,
          email: userInfo.email,
          profilePhotoUrl: userInfo.profilePhotoUrl,
          hasValidPhoto: !!userInfo.profilePhotoUrl,
        });

        // 🔧 CORREÇÃO: Salvar foto separadamente APENAS se válida e diferente
        const currentSavedPhoto = localStorage.getItem(
          this.STORAGE_KEYS.profilePhoto
        );

        if (userInfo.profilePhotoUrl) {
          // Salvar APENAS se mudou
          if (currentSavedPhoto !== userInfo.profilePhotoUrl) {
            localStorage.setItem(
              this.STORAGE_KEYS.profilePhoto,
              userInfo.profilePhotoUrl
            );
            console.log("✅ Foto de perfil salva:", userInfo.profilePhotoUrl);
          } else {
            console.log("ℹ️ Foto de perfil já está salva (sem mudanças)");
          }
        } else {
          // 🔧 CRÍTICO: NÃO remover foto se já existe uma salva válida
          if (currentSavedPhoto && currentSavedPhoto.startsWith("http")) {
            console.log(
              "⚠️ API não retornou foto, mas existe foto salva válida - MANTENDO"
            );
            userInfo.profilePhotoUrl = currentSavedPhoto;
          } else {
            // Remover foto antiga apenas se não for válida
            localStorage.removeItem(this.STORAGE_KEYS.profilePhoto);
            console.log("🗑️ Foto de perfil removida (sem foto válida)");
          }
        }

        // Salvar dados individuais para acesso rápido
        sessionStorage.setItem("userName", userInfo.name || "");
        sessionStorage.setItem("userEmail", userInfo.email || "");
        sessionStorage.setItem("userId", userInfo.id || "");
        sessionStorage.setItem(
          this.STORAGE_KEYS.userBalance,
          userInfo.balance.toString()
        );
        sessionStorage.setItem("userLevel", userInfo.level.toString());

        // Salvar no localStorage para persistência (dados completos)
        localStorage.setItem(
          this.STORAGE_KEYS.userData,
          JSON.stringify(userInfo)
        );

        // Manter no sessionStorage também (compatibilidade)
        sessionStorage.setItem(
          this.STORAGE_KEYS.userData,
          JSON.stringify(userInfo)
        );

        // COMPATIBILIDADE: Salvar também em formatos que ranks.js espera
        localStorage.setItem("currentUser", JSON.stringify(userInfo));
        sessionStorage.setItem("currentUser", JSON.stringify(userInfo));

        console.log("✅ Dados salvos com sucesso!");
      }

      // Marcar como logado
      sessionStorage.setItem(this.STORAGE_KEYS.loginStatus, "true");
      sessionStorage.setItem(
        this.STORAGE_KEYS.loginTimestamp,
        Date.now().toString()
      );

      // Reset da flag de novo usuário
      this._isNewUserRegistration = false;

      return true;
    } catch (error) {
      console.error("❌ Erro ao salvar dados do usuário:", error);
      return false;
    }
  },

  getUserData() {
    try {
      // Tentar localStorage primeiro para dados persistentes
      let userData = localStorage.getItem(this.STORAGE_KEYS.userData);
      if (!userData) {
        userData = sessionStorage.getItem(this.STORAGE_KEYS.userData);
      }

      if (userData) {
        const parsedData = JSON.parse(userData);

        // 🔧 SEMPRE verificar se existe foto salva separadamente
        const separatePhotoUrl = localStorage.getItem(
          this.STORAGE_KEYS.profilePhoto
        );

        if (separatePhotoUrl && separatePhotoUrl.startsWith("http")) {
          // 🔧 CORREÇÃO: Sempre priorizar foto salva se for válida
          parsedData.profilePhotoUrl = separatePhotoUrl;
          console.log("📸 Foto restaurada do storage:", separatePhotoUrl);
        } else if (!parsedData.profilePhotoUrl && separatePhotoUrl) {
          // Se não há foto no userData mas há no storage separado, usar
          parsedData.profilePhotoUrl = separatePhotoUrl;
          console.log(
            "📸 Foto restaurada do storage separado:",
            separatePhotoUrl
          );
        }

        return parsedData;
      }

      return null;
    } catch (error) {
      console.error("❌ Erro ao obter dados do usuário:", error);
      return null;
    }
  },

  getUserBalance() {
    return parseInt(
      sessionStorage.getItem(this.STORAGE_KEYS.userBalance) || "0"
    );
  },

  updateUserBalance(newBalance) {
    sessionStorage.setItem(
      this.STORAGE_KEYS.userBalance,
      newBalance.toString()
    );

    // Atualizar também no objeto userData (tanto localStorage quanto sessionStorage)
    const userData = this.getUserData();
    if (userData) {
      userData.balance = newBalance;
      userData.coins = newBalance; // Manter compatibilidade

      // Atualizar em ambos os storages
      localStorage.setItem(
        this.STORAGE_KEYS.userData,
        JSON.stringify(userData)
      );
      sessionStorage.setItem(
        this.STORAGE_KEYS.userData,
        JSON.stringify(userData)
      );

      // COMPATIBILIDADE: Atualizar também currentUser
      localStorage.setItem("currentUser", JSON.stringify(userData));
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
    }

    console.log(`Saldo atualizado para: ${newBalance}`);
  },

  // FUNÇÃO MELHORADA: Atualizar foto de perfil
  updateProfilePhoto(photoUrl, skipEvent = false) {
    console.log("Atualizando foto de perfil:", photoUrl);

    // Verificar se já está sendo processada (evitar loop)
    if (this._updatingProfilePhoto) {
      console.warn("updateProfilePhoto já está em execução, evitando loop");
      return;
    }

    // Marcar como em processamento
    this._updatingProfilePhoto = true;

    try {
      // 1. Salvar foto separadamente (persistência garantida)
      if (photoUrl) {
        localStorage.setItem(this.STORAGE_KEYS.profilePhoto, photoUrl);
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.profilePhoto);
      }

      // 2. Atualizar nos dados do usuário
      const userData = this.getUserData();
      if (userData) {
        userData.profilePhotoUrl = photoUrl;

        // Salvar em todos os formatos
        localStorage.setItem(
          this.STORAGE_KEYS.userData,
          JSON.stringify(userData)
        );
        sessionStorage.setItem(
          this.STORAGE_KEYS.userData,
          JSON.stringify(userData)
        );
        localStorage.setItem("currentUser", JSON.stringify(userData));
        sessionStorage.setItem("currentUser", JSON.stringify(userData));

        console.log("Foto de perfil atualizada em todos os storages");

        // 3. Disparar evento para sincronização (apenas se não for chamada interna)
        if (!skipEvent) {
          window.dispatchEvent(
            new CustomEvent("profilePhotoUpdated", {
              detail: { photoUrl },
            })
          );
        }
      }
    } finally {
      // Sempre limpar o flag, mesmo se der erro
      this._updatingProfilePhoto = false;
    }
  },

  // NOVA FUNÇÃO: Obter apenas a foto de perfil
  getProfilePhoto() {
    // Prioridade: 1º storage separado, 2º userData
    const separatePhoto = localStorage.getItem(this.STORAGE_KEYS.profilePhoto);
    if (separatePhoto) {
      return separatePhoto;
    }

    const userData = this.getUserData();
    return userData?.profilePhotoUrl || null;
  },

  // ========== VERIFICAÇÃO DE AUTENTICAÇÃO ==========
  isLoggedIn() {
    const isLoggedIn =
      sessionStorage.getItem(this.STORAGE_KEYS.loginStatus) === "true";
    const token = this.getToken();
    return isLoggedIn && token;
  },

  checkSession() {
    if (!this.isLoggedIn()) {
      return false;
    }

    // Verificar expiração da sessão (24 horas)
    const loginTimestamp = sessionStorage.getItem(
      this.STORAGE_KEYS.loginTimestamp
    );
    if (loginTimestamp) {
      const now = Date.now();
      const loginTime = parseInt(loginTimestamp);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas

      if (now - loginTime > sessionDuration) {
        console.log("Sessão expirada por tempo");
        this.logout();
        return false;
      }
    }

    return true;
  },

  redirectToLogin() {
    // Detectar estrutura do projeto automaticamente
    const currentPath = window.location.pathname;
    let redirectPath;

    // Se Auth.js está em /js/ global
    if (currentPath.includes("/home/html/")) {
      redirectPath = "/index.html";
    } else if (currentPath.includes("/profile/html/")) {
      redirectPath = "/index.html";
    } else if (currentPath.includes("/ranking/html/")) {
      redirectPath = "/index.html";
    } else {
      // Fallback padrão
      redirectPath = "/index.html";
    }

    window.location.href = redirectPath;
  },

  redirectToDashboard() {
    // Detectar estrutura do projeto automaticamente
    const currentPath = window.location.pathname;
    let redirectPath;

    // Se Auth.js está em /js/ global
    if (currentPath.includes("/login/html/")) {
      redirectPath = "../../../home/html/index.html";
    } else {
      // Fallback padrão
      redirectPath = "../../home/html/index.html";
    }

    window.location.href = redirectPath;
  },

  // ========== AUTENTICAÇÃO (LOGIN/REGISTER) ==========
  async login(email, password, rememberMe = false) {
    try {
      console.log(`Tentativa de login para: ${email}`);

      this.clearUserSpecificData();

      const response = await this.makeRequest(this.ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response) {
        throw new Error("Falha na comunicação com servidor");
      }

      const data = await response.json();

      if (data.success && data.data) {
        this.saveUserData(data);
        this.saveRememberMe(email, rememberMe);

        console.log("Login realizado com sucesso");
        return { success: true, data: data };
      } else {
        // 🔧 CORREÇÃO: Lançar erros específicos
        const errorMessage = data.message || "Credenciais inválidas";
        const errorLower = errorMessage.toLowerCase();

        if (
          errorLower.includes("senha") ||
          errorLower.includes("password") ||
          errorLower.includes("incorrect") ||
          errorLower.includes("wrong")
        ) {
          throw new Error("Senha incorreta!");
        } else if (
          errorLower.includes("usuário") ||
          errorLower.includes("user") ||
          errorLower.includes("email") ||
          errorLower.includes("not found") ||
          errorLower.includes("não encontrado")
        ) {
          throw new Error("E-mail não encontrado ou não cadastrado");
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error("Erro de conexão. Verifique sua internet.");
      }

      throw error;
    }
  },

  async register(userData) {
    try {
      console.log("Tentativa de registro para:", userData.email);

      // CRÍTICO: Marcar como novo usuário ANTES do registro
      this.markAsNewUser();

      // Limpar dados antigos ANTES de registrar
      this.clearAllData();

      const response = await this.makeRequest(this.ENDPOINTS.register, {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (!response) {
        throw new Error("Falha na comunicação com servidor");
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Salvar dados do novo usuário
        this.saveUserData(data);

        console.log(
          "Registro realizado com sucesso - Usuário recebeu 100 moedas!"
        );
        return { success: true, data: data };
      } else {
        throw new Error(data.message || "Erro no registro");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      // Reset da flag em caso de erro
      this._isNewUserRegistration = false;
      throw error;
    }
  },

  async logout() {
    try {
      // Tentar fazer logout no servidor
      if (this.getToken()) {
        await this.makeRequest(this.ENDPOINTS.logout, {
          method: "POST",
        }).catch((error) => {
          console.warn("Erro ao fazer logout no servidor:", error.message);
        });
      }
    } catch (error) {
      console.warn("Erro no logout do servidor, continuando logout local");
    } finally {
      // Limpar dados locais
      this.clearAllData();
      console.log("Logout realizado");
    }
  },

  // NOVA FUNÇÃO: Limpar apenas dados específicos do usuário (para troca)
  clearUserSpecificData() {
    console.log("🧹 Limpando dados específicos do usuário atual...");

    // Limpar dados do sessionStorage
    const sessionKeys = [
      "userName",
      "userEmail",
      "userId",
      "userLevel",
      this.STORAGE_KEYS.userBalance,
      this.STORAGE_KEYS.userData,
      "currentUser",
    ];

    sessionKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Limpar dados do localStorage (EXCETO foto de perfil)
    localStorage.removeItem(this.STORAGE_KEYS.userData);
    localStorage.removeItem("currentUser");
    // ADICIONE ESTA LINHA PARA GARANTIR A LIMPEZA DA FOTO
    localStorage.removeItem(this.STORAGE_KEYS.profilePhoto);

    console.log("✅ Dados específicos limpos (incluindo foto local)");

    // 🔧 CRÍTICO: NÃO limpar foto de perfil aqui
    console.log("✅ Dados específicos limpos (foto preservada)");
  },

  // FUNÇÃO CORRIGIDA: Limpar todos os dados
  clearAllData() {
    console.log("🧹 Limpando todos os dados...");

    const isNewUserRegistration = this._isNewUserRegistration || false;

    if (isNewUserRegistration) {
      // Para novos usuários, limpar TUDO incluindo foto de perfil
      console.log("🆕 Novo usuário detectado - limpeza completa");

      Object.values(this.STORAGE_KEYS).forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });

      this._isNewUserRegistration = false;
    } else {
      // 🔧 CRÍTICO: Para logout normal, PRESERVAR foto de perfil
      const currentPhoto = this.getProfilePhoto();
      console.log("📸 Foto atual antes da limpeza:", currentPhoto);

      Object.values(this.STORAGE_KEYS).forEach((key) => {
        if (key !== this.STORAGE_KEYS.profilePhoto) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      });

      // 🔧 Restaurar foto de perfil após limpeza
      if (currentPhoto && currentPhoto.startsWith("http")) {
        localStorage.setItem(this.STORAGE_KEYS.profilePhoto, currentPhoto);
        console.log("✅ Foto de perfil preservada:", currentPhoto);
      }
    }

    // Limpar dados específicos do sessionStorage
    const sessionKeys = [
      "userName",
      "userEmail",
      "userId",
      "userLevel",
      "userBalance",
      "currentUser",
    ];

    sessionKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    // Limpar userData do localStorage
    localStorage.removeItem(this.STORAGE_KEYS.userData);
    localStorage.removeItem("currentUser");

    // Reset do controle de usuário atual
    this._currentUserId = null;

    console.log(
      "✅ Limpeza completa realizada (foto preservada se logout normal)"
    );
  },

  // ========== PERFIL E SALDO ==========
  async getProfile() {
    try {
      const response = await this.makeRequest(this.ENDPOINTS.profile);

      if (!response) return null;

      const data = await response.json();

      if (data.success && data.data) {
        const userData = data.data.user || data.data;

        console.log("📥 Perfil recebido da API:", {
          name: userData.name,
          email: userData.email,
          profilePhotoUrl: userData.profilePhotoUrl,
          profilePhotoStorage: userData.profilePhoto?.storage,
        });

        // 🔧 CRÍTICO: NÃO sobrescrever foto local se API não retornar
        const existingPhoto = this.getProfilePhoto();

        if (
          !userData.profilePhotoUrl &&
          existingPhoto &&
          existingPhoto.startsWith("http")
        ) {
          console.log(
            "⚠️ API não retornou foto, mas existe foto local válida - PRESERVANDO"
          );
          userData.profilePhotoUrl = existingPhoto;
        } else if (userData.profilePhotoUrl) {
          console.log("✅ Foto recebida da API:", userData.profilePhotoUrl);
        }

        // Salvar dados atualizados
        this.saveUserData({
          success: true,
          data: {
            user: userData,
            accessToken: this.getToken(),
          },
        });

        return userData;
      } else {
        throw new Error(data.message || "Erro ao buscar perfil");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar perfil:", error);
      throw error;
    }
  },

  async getBalance() {
    try {
      const response = await this.makeRequest(this.ENDPOINTS.balance);

      if (!response) return null;

      const data = await response.json();

      if (data.success) {
        // Backend retorna 'coins' não 'balance'
        const balance =
          data.coins || data.data?.coins || data.balance || data.data?.balance;

        if (balance !== undefined) {
          this.updateUserBalance(balance);
          return balance;
        } else {
          console.warn("Resposta não contém saldo:", data);
          return this.getUserBalance(); // Fallback para saldo local
        }
      } else {
        throw new Error(data.message || "Erro ao buscar saldo");
      }
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      // Retornar saldo local como fallback
      return this.getUserBalance();
    }
  },

  async updateBalance(amount, type = "add", description = "") {
    try {
      const response = await this.makeRequest(this.ENDPOINTS.updateBalance, {
        method: "POST",
        body: JSON.stringify({
          amount: type === "subtract" ? -Math.abs(amount) : Math.abs(amount),
          operation: type,
          description,
        }),
      });

      if (!response) return null;

      const data = await response.json();

      if (data.success && data.data) {
        const newBalance = data.data.coins || data.data.balance;
        this.updateUserBalance(newBalance);
        return { success: true, balance: newBalance };
      } else {
        throw new Error(data.message || "Erro ao atualizar saldo");
      }
    } catch (error) {
      console.error("Erro ao atualizar saldo:", error);
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await this.makeRequest(this.ENDPOINTS.updateProfile, {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      if (!response) return null;

      const data = await response.json();

      // Aceitar tanto { user } quanto { data: { user } }
      const updatedUser = data.user || data.data?.user || data.data;

      if (data.success && updatedUser) {
        // Atualizar foto separadamente, se necessário
        if (updatedUser.profilePhotoUrl) {
          this.updateProfilePhoto(updatedUser.profilePhotoUrl);
        }

        // Atualizar e persistir os dados
        this.saveUserData({
          success: true,
          data: {
            user: updatedUser,
            accessToken: this.getToken(),
          },
        });

        return { success: true, user: updatedUser };
      } else {
        throw new Error(data.message || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await this.makeRequest(this.ENDPOINTS.stats);

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(
          data.message || "Erro ao buscar dados do usuário na API"
        );
      }

      return {
        totalEarned: data.data.coins || 0,
        totalDonated: data.data.totalDonated || 0,
        totalReceived: data.data.totalReceived || 0,
        bonusCoins: Math.floor(Math.random() * 200), // Simulado
        monthlyCoins: Math.floor(Math.random() * 300), // Simulado
        level: data.data.level || 1,
        donationRank: data.data.donationRank,
        coinsRank: data.data.coinsRank,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw error;
    }
  },

  // ========== LEMBRE-SE DE MIM ==========
  saveRememberMe(email, remember) {
    if (remember) {
      localStorage.setItem(this.STORAGE_KEYS.rememberMe, "true");
      localStorage.setItem(this.STORAGE_KEYS.rememberedEmail, email);
    } else {
      localStorage.removeItem(this.STORAGE_KEYS.rememberMe);
      localStorage.removeItem(this.STORAGE_KEYS.rememberedEmail);
    }
  },

  getRememberedEmail() {
    const remember =
      localStorage.getItem(this.STORAGE_KEYS.rememberMe) === "true";
    const email = localStorage.getItem(this.STORAGE_KEYS.rememberedEmail);
    return remember ? email : null;
  },

  shouldRememberMe() {
    return localStorage.getItem(this.STORAGE_KEYS.rememberMe) === "true";
  },

  // Método para força limpeza completa (Útil para debug)
  forceCleanAll() {
    console.log("LIMPEZA FORÇADA - Removendo TODOS os dados...");

    // Limpar TODO o sessionStorage
    sessionStorage.clear();

    // Limpar dados específicos do localStorage (incluindo foto)
    const localStorageKeysToRemove = [
      "currentUser",
      "authToken",
      "userData",
      "isLoggedIn",
      "userBalance",
      "loginTimestamp",
      "userProfilePhoto", // Agora remove a foto na limpeza forçada
      "rememberMe",
      "rememberedEmail",
    ];

    localStorageKeysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`Removido localStorage: ${key}`);
    });

    // Reset do controle
    this._currentUserId = null;
    this._isNewUserRegistration = false;

    console.log("LIMPEZA FORÇADA COMPLETA!");
  },

  // Obter URL do endpoint (compatibilidade com CONFIG)
  getEndpointURL(endpointName) {
    return this.ENDPOINTS[endpointName] || endpointName;
  },

  // Verificar conectividade
  isOnline() {
    return navigator.onLine;
  },

  // Obter informações básicas do usuário para exibição
  getDisplayInfo() {
    const userData = this.getUserData();
    return {
      name: userData?.name || sessionStorage.getItem("userName") || "Usuário",
      email: userData?.email || sessionStorage.getItem("userEmail") || "",
      balance: this.getUserBalance(),
      level:
        userData?.level || parseInt(sessionStorage.getItem("userLevel")) || 1,
      avatar: userData?.avatar || null,
      profilePhotoUrl: this.getProfilePhoto(), // Usar função específica
    };
  },
};

// ========== AUTO-INICIALIZAÇÃO ==========
document.addEventListener("DOMContentLoaded", function () {
  // Redirecionar usuários logados se estiverem na página de login
  if (window.location.pathname.includes("login") && Auth.isLoggedIn()) {
    console.log("Usuário já logado, redirecionando para dashboard");
    Auth.redirectToDashboard();
    return;
  }

  // Verificar sessão em páginas que precisam de autenticação
  const protectedPages = ["/home/", "/profile/", "/ranking/", "/timeline/"];
  const currentPath = window.location.pathname;

  if (protectedPages.some((page) => currentPath.includes(page))) {
    if (!Auth.checkSession()) {
      console.log("Sessão inválida, redirecionando para login");
      Auth.redirectToLogin();
      return;
    }
    console.log("Sessão válida");
  }
});

// ========== INTERCEPTADORES GLOBAIS ==========

// Detectar mudanças de conectividade
window.addEventListener("online", () => {
  console.log("Conexão restaurada");
});

window.addEventListener("offline", () => {
  console.log("Conexão perdida");
});

// Interceptar erros não capturados
window.addEventListener("unhandledrejection", (event) => {
  if (
    event.reason?.message?.includes("401") ||
    event.reason?.message?.includes("Token")
  ) {
    console.warn("Token expirado detectado globalmente");
    Auth.logout();
    Auth.redirectToLogin();
  }
});

// Detectar mudanças no localStorage (troca de usuário)
window.addEventListener("storage", function (event) {
  if (event.key === "authToken" || event.key === "userData") {
    console.log("Mudança de dados de autenticação detectada");
    // Disparar evento customizado
    window.dispatchEvent(
      new CustomEvent("userChanged", {
        detail: {
          key: event.key,
          newValue: event.newValue,
          oldValue: event.oldValue,
        },
      })
    );
  }
});

// ========== EXPORTAÇÃO ==========

// Exportar Auth para uso global
if (typeof module !== "undefined" && module.exports) {
  module.exports = Auth;
} else {
  window.Auth = Auth;
}

console.log(
  "Módulo Auth unificado carregado com correção de múltiplos usuários!"
);

// ========== COMPATIBILIDADE COM CONFIG ==========

// Criar objeto CONFIG se não existir (para compatibilidade com código existente)
if (typeof window !== "undefined" && !window.CONFIG) {
  window.CONFIG = {
    AUTH: {
      tokenKey: Auth.STORAGE_KEYS.token,
      userDataKey: Auth.STORAGE_KEYS.userData,
      loginStatusKey: Auth.STORAGE_KEYS.loginStatus,
      rememberMeKey: Auth.STORAGE_KEYS.rememberMe,
      rememberedEmailKey: Auth.STORAGE_KEYS.rememberedEmail,
    },
    UI: {
      pages: {
        login: "/index.html",
        dashboard: "../../home/html/index.html",
      },
    },
    getEndpointURL: (endpoint) => Auth.getEndpointURL(endpoint),
  };
}
