// Configuração unificada da API - Living Coins - Otimizada para Mobile
class ApiConfig {
  constructor() {
    this.baseURL = this.detectApiBaseURL();
    this.timeout = this.detectTimeout(); // Timeout dinâmico baseado no dispositivo
    this.token = this.getAuthToken();
    this.isMobile = this.detectMobileDevice();
    this.retryAttempts = this.isMobile ? 3 : 2; // Mais tentativas em mobile
    this.retryDelay = this.isMobile ? 1000 : 500; // Delay maior em mobile
  }

  // 📱 NOVA FUNÇÃO: Detectar dispositivos móveis
  detectMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // 📱 NOVA FUNÇÃO: Timeout dinâmico baseado no dispositivo
  detectTimeout() {
    // Mobile: timeout maior devido a conexões mais lentas
    return this.detectMobileDevice() ? 45000 : 30000; // 45s mobile, 30s desktop
  }

  // Auto-detecção da URL base da API
  detectApiBaseURL() {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;

    // Se estamos em desenvolvimento local
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      if (window.location.port === "5500") {
        return `${currentProtocol}//${currentHost}:5000`;
      }
      return `${currentProtocol}//${currentHost}:${
        window.location.port || (currentProtocol === "https:" ? "443" : "80")
      }`;
    }

