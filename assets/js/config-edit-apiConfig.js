// Configuração unificada da API - Living Coins
// Configuração unificada da API - Living Coins
class ApiConfig {
  constructor() {
    this.baseURL = this.detectApiBaseURL();
    this.timeout = 30000; // 30 segundos
    this.token = this.getAuthToken();
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

    // ✨ CORREÇÃO CRÍTICA: Forçar a URL correta da API em produção
    // O endereço do servidor da API (Render) é diferente do frontend (Vercel)
    return "https://api-backend-coins.onrender.com"; // Substitua por sua URL real no Render
  }

  // ... o restante da classe permanece o mesmo

  // Obter token de autenticação de múltiplas fontes
  getAuthToken() {
    // Tentar Auth global primeiro (compatibilidade com código antigo)
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

    // Reobter token mais recente
    if (!this.token) {
      this.token = this.getAuthToken();
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // NÃO definir Content-Type para FormData - o browser fará isso automaticamente
    return headers;
  }

  // Método para tratar respostas e erros globalmente
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
        window.location.href = "/login.html";
      }

      throw new Error("Sessão expirada. Redirecionando para login...");
    }

    // Se rate limit (429), mostrar mensagem específica
    if (response.status === 429) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Muitas requisições" }));
      throw new Error(
        errorData.message ||
          "Muitas requisições. Tente novamente em alguns minutos."
      );
    }

    // Para outros erros HTTP, não fazer nada aqui - deixar o código chamador tratar
    return response;
  }

  // Método principal para fazer requisições
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

    // Se não é FormData, adicionar Content-Type
    if (options.body && !(options.body instanceof FormData)) {
      defaultOptions.headers["Content-Type"] = "application/json";
    }

    const finalOptions = { ...defaultOptions, ...options };

    console.log("Fazendo requisição para:", url);
    console.log("Method:", finalOptions.method || "GET");

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
      if (error.name === "AbortError") {
        throw new Error("Requisição expirou. Verifique sua conexão.");
      }
      throw error;
    }
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

  // Método específico para upload de arquivo com progresso (XMLHttpRequest)
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

      // Progress callback
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Response handlers
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
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
            window.location.href = "/login.html";
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
        reject(new Error("Erro de conexão durante upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Timeout durante upload"));
      });

      // Configurar timeout
      xhr.timeout = this.timeout;

      // Enviar requisição
      xhr.open("POST", `${this.baseURL}${endpoint}`);
      xhr.send(formData);
    });
  }
}

// Instância global
const apiConfig = new ApiConfig();

// Disponibilizar como window.apiConfig (compatibilidade com código antigo)
window.apiConfig = apiConfig;

// Exportar para uso em módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = apiConfig;
}

console.log("API Config Unificado carregado - Base URL:", apiConfig.baseURL);
console.log("Token disponível:", !!apiConfig.token);

// apiConfig.js

// Cria a instância única
const api = new ApiConfig();

// Exporta para o escopo global
window.api = api;

console.log("API Config Unificado carregado - Base URL:", api.baseURL);
console.log("Token disponível:", !!api.token);
