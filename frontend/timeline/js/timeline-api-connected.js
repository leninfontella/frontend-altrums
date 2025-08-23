// config-api.js - Configurações da API para Timeline

const API_CONFIG = {
  // URL base da API
  BASE_URL: "http://localhost:5000",

  // Configurações de timeout
  TIMEOUT: 10000, // 10 segundos

  // Configurações de retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo

  // Configurações de cache
  CACHE_DURATION: 30000, // 30 segundos

  // Configurações de polling
  POLLING_INTERVAL: 30000, // 30 segundos

  // Configurações de paginação
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Endpoints da API
  ENDPOINTS: {
    // Auth
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",

    // Users
    PROFILE: "/users/profile",
    BALANCE: "/users/balance",
    STATS: "/users/stats",
    SEARCH_USERS: "/users/search",
    USER_BY_ID: "/users/:id",

    // Donations
    CREATE_DONATION: "/users/donations",
    USER_DONATIONS: "/users/donations",
    DONATION_STATS: "/users/donations/stats",
    SEARCH_FOR_DONATION: "/users/donations/search",
    RECENT_DONATIONS: "/donations/recent",
    CAN_DONATE: "/users/:userId/can-donate",

    // Ranking
    RANKING: "/ranking",
    TOP_DONORS: "/ranking/top-donors",
    TOP_RECIPIENTS: "/ranking/top-recipients",
    MY_POSITION: "/ranking/my-position",
  },

  // Headers padrão
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Configurações de ambiente
  ENVIRONMENT: {
    DEVELOPMENT: {
      BASE_URL: "http://localhost:3000/api",
      ENABLE_LOGS: true,
      MOCK_DATA: false,
    },
    PRODUCTION: {
      BASE_URL: "https://sua-api-producao.com/api",
      ENABLE_LOGS: false,
      MOCK_DATA: false,
    },
    TEST: {
      BASE_URL: "http://localhost:3001/api",
      ENABLE_LOGS: true,
      MOCK_DATA: true,
    },
  },

  // Status codes esperados
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // Mensagens de erro padrão
  ERROR_MESSAGES: {
    NETWORK_ERROR: "Erro de conexão. Verifique sua internet.",
    TIMEOUT_ERROR: "Tempo limite excedido. Tente novamente.",
    UNAUTHORIZED: "Sessão expirada. Faça login novamente.",
    FORBIDDEN: "Você não tem permissão para esta ação.",
    NOT_FOUND: "Recurso não encontrado.",
    SERVER_ERROR: "Erro interno do servidor. Tente novamente.",
    VALIDATION_ERROR: "Dados inválidos fornecidos.",
    INSUFFICIENT_FUNDS: "Saldo insuficiente para esta operação.",
  },

  // Configurações de validação
  VALIDATION: {
    MIN_DONATION_AMOUNT: 1,
    MAX_DONATION_AMOUNT: 10000,
    MAX_MESSAGE_LENGTH: 500,
    MIN_SEARCH_QUERY_LENGTH: 2,
    MAX_SEARCH_QUERY_LENGTH: 100,
  },
};

// Função para obter configuração baseada no ambiente
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || "development";
  return (
    API_CONFIG.ENVIRONMENT[env.toUpperCase()] ||
    API_CONFIG.ENVIRONMENT.DEVELOPMENT
  );
}

// Função para construir URL completa do endpoint
function buildApiUrl(endpoint, params = {}) {
  const config = getEnvironmentConfig();
  let url = config.BASE_URL + endpoint;

  // Substituir parâmetros na URL (:id -> valor real)
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });

  return url;
}

