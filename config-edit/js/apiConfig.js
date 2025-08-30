// Configuração centralizada da API
class ApiConfig {
  constructor() {
    this.baseURL = this.detectApiBaseURL();
    this.timeout = 30000; // 30 segundos
    this.token = this.getAuthToken();
  }

  detectApiBaseURL() {
    // Detectar automaticamente a URL base da API
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;

    // Se estamos em desenvolvimento local
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      // Se o frontend está na porta 5500 (Live Server), API provavelmente está na 5000
      if (window.location.port === "5500") {
        return `${currentProtocol}//${currentHost}:5000`;
      }
      // Se está na mesma porta, usar a mesma
      return `${currentProtocol}//${currentHost}:${
        window.location.port || (currentProtocol === "https:" ? "443" : "80")
      }`;
    }

    // Em produção, usar o mesmo domínio
    return `${currentProtocol}//${currentHost}`;
  }

  // Obter token de autenticação
  getAuthToken() {
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
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
  }

  // Método para fazer requisições com configurações padrão
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Reobter token mais recente antes da requisição
    if (!this.token) {
      this.token = this.getAuthToken();
    }

    const defaultOptions = {
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    };

    // Adicionar token de autorização se disponível
    if (this.token) {
      defaultOptions.headers.Authorization = `Bearer ${this.token}`;
    }

    // Se não é FormData, adicionar Content-Type
    if (options.body && !(options.body instanceof FormData)) {
      defaultOptions.headers["Content-Type"] = "application/json";
    }

    const finalOptions = { ...defaultOptions, ...options };

    console.log("Fazendo requisição para:", url);
    console.log("Headers:", finalOptions.headers);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Se receber 401, limpar token e tentar novamente uma vez
      if (response.status === 401 && this.token) {
        console.warn("Token expirado, limpando...");
        this.clearAuthToken();

        // Tentar uma vez sem token
        const retryOptions = { ...finalOptions };
        delete retryOptions.headers.Authorization;

        const retryResponse = await fetch(url, retryOptions);
        return retryResponse;
      }

      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Requisição expirou. Verifique sua conexão.");
      }
      throw error;
    }
  }

  // Métodos de conveniência
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  async put(endpoint, data, options = {}) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

// Instância global
const apiConfig = new ApiConfig();

// Exportar para uso global
window.apiConfig = apiConfig;