    // CORREÇÃO CRÍTICA: Forçar a URL correta da API em produção
    return "https://api-backend-coins.onrender.com";
  }

  // Obter token de autenticação de múltiplas fontes
  getAuthToken() {
    // Tentar Auth global primeiro
    if (typeof Auth !== "undefined" && Auth?.getToken) {
      const token = Auth.getToken();
      if (token) {
        console.log("Token obtido via Auth global");
        return token;
      }
    }

    // Tentar obter de várias fontes possíveis
    const sources = [
      () => localStorage.getItem("authToken"),
      () => localStorage.getItem("token"),
      () => localStorage.getItem("accessToken"),
      () => sessionStorage.getItem("authToken"),
      () => sessionStorage.getItem("token"),
      () => {
        // Tentar extrair do userData
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            return parsed.token || parsed.authToken || parsed.accessToken;
          } catch (e) {
            return null;
          }
        }
        return null;
      },
      () => {
        // Verificar cookies
        const cookieValue = document.cookie
          .split("; ")
          .find(
            (row) => row.startsWith("authToken=") || row.startsWith("token=")
          );
        return cookieValue ? cookieValue.split("=")[1] : null;
      },
    ];

    for (const getToken of sources) {
      const token = getToken();
      if (token) {
        console.log("Token encontrado:", token.substring(0, 20) + "...");
        return token;
      }
    }

    console.warn("Nenhum token de autenticação encontrado");
    return null;
  }

  // Atualizar token
  setAuthToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  // Remover token
  clearAuthToken() {
    this.token = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");

    // Limpar cookies
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  // Headers padrão para requisições JSON
  getDefaultHeaders() {
    const headers = {
      Accept: "application/json",
    };

    // 📱 MOBILE: Headers específicos para mobile
    if (this.isMobile) {
      headers["X-Mobile-Device"] = "true";
      headers["X-Connection-Type"] = this.getConnectionType();
    }

    // Reobter token mais recente
    if (!this.token) {
      this.token = this.getAuthToken();
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Headers para FormData (sem Content-Type)
  getFormDataHeaders() {
    const headers = {
      Accept: "application/json",
    };

    // 📱 MOBILE: Headers específicos para mobile
    if (this.isMobile) {
      headers["X-Mobile-Device"] = "true";
      headers["X-Connection-Type"] = this.getConnectionType();
    }

    // Reobter token mais recente
    if (!this.token) {
      this.token = this.getAuthToken();
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // 📱 NOVA FUNÇÃO: Detectar tipo de conexão (mobile)
  getConnectionType() {
    if (!this.isMobile) return "unknown";

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      return connection.effectiveType || connection.type || "unknown";
    }
    return "unknown";
  }

  // 📱 NOVA FUNÇÃO: Verificar se a conexão é lenta
  isSlowConnection() {
    if (!this.isMobile) return false;

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      return (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      );
    }
    return false;
  }

  // 📱 FUNÇÃO MELHORADA: Método para tratar respostas e erros globalmente
  async handleResponse(response) {
    // Se não autenticado (401), redirecionar para login
    if (response.status === 401) {
      console.warn("Token expirado ou inválido - redirecionando para login");

      // Limpar dados de autenticação
      this.clearAuthToken();

      // Tentar usar Auth global se disponível
      if (typeof Auth !== "undefined") {
        Auth.logout?.();
        Auth.redirectToLogin?.();
      } else {
        // Fallback: redirecionar para página de login
        window.location.href = "/index.html";
      }

      throw new Error("Sessão expirada. Redirecionando para login...");
    }

    // Se rate limit (429), mostrar mensagem específica
    if (response.status === 429) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Muitas requisições" }));

      // 📱 MOBILE: Delay maior para rate limit em mobile
      if (this.isMobile) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        console.log(`📱 Mobile: Rate limit - aguardando ${delay}ms`);
        await this.sleep(delay);
      }

      throw new Error(
        errorData.message ||
          "Muitas requisições. Tente novamente em alguns minutos."
      );
    }

    // 📱 MOBILE: Tratamento específico para timeouts
    if (response.status === 408 || response.status === 504) {
      console.warn("📱 Timeout detectado em mobile");
      throw new Error("Conexão lenta detectada. Tente novamente.");
    }

    return response;
  }

  // 📱 NOVA FUNÇÃO: Sleep utility para delays
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 📱 FUNÇÃO MELHORADA: Método principal para fazer requisições com retry
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    };

    // Adicionar token de autorização se disponível
    if (!this.token) {
      this.token = this.getAuthToken();
    }

    if (this.token) {
      defaultOptions.headers.Authorization = `Bearer ${this.token}`;
    }

    // 📱 MOBILE: Headers específicos
    if (this.isMobile) {
      defaultOptions.headers["X-Mobile-Device"] = "true";
      defaultOptions.headers["X-Connection-Type"] = this.getConnectionType();
    }

    // Se não é FormData, adicionar Content-Type
    if (options.body && !(options.body instanceof FormData)) {
      defaultOptions.headers["Content-Type"] = "application/json";
    }

    const finalOptions = { ...defaultOptions, ...options };

    console.log("Fazendo requisição para:", url);
    console.log("Method:", finalOptions.method || "GET");
    if (this.isMobile) {
      console.log("📱 Mobile request - Connection:", this.getConnectionType());
    }

    // 📱 MOBILE: Sistema de retry mais robusto
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...finalOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Usar o handleResponse para tratar erros globalmente
        await this.handleResponse(response);

        return response;
      } catch (error) {
        console.warn(
          `📱 Tentativa ${attempt}/${this.retryAttempts} falhou:`,
          error.message
        );

        // Se é o último attempt ou erro não é de rede, throw
        if (attempt === this.retryAttempts || !this.isNetworkError(error)) {
          if (error.name === "AbortError") {
            throw new Error("Requisição expirou. Verifique sua conexão.");
          }
          throw error;
        }

        // 📱 MOBILE: Aguardar antes da próxima tentativa
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * attempt; // Delay crescente
          console.log(`📱 Aguardando ${delay}ms antes da próxima tentativa...`);
          await this.sleep(delay);
        }
      }
    }
  }

  // 📱 NOVA FUNÇÃO: Verificar se é erro de rede
  isNetworkError(error) {
    return (
      error.name === "AbortError" ||
      (error.name === "TypeError" && error.message.includes("fetch")) ||
      error.message.includes("Network") ||
      error.message.includes("timeout") ||
      error.message.includes("connection")
    );
  }

  // Método GET
  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      method: "GET",
      headers: this.getDefaultHeaders(),
      ...options,
    });

    return response;
  }

  // Método POST
  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;

    const response = await this.request(endpoint, {
      method: "POST",
      headers: isFormData
        ? this.getFormDataHeaders()
        : {
            ...this.getDefaultHeaders(),
            "Content-Type": "application/json",
          },
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });

    return response;
  }

  // Método PUT
  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;

    const response = await this.request(endpoint, {
      method: "PUT",
      headers: isFormData
        ? this.getFormDataHeaders()
        : {
            ...this.getDefaultHeaders(),
            "Content-Type": "application/json",
          },
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });

    return response;
  }

  // Método DELETE
  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      method: "DELETE",
      headers: this.getDefaultHeaders(),
      ...options,
    });

    return response;
  }

  // 📱 MÉTODO MELHORADO: Upload de arquivo com progresso otimizado para mobile
  async uploadFile(endpoint, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Configurar headers
      if (!this.token) {
        this.token = this.getAuthToken();
      }

      if (this.token) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.token}`);
      }

      // 📱 MOBILE: Headers específicos
      if (this.isMobile) {
        xhr.setRequestHeader("X-Mobile-Device", "true");
        xhr.setRequestHeader("X-Connection-Type", this.getConnectionType());
      }

      // Progress callback otimizado para mobile
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;

            // 📱 MOBILE: Throttle do callback de progresso para economizar recursos
            if (this.isMobile) {
              this.throttledProgress =
                this.throttledProgress || this.throttle(onProgress, 200);
              this.throttledProgress(percentComplete);
            } else {
              onProgress(percentComplete);
            }
          }
        });
      }

      // Response handlers
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);

            // 📱 MOBILE: Log específico para mobile
            if (this.isMobile) {
              console.log("📱 Upload mobile concluído com sucesso");
            }

            resolve(response);
          } catch (e) {
            resolve({ success: true, message: "Upload concluído" });
          }
        } else if (xhr.status === 401) {
          console.warn("Token expirado durante upload");
          this.clearAuthToken();

          if (typeof Auth !== "undefined") {
            Auth.logout?.();
            Auth.redirectToLogin?.();
          } else {
            window.location.href = "/index.html";
          }

          reject(new Error("Sessão expirada"));
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(errorResponse.message || `Erro HTTP ${xhr.status}`)
            );
          } catch (e) {
            reject(new Error(`Erro HTTP ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        // 📱 MOBILE: Mensagem específica para mobile
        const errorMsg = this.isMobile
          ? "Erro de conexão durante upload. Verifique sua rede móvel."
          : "Erro de conexão durante upload";
        reject(new Error(errorMsg));
      });

      xhr.addEventListener("timeout", () => {
        const timeoutMsg = this.isMobile
          ? "Upload expirou. Tente com uma imagem menor ou verifique sua conexão."
          : "Timeout durante upload";
        reject(new Error(timeoutMsg));
      });

      // 📱 MOBILE: Timeout maior para dispositivos móveis
      xhr.timeout = this.isMobile ? this.timeout + 15000 : this.timeout;

      // Enviar requisição
      xhr.open("POST", `${this.baseURL}${endpoint}`);
      xhr.send(formData);
    });
  }

  // 📱 NOVA FUNÇÃO: Throttle para otimizar callbacks em mobile
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay);
      }
    };
  }

  // 📱 NOVA FUNÇÃO: Verificar qualidade da conexão
  getConnectionQuality() {
    if (!this.isMobile) return "good";

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      switch (effectiveType) {
        case "slow-2g":
        case "2g":
          return "poor";
        case "3g":
          return "moderate";
        case "4g":
        default:
          return "good";
      }
    }
    return "unknown";
  }

  // 📱 NOVA FUNÇÃO: Ajustar timeout baseado na conexão
  getAdaptiveTimeout() {
    if (!this.isMobile) return this.timeout;

    const quality = this.getConnectionQuality();
    switch (quality) {
      case "poor":
        return this.timeout * 2; // Dobrar timeout para conexões ruins
      case "moderate":
        return this.timeout * 1.5; // Aumentar 50% para 3G
      default:
        return this.timeout;
    }
  }

  // 📱 NOVA FUNÇÃO: Método de requisição otimizado para mobile com imagens
  async requestWithImageOptimization(endpoint, data, options = {}) {
    // Se é mobile e há FormData com imagem, aplicar otimizações
    if (this.isMobile && data instanceof FormData) {
      const fileInput = data.get("profilePhoto");
      if (
        fileInput &&
        fileInput instanceof File &&
        fileInput.type.startsWith("image/")
      ) {
        console.log("📱 Detectada imagem em mobile - aplicando otimizações");

        // Verificar tamanho da imagem
        if (fileInput.size > 2 * 1024 * 1024) {
          // 2MB
          console.warn("📱 Imagem grande detectada em mobile:", fileInput.size);
        }

        // Usar timeout adaptativo
        options.timeout = this.getAdaptiveTimeout();
      }
    }

    return this.request(endpoint, {
      method: "POST",
      body: data,
      ...options,
    });
  }

  // 📱 NOVA FUNÇÃO: Debug específico para mobile
  debugMobileConnection() {
    if (!this.isMobile) {
      console.log("⚠️ Esta função é específica para dispositivos móveis");
      return;
    }

    console.log("=== DEBUG MOBILE CONNECTION ===");
    console.log("Base URL:", this.baseURL);
    console.log("Timeout:", this.timeout);
    console.log("Retry attempts:", this.retryAttempts);
    console.log("Connection type:", this.getConnectionType());
    console.log("Connection quality:", this.getConnectionQuality());
    console.log("Adaptive timeout:", this.getAdaptiveTimeout());
    console.log("Is slow connection:", this.isSlowConnection());

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      console.log("Connection details:", {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    }
    console.log("==============================");
  }
}

// Instância global
const apiConfig = new ApiConfig();

// Disponibilizar como window.apiConfig (compatibilidade com código antigo)
window.apiConfig = apiConfig;

// 📱 MOBILE: Log específico para dispositivos móveis
if (apiConfig.isMobile) {
  console.log("📱 API Config Mobile otimizado carregado");
  console.log("📱 Base URL:", apiConfig.baseURL);
  console.log("📱 Timeout mobile:", apiConfig.timeout);
  console.log("📱 Connection type:", apiConfig.getConnectionType());
}

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = apiConfig;
}

console.log("API Config Unificado carregado - Base URL:", apiConfig.baseURL);
console.log("Token disponível:", !!apiConfig.token);

// Criar instância única
const api = new ApiConfig();

// Exportar para o escopo global
window.api = api;

// 📱 MOBILE: Listener para mudanças na conexão
if (api.isMobile && navigator.connection) {
  navigator.connection.addEventListener("change", () => {
    console.log("📱 Conexão mudou:", api.getConnectionType());
    api.debugMobileConnection();
  });
}

console.log("API Config Unificado carregado - Base URL:", api.baseURL);
console.log("Token disponível:", !!api.token);