// Função para validar dados de doação
function validateDonationData(amount, message = "") {
  const errors = [];

  if (!amount || !Number.isInteger(amount)) {
    errors.push("Quantidade deve ser um número inteiro");
  }

  if (amount < API_CONFIG.VALIDATION.MIN_DONATION_AMOUNT) {
    errors.push(
      `Quantidade mínima é ${API_CONFIG.VALIDATION.MIN_DONATION_AMOUNT}`
    );
  }

  if (amount > API_CONFIG.VALIDATION.MAX_DONATION_AMOUNT) {
    errors.push(
      `Quantidade máxima é ${API_CONFIG.VALIDATION.MAX_DONATION_AMOUNT}`
    );
  }

  if (message && message.length > API_CONFIG.VALIDATION.MAX_MESSAGE_LENGTH) {
    errors.push(
      `Mensagem deve ter no máximo ${API_CONFIG.VALIDATION.MAX_MESSAGE_LENGTH} caracteres`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Função para validar query de busca
function validateSearchQuery(query) {
  const errors = [];

  if (!query || typeof query !== "string") {
    errors.push("Query de busca é obrigatória");
  }

  if (query && query.length < API_CONFIG.VALIDATION.MIN_SEARCH_QUERY_LENGTH) {
    errors.push(
      `Query deve ter pelo menos ${API_CONFIG.VALIDATION.MIN_SEARCH_QUERY_LENGTH} caracteres`
    );
  }

  if (query && query.length > API_CONFIG.VALIDATION.MAX_SEARCH_QUERY_LENGTH) {
    errors.push(
      `Query deve ter no máximo ${API_CONFIG.VALIDATION.MAX_SEARCH_QUERY_LENGTH} caracteres`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Função para obter mensagem de erro baseada no status code
function getErrorMessage(statusCode, defaultMessage = "") {
  switch (statusCode) {
    case API_CONFIG.STATUS_CODES.BAD_REQUEST:
      return API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR;
    case API_CONFIG.STATUS_CODES.UNAUTHORIZED:
      return API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
    case API_CONFIG.STATUS_CODES.FORBIDDEN:
      return API_CONFIG.ERROR_MESSAGES.FORBIDDEN;
    case API_CONFIG.STATUS_CODES.NOT_FOUND:
      return API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
    case API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR:
      return API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
    default:
      return defaultMessage || API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR;
  }
}

// Função para detectar se está offline
function isOnline() {
  return navigator.onLine;
}

// Função para esperar conexão
function waitForConnection(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const checkConnection = () => {
      if (isOnline()) {
        resolve(true);
      }
    };

    window.addEventListener("online", checkConnection);

    setTimeout(() => {
      window.removeEventListener("online", checkConnection);
      reject(new Error("Timeout waiting for connection"));
    }, timeout);
  });
}

// Função para debounce (útil para busca)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Função para throttle (útil para scroll/resize)
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Logger personalizado
const Logger = {
  log: (message, data = null) => {
    const config = getEnvironmentConfig();
    if (config.ENABLE_LOGS) {
      console.log(`[Timeline API] ${message}`, data || "");
    }
  },

  error: (message, error = null) => {
    const config = getEnvironmentConfig();
    if (config.ENABLE_LOGS) {
      console.error(`[Timeline API ERROR] ${message}`, error || "");
    }
  },

  warn: (message, data = null) => {
    const config = getEnvironmentConfig();
    if (config.ENABLE_LOGS) {
      console.warn(`[Timeline API WARNING] ${message}`, data || "");
    }
  },
};

// Exportar configurações e utilitários
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    API_CONFIG,
    getEnvironmentConfig,
    buildApiUrl,
    validateDonationData,
    validateSearchQuery,
    getErrorMessage,
    isOnline,
    waitForConnection,
    debounce,
    throttle,
    Logger,
  };
} else {
  // Para uso no browser
  window.API_CONFIG = API_CONFIG;
  window.ApiUtils = {
    getEnvironmentConfig,
    buildApiUrl,
    validateDonationData,
    validateSearchQuery,
    getErrorMessage,
    isOnline,
    waitForConnection,
    debounce,
    throttle,
    Logger,
  };
}
